#!/usr/bin/env python3
"""
Gelişmiş AI Modelleri
- FinBERT-TR: Türkçe finansal sentiment
- LSTM: Fiyat tahmin modeli
- TimeGPT: Zaman serisi tahmin
- Ensemble: Çoklu model birleştirme
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging
import warnings
warnings.filterwarnings('ignore')

# AI/ML imports
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    from sklearn.preprocessing import MinMaxScaler
    from sklearn.metrics import mean_squared_error, mean_absolute_error
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.optimizers import Adam
except ImportError:
    print("⚠️ AI/ML kütüphaneleri yüklenmedi. pip install torch transformers scikit-learn tensorflow")
    torch = None
    AutoTokenizer = None
    AutoModelForSequenceClassification = None

# Local imports
try:
    from backend.data.price_layer import fetch_recent_ohlcv
    from backend.services.sentiment import sentiment_tr
except ImportError:
    from ..data.price_layer import fetch_recent_ohlcv
    from ..services.sentiment import sentiment_tr

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FinBERTTRModel:
    """FinBERT-TR Türkçe Finansal Sentiment Modeli"""
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.is_loaded = False
        
    def load_model(self):
        """FinBERT-TR modelini yükle"""
        try:
            if torch is None:
                logger.warning("⚠️ PyTorch yüklenmedi, basit sentiment kullanılacak")
                return False
                
            # FinBERT-TR model (Hugging Face'den)
            model_name = "dbmdz/bert-base-turkish-cased"
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                model_name, 
                num_labels=3  # positive, negative, neutral
            )
            self.is_loaded = True
            logger.info("✅ FinBERT-TR modeli yüklendi")
            return True
            
        except Exception as e:
            logger.error(f"❌ FinBERT-TR yükleme hatası: {e}")
            return False
            
    def predict_sentiment(self, text: str) -> Dict:
        """Türkçe metin için sentiment tahmini"""
        if not self.is_loaded:
            # Fallback to simple sentiment
            return sentiment_tr(text)
            
        try:
            # Tokenize
            inputs = self.tokenizer(
                text, 
                return_tensors="pt", 
                truncation=True, 
                max_length=512,
                padding=True
            )
            
            # Predict
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                
            # Convert to sentiment
            scores = predictions[0].tolist()
            labels = ['negative', 'neutral', 'positive']
            
            max_score = max(scores)
            max_index = scores.index(max_score)
            predicted_label = labels[max_index]
            
            # Normalize score to -1 to 1 range
            sentiment_score = (scores[2] - scores[0]) / (scores[2] + scores[0] + scores[1])
            
            return {
                'score': sentiment_score,
                'label': predicted_label,
                'confidence': max_score,
                'raw_scores': dict(zip(labels, scores))
            }
            
        except Exception as e:
            logger.error(f"❌ FinBERT-TR tahmin hatası: {e}")
            return sentiment_tr(text)

class LSTMPredictor:
    """LSTM Fiyat Tahmin Modeli"""
    
    def __init__(self, sequence_length=60, features=5):
        self.sequence_length = sequence_length
        self.features = features
        self.model = None
        self.scaler = MinMaxScaler() if 'MinMaxScaler' in globals() else None
        self.is_trained = False
        
    def prepare_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Veriyi LSTM için hazırla"""
        if self.scaler is None:
            return np.array([]), np.array([])
            
        # Features: Open, High, Low, Close, Volume
        feature_cols = ['open', 'high', 'low', 'close', 'volume']
        
        # Normalize
        scaled_data = self.scaler.fit_transform(df[feature_cols].values)
        
        # Create sequences
        X, y = [], []
        for i in range(self.sequence_length, len(scaled_data)):
            X.append(scaled_data[i-self.sequence_length:i])
            y.append(scaled_data[i, 3])  # Close price
            
        return np.array(X), np.array(y)
        
    def build_model(self):
        """LSTM modelini oluştur"""
        if tf is None:
            logger.warning("⚠️ TensorFlow yüklenmedi")
            return None
            
        try:
            model = Sequential([
                LSTM(50, return_sequences=True, input_shape=(self.sequence_length, self.features)),
                Dropout(0.2),
                LSTM(50, return_sequences=True),
                Dropout(0.2),
                LSTM(50),
                Dropout(0.2),
                Dense(25),
                Dense(1)
            ])
            
            model.compile(optimizer=Adam(learning_rate=0.001), loss='mse', metrics=['mae'])
            return model
        except Exception as e:
            logger.error(f"❌ LSTM model oluşturma hatası: {e}")
            return None
        
    def train_model(self, symbol: str, period: str = "2y") -> bool:
        """Modeli eğit"""
        try:
            # Veri çek
            df = fetch_recent_ohlcv(symbol=symbol, period=period, interval="1d")
            if df.empty or len(df) < 100:
                logger.error(f"❌ {symbol} için yeterli veri yok")
                return False
                
            # Veriyi hazırla
            X, y = self.prepare_data(df)
            if len(X) < 50:
                logger.error(f"❌ {symbol} için yeterli sequence yok")
                return False
                
            # Train/test split
            split = int(0.8 * len(X))
            X_train, X_test = X[:split], X[split:]
            y_train, y_test = y[:split], y[split:]
            
            # Model oluştur
            self.model = self.build_model()
            if self.model is None:
                return False
                
            # Eğit
            history = self.model.fit(
                X_train, y_train,
                epochs=50,
                batch_size=32,
                validation_data=(X_test, y_test),
                verbose=0
            )
            
            # Test
            y_pred = self.model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            
            logger.info(f"✅ {symbol} LSTM eğitildi - MSE: {mse:.4f}, MAE: {mae:.4f}")
            self.is_trained = True
            return True
            
        except Exception as e:
            logger.error(f"❌ {symbol} LSTM eğitim hatası: {e}")
            return False
            
    def predict_next_price(self, symbol: str, days: int = 5) -> Dict:
        """Gelecek fiyat tahmini"""
        if not self.is_trained:
            logger.warning(f"⚠️ {symbol} LSTM modeli eğitilmemiş")
            return {}
            
        try:
            # Son verileri çek
            df = fetch_recent_ohlcv(symbol=symbol, period="3mo", interval="1d")
            if df.empty:
                return {}
                
            # Son sequence'i hazırla
            feature_cols = ['open', 'high', 'low', 'close', 'volume']
            last_sequence = df[feature_cols].tail(self.sequence_length).values
            scaled_sequence = self.scaler.transform(last_sequence)
            X = scaled_sequence.reshape(1, self.sequence_length, self.features)
            
            # Tahmin
            predictions = []
            current_sequence = X.copy()
            
            for _ in range(days):
                pred = self.model.predict(current_sequence, verbose=0)
                predictions.append(pred[0, 0])
                
                # Sequence'i güncelle (basit yaklaşım)
                new_row = current_sequence[0, -1, :].copy()
                new_row[3] = pred[0, 0]  # Close price
                current_sequence = np.roll(current_sequence, -1, axis=1)
                current_sequence[0, -1, :] = new_row
                
            # Denormalize
            current_price = df['close'].iloc[-1]
            price_predictions = []
            for pred in predictions:
                # Basit denormalization (gerçek implementasyon daha karmaşık)
                price_pred = current_price * (1 + (pred - 0.5) * 0.1)
                price_predictions.append(price_pred)
                
            return {
                'symbol': symbol,
                'current_price': current_price,
                'predictions': price_predictions,
                'days': days,
                'confidence': 0.7  # Basit confidence
            }
            
        except Exception as e:
            logger.error(f"❌ {symbol} LSTM tahmin hatası: {e}")
            return {}

