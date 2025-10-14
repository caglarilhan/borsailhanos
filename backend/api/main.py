from fastapi import FastAPI, HTTPException, Query
from typing import List, Optional
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

# Local imports
try:
    from backend.data.price_layer import fetch_recent_ohlcv
    from backend.services.signals import generate_basic_signals
    from backend.db.firestore_client import get_firestore
    from backend.data.fundamentals import fetch_basic_fundamentals
    from backend.services.mcdm import compute_entropy_topsis
    from backend.services.pattern_adapter import detect_patterns_from_ohlcv
    from backend.services.notifications import get_fcm, should_notify
    from backend.services.rl_agent import SimpleRLAagent, PositionAdvice
    from backend.services.xai import explain_signal
    from backend.services.macro_adapter import get_market_regime_summary
    from backend.services.sentiment import sentiment_tr
    from backend.services.cache import get_signals_cache
    from backend.services.ask_service import ask_service
except ImportError as e:
    print(f"Import error: {e}")
    # Fallback imports
    fetch_recent_ohlcv = None
    generate_basic_signals = None
    get_firestore = None
    fetch_basic_fundamentals = None
    compute_entropy_topsis = None
    detect_patterns_from_ohlcv = None
    get_fcm = None
    should_notify = None
    SimpleRLAagent = None
    PositionAdvice = None
    explain_signal = None
    get_market_regime_summary = None
    sentiment_tr = None
    get_signals_cache = None
    ask_service = None

app = FastAPI(title="BIST AI Smart Trader API", version="2.0.0")

# Advanced AI endpoints
try:
    from backend.api.advanced_endpoints import router as advanced_router
    app.include_router(advanced_router)
    print("✅ Advanced AI endpoints loaded")
except ImportError as e:
    print(f"⚠️ Advanced endpoints import error: {e}")
    pass

class AskRequest(BaseModel):
    question: str

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "2.0.0"}

@app.get("/prices")
async def get_prices(
    symbols: str = Query(..., description="Comma-separated list of symbols"),
    period: str = Query("1mo", description="Period for data"),
    interval: str = Query("1d", description="Data interval")
):
    """Get price data for symbols"""
    try:
        symbol_list = [s.strip() for s in symbols.split(",")]
        prices = {}
        
        for symbol in symbol_list:
            if fetch_recent_ohlcv:
                df = fetch_recent_ohlcv(symbol=symbol, period=period, interval=interval)
                if not df.empty:
                    prices[symbol] = df.to_dict('records')
                else:
                    prices[symbol] = []
            else:
                prices[symbol] = []
        
        return {"prices": prices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/signals")
async def get_signals(
    symbols: str = Query(..., description="Comma-separated list of symbols")
):
    """Get trading signals for symbols"""
    try:
        symbol_list = [s.strip() for s in symbols.split(",")]
        signals = []
        
        for symbol in symbol_list:
            # Simple signal generation for now
            signals.append({
                "symbol": symbol,
                "signals": [
                    {
                        "type": "EMA_CROSS",
                        "direction": "BUY",
                        "confidence": 0.75,
                        "timestamp": "2024-01-01T00:00:00Z",
                        "tags": ["technical", "trend"]
                    }
                ],
                "topsis": 0.65,
                "patterns": ["bullish_engulfing", "ema_cross"],
                "market_regime": {"regime": "risk_on", "confidence": 0.7},
                "sentiment": {"label": "positive", "score": 0.3},
                "position_advice": {"side": "BUY", "confidence": 0.75, "size": 0.6}
            })
        
        return {"signals": signals}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/explain/{symbol}")
async def explain_signal_endpoint(symbol: str):
    """Explain signal for a symbol"""
    try:
        if explain_signal:
            explanation = explain_signal(symbol)
            return {"symbol": symbol, "explanation": explanation}
        else:
            return {"symbol": symbol, "explanation": "Explanation service not available"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/signals/stream")
async def stream_signals():
    """Stream signals in real-time"""
    async def generate():
        while True:
            try:
                # Generate sample signal data
                signal_data = {
                    "timestamp": "2024-01-01T00:00:00Z",
                    "symbol": "SISE.IS",
                    "signal": "BUY",
                    "confidence": 0.85
                }
                yield f"data: {json.dumps(signal_data)}\n\n"
                await asyncio.sleep(5)  # Send every 5 seconds
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                break
    
    return StreamingResponse(generate(), media_type="text/plain")

@app.post("/ask")
async def ask_question(request: AskRequest):
    """Ask a question to the AI assistant"""
    try:
        if ask_service:
            try:
                answer = await ask_service.answer_question(request.question)
            except Exception as e:
                answer = f"AI service error: {e}"
            return {"question": request.question, "answer": answer}
        else:
            return {"question": request.question, "answer": "AI service not available"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)