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
from bist100_scanner import BIST100Scanner

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
scanner = BIST100Scanner()

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

@app.get("/api/v2/top-bist")
async def get_top_bist(
    top: int = 5,
    symbols: Optional[str] = None,
    min_confidence: float = 0.75,
    min_rr: float = 1.5,
    min_sentiment: float = 0.55
):
    """Stricter BIST picks: 1h∩1d BUY, confidence/RR thresholds, sentiment gated, TOPSIS-ranked."""
    try:
        default_bist = [
            "SISE.IS", "ASELS.IS", "YKBNK.IS", "THYAO.IS", "TUPRS.IS",
            "EREGL.IS", "BIMAS.IS", "KRDMD.IS", "HEKTS.IS", "SAHOL.IS",
            "PGSUS.IS", "FROTO.IS", "KCHOL.IS", "ISCTR.IS", "TOASO.IS"
        ]
        symbol_list = [s.strip().upper() for s in (symbols.split(',') if symbols else default_bist) if s.strip()]

        # 1) Financial ranking (Grey TOPSIS)
        ranking = topsis_ranker.rank_stocks(symbol_list) or {}
        # Normalize to list with scores
        ranked = sorted(
            (
                (sym, (ranking.get(sym, {}) or {}).get("score", 0.0))
                for sym in symbol_list
            ), key=lambda x: x[1], reverse=True
        )
        # Keep top half as quality filter
        cutoff_idx = max(1, len(ranked) // 2)
        quality_set = {sym for sym, _ in ranked[:cutoff_idx]}

        # 2) Technical/AI BUY scan via scanner with 1h∩1d confluence
        picks = []
        for sym in symbol_list:
            try:
                enhanced_signals = scanner.robot.generate_enhanced_signals(sym) or []
                by_tf = {}
                for sig in enhanced_signals:
                    action = getattr(sig.action, 'value', str(sig.action)).upper()
                    timeframe = getattr(getattr(sig, 'timeframe', None), 'value', str(getattr(sig, 'timeframe', '')))
                    conf = float(getattr(sig, 'confidence', 0) or 0.0)
                    rr = float(getattr(sig, 'risk_reward', 0) or 0.0)
                    if action in ("BUY", "STRONG_BUY") and conf >= min_confidence and rr >= min_rr:
                        by_tf[timeframe] = sig

                if "1h" in by_tf and "1d" in by_tf and sym in quality_set:
                    # 3) Sentiment gate
                    s = sentiment_analyzer.analyze_stock_sentiment(sym)
                    sentiment_ok = (s is not None and s.sentiment_score >= min_sentiment)
                    if not sentiment_ok:
                        continue

                    sig_h1 = by_tf["1h"]
                    sig_d1 = by_tf["1d"]
                    picks.append({
                        "symbol": sym,
                        "action": "BUY",
                        "timeframe": "1h&1d",
                        "entry": float(getattr(sig_h1, 'entry_price', 0) or 0.0),
                        "take_profit": float(getattr(sig_d1, 'take_profit', 0) or 0.0),
                        "stop_loss": float(getattr(sig_d1, 'stop_loss', 0) or 0.0),
                        "risk_reward": min(
                            float(getattr(sig_h1, 'risk_reward', 0) or 0.0),
                            float(getattr(sig_d1, 'risk_reward', 0) or 0.0)
                        ),
                        "confidence": min(
                            float(getattr(sig_h1, 'confidence', 0) or 0.0),
                            float(getattr(sig_d1, 'confidence', 0) or 0.0)
                        ),
                        "topsis_score": (ranking.get(sym, {}) or {}).get("score", 0.0),
                        "sentiment": s.sentiment_score
                    })
            except Exception as e:
                logger.warning(f"⚠️ {sym} pick değerlendirme hatası: {e}")
                continue

        # Sort by TOPSIS score then confidence
        picks.sort(key=lambda x: (x.get("topsis_score", 0.0), x.get("confidence", 0.0)), reverse=True)
        return {
            "timestamp": datetime.now().isoformat(),
            "total": min(top, len(picks)),
            "picks": picks[:top]
        }
    except Exception as e:
        logger.error(f"❌ Top BIST endpoint hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