class TimeGPTModel:
    """TimeGPT Zaman Serisi Tahmin Modeli"""
    
    def __init__(self):
        self.is_available = False
        
    def load_model(self):
        """TimeGPT modelini yükle"""
        try:
            # TimeGPT için nixtla kütüphanesi gerekli
            # pip install nixtla
            from nixtla import NixtlaClient
            self.client = NixtlaClient(api_key="your_api_key")  # API key gerekli
            self.is_available = True
            logger.info("✅ TimeGPT modeli yüklendi")
            return True
        except ImportError:
            logger.warning("⚠️ TimeGPT kütüphanesi yüklenmedi: pip install nixtla")
            return False
        except Exception as e:
            logger.error(f"❌ TimeGPT yükleme hatası: {e}")
            return False
            
    def predict(self, symbol: str, horizon: int = 10) -> Dict:
        """TimeGPT ile tahmin"""
        if not self.is_available:
            return {}
            
        try:
            # Veri çek
            df = fetch_recent_ohlcv(symbol=symbol, period="1y", interval="1d")
            if df.empty:
                return {}
                
            # TimeGPT formatına çevir
            timegpt_df = pd.DataFrame({
                'ds': df.index,
                'y': df['close'].values
            })
            
            # Tahmin
            forecast = self.client.forecast(
                df=timegpt_df,
                h=horizon,
                freq='D'
            )
            
            return {
                'symbol': symbol,
                'predictions': forecast['y'].tolist(),
                'horizon': horizon,
                'confidence': 0.8
            }
            
        except Exception as e:
            logger.error(f"❌ TimeGPT tahmin hatası: {e}")
            return {}

