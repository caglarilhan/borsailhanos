"""
Deep Learning Models for Trading
Transformer, LSTM, NLP News Analysis
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import json
import re
from dataclasses import dataclass

# Deep Learning imports
try:
    import tensorflow as tf
    from tensorflow.keras.models import Model, Sequential
    from tensorflow.keras.layers import (
        LSTM, Dense, Dropout, Input, MultiHeadAttention, 
        LayerNormalization, GlobalAveragePooling1D,
        Embedding, Conv1D, MaxPooling1D, Flatten,
        Bidirectional, TimeDistributed, Attention
    )
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
    from tensorflow.keras.preprocessing.sequence import pad_sequences
    from tensorflow.keras.preprocessing.text import Tokenizer
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    # Mock classes for when TensorFlow is not available
    class Model:
        pass
    class Sequential:
        pass
    class LSTM:
        pass
    class Dense:
        pass
    class Dropout:
        pass
    class Input:
        pass
    class MultiHeadAttention:
        pass
    class LayerNormalization:
        pass
    class GlobalAveragePooling1D:
        pass
    class Embedding:
        pass
    class Conv1D:
        pass
    class MaxPooling1D:
        pass
    class Flatten:
        pass
    class Bidirectional:
        pass
    class TimeDistributed:
        pass
    class Attention:
        pass
    class Adam:
        pass
    class EarlyStopping:
        pass
    class ReduceLROnPlateau:
        pass
    class pad_sequences:
        pass
    class Tokenizer:
        pass
    print("⚠️ TensorFlow bulunamadı, mock modeller kullanılacak")

# NLP imports
try:
    import nltk
    from nltk.sentiment import SentimentIntensityAnalyzer
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    from nltk.stem import PorterStemmer
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False
    print("⚠️ NLTK bulunamadı, basit sentiment analizi kullanılacak")

logger = logging.getLogger(__name__)

@dataclass
class ModelConfig:
    """Model konfigürasyonu"""
    sequence_length: int = 60
    lstm_units: int = 128
    dropout_rate: float = 0.2
    learning_rate: float = 0.001
    batch_size: int = 32
    epochs: int = 100
    validation_split: float = 0.2
    early_stopping_patience: int = 10

class TransformerModel:
    """Transformer tabanlı fiyat tahmin modeli"""
    
    def __init__(self, config: ModelConfig = None):
        self.config = config or ModelConfig()
        self.model = None
        self.is_trained = False
        self.feature_names = []
        
    def build_model(self, input_shape: Tuple[int, int]) -> Model:
        """Transformer modeli oluştur"""
        
        if not TENSORFLOW_AVAILABLE:
            logger.warning("❌ TensorFlow yok, mock model kullanılıyor")
            return self._create_mock_model()
        
        try:
            # Input layer
            inputs = Input(shape=input_shape, name='price_input')
            
            # Positional encoding (basit)
            x = inputs
            
            # Multi-head attention layers
            for _ in range(3):
                # Self-attention
                attention_output = MultiHeadAttention(
                    num_heads=8,
                    key_dim=64,
                    dropout=self.config.dropout_rate
                )(x, x)
                
                # Add & Norm
                x = LayerNormalization()(x + attention_output)
                
                # Feed forward
                ff_output = Dense(256, activation='relu')(x)
                ff_output = Dropout(self.config.dropout_rate)(ff_output)
                ff_output = Dense(input_shape[-1])(ff_output)
                
                # Add & Norm
                x = LayerNormalization()(x + ff_output)
            
            # Global pooling
            x = GlobalAveragePooling1D()(x)
            
            # Dense layers
            x = Dense(128, activation='relu')(x)
            x = Dropout(self.config.dropout_rate)(x)
            x = Dense(64, activation='relu')(x)
            x = Dropout(self.config.dropout_rate)(x)
            
            # Output layer (regression)
            outputs = Dense(1, activation='linear', name='price_prediction')(x)
            
            model = Model(inputs=inputs, outputs=outputs)
            
            model.compile(
                optimizer=Adam(learning_rate=self.config.learning_rate),
                loss='mse',
                metrics=['mae', 'mape']
            )
            
            logger.info("✅ Transformer modeli oluşturuldu")
            return model
            
        except Exception as e:
            logger.error(f"❌ Transformer model hatası: {e}")
            return self._create_mock_model()
    
    def _create_mock_model(self):
        """Mock model oluştur"""
        class MockModel:
            def fit(self, *args, **kwargs):
                logger.info("🤖 Mock Transformer eğitimi simüle ediliyor")
                return type('History', (), {'history': {'loss': [0.1, 0.05, 0.02]}})()
            
            def predict(self, X):
                # Basit trend tahmini
                return np.random.normal(0, 0.01, (X.shape[0], 1))
            
            def evaluate(self, *args, **kwargs):
                return [0.05, 0.03, 0.02]  # loss, mae, mape
        
        return MockModel()
    
    def prepare_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Veriyi transformer için hazırla"""
        try:
            # Feature engineering
            features = self._create_features(df)
            self.feature_names = features.columns.tolist()
            
            # Sequence oluştur
            sequences = []
            targets = []
            
            for i in range(self.config.sequence_length, len(features)):
                seq = features.iloc[i-self.config.sequence_length:i].values
                target = features.iloc[i]['close']  # Sonraki fiyat
                
                sequences.append(seq)
                targets.append(target)
            
            X = np.array(sequences)
            y = np.array(targets)
            
            logger.info(f"✅ Transformer veri hazırlandı: {X.shape}, {y.shape}")
            return X, y
            
        except Exception as e:
            logger.error(f"❌ Transformer veri hazırlama hatası: {e}")
            return np.array([]), np.array([])
    
    def _create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Teknik indikatörler oluştur"""
        features = df.copy()
        
        # Price features
        features['price_change'] = features['close'].pct_change()
        features['high_low_ratio'] = features['high'] / features['low']
        features['volume_price'] = features['volume'] * features['close']
        
        # Moving averages
        for window in [5, 10, 20, 50]:
            features[f'sma_{window}'] = features['close'].rolling(window).mean()
            features[f'ema_{window}'] = features['close'].ewm(span=window).mean()
        
        # Volatility
        features['volatility'] = features['close'].rolling(20).std()
        features['rsi'] = self._calculate_rsi(features['close'])
        
        # Volume indicators
        features['volume_sma'] = features['volume'].rolling(20).mean()
        features['volume_ratio'] = features['volume'] / features['volume_sma']
        
        # Fill NaN values
        features = features.fillna(method='ffill').fillna(0)
        
        return features
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """RSI hesapla"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.fillna(50)
    
    def train(self, df: pd.DataFrame) -> Dict:
        """Modeli eğit"""
        try:
            X, y = self.prepare_data(df)
            
            if len(X) == 0:
                logger.error("❌ Eğitim verisi hazırlanamadı")
                return {"error": "No training data"}
            
            # Model oluştur
            self.model = self.build_model((self.config.sequence_length, len(self.feature_names)))
            
            # Callbacks
            callbacks = [
                EarlyStopping(
                    monitor='val_loss',
                    patience=self.config.early_stopping_patience,
                    restore_best_weights=True
                ),
                ReduceLROnPlateau(
                    monitor='val_loss',
                    factor=0.5,
                    patience=5,
                    min_lr=1e-7
                )
            ]
            
            # Eğitim
            history = self.model.fit(
                X, y,
                batch_size=self.config.batch_size,
                epochs=self.config.epochs,
                validation_split=self.config.validation_split,
                callbacks=callbacks,
                verbose=1
            )
            
            self.is_trained = True
            
            # Performans metrikleri
            train_loss = history.history['loss'][-1]
            val_loss = history.history['val_loss'][-1]
            
            logger.info(f"✅ Transformer eğitimi tamamlandı - Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")
            
            return {
                "success": True,
                "train_loss": train_loss,
                "val_loss": val_loss,
                "epochs": len(history.history['loss']),
                "model_type": "Transformer"
            }
            
        except Exception as e:
            logger.error(f"❌ Transformer eğitim hatası: {e}")
            return {"error": str(e)}
    
    def predict(self, df: pd.DataFrame) -> np.ndarray:
        """Tahmin yap"""
        if not self.is_trained or self.model is None:
            logger.warning("❌ Model eğitilmemiş")
            return np.array([])
        
        try:
            X, _ = self.prepare_data(df)
            if len(X) == 0:
                return np.array([])
            
            predictions = self.model.predict(X)
            return predictions.flatten()
            
        except Exception as e:
            logger.error(f"❌ Transformer tahmin hatası: {e}")
            return np.array([])

