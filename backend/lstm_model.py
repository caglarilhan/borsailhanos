"""
🧠 LSTM Model - BIST AI Smart Trader
4 saatlik timeframe için LSTM tabanlı tahmin modeli
Sequence-to-sequence learning ile zaman serisi tahmini
"""

import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import joblib
import os
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
import warnings
warnings.filterwarnings('ignore')

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LSTMModel:
    """
    LSTM tabanlı 4 saatlik tahmin modeli
    Sequence-to-sequence learning ile zaman serisi analizi
    """
    
    def __init__(self, model_path: str = "models/lstm_4h_model.h5"):
        self.model_path = model_path
        self.model = None
        self.scaler = MinMaxScaler()
        self.is_trained = False
        
        # Model parametreleri
        self.params = {
            'sequence_length': 60,  # 60 veri noktası (10 günlük 4h veri)
            'n_features': 5,        # OHLCV
            'n_lstm_layers': 2,     # 2 LSTM katmanı
            'n_lstm_units': 128,    # Her LSTM'de 128 unit
            'dropout_rate': 0.2,    # Dropout oranı
            'learning_rate': 0.001, # Learning rate
            'batch_size': 32,       # Batch size
            'epochs': 100           # Maksimum epoch
        }
        
        # Model performans metrikleri
        self.performance_metrics = {
            'train_loss': 0.0,
            'val_loss': 0.0,
            'test_loss': 0.0,
            'train_rmse': 0.0,
            'val_rmse': 0.0,
            'test_rmse': 0.0,
            'last_training_date': None
        }
        
        logger.info("🧠 LSTM Model başlatıldı")
    
    def prepare_sequences(self, data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        4 saatlik veriyi LSTM sequence'lerine dönüştür
        
        Args:
            data: 4 saatlik OHLCV verisi
            
        Returns:
            X: Sequence matrix (samples, sequence_length, features)
            y: Target vector (samples,)
        """
        try:
            logger.info("🔧 Sequence hazırlama başlıyor...")
            
            # OHLCV verilerini al
            features = data[['Open', 'High', 'Low', 'Close', 'Volume']].values
            
            # Normalize et
            features_scaled = self.scaler.fit_transform(features)
            
            # Sequence'ler oluştur
            X, y = [], []
            sequence_length = self.params['sequence_length']
            
            for i in range(sequence_length, len(features_scaled)):
                # Input sequence
                X.append(features_scaled[i-sequence_length:i])
                # Target: bir sonraki close fiyatı
                y.append(features_scaled[i, 3])  # Close price index = 3
            
            X = np.array(X)
            y = np.array(y)
            
            logger.info(f"✅ {len(X)} sequence oluşturuldu")
            logger.info(f"📊 X shape: {X.shape}, y shape: {y.shape}")
            
            return X, y
            
        except Exception as e:
            logger.error(f"❌ Sequence hazırlama hatası: {e}")
            raise
    
    def build_model(self) -> Sequential:
        """
        LSTM modelini oluştur
        
        Returns:
            Compiled LSTM model
        """
        try:
            logger.info("🏗️ LSTM model yapısı oluşturuluyor...")
            
            model = Sequential()
            
            # İlk LSTM katmanı
            model.add(LSTM(
                units=self.params['n_lstm_units'],
                return_sequences=True,
                input_shape=(self.params['sequence_length'], self.params['n_features'])
            ))
            model.add(BatchNormalization())
            model.add(Dropout(self.params['dropout_rate']))
            
            # İkinci LSTM katmanı
            model.add(LSTM(
                units=self.params['n_lstm_units'],
                return_sequences=False
            ))
            model.add(BatchNormalization())
            model.add(Dropout(self.params['dropout_rate']))
            
            # Dense katmanları
            model.add(Dense(64, activation='relu'))
            model.add(BatchNormalization())
            model.add(Dropout(self.params['dropout_rate']))
            
            model.add(Dense(32, activation='relu'))
            model.add(BatchNormalization())
            model.add(Dropout(self.params['dropout_rate']))
            
            # Output katmanı
            model.add(Dense(1, activation='linear'))
            
            # Model compile
            optimizer = Adam(learning_rate=self.params['learning_rate'])
            model.compile(
                optimizer=optimizer,
                loss='mse',
                metrics=['mae']
            )
            
            # Model summary
            model.summary()
            
            logger.info("✅ LSTM model yapısı oluşturuldu")
            return model
            
        except Exception as e:
            logger.error(f"❌ Model oluşturma hatası: {e}")
            raise
    
    def train_model(self, data: pd.DataFrame) -> Dict:
        """
        LSTM modelini eğit
        
        Args:
            data: 4 saatlik OHLCV verisi
            
        Returns:
            Training results dictionary
        """
        try:
            logger.info("🚀 LSTM model eğitimi başlıyor...")
            
            # Sequence'leri hazırla
            X, y = self.prepare_sequences(data)
            
            # Train/validation split (80/20)
            split_idx = int(len(X) * 0.8)
            X_train, X_val = X[:split_idx], X[split_idx:]
            y_train, y_val = y[:split_idx], y[split_idx:]
            
            logger.info(f"📊 Train: {len(X_train)}, Validation: {len(X_val)}")
            
            # Model oluştur
            self.model = self.build_model()
            
            # Callbacks
            callbacks = [
                EarlyStopping(
                    monitor='val_loss',
                    patience=15,
                    restore_best_weights=True,
                    verbose=1
                ),
                ReduceLROnPlateau(
                    monitor='val_loss',
                    factor=0.5,
                    patience=10,
                    min_lr=1e-7,
                    verbose=1
                )
            ]
            
            # Model eğit
            history = self.model.fit(
                X_train, y_train,
                validation_data=(X_val, y_val),
                batch_size=self.params['batch_size'],
                epochs=self.params['epochs'],
                callbacks=callbacks,
                verbose=1
            )
            
            # Performans değerlendir
            train_loss = history.history['loss'][-1]
            val_loss = history.history['val_loss'][-1]
            
            # Predictions
            train_pred = self.model.predict(X_train)
            val_pred = self.model.predict(X_val)
            
            # RMSE hesapla
            train_rmse = np.sqrt(mean_squared_error(y_train, train_pred))
            val_rmse = np.sqrt(mean_squared_error(y_val, val_pred))
            
            # Performance metrics güncelle
            self.performance_metrics.update({
                'train_loss': train_loss,
                'val_loss': val_loss,
                'train_rmse': train_rmse,
                'val_rmse': val_rmse,
                'last_training_date': datetime.now().isoformat()
            })
            
            self.is_trained = True
            
            # Model kaydet
            self.save_model()
            
            logger.info("✅ LSTM model eğitimi tamamlandı!")
            logger.info(f"📊 Train Loss: {train_loss:.6f}, Val Loss: {val_loss:.6f}")
            logger.info(f"📊 Train RMSE: {train_rmse:.6f}, Val RMSE: {val_rmse:.6f}")
            
            return {
                'history': history.history,
                'performance_metrics': self.performance_metrics,
                'model_summary': self.model.summary()
            }
            
        except Exception as e:
            logger.error(f"❌ Model eğitim hatası: {e}")
            raise
    
    def predict(self, data: pd.DataFrame) -> np.ndarray:
        """
        Yeni veri için tahmin yap
        
        Args:
            data: 4 saatlik OHLCV verisi
            
        Returns:
            Predicted close prices
        """
        if not self.is_trained or self.model is None:
            raise ValueError("Model henüz eğitilmedi!")
        
        try:
            # Son sequence_length kadar veriyi al
            features = data[['Open', 'High', 'Low', 'Close', 'Volume']].values
            features_scaled = self.scaler.transform(features)
            
            # Son sequence'i al
            last_sequence = features_scaled[-self.params['sequence_length']:]
            last_sequence = last_sequence.reshape(1, self.params['sequence_length'], self.params['n_features'])
            
            # Tahmin
            prediction_scaled = self.model.predict(last_sequence)
            
            # Inverse transform
            prediction = self.scaler.inverse_transform(
                np.concatenate([np.zeros((1, 4)), prediction_scaled], axis=1)
            )[:, 3]  # Close price
            
            logger.info(f"✅ Tahmin tamamlandı: ${prediction[0]:.2f}")
            return prediction
            
        except Exception as e:
            logger.error(f"❌ Tahmin hatası: {e}")
            raise
    
    def predict_sequence(self, data: pd.DataFrame, n_steps: int = 5) -> np.ndarray:
        """
        Gelecek n adım için tahmin yap
        
        Args:
            data: Mevcut veri
            n_steps: Tahmin edilecek adım sayısı
            
        Returns:
            Predicted close prices for next n steps
        """
        if not self.is_trained or self.model is None:
            raise ValueError("Model henüz eğitilmedi!")
        
        try:
            logger.info(f"🔮 Gelecek {n_steps} adım için tahmin yapılıyor...")
            
            predictions = []
            current_data = data.copy()
            
            for step in range(n_steps):
                # Mevcut veri ile tahmin
                pred = self.predict(current_data)
                predictions.append(pred[0])
                
                # Veriyi güncelle (tahmin edilen close price ile)
                new_row = current_data.iloc[-1].copy()
                new_row['Close'] = pred[0]
                new_row['Open'] = pred[0] * 0.999  # Küçük fark
                new_row['High'] = pred[0] * 1.001
                new_row['Low'] = pred[0] * 0.998
                new_row['Volume'] = current_data.iloc[-1]['Volume']  # Aynı volume
                
                # Yeni satır ekle
                current_data = pd.concat([current_data, pd.DataFrame([new_row])], ignore_index=True)
            
            predictions = np.array(predictions)
            
            logger.info(f"✅ {n_steps} adım tahmin tamamlandı")
            logger.info(f"📊 Tahminler: {predictions}")
            
            return predictions
            
        except Exception as e:
            logger.error(f"❌ Sequence tahmin hatası: {e}")
            raise
    
    def save_model(self, path: str = None):
        """Modeli kaydet"""
        if not self.is_trained or self.model is None:
            logger.warning("⚠️ Model henüz eğitilmedi, kaydedilemedi")
            return
        
        try:
            save_path = path or self.model_path
            
            # Directory oluştur
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            # Model kaydet
            self.model.save(save_path)
            
            # Scaler kaydet
            scaler_path = save_path.replace('.h5', '_scaler.pkl')
            joblib.dump(self.scaler, scaler_path)
            
            # Performance metrics kaydet
            metrics_path = save_path.replace('.h5', '_metrics.pkl')
            joblib.dump(self.performance_metrics, metrics_path)
            
            logger.info(f"✅ Model kaydedildi: {save_path}")
            logger.info(f"✅ Scaler kaydedildi: {scaler_path}")
            logger.info(f"✅ Metrics kaydedildi: {metrics_path}")
            
        except Exception as e:
            logger.error(f"❌ Model kaydetme hatası: {e}")
    
    def load_model(self, path: str = None):
        """Modeli yükle"""
        try:
            load_path = path or self.model_path
            
            if not os.path.exists(load_path):
                logger.warning(f"⚠️ Model dosyası bulunamadı: {load_path}")
                return False
            
            # Model yükle
            self.model = load_model(load_path)
            
            # Scaler yükle
            scaler_path = load_path.replace('.h5', '_scaler.pkl')
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
            
            # Metrics yükle
            metrics_path = load_path.replace('.h5', '_metrics.pkl')
            if os.path.exists(metrics_path):
                self.performance_metrics = joblib.load(metrics_path)
            
            self.is_trained = True
            
            logger.info(f"✅ Model yüklendi: {load_path}")
            logger.info(f"📊 Son eğitim: {self.performance_metrics.get('last_training_date', 'Bilinmiyor')}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Model yükleme hatası: {e}")
            return False
    
    def get_model_status(self) -> Dict:
        """Model durumunu getir"""
        return {
            'is_trained': self.is_trained,
            'sequence_length': self.params['sequence_length'],
            'n_features': self.params['n_features'],
            'performance_metrics': self.performance_metrics,
            'model_path': self.model_path
        }

# Test fonksiyonu
def test_lstm_model():
    """LSTM model test fonksiyonu"""
    
    print("🧠 LSTM Model Test Başlıyor...")
    
    try:
        # Test verisi oluştur (4 saatlik)
        dates = pd.date_range('2023-01-01', '2024-01-01', freq='4H')
        np.random.seed(42)
        
        # Gerçekçi fiyat verisi
        base_price = 100
        prices = [base_price]
        
        for i in range(1, len(dates)):
            # Random walk with trend
            change = np.random.normal(0, 0.02)  # %2 volatilite
            new_price = prices[-1] * (1 + change)
            prices.append(max(new_price, 1))  # Minimum 1
        
        test_data = pd.DataFrame({
            'Date': dates,
            'Open': prices,
            'High': [p * (1 + abs(np.random.normal(0, 0.01))) for p in prices],
            'Low': [p * (1 - abs(np.random.normal(0, 0.01))) for p in prices],
            'Close': prices,
            'Volume': np.random.uniform(1000000, 5000000, len(dates))
        })
        
        # High ve Low'u düzelt
        test_data['High'] = np.maximum(test_data['High'], test_data['Close'])
        test_data['Low'] = np.minimum(test_data['Low'], test_data['Close'])
        
        # Pipeline oluştur
        lstm_model = LSTMModel()
        
        # Model eğit
        results = lstm_model.train_model(test_data)
        
        # Model durumu
        status = lstm_model.get_model_status()
        print(f"\n📊 Model Durumu:")
        print(f"  Eğitildi: {status['is_trained']}")
        print(f"  Sequence Length: {status['sequence_length']}")
        print(f"  Features: {status['n_features']}")
        print(f"  Train RMSE: {status['performance_metrics']['train_rmse']:.6f}")
        print(f"  Val RMSE: {status['performance_metrics']['val_rmse']:.6f}")
        
        # Tahmin testi
        prediction = lstm_model.predict(test_data)
        print(f"\n🔮 Tahmin Testi:")
        print(f"  Son Close: ${test_data['Close'].iloc[-1]:.2f}")
        print(f"  Tahmin: ${prediction[0]:.2f}")
        
        # Sequence tahmin testi
        sequence_pred = lstm_model.predict_sequence(test_data, n_steps=3)
        print(f"\n🔮 3 Adım Tahmin:")
        for i, pred in enumerate(sequence_pred):
            print(f"  Adım {i+1}: ${pred:.2f}")
        
        return results
        
    except Exception as e:
        print(f"❌ Test hatası: {e}")
        return None

if __name__ == "__main__":
    # Test çalıştır
    test_lstm_model()

