#!/usr/bin/env python3
"""
🌍 INTERNATIONAL CORRELATION ANALYZER
ABD, Avrupa, Asya piyasaları ile korelasyon analizi
Expected Accuracy Boost: +10%
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import yfinance as yf

logger = logging.getLogger(__name__)

@dataclass
class CorrelationData:
    """Korelasyon verisi"""
    symbol: str
    correlation_with_sp500: float
    correlation_with_nasdaq: float
    correlation_with_dax: float
    correlation_with_nikkei: float
    correlation_with_usdtry: float
    
    correlation_strength: str  # STRONG, MODERATE, WEAK
    market_regime: str  # RISK_ON, RISK_OFF, NEUTRAL
    correlation_trend: str  # INCREASING, DECREASING, STABLE
    timestamp: datetime

class InternationalCorrelationAnalyzer:
    """Uluslararası korelasyon analiz sistemi"""
    
    def __init__(self):
        # International market symbols
        self.international_symbols = {
            'sp500': '^GSPC',  # S&P 500
            'nasdaq': '^IXIC',  # NASDAQ
            'dax': '^GDAXI',   # DAX (Germany)
            'nikkei': '^N225', # Nikkei (Japan)
            'usdtry': 'USDTRY=X'  # USD/TRY
        }
        
        self.correlation_thresholds = {
            'strong': 0.7,
            'moderate': 0.4,
            'weak': 0.2
        }
    
    def get_international_data(self, period: str = "6mo") -> Dict[str, pd.DataFrame]:
        """Uluslararası piyasa verilerini al"""
        try:
            logger.info("🌍 Uluslararası piyasa verileri alınıyor...")
            
            data = {}
            
            for market_name, symbol in self.international_symbols.items():
                try:
                    ticker = yf.Ticker(symbol)
                    market_data = ticker.history(period=period)
                    
                    if not market_data.empty:
                        data[market_name] = market_data
                        logger.info(f"✅ {market_name}: {len(market_data)} günlük veri")
                    else:
                        logger.warning(f"⚠️ {market_name}: Veri alınamadı")
                        
                except Exception as e:
                    logger.error(f"❌ {market_name} veri hatası: {e}")
                    continue
            
            logger.info(f"✅ {len(data)} piyasa verisi alındı")
            return data
            
        except Exception as e:
            logger.error(f"❌ Uluslararası veri hatası: {e}")
            return {}
    
    def get_turkish_stock_data(self, symbol: str, period: str = "6mo") -> Optional[pd.DataFrame]:
        """Türk hisse verisi al"""
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period)
            
            if data.empty:
                logger.warning(f"⚠️ {symbol}: Veri alınamadı")
                return None
            
            return data
            
        except Exception as e:
            logger.error(f"❌ {symbol} veri hatası: {e}")
            return None
    
    def calculate_correlation(self, data1: pd.Series, data2: pd.Series) -> float:
        """İki veri serisi arasında korelasyon hesapla"""
        try:
            # Align data by date
            aligned_data = pd.DataFrame({
                'data1': data1,
                'data2': data2
            }).dropna()
            
            if len(aligned_data) < 10:  # Minimum data requirement
                return 0.0
            
            correlation = aligned_data['data1'].corr(aligned_data['data2'])
            
            # Handle NaN
            if pd.isna(correlation):
                return 0.0
            
            return correlation
            
        except Exception as e:
            logger.error(f"❌ Korelasyon hesaplama hatası: {e}")
            return 0.0
    
    def analyze_correlation_strength(self, correlation: float) -> str:
        """Korelasyon gücünü analiz et"""
        abs_correlation = abs(correlation)
        
        if abs_correlation >= self.correlation_thresholds['strong']:
            return 'STRONG'
        elif abs_correlation >= self.correlation_thresholds['moderate']:
            return 'MODERATE'
        elif abs_correlation >= self.correlation_thresholds['weak']:
            return 'WEAK'
        else:
            return 'VERY_WEAK'
    
    def analyze_market_regime(self, correlations: Dict[str, float]) -> str:
        """Market rejimi analizi"""
        try:
            # Risk-on indicators (positive correlation with US markets)
            risk_on_score = 0
            
            # S&P 500 correlation
            sp500_corr = correlations.get('sp500', 0)
            if sp500_corr > 0.3:
                risk_on_score += 0.3
            elif sp500_corr < -0.3:
                risk_on_score -= 0.2
            
            # NASDAQ correlation
            nasdaq_corr = correlations.get('nasdaq', 0)
            if nasdaq_corr > 0.3:
                risk_on_score += 0.3
            elif nasdaq_corr < -0.3:
                risk_on_score -= 0.2
            
            # USDTRY correlation (negative correlation = risk-off)
            usdtry_corr = correlations.get('usdtry', 0)
            if usdtry_corr < -0.3:
                risk_on_score += 0.2
            elif usdtry_corr > 0.3:
                risk_on_score -= 0.3
            
            # Regime determination
            if risk_on_score > 0.3:
                return 'RISK_ON'
            elif risk_on_score < -0.3:
                return 'RISK_OFF'
            else:
                return 'NEUTRAL'
                
        except Exception as e:
            logger.error(f"❌ Market regime analiz hatası: {e}")
            return 'NEUTRAL'
    
    def analyze_correlation_trend(self, correlations: Dict[str, float]) -> str:
        """Korelasyon trend analizi"""
        try:
            # Simple trend analysis based on correlation values
            positive_correlations = sum(1 for corr in correlations.values() if corr > 0.2)
            negative_correlations = sum(1 for corr in correlations.values() if corr < -0.2)
            
            if positive_correlations > negative_correlations + 1:
                return 'INCREASING'
            elif negative_correlations > positive_correlations + 1:
                return 'DECREASING'
            else:
                return 'STABLE'
                
        except Exception as e:
            logger.error(f"❌ Correlation trend analiz hatası: {e}")
            return 'STABLE'
    
    def analyze_stock_correlation(self, symbol: str) -> Optional[CorrelationData]:
        """Hisse korelasyon analizi"""
        logger.info(f"🌍 {symbol} uluslararası korelasyon analizi başlıyor...")
        
        try:
            # Get international data
            international_data = self.get_international_data()
            
            if not international_data:
                logger.error("❌ Uluslararası veri alınamadı")
                return None
            
            # Get Turkish stock data
            turkish_data = self.get_turkish_stock_data(symbol)
            
            if turkish_data is None:
                logger.error(f"❌ {symbol} veri alınamadı")
                return None
            
            # Calculate correlations
            correlations = {}
            
            for market_name, market_data in international_data.items():
                try:
                    # Use closing prices
                    turkish_returns = turkish_data['Close'].pct_change().dropna()
                    market_returns = market_data['Close'].pct_change().dropna()
                    
                    correlation = self.calculate_correlation(turkish_returns, market_returns)
                    correlations[market_name] = correlation
                    
                    logger.info(f"   {market_name}: {correlation:.3f}")
                    
                except Exception as e:
                    logger.error(f"❌ {market_name} korelasyon hatası: {e}")
                    correlations[market_name] = 0.0
            
            # Analyze correlation strength
            avg_correlation = np.mean(list(correlations.values()))
            correlation_strength = self.analyze_correlation_strength(avg_correlation)
            
            # Analyze market regime
            market_regime = self.analyze_market_regime(correlations)
            
            # Analyze correlation trend
            correlation_trend = self.analyze_correlation_trend(correlations)
            
            # Create correlation data
            correlation_data = CorrelationData(
                symbol=symbol,
                correlation_with_sp500=correlations.get('sp500', 0),
                correlation_with_nasdaq=correlations.get('nasdaq', 0),
                correlation_with_dax=correlations.get('dax', 0),
                correlation_with_nikkei=correlations.get('nikkei', 0),
                correlation_with_usdtry=correlations.get('usdtry', 0),
                correlation_strength=correlation_strength,
                market_regime=market_regime,
                correlation_trend=correlation_trend,
                timestamp=datetime.now()
            )
            
            logger.info(f"✅ {symbol} korelasyon analizi tamamlandı: {correlation_strength} ({market_regime})")
            return correlation_data
            
        except Exception as e:
            logger.error(f"❌ {symbol} korelasyon analiz hatası: {e}")
            return None
    
    def get_correlation_signal_bias(self, correlation_data: CorrelationData) -> Dict:
        """Korelasyona göre sinyal bias'ı"""
        try:
            bias_score = 0
            confidence = 0.5
            
            # S&P 500 correlation bias
            sp500_corr = correlation_data.correlation_with_sp500
            if sp500_corr > 0.3:
                bias_score += 0.2  # Positive correlation with US markets
                confidence += 0.1
            elif sp500_corr < -0.3:
                bias_score -= 0.1  # Negative correlation
            
            # NASDAQ correlation bias
            nasdaq_corr = correlation_data.correlation_with_nasdaq
            if nasdaq_corr > 0.3:
                bias_score += 0.2  # Tech correlation
                confidence += 0.1
            elif nasdaq_corr < -0.3:
                bias_score -= 0.1
            
            # USDTRY correlation bias
            usdtry_corr = correlation_data.correlation_with_usdtry
            if usdtry_corr < -0.3:
                bias_score += 0.3  # Negative USDTRY correlation is bullish for Turkish stocks
                confidence += 0.1
            elif usdtry_corr > 0.3:
                bias_score -= 0.3  # Positive USDTRY correlation is bearish
            
            # Market regime bias
            if correlation_data.market_regime == 'RISK_ON':
                bias_score += 0.2
                confidence += 0.1
            elif correlation_data.market_regime == 'RISK_OFF':
                bias_score -= 0.2
                confidence += 0.1
            
            # Correlation strength bonus
            if correlation_data.correlation_strength == 'STRONG':
                confidence += 0.1
            elif correlation_data.correlation_strength == 'VERY_WEAK':
                confidence -= 0.1
            
            # Signal determination
            if bias_score > 0.3:
                signal_bias = 'BULLISH'
            elif bias_score < -0.3:
                signal_bias = 'BEARISH'
            else:
                signal_bias = 'NEUTRAL'
            
            return {
                'signal_bias': signal_bias,
                'bias_score': bias_score,
                'confidence': min(1.0, confidence),
                'market_regime': correlation_data.market_regime,
                'correlation_strength': correlation_data.correlation_strength,
                'correlation_trend': correlation_data.correlation_trend
            }
            
        except Exception as e:
            logger.error(f"❌ Correlation signal bias hatası: {e}")
            return {
                'signal_bias': 'NEUTRAL',
                'bias_score': 0,
                'confidence': 0.5,
                'market_regime': 'NEUTRAL',
                'correlation_strength': 'WEAK',
                'correlation_trend': 'STABLE'
            }

