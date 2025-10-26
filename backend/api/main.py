from fastapi import FastAPI, HTTPException, Query, Depends, Request
from typing import List, Optional
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

# V3.2 Institutional Grade Modules
try:
    from backend.services.sentry_client import sentry_client
    from backend.services.two_factor_auth import two_factor_auth
    from backend.services.api_key_rotation import api_key_rotation
    V32_MODULES_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ V3.2 modules not available: {e}")
    V32_MODULES_AVAILABLE = False

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

app = FastAPI(title="BIST AI Smart Trader API", version="3.2.0")

# V3.2: Sentry Integration
if V32_MODULES_AVAILABLE:
    try:
        # Sentry is already initialized globally in sentry_client
        print("✅ Sentry error tracking enabled")
    except Exception as e:
        print(f"⚠️ Sentry initialization: {e}")

# V3.2: Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler with Sentry"""
    if V32_MODULES_AVAILABLE:
        sentry_client.capture_error(exc, context={
            'path': str(request.url),
            'method': request.method
        })
    raise HTTPException(status_code=500, detail=str(exc))

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

@app.get("/api/market/overview")
async def get_market_overview():
    """Get market overview data"""
    try:
        # Mock market data for now
        markets = [
            {"symbol": "TUPRS", "price": 180.30, "change": 3.1, "volume": 12500000, "sector": "Holding"},
            {"symbol": "THYAO", "price": 245.50, "change": 2.3, "volume": 8900000, "sector": "Bankacılık"},
            {"symbol": "SISE", "price": 32.50, "change": -1.2, "volume": 15200000, "sector": "Sanayi"},
            {"symbol": "EREGL", "price": 55.80, "change": 1.8, "volume": 9800000, "sector": "Sanayi"},
            {"symbol": "ASELS", "price": 48.20, "change": -1.8, "volume": 7600000, "sector": "Savunma"}
        ]
        return {"markets": markets, "timestamp": "2025-10-25T13:35:00Z"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/signals")
async def get_signals():
    """Get AI trading signals"""
    try:
        # Mock signals data for now
        signals = [
            {
                "symbol": "THYAO",
                "signal": "BUY",
                "confidence": 85.2,
                "price": 245.50,
                "change": 2.3,
                "timestamp": "2025-10-25T13:35:00Z",
                "xaiExplanation": "Güçlü teknik formasyon ve pozitif momentum sinyalleri",
                "confluenceScore": 92,
                "marketRegime": "Risk-On",
                "sentimentScore": 15.3
            },
            {
                "symbol": "TUPRS",
                "signal": "SELL",
                "confidence": 78.7,
                "price": 180.30,
                "change": -1.8,
                "timestamp": "2025-10-25T13:35:00Z",
                "xaiExplanation": "Direnç seviyesinde satış baskısı tespit edildi",
                "confluenceScore": 88,
                "marketRegime": "Risk-Off",
                "sentimentScore": -8.2
            },
            {
                "symbol": "ASELS",
                "signal": "HOLD",
                "confidence": 72.1,
                "price": 48.20,
                "change": 0.5,
                "timestamp": "2025-10-25T13:35:00Z",
                "xaiExplanation": "Piyasa belirsizliği nedeniyle bekleme pozisyonu",
                "confluenceScore": 75,
                "marketRegime": "Neutral",
                "sentimentScore": 2.1
            }
        ]
        return {"signals": signals, "timestamp": "2025-10-25T13:35:00Z"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

# V3.2: Two-Factor Authentication Endpoints
if V32_MODULES_AVAILABLE:
    class TwoFactorSetup(BaseModel):
        user_id: str
        user_email: str
    
    class TwoFactorVerify(BaseModel):
        user_id: str
        code: str
    
    @app.post("/api/v3.2/auth/2fa/setup")
    async def setup_2fa(setup: TwoFactorSetup):
        """Setup 2FA for a user"""
        try:
            result = two_factor_auth.setup_2fa(setup.user_id, setup.user_email)
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/v3.2/auth/2fa/verify")
    async def verify_2fa(verify: TwoFactorVerify):
        """Verify 2FA code"""
        try:
            is_valid = two_factor_auth.verify_2fa(verify.user_id, verify.code)
            return {
                "valid": is_valid,
                "message": "2FA verified" if is_valid else "Invalid code"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/v3.2/auth/2fa/disable")
    async def disable_2fa(user_id: str):
        """Disable 2FA for a user"""
        try:
            success = two_factor_auth.disable_2fa(user_id)
            return {"success": success, "message": "2FA disabled" if success else "Failed to disable"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/v3.2/auth/2fa/status")
    async def get_2fa_status(user_id: str):
        """Get 2FA status for a user"""
        try:
            is_enabled = two_factor_auth.is_2fa_enabled(user_id)
            stats = two_factor_auth.get_stats()
            return {
                "user_id": user_id,
                "2fa_enabled": is_enabled,
                "stats": stats
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    # API Key Management Endpoints
    @app.post("/api/v3.2/auth/api-key/create")
    async def create_api_key(user_id: str, permissions: List[str] = ["read"]):
        """Create a new API key"""
        try:
            key = api_key_rotation.create_api_key(user_id, permissions)
            return {
                "user_id": user_id,
                "api_key": key,
                "message": "API key created successfully"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/v3.2/auth/api-key/rotate")
    async def rotate_api_key(user_id: str):
        """Rotate API key for a user"""
        try:
            new_key = api_key_rotation.rotate_api_key(user_id)
            return {
                "user_id": user_id,
                "new_api_key": new_key,
                "message": "API key rotated successfully"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/v3.2/auth/api-key/verify")
    async def verify_api_key(api_key: str):
        """Verify an API key"""
        try:
            result = api_key_rotation.verify_api_key(api_key)
            return {
                "valid": result is not None,
                "result": result
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/v3.2/auth/api-key/stats")
    async def get_api_key_stats():
        """Get API key rotation statistics"""
        try:
            stats = api_key_rotation.get_stats()
            return stats
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/v3.2/auth/api-key/auto-rotate")
    async def auto_rotate_keys():
        """Automatically rotate keys that need rotation"""
        try:
            result = api_key_rotation.auto_rotate_keys()
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)