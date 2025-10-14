#!/usr/bin/env python3
"""
Makro Rejim Algılayıcı - HMM, CDS, USDTRY ile piyasa rejimi tespiti
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import json
import warnings
warnings.filterwarnings('ignore')

try:
    from hmmlearn import hmm
    HMM_AVAILABLE = True
except ImportError:
    HMM_AVAILABLE = False
    print("⚠️ hmmlearn not available, using simple regime detection")

class MacroRegimeDetector:
    """Makro rejim algılayıcı - Hidden Markov Model ile piyasa rejimi tespiti"""
    
    def __init__(self):
        self.hmm_available = HMM_AVAILABLE
        self.regime_history = []
        self.current_regime = "unknown"
        self.regime_probabilities = {}
        self.last_update = None
        
        # Rejim tanımları
        self.regimes = {
            0: "risk_off",      # Risk-off: Güvenli limanlar tercih edilir
            1: "risk_on",        # Risk-on: Riskli varlıklar tercih edilir
            2: "neutral"         # Nötr: Belirsizlik
        }
        
        # Makro göstergeler
        self.macro_indicators = {
            'usdtry': 'USDTRY=X',
            'cds': 'CDS',  # Simulated CDS data
            'xu030': 'XU030.IS',
            'sp500': '^GSPC',
            'vix': '^VIX',
            'gold': 'GC=F',
            'oil': 'CL=F'
        }
    
    def get_macro_data(self, symbol: str, period: str = "1y") -> pd.DataFrame:
        """Makro veri çek"""
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period)
            
            if data.empty:
                return pd.DataFrame()
                
            # Veri temizleme
            data = data.dropna()
            data.columns = [col.lower() for col in data.columns]
            
            return data
        except Exception as e:
            print(f"❌ {symbol} makro veri çekme hatası: {e}")
            return pd.DataFrame()
    
    def generate_simulated_cds_data(self, period: str = "1y") -> pd.DataFrame:
        """Simulated CDS data - Türkiye CDS spread"""
        try:
            # USDTRY verisini al
            usdtry_data = self.get_macro_data('USDTRY=X', period)
            if usdtry_data.empty:
                return pd.DataFrame()
            
            # CDS spread'i USDTRY'ye bağlı olarak simüle et
            base_cds = 300  # Base CDS spread (bps)
            usdtry_volatility = usdtry_data['close'].pct_change().rolling(20).std()
            
            # CDS spread hesaplama
            cds_spread = base_cds + (usdtry_data['close'] - usdtry_data['close'].iloc[0]) * 50
            cds_spread += usdtry_volatility.fillna(0) * 1000
            
            # CDS DataFrame oluştur
            cds_data = pd.DataFrame({
                'close': cds_spread,
                'high': cds_spread * 1.02,
                'low': cds_spread * 0.98,
                'open': cds_spread.shift(1).fillna(cds_spread),
                'volume': np.random.randint(1000, 10000, len(cds_spread))
            }, index=usdtry_data.index)
            
            return cds_data
        except Exception as e:
            print(f"❌ CDS veri simülasyonu hatası: {e}")
            return pd.DataFrame()
    
    def calculate_macro_features(self, data_dict: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """Makro özelliklerini hesapla"""
        try:
            features = []
            
            for indicator, data in data_dict.items():
                if data.empty:
                    continue
                
                # Fiyat değişimi
                price_change = data['close'].pct_change()
                
                # Volatilite
                volatility = price_change.rolling(20).std()
                
                # Trend (EMA)
                ema_20 = data['close'].ewm(span=20).mean()
                trend = (data['close'] - ema_20) / ema_20
                
                # Momentum
                momentum = price_change.rolling(10).mean()
                
                # Özellikleri birleştir
                feature_df = pd.DataFrame({
                    f'{indicator}_price_change': price_change,
                    f'{indicator}_volatility': volatility,
                    f'{indicator}_trend': trend,
                    f'{indicator}_momentum': momentum
                }, index=data.index)
                
                features.append(feature_df)
            
            if not features:
                return pd.DataFrame()
            
            # Tüm özellikleri birleştir
            combined_features = pd.concat(features, axis=1)
            combined_features = combined_features.dropna()
            
            return combined_features
            
        except Exception as e:
            print(f"❌ Makro özellik hesaplama hatası: {e}")
            return pd.DataFrame()
    
    def detect_regime_hmm(self, features: pd.DataFrame) -> Dict[str, Any]:
        """HMM ile rejim tespiti"""
        try:
            if not self.hmm_available or features.empty:
                return self._detect_regime_simple(features)
            
            # HMM modeli oluştur
            model = hmm.GaussianHMM(n_components=3, covariance_type="full", n_iter=100)
            
            # Modeli eğit
            model.fit(features.fillna(0))
            
            # Rejim tahmini
            regime_sequence = model.predict(features.fillna(0))
            regime_probs = model.predict_proba(features.fillna(0))
            
            # Son rejim
            current_regime = regime_sequence[-1]
            current_probs = regime_probs[-1]
            
            # Rejim geçmişi
            regime_history = [self.regimes[r] for r in regime_sequence]
            
            return {
                'current_regime': self.regimes[current_regime],
                'regime_probabilities': {
                    self.regimes[i]: float(prob) for i, prob in enumerate(current_probs)
                },
                'regime_history': regime_history,
                'regime_sequence': regime_sequence.tolist(),
                'model_score': float(model.score(features.fillna(0))),
                'method': 'hmm'
            }
            
        except Exception as e:
            print(f"❌ HMM rejim tespiti hatası: {e}")
            return self._detect_regime_simple(features)
    
    def _detect_regime_simple(self, features: pd.DataFrame) -> Dict[str, Any]:
        """Basit rejim tespiti (HMM yoksa)"""
        try:
            if features.empty:
                return {
                    'current_regime': 'unknown',
                    'regime_probabilities': {'risk_off': 0.33, 'risk_on': 0.33, 'neutral': 0.34},
                    'regime_history': [],
                    'method': 'simple'
                }
            
            # Basit kurallar
            risk_score = 0
            
            # USDTRY etkisi
            if 'usdtry_price_change' in features.columns:
                usdtry_change = features['usdtry_price_change'].iloc[-1]
                if usdtry_change > 0.02:  # %2'den fazla artış
                    risk_score += 2
                elif usdtry_change < -0.01:  # %1'den fazla düşüş
                    risk_score -= 1
            
            # VIX etkisi (varsa)
            if 'vix_price_change' in features.columns:
                vix_change = features['vix_price_change'].iloc[-1]
                if vix_change > 0.05:  # %5'ten fazla artış
                    risk_score += 2
                elif vix_change < -0.03:  # %3'ten fazla düşüş
                    risk_score -= 1
            
            # SP500 etkisi (varsa)
            if 'sp500_price_change' in features.columns:
                sp500_change = features['sp500_price_change'].iloc[-1]
                if sp500_change > 0.02:  # %2'den fazla artış
                    risk_score -= 1
                elif sp500_change < -0.02:  # %2'den fazla düşüş
                    risk_score += 2
            
            # Rejim belirleme
            if risk_score >= 2:
                current_regime = 'risk_off'
                probs = {'risk_off': 0.7, 'risk_on': 0.1, 'neutral': 0.2}
            elif risk_score <= -1:
                current_regime = 'risk_on'
                probs = {'risk_off': 0.1, 'risk_on': 0.7, 'neutral': 0.2}
            else:
                current_regime = 'neutral'
                probs = {'risk_off': 0.2, 'risk_on': 0.2, 'neutral': 0.6}
            
            return {
                'current_regime': current_regime,
                'regime_probabilities': probs,
                'regime_history': [current_regime] * len(features),
                'risk_score': risk_score,
                'method': 'simple'
            }
            
        except Exception as e:
            print(f"❌ Basit rejim tespiti hatası: {e}")
            return {
                'current_regime': 'unknown',
                'regime_probabilities': {'risk_off': 0.33, 'risk_on': 0.33, 'neutral': 0.34},
                'regime_history': [],
                'method': 'simple'
            }
    
    def analyze_macro_regime(self, period: str = "1y") -> Dict[str, Any]:
        """Makro rejim analizi"""
        try:
            # Makro verileri çek
            macro_data = {}
            
            for indicator, symbol in self.macro_indicators.items():
                if indicator == 'cds':
                    data = self.generate_simulated_cds_data(period)
                else:
                    data = self.get_macro_data(symbol, period)
                
                if not data.empty:
                    macro_data[indicator] = data
            
            if not macro_data:
                return {'error': 'Makro veri bulunamadı'}
            
            # Özellikleri hesapla
            features = self.calculate_macro_features(macro_data)
            
            if features.empty:
                return {'error': 'Özellik hesaplama başarısız'}
            
            # Rejim tespiti
            regime_result = self.detect_regime_hmm(features)
            
            # Makro göstergeler özeti
            macro_summary = {}
            for indicator, data in macro_data.items():
                if not data.empty:
                    latest_price = data['close'].iloc[-1]
                    price_change = data['close'].pct_change().iloc[-1]
                    volatility = data['close'].pct_change().rolling(20).std().iloc[-1]
                    
                    macro_summary[indicator] = {
                        'latest_price': float(latest_price),
                        'price_change': float(price_change) if not pd.isna(price_change) else 0.0,
                        'volatility': float(volatility) if not pd.isna(volatility) else 0.0,
                        'trend': 'up' if price_change > 0.01 else 'down' if price_change < -0.01 else 'flat'
                    }
            
            # Sonuçları hazırla
            result = {
                'analysis_date': datetime.now().isoformat(),
                'period': period,
                'regime_analysis': regime_result,
                'macro_indicators': macro_summary,
                'feature_count': len(features.columns),
                'data_points': len(features),
                'success': True
            }
            
            # Cache'e kaydet
            self.current_regime = regime_result['current_regime']
            self.regime_probabilities = regime_result['regime_probabilities']
            self.regime_history = regime_result['regime_history']
            self.last_update = datetime.now()
            
            return result
            
        except Exception as e:
            return {
                'error': f'Makro rejim analizi hatası: {str(e)}',
                'success': False
            }
    
    def get_regime_recommendations(self, regime: str) -> Dict[str, Any]:
        """Rejime göre yatırım önerileri"""
        recommendations = {
            'risk_off': {
                'description': 'Risk-off rejimi: Güvenli limanlar tercih edilir',
                'recommended_assets': ['Altın', 'Dolar', 'Tahvil', 'Güvenli hisseler'],
                'avoid_assets': ['Yüksek riskli hisseler', 'Emerging markets', 'Kripto'],
                'strategy': 'Defensive',
                'position_sizing': 'Küçük pozisyonlar',
                'stop_loss': 'Sıkı stop-loss'
            },
            'risk_on': {
                'description': 'Risk-on rejimi: Riskli varlıklar tercih edilir',
                'recommended_assets': ['Büyüme hisseleri', 'Emerging markets', 'Kripto', 'Teknoloji'],
                'avoid_assets': ['Altın', 'Tahvil', 'Defensive hisseler'],
                'strategy': 'Aggressive',
                'position_sizing': 'Büyük pozisyonlar',
                'stop_loss': 'Gevşek stop-loss'
            },
            'neutral': {
                'description': 'Nötr rejim: Belirsizlik hakim',
                'recommended_assets': ['Dengeli portföy', 'Defensive hisseler', 'Altın'],
                'avoid_assets': ['Aşırı riskli varlıklar'],
                'strategy': 'Balanced',
                'position_sizing': 'Orta pozisyonlar',
                'stop_loss': 'Orta stop-loss'
            }
        }
        
        return recommendations.get(regime, recommendations['neutral'])
    
    def get_regime_history(self) -> Dict[str, Any]:
        """Rejim geçmişini getir"""
        return {
            'current_regime': self.current_regime,
            'regime_probabilities': self.regime_probabilities,
            'regime_history': self.regime_history[-50:],  # Son 50 gün
            'last_update': self.last_update.isoformat() if self.last_update else None,
            'total_analyses': len(self.regime_history)
        }
    
    def export_regime_report(self, format: str = 'json') -> Dict[str, Any]:
        """Rejim raporunu export et"""
        try:
            # Güncel analiz yap
            current_analysis = self.analyze_macro_regime()
            
            if not current_analysis.get('success'):
                return {'error': 'Analiz başarısız'}
            
            # Önerileri ekle
            regime = current_analysis['regime_analysis']['current_regime']
            recommendations = self.get_regime_recommendations(regime)
            
            report = {
                'analysis': current_analysis,
                'recommendations': recommendations,
                'export_date': datetime.now().isoformat(),
                'format': format
            }
            
            return {
                'success': True,
                'data': report,
                'export_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'error': f'Export hatası: {str(e)}',
                'success': False
            }
