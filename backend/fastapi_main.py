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
from typing import Dict, List, Optional
import logging
from datetime import datetime, timedelta
import asyncio
import json
import time
from monitoring.metrics import track_request, track_prediction, track_error, get_metrics
from prometheus_client import CONTENT_TYPE_LATEST
from middleware.rate_limiter import APIRateLimitMiddleware
from core.cache import initialize_cache, close_cache, cache_manager, cached_ops, cache_result
from core.database import initialize_database, close_database, db_manager
import pandas as pd
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
    from macro_regime_detector import MacroRegimeDetector
    from auto_backtest_walkforward import AutoBacktestWalkForward
    from bist_performance_tracker import BISTPerformanceTracker
    from accuracy_optimizer import AccuracyOptimizer
    from firestore_schema import FirestoreSchema
    from config import config
    from bist100_scanner import BIST100Scanner
    
    # PRD v2.0 Yeni Modüller (OPTIMIZED)
    from live_price_layer import LivePriceLayer
    from mcdm_ranking import OptimizedMCDMRanking as MCDMRanking
    
except ImportError as e:
    print(f"⚠️ Import hatası: {e}")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="BIST AI Smart Trader API",
    description="PRD v2.0 - Yapay zekâ destekli yatırım danışmanı",
    version="2.0.0"
)
# Static ve Templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


# Rate limiting middleware
app.add_middleware(APIRateLimitMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8001", "http://localhost:3000", "https://localhost"],  # Restrict origins
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Restrict methods
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
        
        # WebSocket connector (demo mode)
        websocket_connector = RealTimeDataPipeline(
            finnhub_api_key="demo"
        )
        
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

if __name__ == "__main__":
    # Development server
    uvicorn.run(
        "fastapi_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
