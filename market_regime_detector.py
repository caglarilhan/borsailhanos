#!/usr/bin/env python3
"""
🚀 Market Regime Detection - SPRINT 6
BIST AI Smart Trader v2.0 - %90 Doğruluk Hedefi

Market regime detection ile doğruluğu %85'den %87'ye çıkarma:
- Hidden Markov Models (HMM)
- Bull/Bear/Volatile regimes
- Regime-specific model weights
- Dynamic portfolio allocation
- Macro economic indicators
"""

import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')

# Scikit-learn imports
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, calinski_harabasz_score

# HMM imports
try:
    from hmmlearn import hmm
    HMM_AVAILABLE = True
except ImportError:
    HMM_AVAILABLE = False
    logging.warning("⚠️ hmmlearn bulunamadı, HMM atlanıyor")

# Stats imports
from scipy import stats
from scipy.signal import find_peaks

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MarketRegimeConfig:
    """Market regime detection konfigürasyonu"""
    n_regimes: int = 3  # Bull, Bear, Volatile
    lookback_period: int = 252  # 1 year
    volatility_window: int = 20
    correlation_threshold: float = 0.7
    regime_confidence_threshold: float = 0.8
    update_frequency: str = "daily"  # daily, weekly, monthly

@dataclass
class MarketRegime:
    """Market regime bilgileri"""
    regime_id: int
    regime_name: str
    start_date: datetime
    end_date: Optional[datetime]
    duration_days: int
    confidence: float
    characteristics: Dict[str, float]
    model_weights: Dict[str, float]

@dataclass
class RegimeAnalysis:
    """Regime analysis sonuçları"""
    current_regime: MarketRegime
    regime_probabilities: Dict[int, float]
    regime_transitions: List[Tuple[int, int, datetime]]
    volatility_regime: str
    correlation_regime: str
    macro_regime: str
    confidence: float
    timestamp: datetime

