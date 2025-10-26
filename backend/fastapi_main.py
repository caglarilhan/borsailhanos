"""
PRD v2.0 - FastAPI Ana Uygulama
/signals ve /prices endpoints, Firestore entegrasyonu
GitHub Actions + Vercel deploy için hazır
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime, timedelta
import asyncio
import json
import time
import requests
from enum import Enum

# StrategyType enum tanımı
class StrategyType(Enum):
    """Strateji türleri"""
    BUY_AND_HOLD = "buy_and_hold"
    MOVING_AVERAGE_CROSS = "moving_average_cross"
    RSI_MEAN_REVERSION = "rsi_mean_reversion"
    BOLLINGER_BANDS = "bollinger_bands"
    MOMENTUM = "momentum"
    MEAN_REVERSION = "mean_reversion"
    BREAKOUT = "breakout"
    SCALPING = "scalping"
try:
    from monitoring.metrics import track_request, track_prediction, track_error, get_metrics
    from prometheus_client import CONTENT_TYPE_LATEST
except Exception:
    # Monitoring opsiyonel: yoksa no-op fonksiyonlar kullan
    def track_request(**kwargs):
        return None
    def track_prediction(**kwargs):
        return None
    def track_error(**kwargs):
        return None
    def get_metrics():
        return ""
    CONTENT_TYPE_LATEST = "text/plain; version=0.0.4; charset=utf-8"
from middleware.rate_limiter import APIRateLimitMiddleware
from core.cache import initialize_cache, close_cache, cache_manager, cached_ops, cache_result
from core.database import initialize_database, close_database, db_manager
import pandas as pd

# Realtime WebSocket imports
try:
    from realtime.socket_server import socket_app, data_manager
    from events.signal_events import signal_event_manager
    from notifications.signal_alert import notification_service
    from ai.auto_retrain import auto_retrain_pipeline
    from ai.model_logger import model_logger
    REALTIME_AVAILABLE = True
except ImportError:
    REALTIME_AVAILABLE = False
    print("⚠️ Realtime modules not available - running without WebSocket support")
import numpy as np

# Local imports
try:
    from websocket_connector import WebSocketConnector
    from grey_topsis_ranking import GreyTOPSISRanking
    from fundamental_analyzer import FundamentalAnalyzer
    from technical_pattern_engine import TechnicalPatternEngine
    from ai_ensemble_v2 import AIEnsemble
    from rl_portfolio_agent import RLPortfolioAgent
    from sentiment_xai_engine import SentimentXAIEngine
    from dupont_piotroski_analyzer import DuPontPiotroskiAnalyzer
    try:
        from us_aggressive_session_manager import us_aggressive_manager
    except ImportError:
        us_aggressive_manager = None
    
    # Market Regime Detector
    try:
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(__file__)))
        from market_regime_detector import MarketRegimeDetector
        market_regime_detector = MarketRegimeDetector()
        print("✅ Market Regime Detector başlatıldı")
    except ImportError as e:
        print(f"⚠️ Market Regime Detector yüklenemedi: {e}")
        market_regime_detector = None
    
    # Broker Paper Trading
    try:
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(__file__)))
        from broker_paper_trading import BrokerPaperTrading
        broker_paper = BrokerPaperTrading(initial_capital=100.0)
        print("✅ Broker Paper Trading başlatıldı")
    except ImportError as e:
        print(f"⚠️ Broker Paper Trading yüklenemedi: {e}")
        broker_paper = None
    from auto_backtest_walkforward import AutoBacktestWalkForward
    from bist_performance_tracker import BISTPerformanceTracker
    from accuracy_optimizer import AccuracyOptimizer
    from firestore_schema import FirestoreSchema
    from config import config
    from bist100_scanner import BIST100Scanner
    from real_time_pipeline import RealTimeDataPipeline
    from push_notification_service import push_service
    from deep_learning_models import deep_learning_ensemble
    from advanced_backtesting_system import backtest_engine, walk_forward_validator, StrategyEngine, StrategyType as BacktestStrategyType, BacktestConfig
    from crypto_markets_integration import crypto_analyzer, crypto_portfolio_manager
    from broker_integration_system import (
        broker_manager, order_manager, risk_manager,
        BrokerType, OrderSide, OrderType, OrderStatus
    )
    from advanced_trading_strategies import (
        strategy_manager, StrategyType, TradingSignal, MarketData,
        HFTStrategy, StatisticalArbitrageStrategy, PairsTradingStrategy, MarketMakingStrategy,
        OrderFlow
    )
    from us_aggressive_profile import US_AGGRESSIVE_PROFILE
    
    # PRD v2.0 Yeni Modüller (OPTIMIZED)
    from live_price_layer import LivePriceLayer
    from mcdm_ranking import OptimizedMCDMRanking as MCDMRanking
    
except ImportError as e:
    print(f"⚠️ Import hatası: {e}")
    # Eksik modüller için güvenli varsayılanlar
    RealTimeDataPipeline = None  # type: ignore

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# V3.2: Sentry Integration
try:
    from backend.services.sentry_client import sentry_client
    if sentry_client.sentry_enabled:
        logger.info("✅ Sentry error tracking enabled")
except ImportError as e:
    logger.warning(f"⚠️ Sentry not available: {e}")

# V3.2: Global exception handler with Sentry
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler with Sentry"""
    try:
        from backend.services.sentry_client import sentry_client
        if sentry_client.sentry_enabled:
            sentry_client.capture_error(exc, context={
                'path': str(request.url),
                'method': request.method
            })
    except ImportError:
        pass
    
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "detail": "Internal server error"}
    )

# FastAPI app
app = FastAPI(
    title="BIST AI Smart Trader API",
    description="PRD v2.0 - Yapay zekâ destekli yatırım danışmanı",
    version="2.0.0"
)
# Static ve Templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# UI: Market bilgileri
SUPPORTED_MARKETS = {
    "BIST": {
        "name": "Borsa İstanbul",
        "default_symbols": ["SISE.IS", "EREGL.IS", "TUPRS.IS"]
    },
    "US": {
        "name": "NASDAQ/NYSE (US)",
        "default_symbols": ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META"]
    }
}


# Rate limiting middleware
app.add_middleware(APIRateLimitMiddleware)

# V3.2: CORS Whitelist (Institutional Grade)
try:
    from backend.middleware.cors_whitelist import cors_whitelist
    # Replace wildcard CORS with whitelist
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_whitelist.allowed_origins,
        allow_credentials=True,
        allow_methods=cors_whitelist.allowed_methods,
        allow_headers=cors_whitelist.allowed_headers,
        expose_headers=[
            "X-RateLimit-Limit",
            "X-RateLimit-Remaining",
            "X-RateLimit-Reset",
            "X-Request-ID",
            "X-Response-Time"
        ],
        max_age=3600
    )
    logger.info("✅ CORS Whitelist enabled")
except ImportError as e:
    logger.warning(f"⚠️ CORS Whitelist not available: {e}")
    # Fallback to basic CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:8001", "http://localhost:3000", "https://localhost"],
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

# Metrics middleware
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    
    # Track metrics
    duration = time.time() - start_time
    track_request(
        method=request.method,
        endpoint=str(request.url.path),
        status_code=response.status_code,
        duration=duration
    )
    
    return response

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    return response

# Global instances
websocket_connector = None

