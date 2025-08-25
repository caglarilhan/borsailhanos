#!/usr/bin/env python3
"""
🚀 Advanced Deep Learning Models - SPRINT 5
BIST AI Smart Trader v2.0 - %90 Doğruluk Hedefi

Deep learning entegrasyonu ile doğruluğu %80'den %90'a çıkarma:
- LSTM Time Series Forecasting
- Transformer Attention Mechanisms
- Multi-Head Attention for Market Data
- Adaptive Learning Systems
"""

import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')

# Deep Learning imports
try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader, TensorDataset
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    logging.warning("⚠️ PyTorch bulunamadı, CPU fallback kullanılıyor")

# Scikit-learn imports
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.feature_selection import RFE, SelectKBest, f_regression

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DeepLearningConfig:
    """Deep learning konfigürasyonu"""
    lstm_hidden_size: int = 128
    lstm_num_layers: int = 3
    transformer_d_model: int = 64
    transformer_nhead: int = 8
    transformer_num_layers: int = 6
    learning_rate: float = 0.001
    batch_size: int = 32
    epochs: int = 100
    early_stopping_patience: int = 15
    validation_split: float = 0.2
    use_gpu: bool = False

@dataclass
class ModelPerformance:
    """Model performans metrikleri"""
    model_name: str
    mse: float
    mae: float
    r2_score: float
    accuracy: float
    training_time: float
    inference_time: float
    last_update: datetime

class LSTMForecaster(nn.Module):
    """LSTM-based time series forecaster"""
    
    def __init__(self, input_size: int, hidden_size: int, num_layers: int, output_size: int):
        super(LSTMForecaster, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=0.2)
        self.dropout = nn.Dropout(0.2)
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        last_output = lstm_out[:, -1, :]
        out = self.dropout(last_output)
        out = self.fc(out)
        return out

class TransformerForecaster(nn.Module):
    """Transformer-based time series forecaster"""
    
    def __init__(self, input_size: int, d_model: int, nhead: int, num_layers: int, output_size: int):
        super(TransformerForecaster, self).__init__()
        self.d_model = d_model
        
        # Ensure d_model is divisible by nhead
        if d_model % nhead != 0:
            d_model = nhead * (d_model // nhead + 1)
            self.d_model = d_model
        
        self.input_projection = nn.Linear(input_size, d_model)
        self.positional_encoding = self._create_positional_encoding(1000, d_model)
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=d_model * 4,
            dropout=0.1,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        self.output_projection = nn.Linear(d_model, output_size)
        
    def _create_positional_encoding(self, max_len: int, d_model: int):
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-np.log(10000.0) / d_model))
        
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        return pe.unsqueeze(0)
    
    def forward(self, x):
        # Ensure input has correct dimensions
        if x.dim() == 2:
            x = x.unsqueeze(1)  # Add batch dimension if missing
        
        x = self.input_projection(x)
        
        # Ensure positional encoding matches sequence length
        seq_len = x.size(1)
        if seq_len <= self.positional_encoding.size(1):
            pos_enc = self.positional_encoding[:, :seq_len, :].to(x.device)
        else:
            # Extend positional encoding if needed
            pos_enc = self._create_positional_encoding(seq_len, self.d_model).to(x.device)
        
        x = x + pos_enc
        x = self.transformer(x)
        x = x.mean(dim=1)  # Global average pooling
        x = self.output_projection(x)
        return x
        
    def forward(self, x):
        x = self.input_projection(x)
        x = x + self.positional_encoding[:, :x.size(1), :].to(x.device)
        x = self.transformer(x)
        x = x.mean(dim=1)  # Global average pooling
        x = self.output_projection(x)
        return x