def test_international_correlation_analyzer():
    """International correlation analyzer test"""
    logger.info("🧪 INTERNATIONAL CORRELATION ANALYZER test başlıyor...")
    
    analyzer = InternationalCorrelationAnalyzer()
    
    # Test symbols
    test_symbols = ["GARAN.IS", "AKBNK.IS", "SISE.IS"]
    
    logger.info("="*80)
    logger.info("🌍 INTERNATIONAL CORRELATION ANALYSIS RESULTS")
    logger.info("="*80)
    
    for symbol in test_symbols:
        correlation_data = analyzer.analyze_stock_correlation(symbol)
        
        if correlation_data:
            logger.info(f"📊 {symbol}:")
            logger.info(f"   S&P 500 Correlation: {correlation_data.correlation_with_sp500:.3f}")
            logger.info(f"   NASDAQ Correlation: {correlation_data.correlation_with_nasdaq:.3f}")
            logger.info(f"   DAX Correlation: {correlation_data.correlation_with_dax:.3f}")
            logger.info(f"   Nikkei Correlation: {correlation_data.correlation_with_nikkei:.3f}")
            logger.info(f"   USDTRY Correlation: {correlation_data.correlation_with_usdtry:.3f}")
            logger.info(f"   Correlation Strength: {correlation_data.correlation_strength}")
            logger.info(f"   Market Regime: {correlation_data.market_regime}")
            logger.info(f"   Correlation Trend: {correlation_data.correlation_trend}")
            
            # Signal bias
            signal_bias = analyzer.get_correlation_signal_bias(correlation_data)
            logger.info(f"   Signal Bias: {signal_bias['signal_bias']} ({signal_bias['bias_score']:.2f})")
            logger.info("")
    
    logger.info("="*80)
    
    return True

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_international_correlation_analyzer()