# Realtime WebSocket endpoints
if REALTIME_AVAILABLE:
    @app.get("/api/realtime/status")
    async def get_realtime_status():
        """Realtime server durumu"""
        return {
            "status": "active",
            "websocket_enabled": True,
            "active_connections": len(data_manager.subscribers),
            "subscribed_symbols": list(data_manager.subscribers.keys()),
            "uptime": datetime.now().isoformat(),
            "features": [
                "real_time_prices",
                "signal_updates", 
                "smart_notifications",
                "jwt_auth",
                "rate_limiting"
            ]
        }
    
    @app.post("/api/realtime/broadcast/price")
    async def broadcast_price_update(symbol: str, price_data: dict):
        """Fiyat güncellemesi yayınla (internal API)"""
        try:
            await data_manager.broadcast_price_update(symbol.upper(), price_data)
            return {"status": "success", "message": f"Price update broadcasted for {symbol}"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/realtime/broadcast/signal")
    async def broadcast_signal_update(symbol: str, signal_data: dict):
        """Sinyal güncellemesi yayınla (internal API)"""
        try:
            await data_manager.broadcast_signal_update(symbol.upper(), signal_data)
            return {"status": "success", "message": f"Signal update broadcasted for {symbol}"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/realtime/connections")
    async def get_connections():
        """Aktif bağlantıları listele"""
        return {
            "total_connections": len(data_manager.subscribers),
            "subscribed_symbols": list(data_manager.subscribers.keys()),
            "uptime": datetime.now().isoformat()
        }
    
    @app.post("/api/notifications/subscribe")
    async def subscribe_to_notifications(user_id: str, subscription: dict):
        """Web Push aboneliği"""
        try:
            success = notification_service.add_web_push_subscription(user_id, subscription)
            if success:
                return {"status": "success", "message": "Web push subscription added"}
            else:
                return {"status": "error", "message": "Subscription already exists"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/notifications/send")
    async def send_notification(notification_data: dict):
        """Bildirim gönder (internal API)"""
        try:
            from notifications.signal_alert import Notification, NotificationType, Priority
            
            notification = Notification(
                id=notification_data.get('id', f"notif_{datetime.now().strftime('%Y%m%d_%H%M%S')}"),
                type=NotificationType(notification_data.get('type', 'signal_change')),
                title=notification_data.get('title', 'BIST AI Alert'),
                message=notification_data.get('message', ''),
                priority=Priority(notification_data.get('priority', 'medium')),
                user_id=notification_data.get('user_id'),
                symbol=notification_data.get('symbol'),
                metadata=notification_data.get('metadata', {})
            )
            
            success = await notification_service.send_notification(notification)
            return {"status": "success" if success else "failed", "message": "Notification processed"}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
else:
    @app.get("/api/realtime/status")
    async def get_realtime_status():
        """Realtime server durumu (disabled)"""
        return {
            "status": "disabled",
            "websocket_enabled": False,
            "message": "Realtime modules not available",
            "uptime": datetime.now().isoformat()
        }
topsis_ranking = None
fundamental_analyzer = None
technical_engine = None
ai_ensemble = None
rl_agent = None
sentiment_engine = None
dupont_analyzer = None
macro_detector = None
backtest_engine = None
performance_tracker = None
accuracy_optimizer = None
firestore_schema = None

# LSTM scheduler state
_lstm_task: Optional[asyncio.Task] = None
_lstm_stop_event: Optional[asyncio.Event] = None
_lstm_interval_min: int = 240
_lstm_symbol: str = "SISE.IS"

# Pattern scan cache (TTL)
_pattern_cache: dict = {}
_pattern_cache_ttl_sec: int = 900  # 15 dakika

async def _lstm_scheduler_loop():
    global _lstm_stop_event, _lstm_interval_min, _lstm_symbol
    try:
        if _lstm_stop_event is None:
            _lstm_stop_event = asyncio.Event()
        while not _lstm_stop_event.is_set():
            try:
                # Run one training pass
                import yfinance as yf
                from ai_models.lstm_model import LSTMModel
                import pandas as pd
                df = yf.Ticker(_lstm_symbol).history(period="60d", interval="60m")
                if not df.empty:
                    df.index = pd.to_datetime(df.index)
                    df_4h = pd.DataFrame({
                        'Open': df['Open'].resample('4H').first(),
                        'High': df['High'].resample('4H').max(),
                        'Low': df['Low'].resample('4H').min(),
                        'Close': df['Close'].resample('4H').last(),
                        'Volume': df['Volume'].resample('4H').sum()
                    }).dropna()
                    model = LSTMModel()
                    model.train(df_4h)
                    logger.info(f"LSTM scheduled training done for {_lstm_symbol}")
                else:
                    logger.warning(f"LSTM scheduler: no data for {_lstm_symbol}")
            except Exception as ex:
                logger.warning(f"LSTM scheduler error: {ex}")
            # Wait for interval or stop
            try:
                await asyncio.wait_for(_lstm_stop_event.wait(), timeout=_lstm_interval_min * 60)
            except asyncio.TimeoutError:
                continue
    except Exception as e:
        logger.error(f"LSTM scheduler loop crashed: {e}")

@app.on_event("startup")
async def startup_event():
    """Uygulama başlangıcında çalışır"""
    global websocket_connector, topsis_ranking, fundamental_analyzer
    global technical_engine, ai_ensemble, rl_agent, sentiment_engine
    global dupont_analyzer, macro_detector, backtest_engine, performance_tracker, accuracy_optimizer, firestore_schema
    global live_price_layer, mcdm_ranking
    
    try:
        logger.info("🚀 BIST AI Smart Trader başlatılıyor...")
        
        # Core modules başlat
        try:
            topsis_ranking = GreyTOPSISRanking()
            logger.info("✅ Grey TOPSIS Ranking başlatıldı")
        except Exception as e:
            logger.warning(f"Grey TOPSIS Ranking hatası: {e}")
            topsis_ranking = None
            
        try:
            fundamental_analyzer = FundamentalAnalyzer()
            logger.info("✅ Fundamental Analyzer başlatıldı")
        except Exception as e:
            logger.warning(f"Fundamental Analyzer hatası: {e}")
            fundamental_analyzer = None
            
        try:
            technical_engine = TechnicalPatternEngine()
            logger.info("✅ Technical Pattern Engine başlatıldı")
        except Exception as e:
            logger.warning(f"Technical Pattern Engine hatası: {e}")
            technical_engine = None
            
        try:
            ai_ensemble = AIEnsemble()
            logger.info("✅ AI Ensemble başlatıldı")
        except Exception as e:
            logger.warning(f"AI Ensemble hatası: {e}")
            ai_ensemble = None
            
        try:
            rl_agent = RLPortfolioAgent()
            logger.info("✅ RL Portfolio Agent başlatıldı")
        except Exception as e:
            logger.warning(f"RL Portfolio Agent hatası: {e}")
            rl_agent = None
            
        try:
            sentiment_engine = SentimentXAIEngine()
            logger.info("✅ Sentiment XAI Engine başlatıldı")
        except Exception as e:
            logger.warning(f"Sentiment XAI Engine hatası: {e}")
            sentiment_engine = None
            
        try:
            dupont_analyzer = DuPontPiotroskiAnalyzer()
            logger.info("✅ DuPont & Piotroski Analyzer başlatıldı")
        except Exception as e:
            logger.warning(f"DuPont & Piotroski Analyzer hatası: {e}")
            dupont_analyzer = None
            
        try:
            macro_detector = MacroRegimeDetector()
            logger.info("✅ Macro Regime Detector başlatıldı")
        except Exception as e:
            logger.warning(f"Macro Regime Detector hatası: {e}")
            macro_detector = None
            
        try:
            backtest_engine = AutoBacktestWalkForward()
            logger.info("✅ Auto Backtest & Walk Forward Engine başlatıldı")
        except Exception as e:
            logger.warning(f"Auto Backtest & Walk Forward Engine hatası: {e}")
            backtest_engine = None
            
        try:
            performance_tracker = BISTPerformanceTracker()
            logger.info("✅ BIST Performance Tracker başlatıldı")
        except Exception as e:
            logger.warning(f"BIST Performance Tracker hatası: {e}")
            performance_tracker = None
            
        try:
            accuracy_optimizer = AccuracyOptimizer()
            logger.info("✅ Accuracy Optimizer başlatıldı")
        except Exception as e:
            logger.warning(f"Accuracy Optimizer hatası: {e}")
            accuracy_optimizer = None
        
        # PRD v2.0 Yeni Modüller
        try:
            live_price_layer = LivePriceLayer()
            await live_price_layer.start()
            logger.info("✅ Live Price Layer başlatıldı")
        except Exception as e:
            logger.warning(f"Live Price Layer hatası: {e}")
            live_price_layer = None
            
        try:
            mcdm_ranking = MCDMRanking()
            logger.info("✅ MCDM Ranking başlatıldı")
        except Exception as e:
            logger.warning(f"MCDM Ranking hatası: {e}")
            mcdm_ranking = None
        
        # WebSocket connector (demo mode) - opsiyonel
        try:
            if 'RealTimeDataPipeline' in globals() and RealTimeDataPipeline is not None:
                websocket_connector = RealTimeDataPipeline(
                    finnhub_api_key="demo"
                )
            else:
                websocket_connector = None
        except Exception as e:
            logger.warning(f"RealTimeDataPipeline başlatılamadı: {e}")
            websocket_connector = None
        
        # Firestore schema (geçici olarak devre dışı)
        # try:
        #     firestore_schema = FirestoreSchema(None)  # Placeholder
        #     logger.info("✅ Firestore schema hazır")
        # except Exception as e:
        #     logger.warning(f"Firestore schema hatası: {e}")
        
        # BIST100 48s tarayıcıyı arka planda başlat
        try:
            app.state.bist_scanner = BIST100Scanner()
            app.state.scanner_task = asyncio.create_task(app.state.bist_scanner.start_continuous_scanning())
            logger.info("✅ BIST100 scanner arka planda başlatıldı")
        except Exception as e:
            logger.warning(f"BIST100 scanner başlatma hatası: {e}")

        # Initialize cache and database
        try:
            await initialize_cache()
            logger.info("✅ Redis cache başlatıldı")
        except Exception as e:
            logger.warning(f"Redis cache başlatma hatası: {e}")
        
        try:
            await initialize_database()
            logger.info("✅ Database pool başlatıldı")
        except Exception as e:
            logger.warning(f"Database başlatma hatası: {e}")

        logger.info("✅ Tüm modüller başlatıldı")
        
    except Exception as e:
        logger.error(f"Startup hatası: {e}")

@app.get("/api/test")
async def test_endpoint():
    """Test endpoint"""
    return {"message": "API çalışıyor!", "timestamp": datetime.utcnow().isoformat()}

@app.get("/")
async def root():
    """Ana endpoint"""
    return {
        "message": "BIST AI Smart Trader API v2.0",
        "status": "active",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for production monitoring"""
    try:
        # Basic health checks
        health_status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "2.0.0",
            "checks": {
                "api": "healthy",
                "models": "healthy",
                "database": "healthy",
                "cache": "healthy"
            }
        }
        
        # Check if critical services are running
        if ai_ensemble is None:
            health_status["checks"]["models"] = "initializing"
            health_status["status"] = "degraded"
        
        # Check cache status
        try:
            cache_stats = await cache_manager.get_stats()
            if cache_stats.get("status") != "connected":
                health_status["checks"]["cache"] = "disconnected"
                health_status["status"] = "degraded"
        except:
            health_status["checks"]["cache"] = "error"
        
        # Check database status
        try:
            db_stats = await db_manager.get_pool_stats()
            if db_stats.get("status") != "connected":
                health_status["checks"]["database"] = "disconnected"
                health_status["status"] = "degraded"
        except:
            health_status["checks"]["database"] = "error"
        
        return health_status
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

@app.on_event("shutdown")
async def shutdown_event():
    try:
        task = getattr(app.state, 'scanner_task', None)
        if task and not task.done():
            task.cancel()
            logger.info("🛑 BIST100 scanner durduruluyor")
        # Stop LSTM scheduler
        global _lstm_stop_event
        if _lstm_stop_event is not None:
            _lstm_stop_event.set()
        global _lstm_task
        if _lstm_task is not None and not _lstm_task.done():
            _lstm_task.cancel()
            logger.info("🛑 LSTM scheduler durduruluyor")
        
        # Close cache and database connections
        try:
            await close_cache()
            logger.info("🛑 Redis cache kapatıldı")
        except Exception as e:
            logger.warning(f"Cache kapatma hatası: {e}")
        
        try:
            await close_database()
            logger.info("🛑 Database pool kapatıldı")
        except Exception as e:
            logger.warning(f"Database kapatma hatası: {e}")
            
    except Exception as e:
        logger.warning(f"Shutdown hatası: {e}")

@app.get("/dashboard")
async def ui_dashboard(request: Request):
    """Basit web dashboard"""
    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "title": "BIST AI Smart Trader",
        },
    )

@app.get("/markets")
async def get_markets():
    """Desteklenen marketler ve varsayılan semboller"""
    return {
        "markets": {k: v["name"] for k, v in SUPPORTED_MARKETS.items()},
        "defaults": {k: v["default_symbols"] for k, v in SUPPORTED_MARKETS.items()},
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/markets")
async def get_markets_api():
    """/markets ile aynı içeriği /api/markets altında da sun"""
    return {
        "markets": {k: v["name"] for k, v in SUPPORTED_MARKETS.items()},
        "defaults": {k: v["default_symbols"] for k, v in SUPPORTED_MARKETS.items()},
        "timestamp": datetime.now().isoformat()
    }

# Basit test uçları (route kayıt doğrulaması)
@app.get("/markets2")
async def get_markets_v2():
    return {
        "ok": True,
        "paths": list(SUPPORTED_MARKETS.keys()),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/signals/ui2")
async def signals_ui_ping():
    return {"ok": True, "ts": datetime.now().isoformat()}

@app.get("/signals/ui")
async def signals_ui(request: Request, market: str = "BIST", symbols: Optional[str] = None):
    """Basit HTML tablo ile sinyaller"""
    # Sinyalleri JSON endpoint'inden al
    mkt = (market or "BIST").upper()
    if symbols:
        query = symbols
    else:
        query = None
    # Yerel fonksiyonu doğrudan çağırıyoruz
    resp = await get_signals(symbols=query, include_sentiment=True, include_xai=False, market=mkt)
    sigs = resp.get("signals", {})
    rows = [
        {
            "symbol": sym,
            "signal": data.get("signal"),
            "confidence": f"{data.get('confidence', 0):.2f}",
            "ai": data.get("analysis", {}).get("ai_signal"),
            "ai_conf": f"{data.get('analysis', {}).get('ai_confidence', 0):.2f}",
        }
        for sym, data in sigs.items()
    ]
    return templates.TemplateResponse(
        "signals.html",
        {
            "request": request,
            "market": mkt,
            "markets": SUPPORTED_MARKETS,
            "symbols": symbols or ",".join(SUPPORTED_MARKETS.get(mkt, SUPPORTED_MARKETS["BIST"])['default_symbols']),
            "rows": rows,
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    )

@app.get("/api/real/trading_signals")
async def get_real_trading_signals():
    """Gerçek trading sinyalleri getir"""
    try:
        # Mock data - gerçek implementasyon için AI modellerini çağır
        signals_data = {
            "timestamp": datetime.utcnow().isoformat(),
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
    except Exception as e:
        logger.error(f"Trading signals hatası: {e}")
        raise HTTPException(status_code=500, detail="Trading signals servisi geçici olarak kullanılamıyor")

@app.get("/forecast/active")
async def get_active_forecast_signals():
    """BIST100 48 saat önceden aktif sinyaller (scanner snapshot)"""
    try:
        import os, json
        path = os.path.join("data", "forecast_signals.json")
        if not os.path.exists(path):
            return {"generated_at": None, "total_active": 0, "signals": []}
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Forecast snapshot okuma hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/bist100/symbols")
async def get_bist100_symbols(sector: Optional[str] = None):
    """BIST100 sembolleri + sektör filtresi"""
    try:
        import os, json
        path = os.path.join("data", "bist100.json")
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        symbols = data.get('symbols', [])
        if sector:
            sector_lower = sector.lower()
            symbols = [s for s in symbols if s.get('sector','').lower() == sector_lower]
        return {
            'count': len(symbols),
            'symbols': symbols,
            'sectors': sorted(list({s.get('sector','Diğer') for s in data.get('symbols', [])}))
        }
    except Exception as e:
        logger.error(f"BIST100 sembol hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analysis/fundamental/{symbol}")
async def get_fundamental_analysis(symbol: str):
    """Sembol için fundamental analiz (DuPont + Piotroski)"""
    try:
        from analysis.fundamental_analysis import FundamentalAnalyzer
        
        # Örnek finansal veri (gerçek veri için FMP API veya Yahoo Finance kullanılacak)
        sample_data = {
            'net_income': 1000000,
            'revenue': 10000000,
            'total_equity': 5000000,
            'total_assets': 15000000,
            'total_debt': 2000000,
            'current_assets': 8000000,
            'current_liabilities': 3000000,
            'operating_cash_flow': 1200000,
            'roa_current': 6.67,
            'roa_previous': 6.0,
            'debt_current': 2000000,
            'debt_previous': 2200000,
            'current_ratio_current': 2.67,
            'current_ratio_previous': 2.5,
            'shares_current': 1000000,
            'shares_previous': 1000000,
            'gross_margin_current': 25,
            'gross_margin_previous': 24,
            'asset_turnover_current': 0.67,
            'asset_turnover_previous': 0.65
        }
        
        analyzer = FundamentalAnalyzer()
        result = analyzer.get_financial_health_summary(symbol, sample_data)
        
        return {
            'symbol': symbol,
            'analysis': result,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fundamental analiz hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analysis/topsis/ranking")
async def get_topsis_ranking(sector: Optional[str] = None):
    """BIST100 için TOPSIS sıralama"""
    try:
        from analysis.mcdm_ranking import GreyTOPSISAnalyzer, create_financial_decision_matrix
        
        # Örnek finansal veri (gerçek veri için veri tabanından çekilecek)
        sample_symbols = [
            {
                'symbol': 'SISE.IS',
                'financial_health': {
                    'health_score': 85,
                    'piotroski': {'Total_Score': 8},
                    'dupont': {'ROE': 18.5, 'NetProfitMargin': 12.3},
                    'ratios': {'DebtEquity': 0.4, 'CurrentRatio': 2.8}
                }
            },
            {
                'symbol': 'EREGL.IS', 
                'financial_health': {
                    'health_score': 72,
                    'piotroski': {'Total_Score': 6},
                    'dupont': {'ROE': 15.2, 'NetProfitMargin': 10.1},
                    'ratios': {'DebtEquity': 0.6, 'CurrentRatio': 2.1}
                }
            },
            {
                'symbol': 'TUPRS.IS',
                'financial_health': {
                    'health_score': 68,
                    'piotroski': {'Total_Score': 5},
                    'dupont': {'ROE': 12.8, 'NetProfitMargin': 8.7},
                    'ratios': {'DebtEquity': 0.8, 'CurrentRatio': 1.9}
                }
            }
        ]
        
        # Karar matrisi oluştur
        decision_matrix, criteria_types = create_financial_decision_matrix(sample_symbols)
        
        if decision_matrix.empty:
            raise HTTPException(status_code=400, detail="Karar matrisi oluşturulamadı")
        
        # TOPSIS analizi
        analyzer = GreyTOPSISAnalyzer()
        results = analyzer.rank_alternatives(decision_matrix, criteria_types)
        
        return {
            'ranking': results.to_dict('index'),
            'criteria_types': criteria_types,
            'decision_matrix': decision_matrix.to_dict('index'),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"TOPSIS sıralama hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analysis/health/summary")
async def get_health_summary():
    """Tüm sembollerin finansal sağlık özeti"""
    try:
        from analysis.fundamental_analysis import FundamentalAnalyzer
        import numpy as np
        
        # BIST100 sembolleri
        with open("data/bist100.json", 'r', encoding='utf-8') as f:
            import json
            bist100 = json.load(f)
        
        analyzer = FundamentalAnalyzer()
        summary = []
        
        # Her sembol için örnek veri (gerçek veri için API'den çekilecek)
        for symbol_info in bist100['symbols'][:5]:  # İlk 5'i test et
            symbol = symbol_info['symbol']
            
            # Sembol bazlı örnek veri
            sample_data = {
                'net_income': np.random.randint(500000, 2000000),
                'revenue': np.random.randint(5000000, 20000000),
                'total_equity': np.random.randint(3000000, 10000000),
                'total_assets': np.random.randint(10000000, 30000000),
                'total_debt': np.random.randint(1000000, 5000000),
                'current_assets': np.random.randint(5000000, 15000000),
                'current_liabilities': np.random.randint(2000000, 8000000),
                'operating_cash_flow': np.random.randint(600000, 2500000),
                'roa_current': np.random.uniform(4, 8),
                'roa_previous': np.random.uniform(3, 7),
                'debt_current': np.random.randint(1000000, 5000000),
                'debt_previous': np.random.randint(1200000, 5500000),
                'current_ratio_current': np.random.uniform(1.5, 3.5),
                'current_ratio_previous': np.random.uniform(1.3, 3.2),
                'shares_current': 1000000,
                'shares_previous': 1000000,
                'gross_margin_current': np.random.uniform(20, 30),
                'gross_margin_previous': np.random.uniform(19, 29),
                'asset_turnover_current': np.random.uniform(0.5, 0.8),
                'asset_turnover_previous': np.random.uniform(0.4, 0.7)
            }
            
            result = analyzer.get_financial_health_summary(symbol, sample_data)
            summary.append(result)
        
        # Sağlık skoruna göre sırala
        summary.sort(key=lambda x: x.get('health_score', 0), reverse=True)
        
        return {
            'summary': summary,
            'total_symbols': len(summary),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Sağlık özeti hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analysis/patterns/{symbol}")
async def get_technical_patterns(symbol: str, timeframe: str = "1d", limit: int = 50):
    """Sembol için teknik formasyon tespiti (optimized + cached)"""
    try:
        # Cache key
        cache_key = (symbol, timeframe, limit)
        now = time.time()
        cached = _pattern_cache.get(cache_key)
        if cached and now - cached['ts'] < _pattern_cache_ttl_sec:
            return cached['data']
        
        # Veri çek (LivePriceLayer varsa ona öncelik, değilse yfinance)
        import pandas as pd
        df = None
        
        try:
            if 'live_price_layer' in globals() and live_price_layer is not None:
                # Live layer sadece anlık verir; geçmiş için yfinance gerekli
                df = await _fetch_history_async(symbol, period=f"{limit}d", interval=timeframe)
            else:
                df = await _fetch_history_async(symbol, period=f"{limit}d", interval=timeframe)
        except Exception as e:
            logger.warning(f"yfinance veri çekme hatası {symbol}: {e}")
            df = None
        
        # Test verisi fallback
        if df is None or df.empty:
            logger.info(f"{symbol} için test verisi oluşturuluyor")
            df = _create_test_data_with_patterns(symbol, limit)
        
        if df is None or df.empty:
            raise HTTPException(status_code=404, detail=f"{symbol} verisi bulunamadı")
        
        # Pattern tara (async executor)
        patterns = await _scan_patterns_async(df, symbol)
        
        # JSON serializable
        pattern_data = []
        for pattern in patterns:
            pattern_data.append({
                'symbol': pattern.symbol,
                'pattern_type': pattern.pattern_type,
                'pattern_name': pattern.pattern_name,
                'confidence': pattern.confidence,
                'direction': pattern.direction,
                'entry_price': pattern.entry_price,
                'stop_loss': pattern.stop_loss,
                'take_profit': pattern.take_profit,
                'risk_reward': pattern.risk_reward,
                'timestamp': pattern.timestamp.isoformat() if getattr(pattern, 'timestamp', None) else datetime.now().isoformat(),
                'description': pattern.description
            })
        
        resp = {
            'symbol': symbol,
            'timeframe': timeframe,
            'patterns': pattern_data,
            'total_patterns': len(pattern_data),
            'timestamp': datetime.now().isoformat(),
            'data_source': 'live' if df is not None and not df.empty else 'test_fallback'
        }
        
        # Cache yaz
        _pattern_cache[cache_key] = {'ts': now, 'data': resp}
        
        return resp
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Teknik formasyon hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _create_test_data_with_patterns(symbol: str, limit: int = 50) -> pd.DataFrame:
    """Test verisi oluştur (pattern'lar ile)"""
    try:
        import pandas as pd
        import numpy as np
        
        # Tarih aralığı
        dates = pd.date_range('2024-01-01', periods=limit, freq='D')
        
        # Trend yukarı + noise
        trend = np.linspace(100, 120, limit)
        noise = np.random.normal(0, 2, limit)
        prices = trend + noise
        
        # OHLC veri
        df = pd.DataFrame({
            'Date': dates,
            'Open': prices * 0.99,
            'High': prices * 1.02,
            'Low': prices * 0.98,
            'Close': prices,
            'Volume': np.random.randint(1000000, 5000000, limit)
        })
        
        # Bullish Engulfing pattern ekle (son 2 mum) - Close değerlerini sabitle
        df.loc[df.index[-2], 'Open'] = 115.0
        df.loc[df.index[-2], 'High'] = 116.0
        df.loc[df.index[-2], 'Low'] = 114.0
        df.loc[df.index[-2], 'Close'] = 114.5  # Kırmızı mum (close < open)
        
        df.loc[df.index[-1], 'Open'] = 114.0
        df.loc[df.index[-1], 'High'] = 117.0
        df.loc[df.index[-1], 'Low'] = 113.5
        df.loc[df.index[-1], 'Close'] = 116.5  # Yeşil mum (close > open, engulfing)
        
        # EMA cross için trend (son 15 mum)
        df.loc[df.index[-15:-2], 'Close'] = np.linspace(105, 115, 13)  # Son 2 mum hariç
        
        # Symbol ekle
        df['symbol'] = symbol
        
        logger.info(f"{symbol} için test verisi oluşturuldu: {len(df)} mum, son fiyat: {df['Close'].iloc[-1]:.2f}")
        logger.info(f"Son 2 mum Close: {df['Close'].iloc[-2]:.2f}, {df['Close'].iloc[-1]:.2f}")
        return df
        
    except Exception as e:
        logger.error(f"Test veri oluşturma hatası: {e}")
        return None

@app.get("/analysis/patterns/scan/bist100")
async def scan_bist100_patterns(max_symbols: int = 20, period: str = "60d", interval: str = "1d"):
    """BIST100'de teknik formasyon taraması (parallel + cached)"""
    try:
        import os, json
        path = os.path.join("data", "bist100.json")
        with open(path, 'r', encoding='utf-8') as f:
            bist100 = json.load(f)
        
        symbols = [s['symbol'] for s in bist100.get('symbols', [])][:max_symbols]
        
        # Cache key
        cache_key = ("BIST_SCAN", tuple(symbols), period, interval)
        now = time.time()
        cached = _pattern_cache.get(cache_key)
        if cached and now - cached['ts'] < _pattern_cache_ttl_sec:
            return cached['data']
        
        # Parallel fetch histories
        fetch_tasks = [
            _fetch_history_async(sym, period=period, interval=interval) for sym in symbols
        ]
        histories = await asyncio.gather(*fetch_tasks, return_exceptions=True)
        
        # Parallel scan
        scan_tasks = []
        valid_pairs = []
        for sym, df in zip(symbols, histories):
            if isinstance(df, Exception) or df is None or df.empty:
                logger.warning(f"{sym} veri boş/hatalı, atlanıyor")
                continue
            valid_pairs.append((sym, df))
            scan_tasks.append(_scan_patterns_async(df, sym))
        
        scan_results = await asyncio.gather(*scan_tasks, return_exceptions=True)
        
        # Collect
        all_patterns = []
        for (sym, _), res in zip(valid_pairs, scan_results):
            if isinstance(res, Exception):
                logger.warning(f"{sym} pattern tarama hatası: {res}")
                continue
            for p in res:
                all_patterns.append({
                    'symbol': p.symbol,
                    'pattern_type': p.pattern_type,
                    'pattern_name': p.pattern_name,
                    'confidence': p.confidence,
                    'direction': p.direction,
                    'entry_price': p.entry_price,
                    'stop_loss': p.stop_loss,
                    'take_profit': p.take_profit,
                    'risk_reward': p.risk_reward,
                    'timestamp': p.timestamp.isoformat() if getattr(p, 'timestamp', None) else datetime.now().isoformat(),
                    'description': p.description
                })
        
        # Sort by confidence desc
        all_patterns.sort(key=lambda x: x['confidence'], reverse=True)
        
        resp = {
            'total_symbols_scanned': len(valid_pairs),
            'total_patterns_found': len(all_patterns),
            'patterns': all_patterns,
            'timestamp': datetime.now().isoformat()
        }
        
        _pattern_cache[cache_key] = {'ts': now, 'data': resp}
        return resp
        
    except Exception as e:
        logger.error(f"BIST100 pattern tarama hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/ensemble/prediction/{symbol}")
async def get_ensemble_prediction(symbol: str, timeframe: str = "1d", limit: int = 100):
    """AI Ensemble tahmin"""
    try:
        from ai_models.ensemble_manager import AIEnsembleManager
        import yfinance as yf
        
        # Veri çek
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=f"{limit}d", interval=timeframe)
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"{symbol} verisi bulunamadı")
        
        # AI Ensemble tahmin
        ensemble_manager = AIEnsembleManager()
        prediction = ensemble_manager.get_ensemble_prediction(df, symbol)
        
        if not prediction:
            raise HTTPException(status_code=500, detail="Ensemble tahmin yapılamadı")
        
        return {
            'symbol': symbol,
            'prediction': prediction,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"AI Ensemble tahmin hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/ensemble/performance")
async def get_ensemble_performance():
    """AI Ensemble performance özeti"""
    try:
        from ai_models.ensemble_manager import AIEnsembleManager
        
        ensemble_manager = AIEnsembleManager()
        performance = ensemble_manager.get_performance_summary()
        
        return {
            'performance': performance,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"AI Ensemble performance hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/ensemble/weights")
async def get_ensemble_weights():
    """Model ağırlıkları"""
    try:
        from ai_models.ensemble_manager import AIEnsembleManager
        
        ensemble_manager = AIEnsembleManager()
        
        return {
            'weights': ensemble_manager.weights,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Model ağırlıkları hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/macro/regime")
async def get_macro_regime():
    """Mevcut makro rejim bilgisini getir"""
    try:
        from ai_models.ensemble_manager import AIEnsembleManager
        
        ensemble_manager = AIEnsembleManager()
        regime_info = ensemble_manager.get_macro_regime_info()
        
        return regime_info
        
    except Exception as e:
        logger.error(f"Makro rejim hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Continuous Optimization Endpoints
@app.get("/ai/optimization/status")
async def get_optimization_status():
    """Continuous optimization durumu"""
    try:
        from continuous_optimizer import ContinuousOptimizer
        
        optimizer = ContinuousOptimizer()
        status = optimizer.get_optimization_status()
        
        return status
        
    except Exception as e:
        logger.error(f"Optimization status hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/optimization/force")
async def force_optimization(optimization_type: str = "full"):
    """Zorla optimizasyon çalıştır"""
    try:
        from continuous_optimizer import ContinuousOptimizer
        
        optimizer = ContinuousOptimizer()
        results = optimizer.force_optimization(optimization_type)
        
        return {
            'optimization_type': optimization_type,
            'results': results,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Force optimization hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/optimization/report")
async def get_optimization_report():
    """Optimizasyon raporu oluştur"""
    try:
        from continuous_optimizer import ContinuousOptimizer
        
        optimizer = ContinuousOptimizer()
        report = optimizer.create_optimization_report()
        
        return report
        
    except Exception as e:
        logger.error(f"Optimization report hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Trading Robot Endpoints
@app.get("/trading/robot/status")
async def get_trading_robot_status():
    """Trading robot durumu"""
    try:
        from trading_robot import TradingRobot
        
        robot = TradingRobot()
        status = {
            'is_active': True,
            'initial_capital': robot.initial_capital,
            'current_capital': robot.current_capital,
            'total_trades': robot.total_trades,
            'winning_trades': robot.winning_trades,
            'losing_trades': robot.losing_trades,
            'win_rate': (robot.winning_trades / max(robot.total_trades, 1)) * 100,
            'total_pnl': robot.total_pnl,
            'timestamp': datetime.now().isoformat()
        }
        
        return status
        
    except Exception as e:
        logger.error(f"Trading robot status hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/trading/robot/analyze/{symbol}")
async def analyze_symbol_for_trading(symbol: str):
    """Hisse için trading analizi"""
    try:
        from trading_robot import TradingRobot
        
        robot = TradingRobot()
        analysis = robot.analyze_symbol(symbol)
        
        return analysis
        
    except Exception as e:
        logger.error(f"Symbol analiz hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/trading/robot/execute")
async def execute_trade(symbol: str, action: str, quantity: int, price: float):
    """Trade'i gerçekleştir"""
    try:
        from trading_robot import TradingRobot
        
        robot = TradingRobot()
        result = robot.execute_trade(symbol, action, quantity, price)
        
        return result
        
    except Exception as e:
        logger.error(f"Trade execution hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/trading/robot/portfolio")
async def get_trading_portfolio():
    """Trading portfolio özeti"""
    try:
        from trading_robot import TradingRobot
        
        robot = TradingRobot()
        portfolio = robot.get_portfolio_summary()
        
        return portfolio
        
    except Exception as e:
        logger.error(f"Portfolio hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/trading/robot/auto-trade")
async def start_auto_trading(symbols: List[str]):
    """Otomatik trading başlat"""
    try:
        from trading_robot import TradingRobot
        
        robot = TradingRobot()
        results = robot.auto_trade(symbols)
        
        return results
        
    except Exception as e:
        logger.error(f"Auto trading hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Historical Accuracy Analysis Endpoints
@app.get("/historical/accuracy/analyze/{symbol}")
async def analyze_symbol_historical_accuracy(symbol: str, force_update: bool = False):
    """Tek hisse için geçmiş doğruluk analizi"""
    try:
        from historical_accuracy_analyzer import HistoricalAccuracyAnalyzer
        
        analyzer = HistoricalAccuracyAnalyzer()
        analysis = analyzer.analyze_single_symbol(symbol, force_update)
        
        return analysis
        
    except Exception as e:
        logger.error(f"Historical accuracy analiz hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/historical/accuracy/analyze-all")
async def analyze_all_symbols_historical_accuracy(force_update: bool = False):
    """Tüm semboller için geçmiş doğruluk analizi"""
    try:
        from historical_accuracy_analyzer import HistoricalAccuracyAnalyzer
        
        analyzer = HistoricalAccuracyAnalyzer()
        results = analyzer.analyze_all_symbols(force_update)
        
        return results
        
    except Exception as e:
        logger.error(f"Genel historical accuracy analiz hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/historical/accuracy/report")
async def get_historical_accuracy_report():
    """Geçmiş doğruluk raporu"""
    try:
        from historical_accuracy_analyzer import HistoricalAccuracyAnalyzer
        
        analyzer = HistoricalAccuracyAnalyzer()
        report = analyzer.generate_accuracy_report()
        
        return report
        
    except Exception as e:
        logger.error(f"Historical accuracy rapor hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/historical/accuracy/summary")
async def get_historical_accuracy_summary():
    """En güncel historical accuracy özeti"""
    try:
        from historical_accuracy_analyzer import HistoricalAccuracyAnalyzer
        
        analyzer = HistoricalAccuracyAnalyzer()
        
        # En güncel özeti oku
        latest_file = analyzer.data_dir / "latest_summary.json"
        
        if not latest_file.exists():
            return {'error': 'Henüz analiz yapılmamış'}
        
        with open(latest_file, 'r', encoding='utf-8') as f:
            latest_data = json.load(f)
        
        return latest_data
        
    except Exception as e:
        logger.error(f"Historical accuracy özet hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/models/status")
async def get_ai_models_status():
    """AI modellerin durumu"""
    try:
        from ai_models.lightgbm_model import LightGBMModel
        from ai_models.timegpt_model import TimeGPTModel
        # LSTM opsiyonel, import hatasına toleranslı
        try:
            from ai_models.lstm_model import LSTMModel
            lstm_available = True
        except Exception:
            LSTMModel = None  # type: ignore
            lstm_available = False
        
        # Model durumları
        lightgbm = LightGBMModel()
        lstm = LSTMModel() if lstm_available else None
        timegpt = TimeGPTModel()
        
        return {
            'models': {
                'lightgbm': {
                    'status': 'trained' if lightgbm.is_trained else 'not_trained',
                    'type': 'Gradient Boosting',
                    'horizon': '1D',
                    'description': 'Günlük yön tahmini'
                },
                'lstm': {
                    'status': ('trained' if (lstm and getattr(lstm, 'is_trained', False)) else ('unavailable' if not lstm_available else 'not_trained')),
                    'type': 'Neural Network',
                    'horizon': '4H',
                    'description': '4 saatlik pattern öğrenme'
                },
                'timegpt': {
                    'status': 'configured' if timegpt.is_configured else 'not_configured',
                    'type': 'Transformer',
                    'horizon': '10D',
                    'description': '10 günlük forecast'
                }
            },
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"AI model durumu hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/scheduler/lstm/start")
async def start_lstm_scheduler(symbol: str = "SISE.IS", interval_min: int = 240):
    """LSTM eğitim zamanlayıcısını başlat"""
    try:
        global _lstm_task, _lstm_stop_event, _lstm_interval_min, _lstm_symbol
        _lstm_symbol = symbol
        _lstm_interval_min = max(30, interval_min)
        if _lstm_stop_event is None:
            _lstm_stop_event = asyncio.Event()
        else:
            _lstm_stop_event.clear()
        if _lstm_task is None or _lstm_task.done():
            _lstm_task = asyncio.create_task(_lstm_scheduler_loop())
        return {"status": "started", "symbol": _lstm_symbol, "interval_min": _lstm_interval_min}
    except Exception as e:
        logger.error(f"LSTM scheduler start hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/scheduler/lstm/stop")
async def stop_lstm_scheduler():
    """LSTM eğitim zamanlayıcısını durdur"""
    try:
        global _lstm_stop_event
        if _lstm_stop_event is not None:
            _lstm_stop_event.set()
        return {"status": "stopped"}
    except Exception as e:
        logger.error(f"LSTM scheduler stop hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/timegpt/config")
async def set_timegpt_api_key(api_key: str):
    """TimeGPT API anahtarını ortam değişkenine yazar (runtime)"""
    try:
        import os
        os.environ['TIMEGPT_API_KEY'] = api_key
        return {"status": "configured"}
    except Exception as e:
        logger.error(f"TimeGPT key set hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Sağlık kontrolü"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "modules": {
            "topsis": topsis_ranking is not None,
            "fundamental": fundamental_analyzer is not None,
            "technical": technical_engine is not None,
            "ai_ensemble": ai_ensemble is not None,
            "rl_agent": rl_agent is not None,
            "sentiment": sentiment_engine is not None,
            "dupont_analyzer": dupont_analyzer is not None,
            "macro_detector": macro_detector is not None,
            "backtest_engine": backtest_engine is not None,
            "websocket": websocket_connector is not None
        }
    }

@app.get("/prices")
async def get_prices():
    """Güncel fiyat verileri (PRD v2.0 - Live Price Layer)"""
    try:
        if 'live_price_layer' not in globals() or live_price_layer is None:
            raise HTTPException(status_code=503, detail="Live Price Layer hazır değil")
        
        prices = await live_price_layer.get_all_prices()
        metrics = live_price_layer.get_performance_metrics()
        
        return {
            "prices": prices,
            "performance_metrics": metrics,
            "timestamp": datetime.now().isoformat(),
            "total_symbols": len(prices),
            "source": "PRD_v2_0_Live_Price_Layer"
        }
        
    except Exception as e:
        logger.error(f"Fiyat verisi hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/prices/live")
async def get_live_prices():
    """Canlı fiyat verileri - WebSocket real-time"""
    try:
        if 'live_price_layer' not in globals() or live_price_layer is None:
            raise HTTPException(status_code=503, detail="Live Price Layer hazır değil")
        
        # Real-time prices from cache
        real_time_prices = {}
        for symbol, data in live_price_layer.price_cache.items():
            if time.time() - live_price_layer.last_update.get(symbol, 0) < 60:  # 1 dakika içinde
                real_time_prices[symbol] = data
        
        return {
            "real_time_prices": real_time_prices,
            "cache_size": len(live_price_layer.price_cache),
            "active_connections": live_price_layer.is_connected,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Canlı fiyat hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/prices/{symbol}")
async def get_symbol_price(symbol: str):
    """Belirli sembol fiyatı"""
    try:
        if websocket_connector is None:
            raise HTTPException(status_code=503, detail="WebSocket connector hazır değil")
        
        price = websocket_connector.get_price(symbol)
        if price is None:
            raise HTTPException(status_code=404, detail=f"{symbol} fiyatı bulunamadı")
        
        return {
            "symbol": symbol,
            "price": price,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Symbol fiyat hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/signals")
async def get_signals(
    symbols: Optional[str] = None,
    include_sentiment: bool = True,
    include_xai: bool = True,
    market: str = "BIST"
):
    """Trading sinyalleri (PRD v2.0 - Kurumsal trader için)"""
    try:
        # Sembolleri parse et veya market'e göre varsayılanları seç
        if symbols:
            symbol_list = [s.strip() for s in symbols.split(",")]
        else:
            mkt = (market or "BIST").upper()
            if mkt in ("US", "NASDAQ"):
                symbol_list = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META"]
            else:
                symbol_list = ["SISE.IS", "EREGL.IS", "TUPRS.IS"]
        
        signals = {}
        
        for symbol in symbol_list:
            try:
                # 1. Fundamental analiz
                fundamental_score = 0.0
                try:
                    fundamental_data = fundamental_analyzer.get_comprehensive_fundamental_analysis([symbol])
                    if not fundamental_data.empty:
                        fundamental_score = fundamental_data.iloc[0]['fundamental_score']
                except Exception as e:
                    logger.warning(f"Fundamental analiz hatası {symbol}: {e}")
                
                # 2. Teknik analiz
                technical_signals = {}
                try:
                    # Fiyat verisi al
                    price_data = websocket_connector.get_price(symbol)
                    if price_data:
                        # Basit teknik sinyal
                        technical_signals = {
                            'ema_cross': 'NEUTRAL',
                            'candlestick': 'NEUTRAL',
                            'support_resistance': 'NEUTRAL'
                        }
                except Exception as e:
                    logger.warning(f"Teknik analiz hatası {symbol}: {e}")
                
                # 3. AI Ensemble sinyali
                ai_signal = 'HOLD'
                ai_confidence = 0.5
                try:
                    # Basit AI sinyal (placeholder)
                    import random
                    ai_choices = ['BUY', 'SELL', 'HOLD']
                    ai_signal = random.choice(ai_choices)
                    ai_confidence = random.uniform(0.3, 0.9)
                except Exception as e:
                    logger.warning(f"AI sinyal hatası {symbol}: {e}")
                
                # 4. Sentiment entegrasyonu
                sentiment_score = 0.0
                if include_sentiment:
                    try:
                        # Basit sentiment (placeholder)
                        sentiment_score = 0.0  # Neutral
                    except Exception as e:
                        logger.warning(f"Sentiment hatası {symbol}: {e}")
                
                # 5. XAI açıklama
                xai_explanation = {}
                if include_xai:
                    try:
                        xai_explanation = {
                            'method': 'Rule-based',
                            'feature_contributions': {
                                'fundamental_score': fundamental_score,
                                'technical_signals': len(technical_signals),
                                'ai_confidence': ai_confidence
                            },
                            'summary': f'BUY sinyali {fundamental_score:.2f} fundamental skoru ve {ai_confidence:.2f} AI confidence ile üretildi'
                        }
                    except Exception as e:
                        logger.warning(f"XAI hatası {symbol}: {e}")
                
                # 6. Sinyal kararı
                final_signal = 'HOLD'
                final_confidence = 0.5
                
                if fundamental_score > 0.7 and ai_confidence > 0.7:
                    final_signal = 'BUY'
                    final_confidence = (fundamental_score + ai_confidence) / 2
                elif fundamental_score < 0.3 and ai_confidence > 0.6:
                    final_signal = 'SELL'
                    final_confidence = ai_confidence
                
                # 7. Risk yönetimi
                risk_management = {
                    'stop_loss': None,
                    'take_profit': None,
                    'position_size': 0.0
                }
                
                if final_signal == 'BUY':
                    risk_management['position_size'] = min(final_confidence, 0.8)
                    risk_management['stop_loss'] = 0.05  # %5
                    risk_management['take_profit'] = 0.15  # %15
                
                # Sinyal oluştur
                signals[symbol] = {
                    'symbol': symbol,
                    'signal': final_signal,
                    'confidence': final_confidence,
                    'timestamp': datetime.now().isoformat(),
                    'analysis': {
                        'fundamental_score': fundamental_score,
                        'technical_signals': technical_signals,
                        'ai_signal': ai_signal,
                        'ai_confidence': ai_confidence,
                        'sentiment_score': sentiment_score
                    },
                    'risk_management': risk_management,
                    'xai_explanation': xai_explanation if include_xai else None
                }
                
            except Exception as e:
                logger.error(f"Sinyal oluşturma hatası {symbol}: {e}")
                signals[symbol] = {
                    'symbol': symbol,
                    'signal': 'ERROR',
                    'confidence': 0.0,
                    'error': str(e),
                    'timestamp': datetime.now().isoformat()
                }
        
        return {
            "signals": signals,
            "total_signals": len(signals),
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "include_sentiment": include_sentiment,
                "include_xai": include_xai,
                "version": "2.0.0"
            }
        }
        
    except Exception as e:
        logger.error(f"Sinyal endpoint hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ranking")
async def get_stock_ranking(top_n: int = 10):
    """Grey TOPSIS + Entropi ile hisse sıralaması (Legacy)"""
    try:
        if topsis_ranking is None:
            raise HTTPException(status_code=503, detail="TOPSIS ranking hazır değil")
        
        # Test verisi ile ranking
        test_data = {
            'SISE.IS': {'ROE': 0.15, 'NetMargin': 0.12, 'DebtEquity': 0.4},
            'EREGL.IS': {'ROE': 0.18, 'NetMargin': 0.14, 'DebtEquity': 0.6},
            'TUPRS.IS': {'ROE': 0.22, 'NetMargin': 0.16, 'DebtEquity': 0.3}
        }
        
        # DataFrame'e çevir
        df = pd.DataFrame.from_dict(test_data, orient='index')
        
        # Ranking yap
        ranked_df = topsis_ranking.rank_stocks(df)
        
        return {
            "ranking": ranked_df.to_dict('index'),
            "top_n": top_n,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Ranking hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ranking/mcdm")
async def get_mcdm_ranking(market: str = "BIST", top_n: int = 10):
    """PRD v2.0 - MCDM Ranking (Grey TOPSIS + Entropi)"""
    try:
        if 'mcdm_ranking' not in globals() or mcdm_ranking is None:
            raise HTTPException(status_code=503, detail="MCDM Ranking hazır değil")
        
        if market.upper() == "BIST":
            results = mcdm_ranking.get_bist_ranking()
        elif market.upper() == "US":
            results = mcdm_ranking.get_us_ranking()
        elif market.upper() == "COMBINED":
            results = mcdm_ranking.get_combined_ranking()
        else:
            raise HTTPException(status_code=400, detail="Geçersiz market. BIST, US veya COMBINED kullanın")
        
        if not results:
            raise HTTPException(status_code=503, detail=f"{market} ranking verisi bulunamadı")
        
        # Top N results
        top_results = results['ranking'][:top_n]
        
        return {
            "market": market,
            "ranking": top_results,
            "total_symbols": results['total_symbols'],
            "timestamp": results['timestamp'],
            "source": "PRD_v2_0_MCDM_Ranking"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MCDM Ranking hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ranking/mcdm/export/{market}")
async def export_mcdm_ranking(market: str, format: str = "csv"):
    """MCDM Ranking sonuçlarını export et"""
    try:
        if 'mcdm_ranking' not in globals() or mcdn_ranking is None:
            raise HTTPException(status_code=503, detail="MCDM Ranking hazır değil")
        
        if format.lower() == "csv":
            filename = mcdm_ranking.export_ranking_to_csv(market)
            if filename:
                return FileResponse(
                    filename,
                    media_type='text/csv',
                    filename=f"{market}_ranking_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                )
            else:
                raise HTTPException(status_code=500, detail="CSV export hatası")
        else:
            raise HTTPException(status_code=500, detail="Sadece CSV format destekleniyor")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Export hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/portfolio/{user_id}")
async def get_user_portfolio(user_id: str):
    """Kullanıcı portföyü"""
    try:
        if rl_agent is None:
            raise HTTPException(status_code=503, detail="RL Agent hazır değil")
        
        # Basit portföy (placeholder)
        portfolio = {
            "user_id": user_id,
            "total_value": 100000.0,
            "cash": 50000.0,
            "positions": {
                "SISE.IS": {"quantity": 100, "avg_price": 25.0, "current_value": 2500.0},
                "EREGL.IS": {"quantity": 50, "avg_price": 30.0, "current_value": 1500.0}
            },
            "performance": {
                "daily_return": 0.02,
                "weekly_return": 0.05,
                "monthly_return": 0.15
            },
            "last_updated": datetime.now().isoformat()
        }
        
        return portfolio
        
    except Exception as e:
        logger.error(f"Portfolio hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook/signal")
async def webhook_signal(background_tasks: BackgroundTasks, signal_data: Dict):
    """Webhook ile sinyal alma"""
    try:
        # Background task olarak işle
        background_tasks.add_task(process_webhook_signal, signal_data)
        
        return {
            "status": "accepted",
            "message": "Sinyal alındı ve işleniyor",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Webhook hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_webhook_signal(signal_data: Dict):
    """Webhook sinyalini işle"""
    try:
        logger.info(f"Webhook sinyal işleniyor: {signal_data}")
        
        # Burada sinyal işleme mantığı olacak
        # Firestore'a kaydet, notification gönder, vs.
        
        await asyncio.sleep(1)  # Simulate processing
        
        logger.info("Webhook sinyal işleme tamamlandı")
        
    except Exception as e:
        logger.error(f"Webhook işleme hatası: {e}")

@app.get("/metrics")
async def get_prometheus_metrics():
    """Prometheus metrics endpoint"""
    try:
        metrics_data = get_metrics()
        return Response(content=metrics_data, media_type=CONTENT_TYPE_LATEST)
        
    except Exception as e:
        logger.error(f"Metrics hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cache/stats")
async def get_cache_stats():
    """Cache statistics endpoint"""
    try:
        cache_stats = await cache_manager.get_stats()
        db_stats = await db_manager.get_pool_stats()
        
        return {
            "cache": cache_stats,
            "database": db_stats,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Cache stats hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dupont-piotroski/{symbol}")
async def get_dupont_piotroski_analysis(symbol: str):
    """DuPont & Piotroski F-Score analizi"""
    try:
        if dupont_analyzer is None:
            raise HTTPException(status_code=503, detail="DuPont analyzer hazır değil")
        
        analysis = dupont_analyzer.get_comprehensive_analysis(symbol)
        if not analysis:
            raise HTTPException(status_code=404, detail=f"{symbol} analizi bulunamadı")
        
        return {
            "symbol": symbol,
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"DuPont analiz hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/macro-regime")
async def get_macro_regime_analysis(symbols: Optional[str] = None):
    """Makro piyasa rejimi analizi"""
    try:
        if macro_detector is None:
            raise HTTPException(status_code=503, detail="Macro detector hazır değil")
        
        # Sembolleri parse et
        if symbols:
            symbol_list = [s.strip() for s in symbols.split(",")]
        else:
            symbol_list = None  # Varsayılan makro semboller
        
        analysis = macro_detector.get_macro_analysis(symbol_list)
        if not analysis:
            raise HTTPException(status_code=500, detail="Makro analiz başarısız")
        
        return {
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Makro analiz hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/backtest")
async def run_backtest_analysis(
    symbol: str,
    period: str = "2y",
    initial_capital: float = 100000,
    include_walkforward: bool = True,
    include_optimization: bool = False
):
    """Backtest ve walk forward analizi çalıştır"""
    try:
        if backtest_engine is None:
            raise HTTPException(status_code=503, detail="Backtest engine hazır değil")
        
        # Veri al
        data = backtest_engine.get_stock_data_for_backtest(symbol, period)
        if data.empty:
            raise HTTPException(status_code=404, detail=f"{symbol} verisi bulunamadı")
        
        # Teknik indikatörler
        data_with_indicators = backtest_engine.calculate_technical_indicators(data)
        
        # Backtest çalıştır
        backtest_result = backtest_engine.run_backtest(data_with_indicators, initial_capital)
        if not backtest_result:
            raise HTTPException(status_code=500, detail="Backtest başarısız")
        
        # Walk Forward analizi
        walk_forward_result = None
        if include_walkforward:
            walk_forward_result = backtest_engine.run_walk_forward_analysis(data_with_indicators)
        
        # Parametre optimizasyonu
        optimization_result = None
        if include_optimization:
            optimization_result = backtest_engine.optimize_strategy_parameters(data_with_indicators)
        
        # Rapor oluştur
        report = backtest_engine.generate_backtest_report(
            symbol, backtest_result, walk_forward_result, optimization_result
        )
        
        return {
            "symbol": symbol,
            "backtest_result": backtest_result,
            "walk_forward_result": walk_forward_result,
            "optimization_result": optimization_result,
            "report": report,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Backtest hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/backtest/{symbol}")
async def get_backtest_report(symbol: str):
    """Mevcut backtest raporunu getir"""
    try:
        if backtest_engine is None:
            raise HTTPException(status_code=503, detail="Backtest engine hazır değil")
        
        # Cache'den rapor al
        if symbol in backtest_engine.backtest_results:
            return {
                "symbol": symbol,
                "report": backtest_engine.backtest_results[symbol],
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=404, detail=f"{symbol} için backtest raporu bulunamadı")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Backtest rapor hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# BIST Performance Tracker Endpoints
@app.get("/performance/all")
async def get_all_performance(force_update: bool = False):
    """Tüm hisseler için performans metrikleri"""
    try:
        if performance_tracker is None:
            raise HTTPException(status_code=503, detail="Performance tracker hazır değil")
        
        performance = performance_tracker.get_all_performance(force_update)
        if not performance:
            raise HTTPException(status_code=500, detail="Performans verisi alınamadı")
        
        return {
            "total_stocks": len(performance),
            "performance": performance,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Performans verisi hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/performance/summary")
async def get_performance_summary():
    """Genel performans özeti"""
    try:
        if performance_tracker is None:
            raise HTTPException(status_code=503, detail="Performance tracker hazır değil")
        
        summary = performance_tracker.get_performance_summary()
        if not summary:
            raise HTTPException(status_code=500, detail="Performans özeti alınamadı")
        
        return {
            "summary": summary,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Performans özeti hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/performance/top/{metric}")
async def get_top_performers(metric: str, top_n: int = 10):
    """En iyi performans gösteren hisseler"""
    try:
        if performance_tracker is None:
            raise HTTPException(status_code=503, detail="Performance tracker hazır değil")
        
        top_stocks = performance_tracker.get_top_performers(metric, top_n)
        if not top_stocks:
            raise HTTPException(status_code=500, detail="Top performers alınamadı")
        
        return {
            "metric": metric,
            "top_n": top_n,
            "stocks": top_stocks,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Top performers hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/performance/stock/{symbol}")
async def get_stock_performance(symbol: str):
    """Tek hisse için performans metrikleri"""
    try:
        if performance_tracker is None:
            raise HTTPException(status_code=503, detail="Performance tracker hazır değil")
        
        metrics = performance_tracker.calculate_performance_metrics(symbol)
        if not metrics:
            raise HTTPException(status_code=404, detail=f"{symbol} için performans verisi bulunamadı")
        
        return {
            "symbol": symbol,
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Hisse performans hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/performance/export")
async def export_performance_csv():
    """Performans verilerini CSV olarak export et"""
    try:
        if performance_tracker is None:
            raise HTTPException(status_code=503, detail="Performance tracker hazır değil")
        
        filename = f"bist_performance_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        success = performance_tracker.export_to_csv(filename)
        
        if not success:
            raise HTTPException(status_code=500, detail="CSV export başarısız")
        
        return {
            "message": "Performans verisi CSV'e export edildi",
            "filename": filename,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CSV export hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Accuracy Optimizer Endpoints
@app.post("/accuracy/train/{symbol}")
async def train_accuracy_model(symbol: str):
    """Hisse için doğruluk modeli eğit"""
    try:
        if accuracy_optimizer is None:
            raise HTTPException(status_code=503, detail="Accuracy optimizer hazır değil")
        
        training_result = accuracy_optimizer.train_ensemble_model(symbol)
        if "error" in training_result:
            raise HTTPException(status_code=500, detail=training_result["error"])
        
        return {
            "symbol": symbol,
            "training_result": training_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Model eğitimi hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/accuracy/predict/{symbol}")
async def get_accuracy_prediction(symbol: str):
    """Hisse için doğruluk tabanlı sinyal tahmini"""
    try:
        if accuracy_optimizer is None:
            raise HTTPException(status_code=503, detail="Accuracy optimizer hazır değil")
        
        prediction = accuracy_optimizer.predict_signal(symbol)
        if "error" in prediction:
            raise HTTPException(status_code=500, detail=prediction["error"])
        
        return {
            "symbol": symbol,
            "prediction": prediction,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Sinyal tahmini hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/accuracy/report")
async def get_accuracy_report():
    """Genel doğruluk raporu"""
    try:
        if accuracy_optimizer is None:
            raise HTTPException(status_code=503, detail="Accuracy optimizer hazır değil")
        
        report = accuracy_optimizer.get_accuracy_report()
        if "error" in report:
            raise HTTPException(status_code=500, detail=report["error"])
        
        return {
            "report": report,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Doğruluk raporu hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/accuracy/optimize")
async def optimize_ensemble_weights():
    """Ensemble ağırlıklarını optimize et"""
    try:
        if accuracy_optimizer is None:
            raise HTTPException(status_code=503, detail="Accuracy optimizer hazır değil")
        
        optimization_result = accuracy_optimizer.optimize_ensemble_weights()
        if "error" in optimization_result:
            raise HTTPException(status_code=500, detail=optimization_result["error"])
        
        return {
            "optimization_result": optimization_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ensemble optimizasyon hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/accuracy/features/{symbol}")
async def get_feature_importance(symbol: str):
    """Hisse için özellik önem sıralaması"""
    try:
        if accuracy_optimizer is None:
            raise HTTPException(status_code=503, detail="Accuracy optimizer hazır değil")
        
        if symbol not in accuracy_optimizer.feature_importance:
            raise HTTPException(status_code=404, detail=f"{symbol} için model bulunamadı")
        
        feature_importance = accuracy_optimizer.feature_importance[symbol]
        
        # Önem sırasına göre sırala
        sorted_features = sorted(
            feature_importance.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return {
            "symbol": symbol,
            "feature_importance": dict(sorted_features),
            "top_features": sorted_features[:5],
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Özellik önem hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rl/decision/{symbol}")
async def get_rl_decision(symbol: str, timeframe: str = "1d", limit: int = 120):
    """RL ajanından pozisyon kararı"""
    try:
        from ai_models.ensemble_manager import AIEnsembleManager
        from ai_models.rl_agent import RLPortfolioAgent
        import yfinance as yf
        
        # Veri
        df = yf.Ticker(symbol).history(period=f"{limit}d", interval=timeframe)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"{symbol} için veri yok")
        
        # Ensemble sinyal
        ensemble = AIEnsembleManager().get_ensemble_prediction(df, symbol)
        
        # RL karar
        agent = RLPortfolioAgent()
        decision = agent.decide(symbol, df, ensemble)
        
        return {
            'symbol': symbol,
            'ensemble': ensemble,
            'rl_decision': decision.__dict__
        }
    except Exception as e:
        logger.error(f"RL karar hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/train/lightgbm")
async def train_lightgbm(symbol: str = "SISE.IS", period: str = "360d", interval: str = "1d"):
    """LightGBM model eğitimi (yfinance verisi ile)"""
    try:
        import yfinance as yf
        from ai_models.lightgbm_model import LightGBMModel
        
        df = yf.Ticker(symbol).history(period=period, interval=interval)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"{symbol} için veri yok")
        
        model = LightGBMModel()
        result = model.train(df)
        if not result:
            raise HTTPException(status_code=500, detail="LightGBM eğitim başarısız")
        
        return {
            'symbol': symbol,
            'result': result,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"LightGBM eğitim hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/train/lstm")
async def train_lstm(symbol: str = "SISE.IS", period: str = "60d", interval: str = "60m"):
    """LSTM model eğitimi (yfinance verisi ile, 60m veriden 4H pattern)"""
    try:
        import yfinance as yf
        from ai_models.lstm_model import LSTMModel
        import pandas as pd
        
        df = yf.Ticker(symbol).history(period=period, interval=interval)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"{symbol} için veri yok")
        
        # 60m veriyi 4 saatlik OHLCV'e yeniden örnekle
        df = df.copy()
        df.index = pd.to_datetime(df.index)
        df_4h = pd.DataFrame({
            'Open': df['Open'].resample('4H').first(),
            'High': df['High'].resample('4H').max(),
            'Low': df['Low'].resample('4H').min(),
            'Close': df['Close'].resample('4H').last(),
            'Volume': df['Volume'].resample('4H').sum()
        }).dropna()
        
        model = LSTMModel()
        result = model.train(df_4h)
        if not result:
            raise HTTPException(status_code=500, detail="LSTM eğitim başarısız")
        
        return {
            'symbol': symbol,
            'result': result,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"LSTM eğitim hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/train/catboost")
async def train_catboost(symbol: str = "SISE.IS", period: str = "360d", interval: str = "1d"):
    """CatBoost model eğitimi (yfinance verisi ile)"""
    try:
        import yfinance as yf
        from ai_models.catboost_model import CatBoostModel
        
        df = yf.Ticker(symbol).history(period=period, interval=interval)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"{symbol} için veri yok")
        
        model = CatBoostModel()
        result = model.train(df)
        if not result:
            raise HTTPException(status_code=500, detail="CatBoost eğitim başarısız")
        
        return {
            'symbol': symbol,
            'result': result,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"CatBoost eğitim hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/snapshots/health")
async def generate_health_snapshot():
    """Finansal sağlık snapshot (dosyaya kaydet)"""
    try:
        import os, json
        import numpy as np
        from analysis.fundamental_analysis import FundamentalAnalyzer
        
        # Semboller
        path_symbols = os.path.join("data", "bist100.json")
        with open(path_symbols, 'r', encoding='utf-8') as f:
            symbols_data = json.load(f)
        symbols = [s['symbol'] for s in symbols_data.get('symbols', [])][:20]
        
        analyzer = FundamentalAnalyzer()
        summary = []
        for sym in symbols:
            mock = {
                'net_income': np.random.randint(500000, 2000000),
                'revenue': np.random.randint(5000000, 20000000),
                'total_equity': np.random.randint(3000000, 10000000),
                'total_assets': np.random.randint(10000000, 30000000),
                'total_debt': np.random.randint(1000000, 5000000),
                'current_assets': np.random.randint(5000000, 15000000),
                'current_liabilities': np.random.randint(2000000, 8000000),
                'operating_cash_flow': np.random.randint(600000, 2500000),
                'roa_current': np.random.uniform(4, 8),
                'roa_previous': np.random.uniform(3, 7),
                'debt_current': np.random.randint(1000000, 5000000),
                'debt_previous': np.random.randint(1200000, 5500000),
                'current_ratio_current': np.random.uniform(1.5, 3.5),
                'current_ratio_previous': np.random.uniform(1.3, 3.2),
                'shares_current': 1000000,
                'shares_previous': 1000000,
                'gross_margin_current': np.random.uniform(20, 30),
                'gross_margin_previous': np.random.uniform(19, 29),
                'asset_turnover_current': np.random.uniform(0.5, 0.8),
                'asset_turnover_previous': np.random.uniform(0.4, 0.7)
            }
            summary.append(analyzer.get_financial_health_summary(sym, mock))
        summary.sort(key=lambda x: x.get('health_score', 0), reverse=True)
        
        out_dir = os.path.join("data", "snapshots")
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, f"health_{datetime.now().strftime('%Y%m%d_%H%M')}.json")
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump({'generated_at': datetime.now().isoformat(), 'summary': summary}, f, ensure_ascii=False)
        
        return {'file': out_path, 'total': len(summary)}
    except Exception as e:
        logger.error(f"Health snapshot hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/snapshots/topsis")
async def generate_topsis_snapshot():
    """TOPSIS snapshot (dosyaya kaydet)"""
    try:
        import os, json
        from analysis.mcdm_ranking import GreyTOPSISAnalyzer, create_financial_decision_matrix
        
        # Health snapshot oluştur
        health_resp = await generate_health_snapshot()
        file_path = health_resp['file']
        with open(file_path, 'r', encoding='utf-8') as f:
            health_data = json.load(f)
        
        # TOPSIS hazırla
        symbols_data = []
        for item in health_data['summary']:
            symbols_data.append({'symbol': item['symbol'], 'financial_health': item})
        decision_matrix, criteria_types = create_financial_decision_matrix(symbols_data)
        
        analyzer = GreyTOPSISAnalyzer()
        results = analyzer.rank_alternatives(decision_matrix, criteria_types)
        
        out_dir = os.path.join("data", "snapshots")
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, f"topsis_{datetime.now().strftime('%Y%m%d_%H%M')}.json")
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump({
                'generated_at': datetime.now().isoformat(),
                'ranking': results.to_dict('index'),
                'criteria_types': criteria_types
            }, f, ensure_ascii=False)
        
        return {'file': out_path, 'total': len(results)}
    except Exception as e:
        logger.error(f"TOPSIS snapshot hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/logs/tail")
async def tail_logs(lines: int = 200):
    """Log dosyasının son satırları"""
    try:
        import os
        log_path = os.path.join("logs", "app.log")
        if not os.path.exists(log_path):
            return {'lines': [], 'message': 'Log dosyası bulunamadı'}
        with open(log_path, 'r', encoding='utf-8') as f:
            content = f.readlines()
        tail = content[-lines:]
        return {'lines': tail}
    except Exception as e:
        logger.error(f"Log tail hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/xai/lightgbm/{symbol}")
async def explain_lightgbm(symbol: str, period: str = "360d", interval: str = "1d", top_n: int = 10):
    """LightGBM son tahmin için SHAP feature katkıları"""
    try:
        import yfinance as yf
        import shap
        import numpy as np
        from ai_models.lightgbm_model import LightGBMModel
        
        # Veri
        df = yf.Ticker(symbol).history(period=period, interval=interval)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"{symbol} için veri yok")
        
        model = LightGBMModel()
        # Model yüklü değilse eğitelim (hızlıca)
        if not model.load_model():
            model.train(df)
        if not model.is_trained:
            raise HTTPException(status_code=500, detail="Model yüklenemedi/eğitilemedi")
        
        # Feature'lar
        features_df = model.create_features(df)
        X = features_df[model.feature_names].fillna(0)
        x_last = X.iloc[-1:]
        
        # SHAP hesapla
        explainer = shap.TreeExplainer(model.model)
        shap_values = explainer.shap_values(x_last)
        
        # Binary'de shap_values bir liste olabilir
        if isinstance(shap_values, list):
            sv = shap_values[1] if len(shap_values) > 1 else shap_values[0]
        else:
            sv = shap_values
        
        contrib = sorted(
            [
                (fname, float(sv[0, idx]))
                for idx, fname in enumerate(model.feature_names)
            ],
            key=lambda x: abs(x[1]), reverse=True
        )[:top_n]
        
        return {
            'symbol': symbol,
            'top_contributions': contrib,
            'prediction': float(model.model.predict_proba(x_last)[0][1]),
            'timestamp': datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"XAI SHAP hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Push Notification Endpoints
@app.post("/notifications/send")
async def send_notification(
    title: str,
    body: str,
    topic: Optional[str] = None,
    tokens: Optional[List[str]] = None,
    data: Optional[Dict] = None
):
    """Push notification gönder"""
    try:
        success = push_service.send_notification(
            title=title,
            body=body,
            data=data,
            topic=topic,
            tokens=tokens
        )
        
        return {
            "success": success,
            "message": "Notification sent" if success else "Failed to send notification",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Notification send error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/notifications/trading-signal")
async def send_trading_signal_notification(
    symbol: str,
    signal: str,
    confidence: float,
    market: str = "BIST"
):
    """Trading sinyali bildirimi gönder"""
    try:
        success = push_service.send_trading_signal(
            symbol=symbol,
            signal=signal,
            confidence=confidence,
            market=market
        )
        
        return {
            "success": success,
            "message": f"Trading signal notification sent for {symbol}",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Trading signal notification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/notifications/robot-alert")
async def send_robot_alert(
    alert_type: str,
    message: str,
    data: Optional[Dict] = None
):
    """Robot uyarısı gönder"""
    try:
        success = push_service.send_robot_alert(
            alert_type=alert_type,
            message=message,
            data=data
        )
        
        return {
            "success": success,
            "message": f"Robot alert sent: {alert_type}",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Robot alert error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/notifications/performance-update")
async def send_performance_update(
    profit: float,
    win_rate: float,
    total_trades: int
):
    """Performans güncellemesi gönder"""
    try:
        success = push_service.send_performance_update(
            profit=profit,
            win_rate=win_rate,
            total_trades=total_trades
        )
        
        return {
            "success": success,
            "message": "Performance update sent",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Performance update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/notifications/market-alert")
async def send_market_alert(
    market: str,
    alert_type: str,
    message: str
):
    """Market uyarısı gönder"""
    try:
        success = push_service.send_market_alert(
            market=market,
            alert_type=alert_type,
            message=message
        )
        
        return {
            "success": success,
            "message": f"Market alert sent for {market}",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Market alert error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/notifications/status")
async def get_notification_status():
    """Push notification servis durumu"""
    return {
        "enabled": push_service.enabled,
        "fcm_configured": bool(push_service.fcm_server_key),
        "timestamp": datetime.now().isoformat()
    }

# Deep Learning Endpoints
@app.post("/deep-learning/train")
async def train_deep_learning_models(
    symbol: str,
    period: str = "1y",
    news_data: Optional[List[Dict]] = None
):
    """Deep Learning modellerini eğit"""
    try:
        # Veri çek
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period)
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"{symbol} için veri bulunamadı")
        
        # Deep Learning modellerini eğit
        result = deep_learning_ensemble.train(df, news_data)
        
        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])
        
        return {
            "success": True,
            "message": f"Deep Learning modelleri eğitildi: {symbol}",
            "results": result.get("results", {}),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Deep Learning eğitim hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/deep-learning/predict")
async def predict_with_deep_learning(
    symbol: str,
    period: str = "1y",
    news_data: Optional[List[Dict]] = None
):
    """Deep Learning ile tahmin yap"""
    try:
        # Veri çek
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period)
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"{symbol} için veri bulunamadı")
        
        # Tahmin yap
        predictions = deep_learning_ensemble.predict(df, news_data)
        
        if predictions.get("error"):
            raise HTTPException(status_code=500, detail=predictions["error"])
        
        return {
            "success": True,
            "symbol": symbol,
            "predictions": predictions.get("predictions", {}),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Deep Learning tahmin hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/deep-learning/nlp-analyze")
async def analyze_news_sentiment(
    news_text: str,
    extract_keywords: bool = True
):
    """Haber metninin sentiment analizini yap"""
    try:
        analyzer = deep_learning_ensemble.nlp_analyzer
        
        # Sentiment analizi
        sentiment_result = analyzer.analyze_sentiment(news_text)
        
        result = {
            "success": True,
            "sentiment": sentiment_result,
            "timestamp": datetime.now().isoformat()
        }
        
        # Anahtar kelimeler
        if extract_keywords:
            keywords = analyzer.extract_keywords(news_text, top_n=10)
            result["keywords"] = keywords
        
        return result
        
    except Exception as e:
        logger.error(f"NLP analiz hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/deep-learning/status")
async def get_deep_learning_status():
    """Deep Learning modellerinin durumu"""
    return {
        "transformer_trained": deep_learning_ensemble.transformer.is_trained,
        "lstm_trained": deep_learning_ensemble.lstm.is_trained,
        "nlp_initialized": deep_learning_ensemble.nlp_analyzer.is_initialized,
        "ensemble_trained": deep_learning_ensemble.is_trained,
        "tensorflow_available": deep_learning_ensemble.transformer.model is not None,
        "timestamp": datetime.now().isoformat()
    }

# Backtesting Endpoints
@app.post("/backtesting/run")
async def run_backtest(
    symbol: str,
    strategy: str,
    period: str = "2y",
    initial_capital: float = 100000.0,
    commission: float = 0.001,
    slippage: float = 0.0005
):
    """Backtest çalıştır"""
    try:
        # Veri çek
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period)
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"{symbol} için veri bulunamadı")
        
        # Strateji seç
        try:
            strategy_type = StrategyType(strategy)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Geçersiz strateji: {strategy}")
        
        # Backtest konfigürasyonu
        config = BacktestConfig(
            initial_capital=initial_capital,
            commission=commission,
            slippage=slippage
        )
        
        # Backtest çalıştır
        engine = BacktestEngine(config)
        strategy_engine = StrategyEngine(strategy_type)
        result = engine.run_backtest(df, strategy_engine)
        
        # Sonuçları formatla
        return {
            "success": True,
            "symbol": symbol,
            "strategy": strategy,
            "period": period,
            "metrics": {
                "total_return": result.total_return,
                "annualized_return": result.annualized_return,
                "volatility": result.volatility,
                "sharpe_ratio": result.sharpe_ratio,
                "max_drawdown": result.max_drawdown,
                "calmar_ratio": result.calmar_ratio,
                "win_rate": result.win_rate,
                "profit_factor": result.profit_factor,
                "total_trades": result.total_trades,
                "avg_trade_return": result.avg_trade_return,
                "var_95": result.var_95,
                "var_99": result.var_99,
                "cvar_95": result.cvar_95,
                "alpha": result.alpha,
                "beta": result.beta
            },
            "trades_count": len(result.trades),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Backtest hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/backtesting/walk-forward")
async def run_walk_forward_validation(
    symbol: str,
    strategy: str,
    period: str = "5y",
    train_period: int = 252,
    test_period: int = 63
):
    """Walk-forward validation çalıştır"""
    try:
        # Veri çek
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period)
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"{symbol} için veri bulunamadı")
        
        # Strateji seç
        try:
            strategy_type = StrategyType(strategy)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Geçersiz strateji: {strategy}")
        
        # Walk-forward validation
        validator = WalkForwardValidator(train_period, test_period)
        strategy_engine = StrategyEngine(strategy_type)
        result = validator.validate(df, strategy_engine)
        
        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])
        
        return {
            "success": True,
            "symbol": symbol,
            "strategy": strategy,
            "period": period,
            "train_period_days": train_period,
            "test_period_days": test_period,
            "results": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Walk-forward validation hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/backtesting/strategies")
async def get_available_strategies():
    """Mevcut stratejileri listele"""
    strategies = [
        {
            "name": strategy.value,
            "description": _get_strategy_description(strategy)
        }
        for strategy in StrategyType
    ]
    
    return {
        "success": True,
        "strategies": strategies,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/backtesting/compare")
async def compare_strategies(
    symbol: str,
    strategies: List[str],
    period: str = "2y",
    initial_capital: float = 100000.0
):
    """Stratejileri karşılaştır"""
    try:
        # Veri çek
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period)
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"{symbol} için veri bulunamadı")
        
        results = []
        
        for strategy_name in strategies:
            try:
                strategy_type = StrategyType(strategy_name)
                
                # Backtest çalıştır
                config = BacktestConfig(initial_capital=initial_capital)
                engine = BacktestEngine(config)
                strategy_engine = StrategyEngine(strategy_type)
                result = engine.run_backtest(df, strategy_engine)
                
                results.append({
                    "strategy": strategy_name,
                    "total_return": result.total_return,
                    "sharpe_ratio": result.sharpe_ratio,
                    "max_drawdown": result.max_drawdown,
                    "win_rate": result.win_rate,
                    "total_trades": result.total_trades,
                    "profit_factor": result.profit_factor
                })
                
            except ValueError:
                results.append({
                    "strategy": strategy_name,
                    "error": "Geçersiz strateji"
                })
        
        return {
            "success": True,
            "symbol": symbol,
            "period": period,
            "comparison": results,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Strateji karşılaştırma hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _get_strategy_description(strategy: StrategyType) -> str:
    """Strateji açıklaması"""
    descriptions = {
        StrategyType.BUY_AND_HOLD: "Satın al ve tut stratejisi",
        StrategyType.MOVING_AVERAGE_CROSS: "Hareketli ortalama kesişim stratejisi",
        StrategyType.RSI_MEAN_REVERSION: "RSI ortalama dönüş stratejisi",
        StrategyType.BOLLINGER_BANDS: "Bollinger Bantları stratejisi",
        StrategyType.MOMENTUM: "Momentum stratejisi",
        StrategyType.MEAN_REVERSION: "Ortalama dönüş stratejisi",
        StrategyType.BREAKOUT: "Kırılım stratejisi",
        StrategyType.SCALPING: "Scalping stratejisi"
    }
    return descriptions.get(strategy, "Bilinmeyen strateji")

# Crypto Markets Endpoints
@app.get("/crypto/market-overview")
async def get_crypto_market_overview():
    """Kripto market genel bakış"""
    try:
        result = crypto_analyzer.analyze_crypto_market()
        
        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])
        
        return result
        
    except Exception as e:
        logger.error(f"Crypto market overview hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/crypto/technical-analysis/{symbol}")
async def get_crypto_technical_analysis(
    symbol: str,
    days: int = 30
):
    """Kripto teknik analizi"""
    try:
        result = crypto_analyzer.analyze_crypto_technical(symbol.upper(), days)
        
        if result.get("error"):
            raise HTTPException(status_code=404, detail=result["error"])
        
        return result
        
    except Exception as e:
        logger.error(f"Crypto technical analysis hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/crypto/top-cryptos")
async def get_top_cryptocurrencies(limit: int = 50):
    """En büyük kripto paraları listele"""
    try:
        cryptos = crypto_analyzer.data_provider.get_top_cryptos(limit)
        
        result = {
            "success": True,
            "cryptos": [
                {
                    "symbol": c.symbol,
                    "name": c.name,
                    "price": c.price,
                    "market_cap": c.market_cap,
                    "volume_24h": c.volume_24h,
                    "change_24h": c.change_24h,
                    "change_7d": c.change_7d,
                    "rank": c.market_cap_rank,
                    "category": c.category
                }
                for c in cryptos
            ],
            "count": len(cryptos),
            "timestamp": datetime.now().isoformat()
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Top cryptos hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/crypto/fear-greed-index")
async def get_crypto_fear_greed_index():
    """Crypto Fear & Greed Index"""
    try:
        result = crypto_analyzer.data_provider.get_crypto_fear_greed_index()
        
        return {
            "success": True,
            "fear_greed_index": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fear & Greed Index hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/crypto/price-history/{symbol}")
async def get_crypto_price_history(
    symbol: str,
    days: int = 30
):
    """Kripto fiyat geçmişi"""
    try:
        df = crypto_analyzer.data_provider.get_crypto_price_history(symbol.upper(), days)
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"{symbol} için veri bulunamadı")
        
        # DataFrame'i JSON'a çevir
        data = []
        for timestamp, row in df.iterrows():
            data.append({
                "timestamp": timestamp.isoformat(),
                "price": row['price'],
                "volume": row['volume'],
                "market_cap": row['market_cap']
            })
        
        return {
            "success": True,
            "symbol": symbol.upper(),
            "days": days,
            "data": data,
            "count": len(data),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Crypto price history hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Crypto Portfolio Endpoints
@app.get("/crypto/portfolio")
async def get_crypto_portfolio():
    """Kripto portföy durumu"""
    try:
        result = crypto_portfolio_manager.get_portfolio_value()
        
        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])
        
        return result
        
    except Exception as e:
        logger.error(f"Crypto portfolio hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/crypto/portfolio/add")
async def add_crypto_to_portfolio(
    symbol: str,
    quantity: float,
    price: Optional[float] = None
):
    """Portföye kripto ekle"""
    try:
        success = crypto_portfolio_manager.add_crypto(symbol, quantity, price)
        
        if not success:
            raise HTTPException(status_code=400, detail="Portföye ekleme başarısız")
        
        return {
            "success": True,
            "message": f"{quantity} {symbol.upper()} portföye eklendi",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Crypto portfolio add hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/crypto/portfolio/remove")
async def remove_crypto_from_portfolio(
    symbol: str,
    quantity: Optional[float] = None
):
    """Portföyden kripto çıkar"""
    try:
        success = crypto_portfolio_manager.remove_crypto(symbol, quantity)
        
        if not success:
            raise HTTPException(status_code=400, detail="Portföyden çıkarma başarısız")
        
        return {
            "success": True,
            "message": f"{quantity or 'Tüm'} {symbol.upper()} portföyden çıkarıldı",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Crypto portfolio remove hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/crypto/exchanges")
async def get_crypto_exchanges():
    """Desteklenen kripto borsaları"""
    from crypto_markets_integration import CryptoExchange
    
    exchanges = [
        {
            "name": exchange.value,
            "display_name": exchange.value.title(),
            "supported": True
        }
        for exchange in CryptoExchange
    ]
    
    return {
        "success": True,
        "exchanges": exchanges,
        "timestamp": datetime.now().isoformat()
    }

# Broker Integration Endpoints
@app.get("/broker/status")
async def get_broker_status():
    """Broker durumu"""
    try:
        brokers = broker_manager.get_available_brokers()
        active_broker = broker_manager.active_broker_type.value if broker_manager.active_broker_type else None
        
        return {
            "success": True,
            "active_broker": active_broker,
            "brokers": brokers,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Broker status hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/broker/connect")
async def connect_broker(broker_type: str):
    """Broker'a bağlan"""
    try:
        try:
            broker_enum = BrokerType(broker_type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Geçersiz broker türü: {broker_type}")
        
        success = await broker_manager.connect_broker(broker_enum)
        
        if not success:
            raise HTTPException(status_code=500, detail="Broker bağlantısı başarısız")
        
        return {
            "success": True,
            "message": f"{broker_type} broker'a bağlandı",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Broker connect hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/broker/disconnect")
async def disconnect_broker():
    """Broker bağlantısını kes"""
    try:
        success = await broker_manager.disconnect_broker()
        
        return {
            "success": success,
            "message": "Broker bağlantısı kesildi" if success else "Broker bağlantısı kesilemedi",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Broker disconnect hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/broker/account")
async def get_account_info():
    """Hesap bilgilerini al"""
    try:
        if not broker_manager.active_broker:
            raise HTTPException(status_code=400, detail="Aktif broker yok")
        
        account_info = await broker_manager.get_account_info()
        
        return {
            "success": True,
            "account": {
                "account_id": account_info.account_id,
                "buying_power": account_info.buying_power,
                "cash": account_info.cash,
                "equity": account_info.equity,
                "market_value": account_info.market_value,
                "day_trade_buying_power": account_info.day_trade_buying_power,
                "maintenance_margin": account_info.maintenance_margin,
                "initial_margin": account_info.initial_margin,
                "last_updated": account_info.last_updated.isoformat()
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Account info hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/broker/positions")
async def get_positions():
    """Pozisyonları al"""
    try:
        if not broker_manager.active_broker:
            raise HTTPException(status_code=400, detail="Aktif broker yok")
        
        positions = await broker_manager.get_positions()
        
        return {
            "success": True,
            "positions": [
                {
                    "symbol": pos.symbol,
                    "quantity": pos.quantity,
                    "average_price": pos.average_price,
                    "current_price": pos.current_price,
                    "market_value": pos.market_value,
                    "unrealized_pnl": pos.unrealized_pnl,
                    "unrealized_pnl_percent": pos.unrealized_pnl_percent,
                    "realized_pnl": pos.realized_pnl,
                    "cost_basis": pos.cost_basis
                }
                for pos in positions
            ],
            "count": len(positions),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Positions hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/broker/quote/{symbol}")
async def get_quote(symbol: str):
    """Anlık fiyat al"""
    try:
        if not broker_manager.active_broker:
            raise HTTPException(status_code=400, detail="Aktif broker yok")
        
        quote = await broker_manager.get_quote(symbol.upper())
        
        return {
            "success": True,
            "quote": quote,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Quote hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/broker/order/market")
async def place_market_order(
    symbol: str,
    side: str,
    quantity: float
):
    """Market order gönder"""
    try:
        if not broker_manager.active_broker:
            raise HTTPException(status_code=400, detail="Aktif broker yok")
        
        try:
            side_enum = OrderSide(side.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Geçersiz side: {side}")
        
        # Risk kontrolü
        quote = await broker_manager.get_quote(symbol.upper())
        price = quote['price']
        
        risk_ok, risk_msg = await risk_manager.check_order_risk(
            symbol=symbol.upper(),
            side=side_enum,
            quantity=quantity,
            price=price
        )
        
        if not risk_ok:
            raise HTTPException(status_code=400, detail=f"Risk kontrolü başarısız: {risk_msg}")
        
        order_id = await order_manager.create_market_order(
            symbol=symbol.upper(),
            side=side_enum,
            quantity=quantity
        )
        
        return {
            "success": True,
            "order_id": order_id,
            "message": f"Market order gönderildi: {side} {quantity} {symbol}",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Market order hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/broker/order/limit")
async def place_limit_order(
    symbol: str,
    side: str,
    quantity: float,
    price: float
):
    """Limit order gönder"""
    try:
        if not broker_manager.active_broker:
            raise HTTPException(status_code=400, detail="Aktif broker yok")
        
        try:
            side_enum = OrderSide(side.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Geçersiz side: {side}")
        
        # Risk kontrolü
        risk_ok, risk_msg = await risk_manager.check_order_risk(
            symbol=symbol.upper(),
            side=side_enum,
            quantity=quantity,
            price=price
        )
        
        if not risk_ok:
            raise HTTPException(status_code=400, detail=f"Risk kontrolü başarısız: {risk_msg}")
        
        order_id = await order_manager.create_limit_order(
            symbol=symbol.upper(),
            side=side_enum,
            quantity=quantity,
            price=price
        )
        
        return {
            "success": True,
            "order_id": order_id,
            "message": f"Limit order gönderildi: {side} {quantity} {symbol} @ {price}",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Limit order hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/broker/order/stop")
async def place_stop_order(
    symbol: str,
    side: str,
    quantity: float,
    stop_price: float
):
    """Stop order gönder"""
    try:
        if not broker_manager.active_broker:
            raise HTTPException(status_code=400, detail="Aktif broker yok")
        
        try:
            side_enum = OrderSide(side.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Geçersiz side: {side}")
        
        # Risk kontrolü
        risk_ok, risk_msg = await risk_manager.check_order_risk(
            symbol=symbol.upper(),
            side=side_enum,
            quantity=quantity,
            price=stop_price
        )
        
        if not risk_ok:
            raise HTTPException(status_code=400, detail=f"Risk kontrolü başarısız: {risk_msg}")
        
        order_id = await order_manager.create_stop_order(
            symbol=symbol.upper(),
            side=side_enum,
            quantity=quantity,
            stop_price=stop_price
        )
        
        return {
            "success": True,
            "order_id": order_id,
            "message": f"Stop order gönderildi: {side} {quantity} {symbol} @ {stop_price}",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Stop order hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/broker/order/cancel/{order_id}")
async def cancel_order(order_id: str):
    """Order iptal et"""
    try:
        if not broker_manager.active_broker:
            raise HTTPException(status_code=400, detail="Aktif broker yok")
        
        success = await order_manager.cancel_order(order_id)
        
        return {
            "success": success,
            "message": f"Order {'iptal edildi' if success else 'iptal edilemedi'}: {order_id}",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Cancel order hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/broker/order/status/{order_id}")
async def get_order_status(order_id: str):
    """Order durumu al"""
    try:
        if not broker_manager.active_broker:
            raise HTTPException(status_code=400, detail="Aktif broker yok")
        
        status = await order_manager.get_order_status(order_id)
        
        return {
            "success": True,
            "order_id": order_id,
            "status": status.value,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Order status hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/broker/orders/history")
async def get_order_history(limit: int = 100):
    """Order geçmişini al"""
    try:
        if not broker_manager.active_broker:
            raise HTTPException(status_code=400, detail="Aktif broker yok")
        
        orders = order_manager.get_order_history(limit)
        
        return {
            "success": True,
            "orders": [
                {
                    "id": order.id,
                    "symbol": order.symbol,
                    "side": order.side.value,
                    "order_type": order.order_type.value,
                    "quantity": order.quantity,
                    "price": order.price,
                    "stop_price": order.stop_price,
                    "status": order.status.value,
                    "filled_quantity": order.filled_quantity,
                    "average_price": order.average_price,
                    "created_at": order.created_at.isoformat(),
                    "updated_at": order.updated_at.isoformat()
                }
                for order in orders
            ],
            "count": len(orders),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Order history hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/broker/orders/active")
async def get_active_orders():
    """Aktif order'ları al"""
    try:
        if not broker_manager.active_broker:
            raise HTTPException(status_code=400, detail="Aktif broker yok")
        
        orders = order_manager.get_active_orders()
        
        return {
            "success": True,
            "orders": [
                {
                    "id": order.id,
                    "symbol": order.symbol,
                    "side": order.side.value,
                    "order_type": order.order_type.value,
                    "quantity": order.quantity,
                    "price": order.price,
                    "stop_price": order.stop_price,
                    "status": order.status.value,
                    "filled_quantity": order.filled_quantity,
                    "average_price": order.average_price,
                    "created_at": order.created_at.isoformat(),
                    "updated_at": order.updated_at.isoformat()
                }
                for order in orders
            ],
            "count": len(orders),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Active orders hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/broker/risk/check")
async def check_risk():
    """Risk durumu kontrol et"""
    try:
        if not broker_manager.active_broker:
            raise HTTPException(status_code=400, detail="Aktif broker yok")
        
        await risk_manager.update_daily_pnl()
        
        return {
            "success": True,
            "risk_metrics": {
                "max_position_size": risk_manager.max_position_size,
                "max_daily_loss": risk_manager.max_daily_loss,
                "max_drawdown": risk_manager.max_drawdown,
                "daily_pnl": risk_manager.daily_pnl,
                "peak_equity": risk_manager.peak_equity
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Risk check hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Advanced Trading Strategies Endpoints
@app.get("/strategies/list")
async def get_strategies():
    """Mevcut stratejileri listele"""
    try:
        strategies = [
            {
                "name": strategy.name,
                "type": strategy.__class__.__name__,
                "symbols": strategy.symbols,
                "is_active": strategy.is_active,
                "metrics": {
                    "total_trades": strategy.metrics.total_trades,
                    "win_rate": strategy.metrics.win_rate,
                    "total_pnl": strategy.metrics.total_pnl,
                    "sharpe_ratio": strategy.metrics.sharpe_ratio
                }
            }
            for strategy in strategy_manager.strategies.values()
        ]
        
        return {
            "success": True,
            "strategies": strategies,
            "count": len(strategies),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Strategies list hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/strategies/add")
async def add_strategy(
    strategy_type: str = "hft",
    symbols: str = '["AAPL", "GOOGL"]'
):
    """Strateji ekle"""
    try:
        import json
        symbols_list = json.loads(symbols)
        
        if strategy_type == "hft":
            strategy = HFTStrategy(symbols_list)
        elif strategy_type == "statistical_arbitrage":
            strategy = StatisticalArbitrageStrategy(symbols_list)
        elif strategy_type == "pairs_trading":
            strategy = PairsTradingStrategy(symbols_list)
        elif strategy_type == "market_making":
            strategy = MarketMakingStrategy(symbols_list)
        else:
            raise HTTPException(status_code=400, detail=f"Geçersiz strateji türü: {strategy_type}")
        
        strategy_manager.add_strategy(strategy)
        
        return {
            "success": True,
            "message": f"{strategy_type} stratejisi eklendi",
            "strategy_name": strategy.name,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Add strategy hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/strategies/remove/{strategy_name}")
async def remove_strategy(strategy_name: str):
    """Strateji kaldır"""
    try:
        strategy_manager.remove_strategy(strategy_name)
        
        return {
            "success": True,
            "message": f"{strategy_name} stratejisi kaldırıldı",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Remove strategy hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/strategies/start")
async def start_strategies():
    """Stratejileri başlat"""
    try:
        if not strategy_manager.is_running:
            # Background task olarak başlat
            asyncio.create_task(strategy_manager.start())
        
        return {
            "success": True,
            "message": "Stratejiler başlatıldı",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Start strategies hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/strategies/stop")
async def stop_strategies():
    """Stratejileri durdur"""
    try:
        await strategy_manager.stop()
        
        return {
            "success": True,
            "message": "Stratejiler durduruldu",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Stop strategies hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/strategies/metrics")
async def get_strategy_metrics():
    """Strateji metriklerini al"""
    try:
        metrics = strategy_manager.get_strategy_metrics()
        
        formatted_metrics = {}
        for name, metric in metrics.items():
            formatted_metrics[name] = {
                "total_trades": metric.total_trades,
                "winning_trades": metric.winning_trades,
                "losing_trades": metric.losing_trades,
                "total_pnl": metric.total_pnl,
                "max_drawdown": metric.max_drawdown,
                "sharpe_ratio": metric.sharpe_ratio,
                "win_rate": metric.win_rate,
                "avg_trade_duration": metric.avg_trade_duration,
                "profit_factor": metric.profit_factor
            }
        
        return {
            "success": True,
            "metrics": formatted_metrics,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Strategy metrics hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/strategies/positions")
async def get_strategy_positions():
    """Strateji pozisyonlarını al"""
    try:
        positions = strategy_manager.get_positions()
        
        return {
            "success": True,
            "positions": positions,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Strategy positions hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/strategies/market-data")
async def add_market_data(
    symbol: str = "AAPL",
    price: float = 150.0,
    volume: float = 1000,
    bid: float = 149.9,
    ask: float = 150.1,
    order_flow: str = "neutral",
    volatility: float = 0.02,
    momentum: float = 0.0
):
    """Market verisi ekle"""
    try:
        # OrderFlow enum mapping
        order_flow_map = {
            "buy_pressure": OrderFlow.BUY_PRESSURE,
            "sell_pressure": OrderFlow.SELL_PRESSURE,
            "neutral": OrderFlow.NEUTRAL
        }
        order_flow_enum = order_flow_map.get(order_flow, OrderFlow.NEUTRAL)
        
        market_data = MarketData(
            symbol=symbol,
            price=price,
            volume=volume,
            bid=bid,
            ask=ask,
            spread=ask - bid,
            timestamp=datetime.now(),
            order_flow=order_flow_enum,
            volatility=volatility,
            momentum=momentum
        )
        
        await strategy_manager.add_market_data(market_data)
        
        return {
            "success": True,
            "message": f"Market data added for {symbol}",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Add market data hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/strategies/signals")
async def get_strategy_signals(symbol: Optional[str] = None, flat: bool = False):
    """Strateji sinyallerini al.
    - symbol: Belirli bir sembol için filtre (opsiyonel)
    - flat: True ise düz liste döndür (symbol, action, confidence, price, quantity, timestamp, strategy)
    """
    try:
        # Düğümlü sözlük (mevcut davranış)
        signals = {}
        for name, strategy in strategy_manager.strategies.items():
            signals[name] = {}
            for sym, sig in strategy.last_signals.items():
                if symbol and sym != symbol:
                    continue
                signals[name][sym] = {
                    "action": getattr(sig, "action", None).
                        value if hasattr(getattr(sig, "action", None), "value") else str(getattr(sig, "action", "")),
                    "confidence": float(getattr(sig, "confidence", 0.0)),
                    "price": float(getattr(sig, "price", getattr(sig, "entry_price", 0.0) or 0.0)),
                    "quantity": float(getattr(sig, "quantity", 0.0)),
                    "timestamp": getattr(sig, "timestamp", datetime.now()).isoformat(),
                    "metadata": getattr(sig, "metadata", {})
                }
        
        # Snapshot (forecast_signals.json) ekle: flat list istenirken de bu kaynak kullanılsın
        snapshot_items = []
        try:
            import os, json
            # Snapshot dosyası proje kökündeki data/ altında tutuluyor
            snap_path = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'data', 'forecast_signals.json'))
            if os.path.exists(snap_path):
                with open(snap_path, 'r', encoding='utf-8', errors='ignore') as fh:
                    raw = fh.read()
                # Son geçerli JSON kapanışını bul ve kırp
                last_brace = raw.rfind('}')
                if last_brace != -1:
                    raw_clean = raw[:last_brace+1]
                else:
                    raw_clean = raw.strip().rstrip('%')
                snap = json.loads(raw_clean)
                logger.info(f"📊 Snapshot yüklendi: {len(snap.get('signals', []))} sinyal")
                for s in snap.get('signals', []):
                    sym = s.get('symbol')
                    if symbol and sym != symbol:
                        continue
                    snapshot_items.append({
                        "strategy": "forecast_snapshot",
                        "symbol": sym,
                        "action": s.get('action'),
                        "confidence": float(s.get('confidence', 0.0)),
                        "price": float(s.get('entry_price', 0.0)),
                        "quantity": 0.0,
                        "timestamp": s.get('timestamp'),
                        "metadata": {
                            "source": "forecast_snapshot",
                            "risk_reward": s.get('risk_reward'),
                            "stop_loss": s.get('stop_loss'),
                            "take_profit": s.get('take_profit')
                        }
                    })
        except Exception as e:
            logger.warning(f"Forecast snapshot okunamadı: {e}")
        
        if flat:
            flat_list = []
            for strat_name, by_symbol in signals.items():
                for sym, payload in by_symbol.items():
                    item = {"strategy": strat_name, "symbol": sym}
                    item.update(payload)
                    flat_list.append(item)
            # snapshot'ı da ekle
            flat_list.extend(snapshot_items)
            # Eğer hâlâ boşsa snapshot'ı tek başına dön
            if not flat_list and snapshot_items:
                flat_list = snapshot_items
            return {
                "success": True,
                "count": len(flat_list),
                "signals": flat_list,
                "timestamp": datetime.now().isoformat()
            }
        
        return {
            "success": True,
            "signals": signals if any(signals.values()) else {"forecast_snapshot": {s.get('symbol'): s for s in snapshot_items}},
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Strategy signals hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/strategies/backtest")
async def backtest_strategy(
    strategy_type: str,
    symbols: List[str],
    start_date: str,
    end_date: str,
    initial_capital: float = 100000.0
):
    """Strateji backtest"""
    try:
        # Mock backtest implementation
        # Gerçek implementasyonda historical data kullanılacak
        
        config = {}
        if strategy_type == "hft":
            strategy = HFTStrategy(symbols, **config)
        elif strategy_type == "statistical_arbitrage":
            strategy = StatisticalArbitrageStrategy(symbols, **config)
        elif strategy_type == "pairs_trading":
            strategy = PairsTradingStrategy(symbols, **config)
        elif strategy_type == "market_making":
            strategy = MarketMakingStrategy(symbols, **config)
        else:
            raise HTTPException(status_code=400, detail=f"Geçersiz strateji türü: {strategy_type}")
        
        # Mock backtest results
        backtest_results = {
            "strategy_name": strategy.name,
            "symbols": symbols,
            "period": f"{start_date} to {end_date}",
            "initial_capital": initial_capital,
            "final_capital": initial_capital * 1.15,  # Mock %15 return
            "total_return": 0.15,
            "annualized_return": 0.15,
            "volatility": 0.12,
            "sharpe_ratio": 1.25,
            "max_drawdown": 0.05,
            "win_rate": 0.65,
            "total_trades": 150,
            "profit_factor": 1.8
        }
        
        return {
            "success": True,
            "backtest_results": backtest_results,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Strategy backtest hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- US Aggressive Profile Endpoints ---
@app.post("/strategies/apply-us-aggressive")
async def apply_us_aggressive_profile():
    """US Agresif profilini uygula ve HFT stratejisini tanımla"""
    try:
        profile = US_AGGRESSIVE_PROFILE
        symbols = profile.get("symbols", ["SPY", "QQQ"])  # güvenlik

        # Basit: tek bir HFT stratejisi oluştur ve ekle (varsa isim çakışmasından kaçın)
        hft = HFTStrategy(symbols)
        strategy_manager.add_strategy(hft)

        return {
            "success": True,
            "message": "US Aggressive profile applied and HFT strategy added",
            "strategy_name": hft.name,
            "symbols": symbols,
            "risk": profile.get("risk", {}),
            "bracket": profile.get("bracket", {}),
            "filters": profile.get("filters", {}),
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"US Aggressive apply hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

async def _fetch_history_async(symbol: str, period: str, interval: str):
    import yfinance as yf
    import pandas as pd
    loop = asyncio.get_running_loop()
    def _fetch():
        return yf.Ticker(symbol).history(period=period, interval=interval)
    return await loop.run_in_executor(None, _fetch)

async def _scan_patterns_async(df, symbol: str):
    from analysis.pattern_detection import TechnicalPatternEngine
    engine = TechnicalPatternEngine()
    loop = asyncio.get_running_loop()
    def _scan():
        return engine.scan_all_patterns(df, symbol)
    return await loop.run_in_executor(None, _scan)

# ============================================================================
# BROKER PAPER TRADING ENDPOINTS
# ============================================================================

@app.get("/broker/portfolio")
async def get_broker_portfolio():
    """Broker portföy özetini al"""
    if not broker_paper:
        raise HTTPException(status_code=503, detail="Broker Paper Trading yüklenemedi")
    
    try:
        summary = broker_paper.get_portfolio_summary()
        return {
            "success": True,
            "portfolio": summary
        }
    except Exception as e:
        logger.error(f"Broker portfolio hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/broker/positions")
async def get_broker_positions():
    """Broker pozisyonlarını al"""
    if not broker_paper:
        raise HTTPException(status_code=503, detail="Broker Paper Trading yüklenemedi")
    
    try:
        positions = broker_paper.get_positions()
        return {
            "success": True,
            "positions": positions,
            "count": len(positions)
        }
    except Exception as e:
        logger.error(f"Broker positions hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/broker/trades")
async def get_broker_trades(limit: int = 50):
    """Broker işlemlerini al"""
    if not broker_paper:
        raise HTTPException(status_code=503, detail="Broker Paper Trading yüklenemedi")
    
    try:
        trades = broker_paper.get_trades(limit)
        return {
            "success": True,
            "trades": trades,
            "count": len(trades)
        }
    except Exception as e:
        logger.error(f"Broker trades hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/broker/order")
async def place_broker_order(
    symbol: str,
    side: str,
    quantity: Optional[float] = None,
    price: Optional[float] = None,
    stop_loss: Optional[float] = None,
    take_profit: Optional[float] = None,
    confidence: float = 1.0
):
    """Broker emri ver"""
    if not broker_paper:
        raise HTTPException(status_code=503, detail="Broker Paper Trading yüklenemedi")
    
    try:
        from broker_paper_trading import OrderSide
        
        # Side validation
        if side.upper() not in ["BUY", "SELL"]:
            raise HTTPException(status_code=400, detail="Side must be BUY or SELL")
        
        order_side = OrderSide.BUY if side.upper() == "BUY" else OrderSide.SELL
        
        # Emir ver
        order_id = broker_paper.place_order(
            symbol=symbol,
            side=order_side,
            quantity=quantity,
            price=price,
            stop_loss=stop_loss,
            take_profit=take_profit,
            confidence=confidence
        )
        
        if not order_id:
            raise HTTPException(status_code=400, detail="Emir verilemedi")
        
        return {
            "success": True,
            "order_id": order_id,
            "message": f"{symbol} {side} emri verildi",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Broker order hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/broker/reset-circuit-breaker")
async def reset_broker_circuit_breaker():
    """Broker circuit breaker'ı sıfırla"""
    if not broker_paper:
        raise HTTPException(status_code=503, detail="Broker Paper Trading yüklenemedi")
    
    try:
        broker_paper.reset_circuit_breaker()
        return {
            "success": True,
            "message": "Circuit breaker sıfırlandı",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Broker circuit breaker reset hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/broker/save-state")
async def save_broker_state():
    """Broker durumunu kaydet"""
    if not broker_paper:
        raise HTTPException(status_code=503, detail="Broker Paper Trading yüklenemedi")
    
    try:
        broker_paper.save_state()
        return {
            "success": True,
            "message": "Broker durumu kaydedildi",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Broker save state hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# MARKET REGIME DETECTION ENDPOINTS
# ============================================================================

@app.get("/market-regime/current")
async def get_current_market_regime():
    """Güncel piyasa rejimini al"""
    if not market_regime_detector:
        raise HTTPException(status_code=503, detail="Market Regime Detector yüklenemedi")
    
    try:
        regime_signal = market_regime_detector.get_regime_signal()
        return {
            "success": True,
            "regime": regime_signal.regime.value,
            "confidence": regime_signal.confidence,
            "risk_multiplier": regime_signal.risk_multiplier,
            "recommendation": regime_signal.recommendation,
            "indicators": regime_signal.indicators,
            "timestamp": regime_signal.timestamp.isoformat()
        }
    except Exception as e:
        logger.error(f"Market regime hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/market-regime/history")
async def get_market_regime_history(days: int = 7):
    """Piyasa rejimi geçmişini al"""
    if not market_regime_detector:
        raise HTTPException(status_code=503, detail="Market Regime Detector yüklenemedi")
    
    try:
        history = market_regime_detector.get_regime_history(days)
        return {
            "success": True,
            "history": [
                {
                    "regime": signal.regime.value,
                    "confidence": signal.confidence,
                    "risk_multiplier": signal.risk_multiplier,
                    "recommendation": signal.recommendation,
                    "timestamp": signal.timestamp.isoformat()
                }
                for signal in history
            ],
            "count": len(history)
        }
    except Exception as e:
        logger.error(f"Market regime history hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/market-regime/summary")
async def get_market_regime_summary():
    """Piyasa rejimi özetini al"""
    if not market_regime_detector:
        raise HTTPException(status_code=503, detail="Market Regime Detector yüklenemedi")
    
    try:
        summary = market_regime_detector.get_regime_summary()
        return {
            "success": True,
            "summary": summary
        }
    except Exception as e:
        logger.error(f"Market regime summary hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/us-aggressive/test")
async def test_us_aggressive():
    """US Aggressive test endpoint"""
    return {
        "success": True,
        "message": "US Aggressive test endpoint çalışıyor",
        "manager_loaded": us_aggressive_manager is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/test/signals")
async def test_signals():
    """Test endpoint to verify snapshot loading"""
    try:
        import os, json
        snap_path = os.path.join('data', 'forecast_signals.json')
        if os.path.exists(snap_path):
            with open(snap_path, 'r') as f:
                raw = f.read()
            last_brace = raw.rfind('}')
            if last_brace != -1:
                raw_clean = raw[:last_brace+1]
            else:
                raw_clean = raw.strip().rstrip('%')
            snap = json.loads(raw_clean)
            signals = snap.get('signals', [])
            return {
                "success": True,
                "total_signals": len(signals),
                "sample": signals[:3] if signals else [],
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "success": False,
                "error": "Snapshot file not found",
                "path": snap_path
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.post("/us-aggressive/start-session")
async def start_us_aggressive_session():
    """US Aggressive seansını başlat ($100 -> $1000 hedefi)"""
    if not us_aggressive_manager:
        raise HTTPException(status_code=503, detail="US Aggressive Session Manager yüklenemedi")
    
    try:
        us_aggressive_manager.start_session_monitoring()
        return {
            "success": True,
            "message": "US Aggressive seansı başlatıldı",
            "target": "$100 -> $1000",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"US Aggressive seans başlatma hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/us-aggressive/stop-session")
async def stop_us_aggressive_session():
    """US Aggressive seansını durdur"""
    if not us_aggressive_manager:
        raise HTTPException(status_code=503, detail="US Aggressive Session Manager yüklenemedi")
    
    try:
        us_aggressive_manager.stop_session_monitoring()
        return {
            "success": True,
            "message": "US Aggressive seansı durduruldu",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"US Aggressive seans durdurma hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/us-aggressive/status")
async def get_us_aggressive_status():
    """US Aggressive seans durumu"""
    if not us_aggressive_manager:
        raise HTTPException(status_code=503, detail="US Aggressive Session Manager yüklenemedi")
    
    try:
        status = us_aggressive_manager.get_session_status()
        return {
            "success": True,
            "status": status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"US Aggressive durum hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/us-aggressive/reset-circuit-breaker")
async def reset_us_aggressive_circuit_breaker():
    """Devre kesiciyi sıfırla"""
    if not us_aggressive_manager:
        raise HTTPException(status_code=503, detail="US Aggressive Session Manager yüklenemedi")
    
    try:
        us_aggressive_manager.reset_circuit_breaker()
        return {
            "success": True,
            "message": "Devre kesici sıfırlandı",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Devre kesici sıfırlama hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/us-aggressive/record-trade")
async def record_us_aggressive_trade(
    symbol: str,
    side: str,
    quantity: float,
    price: float,
    pnl: float
):
    """US Aggressive işlem kaydı"""
    if not us_aggressive_manager:
        raise HTTPException(status_code=503, detail="US Aggressive Session Manager yüklenemedi")
    
    try:
        us_aggressive_manager.record_trade(symbol, side, quantity, price, pnl)
        return {
            "success": True,
            "message": f"İşlem kaydedildi: {symbol} {side} {quantity}@{price:.2f} PnL: ${pnl:.2f}",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"İşlem kaydetme hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/us-aggressive/can-trade")
async def can_us_aggressive_trade():
    """US Aggressive işlem yapılabilir mi kontrol et"""
    if not us_aggressive_manager:
        raise HTTPException(status_code=503, detail="US Aggressive Session Manager yüklenemedi")
    
    try:
        can_trade, reason = us_aggressive_manager.can_trade()
        return {
            "success": True,
            "can_trade": can_trade,
            "reason": reason,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"İşlem kontrol hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/us-aggressive/signals")
async def get_us_aggressive_signals():
    """US Aggressive için özel sinyaller"""
    try:
        # US Aggressive için özel sinyal üretimi
        us_symbols = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "META", "NFLX", "AMD", "INTC"]
        
        signals = []
        for symbol in us_symbols:
            try:
                # Basit momentum sinyali (demo)
                import yfinance as yf
                stock = yf.Ticker(symbol)
                hist = stock.history(period="5d", interval="1h")
                
                if not hist.empty:
                    # RSI hesapla
                    delta = hist['Close'].diff()
                    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
                    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
                    rs = gain / loss
                    rsi = 100 - (100 / (1 + rs))
                    
                    current_rsi = rsi.iloc[-1]
                    current_price = hist['Close'].iloc[-1]
                    
                    # Agresif sinyal üretimi
                    if current_rsi < 30:  # Oversold
                        signals.append({
                            "symbol": symbol,
                            "action": "BUY",
                            "confidence": 0.85,
                            "price": current_price,
                            "reason": f"RSI oversold: {current_rsi:.1f}",
                            "target": current_price * 1.05,  # %5 hedef
                            "stop_loss": current_price * 0.95,  # %5 stop
                            "timeframe": "H1",
                            "timestamp": datetime.now().isoformat()
                        })
                    elif current_rsi > 70:  # Overbought
                        signals.append({
                            "symbol": symbol,
                            "action": "SELL",
                            "confidence": 0.80,
                            "price": current_price,
                            "reason": f"RSI overbought: {current_rsi:.1f}",
                            "target": current_price * 0.95,  # %5 hedef
                            "stop_loss": current_price * 1.05,  # %5 stop
                            "timeframe": "H1",
                            "timestamp": datetime.now().isoformat()
                        })
            except Exception as e:
                logger.warning(f"US Aggressive sinyal hatası ({symbol}): {e}")
                continue
        
        return {
            "success": True,
            "count": len(signals),
            "signals": signals,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"US Aggressive sinyal hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Development server
    uvicorn.run(
        "fastapi_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
