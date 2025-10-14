"""
BIST 100 AI Tahmin Sistemi
Gelişmiş yapay zeka modelleri ile BIST 100 hisselerinin tahmin edilmesi
"""

import asyncio
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import yfinance as yf
import logging

# Mock AI models for demonstration
class MockAIModel:
    def __init__(self, name: str, accuracy: float):
        self.name = name
        self.accuracy = accuracy
        self.predictions_count = 0
    
    def predict(self, symbol: str, features: Dict) -> Dict:
        """Mock prediction method"""
        self.predictions_count += 1
        
        # Simulate prediction based on features
        base_price = features.get('current_price', 100)
        rsi = features.get('rsi', 50)
        volume_ratio = features.get('volume_ratio', 1.0)
        sentiment = features.get('sentiment', 0.5)
        
        # Simple mock logic
        if rsi < 30:  # Oversold
            change = np.random.uniform(0.02, 0.08)
        elif rsi > 70:  # Overbought
            change = np.random.uniform(-0.08, -0.02)
        else:
            change = np.random.uniform(-0.03, 0.03)
        
        # Adjust based on volume and sentiment
        change *= volume_ratio * (sentiment - 0.5) * 2
        
        predicted_price = base_price * (1 + change)
        confidence = min(0.99, self.accuracy + np.random.uniform(-0.1, 0.1))
        
        return {
            'predicted_price': round(predicted_price, 2),
            'change_percent': round(change * 100, 2),
            'confidence': round(confidence, 3),
            'model': self.name
        }

