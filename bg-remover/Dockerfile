# Background remover: FastAPI + rembg with the models baked into the image, so a
# fresh container never downloads a gigabyte at start-up. CPU only.
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    U2NET_HOME=/models \
    BG_MODEL=birefnet-general \
    BG_CONCURRENCY=1

RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download both models at build time (BiRefNet ~900 MB, isnet ~170 MB).
RUN mkdir -p /models && python -c "from rembg import new_session; new_session('birefnet-general'); new_session('isnet-general-use')"

COPY app.py .
EXPOSE 7860
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:7860/health').status==200 else 1)"
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