class MarketRegimeDetector:
    """Market regime detector for %90 accuracy"""
    
    def __init__(self, config: MarketRegimeConfig):
        self.config = config
        self.scaler = StandardScaler()
        self.hmm_model = None
        self.regime_history = []
        self.current_regime = None
        self.regime_characteristics = {}
        
        logger.info("🚀 Market Regime Detector başlatıldı")
        
    def calculate_volatility_features(self, data: pd.DataFrame, symbol: str) -> pd.Series:
        """Volatility features hesapla"""
        try:
            if 'Close' not in data.columns:
                logger.warning(f"⚠️ {symbol}: Close column bulunamadı")
                return pd.Series()
            
            # Returns
            returns = data['Close'].pct_change().dropna()
            
            # Rolling volatility
            volatility = returns.rolling(window=self.config.volatility_window).std()
            
            # GARCH-like volatility (simplified)
            squared_returns = returns ** 2
            garch_vol = squared_returns.rolling(window=self.config.volatility_window).mean().sqrt()
            
            # Volatility of volatility
            vol_of_vol = volatility.rolling(window=self.config.volatility_window).std()
            
            # Combine features
            vol_features = pd.DataFrame({
                'returns': returns,
                'volatility': volatility,
                'garch_vol': garch_vol,
                'vol_of_vol': vol_of_vol
            })
            
            logger.info(f"✅ Volatility features hesaplandı: {symbol}")
            return vol_features
            
        except Exception as e:
            logger.error(f"❌ Volatility features hatası {symbol}: {e}")
            return pd.Series()
    
    def calculate_correlation_features(self, data: pd.DataFrame, market_data: pd.DataFrame = None) -> pd.DataFrame:
        """Correlation features hesapla"""
        try:
            # Market data varsa correlation hesapla
            if market_data is not None and 'Close' in market_data.columns:
                # Market returns
                market_returns = market_data['Close'].pct_change().dropna()
                
                # Stock returns
                stock_returns = data['Close'].pct_change().dropna()
                
                # Align data
                common_dates = market_returns.index.intersection(stock_returns.index)
                market_returns = market_returns.loc[common_dates]
                stock_returns = stock_returns.loc[common_dates]
                
                # Rolling correlation
                correlation = stock_returns.rolling(window=20).corr(market_returns)
                
                # Beta calculation
                beta = stock_returns.rolling(window=20).cov(market_returns) / market_returns.rolling(window=20).var()
                
                # Correlation features
                corr_features = pd.DataFrame({
                    'market_correlation': correlation,
                    'beta': beta,
                    'market_returns': market_returns,
                    'stock_returns': stock_returns
                })
                
                logger.info("✅ Correlation features hesaplandı")
                return corr_features
            else:
                logger.info("ℹ️ Market data yok, correlation features atlanıyor")
                return pd.DataFrame()
                
        except Exception as e:
            logger.error(f"❌ Correlation features hatası: {e}")
            return pd.DataFrame()
    
    def calculate_macro_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Macro economic features hesapla"""
        try:
            # USD/TRY correlation (simulated)
            # Gerçek uygulamada bu veriler API'den gelecek
            np.random.seed(42)
            n_samples = len(data)
            
            # Simulated macro data
            usd_try = np.random.randn(n_samples) * 0.02 + 30.0  # USD/TRY volatility
            cds_spread = np.random.randn(n_samples) * 0.5 + 200.0  # CDS spread
            xu030_vol = np.random.randn(n_samples) * 0.03 + 1.0  # XU030 volatility
            
            # Macro features
            macro_features = pd.DataFrame({
                'usd_try': usd_try,
                'cds_spread': cds_spread,
                'xu030_vol': xu030_vol,
                'usd_try_change': pd.Series(usd_try).pct_change(),
                'cds_change': pd.Series(cds_spread).pct_change(),
                'xu030_vol_change': pd.Series(xu030_vol).pct_change()
            }, index=data.index)
            
            logger.info("✅ Macro features hesaplandı")
            return macro_features
            
        except Exception as e:
            logger.error(f"❌ Macro features hatası: {e}")
            return pd.DataFrame()
    
    def create_regime_features(self, data: pd.DataFrame, market_data: pd.DataFrame = None) -> pd.DataFrame:
        """Regime detection için feature matrix oluştur"""
        try:
            features_list = []
            
            # 1. Price-based features
            if 'Close' in data.columns:
                # Returns
                returns = data['Close'].pct_change().dropna()
                
                # Technical indicators
                sma_20 = data['Close'].rolling(window=20).mean()
                sma_50 = data['Close'].rolling(window=50).mean()
                rsi = self._calculate_rsi(data['Close'])
                
                price_features = pd.DataFrame({
                    'returns': returns,
                    'sma_20': sma_20,
                    'sma_50': sma_50,
                    'rsi': rsi,
                    'price_momentum': data['Close'] / sma_20 - 1,
                    'trend_strength': (sma_20 - sma_50) / sma_50
                })
                features_list.append(price_features)
            
            # 2. Volatility features
            vol_features = self.calculate_volatility_features(data, "STOCK")
            if not vol_features.empty:
                features_list.append(vol_features)
            
            # 3. Volume features
            if 'Volume' in data.columns:
                volume_features = pd.DataFrame({
                    'volume': data['Volume'],
                    'volume_ma': data['Volume'].rolling(window=20).mean(),
                    'volume_ratio': data['Volume'] / data['Volume'].rolling(window=20).mean(),
                    'volume_momentum': data['Volume'].pct_change()
                })
                features_list.append(volume_features)
            
            # 4. Correlation features
            corr_features = self.calculate_correlation_features(data, market_data)
            if not corr_features.empty:
                features_list.append(corr_features)
            
            # 5. Macro features
            macro_features = self.calculate_macro_features(data)
            if not macro_features.empty:
                features_list.append(macro_features)
            
            # Combine all features
            if features_list:
                combined_features = pd.concat(features_list, axis=1)
                
                # Remove duplicates
                combined_features = combined_features.loc[:, ~combined_features.columns.duplicated()]
                
                # Fill NaN values
                combined_features = combined_features.fillna(method='ffill').fillna(0)
                
                # Remove infinite values
                combined_features = combined_features.replace([np.inf, -np.inf], 0)
                
                logger.info(f"✅ Regime features oluşturuldu: {combined_features.shape}")
                return combined_features
            else:
                logger.warning("⚠️ Hiçbir feature oluşturulamadı")
                return pd.DataFrame()
                
        except Exception as e:
            logger.error(f"❌ Regime features oluşturma hatası: {e}")
            return pd.DataFrame()
    
    def _calculate_rsi(self, prices: pd.Series, window: int = 14) -> pd.Series:
        """RSI hesapla"""
        try:
            delta = prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            return rsi
        except Exception:
            return pd.Series(index=prices.index)
    
    def train_hmm_model(self, features: pd.DataFrame) -> bool:
        """HMM modeli eğit"""
        try:
            if not HMM_AVAILABLE:
                logger.warning("⚠️ hmmlearn bulunamadı, HMM eğitimi atlanıyor")
                return False
            
            if features.empty:
                logger.warning("⚠️ Features boş")
                return False
            
            # Prepare data
            X = features.values
            
            # Remove any remaining NaN or infinite values
            X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)
            
            # Scaling
            X_scaled = self.scaler.fit_transform(X)
            
            # Train HMM
            self.hmm_model = hmm.GaussianHMM(
                n_components=self.config.n_regimes,
                covariance_type="full",
                random_state=42,
                n_iter=1000
            )
            
            # Fit model
            self.hmm_model.fit(X_scaled)
            
            # Get regime characteristics
            self._analyze_regime_characteristics(X_scaled)
            
            logger.info(f"✅ HMM modeli eğitildi: {self.config.n_regimes} regime")
            return True
            
        except Exception as e:
            logger.error(f"❌ HMM eğitim hatası: {e}")
            return False
    
    def _analyze_regime_characteristics(self, X_scaled: np.ndarray):
        """Regime characteristics analizi"""
        try:
            if self.hmm_model is None:
                return
            
            # Predict regimes
            regime_sequence = self.hmm_model.predict(X_scaled)
            
            # Analyze each regime
            for regime_id in range(self.config.n_regimes):
                regime_mask = regime_sequence == regime_id
                
                if np.sum(regime_mask) > 0:
                    regime_data = X_scaled[regime_mask]
                    
                    characteristics = {
                        'mean_return': np.mean(regime_data[:, 0]) if regime_data.shape[1] > 0 else 0,
                        'volatility': np.std(regime_data[:, 0]) if regime_data.shape[1] > 0 else 0,
                        'volume_ratio': np.mean(regime_data[:, 2]) if regime_data.shape[1] > 2 else 0,
                        'rsi': np.mean(regime_data[:, 3]) if regime_data.shape[1] > 3 else 0,
                        'trend_strength': np.mean(regime_data[:, 4]) if regime_data.shape[1] > 4 else 0,
                        'sample_count': np.sum(regime_mask)
                    }
                    
                    self.regime_characteristics[regime_id] = characteristics
            
            logger.info("✅ Regime characteristics analizi tamamlandı")
            
        except Exception as e:
            logger.error(f"❌ Regime characteristics hatası: {e}")
    
    def detect_current_regime(self, features: pd.DataFrame) -> Optional[MarketRegime]:
        """Current market regime'i detect et"""
        try:
            if self.hmm_model is None:
                logger.warning("⚠️ HMM modeli eğitilmemiş")
                return None
            
            if features.empty:
                logger.warning("⚠️ Features boş")
                return None
            
            # Prepare data
            X = features.iloc[-self.config.lookback_period:].values
            X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)
            X_scaled = self.scaler.transform(X)
            
            # Predict regime
            regime_sequence = self.hmm_model.predict(X_scaled)
            current_regime_id = regime_sequence[-1]
            
            # Get regime probabilities
            regime_probs = self.hmm_model.predict_proba(X_scaled[-1:])
            current_prob = regime_probs[0][current_regime_id]
            
            # Regime name
            regime_names = ['Bear', 'Volatile', 'Bull']  # Default names
            if current_regime_id < len(regime_names):
                regime_name = regime_names[current_regime_id]
            else:
                regime_name = f"Regime_{current_regime_id}"
            
            # Regime characteristics
            characteristics = self.regime_characteristics.get(current_regime_id, {})
            
            # Model weights based on regime
            model_weights = self._get_regime_model_weights(current_regime_id, current_prob)
            
            # Create regime object
            current_regime = MarketRegime(
                regime_id=current_regime_id,
                regime_name=regime_name,
                start_date=datetime.now(),
                end_date=None,
                duration_days=1,
                confidence=current_prob,
                characteristics=characteristics,
                model_weights=model_weights
            )
            
            self.current_regime = current_regime
            
            logger.info(f"✅ Current regime detected: {regime_name} (ID: {current_regime_id}, Confidence: {current_prob:.3f})")
            return current_regime
            
        except Exception as e:
            logger.error(f"❌ Regime detection hatası: {e}")
            return None
    
    def _get_regime_model_weights(self, regime_id: int, confidence: float) -> Dict[str, float]:
        """Regime-specific model weights"""
        try:
            # Base weights for different regimes
            base_weights = {
                0: {  # Bear market
                    'lstm': 0.3,
                    'transformer': 0.2,
                    'ensemble': 0.3,
                    'technical': 0.2
                },
                1: {  # Volatile market
                    'lstm': 0.25,
                    'transformer': 0.25,
                    'ensemble': 0.3,
                    'technical': 0.2
                },
                2: {  # Bull market
                    'lstm': 0.2,
                    'transformer': 0.3,
                    'ensemble': 0.3,
                    'technical': 0.2
                }
            }
            
            # Get base weights for current regime
            if regime_id in base_weights:
                weights = base_weights[regime_id].copy()
            else:
                # Default weights
                weights = {
                    'lstm': 0.25,
                    'transformer': 0.25,
                    'ensemble': 0.3,
                    'technical': 0.2
                }
            
            # Adjust weights based on confidence
            if confidence > self.config.regime_confidence_threshold:
                # High confidence: emphasize regime-specific models
                if regime_id == 0:  # Bear
                    weights['technical'] += 0.1
                    weights['lstm'] -= 0.05
                    weights['transformer'] -= 0.05
                elif regime_id == 2:  # Bull
                    weights['transformer'] += 0.1
                    weights['lstm'] -= 0.05
                    weights['technical'] -= 0.05
            
            # Normalize weights
            total_weight = sum(weights.values())
            normalized_weights = {k: v/total_weight for k, v in weights.items()}
            
            return normalized_weights
            
        except Exception as e:
            logger.error(f"❌ Model weights hatası: {e}")
            return {'lstm': 0.25, 'transformer': 0.25, 'ensemble': 0.3, 'technical': 0.2}
    
    def get_regime_analysis(self, data: pd.DataFrame, market_data: pd.DataFrame = None) -> Optional[RegimeAnalysis]:
        """Complete regime analysis"""
        try:
            # Create features
            features = self.create_regime_features(data, market_data)
            
            if features.empty:
                logger.warning("⚠️ Features oluşturulamadı")
                return None
            
            # Train HMM if not trained
            if self.hmm_model is None:
                logger.info("🔧 HMM modeli eğitiliyor...")
                if not self.train_hmm_model(features):
                    return None
            
            # Detect current regime
            current_regime = self.detect_current_regime(features)
            
            if current_regime is None:
                return None
            
            # Get regime probabilities
            X_recent = features.iloc[-1:].values
            X_recent = np.nan_to_num(X_recent, nan=0.0, posinf=0.0, neginf=0.0)
            X_recent_scaled = self.scaler.transform(X_recent)
            
            regime_probs = self.hmm_model.predict_proba(X_recent_scaled)
            regime_probabilities = {i: float(prob) for i, prob in enumerate(regime_probs[0])}
            
            # Determine volatility regime
            if 'volatility' in features.columns:
                current_vol = features['volatility'].iloc[-1]
                vol_ma = features['volatility'].rolling(window=20).mean().iloc[-1]
                
                if current_vol > vol_ma * 1.5:
                    volatility_regime = "HIGH"
                elif current_vol < vol_ma * 0.5:
                    volatility_regime = "LOW"
                else:
                    volatility_regime = "NORMAL"
            else:
                volatility_regime = "UNKNOWN"
            
            # Determine correlation regime
            if 'market_correlation' in features.columns:
                current_corr = features['market_correlation'].iloc[-1]
                if abs(current_corr) > self.config.correlation_threshold:
                    correlation_regime = "HIGH"
                else:
                    correlation_regime = "LOW"
            else:
                correlation_regime = "UNKNOWN"
            
            # Determine macro regime
            if 'usd_try_change' in features.columns:
                usd_try_change = features['usd_try_change'].iloc[-1]
                if usd_try_change > 0.02:
                    macro_regime = "RISK_OFF"
                elif usd_try_change < -0.02:
                    macro_regime = "RISK_ON"
                else:
                    macro_regime = "NEUTRAL"
            else:
                macro_regime = "UNKNOWN"
            
            # Overall confidence
            overall_confidence = current_regime.confidence
            
            # Create analysis
            analysis = RegimeAnalysis(
                current_regime=current_regime,
                regime_probabilities=regime_probabilities,
                regime_transitions=[],  # Will be populated over time
                volatility_regime=volatility_regime,
                correlation_regime=correlation_regime,
                macro_regime=macro_regime,
                confidence=overall_confidence,
                timestamp=datetime.now()
            )
            
            logger.info("✅ Regime analysis tamamlandı")
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Regime analysis hatası: {e}")
            return None
    
    def get_regime_summary(self) -> Dict[str, Any]:
        """Regime detection özeti"""
        try:
            summary = {
                'hmm_trained': self.hmm_model is not None,
                'current_regime': None,
                'regime_characteristics': self.regime_characteristics,
                'total_regimes': self.config.n_regimes
            }
            
            if self.current_regime:
                summary['current_regime'] = {
                    'id': self.current_regime.regime_id,
                    'name': self.current_regime.regime_name,
                    'confidence': self.current_regime.confidence,
                    'model_weights': self.current_regime.model_weights,
                    'characteristics': self.current_regime.characteristics
                }
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Regime summary hatası: {e}")
            return {}

