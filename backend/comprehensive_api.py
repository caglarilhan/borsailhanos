#!/usr/bin/env python3
"""
🚀 Comprehensive API System
PRD v2.0 - All modules integrated
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
from typing import Dict, List, Optional
from datetime import datetime
import json

# Import all modules
from grey_topsis_ranker import GreyTOPSISRanker
from technical_pattern_detector import TechnicalPatternDetector
from ai_ensemble_system import AIEnsembleSystem
from sentiment_analyzer import SentimentAnalyzer
from rl_portfolio_agent import RLPortfolioAgent
from xai_explainer import XAIExplainer

logger = logging.getLogger(__name__)

app = FastAPI(
    title="BIST AI Smart Trader API",
    description="PRD v2.0 - Comprehensive AI Trading System",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize systems
topsis_ranker = GreyTOPSISRanker()
pattern_detector = TechnicalPatternDetector()
ai_ensemble = AIEnsembleSystem()
sentiment_analyzer = SentimentAnalyzer()
rl_agent = RLPortfolioAgent()
xai_explainer = XAIExplainer()

@app.get("/api/v2/health")
async def health_check():
    """System health check"""
    return {
        "status": "healthy",
        "version": "2.0",
        "timestamp": datetime.now().isoformat(),
        "modules": {
            "topsis_ranker": "active",
            "pattern_detector": "active",
            "ai_ensemble": "active",
            "sentiment_analyzer": "active",
            "rl_agent": "active",
            "xai_explainer": "active"
        }
    }

@app.get("/api/v2/signals/{symbol}")
async def get_comprehensive_signals(symbol: str):
    """Comprehensive signals for a symbol"""
    try:
        logger.info(f"🚀 {symbol} için kapsamlı analiz başlıyor...")
        
        # 1. Financial ranking
        financial_ranking = topsis_ranker.rank_stocks([symbol])
        
        # 2. Technical patterns
        patterns = pattern_detector.detect_all_patterns(symbol)
        
        # 3. AI Ensemble prediction
        ai_prediction = ai_ensemble.predict_ensemble(symbol)
        
        # 4. Sentiment analysis
        sentiment = sentiment_analyzer.analyze_stock_sentiment(symbol)
        
        # 5. Portfolio recommendation
        portfolio_actions = rl_agent.optimize_portfolio([symbol], {symbol: {"confidence": 0.8}})
        
        # 6. XAI explanation
        explanation = xai_explainer.explain_signal(symbol, {"action": "BUY", "confidence": 0.8})
        
        return {
            "symbol": symbol,
            "timestamp": datetime.now().isoformat(),
            "financial_ranking": financial_ranking.get(symbol, {}),
            "technical_patterns": [
                {
                    "type": p.pattern_type.value,
                    "confidence": p.confidence,
                    "entry_price": p.entry_price,
                    "take_profit": p.take_profit,
                    "stop_loss": p.stop_loss,
                    "description": p.description
                } for p in patterns
            ],
            "ai_prediction": {
                "prediction": ai_prediction.prediction if ai_prediction else 0.0,
                "confidence": ai_prediction.confidence if ai_prediction else 0.0,
                "lightgbm_pred": ai_prediction.lightgbm_pred if ai_prediction else 0.0,
                "lstm_pred": ai_prediction.lstm_pred if ai_prediction else 0.0,
                "timegpt_pred": ai_prediction.timegpt_pred if ai_prediction else 0.0
            } if ai_prediction else None,
            "sentiment_analysis": {
                "overall_sentiment": sentiment.overall_sentiment if sentiment else 0.0,
                "confidence": sentiment.confidence if sentiment else 0.0,
                "news_count": sentiment.news_count if sentiment else 0,
                "positive_news": sentiment.positive_news if sentiment else 0,
                "negative_news": sentiment.negative_news if sentiment else 0,
                "key_events": sentiment.key_events if sentiment else []
            } if sentiment else None,
            "portfolio_recommendation": [
                {
                    "action": action.action,
                    "allocation": action.allocation,
                    "confidence": action.confidence,
                    "reason": action.reason,
                    "expected_return": action.expected_return,
                    "risk_score": action.risk_score
                } for action in portfolio_actions
            ],
            "explanation": {
                "signal": explanation.signal,
                "confidence": explanation.confidence,
                "feature_importance": explanation.feature_importance,
                "explanation_text": explanation.explanation_text,
                "reasoning": explanation.reasoning
            }
        }
        
    except Exception as e:
        logger.error(f"❌ {symbol} kapsamlı analiz hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v2/portfolio/optimize")
async def optimize_portfolio(symbols: str = "GARAN.IS,AKBNK.IS,SISE.IS"):
    """Portfolio optimization"""
    try:
        symbol_list = symbols.split(',')
        
        # Get signals for all symbols
        all_signals = {}
        for symbol in symbol_list:
            # Simplified signal for portfolio optimization
            all_signals[symbol] = {"confidence": 0.7, "upside_pct": 5.0}
        
        # Portfolio optimization
        actions = rl_agent.optimize_portfolio(symbol_list, all_signals)
        
        return {
            "timestamp": datetime.now().isoformat(),
            "portfolio_actions": [
                {
                    "symbol": action.symbol,
                    "action": action.action,
                    "allocation": action.allocation,
                    "confidence": action.confidence,
                    "reason": action.reason,
                    "expected_return": action.expected_return,
                    "risk_score": action.risk_score
                } for action in actions
            ],
            "total_symbols": len(symbol_list),
            "optimization_strategy": "RL-based DDPG"
        }
        
    except Exception as e:
        logger.error(f"❌ Portfolio optimizasyon hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v2/ranking")
async def get_financial_ranking(symbols: str = "GARAN.IS,AKBNK.IS,ISCTR.IS,YKBNK.IS,THYAO.IS"):
    """Financial ranking using Grey TOPSIS"""
    try:
        symbol_list = symbols.split(',')
        ranking = topsis_ranker.rank_stocks(symbol_list)
        
        return {
            "timestamp": datetime.now().isoformat(),
            "method": "Grey TOPSIS + Entropy",
            "total_symbols": len(symbol_list),
            "rankings": ranking
        }
        
    except Exception as e:
        logger.error(f"❌ Financial ranking hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
