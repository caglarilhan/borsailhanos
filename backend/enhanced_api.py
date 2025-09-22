#!/usr/bin/env python3
"""
🌐 Enhanced API with WebSocket
PRD v2.0 Enhancement - Real-time WebSocket API
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import logging
from typing import Dict, List, Set
from datetime import datetime
import uvicorn

# Import all modules
from grey_topsis_ranker import GreyTOPSISRanker
from technical_pattern_detector import TechnicalPatternDetector
from ai_ensemble_system import AIEnsembleSystem
from sentiment_analyzer import SentimentAnalyzer
from rl_portfolio_agent import RLPortfolioAgent
from xai_explainer import XAIExplainer
from market_regime_detector import MarketRegimeDetector
from advanced_risk_manager import AdvancedRiskManager
from multi_timeframe_analyzer import MultiTimeFrameAnalyzer
from backtesting_engine import BacktestingEngine
from alerts_system import AlertManager, AlertType, AlertPriority

logger = logging.getLogger(__name__)

class ConnectionManager:
    """WebSocket bağlantı yöneticisi"""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.subscriptions: Dict[WebSocket, List[str]] = {}
    
    async def connect(self, websocket: WebSocket):
        """Bağlantı kabul et"""
        await websocket.accept()
        self.active_connections.add(websocket)
        self.subscriptions[websocket] = []
        logger.info(f"🔌 WebSocket bağlantısı kuruldu: {len(self.active_connections)} aktif")
    
    def disconnect(self, websocket: WebSocket):
        """Bağlantıyı kes"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.subscriptions:
            del self.subscriptions[websocket]
        logger.info(f"🔌 WebSocket bağlantısı kesildi: {len(self.active_connections)} aktif")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Kişisel mesaj gönder"""
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"❌ Mesaj gönderme hatası: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: str):
        """Tüm bağlantılara yayınla"""
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"❌ Broadcast hatası: {e}")
                disconnected.add(connection)
        
        # Bağlantısı kesilenleri temizle
        for connection in disconnected:
            self.disconnect(connection)
    
    async def send_to_subscribers(self, symbol: str, message: str):
        """Belirli sembolü takip edenlere gönder"""
        for websocket, subscriptions in self.subscriptions.items():
            if symbol in subscriptions:
                await self.send_personal_message(message, websocket)

# Initialize systems
app = FastAPI(
    title="BIST AI Smart Trader API v2.0 Enhanced",
    description="PRD v2.0 - Enhanced with WebSocket, Risk Management, Multi-timeframe",
    version="2.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize all systems
topsis_ranker = GreyTOPSISRanker()
pattern_detector = TechnicalPatternDetector()
ai_ensemble = AIEnsembleSystem()
sentiment_analyzer = SentimentAnalyzer()
rl_agent = RLPortfolioAgent()
xai_explainer = XAIExplainer()
market_regime_detector = MarketRegimeDetector()
risk_manager = AdvancedRiskManager()
multi_timeframe_analyzer = MultiTimeFrameAnalyzer()
backtesting_engine = BacktestingEngine()
alert_manager = AlertManager()

# WebSocket connection manager
manager = ConnectionManager()

# Background task for real-time updates
async def real_time_updates():
    """Gerçek zamanlı güncellemeler"""
    while True:
        try:
            if manager.active_connections:
                # Market rejim güncellemesi
                market_regime = market_regime_detector.detect_market_regime()
                
                update_message = {
                    "type": "market_regime_update",
                    "data": {
                        "regime": market_regime.regime,
                        "confidence": market_regime.confidence,
                        "volatility": market_regime.volatility,
                        "timestamp": market_regime.timestamp.isoformat()
                    }
                }
                
                await manager.broadcast(json.dumps(update_message))
                
                # Alert kontrolü
                for symbol in ["GARAN.IS", "AKBNK.IS", "SISE.IS"]:
                    # Basit test verisi
                    test_data = {
                        'current_price': 220.0,
                        'resistance_level': 215.0,
                        'volume_ratio': 1.5,
                        'risk_score': 45
                    }
                    
                    alerts = alert_manager.check_alerts(symbol, test_data)
                    for alert in alerts:
                        alert_message = {
                            "type": "alert",
                            "data": {
                                "alert_type": alert.alert_type.value,
                                "priority": alert.priority.value,
                                "symbol": alert.symbol,
                                "title": alert.title,
                                "message": alert.message,
                                "timestamp": alert.timestamp.isoformat()
                            }
                        }
                        
                        await manager.send_to_subscribers(symbol, json.dumps(alert_message))
                        alert_manager.send_alert(alert)
            
            await asyncio.sleep(30)  # 30 saniyede bir güncelle
            
        except Exception as e:
            logger.error(f"❌ Real-time update hatası: {e}")
            await asyncio.sleep(60)

@app.on_event("startup")
async def startup_event():
    """Uygulama başlatma"""
    logger.info("🚀 BIST AI Smart Trader v2.1 başlatılıyor...")
    asyncio.create_task(real_time_updates())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint"""
    await manager.connect(websocket)
    try:
        while True:
            # Mesaj bekle
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "subscribe":
                # Sembol takibi
                symbol = message.get("symbol")
                if symbol:
                    manager.subscriptions[websocket].append(symbol)
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "subscription_confirmed",
                            "symbol": symbol,
                            "message": f"{symbol} takibi başlatıldı"
                        }),
                        websocket
                    )
            
            elif message.get("type") == "unsubscribe":
                # Takibi durdur
                symbol = message.get("symbol")
                if symbol and symbol in manager.subscriptions[websocket]:
                    manager.subscriptions[websocket].remove(symbol)
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "unsubscription_confirmed",
                            "symbol": symbol,
                            "message": f"{symbol} takibi durduruldu"
                        }),
                        websocket
                    )
            
            elif message.get("type") == "get_analysis":
                # Anlık analiz isteği
                symbol = message.get("symbol", "GARAN.IS")
                
                # Kapsamlı analiz
                analysis_data = await get_comprehensive_analysis(symbol)
                
                await manager.send_personal_message(
                    json.dumps({
                        "type": "analysis_result",
                        "symbol": symbol,
                        "data": analysis_data
                    }),
                    websocket
                )
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def get_comprehensive_analysis(symbol: str) -> Dict:
    """Kapsamlı analiz verisi"""
    try:
        # Tüm modüllerden veri topla
        analysis_data = {
            "symbol": symbol,
            "timestamp": datetime.now().isoformat(),
            
            # Financial ranking
            "financial_ranking": {},
            
            # Technical patterns
            "technical_patterns": [],
            
            # AI prediction
            "ai_prediction": {},
            
            # Sentiment analysis
            "sentiment_analysis": {},
            
            # Multi-timeframe analysis
            "multi_timeframe": {},
            
            # Risk metrics
            "risk_metrics": {},
            
            # Market regime
            "market_regime": {}
        }
        
        # Financial ranking
        try:
            ranking = topsis_ranker.rank_stocks([symbol])
            analysis_data["financial_ranking"] = ranking.get(symbol, {})
        except Exception as e:
            logger.error(f"❌ Financial ranking hatası: {e}")
        
        # Technical patterns
        try:
            patterns = pattern_detector.detect_all_patterns(symbol)
            analysis_data["technical_patterns"] = [
                {
                    "type": p.pattern_type.value,
                    "confidence": p.confidence,
                    "entry_price": p.entry_price,
                    "take_profit": p.take_profit,
                    "stop_loss": p.stop_loss,
                    "description": p.description
                } for p in patterns
            ]
        except Exception as e:
            logger.error(f"❌ Technical patterns hatası: {e}")
        
        # AI prediction
        try:
            ai_prediction = ai_ensemble.predict_ensemble(symbol)
            if ai_prediction:
                analysis_data["ai_prediction"] = {
                    "prediction": ai_prediction.prediction,
                    "confidence": ai_prediction.confidence,
                    "lightgbm_pred": ai_prediction.lightgbm_pred,
                    "lstm_pred": ai_prediction.lstm_pred,
                    "timegpt_pred": ai_prediction.timegpt_pred
                }
        except Exception as e:
            logger.error(f"❌ AI prediction hatası: {e}")
        
        # Sentiment analysis
        try:
            sentiment = sentiment_analyzer.analyze_stock_sentiment(symbol)
            if sentiment:
                analysis_data["sentiment_analysis"] = {
                    "overall_sentiment": sentiment.overall_sentiment,
                    "confidence": sentiment.confidence,
                    "news_count": sentiment.news_count,
                    "positive_news": sentiment.positive_news,
                    "negative_news": sentiment.negative_news,
                    "key_events": sentiment.key_events
                }
        except Exception as e:
            logger.error(f"❌ Sentiment analysis hatası: {e}")
        
        # Multi-timeframe analysis
        try:
            mtf_analysis = multi_timeframe_analyzer.analyze_symbol(symbol)
            analysis_data["multi_timeframe"] = {
                "consensus_signal": mtf_analysis.consensus_signal,
                "consensus_strength": mtf_analysis.consensus_strength,
                "timeframe_alignment": mtf_analysis.timeframe_alignment,
                "trend_direction": mtf_analysis.trend_direction,
                "signals": {
                    tf: {
                        "signal": sig.signal,
                        "strength": sig.strength,
                        "confidence": sig.confidence,
                        "price": sig.price
                    } for tf, sig in mtf_analysis.signals.items()
                }
            }
        except Exception as e:
            logger.error(f"❌ Multi-timeframe analysis hatası: {e}")
        
        # Risk metrics
        try:
            risk_metrics = risk_manager.calculate_stock_risk(symbol)
            analysis_data["risk_metrics"] = {
                "risk_score": risk_metrics.risk_score,
                "var_95": risk_metrics.var_95,
                "max_drawdown": risk_metrics.max_drawdown,
                "sharpe_ratio": risk_metrics.sharpe_ratio,
                "beta": risk_metrics.beta,
                "volatility": risk_metrics.volatility
            }
        except Exception as e:
            logger.error(f"❌ Risk metrics hatası: {e}")
        
        # Market regime
        try:
            market_regime = market_regime_detector.detect_market_regime()
            analysis_data["market_regime"] = {
                "regime": market_regime.regime,
                "confidence": market_regime.confidence,
                "volatility": market_regime.volatility,
                "trend_strength": market_regime.trend_strength
            }
        except Exception as e:
            logger.error(f"❌ Market regime hatası: {e}")
        
        return analysis_data
        
    except Exception as e:
        logger.error(f"❌ Comprehensive analysis hatası: {e}")
        return {"error": str(e)}

