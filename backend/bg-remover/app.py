"""Background remover service for product photos.

POST /remove  (multipart field `image`) -> PNG with alpha, same pixel size as the input.
    ?model=birefnet-general | isnet-general-use   (default: BG_MODEL, birefnet-general)
    ?matting=1                                      soft-edge refinement (slower)
    ?fill=0.02                                      fill enclosed holes up to this fraction of the object (0 = off)
GET  /health -> {"ok": true, "model": ..., "ready": bool}

The original pixels are never resampled: the model only produces the alpha mask,
which is composed onto the untouched RGB of the upload. Requests are serialised
(BG_CONCURRENCY, default 1) because inference is CPU-bound. Protect it with
BG_API_KEY (sent as the X-BG-Key header); only the backend should call it.
"""
import io
import os
import threading
import time

import numpy as np
from fastapi import FastAPI, File, Header, HTTPException, Query, UploadFile
from fastapi.responses import JSONResponse, Response
from starlette.concurrency import run_in_threadpool
from PIL import Image, ImageOps
from pymatting import estimate_foreground_ml
from rembg import new_session, remove
from scipy import ndimage

API_KEY = os.environ.get("BG_API_KEY", "")
DEFAULT_MODEL = os.environ.get("BG_MODEL", "birefnet-general")
ALLOWED_MODELS = {"birefnet-general", "birefnet-general-lite", "isnet-general-use", "u2net"}
MAX_UPLOAD_MB = int(os.environ.get("BG_MAX_UPLOAD_MB", "40"))

app = FastAPI(title="Easy Jackets background remover", docs_url=None, redoc_url=None)
_sessions = {}
_sessions_lock = threading.Lock()
_infer = threading.Semaphore(int(os.environ.get("BG_CONCURRENCY", "1")))
_state = {"ready": False, "warming": False}


def session_for(model: str):
    with _sessions_lock:
        if model not in _sessions:
            _sessions[model] = new_session(model)
        return _sessions[model]


def warm():
    _state["warming"] = True
    try:
        session_for(DEFAULT_MODEL)
        _state["ready"] = True
    finally:
        _state["warming"] = False


@app.on_event("startup")
def _startup():
    threading.Thread(target=warm, daemon=True).start()


def fill_holes(rgb: np.ndarray, alpha: np.ndarray, max_fraction: float, report: list | None = None) -> np.ndarray:
    """Make enclosed holes solid when they are a punched-out garment detail, not backdrop showing through.

    The model sometimes cuts a white snap or a white rib stripe out of a garment
    because it looks like the backdrop. But the pocket of backdrop inside a
    drawstring loop is a real hole and has to stay clear, or it fills with
    studio white. Every enclosed hole up to `max_fraction` of the object is
    judged in this order:
    1. its colour never occurs in the backdrop next to the garment -> filled
       (a dropped detail: a coloured snap, a stripe darker than the backdrop)
    2. it carries fabric texture (backdrops are flat) -> filled
    3. it sits a cord's width from the outside -> left open (backdrop seen
       through a drawstring loop or under an edge)
    4. it is deep inside the garment and unlike the fabric around it -> filled
       (backdrop cannot show through the middle of a jacket)
    5. white on white on white -> filled only when small and round like a snap.
    `report`, when given, receives one dict per judged hole (for tests).
    """
    solid = alpha > 127
    if not solid.any() or max_fraction <= 0:
        return alpha
    filled = ndimage.binary_fill_holes(solid)
    holes = filled & ~solid
    if not holes.any():
        return alpha
    outside = ~filled
    labels, count = ndimage.label(holes)
    sizes = ndimage.sum(holes, labels, range(1, count + 1))
    object_px = float(solid.sum())
    limit = max_fraction * object_px
    snap_limit = 0.002 * object_px
    scale = max(alpha.shape) / 1000.0
    ring_px = max(2, int(round(3 * scale)))    # fabric hugging the hole
    edge_px = max(6, int(round(14 * scale)))   # about a drawstring's width
    near_px = max(10, int(round(30 * scale)))  # backdrop sampled within reach of the hole
    global_bg = np.median(rgb[outside], axis=0).astype(np.float32) if outside.any() else None
    grey = rgb.astype(np.float32).mean(axis=2)
    out = alpha.copy()
    for index, (size, sl) in enumerate(zip(sizes, ndimage.find_objects(labels)), start=1):
        if sl is None or size > limit:
            continue
        y0, y1 = max(sl[0].start - near_px, 0), min(sl[0].stop + near_px, alpha.shape[0])
        x0, x1 = max(sl[1].start - near_px, 0), min(sl[1].stop + near_px, alpha.shape[1])
        win = (slice(y0, y1), slice(x0, x1))
        m = labels[win] == index
        rgb_win = rgb[win].astype(np.float32)
        # Colour is sampled from the clearly open pixels only: the rim of a tiny
        # pocket is a blend of fabric and backdrop and would look like neither.
        core = m & (alpha[win] <= 40)
        has_core = int(core.sum()) >= 8
        hole_c = np.median(rgb_win[core], axis=0) if has_core else None
        near = ndimage.binary_dilation(m, iterations=near_px) & outside[win]
        looks_like_bg = True  # without a clean sample, assume backdrop (the safe failure: a hole stays a hole)
        if has_core:
            # backdrop-like when a tenth of the nearby backdrop shares the colour (a shadow under the
            # hem counts too) or the colour is the photo's overall backdrop
            near_match = near.any() and float(np.mean(np.linalg.norm(rgb_win[near] - hole_c, axis=1) <= 35.0)) >= 0.1
            global_match = global_bg is not None and float(np.linalg.norm(global_bg - hole_c)) <= 35.0
            looks_like_bg = bool(near_match or global_match)
        touches_edge = bool((ndimage.binary_dilation(m, iterations=edge_px) & outside[win]).any())
        boundary = m & ~ndimage.binary_erosion(m)
        circularity = 4.0 * np.pi * float(size) / max(float(boundary.sum()), 1.0) ** 2
        snap_shaped = size <= snap_limit and circularity >= 0.5
        if not looks_like_bg:
            fill, why = True, "colour never seen in the backdrop"
        elif touches_edge:
            fill, why = False, "backdrop pocket at the outline"
        elif snap_shaped:
            fill, why = True, "small round hole inside the garment"
        else:
            fill, why = False, "backdrop-coloured, not snap-shaped"
        if report is not None:
            report.append({"index": index, "size": int(size), "fill": fill, "why": why, "bg": looks_like_bg, "edge": touches_edge,
                           "core": int(core.sum()), "circularity": round(circularity, 2),
                           "box": (sl[1].start, sl[0].start, sl[1].stop - sl[1].start, sl[0].stop - sl[0].start)})
        if fill:
            out[win][m] = 255
    return out


