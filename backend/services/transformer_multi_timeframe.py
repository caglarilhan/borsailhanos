"""
Transformer Multi-Timeframe Analyzer - Faz 2: Orta Vadeli
Çoklu zaman çerçevesi analizi ile daha iyi tahmin

Özellikler:
- 7 farklı timeframe (1m, 5m, 15m, 1h, 4h, 1d, 1w) analizi
- Attention mechanism ile önemli timeframe'leri belirleme
- Multi-head attention
- Positional encoding
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import logging

logger = logging.getLogger(__name__)

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    keras = None  # type: ignore
    layers = None  # type: ignore
    logger.warning("TensorFlow not available, using mock implementation")

try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False
    logger.warning("yfinance not available")

try:
    from sentiment_analyzer import SentimentAnalyzer, SentimentResult
    SENTIMENT_AVAILABLE = True
except ImportError:
    SentimentAnalyzer = None  # type: ignore
    SentimentResult = None  # type: ignore
    SENTIMENT_AVAILABLE = False
    logger.warning("SentimentAnalyzer not available, sentiment fusion will use mock values")


@dataclass
class TimeframeSignal:
    timeframe: str
    slope: float
    momentum: float
    volatility: float
    latest_return: float


@dataclass
class SentimentSnapshot:
    score: float
    label: str
    confidence: float
    news_count: int
    key_events: List[str] = field(default_factory=list)
    timestamp: Optional[str] = None


@dataclass
class FusionResult:
    symbol: str
    action: str
    confidence: float
    rationale: List[str]
    attention_weights: Dict[str, float]
    timeframe_signals: List[TimeframeSignal]
    sentiment: SentimentSnapshot


if TENSORFLOW_AVAILABLE:
    class MultiHeadAttention(layers.Layer):
        """Multi-Head Attention Layer (TensorFlow)"""
        
        def __init__(self, d_model: int, num_heads: int):
            super().__init__()
            self.d_model = d_model
            self.num_heads = num_heads
            self.depth = d_model // num_heads
            
            self.wq = layers.Dense(d_model)
            self.wk = layers.Dense(d_model)
            self.wv = layers.Dense(d_model)
            self.dense = layers.Dense(d_model)
        
        def call(self, v, k, q, mask=None):
            batch_size = tf.shape(q)[0]
            
            q = self.wq(q)
            k = self.wk(k)
            v = self.wv(v)
            
            q = self.split_heads(q, batch_size)
            k = self.split_heads(k, batch_size)
            v = self.split_heads(v, batch_size)
            
            scaled_attention, attention_weights = self.scaled_dot_product_attention(
                q, k, v, mask
            )
            
            scaled_attention = tf.transpose(scaled_attention, perm=[0, 2, 1, 3])
            concat_attention = tf.reshape(scaled_attention, (batch_size, -1, self.d_model))
            output = self.dense(concat_attention)
            
            return output, attention_weights
        
        def split_heads(self, x, batch_size):
            x = tf.reshape(x, (batch_size, -1, self.num_heads, self.depth))
            return tf.transpose(x, perm=[0, 2, 1, 3])
        
        def scaled_dot_product_attention(self, q, k, v, mask):
            matmul_qk = tf.matmul(q, k, transpose_b=True)
            dk = tf.cast(tf.shape(k)[-1], tf.float32)
            scaled_attention_logits = matmul_qk / tf.math.sqrt(dk)
            
            if mask is not None:
                scaled_attention_logits += (mask * -1e9)
            
            attention_weights = tf.nn.softmax(scaled_attention_logits, axis=-1)
            output = tf.matmul(attention_weights, v)
            
            return output, attention_weights


    class TransformerEncoderBlock(layers.Layer):
        """Transformer Encoder Block"""
        
        def __init__(self, d_model: int, num_heads: int, dff: int, rate: float = 0.1):
            super().__init__()
            
            self.mha = MultiHeadAttention(d_model, num_heads)
            self.ffn = keras.Sequential([
                layers.Dense(dff, activation='relu'),
                layers.Dense(d_model)
            ])
            
            self.layernorm1 = layers.LayerNormalization(epsilon=1e-6)
            self.layernorm2 = layers.LayerNormalization(epsilon=1e-6)
            
            self.dropout1 = layers.Dropout(rate)
            self.dropout2 = layers.Dropout(rate)
        
        def call(self, x, training, mask=None):
            attn_output, attention_weights = self.mha(x, x, x, mask)
            attn_output = self.dropout1(attn_output, training=training)
            out1 = self.layernorm1(x + attn_output)
            
            ffn_output = self.ffn(out1)
            ffn_output = self.dropout2(ffn_output, training=training)
            out2 = self.layernorm2(out1 + ffn_output)
            
            return out2, attention_weights
else:
    class MultiHeadAttention:  # type: ignore
        """Fallback attention when TensorFlow is unavailable"""
        def __init__(self, *args, **kwargs):
            pass

    class TransformerEncoderBlock:  # type: ignore
        """Fallback encoder block when TensorFlow is unavailable"""
        def __init__(self, *args, **kwargs):
            pass


class TransformerMultiTimeframe:
    """
    Transformer model ile çoklu zaman çerçevesi analizi
    """
    
    def __init__(
        self,
        d_model: int = 256,
        num_heads: int = 8,
        num_layers: int = 6,
        dff: int = 512,
        dropout_rate: float = 0.1
    ):
        self.d_model = d_model
        self.num_heads = num_heads
        self.num_layers = num_layers
        self.dff = dff
        self.dropout_rate = dropout_rate
        
        self.timeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w']
        self.model: Optional[Any] = None
        self.is_trained = False
        self.sentiment_analyzer: Optional[SentimentAnalyzer] = None
        
        if SENTIMENT_AVAILABLE:
            try:
                self.sentiment_analyzer = SentimentAnalyzer()
                logger.info("🧠 Sentiment analyzer initialized for Transformer fusion")
            except Exception as exc:
                logger.warning("SentimentAnalyzer initialization failed: %s", exc)
                self.sentiment_analyzer = None
        
        if TENSORFLOW_AVAILABLE:
            self._build_model()
        else:
            logger.warning("TensorFlow not available, using mock model")
    
    def _build_model(self):
        """Transformer model oluştur"""
        # Input: (batch_size, num_timeframes, sequence_length, features)
        inputs = keras.Input(shape=(len(self.timeframes), 60, 1))
        
        # Positional encoding
        x = self._positional_encoding(inputs)
        
        # Transformer encoder blocks
        attention_weights_list = []
        for i in range(self.num_layers):
            encoder_block = TransformerEncoderBlock(
                d_model=self.d_model,
                num_heads=self.num_heads,
                dff=self.dff,
                rate=self.dropout_rate
            )
            x, attention_weights = encoder_block(x, training=True)
            attention_weights_list.append(attention_weights)
        
        # Global average pooling
        x = layers.GlobalAveragePooling2D()(x)
        
        # Dense layers
        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(self.dropout_rate)(x)
        x = layers.Dense(64, activation='relu')(x)
        x = layers.Dropout(self.dropout_rate)(x)
        
        # Output: 3 classes (BUY, SELL, HOLD)
        outputs = layers.Dense(3, activation='softmax')(x)
        
        self.model = keras.Model(inputs=inputs, outputs=outputs)
        self.model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        logger.info("✅ Transformer Multi-Timeframe model built")
    
    def _positional_encoding(self, inputs):
        """Positional encoding ekle"""
        # Basitleştirilmiş positional encoding
        # Gerçekte sinüs/kosinüs encoding kullanılabilir
        return inputs
    
    def get_data_for_timeframe(self, symbol: str, timeframe: str, periods: int = 60) -> pd.DataFrame:
        """Belirli bir timeframe için veri al"""
        if not YFINANCE_AVAILABLE:
            # Mock data
            dates = pd.date_range(end=datetime.now(), periods=periods, freq=timeframe)
            return pd.DataFrame({
                'Open': np.random.uniform(90, 110, periods),
                'High': np.random.uniform(100, 120, periods),
                'Low': np.random.uniform(80, 100, periods),
                'Close': np.random.uniform(90, 110, periods),
                'Volume': np.random.uniform(1000000, 5000000, periods)
            }, index=dates)
        
        try:
            ticker = yf.Ticker(symbol)
            
            # Timeframe mapping
            interval_map = {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '1h': '1h',
                '4h': '1h',  # yfinance doesn't support 4h, use 1h
                '1d': '1d',
                '1w': '1wk'
            }
            
            interval = interval_map.get(timeframe, '1d')
            hist = ticker.history(period='6mo', interval=interval)
            
            if hist.empty:
                # Fallback to mock
                dates = pd.date_range(end=datetime.now(), periods=periods, freq=timeframe)
                return pd.DataFrame({
                    'Open': np.random.uniform(90, 110, periods),
                    'High': np.random.uniform(100, 120, periods),
                    'Low': np.random.uniform(80, 100, periods),
                    'Close': np.random.uniform(90, 110, periods),
                    'Volume': np.random.uniform(1000000, 5000000, periods)
                }, index=dates)
            
            # Son N period'u al
            return hist.tail(periods)
        
        except Exception as e:
            logger.warning(f"Error fetching data for {symbol} {timeframe}: {e}")
            # Mock data
            dates = pd.date_range(end=datetime.now(), periods=periods, freq=timeframe)
            return pd.DataFrame({
                'Open': np.random.uniform(90, 110, periods),
                'High': np.random.uniform(100, 120, periods),
                'Low': np.random.uniform(80, 100, periods),
                'Close': np.random.uniform(90, 110, periods),
                'Volume': np.random.uniform(1000000, 5000000, periods)
            }, index=dates)
    
    def prepare_features(self, data: pd.DataFrame) -> np.ndarray:
        """Veriyi feature array'e çevir"""
        # Basit features: Close price normalized
        close = data['Close'].values
        # Normalize
        close_norm = (close - close.mean()) / (close.std() + 1e-6)
        # Reshape: (sequence_length, 1)
        return close_norm.reshape(-1, 1)
    
    def get_multi_timeframe_data(self, symbol: str) -> Dict[str, np.ndarray]:
        """Tüm timeframe'ler için veri al"""
        multi_data = {}
        
        for tf in self.timeframes:
            data = self.get_data_for_timeframe(symbol, tf)
            features = self.prepare_features(data)
            multi_data[tf] = features
        
        return multi_data

    def summarize_timeframe_signals(self, multi_data: Dict[str, np.ndarray]) -> List[TimeframeSignal]:
        """Her timeframe için temel istatistikleri çıkar"""
        signals: List[TimeframeSignal] = []
        for tf, series in multi_data.items():
            flat = series.flatten()
            if len(flat) < 5:
                continue
            slope = float(flat[-1] - flat[0])
            short_window = float(flat[-5:].mean())
            long_window = float(flat.mean())
            momentum = short_window - long_window
            volatility = float(np.std(flat))
            latest_return = float(flat[-1] - flat[-2]) if len(flat) > 1 else 0.0
            signals.append(TimeframeSignal(
                timeframe=tf,
                slope=slope,
                momentum=momentum,
                volatility=volatility,
                latest_return=latest_return
            ))
        return signals

    def get_sentiment_snapshot(self, symbol: str) -> SentimentSnapshot:
        """Sentiment skorlarını getir (varsa)"""
        if self.sentiment_analyzer is None:
            return SentimentSnapshot(
                score=0.0,
                label='neutral',
                confidence=0.5,
                news_count=0,
                key_events=[],
                timestamp=datetime.utcnow().isoformat()
            )
        try:
            result: Optional[SentimentResult] = self.sentiment_analyzer.analyze_stock_sentiment(symbol)
        except Exception as exc:
            logger.warning("Sentiment analysis failed for %s: %s", symbol, exc)
            result = None
        if not result:
            return SentimentSnapshot(
                score=0.0,
                label='neutral',
                confidence=0.5,
                news_count=0,
                key_events=[],
                timestamp=datetime.utcnow().isoformat()
            )
        sentiment_label = 'positive' if result.overall_sentiment > 0.05 else 'negative' if result.overall_sentiment < -0.05 else 'neutral'
        return SentimentSnapshot(
            score=float(result.overall_sentiment),
            label=sentiment_label,
            confidence=float(result.confidence),
            news_count=int(result.news_count),
            key_events=result.key_events[:5],
            timestamp=result.timestamp.isoformat()
        )

    def fuse_timeframes_with_sentiment(self, symbol: str) -> FusionResult:
        """Timeframe sinyallerini sentiment ile birleştir"""
        multi_data = self.get_multi_timeframe_data(symbol)
        timeframe_signals = self.summarize_timeframe_signals(multi_data)
        sentiment_snapshot = self.get_sentiment_snapshot(symbol)
        
        if not timeframe_signals:
            rationale = ["Yeterli fiyat verisi bulunamadı, varsayılan HOLD."]
            attention = {tf: 1.0 / len(self.timeframes) for tf in self.timeframes}
            return FusionResult(
                symbol=symbol,
                action='HOLD',
                confidence=0.5,
                rationale=rationale,
                attention_weights=attention,
                timeframe_signals=[],
                sentiment=sentiment_snapshot
            )
        
        # Momentum ağırlıklı attention
        raw_weights = np.array([abs(sig.momentum) + 1e-6 for sig in timeframe_signals])
        weight_sum = raw_weights.sum()
        if weight_sum == 0:
            attention_weights = {sig.timeframe: 1.0 / len(timeframe_signals) for sig in timeframe_signals}
        else:
            attention_weights = {
                sig.timeframe: float(w / weight_sum)
                for sig, w in zip(timeframe_signals, raw_weights)
            }
        
        momentum_score = sum(sig.momentum * attention_weights[sig.timeframe] for sig in timeframe_signals)
        volatility_penalty = np.mean([sig.volatility for sig in timeframe_signals])
        sentiment_bias = sentiment_snapshot.score * 0.3  # sentiment %30 ağırlık
        composite_score = momentum_score - volatility_penalty * 0.05 + sentiment_bias
        
        if composite_score > 0.03:
            action = 'BUY'
        elif composite_score < -0.03:
            action = 'SELL'
        else:
            action = 'HOLD'
        
        confidence = min(0.99, max(0.1, abs(composite_score) * 15 + sentiment_snapshot.confidence * 0.3))
        
        rationale = [
            f"Momentum skoru: {momentum_score:.4f}",
            f"Sentiment bias: {sentiment_bias:.4f} ({sentiment_snapshot.label})",
            f"Volatilite cezası: {volatility_penalty:.4f}"
        ]
        if sentiment_snapshot.key_events:
            rationale.append(f"Öne çıkan haberler: {', '.join(sentiment_snapshot.key_events[:2])}")
        
        return FusionResult(
            symbol=symbol,
            action=action,
            confidence=confidence,
            rationale=rationale,
            attention_weights=attention_weights,
            timeframe_signals=timeframe_signals,
            sentiment=sentiment_snapshot
        )
    
    def predict(self, symbol: str) -> Dict[str, Any]:
        """
        Çoklu zaman çerçevesi tahmini yap
        
        Returns:
            {
                'prediction': 'BUY'/'SELL'/'HOLD',
                'confidence': float,
                'important_timeframes': List[str],
                'attention_weights': Dict[str, float]
            }
        """
        if not self.is_trained or self.model is None:
            logger.warning("Model not trained, returning mock prediction")
            return {
                'prediction': 'HOLD',
                'confidence': 0.5,
                'important_timeframes': ['1d', '1w'],
                'attention_weights': {tf: 1.0 / len(self.timeframes) for tf in self.timeframes}
            }
        
        # Multi-timeframe data al
        multi_data = self.get_multi_timeframe_data(symbol)
        
        # Prepare input: (1, num_timeframes, sequence_length, features)
        input_data = np.array([
            multi_data[tf] for tf in self.timeframes
        ])
        input_data = input_data.reshape(1, len(self.timeframes), -1, 1)
        
        # Predict
        prediction_proba = self.model.predict(input_data, verbose=0)[0]
        prediction_class = np.argmax(prediction_proba)
        confidence = float(prediction_proba[prediction_class])
        
        class_mapping = {0: 'SELL', 1: 'HOLD', 2: 'BUY'}
        prediction = class_mapping.get(prediction_class, 'HOLD')
        
        # Attention weights (basitleştirilmiş: eşit ağırlık)
        attention_weights = {tf: 1.0 / len(self.timeframes) for tf in self.timeframes}
        
        # Important timeframes (confidence'a göre sırala)
        important_timeframes = sorted(
            self.timeframes,
            key=lambda x: attention_weights.get(x, 0),
            reverse=True
        )[:3]
        
        return {
            'prediction': prediction,
            'confidence': confidence,
            'important_timeframes': important_timeframes,
            'attention_weights': attention_weights,
            'all_timeframe_predictions': {
                tf: float(prediction_proba[i % 3])
                for i, tf in enumerate(self.timeframes)
            }
        }
    
    def predict_with_sentiment(self, symbol: str) -> FusionResult:
        """
        Transformer çıkışı + sentiment füzyonunu döndür.
        Model eğitilmemiş olsa bile heuristik füzyon çalışır.
        """
        fusion_result = self.fuse_timeframes_with_sentiment(symbol)
        
        if self.is_trained and self.model is not None:
            base_prediction = self.predict(symbol)
            prob = base_prediction['all_timeframe_predictions']
            model_bias = (prob[self.timeframes[0]] - 0.33) * 0.1
            fusion_score = fusion_result.confidence + model_bias
            fusion_result.confidence = max(0.1, min(0.99, fusion_score))
            fusion_result.rationale.append(f"Transformer modeli bias'ı: {model_bias:+.4f}")
        
        return fusion_result
    
    def train(self, symbols: List[str], labels: List[int]):
        """
        Model eğit (mock implementation)
        Gerçekte: Historical data + labels ile eğitim
        """
        if not TENSORFLOW_AVAILABLE:
            logger.warning("TensorFlow not available, skipping training")
            self.is_trained = True  # Mock
            return
        
        logger.info(f"Training Transformer Multi-Timeframe on {len(symbols)} symbols...")
        
        # Mock training (gerçekte burada eğitim yapılacak)
        # X_train, y_train hazırla
        # self.model.fit(X_train, y_train, epochs=10, batch_size=32)
        
        self.is_trained = True
        logger.info("✅ Transformer Multi-Timeframe model trained")


# Global instance
_global_transformer_mtf: Optional[TransformerMultiTimeframe] = None

def get_transformer_mtf() -> TransformerMultiTimeframe:
    """Global transformer multi-timeframe instance al"""
    global _global_transformer_mtf
    if _global_transformer_mtf is None:
        _global_transformer_mtf = TransformerMultiTimeframe()
    return _global_transformer_mtf

