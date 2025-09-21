#!/usr/bin/env python3
"""
Market Regime Detection - Risk-On/Off Algılayıcı
US piyasası %41.7 win rate'i daha da artırmak için kritik modül
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketRegime(Enum):
    """Piyasa rejimi enum'u"""
    RISK_ON = "RISK_ON"          # Risk alma modu - agresif strateji
    RISK_OFF = "RISK_OFF"        # Risk kaçınma modu - konservatif strateji
    NEUTRAL = "NEUTRAL"          # Nötr mod - dengeli strateji
    TRANSITION = "TRANSITION"    # Geçiş modu - dikkatli strateji

@dataclass
class RegimeSignal:
    """Piyasa rejimi sinyali"""
    regime: MarketRegime
    confidence: float
    timestamp: datetime
    indicators: Dict[str, float]
    recommendation: str
    risk_multiplier: float

class MarketRegimeDetector:
    """Piyasa rejimi algılayıcı - Risk-On/Off detection"""
    
    def __init__(self):
        self.regime_history = []
        self.current_regime = MarketRegime.NEUTRAL
        self.regime_confidence = 0.0
        
        # Risk-On/Off eşikleri
        self.thresholds = {
            'vix_risk_off': 25.0,      # VIX > 25 = Risk-Off
            'vix_risk_on': 15.0,       # VIX < 15 = Risk-On
            'dxy_risk_off': 105.0,     # DXY > 105 = Risk-Off
            'dxy_risk_on': 95.0,       # DXY < 95 = Risk-On
            'tnx_risk_off': 4.5,       # TNX > 4.5% = Risk-Off
            'tnx_risk_on': 2.5,        # TNX < 2.5% = Risk-On
            'spy_trend_down': -0.02,   # SPY < -2% = Risk-Off
            'spy_trend_up': 0.02,      # SPY > +2% = Risk-On
        }
        
        logger.info("🎯 Market Regime Detector başlatıldı")
    
    def fetch_market_data(self) -> Dict[str, pd.DataFrame]:
        """Piyasa verilerini çek"""
        try:
            logger.info("📊 Piyasa verileri çekiliyor...")
            
            # Tarih aralığı (son 30 gün)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            
            data = {}
            
            # US piyasası göstergeleri
            us_symbols = ['^VIX', 'DX-Y.NYB', '^TNX', 'SPY', 'QQQ']
            for symbol in us_symbols:
                try:
                    ticker = yf.Ticker(symbol)
                    df = ticker.history(start=start_date, end=end_date, interval='1d')
                    if not df.empty:
                        data[symbol] = df
                        logger.info(f"✅ {symbol}: {len(df)} günlük veri")
                    else:
                        logger.warning(f"⚠️ {symbol}: Veri bulunamadı")
                except Exception as e:
                    logger.error(f"❌ {symbol} veri hatası: {e}")
            
            # Türkiye göstergeleri
            tr_symbols = ['USDTRY=X', 'XU030.IS']
            for symbol in tr_symbols:
                try:
                    ticker = yf.Ticker(symbol)
                    df = ticker.history(start=start_date, end=end_date, interval='1d')
                    if not df.empty:
                        data[symbol] = df
                        logger.info(f"✅ {symbol}: {len(df)} günlük veri")
                    else:
                        logger.warning(f"⚠️ {symbol}: Veri bulunamadı")
                except Exception as e:
                    logger.error(f"❌ {symbol} veri hatası: {e}")
            
            logger.info(f"📊 Toplam {len(data)} gösterge yüklendi")
            return data
            
        except Exception as e:
            logger.error(f"❌ Piyasa verisi çekme hatası: {e}")
            return {}
    
    def analyze_regime_indicators(self, data: Dict[str, pd.DataFrame]) -> Dict[str, float]:
        """Rejim göstergelerini analiz et"""
        try:
            indicators = {}
            
            # VIX analizi (Volatilite)
            if '^VIX' in data and not data['^VIX'].empty:
                vix_current = data['^VIX']['Close'].iloc[-1]
                vix_ma5 = data['^VIX']['Close'].tail(5).mean()
                vix_trend = (vix_current - vix_ma5) / vix_ma5
                
                indicators['vix_current'] = vix_current
                indicators['vix_trend'] = vix_trend
                indicators['vix_regime'] = self._classify_vix_regime(vix_current)
                
                logger.info(f"📊 VIX: {vix_current:.2f} (Trend: {vix_trend:.3f})")
            
            # DXY analizi (Dolar endeksi)
            if 'DX-Y.NYB' in data and not data['DX-Y.NYB'].empty:
                dxy_current = data['DX-Y.NYB']['Close'].iloc[-1]
                dxy_ma5 = data['DX-Y.NYB']['Close'].tail(5).mean()
                dxy_trend = (dxy_current - dxy_ma5) / dxy_ma5
                
                indicators['dxy_current'] = dxy_current
                indicators['dxy_trend'] = dxy_trend
                indicators['dxy_regime'] = self._classify_dxy_regime(dxy_current)
                
                logger.info(f"📊 DXY: {dxy_current:.2f} (Trend: {dxy_trend:.3f})")
            
            # SPY analizi (S&P 500)
            if 'SPY' in data and not data['SPY'].empty:
                spy_current = data['SPY']['Close'].iloc[-1]
                spy_ma5 = data['SPY']['Close'].tail(5).mean()
                spy_trend = (spy_current - spy_ma5) / spy_ma5
                
                indicators['spy_current'] = spy_current
                indicators['spy_trend'] = spy_trend
                indicators['spy_regime'] = self._classify_spy_regime(spy_trend)
                
                logger.info(f"📊 SPY: {spy_current:.2f} (Trend: {spy_trend:.3f})")
            
            return indicators
            
        except Exception as e:
            logger.error(f"❌ Rejim göstergesi analiz hatası: {e}")
            return {}
    
    def _classify_vix_regime(self, vix: float) -> str:
        """VIX'e göre rejim sınıflandırması"""
        if vix > self.thresholds['vix_risk_off']:
            return 'RISK_OFF'
        elif vix < self.thresholds['vix_risk_on']:
            return 'RISK_ON'
        else:
            return 'NEUTRAL'
    
    def _classify_dxy_regime(self, dxy: float) -> str:
        """DXY'e göre rejim sınıflandırması"""
        if dxy > self.thresholds['dxy_risk_off']:
            return 'RISK_OFF'
        elif dxy < self.thresholds['dxy_risk_on']:
            return 'RISK_ON'
        else:
            return 'NEUTRAL'
    
    def _classify_spy_regime(self, trend: float) -> str:
        """SPY trend'ine göre rejim sınıflandırması"""
        if trend < self.thresholds['spy_trend_down']:
            return 'RISK_OFF'
        elif trend > self.thresholds['spy_trend_up']:
            return 'RISK_ON'
        else:
            return 'NEUTRAL'
    
    def determine_market_regime(self, indicators: Dict[str, float]) -> RegimeSignal:
        """Piyasa rejimini belirle"""
        try:
            logger.info("🎯 Piyasa rejimi belirleniyor...")
            
            # Rejim oyları
            regime_votes = {
                'RISK_ON': 0,
                'RISK_OFF': 0,
                'NEUTRAL': 0
            }
            
            # Her gösterge için oy ver
            for key, value in indicators.items():
                if key.endswith('_regime'):
                    regime_votes[value] += 1
            
            # En çok oy alan rejim
            dominant_regime = max(regime_votes, key=regime_votes.get)
            total_votes = sum(regime_votes.values())
            confidence = regime_votes[dominant_regime] / total_votes if total_votes > 0 else 0.0
            
            # Risk çarpanı hesapla
            risk_multiplier = self._calculate_risk_multiplier(dominant_regime, confidence)
            
            # Öneri oluştur
            recommendation = self._generate_recommendation(dominant_regime, confidence)
            
            # Rejim sinyali oluştur
            regime_signal = RegimeSignal(
                regime=MarketRegime(dominant_regime),
                confidence=confidence,
                timestamp=datetime.now(),
                indicators=indicators,
                recommendation=recommendation,
                risk_multiplier=risk_multiplier
            )
            
            # Geçmişe ekle
            self.regime_history.append(regime_signal)
            self.current_regime = regime_signal.regime
            self.regime_confidence = regime_signal.confidence
            
            logger.info(f"🎯 Piyasa rejimi: {dominant_regime} (Güven: {confidence:.1%})")
            logger.info(f"📊 Risk çarpanı: {risk_multiplier:.2f}")
            logger.info(f"💡 Öneri: {recommendation}")
            
            return regime_signal
            
        except Exception as e:
            logger.error(f"❌ Rejim belirleme hatası: {e}")
            return RegimeSignal(
                regime=MarketRegime.NEUTRAL,
                confidence=0.0,
                timestamp=datetime.now(),
                indicators={},
                recommendation="Hata nedeniyle nötr rejim",
                risk_multiplier=1.0
            )
    
    def _calculate_risk_multiplier(self, regime: str, confidence: float) -> float:
        """Risk çarpanı hesapla"""
        base_multipliers = {
            'RISK_ON': 1.5,      # Risk-On: Daha agresif
            'RISK_OFF': 0.5,     # Risk-Off: Daha konservatif
            'NEUTRAL': 1.0,      # Nötr: Normal
            'TRANSITION': 0.8    # Geçiş: Dikkatli
        }
        
        base_multiplier = base_multipliers.get(regime, 1.0)
        confidence_factor = 0.5 + (confidence * 0.5)  # 0.5 - 1.0 arası
        
        return base_multiplier * confidence_factor
    
    def _generate_recommendation(self, regime: str, confidence: float) -> str:
        """Rejim önerisi oluştur"""
        recommendations = {
            'RISK_ON': "🚀 Risk-On modu: Agresif strateji önerilir",
            'RISK_OFF': "🛡️ Risk-Off modu: Konservatif strateji önerilir",
            'NEUTRAL': "⚖️ Nötr mod: Dengeli strateji önerilir"
        }
        
        return recommendations.get(regime, recommendations['NEUTRAL'])
    
    def get_regime_signal(self) -> RegimeSignal:
        """Güncel rejim sinyalini al"""
        try:
            # Piyasa verilerini çek
            data = self.fetch_market_data()
            
            if not data:
                logger.warning("⚠️ Piyasa verisi bulunamadı")
                return RegimeSignal(
                    regime=MarketRegime.NEUTRAL,
                    confidence=0.0,
                    timestamp=datetime.now(),
                    indicators={},
                    recommendation="Veri bulunamadı",
                    risk_multiplier=1.0
                )
            
            # Göstergeleri analiz et
            indicators = self.analyze_regime_indicators(data)
            
            # Rejimi belirle
            regime_signal = self.determine_market_regime(indicators)
            
            return regime_signal
            
        except Exception as e:
            logger.error(f"❌ Rejim sinyali alma hatası: {e}")
            return RegimeSignal(
                regime=MarketRegime.NEUTRAL,
                confidence=0.0,
                timestamp=datetime.now(),
                indicators={},
                recommendation=f"Hata: {e}",
                risk_multiplier=1.0
            )

def main():
    """Test fonksiyonu"""
    try:
        logger.info("🚀 Market Regime Detector test ediliyor...")
        
        detector = MarketRegimeDetector()
        regime_signal = detector.get_regime_signal()
        
        print("\n" + "="*60)
        print("🎯 MARKET REGIME DETECTION RAPORU")
        print("="*60)
        print(f"📊 Mevcut Rejim: {regime_signal.regime.value}")
        print(f"🎯 Güven: {regime_signal.confidence:.1%}")
        print(f"⚡ Risk Çarpanı: {regime_signal.risk_multiplier:.2f}")
        print(f"💡 Öneri: {regime_signal.recommendation}")
        print(f"⏰ Zaman: {regime_signal.timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
        
        logger.info("✅ Market Regime Detector test tamamlandı!")
        
    except Exception as e:
        logger.error(f"❌ Test hatası: {e}")

if __name__ == "__main__":
    main()