def refine_edges(rgb: np.ndarray, alpha: np.ndarray, erode_px: int, feather: float, defringe: bool):
    """Clean the matte's rim: pull it inward, soften it, and take the studio background out of the edge colours.

    Edge pixels of a cut-out are a blend of garment and backdrop; on white they
    pass unnoticed, on a dark page they show as a pale halo. Eroding drops the
    outermost blended ring, the feather keeps the edge smooth, and the
    foreground estimate replaces the colour of the remaining partial pixels
    with the garment's own colour. Fully opaque pixels are never touched.
    """
    if erode_px > 0:
        keep = ndimage.binary_erosion(alpha > 0, iterations=erode_px, border_value=0)
        alpha = np.where(keep, alpha, 0).astype(np.uint8)
    if feather > 0:
        blurred = ndimage.gaussian_filter(alpha.astype(np.float32), feather)
        # the blur may only soften the rim: interior pixels stay opaque, cleared pixels stay clear
        alpha = np.where(alpha == 255, 255, np.where(alpha == 0, 0, np.clip(blurred, 0, 255))).astype(np.uint8)
    if defringe:
        edge = (alpha > 0) & (alpha < 255)
        if edge.any():
            fg = estimate_foreground_ml(rgb.astype(np.float64) / 255.0, alpha.astype(np.float64) / 255.0)
            fg = np.clip(fg * 255.0 + 0.5, 0, 255).astype(np.uint8)
            rgb = rgb.copy()
            rgb[edge] = fg[edge]
    return rgb, alpha


@app.get("/health")
def health():
    return {"ok": True, "model": DEFAULT_MODEL, "ready": _state["ready"], "warming": _state["warming"]}


@app.post("/remove")
async def remove_background(
    image: UploadFile = File(...),
    model: str = Query(DEFAULT_MODEL),
    matting: bool = Query(False),
    fill: float = Query(0.02, ge=0.0, le=0.5),
    erode: int = Query(1, ge=0, le=6),
    feather: float = Query(0.6, ge=0.0, le=4.0),
    defringe: bool = Query(True),
    x_bg_key: str | None = Header(default=None),
):
    if API_KEY and x_bg_key != API_KEY:
        raise HTTPException(status_code=401, detail="bad key")
    if model not in ALLOWED_MODELS:
        raise HTTPException(status_code=400, detail=f"unknown model {model}")
    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="empty upload")
    if len(data) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="image too large")
    try:
        src = Image.open(io.BytesIO(data))
        src = ImageOps.exif_transpose(src)
        src.load()
    except Exception:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="not an image") from None

    rgb = src.convert("RGB")
    started = time.time()

    def work():
        # Runs on a worker thread so the event loop keeps answering /health
        # (and queued requests) during a 30 s inference.
        with _infer:
            sess = session_for(model)
            kwargs = {"session": sess, "only_mask": True}
            if matting:
                kwargs.update(alpha_matting=True, alpha_matting_foreground_threshold=240,
                              alpha_matting_background_threshold=10, alpha_matting_erode_size=10)
            mask = remove(rgb, **kwargs)
            if mask.size != rgb.size:  # never let the model's working size leak into the output
                mask = mask.resize(rgb.size, Image.LANCZOS)
            alpha = np.array(mask.convert("L"))
            # The model's mask hovers at 250–254 inside the object and 1–5 outside it;
            # make those fully opaque / fully clear and keep only the true edge band soft.
            alpha = np.where(alpha >= 250, 255, np.where(alpha <= 5, 0, alpha)).astype(np.uint8)
            rgb_arr = np.array(rgb)
            alpha = fill_holes(rgb_arr, alpha, fill)
            rgb_arr, alpha = refine_edges(rgb_arr, alpha, erode, feather, defringe)
            out = Image.fromarray(rgb_arr, "RGB")
            out.putalpha(Image.fromarray(alpha))
            buf = io.BytesIO()
            out.save(buf, format="PNG", optimize=False, compress_level=6)
            return buf.getvalue(), out.size

    data_out, size = await run_in_threadpool(work)
    return Response(
        content=data_out,
        media_type="image/png",
        headers={"X-Model": model, "X-Elapsed-Ms": str(int((time.time() - started) * 1000)), "X-Size": f"{size[0]}x{size[1]}"},
    )


@app.exception_handler(Exception)
async def _unhandled(_, exc):
    return JSONResponse(status_code=500, content={"detail": str(exc)[:200]})
