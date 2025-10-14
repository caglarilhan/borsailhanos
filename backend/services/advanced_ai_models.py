"""
Gelişmiş AI Modelleri - LightGBM + LSTM + TimeGPT
PRD v2.0'a göre ensemble AI sistemi
"""

import numpy as np
import pandas as pd
import yfinance as yf
from typing import Dict, List, Tuple, Optional, Any
import logging
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# AI Model imports
try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False
    logging.warning("LightGBM not available, using fallback")

try:
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.optimizers import Adam
    from sklearn.preprocessing import MinMaxScaler
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    logging.warning("TensorFlow not available, using fallback")

try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logging.warning("Transformers not available, using fallback")

class AdvancedAIModels:
    """Gelişmiş AI modelleri ensemble sistemi"""
    
    def __init__(self):
        self.lightgbm_model = None
        self.lstm_model = None
        self.timegpt_model = None
        self.scaler = MinMaxScaler() if TENSORFLOW_AVAILABLE else None
        self.feature_columns = []
        self.is_trained = False
        
    def prepare_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Teknik indikatörler ve özellik mühendisliği"""
        df = data.copy()
        
        # Fiyat özellikleri
        df['price_change'] = df['Close'].pct_change()
        df['high_low_ratio'] = df['High'] / df['Low']
        df['close_open_ratio'] = df['Close'] / df['Open']
        
        # Hareketli ortalamalar
        for period in [5, 10, 20, 50]:
            df[f'sma_{period}'] = df['Close'].rolling(period).mean()
            df[f'ema_{period}'] = df['Close'].ewm(span=period).mean()
            df[f'price_sma_{period}_ratio'] = df['Close'] / df[f'sma_{period}']
        
        # Momentum indikatörleri
        df['rsi'] = self._calculate_rsi(df['Close'])
        df['macd'], df['macd_signal'] = self._calculate_macd(df['Close'])
        df['bollinger_upper'], df['bollinger_lower'] = self._calculate_bollinger_bands(df['Close'])
        
        # Volatilite
        df['volatility'] = df['Close'].rolling(20).std()
        df['atr'] = self._calculate_atr(df)
        
        # Volume özellikleri
        df['volume_sma'] = df['Volume'].rolling(20).mean()
        df['volume_ratio'] = df['Volume'] / df['volume_sma']
        
        # Lag özellikleri
        for lag in [1, 2, 3, 5]:
            df[f'close_lag_{lag}'] = df['Close'].shift(lag)
            df[f'volume_lag_{lag}'] = df['Volume'].shift(lag)
        
        # Hedef değişken (gelecek fiyat değişimi)
        df['target'] = df['Close'].shift(-1) / df['Close'] - 1
        
        # NaN değerleri temizle
        df = df.dropna()
        
        return df
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """RSI hesaplama"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def _calculate_macd(self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple[pd.Series, pd.Series]:
        """MACD hesaplama"""
        ema_fast = prices.ewm(span=fast).mean()
        ema_slow = prices.ewm(span=slow).mean()
        macd = ema_fast - ema_slow
        macd_signal = macd.ewm(span=signal).mean()
        return macd, macd_signal
    
    def _calculate_bollinger_bands(self, prices: pd.Series, period: int = 20, std_dev: float = 2) -> Tuple[pd.Series, pd.Series]:
        """Bollinger Bands hesaplama"""
        sma = prices.rolling(period).mean()
        std = prices.rolling(period).std()
        upper = sma + (std * std_dev)
        lower = sma - (std * std_dev)
        return upper, lower
    
    def _calculate_atr(self, df: pd.DataFrame, period: int = 14) -> pd.Series:
        """Average True Range hesaplama"""
        high_low = df['High'] - df['Low']
        high_close = np.abs(df['High'] - df['Close'].shift())
        low_close = np.abs(df['Low'] - df['Close'].shift())
        true_range = np.maximum(high_low, np.maximum(high_close, low_close))
        atr = true_range.rolling(period).mean()
        return atr
    
    def train_lightgbm_model(self, df: pd.DataFrame) -> Dict[str, Any]:
        """LightGBM modeli eğitimi"""
        if not LIGHTGBM_AVAILABLE:
            return {"error": "LightGBM not available"}
        
        try:
            # Özellik ve hedef ayırma
            feature_cols = [col for col in df.columns if col not in ['target', 'Date', 'Open', 'High', 'Low', 'Close', 'Volume']]
            X = df[feature_cols]
            y = df['target']
            
            # Train/test split
            split_idx = int(len(X) * 0.8)
            X_train, X_test = X[:split_idx], X[split_idx:]
            y_train, y_test = y[:split_idx], y[split_idx:]
            
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
                'verbose': -1
            }
            
            # Model eğitimi
            train_data = lgb.Dataset(X_train, label=y_train)
            self.lightgbm_model = lgb.train(params, train_data, num_boost_round=100)
            
            # Tahmin ve değerlendirme
            y_pred = self.lightgbm_model.predict(X_test)
            mse = np.mean((y_test - y_pred) ** 2)
            rmse = np.sqrt(mse)
            
            # Özellik önemleri
            feature_importance = dict(zip(feature_cols, self.lightgbm_model.feature_importance()))
                
            return {
                "model": "LightGBM",
                "rmse": float(rmse),
                "mse": float(mse),
                "feature_importance": feature_importance,
                "status": "trained"
            }
            
        except Exception as e:
            return {"error": f"LightGBM training failed: {str(e)}"}
    
    def train_lstm_model(self, df: pd.DataFrame) -> Dict[str, Any]:
        """LSTM modeli eğitimi"""
        if not TENSORFLOW_AVAILABLE:
            return {"error": "TensorFlow not available"}
        
        try:
            # Özellik ve hedef ayırma
            feature_cols = [col for col in df.columns if col not in ['target', 'Date', 'Open', 'High', 'Low', 'Close', 'Volume']]
            X = df[feature_cols].values
            y = df['target'].values
            
            # Veri normalizasyonu
            X_scaled = self.scaler.fit_transform(X)
            
            # Zaman serisi veri hazırlama
            sequence_length = 10
            X_sequences = []
            y_sequences = []
            
            for i in range(sequence_length, len(X_scaled)):
                X_sequences.append(X_scaled[i-sequence_length:i])
                y_sequences.append(y[i])
            
            X_sequences = np.array(X_sequences)
            y_sequences = np.array(y_sequences)
            
            # Train/test split
            split_idx = int(len(X_sequences) * 0.8)
            X_train, X_test = X_sequences[:split_idx], X_sequences[split_idx:]
            y_train, y_test = y_sequences[:split_idx], y_sequences[split_idx:]
            
            # LSTM modeli oluşturma
            self.lstm_model = Sequential([
                LSTM(50, return_sequences=True, input_shape=(sequence_length, len(feature_cols))),
                Dropout(0.2),
                LSTM(50, return_sequences=False),
                Dropout(0.2),
                Dense(25),
                Dense(1)
            ])
            
            self.lstm_model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
            
            # Model eğitimi
            history = self.lstm_model.fit(
                X_train, y_train,
                batch_size=32,
                epochs=50,
                validation_data=(X_test, y_test),
                verbose=0
            )
            
            # Tahmin ve değerlendirme
            y_pred = self.lstm_model.predict(X_test)
            mse = np.mean((y_test - y_pred.flatten()) ** 2)
            rmse = np.sqrt(mse)
            
            return {
                "model": "LSTM",
                "rmse": float(rmse),
                "mse": float(mse),
                "training_loss": float(history.history['loss'][-1]),
                "validation_loss": float(history.history['val_loss'][-1]),
                "status": "trained"
            }
            
        except Exception as e:
            return {"error": f"LSTM training failed: {str(e)}"}
    
    def train_timegpt_model(self, df: pd.DataFrame) -> Dict[str, Any]:
        """TimeGPT modeli eğitimi (simulated)"""
        try:
            # TimeGPT için basit bir zaman serisi modeli
            # Gerçek TimeGPT API entegrasyonu için API key gerekli
            
            # Özellik ve hedef ayırma
            feature_cols = [col for col in df.columns if col not in ['target', 'Date', 'Open', 'High', 'Low', 'Close', 'Volume']]
            X = df[feature_cols]
            y = df['target']
            
            # Basit lineer regresyon (TimeGPT placeholder)
            from sklearn.linear_model import LinearRegression
            from sklearn.metrics import mean_squared_error
            
            # Train/test split
            split_idx = int(len(X) * 0.8)
            X_train, X_test = X[:split_idx], X[split_idx:]
            y_train, y_test = y[:split_idx], y[split_idx:]
            
            # Model eğitimi
            self.timegpt_model = LinearRegression()
            self.timegpt_model.fit(X_train, y_train)
            
            # Tahmin ve değerlendirme
            y_pred = self.timegpt_model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
                
            return {
                "model": "TimeGPT (Simulated)",
                "rmse": float(rmse),
                "mse": float(mse),
                "status": "trained",
                "note": "Using LinearRegression as TimeGPT placeholder"
            }
            
        except Exception as e:
            return {"error": f"TimeGPT training failed: {str(e)}"}
    
    def train_ensemble(self, symbol: str, period: str = "1y") -> Dict[str, Any]:
        """Ensemble model eğitimi"""
        try:
            # Veri çekme
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period)
            
            if data.empty:
                return {"error": f"No data available for {symbol}"}
            
            # Özellik hazırlama
            df = self.prepare_features(data)
            
            if len(df) < 100:
                return {"error": "Insufficient data for training"}
            
            # Model eğitimleri
            results = {}
            
            # LightGBM
            lightgbm_result = self.train_lightgbm_model(df)
            results["lightgbm"] = lightgbm_result
            
            # LSTM
            lstm_result = self.train_lstm_model(df)
            results["lstm"] = lstm_result
            
            # TimeGPT
            timegpt_result = self.train_timegpt_model(df)
            results["timegpt"] = timegpt_result
            
            # Ensemble başarı kontrolü
            trained_models = sum(1 for result in results.values() if "error" not in result)
            
            self.is_trained = trained_models > 0
            
            return {
                "symbol": symbol,
                "period": period,
                "data_points": len(df),
                "trained_models": trained_models,
                "results": results,
                "status": "completed" if self.is_trained else "failed"
            }
            
        except Exception as e:
            return {"error": f"Ensemble training failed: {str(e)}"}
    
    def predict_ensemble(self, symbol: str, days_ahead: int = 5) -> Dict[str, Any]:
        """Ensemble tahmin"""
        if not self.is_trained:
            return {"error": "Models not trained"}
        
        try:
            # Son verileri çek
            ticker = yf.Ticker(symbol)
            data = ticker.history(period="3mo")
            
            if data.empty:
                return {"error": f"No data available for {symbol}"}
            
            # Özellik hazırlama
            df = self.prepare_features(data)
            
            if len(df) < 10:
                return {"error": "Insufficient data for prediction"}
            
            # Son veriler
            latest_data = df.iloc[-1:]
            feature_cols = [col for col in df.columns if col not in ['target', 'Date', 'Open', 'High', 'Low', 'Close', 'Volume']]
            
            predictions = {}
            
            # LightGBM tahmin
            if self.lightgbm_model and LIGHTGBM_AVAILABLE:
                try:
                    X_latest = latest_data[feature_cols]
                    lightgbm_pred = self.lightgbm_model.predict(X_latest)[0]
                    predictions["lightgbm"] = {
                        "prediction": float(lightgbm_pred),
                        "confidence": 0.8
                    }
                except Exception as e:
                    predictions["lightgbm"] = {"error": "Prediction failed"}
            
            # LSTM tahmin
            if self.lstm_model and TENSORFLOW_AVAILABLE:
                try:
                    # Son 10 günlük veri
                    X_latest = df[feature_cols].values[-10:]
                    X_scaled = self.scaler.transform(X_latest)
                    X_sequence = X_scaled.reshape(1, 10, len(feature_cols))
                    
                    lstm_pred = self.lstm_model.predict(X_sequence)[0][0]
                    predictions["lstm"] = {
                        "prediction": float(lstm_pred),
                        "confidence": 0.75
                    }
                except:
                    predictions["lstm"] = {"error": "Prediction failed"}
            
            # TimeGPT tahmin
            if self.timegpt_model:
                try:
                    X_latest = latest_data[feature_cols]
                    timegpt_pred = self.timegpt_model.predict(X_latest)[0]
                    predictions["timegpt"] = {
                        "prediction": float(timegpt_pred),
                        "confidence": 0.7
                    }
                except:
                    predictions["timegpt"] = {"error": "Prediction failed"}
            
            # Ensemble tahmin (ağırlıklı ortalama)
            valid_predictions = [pred for pred in predictions.values() if "error" not in pred]
            
            if valid_predictions:
                # Ağırlıklı ortalama
                weights = [pred["confidence"] for pred in valid_predictions]
                values = [pred["prediction"] for pred in valid_predictions]
                
                ensemble_pred = np.average(values, weights=weights)
                ensemble_confidence = np.mean(weights)
                
                # Sinyal üretimi
                signal = "BUY" if ensemble_pred > 0.02 else "SELL" if ensemble_pred < -0.02 else "HOLD"
                
                return {
                    "symbol": symbol,
                    "days_ahead": days_ahead,
                    "ensemble_prediction": float(ensemble_pred),
                    "ensemble_confidence": float(ensemble_confidence),
                    "signal": signal,
                    "individual_predictions": predictions,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {"error": "No valid predictions available"}
                
        except Exception as e:
            return {"error": f"Ensemble prediction failed: {str(e)}"}
    
    def get_model_status(self) -> Dict[str, Any]:
        """Model durumu"""
        return {
            "lightgbm_available": LIGHTGBM_AVAILABLE,
            "tensorflow_available": TENSORFLOW_AVAILABLE,
            "transformers_available": TRANSFORMERS_AVAILABLE,
            "is_trained": self.is_trained,
            "lightgbm_trained": self.lightgbm_model is not None,
            "lstm_trained": self.lstm_model is not None,
            "timegpt_trained": self.timegpt_model is not None
        }

# Global instance
ai_models = AdvancedAIModels()

def train_ai_models(symbol: str, period: str = "1y") -> Dict[str, Any]:
    """AI modelleri eğitimi"""
    return ai_models.train_ensemble(symbol, period)

def predict_with_ai_models(symbol: str, days_ahead: int = 5) -> Dict[str, Any]:
    """AI modelleri ile tahmin"""
    return ai_models.predict_ensemble(symbol, days_ahead)

def get_ai_model_status() -> Dict[str, Any]:
    """AI model durumu"""
    return ai_models.get_model_status()