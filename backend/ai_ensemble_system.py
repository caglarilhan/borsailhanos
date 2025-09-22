#!/usr/bin/env python3
"""
🤖 AI Ensemble System
PRD v2.0 - LightGBM + LSTM + TimeGPT Ensemble
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import yfinance as yf
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import warnings
warnings.filterwarnings('ignore')

# LightGBM
try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False
    logging.warning("LightGBM not available. Install with: pip install lightgbm")

# TensorFlow/Keras for LSTM
try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.optimizers import Adam
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    logging.warning("TensorFlow not available. Install with: pip install tensorflow")

logger = logging.getLogger(__name__)

@dataclass
class AIEnsemblePrediction:
    """AI Ensemble tahmin sonucu"""
    symbol: str
    prediction: float
    confidence: float
    lightgbm_pred: float
    lstm_pred: float
    timegpt_pred: float
    ensemble_weight: Dict[str, float]
    features_importance: Dict[str, float]
    timestamp: datetime

class AIEnsembleSystem:
    """AI Ensemble sistemi"""
    
    def __init__(self):
        self.lightgbm_model = None
        self.lstm_model = None
        self.scaler = StandardScaler()
        self.feature_scaler = MinMaxScaler()
        self.feature_names = []
        self.ensemble_weights = {
            'lightgbm': 0.4,
            'lstm': 0.35,
            'timegpt': 0.25
        }
        
    def prepare_features(self, symbol: str, period: str = "2y") -> pd.DataFrame:
        """Özellik mühendisliği"""
        logger.info(f"🔧 {symbol} için özellik mühendisliği başlıyor...")
        
        try:
            stock = yf.Ticker(symbol)
            data = stock.history(period=period)
            
            if data.empty:
                logger.error(f"❌ {symbol} için veri bulunamadı")
                return pd.DataFrame()
            
            # Temel fiyat özellikleri
            df = data.copy()
            df['returns'] = df['Close'].pct_change()
            df['log_returns'] = np.log(df['Close'] / df['Close'].shift(1))
            
            # Teknik indikatörler
            df['sma_5'] = df['Close'].rolling(5).mean()
            df['sma_20'] = df['Close'].rolling(20).mean()
            df['sma_50'] = df['Close'].rolling(50).mean()
            df['ema_12'] = df['Close'].ewm(span=12).mean()
            df['ema_26'] = df['Close'].ewm(span=26).mean()
            
            # MACD
            df['macd'] = df['ema_12'] - df['ema_26']
            df['macd_signal'] = df['macd'].ewm(span=9).mean()
            df['macd_histogram'] = df['macd'] - df['macd_signal']
            
            # RSI
            delta = df['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            df['rsi'] = 100 - (100 / (1 + rs))
            
            # Bollinger Bands
            df['bb_middle'] = df['Close'].rolling(20).mean()
            bb_std = df['Close'].rolling(20).std()
            df['bb_upper'] = df['bb_middle'] + (bb_std * 2)
            df['bb_lower'] = df['bb_middle'] - (bb_std * 2)
            df['bb_width'] = (df['bb_upper'] - df['bb_lower']) / df['bb_middle']
            df['bb_position'] = (df['Close'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
            
            # Volume indikatörleri
            df['volume_sma'] = df['Volume'].rolling(20).mean()
            df['volume_ratio'] = df['Volume'] / df['volume_sma']
            df['price_volume'] = df['Close'] * df['Volume']
            
            # Volatilite
            df['volatility'] = df['returns'].rolling(20).std()
            df['volatility_ratio'] = df['volatility'] / df['volatility'].rolling(50).mean()
            
            # Momentum indikatörleri
            df['momentum_5'] = df['Close'] / df['Close'].shift(5) - 1
            df['momentum_10'] = df['Close'] / df['Close'].shift(10) - 1
            df['momentum_20'] = df['Close'] / df['Close'].shift(20) - 1
            
            # Fiyat pozisyonu
            df['price_position_20'] = (df['Close'] - df['Close'].rolling(20).min()) / (df['Close'].rolling(20).max() - df['Close'].rolling(20).min())
            df['price_position_50'] = (df['Close'] - df['Close'].rolling(50).min()) / (df['Close'].rolling(50).max() - df['Close'].rolling(50).min())
            
            # Lagged features
            for lag in [1, 2, 3, 5, 10]:
                df[f'close_lag_{lag}'] = df['Close'].shift(lag)
                df[f'volume_lag_{lag}'] = df['Volume'].shift(lag)
                df[f'returns_lag_{lag}'] = df['returns'].shift(lag)
            
            # Target variable (gelecek 1 günlük getiri)
            df['target'] = df['Close'].shift(-1) / df['Close'] - 1
            
            # NaN değerleri temizle
            df = df.dropna()
            
            # Feature listesi
            feature_cols = [col for col in df.columns if col not in ['target', 'Open', 'High', 'Low', 'Close', 'Volume']]
            self.feature_names = feature_cols
            
            logger.info(f"✅ {symbol}: {len(feature_cols)} özellik hazırlandı")
            return df[feature_cols + ['target']]
            
        except Exception as e:
            logger.error(f"❌ {symbol} özellik mühendisliği hatası: {e}")
            return pd.DataFrame()
    
    def train_lightgbm(self, X: np.ndarray, y: np.ndarray) -> bool:
        """LightGBM modeli eğit"""
        if not LIGHTGBM_AVAILABLE:
            logger.warning("⚠️ LightGBM mevcut değil")
            return False
        
        try:
            logger.info("🚀 LightGBM modeli eğitiliyor...")
            
            # Time series split
            tscv = TimeSeriesSplit(n_splits=3)
            
            # LightGBM parametreleri
            params = {
                'objective': 'regression',
                'metric': 'rmse',
                'boosting_type': 'gbdt',
                'num_leaves': 31,
                'learning_rate': 0.05,
                'feature_fraction': 0.9,
                'bagging_fraction': 0.8,
                'bagging_freq': 5,
                'verbose': -1,
                'random_state': 42
            }
            
            # Cross-validation ile eğitim
            cv_scores = []
            for train_idx, val_idx in tscv.split(X):
                X_train, X_val = X[train_idx], X[val_idx]
                y_train, y_val = y[train_idx], y[val_idx]
                
                train_data = lgb.Dataset(X_train, label=y_train)
                val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
                
                model = lgb.train(
                    params,
                    train_data,
                    valid_sets=[val_data],
                    num_boost_round=1000,
                    callbacks=[lgb.early_stopping(100), lgb.log_evaluation(0)]
                )
                
                y_pred = model.predict(X_val)
                score = r2_score(y_val, y_pred)
                cv_scores.append(score)
            
            # Final model
            train_data = lgb.Dataset(X, label=y)
            self.lightgbm_model = lgb.train(
                params,
                train_data,
                num_boost_round=1000,
                callbacks=[lgb.log_evaluation(0)]
            )
            
            avg_score = np.mean(cv_scores)
            logger.info(f"✅ LightGBM eğitildi - CV R²: {avg_score:.4f}")
            return True
            
        except Exception as e:
            logger.error(f"❌ LightGBM eğitim hatası: {e}")
            return False
    
    def train_lstm(self, X: np.ndarray, y: np.ndarray) -> bool:
        """LSTM modeli eğit"""
        if not TENSORFLOW_AVAILABLE:
            logger.warning("⚠️ TensorFlow mevcut değil")
            return False
        
        try:
            logger.info("🧠 LSTM modeli eğitiliyor...")
            
            # LSTM için veri hazırlama (sequence data)
            sequence_length = 10
            X_lstm, y_lstm = self._prepare_lstm_data(X, y, sequence_length)
            
            if X_lstm.shape[0] < 100:
                logger.warning("⚠️ LSTM için yeterli veri yok")
                return False
            
            # Model oluştur
            model = Sequential([
                LSTM(50, return_sequences=True, input_shape=(sequence_length, X.shape[1])),
                Dropout(0.2),
                LSTM(50, return_sequences=False),
                Dropout(0.2),
                Dense(25),
                Dense(1)
            ])
            
            model.compile(
                optimizer=Adam(learning_rate=0.001),
                loss='mse',
                metrics=['mae']
            )
            
            # Eğitim
            history = model.fit(
                X_lstm, y_lstm,
                epochs=50,
                batch_size=32,
                validation_split=0.2,
                verbose=0
            )
            
            self.lstm_model = model
            
            # Validation loss
            val_loss = min(history.history['val_loss'])
            logger.info(f"✅ LSTM eğitildi - Val Loss: {val_loss:.6f}")
            return True
            
        except Exception as e:
            logger.error(f"❌ LSTM eğitim hatası: {e}")
            return False
    
    def _prepare_lstm_data(self, X: np.ndarray, y: np.ndarray, sequence_length: int) -> Tuple[np.ndarray, np.ndarray]:
        """LSTM için sequence veri hazırla"""
        X_lstm = []
        y_lstm = []
        
        for i in range(sequence_length, len(X)):
            X_lstm.append(X[i-sequence_length:i])
            y_lstm.append(y[i])
        
        return np.array(X_lstm), np.array(y_lstm)
    
    def predict_timegpt(self, symbol: str, periods: int = 1) -> float:
        """TimeGPT tahmini (basit implementasyon)"""
        try:
            # Basit trend analizi ile TimeGPT simülasyonu
            stock = yf.Ticker(symbol)
            data = stock.history(period="6mo")
            
            if data.empty:
                return 0.0
            
            # Son 30 günlük trend
            recent_data = data['Close'].tail(30)
            trend = recent_data.pct_change().mean()
            
            # Volatilite
            volatility = recent_data.pct_change().std()
            
            # Basit tahmin
            prediction = trend * (1 - volatility)  # Volatilite ile düzeltme
            
            return float(prediction)
            
        except Exception as e:
            logger.error(f"❌ TimeGPT tahmin hatası: {e}")
            return 0.0
    
    def predict_ensemble(self, symbol: str) -> Optional[AIEnsemblePrediction]:
        """Ensemble tahmin yap"""
        logger.info(f"🤖 {symbol} için AI Ensemble tahmini başlıyor...")
        
        try:
            # Özellikleri hazırla
            df = self.prepare_features(symbol)
            
            if df.empty:
                logger.error(f"❌ {symbol} için özellik hazırlanamadı")
                return None
            
            # Son veriyi al
            X_latest = df[self.feature_names].iloc[-1:].values
            y_actual = df['target'].iloc[-1]
            
            # Özellikleri normalize et
            X_scaled = self.scaler.fit_transform(X_latest)
            
            predictions = {}
            confidences = {}
            
            # LightGBM tahmini
            if self.lightgbm_model is not None:
                try:
                    lgb_pred = self.lightgbm_model.predict(X_scaled)[0]
                    predictions['lightgbm'] = lgb_pred
                    confidences['lightgbm'] = 0.8  # Sabit güven skoru
                except Exception as e:
                    logger.error(f"❌ LightGBM tahmin hatası: {e}")
                    predictions['lightgbm'] = 0.0
                    confidences['lightgbm'] = 0.0
            
            # LSTM tahmini
            if self.lstm_model is not None:
                try:
                    # LSTM için sequence hazırla
                    X_lstm = df[self.feature_names].tail(10).values
                    X_lstm_scaled = self.scaler.transform(X_lstm)
                    X_lstm_reshaped = X_lstm_scaled.reshape(1, 10, X_lstm_scaled.shape[1])
                    
                    lstm_pred = self.lstm_model.predict(X_lstm_reshaped, verbose=0)[0][0]
                    predictions['lstm'] = lstm_pred
                    confidences['lstm'] = 0.75
                except Exception as e:
                    logger.error(f"❌ LSTM tahmin hatası: {e}")
                    predictions['lstm'] = 0.0
                    confidences['lstm'] = 0.0
            
            # TimeGPT tahmini
            timegpt_pred = self.predict_timegpt(symbol)
            predictions['timegpt'] = timegpt_pred
            confidences['timegpt'] = 0.7
            
            # Ensemble tahmin
            ensemble_pred = 0.0
            total_weight = 0.0
            
            for model_name, pred in predictions.items():
                weight = self.ensemble_weights[model_name] * confidences[model_name]
                ensemble_pred += pred * weight
                total_weight += weight
            
            if total_weight > 0:
                ensemble_pred /= total_weight
            
            # Feature importance (LightGBM'den)
            feature_importance = {}
            if self.lightgbm_model is not None:
                try:
                    importance = self.lightgbm_model.feature_importance()
                    for i, feature in enumerate(self.feature_names):
                        feature_importance[feature] = float(importance[i])
                except:
                    feature_importance = {}
            
            result = AIEnsemblePrediction(
                symbol=symbol,
                prediction=ensemble_pred,
                confidence=min(total_weight, 1.0),
                lightgbm_pred=predictions.get('lightgbm', 0.0),
                lstm_pred=predictions.get('lstm', 0.0),
                timegpt_pred=predictions.get('timegpt', 0.0),
                ensemble_weight=self.ensemble_weights.copy(),
                features_importance=feature_importance,
                timestamp=datetime.now()
            )
            
            logger.info(f"✅ {symbol} Ensemble tahmin: {ensemble_pred:.4f} (Güven: {result.confidence:.2f})")
            return result
            
        except Exception as e:
            logger.error(f"❌ {symbol} Ensemble tahmin hatası: {e}")
            return None
    
    def train_ensemble(self, symbol: str) -> bool:
        """Ensemble sistemini eğit"""
        logger.info(f"🎓 {symbol} için AI Ensemble eğitimi başlıyor...")
        
        try:
            # Özellikleri hazırla
            df = self.prepare_features(symbol)
            
            if df.empty:
                logger.error(f"❌ {symbol} için veri bulunamadı")
                return False
            
            # X ve y'yi hazırla
            X = df[self.feature_names].values
            y = df['target'].values
            
            # Veriyi normalize et
            X_scaled = self.scaler.fit_transform(X)
            
            # Modelleri eğit
            lgb_success = self.train_lightgbm(X_scaled, y)
            lstm_success = self.train_lstm(X_scaled, y)
            
            if lgb_success or lstm_success:
                logger.info(f"✅ {symbol} AI Ensemble eğitimi tamamlandı")
                return True
            else:
                logger.error(f"❌ {symbol} AI Ensemble eğitimi başarısız")
                return False
                
        except Exception as e:
            logger.error(f"❌ {symbol} AI Ensemble eğitim hatası: {e}")
            return False

def test_ai_ensemble():
    """AI Ensemble test fonksiyonu"""
    logger.info("🧪 AI Ensemble test başlıyor...")
    
    ensemble = AIEnsembleSystem()
    test_symbols = ["GARAN.IS", "AKBNK.IS", "SISE.IS"]
    
    results = []
    
    for symbol in test_symbols:
        # Eğitim
        success = ensemble.train_ensemble(symbol)
        
        if success:
            # Tahmin
            prediction = ensemble.predict_ensemble(symbol)
            
            if prediction:
                results.append(prediction)
                
                logger.info(f"📈 {symbol}:")
                logger.info(f"   Ensemble: {prediction.prediction:.4f} (Güven: {prediction.confidence:.2f})")
                logger.info(f"   LightGBM: {prediction.lightgbm_pred:.4f}")
                logger.info(f"   LSTM: {prediction.lstm_pred:.4f}")
                logger.info(f"   TimeGPT: {prediction.timegpt_pred:.4f}")
    
    logger.info(f"✅ AI Ensemble test tamamlandı: {len(results)} tahmin")
    return results

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_ai_ensemble()
