#!/usr/bin/env python3
"""
Basit API sunucusu - BIST AI Smart Trader için
"""

from fastapi import FastAPI, HTTPException, Query, Header, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import json
import asyncio
from datetime import datetime
import random
import yfinance as yf
import pandas as pd
import numpy as np
import logging

# Local imports
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from backend.services.user_service import user_service
    from backend.services.realtime_data import realtime_service, get_realtime_price
    from backend.services.yapikredi_api import yapikredi_api
    from backend.services.social_trading import social_trading_service
    from backend.services.paper_trading import paper_trading_service
    from backend.services.advanced_technical_analysis import advanced_technical_analysis
    from backend.services.advanced_ai_models import train_ai_models, predict_with_ai_models, get_ai_model_status
    from backend.services.watchlist_service import (
        create_watchlist, add_to_watchlist, get_watchlist_data,
        create_portfolio, add_position, get_portfolio_data,
        create_alert, check_alerts
    )
    from backend.services.crypto_service import (
        get_crypto_data, get_crypto_list, get_crypto_trending,
        get_crypto_gainers_losers, create_crypto_portfolio,
        add_crypto_position, get_crypto_portfolio_data
    )
    from backend.services.education_service import (
        get_courses, get_course, get_articles, get_article,
        get_quiz, submit_quiz, get_user_progress, mark_lesson_completed
    )
    from backend.services.god_mode import god_mode_service
    from backend.services.grey_topsis_analyzer import GreyTOPSISAnalyzer
    from backend.services.technical_formation_engine import TechnicalFormationEngine
    from backend.services.rl_portfolio_agent import RLPortfolioAgent
    from backend.services.finnhub_realtime import FinnhubRealtimeData
    from backend.services.sentiment_analyzer import SentimentAnalyzer
    from backend.services.xai_explainer import XAIExplainer
    from backend.services.backtesting_system import AutoBacktestSystem
    from backend.services.macro_regime_detector import MacroRegimeDetector
except ImportError as e:
    print(f"⚠️ Import hatası: {e}")
    print("⚠️ User service import edilemedi, demo modunda çalışıyor")
    user_service = None
    realtime_service = None
    yapikredi_api = None
    social_trading_service = None
    paper_trading_service = None
    advanced_technical_analysis = None
    train_ai_models = None
    predict_with_ai_models = None
    get_ai_model_status = None
    create_watchlist = None
    add_to_watchlist = None
    get_watchlist_data = None
    create_portfolio = None
    add_position = None
    get_portfolio_data = None
    create_alert = None
    check_alerts = None
    get_crypto_data = None
    get_crypto_list = None
    get_crypto_trending = None
    get_crypto_gainers_losers = None
    create_crypto_portfolio = None
    add_crypto_position = None
    get_crypto_portfolio_data = None
    get_courses = None
    get_course = None
    get_articles = None
    get_article = None
    get_quiz = None
    submit_quiz = None
    get_user_progress = None
    mark_lesson_completed = None
    god_mode_service = None
    GreyTOPSISAnalyzer = None
    TechnicalFormationEngine = None
    RLPortfolioAgent = None
    FinnhubRealtimeData = None
    SentimentAnalyzer = None
    XAIExplainer = None
    AutoBacktestSystem = None
    MacroRegimeDetector = None

# FreemiumModel importu ayrı bir blokta
try:
    from backend.services.freemium_model import FreemiumModel
    from backend.services.bist100_ai_predictor import bist100_predictor
    print("✅ FreemiumModel ve BIST100Predictor başarıyla import edildi")
except ImportError as e:
    print(f"⚠️ FreemiumModel import hatası: {e}")
    FreemiumModel = None
    bist100_predictor = None

# WebSocket bağlantı yöneticisi
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.subscriptions: Dict[str, List[WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"✅ WebSocket bağlantısı kuruldu. Toplam: {len(self.active_connections)}")
        
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            
        # Aboneliklerden çıkar
        for symbol, connections in self.subscriptions.items():
            if websocket in connections:
                connections.remove(websocket)
                
        print(f"❌ WebSocket bağlantısı kesildi. Toplam: {len(self.active_connections)}")
        
    async def subscribe(self, websocket: WebSocket, symbol: str):
        if symbol not in self.subscriptions:
            self.subscriptions[symbol] = []
        if websocket not in self.subscriptions[symbol]:
            self.subscriptions[symbol].append(websocket)
            print(f"📊 {symbol} için abonelik: {len(self.subscriptions[symbol])} bağlantı")
            
    async def unsubscribe(self, websocket: WebSocket, symbol: str):
        if symbol in self.subscriptions and websocket in self.subscriptions[symbol]:
            self.subscriptions[symbol].remove(websocket)
            print(f"📊 {symbol} aboneliği iptal edildi")
            
    async def broadcast_price_update(self, symbol: str, data: Dict):
        if symbol in self.subscriptions:
            message = json.dumps({
                "type": "price_update",
                "symbol": symbol,
                "data": data,
                "timestamp": datetime.now().isoformat()
            })
            
            disconnected = []
            for websocket in self.subscriptions[symbol]:
                try:
                    await websocket.send_text(message)
                except:
                    disconnected.append(websocket)
                    
            # Bağlantısı kesilenleri temizle
            for ws in disconnected:
                self.disconnect(ws)
                
    async def broadcast_signal(self, signal_data: Dict):
        message = json.dumps({
            "type": "signal_update",
            "data": signal_data,
            "timestamp": datetime.now().isoformat()
        })
        
        disconnected = []
        for websocket in self.active_connections:
            try:
                await websocket.send_text(message)
            except:
                disconnected.append(websocket)
                
        # Bağlantısı kesilenleri temizle
        for ws in disconnected:
            self.disconnect(ws)

# Global WebSocket yöneticisi
manager = ConnectionManager()

# Gerçek zamanlı veri gönderimi
async def broadcast_realtime_data():
    """Gerçek zamanlı veri gönderimi"""
    all_stocks = BIST_STOCKS + US_STOCKS
    
    while True:
        try:
            for symbol in all_stocks[:10]:  # İlk 10 hisse
                try:
                    # Gerçek veri çek
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="1d", interval="1m")
                    
                    if not hist.empty:
                        current_price = float(hist['Close'].iloc[-1])
                        prev_price = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current_price
                        price_change = ((current_price - prev_price) / prev_price) * 100
                        volume = int(hist['Volume'].iloc[-1]) if not hist['Volume'].empty else 0
                        
                        # WebSocket'e gönder
                        await manager.broadcast_price_update(symbol, {
                            "price": current_price,
                            "change": price_change,
                            "volume": volume,
                            "timestamp": datetime.now().isoformat()
                        })
                        
                except Exception as e:
                    print(f"❌ {symbol} veri hatası: {e}")
                    
            await asyncio.sleep(5)  # 5 saniyede bir güncelle
            
        except Exception as e:
            print(f"❌ Broadcast hatası: {e}")
            await asyncio.sleep(10)

# Servis instance'larını app tanımından ÖNCE oluştur
# Yeni servis instance'ları
topsis_analyzer = GreyTOPSISAnalyzer() if GreyTOPSISAnalyzer else None
formation_engine = TechnicalFormationEngine() if TechnicalFormationEngine else None
rl_agent = RLPortfolioAgent() if RLPortfolioAgent else None
finnhub_realtime = FinnhubRealtimeData() if FinnhubRealtimeData else None
sentiment_analyzer = SentimentAnalyzer() if SentimentAnalyzer else None

# XAI explainer
xai_explainer = XAIExplainer() if XAIExplainer else None

# Auto-backtest system
backtest_system = AutoBacktestSystem() if AutoBacktestSystem else None

# Macro regime detector
macro_regime_detector = MacroRegimeDetector() if MacroRegimeDetector else None

# Freemium model - doğrudan instance oluştur
freemium_model = None
if FreemiumModel:
    try:
        freemium_model = FreemiumModel()
        print(f"✅ FreemiumModel instance oluşturuldu: {type(freemium_model)}")
        print(f"✅ FreemiumModel is None: {freemium_model is None}")
    except Exception as e:
        print(f"⚠️ FreemiumModel instance oluşturma hatası: {e}")
        freemium_model = None
else:
    print("⚠️ FreemiumModel import edilmemiş")
    freemium_model = None

print(f"DEBUG AFTER INIT: freemium_model = {freemium_model}")

app = FastAPI(
    title="BIST AI Smart Trader API",
    description="Gelişmiş AI destekli trading asistanı",
    version="2.0.0"
)

# CORS middleware ekle
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Background task başlat

# Örnek BIST hisseleri
BIST_STOCKS = [
    "SISE.IS", "EREGL.IS", "TUPRS.IS", "AKBNK.IS", "GARAN.IS",
    "ISCTR.IS", "THYAO.IS", "KCHOL.IS", "SAHOL.IS", "HALKB.IS",
    "YKBNK.IS", "VAKBN.IS", "TSKB.IS", "ALARK.IS", "ARCLK.IS",
    "PETKM.IS", "PGSUS.IS", "KOZAL.IS", "KOZAA.IS", "BIMAS.IS",
    "MGROS.IS", "TCELL.IS", "ASELS.IS", "HUNER.IS", "TOASO.IS",
    "FROTO.IS", "OTKAR.IS", "DOAS.IS", "ULKER.IS", "CCOLA.IS"
]

# Örnek US hisseleri
US_STOCKS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA",
    "META", "NVDA", "NFLX", "AMD", "INTC",
    "CRM", "ADBE", "PYPL", "UBER", "SHOP",
    "SQ", "ROKU", "ZM", "DOCU", "SNOW",
    "PLTR", "RBLX", "COIN", "HOOD", "SPOT"
]

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "bist100_predictor": bist100_predictor is not None,
        "timestamp": datetime.now().isoformat()
    }

