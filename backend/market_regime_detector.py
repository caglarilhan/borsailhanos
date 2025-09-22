#!/usr/bin/env python3
"""
🌊 Market Regime Detection System
PRD v2.0 Enhancement - Hidden Markov Model for market regime detection
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import yfinance as yf
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

@dataclass
class MarketRegime:
    """Market rejimi"""
    regime: str  # 'RISK_ON', 'RISK_OFF', 'NEUTRAL'
    confidence: float
    duration_days: int
    volatility: float
    trend_strength: float
    correlation_matrix: Dict[str, float]
    timestamp: datetime

class MarketRegimeDetector:
    """Market rejim tespit sistemi"""
    
    def __init__(self):
        self.current_regime = None
        self.regime_history = []
        self.scaler = StandardScaler()
        
        # Market rejimleri
        self.regimes = {
            'RISK_ON': {
                'description': 'Risk-on environment - Growth stocks favored',
                'characteristics': ['Low volatility', 'High correlation', 'Upward trend'],
                'allocation_adjustment': {'growth': 1.2, 'value': 0.8, 'defensive': 0.6}
            },
            'RISK_OFF': {
                'description': 'Risk-off environment - Defensive assets favored',
                'characteristics': ['High volatility', 'Low correlation', 'Downward trend'],
                'allocation_adjustment': {'growth': 0.6, 'value': 0.8, 'defensive': 1.2}
            },
            'NEUTRAL': {
                'description': 'Neutral market - Balanced approach',
                'characteristics': ['Medium volatility', 'Mixed signals', 'Sideways trend'],
                'allocation_adjustment': {'growth': 1.0, 'value': 1.0, 'defensive': 1.0}
            }
        }
    
    def detect_market_regime(self, symbols: List[str] = None) -> MarketRegime:
        """Market rejimini tespit et"""
        logger.info("🌊 Market rejim analizi başlıyor...")
        
        try:
            if symbols is None:
                symbols = [
                    "GARAN.IS", "AKBNK.IS", "ISCTR.IS", "YKBNK.IS", "THYAO.IS",
                    "SISE.IS", "EREGL.IS", "TUPRS.IS", "ASELS.IS", "KRDMD.IS"
                ]
            
            # Market verilerini topla
            market_data = self._collect_market_data(symbols)
            
            if market_data.empty:
                logger.error("❌ Market verisi bulunamadı")
                return self._default_regime()
            
            # Rejim özelliklerini hesapla
            features = self._calculate_regime_features(market_data)
            
            # HMM ile rejim tespiti
            regime, confidence = self._detect_regime_hmm(features)
            
            # Rejim süresini hesapla
            duration = self._calculate_regime_duration(regime)
            
            # Volatilite ve trend gücü
            volatility = self._calculate_market_volatility(market_data)
            trend_strength = self._calculate_trend_strength(market_data)
            
            # Korelasyon matrisi
            correlation_matrix = self._calculate_correlation_matrix(market_data)
            
            market_regime = MarketRegime(
                regime=regime,
                confidence=confidence,
                duration_days=duration,
                volatility=volatility,
                trend_strength=trend_strength,
                correlation_matrix=correlation_matrix,
                timestamp=datetime.now()
            )
            
            self.current_regime = market_regime
            self.regime_history.append(market_regime)
            
            logger.info(f"✅ Market rejimi tespit edildi: {regime} (Güven: {confidence:.2f})")
            return market_regime
            
        except Exception as e:
            logger.error(f"❌ Market rejim tespiti hatası: {e}")
            return self._default_regime()
    
    def _collect_market_data(self, symbols: List[str]) -> pd.DataFrame:
        """Market verilerini topla"""
        logger.info(f"📊 {len(symbols)} hisse için market verisi toplanıyor...")
        
        all_data = []
        
        for symbol in symbols:
            try:
                stock = yf.Ticker(symbol)
                data = stock.history(period="6mo")
                
                if not data.empty:
                    data['symbol'] = symbol
                    data['returns'] = data['Close'].pct_change()
                    data['volatility'] = data['returns'].rolling(20).std()
                    all_data.append(data)
                    
            except Exception as e:
                logger.error(f"❌ {symbol} veri hatası: {e}")
                continue
        
        if all_data:
            combined_data = pd.concat(all_data, ignore_index=True)
            logger.info(f"✅ Market verisi toplandı: {len(combined_data)} kayıt")
            return combined_data
        else:
            return pd.DataFrame()
    
    def _calculate_regime_features(self, data: pd.DataFrame) -> np.ndarray:
        """Rejim özelliklerini hesapla"""
        features = []
        
        # Market genel özellikleri
        market_features = data.groupby('Date').agg({
            'returns': ['mean', 'std'],
            'volatility': 'mean',
            'Volume': 'sum'
        }).reset_index()
        
        market_features.columns = ['Date', 'market_return', 'market_volatility', 'avg_volatility', 'total_volume']
        
        # Rolling features
        market_features['volatility_ma'] = market_features['market_volatility'].rolling(20).mean()
        market_features['return_ma'] = market_features['market_return'].rolling(20).mean()
        market_features['volume_ma'] = market_features['total_volume'].rolling(20).mean()
        
        # Trend features
        market_features['trend'] = market_features['market_return'].rolling(20).sum()
        market_features['momentum'] = market_features['market_return'].rolling(10).sum()
        
        # Volatility regime features
        market_features['vol_regime'] = np.where(
            market_features['market_volatility'] > market_features['volatility_ma'] * 1.2, 1, 0
        )
        
        # Volume regime features
        market_features['volume_regime'] = np.where(
            market_features['total_volume'] > market_features['volume_ma'] * 1.5, 1, 0
        )
        
        # Feature matrix
        feature_cols = [
            'market_return', 'market_volatility', 'avg_volatility',
            'volatility_ma', 'return_ma', 'volume_ma',
            'trend', 'momentum', 'vol_regime', 'volume_regime'
        ]
        
        feature_matrix = market_features[feature_cols].dropna().values
        
        # Normalize features
        if len(feature_matrix) > 0:
            feature_matrix = self.scaler.fit_transform(feature_matrix)
        
        return feature_matrix
    
    def _detect_regime_hmm(self, features: np.ndarray) -> Tuple[str, float]:
        """HMM ile rejim tespiti"""
        try:
            if len(features) < 50:
                logger.warning("⚠️ Yeterli veri yok, varsayılan rejim")
                return 'NEUTRAL', 0.5
            
            # Gaussian Mixture Model (HMM approximation)
            n_components = 3
            gmm = GaussianMixture(n_components=n_components, random_state=42)
            gmm.fit(features)
            
            # Son veri noktası için tahmin
            last_features = features[-1:].reshape(1, -1)
            regime_probs = gmm.predict_proba(last_features)[0]
            
            # En yüksek olasılıklı rejim
            regime_idx = np.argmax(regime_probs)
            confidence = regime_probs[regime_idx]
            
            # Rejim mapping
            regime_mapping = {0: 'RISK_OFF', 1: 'NEUTRAL', 2: 'RISK_ON'}
            regime = regime_mapping.get(regime_idx, 'NEUTRAL')
            
            logger.info(f"🎯 HMM tahmin: {regime} (Olasılık: {confidence:.3f})")
            return regime, confidence
            
        except Exception as e:
            logger.error(f"❌ HMM tespiti hatası: {e}")
            return 'NEUTRAL', 0.5
    
    def _calculate_regime_duration(self, current_regime: str) -> int:
        """Rejim süresini hesapla"""
        if not self.regime_history:
            return 1
        
        duration = 1
        for regime in reversed(self.regime_history[-10:]):  # Son 10 günü kontrol et
            if regime.regime == current_regime:
                duration += 1
            else:
                break
        
        return duration
    
    def _calculate_market_volatility(self, data: pd.DataFrame) -> float:
        """Market volatilitesini hesapla"""
        try:
            recent_data = data.tail(30)  # Son 30 gün
            volatility = recent_data['volatility'].mean()
            return float(volatility)
        except:
            return 0.02  # Varsayılan volatilite
    
    def _calculate_trend_strength(self, data: pd.DataFrame) -> float:
        """Trend gücünü hesapla"""
        try:
            recent_data = data.tail(20)  # Son 20 gün
            returns = recent_data['returns'].dropna()
            
            if len(returns) > 0:
                trend_strength = abs(returns.mean()) / returns.std()
                return float(min(trend_strength, 2.0))  # Max 2.0
            else:
                return 0.0
        except:
            return 0.0
    
    def _calculate_correlation_matrix(self, data: pd.DataFrame) -> Dict[str, float]:
        """Korelasyon matrisini hesapla"""
        try:
            # Symbol bazında returns hesapla
            symbol_returns = data.groupby('symbol')['returns'].apply(list).to_dict()
            
            correlations = {}
            symbols = list(symbol_returns.keys())
            
            for i, sym1 in enumerate(symbols):
                for j, sym2 in enumerate(symbols[i+1:], i+1):
                    if len(symbol_returns[sym1]) > 10 and len(symbol_returns[sym2]) > 10:
                        # Minimum uzunlukta kes
                        min_len = min(len(symbol_returns[sym1]), len(symbol_returns[sym2]))
                        ret1 = symbol_returns[sym1][-min_len:]
                        ret2 = symbol_returns[sym2][-min_len:]
                        
                        corr = np.corrcoef(ret1, ret2)[0, 1]
                        if not np.isnan(corr):
                            correlations[f"{sym1}_{sym2}"] = float(corr)
            
            return correlations
            
        except Exception as e:
            logger.error(f"❌ Korelasyon hesaplama hatası: {e}")
            return {}
    
    def _default_regime(self) -> MarketRegime:
        """Varsayılan rejim"""
        return MarketRegime(
            regime='NEUTRAL',
            confidence=0.5,
            duration_days=1,
            volatility=0.02,
            trend_strength=0.0,
            correlation_matrix={},
            timestamp=datetime.now()
        )
    
    def get_regime_adjustment(self, regime: str) -> Dict[str, float]:
        """Rejim için portföy ayarlaması"""
        return self.regimes.get(regime, self.regimes['NEUTRAL'])['allocation_adjustment']
    
    def get_regime_description(self, regime: str) -> str:
        """Rejim açıklaması"""
        return self.regimes.get(regime, self.regimes['NEUTRAL'])['description']

def test_market_regime_detector():
    """Market regime detector test"""
    logger.info("🧪 Market Regime Detector test başlıyor...")
    
    detector = MarketRegimeDetector()
    regime = detector.detect_market_regime()
    
    logger.info(f"🌊 Market Rejimi: {regime.regime}")
    logger.info(f"🎯 Güven: {regime.confidence:.2f}")
    logger.info(f"⏱️ Süre: {regime.duration_days} gün")
    logger.info(f"📊 Volatilite: {regime.volatility:.3f}")
    logger.info(f"📈 Trend Gücü: {regime.trend_strength:.2f}")
    
    # Portföy ayarlaması
    adjustment = detector.get_regime_adjustment(regime.regime)
    logger.info(f"🎯 Portföy Ayarlaması: {adjustment}")
    
    return regime

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_market_regime_detector()
