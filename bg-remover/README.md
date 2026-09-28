# Background remover

Self-hosted cut-out service for product photos. The backend sends every new
product image here; the result replaces the stored file (the original is kept
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

Docker: `docker build -t bg-remover .` (downloads both models into the image,
so allow ~2 GB and a long first build), then run with `-e BG_API_KEY=… -p 7860:7860`.

## Coolify

A separate application with Base Directory `/bg-remover`, Dockerfile build,
port 7860, environment `BG_API_KEY` (any long secret), 4 GB RAM. It does not
need a public domain: the backend reaches it over the internal network. Give
the backend `BG_REMOVER_URL=http://<service>:7860` and the same
`BG_REMOVER_KEY`; set `AUTO_REMOVE_BG=false` to pause processing without
removing the service.

## Endpoints

- `GET /health` → `{ ok, model, ready }` (`ready` turns true once the default model is loaded, ~10 s after start).
- `POST /remove` multipart `image` → `image/png` with alpha; headers `X-Model`, `X-Elapsed-Ms`, `X-Size`.
  Query: `model`, `matting` (0/1), `fill` (0–0.5). 401 without the key, 400 for non-images, 413 over `BG_MAX_UPLOAD_MB` (40).
