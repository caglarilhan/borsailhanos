from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn

# Redis ve Database opsiyonel hale getir
try:
    import redis
    redis_client = redis.from_url(os.getenv("REDIS_URL", "")) if os.getenv("REDIS_URL") else None
    print("✅ Redis bağlantısı aktif")
except Exception as e:
    print(f"⚠️ Redis devre dışı (Render Free plan): {e}")
    redis_client = None

try:
    import psycopg2
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        db_connection = psycopg2.connect(database_url)
        print("✅ Database bağlantısı aktif")
    else:
        print("⚠️ DATABASE_URL tanımlı değil")
        db_connection = None
except Exception as e:
    print(f"⚠️ Database devre dışı: {e}")
    db_connection = None

app = FastAPI(title="BIST AI Smart Trader", version="2.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Next.js statik dosyalarını servis et
app.mount("/", StaticFiles(directory="static", html=True), name="static")

# API endpoints
@app.get("/api/hello")
def hello():
    return {"message": "🚀 BIST AI Smart Trader - Full-stack system running on Render!"}

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "BIST AI Smart Trader",
        "version": "2.0",
        "environment": os.getenv("NODE_ENV", "development")
    }

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend çalışıyor 🚀"}

@app.get("/api/signals")
def get_signals():
    """Mock AI signals for testing"""
    return {
        "signals": [
            {
                "symbol": "THYAO",
                "action": "BUY",
                "confidence": 87.3,
                "price": 45.20,
                "timestamp": "2024-01-15T10:30:00Z"
            },
            {
                "symbol": "ASELS",
                "action": "SELL", 
                "confidence": 92.1,
                "price": 12.80,
                "timestamp": "2024-01-15T10:31:00Z"
            }
        ]
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Render otomatik PORT atar
    workers = int(os.environ.get("UVICORN_WORKERS", 1))  # Worker sayısı
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        workers=workers,
        log_level="info"
    )