def main():
    """Test fonksiyonu"""
    logger.info("🚀 Market Regime Detection Test Başlıyor...")
    
    # Config
    config = MarketRegimeConfig(
        n_regimes=3,
        lookback_period=100,
        volatility_window=20,
        correlation_threshold=0.7
    )
    
    # Detector
    detector = MarketRegimeDetector(config)
    
    # Test data oluştur
    np.random.seed(42)
    n_samples = 500
    
    # Simulated stock data
    dates = pd.date_range(start='2023-01-01', periods=n_samples, freq='D')
    
    # Price data with different regimes
    prices = []
    volumes = []
    
    # Bear market (first 100 days)
    for i in range(100):
        if i == 0:
            price = 100
        else:
            price = prices[-1] * (1 + np.random.normal(-0.02, 0.03))
        prices.append(price)
        volumes.append(np.random.randint(1000, 5000))
    
    # Volatile market (next 200 days)
    for i in range(200):
        if i == 0:
            price = prices[-1]
        else:
            price = prices[-1] * (1 + np.random.normal(0, 0.05))
        prices.append(price)
        volumes.append(np.random.randint(2000, 8000))
    
    # Bull market (last 200 days)
    for i in range(200):
        if i == 0:
            price = prices[-1]
        else:
            price = prices[-1] * (1 + np.random.normal(0.01, 0.02))
        prices.append(price)
        volumes.append(np.random.randint(3000, 10000))
    
    # Create DataFrame
    data = pd.DataFrame({
        'Close': prices,
        'Volume': volumes
    }, index=dates)
    
    # Market data (simulated)
    market_data = pd.DataFrame({
        'Close': [p * (1 + np.random.normal(0, 0.01)) for p in prices]
    }, index=dates)
    
    logger.info(f"📊 Test data oluşturuldu: {data.shape}")
    
    # Regime analysis
    logger.info("🔍 Regime analysis başlıyor...")
    analysis = detector.get_regime_analysis(data, market_data)
    
    if analysis:
        logger.info("📊 Regime Analysis Results:")
        logger.info(f"   Current Regime: {analysis.current_regime.regime_name}")
        logger.info(f"   Confidence: {analysis.confidence:.3f}")
        logger.info(f"   Volatility Regime: {analysis.volatility_regime}")
        logger.info(f"   Correlation Regime: {analysis.correlation_regime}")
        logger.info(f"   Macro Regime: {analysis.macro_regime}")
        
        logger.info("🔧 Model Weights:")
        for model, weight in analysis.current_regime.model_weights.items():
            logger.info(f"   {model}: {weight:.3f}")
        
        # Regime summary
        summary = detector.get_regime_summary()
        logger.info("📋 Regime Summary:")
        logger.info(f"   HMM Trained: {summary['hmm_trained']}")
        logger.info(f"   Total Regimes: {summary['total_regimes']}")
        
        if summary['current_regime']:
            current = summary['current_regime']
            logger.info(f"   Current Regime ID: {current['id']}")
            logger.info(f"   Regime Name: {current['name']}")
            logger.info(f"   Confidence: {current['confidence']:.3f}")
    
    logger.info("✅ Test tamamlandı!")

if __name__ == "__main__":
    main()
