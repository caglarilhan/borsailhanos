# ---------- 1. FRONTEND BUILD (Next.js / React) ----------
FROM node:20-alpine AS frontend
WORKDIR /frontend

# Bağımlılıkları yükle
COPY web-app/package*.json ./
RUN npm install

# Kodları kopyala ve build et
COPY web-app .
RUN npm run build:render

# ---------- 2. BACKEND (FastAPI) ----------
FROM python:3.11-slim AS backend
WORKDIR /app

# Backend bağımlılıklarını yükle
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kodları kopyala
COPY backend .

# ---------- 3. FINAL MERGE LAYER ----------
FROM python:3.11-slim
WORKDIR /app

# Frontend build çıktısını backend'in static dizinine al
COPY --from=frontend /frontend/out /app/static
COPY --from=backend /app .

EXPOSE 8000

# Başlatıcı komut: backend + static dosyalar
CMD ["python", "main_render.py"]
