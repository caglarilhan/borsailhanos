"""
Basit test server - Frontend için API endpoint'leri
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

app = FastAPI(title="BIST AI Smart Trader - Test API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Ana sayfa"""
    return {
        "message": "BIST AI Smart Trader API v2.0",
        "status": "active",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    }

@app.get("/api/test")
async def test_endpoint():
    """Test endpoint"""
    return {"message": "API çalışıyor!", "timestamp": datetime.now().isoformat()}

@app.get("/api/real/trading_signals")
async def get_real_trading_signals():
    """Gerçek trading sinyalleri getir"""
    signals_data = {
        "timestamp": datetime.now().isoformat(),
        "signals": [
            {
                "symbol": "THYAO",
                "action": "BUY",
                "confidence": 0.87,
                "price": 245.50,
                "target": 260.0,
                "stop_loss": 235.0,
                "reason": "EMA Cross + RSI Oversold"
            },
            {
                "symbol": "ASELS",
                "action": "SELL",
                "confidence": 0.74,
                "price": 48.20,
                "target": 42.0,
                "stop_loss": 52.0,
                "reason": "Resistance Break + Volume Spike"
            },
            {
                "symbol": "TUPRS",
                "action": "BUY",
                "confidence": 0.91,
                "price": 180.30,
                "target": 195.0,
                "stop_loss": 170.0,
                "reason": "Bullish Engulfing + MACD Cross"
            }
        ]
    }
    return signals_data

@app.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