class AdvancedDeepLearningOptimizer:
    """Advanced deep learning optimizer for %90 accuracy"""
    
    def __init__(self, config: DeepLearningConfig):
        self.config = config
        self.device = torch.device('cuda' if torch.cuda.is_available() and config.use_gpu else 'cpu')
        self.scaler = StandardScaler()
        self.models = {}
        self.performance_history = {}
        
        logger.info(f"🚀 Advanced Deep Learning Optimizer başlatıldı - Device: {self.device}")
        
    def prepare_data(self, data: pd.DataFrame, target_col: str = 'Close', sequence_length: int = 5) -> Tuple[torch.Tensor, torch.Tensor]:
        """Data'yı deep learning için hazırla"""
        try:
            # Feature columns (target hariç)
            feature_cols = [col for col in data.columns if col != target_col and not col.startswith('alternative_')]
            
            # Numeric columns only
            numeric_cols = []
            for col in feature_cols:
                try:
                    pd.to_numeric(data[col])
                    numeric_cols.append(col)
                except:
                    continue
            
            # Feature matrix
            X = data[numeric_cols].values
            y = data[target_col].values
            
            # NaN handling
            X = np.nan_to_num(X, nan=0.0)
            y = np.nan_to_num(y, nan=0.0)
            
            # Scaling
            X_scaled = self.scaler.fit_transform(X)
            
            # Sequence creation - ensure we have enough data
            X_sequences, y_sequences = [], []
            
            for i in range(sequence_length, len(X_scaled)):
                X_sequences.append(X_scaled[i-sequence_length:i])
                y_sequences.append(y[i])
            
            # If not enough sequences, use shorter sequence length
            if len(X_sequences) < 10:
                sequence_length = min(3, len(X_scaled) // 2)
                X_sequences, y_sequences = [], []
                for i in range(sequence_length, len(X_scaled)):
                    X_sequences.append(X_scaled[i-sequence_length:i])
                    y_sequences.append(y[i])
            
            X_tensor = torch.FloatTensor(np.array(X_sequences))
            y_tensor = torch.FloatTensor(np.array(y_sequences))
            
            logger.info(f"✅ Data hazırlandı: {X_tensor.shape} -> {y_tensor.shape}")
            return X_tensor, y_tensor
            
        except Exception as e:
            logger.error(f"❌ Data hazırlama hatası: {e}")
            return None, None
    
    def train_lstm_model(self, X: torch.Tensor, y: torch.Tensor, model_name: str = "LSTM_Forecaster") -> bool:
        """LSTM modeli eğit"""
        try:
            if not TORCH_AVAILABLE:
                logger.warning("⚠️ PyTorch bulunamadı, LSTM eğitimi atlanıyor")
                return False
            
            input_size = X.shape[2]
            output_size = 1
            
            model = LSTMForecaster(
                input_size=input_size,
                hidden_size=self.config.lstm_hidden_size,
                num_layers=self.config.lstm_num_layers,
                output_size=output_size
            ).to(self.device)
            
            # Data loader
            dataset = TensorDataset(X, y)
            dataloader = DataLoader(dataset, batch_size=self.config.batch_size, shuffle=True)
            
            # Loss & optimizer
            criterion = nn.MSELoss()
            optimizer = optim.Adam(model.parameters(), lr=self.config.learning_rate)
            scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=5, factor=0.5)
            
            # Training
            start_time = datetime.now()
            best_loss = float('inf')
            patience_counter = 0
            
            for epoch in range(self.config.epochs):
                model.train()
                total_loss = 0
                
                for batch_X, batch_y in dataloader:
                    batch_X = batch_X.to(self.device)
                    batch_y = batch_y.to(self.device)
                    
                    optimizer.zero_grad()
                    outputs = model(batch_X)
                    loss = criterion(outputs.squeeze(), batch_y)
                    loss.backward()
                    optimizer.step()
                    
                    total_loss += loss.item()
                
                avg_loss = total_loss / len(dataloader)
                scheduler.step(avg_loss)
                
                if epoch % 10 == 0:
                    logger.info(f"📊 Epoch {epoch}: Loss = {avg_loss:.6f}")
                
                # Early stopping
                if avg_loss < best_loss:
                    best_loss = avg_loss
                    patience_counter = 0
                    # Save best model
                    torch.save(model.state_dict(), f"{model_name}_best.pth")
                else:
                    patience_counter += 1
                
                if patience_counter >= self.config.early_stopping_patience:
                    logger.info(f"✅ Early stopping at epoch {epoch}")
                    break
            
            training_time = (datetime.now() - start_time).total_seconds()
            
            # Load best model
            model.load_state_dict(torch.load(f"{model_name}_best.pth"))
            self.models[model_name] = model
            
            # Performance evaluation
            model.eval()
            with torch.no_grad():
                X_eval = X.to(self.device)
                y_pred = model(X_eval).squeeze().cpu().numpy()
                y_true = y.numpy()
                
                mse = mean_squared_error(y_true, y_pred)
                mae = mean_absolute_error(y_true, y_pred)
                r2 = r2_score(y_true, y_pred)
                accuracy = 1 - np.mean(np.abs((y_true - y_pred) / y_true))
                
                performance = ModelPerformance(
                    model_name=model_name,
                    mse=mse,
                    mae=mae,
                    r2_score=r2,
                    accuracy=accuracy,
                    training_time=training_time,
                    inference_time=0.0,
                    last_update=datetime.now()
                )
                
                self.performance_history[model_name] = performance
            
            logger.info(f"✅ LSTM modeli eğitildi: Accuracy = {accuracy:.4f}, R² = {r2:.4f}")
            return True
            
        except Exception as e:
            logger.error(f"❌ LSTM eğitim hatası: {e}")
            return False
    
    def train_transformer_model(self, X: torch.Tensor, y: torch.Tensor, model_name: str = "Transformer_Forecaster") -> bool:
        """Transformer modeli eğit"""
        try:
            if not TORCH_AVAILABLE:
                logger.warning("⚠️ PyTorch bulunamadı, Transformer eğitimi atlanıyor")
                return False
            
            input_size = X.shape[2]
            output_size = 1
            
            model = TransformerForecaster(
                input_size=input_size,
                d_model=self.config.transformer_d_model,
                nhead=self.config.transformer_nhead,
                num_layers=self.config.transformer_num_layers,
                output_size=output_size
            ).to(self.device)
            
            # Data loader
            dataset = TensorDataset(X, y)
            dataloader = DataLoader(dataset, batch_size=self.config.batch_size, shuffle=True)
            
            # Loss & optimizer
            criterion = nn.MSELoss()
            optimizer = optim.AdamW(model.parameters(), lr=self.config.learning_rate, weight_decay=0.01)
            scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=self.config.epochs)
            
            # Training
            start_time = datetime.now()
            best_loss = float('inf')
            patience_counter = 0
            
            for epoch in range(self.config.epochs):
                model.train()
                total_loss = 0
                
                for batch_X, batch_y in dataloader:
                    batch_X = batch_X.to(self.device)
                    batch_y = batch_y.to(self.device)
                    
                    optimizer.zero_grad()
                    outputs = model(batch_X)
                    loss = criterion(outputs.squeeze(), batch_y)
                    loss.backward()
                    
                    # Gradient clipping
                    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                    
                    optimizer.step()
                    total_loss += loss.item()
                
                scheduler.step()
                avg_loss = total_loss / len(dataloader)
                
                if epoch % 10 == 0:
                    logger.info(f"📊 Epoch {epoch}: Loss = {avg_loss:.6f}")
                
                # Early stopping
                if avg_loss < best_loss:
                    best_loss = avg_loss
                    patience_counter = 0
                    torch.save(model.state_dict(), f"{model_name}_best.pth")
                else:
                    patience_counter += 1
                
                if patience_counter >= self.config.early_stopping_patience:
                    logger.info(f"✅ Early stopping at epoch {epoch}")
                    break
            
            training_time = (datetime.now() - start_time).total_seconds()
            
            # Load best model
            model.load_state_dict(torch.load(f"{model_name}_best.pth"))
            self.models[model_name] = model
            
            # Performance evaluation
            model.eval()
            with torch.no_grad():
                X_eval = X.to(self.device)
                y_pred = model(X_eval).squeeze().cpu().numpy()
                y_true = y.numpy()
                
                mse = mean_squared_error(y_true, y_pred)
                mae = mean_absolute_error(y_true, y_pred)
                r2 = r2_score(y_true, y_pred)
                accuracy = 1 - np.mean(np.abs((y_true - y_pred) / y_true))
                
                performance = ModelPerformance(
                    model_name=model_name,
                    mse=mse,
                    mae=mae,
                    r2_score=r2,
                    accuracy=accuracy,
                    training_time=training_time,
                    inference_time=0.0,
                    last_update=datetime.now()
                )
                
                self.performance_history[model_name] = performance
            
            logger.info(f"✅ Transformer modeli eğitildi: Accuracy = {accuracy:.4f}, R² = {r2:.4f}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Transformer eğitim hatası: {e}")
            return False
    
    def get_ensemble_prediction(self, X: torch.Tensor) -> Dict[str, float]:
        """Ensemble prediction from all models"""
        try:
            predictions = {}
            
            for model_name, model in self.models.items():
                model.eval()
                with torch.no_grad():
                    X_eval = X.to(self.device)
                    start_time = datetime.now()
                    y_pred = model(X_eval).squeeze().cpu().numpy()
                    inference_time = (datetime.now() - start_time).total_seconds()
                    
                    predictions[model_name] = {
                        'prediction': float(y_pred[-1]),
                        'inference_time': inference_time
                    }
                    
                    # Update inference time in performance
                    if model_name in self.performance_history:
                        self.performance_history[model_name].inference_time = inference_time
            
            # Weighted ensemble (based on R² score)
            if len(predictions) > 1:
                weights = {}
                total_weight = 0
                
                for model_name in predictions:
                    if model_name in self.performance_history:
                        weight = max(self.performance_history[model_name].r2_score, 0.1)
                        weights[model_name] = weight
                        total_weight += weight
                    else:
                        weights[model_name] = 1.0
                        total_weight += 1.0
                
                # Normalize weights
                for model_name in weights:
                    weights[model_name] /= total_weight
                
                # Weighted prediction
                ensemble_pred = 0.0
                for model_name, pred_data in predictions.items():
                    ensemble_pred += pred_data['prediction'] * weights[model_name]
                
                predictions['ensemble'] = {
                    'prediction': ensemble_pred,
                    'weights': weights,
                    'inference_time': sum(p['inference_time'] for p in predictions.values())
                }
            
            return predictions
            
        except Exception as e:
            logger.error(f"❌ Ensemble prediction hatası: {e}")
            return {}
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Performans özeti"""
        try:
            summary = {
                'total_models': len(self.models),
                'models': {},
                'overall_accuracy': 0.0,
                'overall_r2': 0.0
            }
            
            if self.performance_history:
                accuracies = [p.accuracy for p in self.performance_history.values()]
                r2_scores = [p.r2_score for p in self.performance_history.values()]
                
                summary['overall_accuracy'] = np.mean(accuracies)
                summary['overall_r2'] = np.mean(r2_scores)
                
                for model_name, performance in self.performance_history.items():
                    summary['models'][model_name] = {
                        'accuracy': performance.accuracy,
                        'r2_score': performance.r2_score,
                        'training_time': performance.training_time,
                        'inference_time': performance.inference_time,
                        'last_update': performance.last_update.isoformat()
                    }
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Performance summary hatası: {e}")
            return {}

def main():
    """Test fonksiyonu"""
    logger.info("🚀 Advanced Deep Learning Models Test Başlıyor...")
    
    # Config
    config = DeepLearningConfig(
        lstm_hidden_size=64,
        lstm_num_layers=2,
        transformer_d_model=32,
        transformer_nhead=4,
        transformer_num_layers=3,
        epochs=50
    )
    
    # Optimizer
    optimizer = AdvancedDeepLearningOptimizer(config)
    
    # Test data oluştur
    np.random.seed(42)
    n_samples = 1000
    n_features = 20
    
    # Synthetic data
    X = np.random.randn(n_samples, n_features)
    y = np.random.randn(n_samples)
    
    # DataFrame'e çevir
    feature_cols = [f'feature_{i}' for i in range(n_features)]
    data = pd.DataFrame(X, columns=feature_cols)
    data['Close'] = y
    
    # Data hazırla
    X_tensor, y_tensor = optimizer.prepare_data(data, 'Close', sequence_length=30)
    
    if X_tensor is not None and y_tensor is not None:
        # LSTM eğit
        logger.info("🧪 LSTM modeli eğitiliyor...")
        lstm_success = optimizer.train_lstm_model(X_tensor, y_tensor, "LSTM_Test")
        
        # Transformer eğit
        logger.info("🧪 Transformer modeli eğitiliyor...")
        transformer_success = optimizer.train_transformer_model(X_tensor, y_tensor, "Transformer_Test")
        
        # Performance summary
        if lstm_success or transformer_success:
            summary = optimizer.get_performance_summary()
            logger.info("📊 Performance Summary:")
            logger.info(f"   Overall Accuracy: {summary['overall_accuracy']:.4f}")
            logger.info(f"   Overall R²: {summary['overall_r2']:.4f}")
            logger.info(f"   Total Models: {summary['total_models']}")
            
            # Test prediction
            test_X = X_tensor[-1:].to(optimizer.device)
            predictions = optimizer.get_ensemble_prediction(test_X)
            
            logger.info("🔮 Test Predictions:")
            for model_name, pred_data in predictions.items():
                if model_name != 'ensemble':
                    logger.info(f"   {model_name}: {pred_data['prediction']:.6f}")
                else:
                    logger.info(f"   Ensemble: {pred_data['prediction']:.6f}")
                    logger.info(f"   Weights: {pred_data['weights']}")
    
    logger.info("✅ Test tamamlandı!")

if __name__ == "__main__":
    main()