class BIST100AIPredictor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Initialize AI models
        self.models = {
            'lightgbm': MockAIModel('LightGBM', 0.87),
            'lstm': MockAIModel('LSTM', 0.82),
            'timegpt': MockAIModel('TimeGPT', 0.79),
            'ensemble': MockAIModel('Ensemble', 0.91)
        }
        
        # BIST 100 symbols
        self.bist100_symbols = [
            'THYAO.IS', 'ASELS.IS', 'TUPRS.IS', 'SISE.IS', 'EREGL.IS',
            'AKBNK.IS', 'GARAN.IS', 'ISCTR.IS', 'YKBNK.IS', 'HALKB.IS',
            'KOZAL.IS', 'KCHOL.IS', 'SAHOL.IS', 'TOASO.IS', 'ARCLK.IS',
            'PETKM.IS', 'TCELL.IS', 'BIMAS.IS', 'MGROS.IS', 'SOKM.IS'
        ]
        
        # Cache for predictions
        self.predictions_cache = {}
        self.last_update = None
        
    async def get_stock_data(self, symbol: str) -> Dict:
        """Get stock data from yfinance"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="5d", interval="1h")
            
            if hist.empty:
                return {}
            
            current_price = hist['Close'].iloc[-1]
            volume = hist['Volume'].iloc[-1]
            avg_volume = hist['Volume'].mean()
            
            # Calculate technical indicators
            rsi = self._calculate_rsi(hist['Close'])
            macd, macd_signal = self._calculate_macd(hist['Close'])
            
            return {
                'current_price': float(current_price),
                'volume': int(volume),
                'volume_ratio': float(volume / avg_volume) if avg_volume > 0 else 1.0,
                'rsi': float(rsi) if not np.isnan(rsi) else 50,
                'macd': float(macd) if not np.isnan(macd) else 0,
                'macd_signal': float(macd_signal) if not np.isnan(macd_signal) else 0,
                'price_change': float((current_price - hist['Close'].iloc[-2]) / hist['Close'].iloc[-2] * 100) if len(hist) > 1 else 0
            }
        except Exception as e:
            self.logger.error(f"Error getting data for {symbol}: {e}")
            return {}
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> float:
        """Calculate RSI indicator"""
        try:
            delta = prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            return rsi.iloc[-1]
        except:
            return 50
    
    def _calculate_macd(self, prices: pd.Series) -> Tuple[float, float]:
        """Calculate MACD indicator"""
        try:
            exp1 = prices.ewm(span=12).mean()
            exp2 = prices.ewm(span=26).mean()
            macd = exp1 - exp2
            signal = macd.ewm(span=9).mean()
            return macd.iloc[-1], signal.iloc[-1]
        except:
            return 0, 0
    
    async def get_sentiment_score(self, symbol: str) -> float:
        """Get sentiment score (mock implementation)"""
        # In real implementation, this would analyze news, social media, etc.
        return np.random.uniform(0.3, 0.9)
    
    async def predict_single_stock(self, symbol: str, timeframe: str = '1d') -> Dict:
        """Predict single stock price"""
        try:
            # Get stock data
            stock_data = await self.get_stock_data(symbol)
            if not stock_data:
                return {}
            
            # Get sentiment
            sentiment = await self.get_sentiment_score(symbol)
            
            # Prepare features
            features = {
                **stock_data,
                'sentiment': sentiment,
                'timeframe': timeframe
            }
            
            # Get predictions from all models
            predictions = {}
            for model_name, model in self.models.items():
                pred = model.predict(symbol, features)
                predictions[model_name] = pred
            
            # Ensemble prediction (weighted average)
            weights = {'lightgbm': 0.3, 'lstm': 0.25, 'timegpt': 0.2, 'ensemble': 0.25}
            ensemble_price = sum(pred['predicted_price'] * weights[model] for model, pred in predictions.items())
            ensemble_confidence = sum(pred['confidence'] * weights[model] for model, pred in predictions.items())
            
            # Calculate scores
            technical_score = self._calculate_technical_score(features)
            fundamental_score = self._calculate_fundamental_score(symbol, features)
            ai_score = ensemble_confidence
            
            # Determine recommendation
            change_percent = (ensemble_price - stock_data['current_price']) / stock_data['current_price'] * 100
            recommendation = self._get_recommendation(change_percent, ensemble_confidence)
            risk_level = self._get_risk_level(ensemble_confidence, abs(change_percent))
            
            # Generate reasons
            reasons = self._generate_reasons(features, change_percent)
            
            return {
                'symbol': symbol.replace('.IS', ''),
                'current_price': stock_data['current_price'],
                'predicted_price': round(ensemble_price, 2),
                'change_percent': round(change_percent, 2),
                'confidence': round(ensemble_confidence, 3),
                'timeframe': timeframe,
                'ai_score': round(ai_score, 3),
                'technical_score': round(technical_score, 3),
                'fundamental_score': round(fundamental_score, 3),
                'sentiment_score': round(sentiment, 3),
                'recommendation': recommendation,
                'risk_level': risk_level,
                'reasons': reasons,
                'volume': stock_data['volume'],
                'market_cap': self._get_market_cap(symbol),
                'pe_ratio': self._get_pe_ratio(symbol),
                'last_update': datetime.now().isoformat(),
                'model_predictions': predictions
            }
            
        except Exception as e:
            self.logger.error(f"Error predicting {symbol}: {e}")
            return {}
    
    def _calculate_technical_score(self, features: Dict) -> float:
        """Calculate technical analysis score"""
        rsi = features.get('rsi', 50)
        macd = features.get('macd', 0)
        macd_signal = features.get('macd_signal', 0)
        volume_ratio = features.get('volume_ratio', 1.0)
        
        score = 0.5  # Base score
        
        # RSI contribution
        if 30 <= rsi <= 70:
            score += 0.2
        elif rsi < 30:  # Oversold - bullish
            score += 0.3
        elif rsi > 70:  # Overbought - bearish
            score -= 0.2
        
        # MACD contribution
        if macd > macd_signal:
            score += 0.2
        else:
            score -= 0.1
        
        # Volume contribution
        if volume_ratio > 1.5:
            score += 0.1
        
        return max(0, min(1, score))
    
    def _calculate_fundamental_score(self, symbol: str, features: Dict) -> float:
        """Calculate fundamental analysis score (mock)"""
        # In real implementation, this would analyze financial statements
        return np.random.uniform(0.6, 0.9)
    
    def _get_recommendation(self, change_percent: float, confidence: float) -> str:
        """Get trading recommendation"""
        if confidence < 0.7:
            return 'Bekle'
        
        if change_percent > 5:
            return 'Güçlü Al'
        elif change_percent > 2:
            return 'Al'
        elif change_percent < -5:
            return 'Güçlü Sat'
        elif change_percent < -2:
            return 'Sat'
        else:
            return 'Bekle'
    
    def _get_risk_level(self, confidence: float, change_magnitude: float) -> str:
        """Get risk level"""
        if confidence > 0.9 and change_magnitude < 3:
            return 'Düşük'
        elif confidence > 0.8 and change_magnitude < 5:
            return 'Orta'
        else:
            return 'Yüksek'
    
    def _generate_reasons(self, features: Dict, change_percent: float) -> List[str]:
        """Generate prediction reasons"""
        reasons = []
        
        rsi = features.get('rsi', 50)
        volume_ratio = features.get('volume_ratio', 1.0)
        sentiment = features.get('sentiment', 0.5)
        
        if rsi < 30:
            reasons.append('RSI oversold seviyede (aşırı satım)')
        elif rsi > 70:
            reasons.append('RSI overbought seviyede (aşırı alım)')
        
        if volume_ratio > 1.5:
            reasons.append('Hacim ortalamanın %150 üzerinde')
        elif volume_ratio < 0.5:
            reasons.append('Hacim ortalamanın altında')
        
        if sentiment > 0.7:
            reasons.append('Pozitif sentiment (%70+)')
        elif sentiment < 0.3:
            reasons.append('Negatif sentiment (%30-)')
        
        if change_percent > 0:
            reasons.append('Teknik göstergeler yükseliş sinyali veriyor')
        else:
            reasons.append('Teknik göstergeler düşüş sinyali veriyor')
        
        return reasons[:5]  # Limit to 5 reasons
    
    def _get_market_cap(self, symbol: str) -> int:
        """Get market cap (mock)"""
        # In real implementation, this would fetch from financial data
        mock_caps = {
            'THYAO.IS': 45000000000,
            'ASELS.IS': 18000000000,
            'TUPRS.IS': 25000000000,
            'SISE.IS': 12000000000,
            'EREGL.IS': 20000000000
        }
        return mock_caps.get(symbol, 10000000000)
    
    def _get_pe_ratio(self, symbol: str) -> float:
        """Get P/E ratio (mock)"""
        # In real implementation, this would fetch from financial data
        mock_pe = {
            'THYAO.IS': 12.5,
            'ASELS.IS': 18.2,
            'TUPRS.IS': 8.9,
            'SISE.IS': 15.3,
            'EREGL.IS': 11.7
        }
        return mock_pe.get(symbol, 15.0)
    
    async def predict_bist100(self, timeframe: str = '1d', limit: int = 20) -> List[Dict]:
        """Predict BIST 100 stocks"""
        try:
            predictions = []
            
            # Process stocks in batches to avoid rate limiting
            batch_size = 5
            for i in range(0, min(len(self.bist100_symbols), limit), batch_size):
                batch = self.bist100_symbols[i:i + batch_size]
                
                # Process batch concurrently
                tasks = [self.predict_single_stock(symbol, timeframe) for symbol in batch]
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Filter successful predictions
                for result in batch_results:
                    if isinstance(result, dict) and result:
                        predictions.append(result)
                
                # Small delay between batches
                await asyncio.sleep(0.5)
            
            # Sort by confidence
            predictions.sort(key=lambda x: x.get('confidence', 0), reverse=True)
            
            self.predictions_cache[timeframe] = {
                'predictions': predictions,
                'timestamp': datetime.now().isoformat()
            }
            
            return predictions
            
        except Exception as e:
            self.logger.error(f"Error predicting BIST 100: {e}")
            return []
    
    async def get_model_status(self) -> Dict:
        """Get AI models status"""
        return {
            'models': {
                name: {
                    'name': model.name,
                    'accuracy': model.accuracy,
                    'predictions_count': model.predictions_count,
                    'status': 'active'
                }
                for name, model in self.models.items()
            },
            'last_update': datetime.now().isoformat()
        }
    
    async def get_prediction_history(self, symbol: str, hours: int = 24) -> List[Dict]:
        """Get prediction history for a symbol"""
        # Mock implementation - in real system, this would fetch from database
        history = []
        base_time = datetime.now()
        
        for i in range(hours):
            timestamp = base_time - timedelta(hours=i)
            history.append({
                'timestamp': timestamp.isoformat(),
                'predicted_price': np.random.uniform(80, 120),
                'actual_price': np.random.uniform(75, 125),
                'confidence': np.random.uniform(0.7, 0.95),
                'model': 'Ensemble'
            })
        
        return history

# Global instance
bist100_predictor = BIST100AIPredictor()