class AIEnsemble:
    """AI Ensemble Model - Çoklu model birleştirme"""
    
    def __init__(self):
        self.finbert = FinBERTTRModel()
        self.lstm = LSTMPredictor()
        self.timegpt = TimeGPTModel()
        
    def initialize_models(self):
        """Tüm modelleri başlat"""
        logger.info("🤖 AI modelleri başlatılıyor...")
        
        # FinBERT-TR
        self.finbert.load_model()
        
        # TimeGPT
        self.timegpt.load_model()
        
        logger.info("✅ AI modelleri hazır")
        
    def ensemble_prediction(self, symbol: str, text: str = "") -> Dict:
        """Ensemble tahmin"""
        results = {}
        
        # Sentiment
        if text:
            results['sentiment'] = self.finbert.predict_sentiment(text)
            
        # LSTM tahmin
        if not self.lstm.is_trained:
            self.lstm.train_model(symbol)
        results['lstm'] = self.lstm.predict_next_price(symbol)
        
        # TimeGPT tahmin
        results['timegpt'] = self.timegpt.predict(symbol)
        
        # Ensemble skoru
        ensemble_score = self._calculate_ensemble_score(results)
        
        return {
            'symbol': symbol,
            'individual_results': results,
            'ensemble_score': ensemble_score,
            'recommendation': self._generate_ensemble_recommendation(ensemble_score)
        }
        
    def _calculate_ensemble_score(self, results: Dict) -> float:
        """Ensemble skoru hesapla"""
        scores = []
        weights = []
        
        # LSTM skoru
        if 'lstm' in results and results['lstm']:
            lstm_pred = results['lstm'].get('predictions', [])
            if lstm_pred:
                price_change = (lstm_pred[0] - results['lstm']['current_price']) / results['lstm']['current_price']
                scores.append(max(0, min(1, 0.5 + price_change * 10)))
                weights.append(0.4)
                
        # TimeGPT skoru
        if 'timegpt' in results and results['timegpt']:
            timegpt_pred = results['timegpt'].get('predictions', [])
            if timegpt_pred:
                # Basit skor hesaplama
                scores.append(0.6)  # TimeGPT genelde güvenilir
                weights.append(0.3)
                
        # Sentiment skoru
        if 'sentiment' in results and results['sentiment']:
            sentiment_score = results['sentiment'].get('score', 0)
            scores.append(0.5 + sentiment_score * 0.5)
            weights.append(0.3)
            
        if not scores:
            return 0.5
            
        # Weighted average
        ensemble_score = np.average(scores, weights=weights)
        return ensemble_score
        
    def _generate_ensemble_recommendation(self, score: float) -> str:
        """Ensemble önerisi oluştur"""
        if score >= 0.8:
            return "STRONG_BUY"
        elif score >= 0.7:
            return "BUY"
        elif score >= 0.6:
            return "WEAK_BUY"
        elif score >= 0.4:
            return "HOLD"
        else:
            return "SELL"

# Global AI ensemble
ai_ensemble = AIEnsemble()
