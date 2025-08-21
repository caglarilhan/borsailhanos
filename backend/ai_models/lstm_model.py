"""
LSTM Neural Network - 4 Saatlik Pattern Öğrenme
- Sequence modeling
- Attention mechanism
- Multi-step forecasting
- Model checkpointing
"""

import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Attention, Bidirectional
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
import joblib
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import os

logger = logging.getLogger(__name__)

class LSTMModel:
    def __init__(self, model_path: str = "models/lstm_model.h5", scaler_path: str = "models/lstm_scaler.pkl"):
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.model = None
        self.scaler = MinMaxScaler()
        self.is_trained = False
        
        # Model parametreleri
        self.sequence_length = 60  # 60 mum (4 saatlik)
        self.prediction_steps = 4  # 4 saat sonrası
        self.feature_columns = ['Close', 'Volume', 'returns', 'rsi', 'macd', 'bbands_position']
        
        # LSTM parametreleri
        self.lstm_units = 128
        self.dropout_rate = 0.2
        self.learning_rate = 0.001
        self.batch_size = 32
        self.epochs = 100
        
        # GPU kullanımı
        self.setup_gpu()
    
    def setup_gpu(self):
        """GPU ayarları"""
        try:
            gpus = tf.config.experimental.list_physical_devices('GPU')
            if gpus:
                for gpu in gpus:
                    tf.config.experimental.set_memory_growth(gpu, True)
                logger.info(f"GPU bulundu: {len(gpus)} adet")
            else:
                logger.info("GPU bulunamadı, CPU kullanılıyor")
        except Exception as e:
            logger.warning(f"GPU ayar hatası: {e}")
    
    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Teknik indikatörler oluştur"""
        try:
            features = df.copy()
            
            # Returns
            features['returns'] = df['Close'].pct_change()
            
            # RSI
            features['rsi'] = self.calculate_rsi(df['Close'], 14)
            
            # MACD
            features['macd'] = self.calculate_macd(df['Close'])
            
            # Bollinger Bands position
            features['bbands_position'] = self.calculate_bbands_position(df['Close'])
            
            # Volatilite
            features['volatility'] = features['returns'].rolling(20).std()
            
            # Momentum
            features['momentum'] = features['returns'].rolling(10).mean()
            
            # NaN değerleri temizle
            features = features.fillna(method='ffill').fillna(0)
            
            return features
            
        except Exception as e:
            logger.error(f"Feature oluşturma hatası: {e}")
            return df
    
    def calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """RSI hesapla"""
        try:
            delta = prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            return rsi
        except Exception as e:
            logger.error(f"RSI hesaplama hatası: {e}")
            return pd.Series(50, index=prices.index)
    
    def calculate_macd(self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.Series:
        """MACD hesapla"""
        try:
            ema_fast = prices.ewm(span=fast).mean()
            ema_slow = prices.ewm(span=slow).mean()
            macd = ema_fast - ema_slow
            return macd
        except Exception as e:
            logger.error(f"MACD hesaplama hatası: {e}")
            return pd.Series(0, index=prices.index)
    
    def calculate_bbands_position(self, prices: pd.Series, period: int = 20, std: int = 2) -> pd.Series:
        """Bollinger Bands pozisyonu"""
        try:
            sma = prices.rolling(period).mean()
            std_dev = prices.rolling(period).std()
            upper_band = sma + (std_dev * std)
            lower_band = sma - (std_dev * std)
            
            # Pozisyon: 0 (alt band) ile 1 (üst band) arası
            position = (prices - lower_band) / (upper_band - lower_band)
            return position
        except Exception as e:
            logger.error(f"BBands pozisyon hatası: {e}")
            return pd.Series(0.5, index=prices.index)
    
    def prepare_sequences(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """LSTM için sequence veri hazırla"""
        try:
            # Feature'ları seç
            feature_data = df[self.feature_columns].values
            
            # Normalize et
            scaled_data = self.scaler.fit_transform(feature_data)
            
            X, y = [], []
            
            for i in range(self.sequence_length, len(scaled_data) - self.prediction_steps + 1):
                # Input sequence
                X.append(scaled_data[i-self.sequence_length:i])
                
                # Target: gelecek 4 saatlik fiyat değişimi
                future_prices = df['Close'].iloc[i:i+self.prediction_steps].values
                current_price = df['Close'].iloc[i-1]
                price_change = (future_prices[-1] - current_price) / current_price
                
                y.append(price_change)
            
            return np.array(X), np.array(y)
            
        except Exception as e:
            logger.error(f"Sequence hazırlama hatası: {e}")
            return np.array([]), np.array([])
    
    def build_model(self, input_shape: Tuple) -> tf.keras.Model:
        """LSTM model oluştur"""
        try:
            model = Sequential([
                # Bidirectional LSTM layers
                Bidirectional(LSTM(self.lstm_units, return_sequences=True, input_shape=input_shape)),
                Dropout(self.dropout_rate),
                
                Bidirectional(LSTM(self.lstm_units // 2, return_sequences=True)),
                Dropout(self.dropout_rate),
                
                Bidirectional(LSTM(self.lstm_units // 4, return_sequences=False)),
                Dropout(self.dropout_rate),
                
                # Dense layers
                Dense(64, activation='relu'),
                Dropout(self.dropout_rate),
                Dense(32, activation='relu'),
                Dense(1, activation='tanh')  # -1 ile 1 arası output
            ])
            
            # Compile
            optimizer = Adam(learning_rate=self.learning_rate)
            model.compile(optimizer=optimizer, loss='mse', metrics=['mae'])
            
            return model
            
        except Exception as e:
            logger.error(f"Model oluşturma hatası: {e}")
            return None
    
    def train(self, df: pd.DataFrame) -> Dict:
        """Model eğitimi"""
        try:
            logger.info("LSTM model eğitimi başladı")
            
            # Feature'ları oluştur
            features_df = self.create_features(df)
            
            # Sequence veri hazırla
            X, y = self.prepare_sequences(features_df)
            
            if len(X) == 0 or len(y) == 0:
                raise ValueError("Sequence veri hazırlanamadı")
            
            logger.info(f"Sequence veri boyutu: X={X.shape}, y={y.shape}")
            
            # Train/validation split (son %20 validation)
            split_idx = int(len(X) * 0.8)
            X_train, X_val = X[:split_idx], X[split_idx:]
            y_train, y_val = y[:split_idx], y[split_idx:]
            
            # Model oluştur
            self.model = self.build_model((X.shape[1], X.shape[2]))
            
            if self.model is None:
                raise ValueError("Model oluşturulamadı")
            
            # Callbacks
            callbacks = [
                EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True),
                ModelCheckpoint(self.model_path, monitor='val_loss', save_best_only=True),
                ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-6)
            ]
            
            # Eğitim
            history = self.model.fit(
                X_train, y_train,
                validation_data=(X_val, y_val),
                batch_size=self.batch_size,
                epochs=self.epochs,
                callbacks=callbacks,
                verbose=1
            )
            
            # Validation metrikleri
            val_predictions = self.model.predict(X_val)
            val_mse = mean_squared_error(y_val, val_predictions)
            val_mae = mean_absolute_error(y_val, val_predictions)
            
            # Scaler kaydet
            joblib.dump(self.scaler, self.scaler_path)
            
            self.is_trained = True
            
            return {
                'training_history': history.history,
                'validation_mse': val_mse,
                'validation_mae': val_mae,
                'training_date': datetime.now().isoformat(),
                'sequence_length': self.sequence_length,
                'prediction_steps': self.prediction_steps
            }
            
        except Exception as e:
            logger.error(f"LSTM eğitim hatası: {e}")
            return {}
    
    def predict(self, df: pd.DataFrame) -> Tuple[float, List[float]]:
        """Tahmin yap"""
        try:
            if not self.is_trained or self.model is None:
                raise ValueError("Model eğitilmemiş")
            
            # Feature'ları oluştur
            features_df = self.create_features(df)
            
            # Son sequence'i al
            feature_data = features_df[self.feature_columns].values
            scaled_data = self.scaler.transform(feature_data)
            
            # Son 60 mum
            last_sequence = scaled_data[-self.sequence_length:].reshape(1, self.sequence_length, len(self.feature_columns))
            
            # Tahmin
            prediction = self.model.predict(last_sequence)[0][0]
            
            # 4 saatlik tahminler
            multi_step_predictions = []
            current_sequence = last_sequence.copy()
            
            for _ in range(self.prediction_steps):
                pred = self.model.predict(current_sequence)[0][0]
                multi_step_predictions.append(pred)
                
                # Sequence'i güncelle (basit yaklaşım)
                # Gerçek uygulamada daha sofistike olabilir
                current_sequence = np.roll(current_sequence, -1, axis=1)
                current_sequence[0, -1, 0] = pred  # Close price güncelle
            
            return prediction, multi_step_predictions
            
        except Exception as e:
            logger.error(f"LSTM tahmin hatası: {e}")
            return 0.0, []
    
    def save_model(self):
        """Modeli kaydet"""
        try:
            if self.model is not None:
                self.model.save(self.model_path)
                logger.info(f"LSTM model kaydedildi: {self.model_path}")
        except Exception as e:
            logger.error(f"Model kaydetme hatası: {e}")
    
    def load_model(self):
        """Modeli yükle"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = load_model(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                self.is_trained = True
                logger.info("LSTM model yüklendi")
                return True
            return False
        except Exception as e:
            logger.error(f"Model yükleme hatası: {e}")
            return False