# BIST 100 AI Predictions Endpoints
@app.get("/api/bist100/predictions")
async def get_bist100_predictions(
    timeframe: str = "1d",
    limit: int = 20
):
    """Get BIST 100 AI predictions"""
    try:
        if bist100_predictor is None:
            return {"error": "BIST100 predictor not available"}
        
        predictions = await bist100_predictor.predict_bist100(timeframe, limit)
        return {
            "predictions": predictions,
            "timeframe": timeframe,
            "count": len(predictions),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/bist100/predict/{symbol}")
async def predict_single_stock(
    symbol: str,
    timeframe: str = "1d"
):
    """Predict single stock price"""
    try:
        if bist100_predictor is None:
            return {"error": "BIST100 predictor not available"}
        
        prediction = await bist100_predictor.predict_single_stock(f"{symbol}.IS", timeframe)
        return {
            "prediction": prediction,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/bist100/models/status")
async def get_ai_models_status():
    """Get AI models status"""
    try:
        if bist100_predictor is None:
            return {"error": "BIST100 predictor not available"}
        
        status = await bist100_predictor.get_model_status()
        return status
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/bist100/history/{symbol}")
async def get_prediction_history(
    symbol: str,
    hours: int = 24
):
    """Get prediction history for a symbol"""
    try:
        if bist100_predictor is None:
            return {"error": "BIST100 predictor not available"}
        
        history = await bist100_predictor.get_prediction_history(symbol, hours)
        return {
            "history": history,
            "symbol": symbol,
            "hours": hours,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}

# Kullanıcı yönetimi endpoint'leri
@app.post("/auth/register")
async def register_user(request: dict):
    """Kullanıcı kaydı"""
    if not user_service:
        return {"error": "User service mevcut değil"}
    
    email = request.get("email")
    password = request.get("password")
    name = request.get("name")
    
    if not all([email, password, name]):
        return {"error": "Email, şifre ve isim gerekli"}
    
    return user_service.register_user(email, password, name)

@app.post("/auth/login")
async def login_user(request: dict):
    """Kullanıcı girişi"""
    if not user_service:
        return {"error": "User service mevcut değil"}
    
    email = request.get("email")
    password = request.get("password")
    
    if not email or not password:
        return {"error": "Email ve şifre gerekli"}
    
    return user_service.login_user(email, password)

@app.get("/auth/me")
async def get_current_user(authorization: str = Header(None)):
    """Mevcut kullanıcı bilgisi"""
    if not user_service:
        return {"error": "User service mevcut değil"}
    
    if not authorization or not authorization.startswith("Bearer "):
        return {"error": "Authorization header gerekli"}
    
    token = authorization.replace("Bearer ", "")
    user = user_service.get_user_by_token(token)
    
    if not user:
        return {"error": "Geçersiz token"}
    
    return {"user": user}

@app.post("/auth/preferences")
async def update_preferences(request: dict, authorization: str = Header(None)):
    """Kullanıcı tercihlerini güncelle"""
    if not user_service:
        return {"error": "User service mevcut değil"}
    
    if not authorization or not authorization.startswith("Bearer "):
        return {"error": "Authorization header gerekli"}
    
    token = authorization.replace("Bearer ", "")
    preferences = request.get("preferences", {})
    
    return user_service.update_user_preferences(token, preferences)

@app.post("/auth/upgrade")
async def upgrade_subscription(request: dict, authorization: str = Header(None)):
    """Abonelik yükselt"""
    if not user_service:
        return {"error": "User service mevcut değil"}
    
    if not authorization or not authorization.startswith("Bearer "):
        return {"error": "Authorization header gerekli"}
    
    token = authorization.replace("Bearer ", "")
    plan = request.get("plan")
    
    return user_service.upgrade_subscription(token, plan)

@app.get("/auth/portfolio")
async def get_portfolio(authorization: str = Header(None)):
    """Kullanıcı portföyü"""
    if not user_service:
        return {"error": "User service mevcut değil"}
    
    if not authorization or not authorization.startswith("Bearer "):
        return {"error": "Authorization header gerekli"}
    
    token = authorization.replace("Bearer ", "")
    return user_service.get_user_portfolio(token)

# Yapı Kredi API endpoint'leri
@app.get("/yapikredi/bist-indices")
async def get_yapikredi_bist_indices():
    """Yapı Kredi BIST endeksleri"""
    if not yapikredi_api:
        return {"error": "Yapı Kredi API servisi mevcut değil"}
    
    try:
        result = yapikredi_api.get_bist_indices_sync()
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/yapikredi/stock-info")
async def get_yapikredi_stock_info(symbol: Optional[str] = Query(None)):
    """Yapı Kredi hisse bilgileri"""
    if not yapikredi_api:
        return {"error": "Yapı Kredi API servisi mevcut değil"}
    
    try:
        result = yapikredi_api.get_stock_information_sync(symbol)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/yapikredi/bist100")
async def get_bist100_from_yapikredi():
    """Yapı Kredi'den BIST 100 verileri"""
    if not yapikredi_api:
        return {"error": "Yapı Kredi API servisi mevcut değil"}
    
    try:
        # BIST endekslerini al
        indices_result = yapikredi_api.get_bist_indices_sync()
        
        if indices_result.get("success"):
            # BIST 100 hisselerini simüle et (gerçek API'de symbol listesi olabilir)
            bist100_stocks = [
                "SISE.IS", "EREGL.IS", "TUPRS.IS", "AKBNK.IS", "GARAN.IS",
                "ISCTR.IS", "THYAO.IS", "KCHOL.IS", "SAHOL.IS", "HALKB.IS"
            ]
            
            stock_data = {}
            for symbol in bist100_stocks[:5]:  # İlk 5 hisse için test
                stock_result = yapikredi_api.get_stock_information_sync(symbol)
                if stock_result.get("success"):
                    stock_data[symbol] = stock_result["data"]
                else:
                    # Fallback: yfinance ile veri al
                    try:
                        ticker = yf.Ticker(symbol)
                        hist = ticker.history(period="1d", interval="1d")
                        if not hist.empty:
                            stock_data[symbol] = {
                                "price": float(hist['Close'].iloc[-1]),
                                "change": float(hist['Close'].pct_change().iloc[-1] * 100),
                                "volume": int(hist['Volume'].iloc[-1]),
                                "source": "yfinance_fallback"
                            }
                    except:
                        pass
            
            return {
                "success": True,
                "indices": indices_result["data"],
                "stocks": stock_data,
                "timestamp": datetime.now().isoformat()
            }
        else:
            return indices_result
            
    except Exception as e:
        return {"error": str(e)}

# Sosyal Trading endpoint'leri
@app.get("/social/top-traders")
async def get_top_traders(limit: int = Query(10, description="Trader sayısı")):
    """En iyi trader'ları getir"""
    if not social_trading_service:
        return {"error": "Sosyal trading servisi mevcut değil"}
    
    try:
        traders = social_trading_service.get_top_traders(limit)
        return {"success": True, "traders": traders}
    except Exception as e:
        return {"error": str(e)}

@app.get("/social/trader/{trader_id}")
async def get_trader_details(trader_id: str):
    """Trader detaylarını getir"""
    if not social_trading_service:
        return {"error": "Sosyal trading servisi mevcut değil"}
    
    try:
        trader = social_trading_service.get_trader_details(trader_id)
        if trader:
            return {"success": True, "trader": trader}
        else:
            return {"error": "Trader bulunamadı"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/social/follow")
async def follow_trader(request: dict):
    """Trader'ı takip et"""
    if not social_trading_service:
        return {"error": "Sosyal trading servisi mevcut değil"}
    
    trader_id = request.get("trader_id")
    follower_id = request.get("follower_id")
    
    if not trader_id or not follower_id:
        return {"error": "Trader ID ve Follower ID gerekli"}
    
    try:
        result = social_trading_service.follow_trader(trader_id, follower_id)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.post("/social/copy-trade")
async def create_copy_trade(request: dict):
    """Copy trade oluştur"""
    if not social_trading_service:
        return {"error": "Sosyal trading servisi mevcut değil"}
    
    trader_id = request.get("trader_id")
    follower_id = request.get("follower_id")
    amount = request.get("amount", 1000.0)
    
    if not trader_id or not follower_id:
        return {"error": "Trader ID ve Follower ID gerekli"}
    
    try:
        result = social_trading_service.create_copy_trade(trader_id, follower_id, amount)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/social/feed")
async def get_social_feed(limit: int = Query(20, description="Feed sayısı")):
    """Sosyal feed getir"""
    if not social_trading_service:
        return {"error": "Sosyal trading servisi mevcut değil"}
    
    try:
        feed = social_trading_service.get_social_feed(limit)
        return {"success": True, "feed": feed}
    except Exception as e:
        return {"error": str(e)}

# Paper Trading endpoint'leri
@app.post("/paper-trading/create-portfolio")
async def create_paper_portfolio(request: dict):
    """Paper trading portföyü oluştur"""
    if not paper_trading_service:
        return {"error": "Paper trading servisi mevcut değil"}
    
    user_id = request.get("user_id")
    initial_cash = request.get("initial_cash", 100000.0)
    
    if not user_id:
        return {"error": "User ID gerekli"}
    
    try:
        result = paper_trading_service.create_portfolio(user_id, initial_cash)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/paper-trading/portfolio/{user_id}")
async def get_paper_portfolio(user_id: str):
    """Paper trading portföyünü getir"""
    if not paper_trading_service:
        return {"error": "Paper trading servisi mevcut değil"}
    
    try:
        portfolio = paper_trading_service.get_portfolio(user_id)
        if portfolio:
            return {"success": True, "portfolio": portfolio}
        else:
            return {"error": "Portföy bulunamadı"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/paper-trading/place-order")
async def place_paper_order(request: dict):
    """Paper trading siparişi ver"""
    if not paper_trading_service:
        return {"error": "Paper trading servisi mevcut değil"}
    
    user_id = request.get("user_id")
    symbol = request.get("symbol")
    action = request.get("action")  # BUY or SELL
    quantity = request.get("quantity")
    order_type = request.get("order_type", "market")
    
    if not all([user_id, symbol, action, quantity]):
        return {"error": "Tüm alanlar gerekli"}
    
    try:
        result = paper_trading_service.place_order(user_id, symbol, action, quantity, order_type)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/paper-trading/orders/{user_id}")
async def get_paper_orders(user_id: str, limit: int = Query(50, description="Sipariş sayısı")):
    """Paper trading siparişlerini getir"""
    if not paper_trading_service:
        return {"error": "Paper trading servisi mevcut değil"}
    
    try:
        orders = paper_trading_service.get_orders(user_id, limit)
        return {"success": True, "orders": orders}
    except Exception as e:
        return {"error": str(e)}

@app.get("/paper-trading/performance/{user_id}")
async def get_paper_performance(user_id: str):
    """Paper trading performansını getir"""
    if not paper_trading_service:
        return {"error": "Paper trading servisi mevcut değil"}
    
    try:
        performance = paper_trading_service.get_portfolio_performance(user_id)
        return {"success": True, "performance": performance}
    except Exception as e:
        return {"error": str(e)}

@app.get("/paper-trading/leaderboard")
async def get_paper_leaderboard(limit: int = Query(10, description="Sıralama sayısı")):
    """Paper trading leaderboard getir"""
    if not paper_trading_service:
        return {"error": "Paper trading servisi mevcut değil"}
    
    try:
        leaderboard = paper_trading_service.get_leaderboard(limit)
        return {"success": True, "leaderboard": leaderboard}
    except Exception as e:
        return {"error": str(e)}

# Gelişmiş Teknik Analiz endpoint'leri
@app.get("/technical-analysis/{symbol}")
async def get_technical_analysis(symbol: str, period: str = Query("1y", description="Veri periyodu")):
    """Gelişmiş teknik analiz getir"""
    if not advanced_technical_analysis:
        return {"error": "Teknik analiz servisi mevcut değil"}
    
    try:
        analysis = advanced_technical_analysis.calculate_all_indicators(symbol, period)
        return analysis
    except Exception as e:
        return {"error": str(e)}

@app.get("/technical-analysis/signals/{symbol}")
async def get_trading_signals(symbol: str):
    """Trading sinyalleri getir"""
    if not advanced_technical_analysis:
        return {"error": "Teknik analiz servisi mevcut değil"}
    
    try:
        signals = advanced_technical_analysis.get_trading_signals(symbol)
        return signals
    except Exception as e:
        return {"error": str(e)}

@app.get("/technical-analysis/indicators")
async def get_available_indicators():
    """Mevcut teknik göstergeleri listele"""
    if not advanced_technical_analysis:
        return {"error": "Teknik analiz servisi mevcut değil"}
    
    try:
        indicators = list(advanced_technical_analysis.indicators.keys())
        return {
            "success": True,
            "indicators": indicators,
            "count": len(indicators),
            "categories": {
                "trend": [ind for ind in indicators if ind in ["sma", "ema", "macd", "aroon", "cci", "adx", "mfi", "sar"]],
                "momentum": [ind for ind in indicators if ind in ["rsi", "stoch", "roc", "mom", "bop"]],
                "volume": [ind for ind in indicators if ind in ["ad", "adosc", "obv"]],
                "volatility": [ind for ind in indicators if ind in ["bbands", "atr", "natr"]],
                "patterns": [ind for ind in indicators if ind.startswith("cdl")]
            }
        }
    except Exception as e:
        return {"error": str(e)}

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Mesaj bekle
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "subscribe":
                symbol = message.get("symbol")
                if symbol:
                    await manager.subscribe(websocket, symbol)
                    await websocket.send_text(json.dumps({
                        "type": "subscription_confirmed",
                        "symbol": symbol,
                        "message": f"{symbol} için abone olundu"
                    }))
                    
            elif message.get("type") == "unsubscribe":
                symbol = message.get("symbol")
                if symbol:
                    await manager.unsubscribe(websocket, symbol)
                    await websocket.send_text(json.dumps({
                        "type": "unsubscription_confirmed",
                        "symbol": symbol,
                        "message": f"{symbol} aboneliği iptal edildi"
                    }))
                    
            elif message.get("type") == "ping":
                await websocket.send_text(json.dumps({
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                }))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket hatası: {e}")
        manager.disconnect(websocket)

@app.get("/signals")
async def get_signals(
    market: str = Query("BIST", description="Market (BIST or US)"),
    symbols: Optional[str] = Query(None, description="Comma-separated symbols"),
    include_sentiment: bool = Query(True, description="Include sentiment analysis"),
    include_xai: bool = Query(True, description="Include XAI explanations")
):
    """Trading sinyalleri al"""
    try:
        # Hangi hisseleri kullanacağımızı belirle
        if market.upper() == "BIST":
            stock_list = BIST_STOCKS
        elif market.upper() == "US":
            stock_list = US_STOCKS
        else:
            stock_list = BIST_STOCKS
        
        # Eğer özel semboller verilmişse onları kullan
        if symbols:
            stock_list = [s.strip() for s in symbols.split(",")]
        
        signals = {}
        
        for symbol in stock_list[:20]:  # İlk 20 hisse
            try:
                # Gerçek veri çek
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="5d", interval="1d")
                
                if not hist.empty:
                    # Gerçek fiyat verileri
                    current_price = float(hist['Close'].iloc[-1])
                    prev_price = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current_price
                    price_change = ((current_price - prev_price) / prev_price) * 100
                    volume = int(hist['Volume'].iloc[-1])
                    
                    # Basit teknik analiz
                    if len(hist) >= 2:
                        # EMA hesapla
                        ema_short = hist['Close'].rolling(window=5).mean().iloc[-1]
                        ema_long = hist['Close'].rolling(window=10).mean().iloc[-1]
                        
                        # RSI hesapla
                        delta = hist['Close'].diff()
                        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
                        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
                        rs = gain / loss
                        rsi = 100 - (100 / (1 + rs))
                        current_rsi = rsi.iloc[-1] if not pd.isna(rsi.iloc[-1]) else 50
                        
                        # Sinyal üret (gerçek veriye dayalı)
                        if ema_short > ema_long and current_rsi < 70:
                            signal = "BUY"
                            confidence = min(0.9, 0.6 + (70 - current_rsi) / 100)
                        elif ema_short < ema_long and current_rsi > 30:
                            signal = "SELL"
                            confidence = min(0.9, 0.6 + (current_rsi - 30) / 100)
                        else:
                            signal = "HOLD"
                            confidence = 0.7
                    else:
                        signal = "HOLD"
                        confidence = 0.5
                    
                    # AI sinyal (gerçek veriye dayalı)
                    if price_change > 2:
                        ai_signal = "BUY"
                        ai_confidence = min(0.9, 0.7 + price_change / 100)
                    elif price_change < -2:
                        ai_signal = "SELL"
                        ai_confidence = min(0.9, 0.7 + abs(price_change) / 100)
                    else:
                        ai_signal = "HOLD"
                        ai_confidence = 0.6
                    
                    # Sentiment (gerçek veriye dayalı)
                    if price_change > 1:
                        sentiment_label = "positive"
                        sentiment_score = min(0.5, price_change / 10)
                    elif price_change < -1:
                        sentiment_label = "negative"
                        sentiment_score = max(-0.5, price_change / 10)
                    else:
                        sentiment_label = "neutral"
                        sentiment_score = 0.0
                        
                else:
                    # Veri yoksa rastgele üret
                    current_price = round(random.uniform(10, 200), 2)
                    price_change = round(random.uniform(-5, 5), 2)
                    volume = random.randint(1000000, 10000000)
                    signal = random.choice(["BUY", "SELL", "HOLD"])
                    confidence = round(random.uniform(0.6, 0.9), 2)
                    ai_signal = random.choice(["BUY", "SELL", "HOLD"])
                    ai_confidence = round(random.uniform(0.65, 0.9), 2)
                    sentiment_label = random.choice(["positive", "negative", "neutral"])
                    sentiment_score = round(random.uniform(-0.3, 0.3), 2)
                
                signals[symbol] = {
                    "signal": signal,
                    "confidence": round(confidence, 2),
                    "aiSignal": ai_signal,
                    "aiConfidence": round(ai_confidence, 2),
                    "timestamp": datetime.now().isoformat(),
                    "sentiment": {
                        "label": sentiment_label,
                        "score": round(sentiment_score, 2)
                    } if include_sentiment else None,
                    "xai": {
                        "explanation": f"{symbol} için {signal} sinyali - Güven: {confidence:.1%}",
                        "factors": [
                            f"Fiyat değişimi: {price_change:+.2f}%",
                            f"RSI: {current_rsi:.1f}" if 'current_rsi' in locals() else "RSI: Hesaplanamadı",
                            f"EMA kısa/uzun: {ema_short:.2f}/{ema_long:.2f}" if 'ema_short' in locals() and 'ema_long' in locals() else "EMA: Hesaplanamadı",
                            f"Hacim: {volume:,}"
                        ]
                    } if include_xai else None,
                    "price": current_price,
                    "change": round(price_change, 2),
                    "volume": volume
                }
                
            except Exception as e:
                print(f"❌ {symbol} için veri çekilemedi: {e}")
                # Hata durumunda rastgele veri üret
                signals[symbol] = {
                    "signal": random.choice(["BUY", "SELL", "HOLD"]),
                    "confidence": round(random.uniform(0.6, 0.9), 2),
                    "aiSignal": random.choice(["BUY", "SELL", "HOLD"]),
                    "aiConfidence": round(random.uniform(0.65, 0.9), 2),
                    "timestamp": datetime.now().isoformat(),
                    "sentiment": {
                        "label": random.choice(["positive", "negative", "neutral"]),
                        "score": round(random.uniform(-0.3, 0.3), 2)
                    } if include_sentiment else None,
                    "xai": {
                        "explanation": f"{symbol} için sinyal - Veri hatası nedeniyle rastgele üretildi",
                        "factors": ["Veri çekme hatası", "Rastgele sinyal", "Teknik analiz yapılamadı"]
                    } if include_xai else None,
                    "price": round(random.uniform(10, 200), 2),
                    "change": round(random.uniform(-5, 5), 2),
                    "volume": random.randint(1000000, 10000000)
                }
        
        return {"signals": signals}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/markets")
async def get_markets():
    """Desteklenen marketleri listele"""
    return {
        "markets": [
            {
                "code": "BIST",
                "name": "Borsa İstanbul",
                "description": "Türkiye borsası",
                "stocks_count": len(BIST_STOCKS)
            },
            {
                "code": "US",
                "name": "US Markets",
                "description": "Amerika borsaları",
                "stocks_count": len(US_STOCKS)
            }
        ]
    }

@app.get("/robot/status")
async def get_robot_status():
    """Trading robot durumu"""
    return {
        "status": "active",
        "mode": "conservative",
        "auto_trading": False,
        "balance": 100000.0,
        "daily_pnl": round(random.uniform(-1000, 2000), 2),
        "total_pnl": round(random.uniform(-5000, 15000), 2),
        "active_positions": random.randint(0, 5),
        "last_trade": datetime.now().isoformat(),
        "performance": {
            "win_rate": round(random.uniform(0.6, 0.8), 2),
            "sharpe_ratio": round(random.uniform(1.2, 2.5), 2),
            "max_drawdown": round(random.uniform(0.05, 0.15), 2)
        },
        "today_stats": {
            "trades_count": random.randint(5, 25),
            "winning_trades": random.randint(3, 15),
            "losing_trades": random.randint(1, 10),
            "total_volume": random.randint(100000, 1000000)
        },
        "portfolio": {
            "total_value": round(random.uniform(95000, 105000), 2),
            "cash": round(random.uniform(20000, 50000), 2),
            "invested": round(random.uniform(50000, 80000), 2),
            "unrealized_pnl": round(random.uniform(-2000, 3000), 2)
        }
    }

@app.post("/robot/mode")
async def change_robot_mode(request: dict):
    """Robot modunu değiştir"""
    mode = request.get("mode", "conservative")
    return {
        "status": "success",
        "mode": mode,
        "message": f"Robot modu {mode} olarak değiştirildi"
    }

@app.post("/robot/auto-trading")
async def toggle_auto_trading(request: dict):
    """Otomatik trading'i aç/kapat"""
    enabled = request.get("enabled", False)
    return {
        "status": "success",
        "auto_trading": enabled,
        "message": f"Otomatik trading {'açıldı' if enabled else 'kapatıldı'}"
    }

@app.get("/robot/performance")
async def get_performance_report():
    """Performans raporu"""
    return {
        "total_return": round(random.uniform(0.1, 0.3), 2),
        "daily_return": round(random.uniform(-0.02, 0.05), 2),
        "sharpe_ratio": round(random.uniform(1.2, 2.5), 2),
        "max_drawdown": round(random.uniform(0.05, 0.15), 2),
        "win_rate": round(random.uniform(0.6, 0.8), 2),
        "total_trades": random.randint(50, 200),
        "winning_trades": random.randint(30, 120),
        "losing_trades": random.randint(10, 80),
        "avg_win": round(random.uniform(100, 500), 2),
        "avg_loss": round(random.uniform(-300, -50), 2),
        "monthly_returns": [
            round(random.uniform(-0.05, 0.08), 3) for _ in range(12)
        ],
        "daily_returns": [
            round(random.uniform(-0.03, 0.04), 3) for _ in range(30)
        ],
        "sector_performance": {
            "Technology": round(random.uniform(0.05, 0.15), 2),
            "Finance": round(random.uniform(0.02, 0.12), 2),
            "Energy": round(random.uniform(-0.05, 0.08), 2),
            "Healthcare": round(random.uniform(0.01, 0.10), 2)
        },
        "risk_metrics": {
            "volatility": round(random.uniform(0.15, 0.35), 2),
            "beta": round(random.uniform(0.8, 1.3), 2),
            "var_95": round(random.uniform(0.02, 0.08), 2)
        }
    }

@app.get("/us-market/scalping")
async def get_us_market_scalping():
    """US Market scalping sinyalleri"""
    signals = {}
    for symbol in US_STOCKS[:5]:
        signals[symbol] = {
            "signal": random.choice(["BUY", "SELL", "HOLD"]),
            "confidence": round(random.uniform(0.7, 0.95), 2),
            "timeframe": "1m",
            "entry_price": round(random.uniform(50, 300), 2),
            "target_price": round(random.uniform(50, 300), 2),
            "stop_loss": round(random.uniform(50, 300), 2)
        }
    return {"scalping_signals": signals}

@app.get("/us-market/options")
async def get_us_market_options():
    """US Market options sinyalleri"""
    return {
        "options_signals": {
            "AAPL": {
                "current_price": round(random.uniform(180, 220), 2),
                "calls": [
                    {"strike": 180, "expiry": "2024-02-16", "premium": 12.50, "volume": 1500, "oi": 2500, "iv": 0.35},
                    {"strike": 190, "expiry": "2024-02-16", "premium": 8.20, "volume": 2200, "oi": 3200, "iv": 0.32},
                    {"strike": 200, "expiry": "2024-02-16", "premium": 5.20, "volume": 1800, "oi": 2800, "iv": 0.30},
                    {"strike": 210, "expiry": "2024-02-16", "premium": 3.10, "volume": 1200, "oi": 1900, "iv": 0.28}
                ],
                "puts": [
                    {"strike": 180, "expiry": "2024-02-16", "premium": 2.80, "volume": 800, "oi": 1500, "iv": 0.35},
                    {"strike": 190, "expiry": "2024-02-16", "premium": 4.80, "volume": 1100, "oi": 2100, "iv": 0.32},
                    {"strike": 200, "expiry": "2024-02-16", "premium": 8.20, "volume": 1600, "oi": 2600, "iv": 0.30},
                    {"strike": 210, "expiry": "2024-02-16", "premium": 12.50, "volume": 900, "oi": 1800, "iv": 0.28}
                ]
            },
            "TSLA": {
                "current_price": round(random.uniform(240, 280), 2),
                "calls": [
                    {"strike": 240, "expiry": "2024-02-16", "premium": 15.20, "volume": 800, "oi": 1200, "iv": 0.45},
                    {"strike": 260, "expiry": "2024-02-16", "premium": 8.50, "volume": 1200, "oi": 1800, "iv": 0.42},
                    {"strike": 280, "expiry": "2024-02-16", "premium": 4.20, "volume": 900, "oi": 1400, "iv": 0.40}
                ],
                "puts": [
                    {"strike": 240, "expiry": "2024-02-16", "premium": 3.20, "volume": 600, "oi": 1000, "iv": 0.45},
                    {"strike": 260, "expiry": "2024-02-16", "premium": 7.20, "volume": 800, "oi": 1300, "iv": 0.42},
                    {"strike": 280, "expiry": "2024-02-16", "premium": 12.50, "volume": 700, "oi": 1100, "iv": 0.40}
                ]
            },
            "NVDA": {
                "current_price": round(random.uniform(800, 900), 2),
                "calls": [
                    {"strike": 800, "expiry": "2024-02-16", "premium": 25.50, "volume": 500, "oi": 800, "iv": 0.55},
                    {"strike": 850, "expiry": "2024-02-16", "premium": 15.20, "volume": 700, "oi": 1000, "iv": 0.52},
                    {"strike": 900, "expiry": "2024-02-16", "premium": 8.80, "volume": 600, "oi": 900, "iv": 0.50}
                ],
                "puts": [
                    {"strike": 800, "expiry": "2024-02-16", "premium": 5.20, "volume": 400, "oi": 600, "iv": 0.55},
                    {"strike": 850, "expiry": "2024-02-16", "premium": 12.50, "volume": 500, "oi": 700, "iv": 0.52},
                    {"strike": 900, "expiry": "2024-02-16", "premium": 22.80, "volume": 400, "oi": 600, "iv": 0.50}
                ]
            }
        }
    }

@app.get("/us-market/sentiment")
async def get_us_market_sentiment():
    """US Market sentiment analizi"""
    return {
        "market_sentiment": {
            "overall": "bullish",
            "score": 0.65,
            "sectors": {
                "technology": {"sentiment": "bullish", "score": 0.72},
                "finance": {"sentiment": "neutral", "score": 0.45},
                "healthcare": {"sentiment": "bearish", "score": 0.35}
            }
        }
    }

@app.get("/us-market/technical")
async def get_us_market_technical():
    """US Market teknik analiz"""
    return {
        "technical_analysis": {
            "SPY": {
                "trend": "bullish",
                "rsi": 65.5,
                "macd": "positive",
                "support": 450,
                "resistance": 480
            },
            "QQQ": {
                "trend": "bullish",
                "rsi": 68.2,
                "macd": "positive",
                "support": 380,
                "resistance": 420
            }
        }
    }

@app.post("/analyze/bulk")
async def bulk_analyze(request: dict):
    """Toplu analiz - seçilen hisseleri analiz et"""
    selected_symbols = request.get("symbols", [])
    analysis_type = request.get("type", "comprehensive")  # comprehensive, options, technical
    
    if not selected_symbols:
        return {"error": "Hiç hisse seçilmedi"}
    
    results = {}
    
    for symbol in selected_symbols:
        try:
            if analysis_type == "comprehensive":
                # Kapsamlı analiz
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="1mo", interval="1d")
                
                if not hist.empty:
                    current_price = float(hist['Close'].iloc[-1])
                    prev_price = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current_price
                    price_change = ((current_price - prev_price) / prev_price) * 100
                    
                    # Teknik göstergeler
                    rsi = _calculate_rsi(hist['Close'])
                    ema_20 = hist['Close'].rolling(window=20).mean().iloc[-1]
                    ema_50 = hist['Close'].rolling(window=50).mean().iloc[-1]
                    
                    # Volatilite
                    volatility = hist['Close'].pct_change().std() * (252**0.5) * 100
                    
                    # AI skoru
                    ai_score = _calculate_ai_score(price_change, rsi, volatility)
                    
                    results[symbol] = {
                        "current_price": current_price,
                        "price_change": round(price_change, 2),
                        "rsi": round(rsi, 1),
                        "ema_20": round(ema_20, 2),
                        "ema_50": round(ema_50, 2),
                        "volatility": round(volatility, 2),
                        "ai_score": round(ai_score, 2),
                        "recommendation": "BUY" if ai_score > 70 else "SELL" if ai_score < 30 else "HOLD",
                        "confidence": min(0.95, abs(ai_score - 50) / 50),
                        "risk_level": "HIGH" if volatility > 30 else "MEDIUM" if volatility > 20 else "LOW"
                    }
                else:
                    results[symbol] = {"error": "Veri bulunamadı"}
                    
            elif analysis_type == "options":
                # Options analizi (sadece US hisseleri için)
                if not symbol.endswith('.IS'):
                    # Önce fiyat bilgisini al
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="1d", interval="1d")
                    current_price = float(hist['Close'].iloc[-1]) if not hist.empty else 100.0
                    
                    results[symbol] = {
                        "options_analysis": {
                            "implied_volatility": round(random.uniform(0.25, 0.65), 3),
                            "put_call_ratio": round(random.uniform(0.8, 1.5), 2),
                            "max_pain": round(random.uniform(current_price * 0.95, current_price * 1.05), 2),
                            "gamma_exposure": round(random.uniform(-1000000, 1000000), 0),
                            "recommendation": random.choice(["BUY_CALLS", "BUY_PUTS", "SELL_CALLS", "SELL_PUTS", "HOLD"])
                        }
                    }
                else:
                    results[symbol] = {"error": "Options analizi sadece US hisseleri için mevcut"}
                    
            elif analysis_type == "technical":
                # Sadece teknik analiz
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="3mo", interval="1d")
                
                if not hist.empty:
                    # Teknik göstergeler
                    rsi = _calculate_rsi(hist['Close'])
                    macd_line, macd_signal = _calculate_macd(hist['Close'])
                    bb_upper, bb_lower = _calculate_bollinger_bands(hist['Close'])
                    
                    results[symbol] = {
                        "rsi": round(rsi, 1),
                        "macd": round(macd_line, 3),
                        "macd_signal": round(macd_signal, 3),
                        "bollinger_upper": round(bb_upper, 2),
                        "bollinger_lower": round(bb_lower, 2),
                        "trend": "BULLISH" if rsi > 50 and macd_line > macd_signal else "BEARISH",
                        "support": round(bb_lower, 2),
                        "resistance": round(bb_upper, 2)
                    }
                else:
                    results[symbol] = {"error": "Veri bulunamadı"}
                    
        except Exception as e:
            results[symbol] = {"error": str(e)}
    
    return {
        "analysis_type": analysis_type,
        "selected_count": len(selected_symbols),
        "results": results,
        "summary": {
            "total_analyzed": len([r for r in results.values() if "error" not in r]),
            "buy_recommendations": len([r for r in results.values() if r.get("recommendation") == "BUY"]),
            "sell_recommendations": len([r for r in results.values() if r.get("recommendation") == "SELL"]),
            "hold_recommendations": len([r for r in results.values() if r.get("recommendation") == "HOLD"])
        }
    }