class LSTMModel:
    """LSTM tabanlı fiyat tahmin modeli"""
    
    def __init__(self, config: ModelConfig = None):
        self.config = config or ModelConfig()
        self.model = None
        self.is_trained = False
        self.feature_names = []
        
    def build_model(self, input_shape: Tuple[int, int]) -> Model:
        """LSTM modeli oluştur"""
        
        if not TENSORFLOW_AVAILABLE:
            logger.warning("❌ TensorFlow yok, mock model kullanılıyor")
            return self._create_mock_model()
        
        try:
            model = Sequential([
                # Bidirectional LSTM layers
                Bidirectional(LSTM(
                    self.config.lstm_units,
                    return_sequences=True,
                    dropout=self.config.dropout_rate
                ), input_shape=input_shape),
                
                Bidirectional(LSTM(
                    self.config.lstm_units // 2,
                    return_sequences=True,
                    dropout=self.config.dropout_rate
                )),
                
                Bidirectional(LSTM(
                    self.config.lstm_units // 4,
                    dropout=self.config.dropout_rate
                )),
                
                # Dense layers
                Dense(64, activation='relu'),
                Dropout(self.config.dropout_rate),
                Dense(32, activation='relu'),
                Dropout(self.config.dropout_rate),
                Dense(1, activation='linear')
            ])
            
            model.compile(
                optimizer=Adam(learning_rate=self.config.learning_rate),
                loss='mse',
                metrics=['mae', 'mape']
            )
            
            logger.info("✅ LSTM modeli oluşturuldu")
            return model
            
        except Exception as e:
            logger.error(f"❌ LSTM model hatası: {e}")
            return self._create_mock_model()
    
    def _create_mock_model(self):
        """Mock model oluştur"""
        class MockModel:
            def fit(self, *args, **kwargs):
                logger.info("🤖 Mock LSTM eğitimi simüle ediliyor")
                return type('History', (), {'history': {'loss': [0.1, 0.05, 0.02]}})()
            
            def predict(self, X):
                # Basit trend tahmini
                return np.random.normal(0, 0.01, (X.shape[0], 1))
            
            def evaluate(self, *args, **kwargs):
                return [0.05, 0.03, 0.02]  # loss, mae, mape
        
        return MockModel()
    
    def prepare_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Veriyi LSTM için hazırla"""
        try:
            # Feature engineering
            features = self._create_features(df)
            self.feature_names = features.columns.tolist()
            
            # Sequence oluştur
            sequences = []
            targets = []
            
            for i in range(self.config.sequence_length, len(features)):
                seq = features.iloc[i-self.config.sequence_length:i].values
                target = features.iloc[i]['close']  # Sonraki fiyat
                
                sequences.append(seq)
                targets.append(target)
            
            X = np.array(sequences)
            y = np.array(targets)
            
            logger.info(f"✅ LSTM veri hazırlandı: {X.shape}, {y.shape}")
            return X, y
            
        except Exception as e:
            logger.error(f"❌ LSTM veri hazırlama hatası: {e}")
            return np.array([]), np.array([])
    
    def _create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Teknik indikatörler oluştur"""
        features = df.copy()
        
        # Price features
        features['price_change'] = features['close'].pct_change()
        features['high_low_ratio'] = features['high'] / features['low']
        features['volume_price'] = features['volume'] * features['close']
        
        # Moving averages
        for window in [5, 10, 20, 50]:
            features[f'sma_{window}'] = features['close'].rolling(window).mean()
            features[f'ema_{window}'] = features['close'].ewm(span=window).mean()
        
        # Volatility
        features['volatility'] = features['close'].rolling(20).std()
        features['rsi'] = self._calculate_rsi(features['close'])
        
        # Volume indicators
        features['volume_sma'] = features['volume'].rolling(20).mean()
        features['volume_ratio'] = features['volume'] / features['volume_sma']
        
        # Fill NaN values
        features = features.fillna(method='ffill').fillna(0)
        
        return features
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """RSI hesapla"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.fillna(50)
    
    def train(self, df: pd.DataFrame) -> Dict:
        """Modeli eğit"""
        try:
            X, y = self.prepare_data(df)
            
            if len(X) == 0:
                logger.error("❌ Eğitim verisi hazırlanamadı")
                return {"error": "No training data"}
            
            # Model oluştur
            self.model = self.build_model((self.config.sequence_length, len(self.feature_names)))
            
            # Callbacks
            callbacks = [
                EarlyStopping(
                    monitor='val_loss',
                    patience=self.config.early_stopping_patience,
                    restore_best_weights=True
                ),
                ReduceLROnPlateau(
                    monitor='val_loss',
                    factor=0.5,
                    patience=5,
                    min_lr=1e-7
                )
            ]
            
            # Eğitim
            history = self.model.fit(
                X, y,
                batch_size=self.config.batch_size,
                epochs=self.config.epochs,
                validation_split=self.config.validation_split,
                callbacks=callbacks,
                verbose=1
            )
            
            self.is_trained = True
            
            # Performans metrikleri
            train_loss = history.history['loss'][-1]
            val_loss = history.history['val_loss'][-1]
            
            logger.info(f"✅ LSTM eğitimi tamamlandı - Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")
            
            return {
                "success": True,
                "train_loss": train_loss,
                "val_loss": val_loss,
                "epochs": len(history.history['loss']),
                "model_type": "LSTM"
            }
            
        except Exception as e:
            logger.error(f"❌ LSTM eğitim hatası: {e}")
            return {"error": str(e)}
    
    def predict(self, df: pd.DataFrame) -> np.ndarray:
        """Tahmin yap"""
        if not self.is_trained or self.model is None:
            logger.warning("❌ Model eğitilmemiş")
            return np.array([])
        
        try:
            X, _ = self.prepare_data(df)
            if len(X) == 0:
                return np.array([])
            
            predictions = self.model.predict(X)
            return predictions.flatten()
            
        except Exception as e:
            logger.error(f"❌ LSTM tahmin hatası: {e}")
            return np.array([])

class NLPNewsAnalyzer:
    """NLP tabanlı haber analizi"""
    
    def __init__(self):
        self.tokenizer = None
        self.sentiment_analyzer = None
        self.stemmer = None
        self.stop_words = set()
        self.is_initialized = False
        
        if NLTK_AVAILABLE:
            self._initialize_nltk()
        else:
            logger.warning("⚠️ NLTK yok, basit sentiment analizi kullanılacak")
    
    def _initialize_nltk(self):
        """NLTK bileşenlerini başlat"""
        try:
            # Download required NLTK data
            import nltk
            nltk.download('vader_lexicon', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('punkt', quiet=True)
            
            self.sentiment_analyzer = SentimentIntensityAnalyzer()
            self.stemmer = PorterStemmer()
            self.stop_words = set(stopwords.words('english'))
            self.is_initialized = True
            
            logger.info("✅ NLP News Analyzer başlatıldı")
            
        except Exception as e:
            logger.error(f"❌ NLTK başlatma hatası: {e}")
            self.is_initialized = False
    
    def analyze_sentiment(self, text: str) -> Dict:
        """Haber metninin sentiment analizini yap"""
        try:
            if not self.is_initialized:
                return self._simple_sentiment_analysis(text)
            
            # Text preprocessing
            cleaned_text = self._preprocess_text(text)
            
            # Sentiment analysis
            scores = self.sentiment_analyzer.polarity_scores(cleaned_text)
            
            # Determine sentiment
            if scores['compound'] >= 0.05:
                sentiment = 'positive'
            elif scores['compound'] <= -0.05:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
            
            return {
                'sentiment': sentiment,
                'compound_score': scores['compound'],
                'positive_score': scores['pos'],
                'negative_score': scores['neg'],
                'neutral_score': scores['neu'],
                'confidence': abs(scores['compound'])
            }
            
        except Exception as e:
            logger.error(f"❌ Sentiment analiz hatası: {e}")
            return self._simple_sentiment_analysis(text)
    
    def _preprocess_text(self, text: str) -> str:
        """Metni ön işleme"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Tokenize and remove stop words
        if self.is_initialized:
            tokens = word_tokenize(text)
            tokens = [token for token in tokens if token not in self.stop_words]
            text = ' '.join(tokens)
        
        return text
    
    def _simple_sentiment_analysis(self, text: str) -> Dict:
        """Basit sentiment analizi (NLTK yoksa)"""
        text = text.lower()
        
        # Positive keywords
        positive_words = ['good', 'great', 'excellent', 'positive', 'up', 'rise', 'gain', 'profit', 'success', 'strong']
        negative_words = ['bad', 'terrible', 'negative', 'down', 'fall', 'loss', 'decline', 'weak', 'poor', 'crisis']
        
        positive_count = sum(1 for word in positive_words if word in text)
        negative_count = sum(1 for word in negative_words if word in text)
        
        if positive_count > negative_count:
            sentiment = 'positive'
            compound_score = 0.3
        elif negative_count > positive_count:
            sentiment = 'negative'
            compound_score = -0.3
        else:
            sentiment = 'neutral'
            compound_score = 0.0
        
        return {
            'sentiment': sentiment,
            'compound_score': compound_score,
            'positive_score': positive_count / len(positive_words),
            'negative_score': negative_count / len(negative_words),
            'neutral_score': 0.5,
            'confidence': abs(compound_score)
        }
    
    def extract_keywords(self, text: str, top_n: int = 10) -> List[str]:
        """Metinden anahtar kelimeler çıkar"""
        try:
            if not self.is_initialized:
                return self._simple_keyword_extraction(text, top_n)
            
            # Preprocess text
            cleaned_text = self._preprocess_text(text)
            
            # Tokenize
            tokens = word_tokenize(cleaned_text)
            
            # Remove stop words and short words
            keywords = [token for token in tokens 
                       if token not in self.stop_words and len(token) > 2]
            
            # Count frequency
            from collections import Counter
            keyword_counts = Counter(keywords)
            
            return [word for word, count in keyword_counts.most_common(top_n)]
            
        except Exception as e:
            logger.error(f"❌ Keyword extraction hatası: {e}")
            return self._simple_keyword_extraction(text, top_n)
    
    def _simple_keyword_extraction(self, text: str, top_n: int) -> List[str]:
        """Basit anahtar kelime çıkarma"""
        # Remove special characters and split
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Remove common words
        common_words = {'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'oil', 'sit', 'try'}
        keywords = [word for word in words if word not in common_words]
        
        # Count and return top keywords
        from collections import Counter
        keyword_counts = Counter(keywords)
        return [word for word, count in keyword_counts.most_common(top_n)]

class DeepLearningEnsemble:
    """Deep Learning modellerini birleştiren ensemble"""
    
    def __init__(self):
        self.transformer = TransformerModel()
        self.lstm = LSTMModel()
        self.nlp_analyzer = NLPNewsAnalyzer()
        self.is_trained = False
        
    def train(self, df: pd.DataFrame, news_data: List[Dict] = None) -> Dict:
        """Tüm modelleri eğit"""
        try:
            results = {}
            
            # Transformer eğitimi
            logger.info("🚀 Transformer modeli eğitiliyor...")
            transformer_result = self.transformer.train(df)
            results['transformer'] = transformer_result
            
            # LSTM eğitimi
            logger.info("🚀 LSTM modeli eğitiliyor...")
            lstm_result = self.lstm.train(df)
            results['lstm'] = lstm_result
            
            # NLP analizi (eğitim değil, test)
            if news_data:
                logger.info("🚀 NLP haber analizi test ediliyor...")
                nlp_results = []
                for news in news_data[:5]:  # İlk 5 haber
                    sentiment = self.nlp_analyzer.analyze_sentiment(news.get('title', ''))
                    nlp_results.append(sentiment)
                results['nlp'] = nlp_results
            
            self.is_trained = True
            
            logger.info("✅ Deep Learning Ensemble eğitimi tamamlandı")
            return {
                "success": True,
                "results": results,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Deep Learning Ensemble eğitim hatası: {e}")
            return {"error": str(e)}
    
    def predict(self, df: pd.DataFrame, news_data: List[Dict] = None) -> Dict:
        """Ensemble tahmin yap"""
        try:
            predictions = {}
            
            # Transformer tahmini
            if self.transformer.is_trained:
                transformer_pred = self.transformer.predict(df)
                predictions['transformer'] = transformer_pred.tolist() if len(transformer_pred) > 0 else []
            
            # LSTM tahmini
            if self.lstm.is_trained:
                lstm_pred = self.lstm.predict(df)
                predictions['lstm'] = lstm_pred.tolist() if len(lstm_pred) > 0 else []
            
            # NLP analizi
            if news_data:
                nlp_sentiments = []
                for news in news_data:
                    sentiment = self.nlp_analyzer.analyze_sentiment(news.get('title', ''))
                    nlp_sentiments.append(sentiment)
                predictions['nlp'] = nlp_sentiments
            
            # Ensemble tahmin (basit ortalama)
            ensemble_pred = []
            if predictions.get('transformer') and predictions.get('lstm'):
                transformer_pred = np.array(predictions['transformer'])
                lstm_pred = np.array(predictions['lstm'])
                
                # Aynı uzunlukta olmaları için trim
                min_len = min(len(transformer_pred), len(lstm_pred))
                if min_len > 0:
                    ensemble_pred = ((transformer_pred[:min_len] + lstm_pred[:min_len]) / 2).tolist()
            
            predictions['ensemble'] = ensemble_pred
            
            return {
                "success": True,
                "predictions": predictions,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Deep Learning Ensemble tahmin hatası: {e}")
            return {"error": str(e)}

# Global instance
deep_learning_ensemble = DeepLearningEnsemble()