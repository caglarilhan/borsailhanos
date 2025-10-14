#!/usr/bin/env python3
"""
Gelişmiş API Endpoint'leri
- AI modelleri entegrasyonu
- US market analizi
- Gelişmiş sentiment analizi
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
import logging

# Local imports
try:
    from backend.services.ai_models import ai_ensemble
    from backend.services.enhanced_sentiment import enhanced_sentiment
    from backend.services.us_market_data import us_market_service
    from backend.services.advanced_analyzer import advanced_analyzer
except ImportError:
    from ..services.ai_models import ai_ensemble
    from ..services.enhanced_sentiment import enhanced_sentiment
    from ..services.us_market_data import us_market_service
    from ..services.advanced_analyzer import advanced_analyzer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v2", tags=["Enhanced AI"])

class SentimentRequest(BaseModel):
    text: str
    symbol: Optional[str] = None

class AIAnalysisRequest(BaseModel):
    symbol: str
    text: Optional[str] = None

@router.post("/sentiment/advanced")
async def advanced_sentiment_analysis(request: SentimentRequest):
    """Gelişmiş sentiment analizi"""
    try:
        result = await enhanced_sentiment.analyze_comprehensive_sentiment(
            request.text, request.symbol or ""
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ai/analyze/{symbol}")
async def ai_comprehensive_analysis(symbol: str):
    """AI kapsamlı analiz"""
    try:
        # AI ensemble analizi
        result = await ai_ensemble.ensemble_prediction(symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/us/analyze/{symbol}")
async def us_stock_analysis(symbol: str):
    """US hisse analizi"""
    try:
        result = await us_market_service.analyze_us_stock(symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/us/major-indices")
async def us_major_indices():
    """US ana endeksler"""
    try:
        indices = {}
        for symbol, name in us_market_service.US_MAJOR_INDICES.items():
            df = await us_market_service.fetch_us_stock_data(symbol, period="1mo", interval="1d")
            if not df.empty:
                current_price = df['close'].iloc[-1]
                prev_price = df['close'].iloc[-2] if len(df) > 1 else current_price
                change = (current_price - prev_price) / prev_price
                
                indices[symbol] = {
                    'name': name,
                    'current_price': current_price,
                    'change_1d': change,
                    'change_pct': change * 100
                }
        
        return {'indices': indices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/us/top-stocks")
async def us_top_stocks():
    """US top hisseler"""
    try:
        stocks = {}
        for symbol, name in us_market_service.US_TOP_STOCKS.items():
            analysis = await us_market_service.analyze_us_stock(symbol)
            if analysis:
                stocks[symbol] = {
                    'name': name,
                    'current_price': analysis['price_data']['current_price'],
                    'change_1d': analysis['price_data']['change_1d'],
                    'final_score': analysis['final_score'],
                    'recommendation': analysis['recommendation']
                }
        
        return {'stocks': stocks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/predict")
async def ai_price_prediction(request: AIAnalysisRequest):
    """AI fiyat tahmini"""
    try:
        # LSTM tahmin
        lstm_pred = await ai_ensemble.lstm.predict_next_price(request.symbol)
        
        # TimeGPT tahmin
        timegpt_pred = await ai_ensemble.timegpt.predict(request.symbol)
        
        # Ensemble tahmin
        ensemble_result = await ai_ensemble.ensemble_prediction(
            request.symbol, request.text or ""
        )
        
        return {
            'symbol': request.symbol,
            'lstm_prediction': lstm_pred,
            'timegpt_prediction': timegpt_pred,
            'ensemble_result': ensemble_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ai/models/status")
async def ai_models_status():
    """AI modelleri durumu"""
    try:
        return {
            'finbert_loaded': ai_ensemble.finbert.is_loaded,
            'lstm_trained': ai_ensemble.lstm.is_trained,
            'timegpt_available': ai_ensemble.timegpt.is_available,
            'models_ready': (
                ai_ensemble.finbert.is_loaded and 
                ai_ensemble.lstm.is_trained and 
                ai_ensemble.timegpt.is_available
            )
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/models/initialize")
async def initialize_ai_models():
    """AI modelleri başlat"""
    try:
        ai_ensemble.initialize_models()
        return {'status': 'success', 'message': 'AI modelleri başlatıldı'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/advanced/analyze/{symbol}")
async def advanced_comprehensive_analysis(symbol: str):
    """Gelişmiş kapsamlı analiz"""
    try:
        result = await advanced_analyzer.comprehensive_analysis(symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/compare/bist-vs-us")
async def compare_bist_vs_us():
    """BIST vs US karşılaştırması"""
    try:
        # BIST 100
        bist_symbols = ['SISE.IS', 'EREGL.IS', 'TUPRS.IS', 'AKBNK.IS', 'GARAN.IS']
        bist_analysis = {}
        
        for symbol in bist_symbols:
            analysis = await advanced_analyzer.comprehensive_analysis(symbol)
            if analysis:
                bist_analysis[symbol] = {
                    'final_confidence': analysis.get('final_confidence', 0),
                    'recommendation': analysis.get('recommendation', {}),
                    'price_change_1d': analysis.get('price_analysis', {}).get('price_change_1d', 0)
                }
        
        # US Top Stocks
        us_symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
        us_analysis = {}
        
        for symbol in us_symbols:
            analysis = await us_market_service.analyze_us_stock(symbol)
            if analysis:
                us_analysis[symbol] = {
                    'final_score': analysis.get('final_score', 0),
                    'recommendation': analysis.get('recommendation', {}),
                    'price_change_1d': analysis.get('price_data', {}).get('change_1d', 0)
                }
        
        return {
            'bist_analysis': bist_analysis,
            'us_analysis': us_analysis,
            'comparison': {
                'bist_avg_confidence': sum(a.get('final_confidence', 0) for a in bist_analysis.values()) / len(bist_analysis) if bist_analysis else 0,
                'us_avg_score': sum(a.get('final_score', 0) for a in us_analysis.values()) / len(us_analysis) if us_analysis else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