# Test fonksiyonu
def test_lstm():
    """LSTM model test"""
    # Örnek veri oluştur (4 saatlik)
    dates = pd.date_range('2024-01-01', periods=500, freq='4H')
    np.random.seed(42)
    
    # Trend + noise + seasonality
    trend = np.linspace(100, 120, 500)
    noise = np.random.normal(0, 1, 500)
    seasonality = 2 * np.sin(2 * np.pi * np.arange(500) / 24)  # Günlük seasonality
    
    prices = trend + noise + seasonality
    
    df = pd.DataFrame({
        'Date': dates,
        'Open': prices * 0.99,
        'High': prices * 1.01,
        'Low': prices * 0.99,
        'Close': prices,
        'Volume': np.random.randint(100000, 1000000, 500)
    })
    
    print("=== LSTM Model Test ===")
    print(f"Veri boyutu: {len(df)}")
    print(f"Zaman aralığı: 4 saat")
    
    # Model oluştur ve eğit
    model = LSTMModel()
    training_results = model.train(df)
    
    if training_results:
        print(f"Eğitim tamamlandı!")
        print(f"Validation MSE: {training_results['validation_mse']:.6f}")
        print(f"Validation MAE: {training_results['validation_mae']:.6f}")
        
        # Tahmin test
        prediction, multi_step = model.predict(df)
        print(f"Son tahmin: {prediction:.4f}")
        print(f"4 saatlik tahminler: {[f'{p:.4f}' for p in multi_step]}")
        
        return model
    else:
        print("Eğitim başarısız!")
        return None

if __name__ == "__main__":
    test_lstm()