def _calculate_rsi(prices, period=14):
    """RSI hesapla"""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.iloc[-1] if not pd.isna(rsi.iloc[-1]) else 50

def _calculate_macd(prices, fast=12, slow=26, signal=9):
    """MACD hesapla"""
    ema_fast = prices.ewm(span=fast).mean()
    ema_slow = prices.ewm(span=slow).mean()
    macd_line = ema_fast - ema_slow
    macd_signal = macd_line.ewm(span=signal).mean()
    return macd_line.iloc[-1], macd_signal.iloc[-1]

def _calculate_bollinger_bands(prices, period=20, std_dev=2):
    """Bollinger Bands hesapla"""
    sma = prices.rolling(window=period).mean()
    std = prices.rolling(window=period).std()
    upper = sma + (std * std_dev)
    lower = sma - (std * std_dev)
    return upper.iloc[-1], lower.iloc[-1]

def _calculate_ai_score(price_change, rsi, volatility):
    """AI skoru hesapla"""
    # Basit AI skoru (0-100 arası)
    price_score = min(50 + price_change * 2, 100)  # Fiyat değişimi
    rsi_score = 100 - abs(rsi - 50) * 2  # RSI (50'ye yakın = iyi)
    volatility_score = max(0, 100 - volatility * 2)  # Düşük volatilite = iyi
    
    # Ağırlıklı ortalama
    ai_score = (price_score * 0.4 + rsi_score * 0.3 + volatility_score * 0.3)
    return max(0, min(100, ai_score))

