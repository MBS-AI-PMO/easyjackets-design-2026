# Background remover

Self-hosted cut-out service for product photos, part of the backend: the API
starts it on 127.0.0.1 (`helpers/bgRemoverProcess.js`) and restarts it if it
stops, and the backend's Docker image installs it with both models. The
backend sends every new product image here (when the admin's "Remove
background" switch is on); the result replaces the stored file (the original is kept
next to it) at the **same pixel size** — the model only produces the alpha
mask, the photo's own pixels are never resampled.

- Model: **BiRefNet-general** (best edges; keeps white sleeves on light
  backgrounds, strips studio backdrops), with `isnet-general-use` as a fast
  fallback (`?model=`). `?matting=1` refines soft edges at extra cost.
- Enclosed holes up to `?fill=0.02` of the object are judged one by one, so a
  white snap the model punched out of a white sleeve is made solid again while
  the pocket of backdrop inside a drawstring loop stays open (filling it paints
  studio white onto a dark page). A hole is filled when its colour never occurs
  in the backdrop next to the garment, or when it is a small round hole away
  from the outline; anything backdrop-coloured at the outline, or long and
  thin (the gap between a sleeve and the body), is left open. `?fill=0` skips it.
- Edge treatment (on by default): the matte is pulled in by `?erode=1` pixel,
  softened with `?feather=0.6`, and `?defringe=1` re-estimates the garment's own
  colour along the partial-alpha rim, so no studio backdrop bleeds into the edge
  (the pale halo you would otherwise see on a dark page). Opaque pixels are never
  touched. `?erode=0&feather=0&defringe=0` gives the raw model output.
- Speed, CPU only: BiRefNet ≈ 30 s per photo on a laptop, a few seconds on a
  server with more cores; isnet ≈ 2 s. Requests are processed one at a time
  (`BG_CONCURRENCY`) and the backend queues them, so uploads never wait.

## Run

```
pip install -r requirements.txt
BG_API_KEY=change-me uvicorn app:app --port 7860
curl -H "X-BG-Key: change-me" -F image=@jacket.jpg "http://127.0.0.1:7860/remove?model=birefnet-general" -o cutout.png
```

Normally you do not run it by hand: `node server.mjs` starts it (with `python`
on Windows, `python3` elsewhere, or `BG_PYTHON`), using a key derived from the
backend's secrets. Run it by hand only to test it, as above.

## Deploying

Nothing separate: the backend's Dockerfile installs Python, these packages and
both models (`/opt/bg-remover`, ~2 GB, a long first build). Memory: ~1.6 GB
with BiRefNet loaded, ~7 GB at the peak of one photo (the onnxruntime CPU arena
is off, otherwise it holds ~18 GB after two photos);
`BG_REMOVER_MODEL=isnet-general-use` needs ~1.2 GB. Backend env: `AUTO_REMOVE_BG=false` pauses
processing, `BG_REMOVER_EMBEDDED=false` never starts it, `BG_REMOVER_URL` +
`BG_REMOVER_KEY` point at an outside service instead.

## Endpoints

- `GET /health` → `{ ok, model, ready }` (`ready` turns true once the default model is loaded, ~10 s after start).
- `POST /remove` multipart `image` → `image/png` with alpha; headers `X-Model`, `X-Elapsed-Ms`, `X-Size`.
  Query: `model`, `matting` (0/1), `fill` (0–0.5). 401 without the key, 400 for non-images, 413 over `BG_MAX_UPLOAD_MB` (40).
