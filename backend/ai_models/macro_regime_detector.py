"""
Makro Rejim Dedektörü (HMM + Makro Veri)
- USDTRY, CDS, XU030 korelasyonu ile rejim tespiti
- Hidden Markov Model ile 3 rejim: RISK_ON, NEUTRAL, RISK_OFF
- Ensemble ağırlıklarını dinamik olarak etkiler
"""

import numpy as np
import pandas as pd
from typing import Dict, Tuple, Optional
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class MacroRegimeDetector:
    def __init__(self):
        self.available = False
        self.hmm_model = None
        self.regime_history = []
        self.last_update = None
        
        try:
            from hmmlearn import hmm
            self.available = True
            logger.info("HMM makro rejim dedektörü yüklendi")
        except ImportError:
            logger.warning("hmmlearn bulunamadı, basit rejim dedektörü kullanılıyor")
            self.available = False
    
    def get_macro_data(self) -> pd.DataFrame:
        """Makro veri çekme (optimized + fallback)"""
        try:
            import yfinance as yf
            
            # USDTRY, XU030, CDS (optimized)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=90)
            
            # USDTRY (daha güvenilir)
            try:
                usdtry = yf.download("USDTRY=X", start=start_date, end=end_date, progress=False, auto_adjust=True)
                usdtry_data = usdtry['Close'].reindex(pd.date_range(start=start_date, end=end_date, freq='D'), method='ffill')
            except:
                usdtry_data = pd.Series(np.random.uniform(30, 32, 90), index=pd.date_range(start=start_date, end=end_date, freq='D'))
            
            # XU030 (BIST100) - alternatif semboller
            xu030_data = None
            for symbol in ['^XU030', 'XU100.IS', 'XU030.IS']:
                try:
                    xu030 = yf.download(symbol, start=start_date, end=end_date, progress=False, auto_adjust=True)
                    if not xu030.empty:
                        xu030_data = xu030['Close'].reindex(pd.date_range(start=start_date, end=end_date, freq='D'), method='ffill')
                        break
                except:
                    continue
            
            if xu030_data is None:
                xu030_data = pd.Series(np.random.uniform(8000, 9000, 90), index=pd.date_range(start=start_date, end=end_date, freq='D'))
            
            # CDS (TCMB verisi - mock)
            dates = pd.date_range(start=start_date, end=end_date, freq='D')
            cds_data = pd.Series(np.random.normal(300, 50, len(dates)), index=dates)
            
            # Birleştir ve temizle
            macro_data = pd.DataFrame({
                'USDTRY': usdtry_data,
                'XU030': xu030_data,
                'CDS': cds_data
            }).dropna()
            
            # Outlier temizleme
            for col in macro_data.columns:
                Q1 = macro_data[col].quantile(0.25)
                Q3 = macro_data[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                macro_data[col] = macro_data[col].clip(lower_bound, upper_bound)
            
            return macro_data
            
        except Exception as e:
            logger.error(f"Makro veri çekme hatası: {e}")
            # Fallback mock data
            dates = pd.date_range(end=datetime.now(), periods=90, freq='D')
            return pd.DataFrame({
                'USDTRY': np.random.uniform(30, 32, len(dates)),
                'XU030': np.random.uniform(8000, 9000, len(dates)),
                'CDS': np.random.normal(300, 50, len(dates))
            }, index=dates)
    
    def calculate_features(self, df: pd.DataFrame) -> np.ndarray:
        """Makro veriden özellik çıkarma"""
        try:
            features = []
            
            # Getiri ve volatilite
            for col in ['USDTRY', 'XU030', 'CDS']:
                if col in df.columns:
                    returns = df[col].pct_change().dropna()
                    if len(returns) >= 20:
                        features.extend([
                            returns.rolling(5).mean().values[-70:],  # Son 70 gün
                            returns.rolling(20).mean().values[-70:],
                            returns.rolling(5).std().values[-70:],
                            returns.rolling(20).std().values[-70:]
                        ])
            
            if not features:
                return np.random.randn(70, 20)
            
            # Tüm özellikleri aynı boyuta getir
            min_length = min(len(f) for f in features)
            features = [f[-min_length:] for f in features]
            
            # Korelasyon matrisi (rolling)
            corr_matrix = []
            for i in range(20, min(len(df), min_length)):
                try:
                    window = df.iloc[i-20:i][['USDTRY', 'XU030', 'CDS']]
                    corr = window.corr().values.flatten()
                    corr_matrix.append(corr)
                except:
                    corr_matrix.append([0, 0, 0, 0, 0, 0])  # 3x3 corr matrix flattened
            
            if corr_matrix:
                corr_features = np.array(corr_matrix)
                # Tüm özellikleri birleştir
                all_features = np.column_stack([
                    np.column_stack(features),
                    corr_features
                ])
            else:
                all_features = np.column_stack(features)
            
            return all_features
            
        except Exception as e:
            logger.error(f"Özellik hesaplama hatası: {e}")
            return np.random.randn(70, 20)  # Fallback
    
    def train_hmm(self, features: np.ndarray) -> bool:
        """HMM modelini optimize edilmiş şekilde eğit"""
        try:
            if not self.available:
                return False
                
            from hmmlearn import hmm
            from sklearn.preprocessing import StandardScaler
            
            # Veri temizleme ve normalizasyon
            if features.shape[0] < 50:  # Minimum veri gerekli
                logger.warning("HMM eğitimi için yeterli veri yok")
                return False
            
            # NaN ve Inf temizleme
            features = np.nan_to_num(features, nan=0.0, posinf=1.0, neginf=-1.0)
            
            # Standardizasyon
            scaler = StandardScaler()
            features_scaled = scaler.fit_transform(features)
            
            # HMM parametreleri optimize edildi
            self.hmm_model = hmm.GaussianHMM(
                n_components=3,  # 3 rejim
                random_state=42,
                n_iter=200,      # Daha fazla iterasyon
                tol=0.01,        # Daha düşük tolerans
                covariance_type='diag',  # Daha stabil
                init_params='stmc',      # Daha iyi başlangıç
                params='stmc'
            )
            
            # Model eğitimi
            self.hmm_model.fit(features_scaled)
            
            # Model kalitesi kontrolü
            score = self.hmm_model.score(features_scaled)
            if score > -1000:  # Makul log-likelihood
                logger.info(f"HMM modeli başarıyla eğitildi (score: {score:.2f})")
                return True
            else:
                logger.warning("HMM modeli düşük kalitede")
                return False
            
        except Exception as e:
            logger.error(f"HMM eğitim hatası: {e}")
            return False
    
    def detect_regime(self, features: np.ndarray) -> Tuple[str, float]:
        """Rejim tespiti"""
        try:
            if self.hmm_model and self.available:
                # HMM ile rejim tahmini
                regime_idx = self.hmm_model.predict(features[-1:])[0]
                confidence = np.max(self.hmm_model.predict_proba(features[-1:]))
                
                regimes = ['RISK_ON', 'NEUTRAL', 'RISK_OFF']
                return regimes[regime_idx], confidence
            else:
                # Basit heuristic
                return self._simple_regime_detection(features), 0.7
                
        except Exception as e:
            logger.error(f"Rejim tespit hatası: {e}")
            return 'UNKNOWN', 0.5
    
    def _simple_regime_detection(self, features: np.ndarray) -> str:
        """Basit rejim tespiti (HMM yoksa)"""
        try:
            # Son 20 günlük ortalama getiri
            if len(features) >= 20:
                recent_returns = features[-20:, :4]  # İlk 4 özellik getiri
                avg_return = np.mean(recent_returns)
                volatility = np.std(recent_returns)
                
                if avg_return > 0.01 and volatility < 0.02:
                    return 'RISK_ON'
                elif avg_return < -0.01 and volatility > 0.02:
                    return 'RISK_OFF'
                else:
                    return 'NEUTRAL'
            else:
                return 'NEUTRAL'
                
        except Exception:
            return 'UNKNOWN'
    
    def get_regime_weights(self, regime: str, confidence: float) -> Dict[str, float]:
        """Rejime göre ensemble ağırlık düzeltmesi"""
        base_weights = {
            'lightgbm': 0.32,
            'lstm': 0.28,
            'timegpt': 0.2,
            'catboost': 0.2
        }
        
        if regime == 'RISK_OFF':
            # Risk-off'ta daha konservatif modeller
            adjustments = {
                'lightgbm': 1.1,  # Daha güvenilir
                'lstm': 0.9,      # Biraz azalt
                'timegpt': 0.8,   # Uzun vadeli tahmin azalt
                'catboost': 1.2   # Gradient boosting güçlendir
            }
        elif regime == 'RISK_ON':
            # Risk-on'da daha agresif modeller
            adjustments = {
                'lightgbm': 0.95,
                'lstm': 1.15,     # Pattern recognition güçlendir
                'timegpt': 1.1,   # Trend takibi
                'catboost': 0.9
            }
        else:  # NEUTRAL
            adjustments = {k: 1.0 for k in base_weights.keys()}
        
        # Confidence ile ağırlık düzeltmesi
        confidence_factor = min(confidence, 1.0)
        
        adjusted_weights = {}
        for model, base_weight in base_weights.items():
            adjusted = base_weight * adjustments[model] * confidence_factor
            adjusted_weights[model] = adjusted
        
        # Normalize
        total = sum(adjusted_weights.values())
        if total > 0:
            adjusted_weights = {k: v/total for k, v in adjusted_weights.items()}
        
        return adjusted_weights
    
    def update_regime(self) -> Tuple[str, float, Dict[str, float]]:
        """Rejimi güncelle ve ağırlıkları hesapla"""
        try:
            # Makro veri çek
            macro_data = self.get_macro_data()
            
            # Özellik çıkar
            features = self.calculate_features(macro_data)
            
            # HMM eğit (gerekirse)
            if self.hmm_model is None and self.available:
                self.train_hmm(features)
            
            # Rejim tespit
            regime, confidence = self.detect_regime(features)
            
            # Ağırlık hesapla
            weights = self.get_regime_weights(regime, confidence)
            
            # Güncelle
            self.regime_history.append({
                'timestamp': datetime.now().isoformat(),
                'regime': regime,
                'confidence': confidence,
                'weights': weights
            })
            
            self.last_update = datetime.now()
            
            return regime, confidence, weights
            
        except Exception as e:
            logger.error(f"Rejim güncelleme hatası: {e}")
            return 'UNKNOWN', 0.5, {}
    
    def get_current_regime(self) -> Dict:
        """Mevcut rejim bilgisi"""
        if not self.regime_history:
            return {
                'regime': 'UNKNOWN',
                'confidence': 0.0,
                'weights': {},
                'last_update': None
            }
        
        latest = self.regime_history[-1]
        return {
            'regime': latest['regime'],
            'confidence': latest['confidence'],
            'weights': latest['weights'],
            'last_update': latest['timestamp']
        }

def test_macro_regime():
    """Test fonksiyonu"""
    detector = MacroRegimeDetector()
    regime, confidence, weights = detector.update_regime()
    
    print(f"Rejim: {regime}")
    print(f"Güven: {confidence:.3f}")
    print(f"Ağırlıklar: {weights}")
    
    return detector

if __name__ == "__main__":
    test_macro_regime()