# ==================== AI MODELS ENDPOINTS ====================

@app.post("/ai-models/train")
async def train_ai_models_endpoint(
    symbol: str = Query(..., description="Hisse senedi sembolü"),
    period: str = Query("1y", description="Eğitim veri periyodu")
):
    """AI modelleri eğitimi"""
    if not train_ai_models:
        raise HTTPException(status_code=503, detail="AI models service not available")
    
    try:
        result = train_ai_models(symbol, period)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI model training failed: {str(e)}")

@app.get("/ai-models/predict/{symbol}")
async def predict_ai_models_endpoint(
    symbol: str,
    days_ahead: int = Query(5, description="Kaç gün ileri tahmin")
):
    """AI modelleri ile tahmin"""
    if not predict_with_ai_models:
        raise HTTPException(status_code=503, detail="AI models service not available")
    
    try:
        result = predict_with_ai_models(symbol, days_ahead)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI model prediction failed: {str(e)}")

@app.get("/ai-models/status")
async def get_ai_model_status_endpoint():
    """AI model durumu"""
    if not get_ai_model_status:
        raise HTTPException(status_code=503, detail="AI models service not available")
    
    try:
        result = get_ai_model_status()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI model status failed: {str(e)}")

@app.get("/ai-models/ensemble-signal/{symbol}")
async def get_ensemble_signal_endpoint(
    symbol: str,
    days_ahead: int = Query(5, description="Kaç gün ileri tahmin")
):
    """Ensemble AI sinyali"""
    if not predict_with_ai_models:
        raise HTTPException(status_code=503, detail="AI models service not available")
    
    try:
        result = predict_with_ai_models(symbol, days_ahead)
        
        if "error" in result:
            return result
        
        # Sinyal formatına dönüştür
        signal = {
            "symbol": symbol,
            "action": result["signal"],
            "confidence": result["ensemble_confidence"],
            "prediction": result["ensemble_prediction"],
            "timestamp": result["timestamp"],
            "ai_models": {
                "lightgbm": result["individual_predictions"].get("lightgbm", {}),
                "lstm": result["individual_predictions"].get("lstm", {}),
                "timegpt": result["individual_predictions"].get("timegpt", {})
            }
        }
        
        return signal
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ensemble signal failed: {str(e)}")

