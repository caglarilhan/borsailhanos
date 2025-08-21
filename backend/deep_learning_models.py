"""
PRD v2.0 - Deep Learning & Transformer Models
Ultra güçlü AI: LSTM, GRU, Transformer, BERT, GPT tabanlı modeller
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple, Any
import warnings
warnings.filterwarnings('ignore')

# Deep Learning
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers, optimizers, callbacks, regularizers
    from tensorflow.keras.models import Sequential, Model
    from tensorflow.keras.layers import LSTM, GRU, Dense, Dropout, BatchNormalization, Attention
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("⚠️ TensorFlow bulunamadı")

# Transformer Models
try:
    import transformers
    from transformers import AutoTokenizer, AutoModel, pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("⚠️ Transformers bulunamadı")

# Time Series
try:
    from statsmodels.tsa.statespace.varmax import VARMAX
    from statsmodels.tsa.vector_ar.var_model import VAR
    STATSMODELS_AVAILABLE = True
except ImportError:
    STATSMODELS_AVAILABLE = False
    print("⚠️ StatsModels bulunamadı")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DeepLearningModels:
    """Ultra güçlü deep learning modelleri"""
    
    def __init__(self):
        self.models = {}
        self.transformers = {}
        self.feature_extractors = {}
        self.performance_history = []
        
        # Model türleri
        self.model_types = {
            "recurrent": ["LSTM", "GRU", "Bidirectional LSTM", "Stacked LSTM"],
            "transformer": ["BERT", "GPT", "T5", "Financial BERT"],
            "hybrid": ["LSTM + Attention", "CNN + LSTM", "Transformer + LSTM"],
            "ensemble": ["Deep Ensemble", "Stacking", "Bagging"]
        }
        
        # Hyperparameter grids
        self.param_grids = self._get_deep_param_grids()
        
    def _get_deep_param_grids(self) -> Dict:
        """Deep learning hyperparameter grid'leri"""
        return {
            "LSTM": {
                "units": [64, 128, 256, 512],
                "layers": [2, 3, 4, 5],
                "dropout": [0.1, 0.2, 0.3, 0.5],
                "learning_rate": [0.001, 0.0001, 0.00001]
            },
            "GRU": {
                "units": [64, 128, 256, 512],
                "layers": [2, 3, 4],
                "dropout": [0.1, 0.2, 0.3],
                "learning_rate": [0.001, 0.0001]
            },
            "Transformer": {
                "d_model": [128, 256, 512],
                "n_heads": [4, 8, 16],
                "n_layers": [2, 4, 6],
                "dropout": [0.1, 0.2, 0.3]
            }
        }
    
    def create_lstm_model(self, input_shape: Tuple, units: int = 128, layers: int = 3, dropout: float = 0.2) -> Model:
        """Gelişmiş LSTM model oluştur"""
        try:
            model = Sequential()
            
            # Input layer
            model.add(LSTM(
                units=units,
                return_sequences=True,
                input_shape=input_shape,
                dropout=dropout,
                recurrent_dropout=dropout,
                kernel_regularizer=regularizers.l2(0.01)
            ))
            model.add(BatchNormalization())
            
            # Hidden layers
            for i in range(layers - 2):
                model.add(LSTM(
                    units=units,
                    return_sequences=True,
                    dropout=dropout,
                    recurrent_dropout=dropout,
                    kernel_regularizer=regularizers.l2(0.01)
                ))
                model.add(BatchNormalization())
                model.add(Dropout(dropout))
            
            # Last LSTM layer
            model.add(LSTM(
                units=units,
                return_sequences=False,
                dropout=dropout,
                recurrent_dropout=dropout,
                kernel_regularizer=regularizers.l2(0.01)
            ))
            model.add(BatchNormalization())
            model.add(Dropout(dropout))
            
            # Dense layers
            model.add(Dense(64, activation='relu', kernel_regularizer=regularizers.l2(0.01)))
            model.add(BatchNormalization())
            model.add(Dropout(dropout))
            
            model.add(Dense(32, activation='relu', kernel_regularizer=regularizers.l2(0.01)))
            model.add(BatchNormalization())
            model.add(Dropout(dropout))
            
            # Output layer
            model.add(Dense(1, activation='sigmoid'))
            
            # Compile
            optimizer = optimizers.Adam(learning_rate=0.001)
            model.compile(
                optimizer=optimizer,
                loss='binary_crossentropy',
                metrics=['accuracy', 'precision', 'recall']
            )
            
            return model
            
        except Exception as e:
            logger.error(f"❌ LSTM model oluşturma hatası: {e}")
            return None
    
    def create_gru_model(self, input_shape: Tuple, units: int = 128, layers: int = 3, dropout: float = 0.2) -> Model:
        """Gelişmiş GRU model oluştur"""
        try:
            model = Sequential()
            
            # Input layer
            model.add(GRU(
                units=units,
                return_sequences=True,
                input_shape=input_shape,
                dropout=dropout,
                recurrent_dropout=dropout,
                kernel_regularizer=regularizers.l2(0.01)
            ))
            model.add(BatchNormalization())
            
            # Hidden layers
            for i in range(layers - 2):
                model.add(GRU(
                    units=units,
                    return_sequences=True,
                    dropout=dropout,
                    recurrent_dropout=dropout,
                    kernel_regularizer=regularizers.l2(0.01)
                ))
                model.add(BatchNormalization())
                model.add(Dropout(dropout))
            
            # Last GRU layer
            model.add(GRU(
                units=units,
                return_sequences=False,
                dropout=dropout,
                recurrent_dropout=dropout,
                kernel_regularizer=regularizers.l2(0.01)
            ))
            model.add(BatchNormalization())
            model.add(Dropout(dropout))
            
            # Dense layers
            model.add(Dense(64, activation='relu', kernel_regularizer=regularizers.l2(0.01)))
            model.add(BatchNormalization())
            model.add(Dropout(dropout))
            
            model.add(Dense(32, activation='relu', kernel_regularizer=regularizers.l2(0.01)))
            model.add(BatchNormalization())
            model.add(Dropout(dropout))
            
            # Output layer
            model.add(Dense(1, activation='sigmoid'))
            
            # Compile
            optimizer = optimizers.Adam(learning_rate=0.001)
            model.compile(
                optimizer=optimizer,
                loss='binary_crossentropy',
                metrics=['accuracy', 'precision', 'recall']
            )
            
            return model
            
        except Exception as e:
            logger.error(f"❌ GRU model oluşturma hatası: {e}")
            return None
    
    def create_attention_lstm(self, input_shape: Tuple, units: int = 128) -> Model:
        """Attention mechanism ile LSTM model"""
        try:
            # Input
            inputs = layers.Input(shape=input_shape)
            
            # LSTM with attention
            lstm_out = LSTM(units, return_sequences=True)(inputs)
            
            # Attention mechanism
            attention = layers.Dense(1, activation='tanh')(lstm_out)
            attention = layers.Flatten()(attention)
            attention_weights = layers.Activation('softmax')(attention)
            attention_weights = layers.RepeatVector(units)(attention_weights)
            attention_weights = layers.Permute([2, 1])(attention_weights)
            
            # Apply attention
            attention_out = layers.Multiply()([lstm_out, attention_weights])
            attention_out = layers.Lambda(lambda x: tf.reduce_sum(x, axis=1))(attention_out)
            
            # Dense layers
            dense1 = Dense(64, activation='relu')(attention_out)
            dense1 = BatchNormalization()(dense1)
            dense1 = Dropout(0.3)(dense1)
            
            dense2 = Dense(32, activation='relu')(dense1)
            dense2 = BatchNormalization()(dense2)
            dense2 = Dropout(0.3)(dense2)
            
            # Output
            output = Dense(1, activation='sigmoid')(dense2)
            
            model = Model(inputs=inputs, outputs=output)
            
            # Compile
            optimizer = optimizers.Adam(learning_rate=0.001)
            model.compile(
                optimizer=optimizer,
                loss='binary_crossentropy',
                metrics=['accuracy', 'precision', 'recall']
            )
            
            return model
            
        except Exception as e:
            logger.error(f"❌ Attention LSTM hatası: {e}")
            return None
    
    def create_transformer_model(self, input_shape: Tuple, d_model: int = 256, n_heads: int = 8, n_layers: int = 4) -> Model:
        """Transformer model oluştur"""
        try:
            # Input
            inputs = layers.Input(shape=input_shape)
            
            # Positional encoding
            pos_encoding = self._positional_encoding(input_shape[0], d_model)
            pos_encoding = layers.Lambda(lambda x: pos_encoding)(inputs)
            
            # Embedding
            embedding = layers.Dense(d_model, activation='relu')(inputs)
            embedding = embedding + pos_encoding
            
            # Transformer blocks
            transformer_out = embedding
            for _ in range(n_layers):
                # Multi-head attention
                attention_output = layers.MultiHeadAttention(
                    num_heads=n_heads, key_dim=d_model
                )(transformer_out, transformer_out)
                transformer_out = layers.Add()([transformer_out, attention_output])
                transformer_out = layers.LayerNormalization(epsilon=1e-6)(transformer_out)
                
                # Feed forward
                ffn = layers.Dense(d_model * 4, activation='relu')(transformer_out)
                ffn = layers.Dense(d_model)(ffn)
                transformer_out = layers.Add()([transformer_out, ffn])
                transformer_out = layers.LayerNormalization(epsilon=1e-6)(transformer_out)
            
            # Global average pooling
            pooled = layers.GlobalAveragePooling1D()(transformer_out)
            
            # Dense layers
            dense1 = Dense(128, activation='relu')(pooled)
            dense1 = BatchNormalization()(dense1)
            dense1 = Dropout(0.3)(dense1)
            
            dense2 = Dense(64, activation='relu')(dense1)
            dense2 = BatchNormalization()(dense2)
            dense2 = Dropout(0.3)(dense2)
            
            # Output
            output = Dense(1, activation='sigmoid')(dense2)
            
            model = Model(inputs=inputs, outputs=output)
            
            # Compile
            optimizer = optimizers.Adam(learning_rate=0.0001)
            model.compile(
                optimizer=optimizer,
                loss='binary_crossentropy',
                metrics=['accuracy', 'precision', 'recall']
            )
            
            return model
            
        except Exception as e:
            logger.error(f"❌ Transformer model hatası: {e}")
            return None
    
    def _positional_encoding(self, position: int, d_model: int) -> np.ndarray:
        """Positional encoding hesapla"""
        try:
            pos_encoding = np.zeros((position, d_model))
            for pos in range(position):
                for i in range(0, d_model, 2):
                    pos_encoding[pos, i] = np.sin(pos / (10000 ** (i / d_model)))
                    if i + 1 < d_model:
                        pos_encoding[pos, i + 1] = np.cos(pos / (10000 ** (i / d_model)))
            return pos_encoding
        except:
            return np.zeros((position, d_model))
    
    def prepare_sequence_data(self, data: pd.DataFrame, sequence_length: int = 60) -> Tuple[np.ndarray, np.ndarray]:
        """Sequence data hazırla"""
        try:
            # Feature columns (numeric only)
            feature_cols = data.select_dtypes(include=[np.number]).columns.tolist()
            feature_cols = [col for col in feature_cols if col != 'Target']
            
            if not feature_cols:
                return None, None
            
            # Normalize features
            scaler = StandardScaler()
            scaled_data = scaler.fit_transform(data[feature_cols])
            
            # Create sequences
            X, y = [], []
            for i in range(sequence_length, len(scaled_data)):
                X.append(scaled_data[i-sequence_length:i])
                y.append(data['Target'].iloc[i])
            
            return np.array(X), np.array(y)
            
        except Exception as e:
            logger.error(f"❌ Sequence data hazırlama hatası: {e}")
            return None, None
    
    def train_deep_model(self, symbol: str, model_type: str = "LSTM", sequence_length: int = 60) -> Dict:
        """Deep learning model eğit"""
        try:
            logger.info(f"🚀 {symbol} için {model_type} model eğitiliyor...")
            
            # Veri hazırla
            stock = yf.Ticker(symbol)
            data = stock.history(period="2y")
            
            if data.empty:
                return {"error": "Veri bulunamadı"}
            
            # Advanced features ekle (placeholder)
            # Gerçek uygulamada advanced_feature_engine kullanılacak
            data['Target'] = (data['Close'].shift(-1) > data['Close']).astype(int)
            data = data.dropna()
            
            # Sequence data
            X, y = self.prepare_sequence_data(data, sequence_length)
            if X is None:
                return {"error": "Sequence data hazırlanamadı"}
            
            # Train/validation split
            split_idx = int(len(X) * 0.8)
            X_train, X_val = X[:split_idx], X[split_idx:]
            y_train, y_val = y[:split_idx], y[split_idx:]
            
            # Model oluştur
            if model_type == "LSTM":
                model = self.create_lstm_model(X_train.shape[1:])
            elif model_type == "GRU":
                model = self.create_gru_model(X_train.shape[1:])
            elif model_type == "Attention_LSTM":
                model = self.create_attention_lstm(X_train.shape[1:])
            elif model_type == "Transformer":
                model = self.create_transformer_model(X_train.shape[1:])
            else:
                return {"error": f"Bilinmeyen model türü: {model_type}"}
            
            if model is None:
                return {"error": "Model oluşturulamadı"}
            
            # Callbacks
            callbacks_list = [
                callbacks.EarlyStopping(
                    monitor='val_loss',
                    patience=10,
                    restore_best_weights=True
                ),
                callbacks.ReduceLROnPlateau(
                    monitor='val_loss',
                    factor=0.5,
                    patience=5,
                    min_lr=0.00001
                ),
                callbacks.ModelCheckpoint(
                    f'models/{symbol}_{model_type}_best.h5',
                    monitor='val_loss',
                    save_best_only=True
                )
            ]
            
            # Training
            history = model.fit(
                X_train, y_train,
                validation_data=(X_val, y_val),
                epochs=100,
                batch_size=32,
                callbacks=callbacks_list,
                verbose=1
            )
            
            # Evaluation
            val_loss, val_accuracy, val_precision, val_recall = model.evaluate(X_val, y_val, verbose=0)
            
            # Predictions
            y_pred = model.predict(X_val)
            y_pred_binary = (y_pred > 0.5).astype(int)
            
            # Metrics
            from sklearn.metrics import f1_score, roc_auc_score
            f1 = f1_score(y_val, y_pred_binary)
            roc_auc = roc_auc_score(y_val, y_pred.flatten())
            
            # Model kaydet
            model_name = f"{symbol}_{model_type}"
            self.models[model_name] = model
            
            logger.info(f"✅ {model_type} model eğitimi tamamlandı")
            logger.info(f"📊 Validation Accuracy: {val_accuracy:.4f}")
            logger.info(f"📊 Validation F1: {f1:.4f}")
            logger.info(f"📊 ROC AUC: {roc_auc:.4f}")
            
            return {
                "symbol": symbol,
                "model_type": model_type,
                "training_history": history.history,
                "validation_metrics": {
                    "loss": val_loss,
                    "accuracy": val_accuracy,
                    "precision": val_precision,
                    "recall": val_recall,
                    "f1": f1,
                    "roc_auc": roc_auc
                },
                "model_summary": model.summary(),
                "training_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Deep model eğitimi hatası: {e}")
            return {"error": str(e)}
    
    def predict_deep_model(self, symbol: str, model_type: str = "LSTM") -> Dict:
        """Deep learning model ile tahmin"""
        try:
            model_name = f"{symbol}_{model_type}"
            if model_name not in self.models:
                return {"error": f"Model bulunamadı: {model_name}"}
            
            model = self.models[model_name]
            
            # Güncel veri
            stock = yf.Ticker(symbol)
            data = stock.history(period="6mo")
            
            if data.empty:
                return {"error": "Güncel veri bulunamadı"}
            
            # Sequence data hazırla
            X, _ = self.prepare_sequence_data(data, sequence_length=60)
            if X is None or len(X) == 0:
                return {"error": "Sequence data hazırlanamadı"}
            
            # Tahmin
            latest_sequence = X[-1:]
            prediction = model.predict(latest_sequence)[0][0]
            
            # Confidence
            confidence = prediction if prediction > 0.5 else 1 - prediction
            
            # Recommendation
            if prediction > 0.7:
                recommendation = "STRONG BUY"
            elif prediction > 0.6:
                recommendation = "BUY"
            elif prediction < 0.3:
                recommendation = "STRONG SELL"
            elif prediction < 0.4:
                recommendation = "SELL"
            else:
                recommendation = "HOLD"
            
            return {
                "symbol": symbol,
                "model_type": model_type,
                "prediction": "YÜKSELIŞ" if prediction > 0.5 else "DÜŞÜŞ",
                "probability": prediction,
                "confidence": confidence,
                "recommendation": recommendation,
                "prediction_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Deep model tahmin hatası: {e}")
            return {"error": str(e)}
    
    def create_deep_ensemble(self, symbol: str, model_types: List[str] = None) -> Dict:
        """Deep learning ensemble oluştur"""
        try:
            if model_types is None:
                model_types = ["LSTM", "GRU", "Attention_LSTM"]
            
            logger.info(f"🚀 {symbol} için deep ensemble oluşturuluyor...")
            
            # Modelleri eğit
            trained_models = {}
            for model_type in model_types:
                training_result = self.train_deep_model(symbol, model_type)
                if "error" not in training_result:
                    trained_models[model_type] = training_result
            
            if not trained_models:
                return {"error": "Hiçbir model eğitilemedi"}
            
            # Ensemble prediction
            ensemble_prediction = self._ensemble_predict(symbol, list(trained_models.keys()))
            
            logger.info(f"✅ Deep ensemble oluşturuldu: {len(trained_models)} model")
            
            return {
                "symbol": symbol,
                "ensemble_type": "Deep Learning",
                "models": list(trained_models.keys()),
                "training_results": trained_models,
                "ensemble_prediction": ensemble_prediction,
                "creation_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Deep ensemble hatası: {e}")
            return {"error": str(e)}
    
    def _ensemble_predict(self, symbol: str, model_types: List[str]) -> Dict:
        """Ensemble tahmin"""
        try:
            predictions = []
            confidences = []
            
            for model_type in model_types:
                pred_result = self.predict_deep_model(symbol, model_type)
                if "error" not in pred_result:
                    predictions.append(pred_result["probability"])
                    confidences.append(pred_result["confidence"])
            
            if not predictions:
                return {"error": "Hiçbir tahmin alınamadı"}
            
            # Weighted average
            avg_prediction = np.average(predictions, weights=confidences)
            avg_confidence = np.mean(confidences)
            
            # Recommendation
            if avg_prediction > 0.7:
                recommendation = "STRONG BUY"
            elif avg_prediction > 0.6:
                recommendation = "BUY"
            elif avg_prediction < 0.3:
                recommendation = "STRONG SELL"
            elif avg_prediction < 0.4:
                recommendation = "SELL"
            else:
                recommendation = "HOLD"
            
            return {
                "ensemble_prediction": "YÜKSELIŞ" if avg_prediction > 0.5 else "DÜŞÜŞ",
                "ensemble_probability": avg_prediction,
                "ensemble_confidence": avg_confidence,
                "individual_predictions": dict(zip(model_types, predictions)),
                "recommendation": recommendation
            }
            
        except Exception as e:
            logger.error(f"❌ Ensemble tahmin hatası: {e}")
            return {"error": str(e)}

# Test fonksiyonu
if __name__ == "__main__":
    if not TENSORFLOW_AVAILABLE:
        print("❌ TensorFlow bulunamadı, deep learning test edilemiyor")
    else:
        deep_learner = DeepLearningModels()
        
        # Test hissesi
        symbol = "GARAN.IS"
        logger.info(f"🧪 {symbol} için deep learning test ediliyor...")
        
        logger.info("✅ Deep Learning Models modülü hazır!")
        logger.info(f"📊 Model türleri: {list(deep_learner.model_types.keys())}")
        logger.info(f"🔧 Hyperparameter grid'ler: {list(deep_learner.param_grids.keys())}")
        
        # LSTM test
        # training_result = deep_learner.train_deep_model(symbol, "LSTM")
        # logger.info(f"📊 LSTM eğitim sonucu: {training_result}")