# REST API endpoints (existing ones plus new ones)

@app.get("/api/v2.1/health")
async def health_check():
    """Enhanced health check"""
    return {
        "status": "healthy",
        "version": "2.1",
        "timestamp": datetime.now().isoformat(),
        "websocket_connections": len(manager.active_connections),
        "modules": {
            "topsis_ranker": "active",
            "pattern_detector": "active",
            "ai_ensemble": "active",
            "sentiment_analyzer": "active",
            "rl_agent": "active",
            "xai_explainer": "active",
            "market_regime_detector": "active",
            "risk_manager": "active",
            "multi_timeframe_analyzer": "active",
            "backtesting_engine": "active",
            "alert_manager": "active"
        }
    }

@app.get("/api/v2.1/risk/{symbol}")
async def get_risk_analysis(symbol: str):
    """Risk analizi endpoint"""
    try:
        risk_metrics = risk_manager.calculate_stock_risk(symbol)
        
        return {
            "symbol": symbol,
            "timestamp": datetime.now().isoformat(),
            "risk_metrics": {
                "risk_score": risk_metrics.risk_score,
                "var_95": risk_metrics.var_95,
                "var_99": risk_metrics.var_99,
                "cvar_95": risk_metrics.cvar_95,
                "max_drawdown": risk_metrics.max_drawdown,
                "sharpe_ratio": risk_metrics.sharpe_ratio,
                "sortino_ratio": risk_metrics.sortino_ratio,
                "calmar_ratio": risk_metrics.calmar_ratio,
                "beta": risk_metrics.beta,
                "correlation_market": risk_metrics.correlation_market,
                "volatility": risk_metrics.volatility,
                "skewness": risk_metrics.skewness,
                "kurtosis": risk_metrics.kurtosis
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Risk analysis hatası: {e}")
        return {"error": str(e)}

@app.get("/api/v2.1/multi-timeframe/{symbol}")
async def get_multi_timeframe_analysis(symbol: str):
    """Multi-timeframe analizi endpoint"""
    try:
        analysis = multi_timeframe_analyzer.analyze_symbol(symbol)
        
        return {
            "symbol": symbol,
            "timestamp": datetime.now().isoformat(),
            "analysis": {
                "consensus_signal": analysis.consensus_signal,
                "consensus_strength": analysis.consensus_strength,
                "timeframe_alignment": analysis.timeframe_alignment,
                "trend_direction": analysis.trend_direction,
                "support_resistance": analysis.support_resistance,
                "signals": {
                    tf: {
                        "signal": sig.signal,
                        "strength": sig.strength,
                        "confidence": sig.confidence,
                        "price": sig.price,
                        "indicators": sig.indicators
                    } for tf, sig in analysis.signals.items()
                }
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Multi-timeframe analysis hatası: {e}")
        return {"error": str(e)}

@app.get("/api/v2.1/market-regime")
async def get_market_regime():
    """Market rejim endpoint"""
    try:
        regime = market_regime_detector.detect_market_regime()
        
        return {
            "timestamp": datetime.now().isoformat(),
            "market_regime": {
                "regime": regime.regime,
                "confidence": regime.confidence,
                "duration_days": regime.duration_days,
                "volatility": regime.volatility,
                "trend_strength": regime.trend_strength,
                "correlation_matrix": regime.correlation_matrix,
                "description": market_regime_detector.get_regime_description(regime.regime),
                "allocation_adjustment": market_regime_detector.get_regime_adjustment(regime.regime)
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Market regime hatası: {e}")
        return {"error": str(e)}

@app.post("/api/v2.1/backtest")
async def run_backtest(symbol: str, strategy: str = "ma", start_date: str = "2023-01-01", end_date: str = "2024-01-01"):
    """Backtest endpoint"""
    try:
        # Strategy mapping
        strategies = {
            "ma": backtesting_engine.simple_ma_strategy,
            "rsi": backtesting_engine.rsi_strategy
        }
        
        strategy_func = strategies.get(strategy, backtesting_engine.simple_ma_strategy)
        
        result = backtesting_engine.run_backtest(
            symbol=symbol,
            strategy_func=strategy_func,
            start_date=start_date,
            end_date=end_date
        )
        
        return {
            "symbol": symbol,
            "strategy": strategy,
            "start_date": start_date,
            "end_date": end_date,
            "timestamp": datetime.now().isoformat(),
            "results": {
                "total_return_pct": result.total_return_pct,
                "win_rate": result.win_rate,
                "sharpe_ratio": result.sharpe_ratio,
                "max_drawdown_pct": result.max_drawdown_pct,
                "profit_factor": result.profit_factor,
                "total_trades": len(result.trades),
                "avg_win": result.avg_win,
                "avg_loss": result.avg_loss
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Backtest hatası: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