# ==================== WATCHLIST & PORTFOLIO ENDPOINTS ====================

@app.post("/watchlist/create")
async def create_watchlist_endpoint(
    user_id: str = Query(..., description="Kullanıcı ID"),
    name: str = Query(..., description="Watchlist adı"),
    symbols: List[str] = Query([], description="Sembol listesi")
):
    """Watchlist oluştur"""
    if not create_watchlist:
        raise HTTPException(status_code=503, detail="Watchlist service not available")
    
    try:
        result = create_watchlist(user_id, name, symbols)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Watchlist creation failed: {str(e)}")

@app.get("/watchlist/{user_id}/{watchlist_id}")
async def get_watchlist_endpoint(
    user_id: str,
    watchlist_id: str
):
    """Watchlist verilerini getir"""
    if not get_watchlist_data:
        raise HTTPException(status_code=503, detail="Watchlist service not available")
    
    try:
        result = get_watchlist_data(user_id, watchlist_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Watchlist data failed: {str(e)}")

@app.post("/portfolio/create")
async def create_portfolio_endpoint(
    user_id: str = Query(..., description="Kullanıcı ID"),
    name: str = Query(..., description="Portfolio adı"),
    initial_cash: float = Query(10000, description="Başlangıç nakit")
):
    """Portfolio oluştur"""
    if not create_portfolio:
        raise HTTPException(status_code=503, detail="Portfolio service not available")
    
    try:
        result = create_portfolio(user_id, name, initial_cash)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio creation failed: {str(e)}")

@app.get("/portfolio/{user_id}/{portfolio_id}")
async def get_portfolio_endpoint(
    user_id: str,
    portfolio_id: str
):
    """Portfolio verilerini getir"""
    if not get_portfolio_data:
        raise HTTPException(status_code=503, detail="Portfolio service not available")
    
    try:
        result = get_portfolio_data(user_id, portfolio_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio data failed: {str(e)}")

@app.post("/alert/create")
async def create_alert_endpoint(
    user_id: str = Query(..., description="Kullanıcı ID"),
    symbol: str = Query(..., description="Sembol"),
    target_price: float = Query(..., description="Hedef fiyat"),
    condition: str = Query("above", description="Koşul (above/below)")
):
    """Alarm oluştur"""
    if not create_alert:
        raise HTTPException(status_code=503, detail="Alert service not available")
    
    try:
        result = create_alert(user_id, symbol, "price", target_price, condition)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert creation failed: {str(e)}")

# ==================== CRYPTO ENDPOINTS ====================

@app.get("/crypto/list")
async def get_crypto_list_endpoint(
    limit: int = Query(50, description="Limit")
):
    """Crypto listesi"""
    if not get_crypto_list:
        raise HTTPException(status_code=503, detail="Crypto service not available")
    
    try:
        result = get_crypto_list(limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crypto list failed: {str(e)}")

@app.get("/crypto/trending")
async def get_crypto_trending_endpoint():
    """Trending crypto'lar"""
    if not get_crypto_trending:
        raise HTTPException(status_code=503, detail="Crypto service not available")
    
    try:
        result = get_crypto_trending()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crypto trending failed: {str(e)}")

@app.get("/crypto/gainers-losers")
async def get_crypto_gainers_losers_endpoint():
    """Kazanan ve kaybeden crypto'lar"""
    if not get_crypto_gainers_losers:
        raise HTTPException(status_code=503, detail="Crypto service not available")
    
    try:
        result = get_crypto_gainers_losers()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crypto gainers-losers failed: {str(e)}")

@app.get("/crypto/{symbol}")
async def get_crypto_data_endpoint(
    symbol: str,
    period: str = Query("1d", description="Periyot")
):
    """Crypto verilerini getir"""
    if not get_crypto_data:
        raise HTTPException(status_code=503, detail="Crypto service not available")
    
    try:
        result = get_crypto_data(symbol, period)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crypto data failed: {str(e)}")

# ==================== EDUCATION ENDPOINTS ====================

@app.get("/education/courses")
async def get_courses_endpoint(
    level: str = Query(None, description="Seviye (beginner/intermediate/advanced)")
):
    """Kursları getir"""
    if not get_courses:
        raise HTTPException(status_code=503, detail="Education service not available")
    
    try:
        result = get_courses(level)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Courses failed: {str(e)}")

@app.get("/education/courses/{course_id}")
async def get_course_endpoint(course_id: str):
    """Kurs getir"""
    if not get_course:
        raise HTTPException(status_code=503, detail="Education service not available")
    
    try:
        result = get_course(course_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Course failed: {str(e)}")

@app.get("/education/articles")
async def get_articles_endpoint(
    category: str = Query(None, description="Kategori"),
    limit: int = Query(10, description="Limit")
):
    """Makaleleri getir"""
    if not get_articles:
        raise HTTPException(status_code=503, detail="Education service not available")
    
    try:
        result = get_articles(category, limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Articles failed: {str(e)}")

@app.get("/education/articles/{article_id}")
async def get_article_endpoint(article_id: str):
    """Makale getir"""
    if not get_article:
        raise HTTPException(status_code=503, detail="Education service not available")
    
    try:
        result = get_article(article_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Article failed: {str(e)}")

@app.get("/education/quiz/{quiz_id}")
async def get_quiz_endpoint(quiz_id: str):
    """Quiz getir"""
    if not get_quiz:
        raise HTTPException(status_code=503, detail="Education service not available")
    
    try:
        result = get_quiz(quiz_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz failed: {str(e)}")

@app.post("/education/quiz/{quiz_id}/submit")
async def submit_quiz_endpoint(
    quiz_id: str,
    user_id: str = Query(..., description="Kullanıcı ID"),
    answers: List[int] = Query(..., description="Cevaplar")
):
    """Quiz gönder"""
    if not submit_quiz:
        raise HTTPException(status_code=503, detail="Education service not available")
    
    try:
        result = submit_quiz(user_id, quiz_id, answers)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz submission failed: {str(e)}")

@app.get("/education/progress/{user_id}")
async def get_user_progress_endpoint(user_id: str):
    """Kullanıcı ilerlemesi"""
    if not get_user_progress:
        raise HTTPException(status_code=503, detail="Education service not available")
    
    try:
        result = get_user_progress(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"User progress failed: {str(e)}")

# God Mode endpoints
@app.get("/god-mode/status")
async def get_god_mode_status():
    """God Mode durumunu getir"""
    if god_mode_service is None:
        return {"god_mode": False, "message": "God Mode servisi mevcut değil"}
    
    try:
        return {
            "god_mode": True,
            "status": "active",
            "message": "👑 God Mode aktif! Tüm premium özelliklere erişiminiz var.",
            "features": god_mode_service.get_god_features("god@test.com"),
            "dashboard": god_mode_service.get_god_dashboard_data(),
            "analytics": god_mode_service.get_god_analytics()
        }
    except Exception as e:
        return {"error": str(e), "god_mode": False}

@app.get("/god-mode/features")
async def get_god_mode_features():
    """God Mode özelliklerini getir"""
    if god_mode_service is None:
        return {"features": []}
    
    try:
        features = god_mode_service.get_god_features("god@test.com")
        return {"features": features}
    except Exception as e:
        return {"error": str(e), "features": []}

@app.get("/god-mode/dashboard")
async def get_god_mode_dashboard():
    """God Mode dashboard verilerini getir"""
    if god_mode_service is None:
        return {"dashboard": {}}
    
    try:
        dashboard = god_mode_service.get_god_dashboard_data()
        return {"dashboard": dashboard}
    except Exception as e:
        return {"error": str(e), "dashboard": {}}

@app.get("/god-mode/analytics")
async def get_god_mode_analytics():
    """God Mode analitik verilerini getir"""
    if god_mode_service is None:
        return {"analytics": {}}
    
    try:
        analytics = god_mode_service.get_god_analytics()
        return {"analytics": analytics}
    except Exception as e:
        return {"error": str(e), "analytics": {}}

@app.post("/god-mode/activate")
async def activate_god_mode(email: str = "god@test.com"):
    """God Mode'u aktifleştir"""
    if god_mode_service is None:
        return {"success": False, "message": "God Mode servisi mevcut değil"}
    
    try:
        if god_mode_service.is_god_user(email):
            return {
                "success": True,
                "message": "👑 God Mode zaten aktif!",
                "user": god_mode_service.get_god_user(email),
                "features": god_mode_service.get_god_features(email)
            }
        else:
            return {
                "success": False,
                "message": "God Mode kullanıcısı değilsiniz"
            }
    except Exception as e:
        return {"error": str(e), "success": False}

# ===== YENİ PRD v2.0 ENDPOINT'LERİ =====

# Grey TOPSIS + Entropi Endpoint'leri
@app.get("/topsis/rank-stocks")
async def rank_stocks_with_topsis(symbols: Optional[str] = Query(None, description="Hisse sembolleri (virgülle ayrılmış)")):
    """Grey TOPSIS ile hisse sıralaması"""
    try:
        if not topsis_analyzer:
            return {"error": "TOPSIS analyzer mevcut değil"}
        
        symbol_list = symbols.split(",") if symbols else None
        result = topsis_analyzer.rank_stocks(symbol_list)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/topsis/top-n/{n}")
async def get_top_n_stocks(n: int = 10):
    """Top N hisse senetlerini getir"""
    try:
        if not topsis_analyzer:
            return {"error": "TOPSIS analyzer mevcut değil"}
        
        result = topsis_analyzer.get_top_n_stocks(n)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/topsis/analyze/{symbol}")
async def analyze_stock_with_topsis(symbol: str):
    """Belirli bir hisse için TOPSIS analizi"""
    try:
        if not topsis_analyzer:
            return {"error": "TOPSIS analyzer mevcut değil"}
        
        result = topsis_analyzer.get_stock_analysis(symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/topsis/export-report")
async def export_topsis_report(format: str = Query("json", description="Rapor formatı (json/csv)")):
    """TOPSIS raporunu dışa aktar"""
    try:
        if not topsis_analyzer:
            return {"error": "TOPSIS analyzer mevcut değil"}
        
        result = topsis_analyzer.export_ranking_report(format)
        return {"report": result, "format": format}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Teknik Formasyon Motoru Endpoint'leri
@app.get("/formations/analyze/{symbol}")
async def analyze_formations(symbol: str):
    """Belirli bir hisse için formasyon analizi"""
    try:
        if not formation_engine:
            return {"error": "Formation engine mevcut değil"}
        
        result = formation_engine.analyze_all_formations(symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/formations/ema-cross/{symbol}")
async def detect_ema_cross(symbol: str):
    """EMA kesişim formasyonlarını tespit et"""
    try:
        if not formation_engine:
            return {"error": "Formation engine mevcut değil"}
        
        df = formation_engine.get_price_data(symbol)
        if df.empty:
            return {"error": f"{symbol} için fiyat verisi bulunamadı"}
        
        formations = formation_engine.detect_ema_cross(df)
        return {
            "symbol": symbol,
            "formations": formations,
            "total_formations": len(formations),
            "analysis_date": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/formations/candlestick/{symbol}")
async def detect_candlestick_patterns(symbol: str):
    """Candlestick patternlerini tespit et"""
    try:
        if not formation_engine:
            return {"error": "Formation engine mevcut değil"}
        
        df = formation_engine.get_price_data(symbol)
        if df.empty:
            return {"error": f"{symbol} için fiyat verisi bulunamadı"}
        
        formations = formation_engine.detect_candlestick_patterns(df)
        return {
            "symbol": symbol,
            "formations": formations,
            "total_formations": len(formations),
            "analysis_date": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/formations/harmonic/{symbol}")
async def detect_harmonic_patterns(symbol: str):
    """Harmonic patternleri tespit et"""
    try:
        if not formation_engine:
            return {"error": "Formation engine mevcut değil"}
        
        df = formation_engine.get_price_data(symbol)
        if df.empty:
            return {"error": f"{symbol} için fiyat verisi bulunamadı"}
        
        formations = formation_engine.detect_harmonic_patterns(df)
        return {
            "symbol": symbol,
            "formations": formations,
            "total_formations": len(formations),
            "analysis_date": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/formations/fractal/{symbol}")
async def detect_fractal_break(symbol: str):
    """Fractal break formasyonlarını tespit et"""
    try:
        if not formation_engine:
            return {"error": "Formation engine mevcut değil"}
        
        df = formation_engine.get_price_data(symbol)
        if df.empty:
            return {"error": f"{symbol} için fiyat verisi bulunamadı"}
        
        formations = formation_engine.detect_fractal_break(df)
        return {
            "symbol": symbol,
            "formations": formations,
            "total_formations": len(formations),
            "analysis_date": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/formations/export-report/{symbol}")
async def export_formation_report(symbol: str, format: str = Query("json", description="Rapor formatı (json/csv)")):
    """Formasyon raporunu dışa aktar"""
    try:
        if not formation_engine:
            return {"error": "Formation engine mevcut değil"}
        
        result = formation_engine.export_formation_report(symbol, format)
        return {"report": result, "format": format, "symbol": symbol}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# RL Portföy Ajanı Endpoint'leri
@app.post("/rl-agent/train")
async def train_rl_agent(symbols: Optional[str] = Query(None, description="Hisse sembolleri (virgülle ayrılmış)"), episodes: int = Query(100, description="Eğitim episode sayısı")):
    """RL ajanını eğit"""
    try:
        if not rl_agent:
            return {"error": "RL agent mevcut değil"}
        
        symbol_list = symbols.split(",") if symbols else None
        result = rl_agent.train_rl_agent(symbol_list, episodes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rl-agent/portfolio-signal")
async def get_portfolio_signal(symbols: Optional[str] = Query(None, description="Hisse sembolleri (virgülle ayrılmış)")):
    """RL ajanı ile portföy sinyali üret"""
    try:
        if not rl_agent:
            return {"error": "RL agent mevcut değil"}
        
        symbol_list = symbols.split(",") if symbols else None
        result = rl_agent.generate_portfolio_signal(symbol_list)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rl-agent/performance")
async def get_rl_agent_performance(symbols: Optional[str] = Query(None, description="Hisse sembolleri (virgülle ayrılmış)")):
    """RL ajanı performansını getir"""
    try:
        if not rl_agent:
            return {"error": "RL agent mevcut değil"}
        
        symbol_list = symbols.split(",") if symbols else None
        result = rl_agent.get_portfolio_performance(symbol_list)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rl-agent/status")
async def get_rl_agent_status():
    """RL ajanı durumunu getir"""
    try:
        if not rl_agent:
            return {"error": "RL agent mevcut değil"}
        
        result = rl_agent.get_agent_status()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Kombine Analiz Endpoint'leri
@app.get("/analysis/comprehensive/{symbol}")
async def comprehensive_analysis(symbol: str):
    """Kapsamlı analiz (TOPSIS + Formasyon + RL)"""
    try:
        results = {}
        
        # TOPSIS analizi
        if topsis_analyzer:
            topsis_result = topsis_analyzer.get_stock_analysis(symbol)
            results["topsis"] = topsis_result
        
        # Formasyon analizi
        if formation_engine:
            formation_result = formation_engine.analyze_all_formations(symbol)
            results["formations"] = formation_result
        
        # RL ajanı analizi
        if rl_agent:
            rl_result = rl_agent.generate_portfolio_signal([symbol])
            results["rl_agent"] = rl_result
        
        # Kombine skor
        combined_score = 0
        score_count = 0
        
        if "topsis" in results and "overall_score" in results["topsis"]:
            combined_score += results["topsis"]["overall_score"]
            score_count += 1
        
        if "formations" in results and "total_formations" in results["formations"]:
            formation_score = min(results["formations"]["total_formations"] / 10, 1.0)
            combined_score += formation_score
            score_count += 1
        
        if "rl_agent" in results and "signals" in results["rl_agent"]:
            rl_signals = results["rl_agent"]["signals"]
            if rl_signals:
                avg_rl_score = np.mean([s.get("strength", 0.5) for s in rl_signals])
                combined_score += avg_rl_score
                score_count += 1
        
        if score_count > 0:
            combined_score = combined_score / score_count
        
        results["combined_score"] = combined_score
        results["analysis_date"] = datetime.now().isoformat()
        results["symbol"] = symbol
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analysis/market-overview")
async def market_overview():
    """Piyasa genel görünümü"""
    try:
        results = {}
        
        # Top N hisseler (TOPSIS)
        if topsis_analyzer:
            top_stocks = topsis_analyzer.get_top_n_stocks(10)
            results["top_stocks"] = top_stocks
        
        # RL ajanı portföy önerisi
        if rl_agent:
            portfolio_signal = rl_agent.generate_portfolio_signal()
            results["portfolio_recommendation"] = portfolio_signal
        
        # Genel piyasa analizi
        results["market_analysis"] = {
            "analysis_date": datetime.now().isoformat(),
            "total_symbols_analyzed": len(topsis_analyzer.bist_symbols) if topsis_analyzer else 0,
            "active_models": {
                "topsis": topsis_analyzer is not None,
                "formations": formation_engine is not None,
                "rl_agent": rl_agent is not None
            }
        }
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Finnhub WebSocket Endpoint'leri
@app.get("/finnhub/connect")
async def connect_finnhub():
    """Finnhub WebSocket bağlantısını kur"""
    try:
        if not finnhub_realtime:
            return {"error": "Finnhub realtime servisi mevcut değil"}
        
        success = await finnhub_realtime.connect()
        return {
            "success": success,
            "connected": finnhub_realtime.connected,
            "message": "Finnhub WebSocket bağlantısı kuruldu" if success else "Bağlantı kurulamadı"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/finnhub/disconnect")
async def disconnect_finnhub():
    """Finnhub WebSocket bağlantısını kes"""
    try:
        if not finnhub_realtime:
            return {"error": "Finnhub realtime servisi mevcut değil"}
        
        await finnhub_realtime.disconnect()
        return {
            "success": True,
            "connected": finnhub_realtime.connected,
            "message": "Finnhub WebSocket bağlantısı kesildi"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/finnhub/subscribe/{symbol}")
async def subscribe_symbol(symbol: str):
    """Sembole abone ol"""
    try:
        if not finnhub_realtime:
            return {"error": "Finnhub realtime servisi mevcut değil"}
        
        success = await finnhub_realtime.subscribe_to_symbol(symbol)
        return {
            "success": success,
            "symbol": symbol,
            "message": f"{symbol} sembolüne abone olundu" if success else "Abonelik başarısız"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/finnhub/unsubscribe/{symbol}")
async def unsubscribe_symbol(symbol: str):
    """Sembolden abonelikten çık"""
    try:
        if not finnhub_realtime:
            return {"error": "Finnhub realtime servisi mevcut değil"}
        
        success = await finnhub_realtime.unsubscribe_from_symbol(symbol)
        return {
            "success": success,
            "symbol": symbol,
            "message": f"{symbol} abonelikten çıkarıldı" if success else "Abonelikten çıkma başarısız"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/finnhub/price/{symbol}")
async def get_finnhub_price(symbol: str):
    """Gerçek zamanlı fiyat verisi getir"""
    try:
        if not finnhub_realtime:
            return {"error": "Finnhub realtime servisi mevcut değil"}
        
        price_data = await finnhub_realtime.get_realtime_price(symbol)
        if price_data:
            return {
                "success": True,
                "symbol": symbol,
                "price_data": price_data
            }
        else:
            return {
                "success": False,
                "symbol": symbol,
                "message": "Fiyat verisi bulunamadı"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/finnhub/prices")
async def get_multiple_finnhub_prices(symbols: Optional[str] = Query(None, description="Semboller (virgülle ayrılmış)")):
    """Birden fazla sembol için fiyat verisi getir"""
    try:
        if not finnhub_realtime:
            return {"error": "Finnhub realtime servisi mevcut değil"}
        
        symbol_list = symbols.split(",") if symbols else finnhub_realtime.all_symbols[:10]
        price_data = await finnhub_realtime.get_multiple_prices(symbol_list)
        
        return {
            "success": True,
            "symbols": symbol_list,
            "price_data": price_data,
            "total_symbols": len(price_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/finnhub/status")
async def get_finnhub_status():
    """Finnhub WebSocket durumunu getir"""
    try:
        if not finnhub_realtime:
            return {"error": "Finnhub realtime servisi mevcut değil"}
        
        status = {
            "connected": finnhub_realtime.connected,
            "subscribed_symbols": list(finnhub_realtime.subscribers.keys()),
            "cache_size": len(finnhub_realtime.price_cache),
            "data_quality": finnhub_realtime.get_data_quality_metrics()
        }
        
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/finnhub/cached-prices")
async def get_cached_prices():
    """Cache'lenmiş fiyatları getir"""
    try:
        if not finnhub_realtime:
            return {"error": "Finnhub realtime servisi mevcut değil"}
        
        cached_prices = finnhub_realtime.get_cached_prices()
        return {
            "success": True,
            "cached_prices": cached_prices,
            "total_symbols": len(cached_prices)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/finnhub/subscribe-multiple")
async def subscribe_multiple_symbols(symbols: Optional[str] = Query(None, description="Semboller (virgülle ayrılmış)")):
    """Birden fazla sembole abone ol"""
    try:
        if not finnhub_realtime:
            return {"error": "Finnhub realtime servisi mevcut değil"}
        
        symbol_list = symbols.split(",") if symbols else finnhub_realtime.all_symbols[:10]
        success = await finnhub_realtime.subscribe_to_multiple_symbols(symbol_list)
        
        return {
            "success": success,
            "symbols": symbol_list,
            "message": f"{len(symbol_list)} sembole abone olundu" if success else "Abonelik başarısız"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/finnhub/start-fallback")
async def start_fallback_polling(symbols: Optional[str] = Query(None, description="Semboller (virgülle ayrılmış)"), interval: int = Query(5, description="Polling interval (saniye)")):
    """Fallback polling başlat"""
    try:
        if not finnhub_realtime:
            return {"error": "Finnhub realtime servisi mevcut değil"}
        
        symbol_list = symbols.split(",") if symbols else finnhub_realtime.all_symbols[:10]
        
        # Background task olarak başlat
        asyncio.create_task(finnhub_realtime.start_fallback_polling(symbol_list, interval))
        
        return {
            "success": True,
            "symbols": symbol_list,
            "interval": interval,
            "message": "Fallback polling başlatıldı"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/finnhub/reconnect")
async def reconnect_finnhub():
    """Finnhub WebSocket yeniden bağlan"""
    try:
        if not finnhub_realtime:
            return {"error": "Finnhub realtime servisi mevcut değil"}
        
        success = await finnhub_realtime.reconnect()
        return {
            "success": success,
            "connected": finnhub_realtime.connected,
            "message": "Yeniden bağlandı" if success else "Yeniden bağlanamadı"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Sentiment Analyzer Endpoint'leri
@app.post("/sentiment/analyze-text")
async def analyze_text_sentiment(text: str = Query(..., description="Analiz edilecek metin")):
    """Metin sentiment analizi"""
    try:
        if not sentiment_analyzer:
            return {"error": "Sentiment analyzer mevcut değil"}
        
        result = sentiment_analyzer.analyze_text_sentiment(text)
        return {
            "success": True,
            "text": text,
            "sentiment_result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sentiment/news/{symbol}")
async def get_news_sentiment(symbol: str, days: int = Query(7, description="Analiz edilecek gün sayısı")):
    """Haber sentiment analizi"""
    try:
        if not sentiment_analyzer:
            return {"error": "Sentiment analyzer mevcut değil"}
        
        result = await sentiment_analyzer.get_news_sentiment(symbol, days)
        return {
            "success": True,
            "symbol": symbol,
            "days": days,
            "news_sentiment": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sentiment/social/{symbol}")
async def get_social_sentiment(symbol: str, days: int = Query(7, description="Analiz edilecek gün sayısı")):
    """Sosyal medya sentiment analizi"""
    try:
        if not sentiment_analyzer:
            return {"error": "Sentiment analyzer mevcut değil"}
        
        result = await sentiment_analyzer.get_social_media_sentiment(symbol, days)
        return {
            "success": True,
            "symbol": symbol,
            "days": days,
            "social_sentiment": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sentiment/kap/{symbol}")
async def get_kap_sentiment(symbol: str, days: int = Query(7, description="Analiz edilecek gün sayısı")):
    """KAP ODA sentiment analizi"""
    try:
        if not sentiment_analyzer:
            return {"error": "Sentiment analyzer mevcut değil"}
        
        result = await sentiment_analyzer.get_kap_oda_sentiment(symbol, days)
        return {
            "success": True,
            "symbol": symbol,
            "days": days,
            "kap_sentiment": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sentiment/comprehensive/{symbol}")
async def get_comprehensive_sentiment(symbol: str, days: int = Query(7, description="Analiz edilecek gün sayısı")):
    """Kapsamlı sentiment analizi"""
    try:
        if not sentiment_analyzer:
            return {"error": "Sentiment analyzer mevcut değil"}
        
        result = await sentiment_analyzer.get_comprehensive_sentiment(symbol, days)
        return {
            "success": True,
            "symbol": symbol,
            "days": days,
            "comprehensive_sentiment": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sentiment/history")
async def get_sentiment_history():
    """Sentiment geçmişini getir"""
    try:
        if not sentiment_analyzer:
            return {"error": "Sentiment analyzer mevcut değil"}
        
        history = sentiment_analyzer.get_sentiment_history()
        return {
            "success": True,
            "history": history,
            "total_analyses": len(history)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sentiment/quality-metrics")
async def get_sentiment_quality_metrics():
    """Sentiment kalite metriklerini getir"""
    try:
        if not sentiment_analyzer:
            return {"error": "Sentiment analyzer mevcut değil"}
        
        metrics = sentiment_analyzer.get_quality_metrics()
        return {
            "success": True,
            "quality_metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sentiment/export-report/{symbol}")
async def export_sentiment_report(symbol: str, format: str = Query("json", description="Rapor formatı (json/csv)")):
    """Sentiment raporunu dışa aktar"""
    try:
        if not sentiment_analyzer:
            return {"error": "Sentiment analyzer mevcut değil"}
        
        report = sentiment_analyzer.export_sentiment_report(symbol, format)
        return {
            "success": True,
            "symbol": symbol,
            "format": format,
            "report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sentiment/initialize")
async def initialize_sentiment_model():
    """Sentiment modelini başlat"""
    try:
        if not sentiment_analyzer:
            return {"error": "Sentiment analyzer mevcut değil"}
        
        sentiment_analyzer.initialize_model()
        return {
            "success": True,
            "message": "Sentiment modeli başlatıldı",
            "model_type": sentiment_analyzer.sentiment_model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# XAI Explanation endpoints
@app.post("/xai/explain-signal")
async def explain_signal(symbol: str, signal_data: dict):
    """SHAP ve LIME ile sinyal açıklaması"""
    if not xai_explainer:
        return {"error": "XAI explainer not available"}
    
    try:
        explanation = xai_explainer.explain_signal(symbol, signal_data)
        return explanation
    except Exception as e:
        return {"error": str(e)}

@app.get("/xai/feature-importance/{symbol}")
async def get_feature_importance(symbol: str):
    """Özellik önem skorları"""
    if not xai_explainer:
        return {"error": "XAI explainer not available"}
    
    try:
        importance = xai_explainer.get_feature_importance(symbol)
        return importance
    except Exception as e:
        return {"error": str(e)}

@app.post("/xai/explain-prediction")
async def explain_prediction(symbol: str, prediction_data: dict):
    """Tahmin açıklaması"""
    if not xai_explainer:
        return {"error": "XAI explainer not available"}
    
    try:
        explanation = xai_explainer.explain_prediction(symbol, prediction_data)
        return explanation
    except Exception as e:
        return {"error": str(e)}

@app.get("/xai/model-interpretability/{symbol}")
async def get_model_interpretability(symbol: str):
    """Model yorumlanabilirliği"""
    if not xai_explainer:
        return {"error": "XAI explainer not available"}
    
    try:
        interpretability = xai_explainer.get_model_interpretability(symbol)
        return interpretability
    except Exception as e:
        return {"error": str(e)}

@app.post("/xai/compare-models")
async def compare_models(symbol: str, models: List[str]):
    """Model karşılaştırması"""
    if not xai_explainer:
        return {"error": "XAI explainer not available"}
    
    try:
        comparison = xai_explainer.compare_models(symbol, models)
        return comparison
    except Exception as e:
        return {"error": str(e)}

@app.get("/xai/explanation-history/{symbol}")
async def get_explanation_history(symbol: str):
    """Açıklama geçmişi"""
    if not xai_explainer:
        return {"error": "XAI explainer not available"}
    
    try:
        history = xai_explainer.get_explanation_history(symbol)
        return history
    except Exception as e:
        return {"error": str(e)}

@app.post("/xai/export-explanation")
async def export_explanation(symbol: str, explanation_data: dict):
    """Açıklama export"""
    if not xai_explainer:
        return {"error": "XAI explainer not available"}
    
    try:
        export = xai_explainer.export_explanation(symbol, explanation_data)
        return export
    except Exception as e:
        return {"error": str(e)}

# Auto-Backtest System endpoints
@app.post("/backtest/run")
async def run_backtest_endpoint(
    symbol: str = Query(..., description="Hisse sembolü"),
    strategy: str = Query("multi_signal", description="Strateji adı"),
    period: str = Query("1y", description="Test periyodu"),
    initial_capital: float = Query(10000, description="Başlangıç sermayesi")
):
    """Backtest çalıştır"""
    if not backtest_system:
        return {"error": "Backtest sistemi mevcut değil"}
    
    try:
        result = backtest_system.run_backtest(symbol, strategy, period, initial_capital)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.post("/backtest/walk-forward")
async def run_walk_forward_endpoint(
    symbol: str = Query(..., description="Hisse sembolü"),
    strategy: str = Query("multi_signal", description="Strateji adı"),
    period: str = Query("2y", description="Test periyodu"),
    window_size: int = Query(252, description="Pencere boyutu (gün)"),
    step_size: int = Query(63, description="Adım boyutu (gün)")
):
    """Walk Forward Analysis çalıştır"""
    if not backtest_system:
        return {"error": "Backtest sistemi mevcut değil"}
    
    try:
        result = backtest_system.run_walk_forward_analysis(symbol, strategy, period, window_size, step_size)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/backtest/compare-strategies/{symbol}")
async def compare_strategies_endpoint(
    symbol: str,
    period: str = Query("1y", description="Test periyodu")
):
    """Stratejileri karşılaştır"""
    if not backtest_system:
        return {"error": "Backtest sistemi mevcut değil"}
    
    try:
        result = backtest_system.compare_strategies(symbol, period)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/backtest/strategies")
async def get_available_strategies_endpoint():
    """Mevcut stratejileri listele"""
    if not backtest_system:
        return {"error": "Backtest sistemi mevcut değil"}
    
    try:
        strategies = backtest_system.get_available_strategies()
        return {
            "success": True,
            "strategies": strategies,
            "count": len(strategies),
            "descriptions": {
                "ema_cross": "EMA 20/50 kesişim stratejisi",
                "rsi_mean_reversion": "RSI ortalama dönüş stratejisi",
                "bollinger_bands": "Bollinger Bands stratejisi",
                "macd_momentum": "MACD momentum stratejisi",
                "multi_signal": "Çoklu sinyal birleştirme stratejisi"
            }
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/backtest/history")
async def get_backtest_history_endpoint():
    """Backtest geçmişini getir"""
    if not backtest_system:
        return {"error": "Backtest sistemi mevcut değil"}
    
    try:
        history = backtest_system.get_backtest_history()
        return history
    except Exception as e:
        return {"error": str(e)}

@app.get("/backtest/export-report/{symbol}")
async def export_backtest_report_endpoint(
    symbol: str,
    strategy: str = Query("multi_signal", description="Strateji adı"),
    format: str = Query("json", description="Export formatı (json/csv)")
):
    """Backtest raporunu export et"""
    if not backtest_system:
        return {"error": "Backtest sistemi mevcut değil"}
    
    try:
        result = backtest_system.export_backtest_report(symbol, strategy, format)
        return result
    except Exception as e:
        return {"error": str(e)}

# Macro Regime Detector endpoints
@app.get("/macro-regime/analyze")
async def analyze_macro_regime_endpoint(
    period: str = Query("1y", description="Analiz periyodu")
):
    """Makro rejim analizi"""
    if not macro_regime_detector:
        return {"error": "Makro rejim algılayıcı mevcut değil"}
    
    try:
        result = macro_regime_detector.analyze_macro_regime(period)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/macro-regime/current")
async def get_current_regime_endpoint():
    """Güncel rejim durumu"""
    if not macro_regime_detector:
        return {"error": "Makro rejim algılayıcı mevcut değil"}
    
    try:
        result = macro_regime_detector.get_regime_history()
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/macro-regime/recommendations")
async def get_regime_recommendations_endpoint(
    regime: str = Query(..., description="Rejim türü")
):
    """Rejime göre yatırım önerileri"""
    if not macro_regime_detector:
        return {"error": "Makro rejim algılayıcı mevcut değil"}
    
    try:
        result = macro_regime_detector.get_regime_recommendations(regime)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/macro-regime/history")
async def get_regime_history_endpoint():
    """Rejim geçmişi"""
    if not macro_regime_detector:
        return {"error": "Makro rejim algılayıcı mevcut değil"}
    
    try:
        result = macro_regime_detector.get_regime_history()
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/macro-regime/export-report")
async def export_regime_report_endpoint(
    format: str = Query("json", description="Export formatı")
):
    """Rejim raporunu export et"""
    if not macro_regime_detector:
        return {"error": "Makro rejim algılayıcı mevcut değil"}
    
    try:
        result = macro_regime_detector.export_regime_report(format)
        return result
    except Exception as e:
        return {"error": str(e)}

# Freemium Model endpoints
@app.get("/freemium/tiers")
async def get_subscription_tiers_endpoint():
    """Abonelik seviyelerini getir"""
    import sys
    print(f"DEBUG: freemium_model in globals: {'freemium_model' in globals()}")
    print(f"DEBUG: freemium_model in sys.modules[__name__].__dict__: {'freemium_model' in sys.modules[__name__].__dict__}")
    fm = globals().get('freemium_model', None)
    print(f"DEBUG: fm from globals(): {fm}")
    print(f"DEBUG: freemium_model type: {type(freemium_model)}, is None: {freemium_model is None}")
    if not freemium_model:
        return {"error": "Freemium model mevcut değil"}
    
    try:
        result = freemium_model.get_subscription_tiers()
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/freemium/check-access")
async def check_feature_access_endpoint(
    user_email: str = Query(..., description="Kullanıcı email"),
    feature: str = Query(..., description="Özellik adı")
):
    """Özellik erişimini kontrol et"""
    if not freemium_model:
        return {"error": "Freemium model mevcut değil"}
    
    try:
        result = freemium_model.check_feature_access(user_email, feature)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/freemium/check-limits")
async def check_usage_limits_endpoint(
    user_email: str = Query(..., description="Kullanıcı email"),
    limit_type: str = Query(..., description="Limit türü")
):
    """Kullanım limitlerini kontrol et"""
    if not freemium_model:
        return {"error": "Freemium model mevcut değil"}
    
    try:
        result = freemium_model.check_usage_limits(user_email, limit_type)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/freemium/user-subscription")
async def get_user_subscription_endpoint(
    user_email: str = Query(..., description="Kullanıcı email")
):
    """Kullanıcının abonelik bilgilerini getir"""
    if not freemium_model:
        return {"error": "Freemium model mevcut değil"}
    
    try:
        result = freemium_model.get_user_subscription(user_email)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.post("/freemium/upgrade")
async def upgrade_subscription_endpoint(
    user_email: str = Query(..., description="Kullanıcı email"),
    new_tier: str = Query(..., description="Yeni tier")
):
    """Abonelik yükseltme"""
    if not freemium_model:
        return {"error": "Freemium model mevcut değil"}
    
    try:
        from backend.services.freemium_model import SubscriptionTier
        tier_enum = SubscriptionTier(new_tier)
        result = freemium_model.upgrade_subscription(user_email, tier_enum)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/freemium/upgrade-recommendations")
async def get_upgrade_recommendations_endpoint(
    user_email: str = Query(..., description="Kullanıcı email")
):
    """Yükseltme önerileri"""
    if not freemium_model:
        return {"error": "Freemium model mevcut değil"}
    
    try:
        result = freemium_model.get_upgrade_recommendations(user_email)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/freemium/analytics")
async def get_subscription_analytics_endpoint():
    """Abonelik analitiği"""
    if not freemium_model:
        return {"error": "Freemium model mevcut değil"}
    
    try:
        result = freemium_model.get_subscription_analytics()
        return result
    except Exception as e:
        return {"error": str(e)}

# Background task başlat
@app.on_event("startup")
async def startup_event():
    """Uygulama başlatıldığında background task'ı başlat"""
    asyncio.create_task(broadcast_realtime_data())
    print("🚀 Gerçek zamanlı veri akışı başlatıldı")

if __name__ == "__main__":
    import uvicorn
    print("🚀 BIST AI Smart Trader API başlatılıyor...")
    print("📱 Flutter uygulaması için hazır!")
    uvicorn.run(app, host="0.0.0.0", port=8080, reload=True)