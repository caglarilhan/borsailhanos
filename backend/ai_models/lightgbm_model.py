"""
LightGBM Model - Günlük Yön Tahmini
- Feature engineering
- Walk-forward cross validation
- Hyperparameter optimization
- Model persistence
"""

import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.preprocessing import StandardScaler
import joblib
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import talib
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score

logger = logging.getLogger(__name__)

class LightGBMModel:
    def __init__(self, model_path: str = "models/lightgbm_model.pkl"):
        self.model_path = model_path
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = []
        self.is_trained = False
        self.calibrator: Optional[CalibratedClassifierCV] = None
        self.best_threshold: float = 0.5
        
        # Hyperparameters
        self.params = {
            'objective': 'binary',
            'metric': 'auc',
            'boosting_type': 'gbdt',
            'num_leaves': 31,
            'learning_rate': 0.05,
            'feature_fraction': 0.9,
            'bagging_fraction': 0.8,
            'bagging_freq': 5,
            'verbose': -1,
            'random_state': 42
        }
    
    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Teknik indikatörler ve feature'lar oluştur"""
        try:
            features = df.copy()
            
            # Fiyat bazlı feature'lar
            features['returns'] = df['Close'].pct_change()
            features['log_returns'] = np.log(df['Close'] / df['Close'].shift(1))
            features['price_range'] = (df['High'] - df['Low']) / df['Close']
            features['price_position'] = (df['Close'] - df['Low']) / (df['High'] - df['Low'])
            
            # Moving averages
            for period in [5, 10, 20, 50]:
                features[f'sma_{period}'] = talib.SMA(df['Close'], period)
                features[f'ema_{period}'] = talib.EMA(df['Close'], period)
                features[f'price_sma_{period}_ratio'] = df['Close'] / features[f'sma_{period}']
                features[f'price_ema_{period}_ratio'] = df['Close'] / features[f'ema_{period}']
            
            # Momentum indikatörleri
            features['rsi'] = talib.RSI(df['Close'], 14)
            features['stoch_k'], features['stoch_d'] = talib.STOCH(df['High'], df['Low'], df['Close'])
            features['macd'], features['macd_signal'], features['macd_hist'] = talib.MACD(df['Close'])
            features['williams_r'] = talib.WILLR(df['High'], df['Low'], df['Close'], 14)
            
            # Volatilite indikatörleri
            features['bbands_upper'], features['bbands_middle'], features['bbands_lower'] = talib.BBANDS(df['Close'])
            features['bbands_width'] = (features['bbands_upper'] - features['bbands_lower']) / features['bbands_middle']
            features['bbands_position'] = (df['Close'] - features['bbands_lower']) / (features['bbands_upper'] - features['bbands_lower'])
            
            # Hacim bazlı feature'lar
            if 'Volume' in df.columns:
                features['volume_sma'] = talib.SMA(df['Volume'], 20)
                features['volume_ratio'] = df['Volume'] / features['volume_sma']
                features['price_volume'] = df['Close'] * df['Volume']
                features['obv'] = talib.OBV(df['Close'], df['Volume'])
            
            # Trend indikatörleri
            features['adx'] = talib.ADX(df['High'], df['Low'], df['Close'], 14)
            features['cci'] = talib.CCI(df['High'], df['Low'], df['Close'], 14)
            features['aroon_up'], features['aroon_down'] = talib.AROON(df['High'], df['Low'], 14)
            features['aroon_osc'] = features['aroon_up'] - features['aroon_down']
            
            # Fibonacci retracement levels
            high_20 = df['High'].rolling(20).max()
            low_20 = df['Low'].rolling(20).min()
            features['fib_23'] = high_20 - (high_20 - low_20) * 0.236
            features['fib_38'] = high_20 - (high_20 - low_20) * 0.382
            features['fib_50'] = high_20 - (high_20 - low_20) * 0.5
            features['fib_61'] = high_20 - (high_20 - low_20) * 0.618
            
            # Support/Resistance
            features['support_20'] = df['Low'].rolling(20).min()
            features['resistance_20'] = df['High'].rolling(20).max()
            features['support_distance'] = (df['Close'] - features['support_20']) / df['Close']
            features['resistance_distance'] = (features['resistance_20'] - df['Close']) / df['Close']
            
            # Lagged features
            for lag in [1, 2, 3, 5]:
                features[f'returns_lag_{lag}'] = features['returns'].shift(lag)
                features[f'volume_lag_{lag}'] = features['volume_ratio'].shift(lag) if 'volume_ratio' in features else 0
            
            # Rolling statistics
            for window in [5, 10, 20]:
                features[f'returns_std_{window}'] = features['returns'].rolling(window).std()
                features[f'returns_mean_{window}'] = features['returns'].rolling(window).mean()
                features[f'returns_skew_{window}'] = features['returns'].rolling(window).skew()
                features[f'returns_kurt_{window}'] = features['returns'].rolling(window).kurt()
            
            # NaN değerleri temizle
            features = features.fillna(method='ffill').fillna(0)
            
            # Feature isimlerini kaydet
            self.feature_names = [col for col in features.columns if col not in ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']]
            
            return features
            
        except Exception as e:
            logger.error(f"Feature engineering hatası: {e}")
            return df
    
    def create_target(self, df: pd.DataFrame, threshold: float = 0.02) -> pd.Series:
        """Hedef değişken oluştur (1: yukarı, 0: aşağı)"""
        try:
            # Gelecek günün return'ü
            future_returns = df['Close'].shift(-1) / df['Close'] - 1
            
            # Threshold'a göre binary classification
            target = (future_returns > threshold).astype(int)
            
            return target
            
        except Exception as e:
            logger.error(f"Target oluşturma hatası: {e}")
            return pd.Series()
    
    def prepare_data(self, df: pd.DataFrame, target_threshold: float = 0.02) -> Tuple[pd.DataFrame, pd.Series]:
        """Veri hazırlama"""
        try:
            # Feature'ları oluştur
            features_df = self.create_features(df)
            
            # Target'ı oluştur
            target = self.create_target(features_df, target_threshold)
            
            # Feature ve target'ı birleştir
            data = features_df[self.feature_names].copy()
            data['target'] = target
            
            # NaN değerleri temizle
            data = data.dropna()
            
            return data[self.feature_names], data['target']
            
        except Exception as e:
            logger.error(f"Veri hazırlama hatası: {e}")
            return pd.DataFrame(), pd.Series()
    
    def walk_forward_validation(self, X: pd.DataFrame, y: pd.Series, n_splits: int = 5) -> Dict:
        """Walk-forward cross validation"""
        try:
            tscv = TimeSeriesSplit(n_splits=n_splits)
            scores = {
                'accuracy': [], 'precision': [], 'recall': [], 
                'f1': [], 'auc': [], 'predictions': []
            }
            
            for train_idx, val_idx in tscv.split(X):
                X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
                y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
                
                # Model eğit
                model = lgb.LGBMClassifier(**self.params)
                model.fit(X_train, y_train)
                
                # Tahmin
                y_pred = model.predict(X_val)
                y_pred_proba = model.predict_proba(X_val)[:, 1]
                
                # Metrikler
                scores['accuracy'].append(accuracy_score(y_val, y_pred))
                scores['precision'].append(precision_score(y_val, y_pred, zero_division=0))
                scores['recall'].append(recall_score(y_val, y_pred, zero_division=0))
                scores['f1'].append(f1_score(y_val, y_pred, zero_division=0))
                scores['auc'].append(roc_auc_score(y_val, y_pred_proba))
                scores['predictions'].extend(y_pred.tolist())
            
            # Ortalama skorlar
            avg_scores = {
                'avg_accuracy': np.mean(scores['accuracy']),
                'avg_precision': np.mean(scores['precision']),
                'avg_recall': np.mean(scores['recall']),
                'avg_f1': np.mean(scores['f1']),
                'avg_auc': np.mean(scores['auc']),
                'std_accuracy': np.std(scores['accuracy']),
                'std_auc': np.std(scores['auc'])
            }
            
            return avg_scores
            
        except Exception as e:
            logger.error(f"Walk-forward validation hatası: {e}")
            return {}
    
    def train(self, df: pd.DataFrame, target_threshold: float = 0.02) -> Dict:
        """Model eğitimi"""
        try:
            logger.info("LightGBM model eğitimi başladı")
            
            # Veri hazırlama
            X, y = self.prepare_data(df, target_threshold)
            
            if X.empty or y.empty:
                raise ValueError("Veri hazırlanamadı")
            
            logger.info(f"Feature sayısı: {len(self.feature_names)}")
            logger.info(f"Veri boyutu: {len(X)}")
            
            # Walk-forward validation
            validation_scores = self.walk_forward_validation(X, y)
            logger.info(f"Validation skorları: {validation_scores}")
            
            # Hold-out validation (son %20) ile kalibrasyon ve eşik optimizasyonu
            split_idx = int(len(X) * 0.8)
            X_train, X_val = X.iloc[:split_idx], X.iloc[split_idx:]
            y_train, y_val = y.iloc[:split_idx], y.iloc[split_idx:]

            self.model = lgb.LGBMClassifier(**self.params)
            self.model.fit(X_train, y_train)

            # Kalibrasyon (isotonic, gerekirse sigmoid)
            try:
                self.calibrator = CalibratedClassifierCV(self.model, method='isotonic', cv='prefit')
                self.calibrator.fit(X_val, y_val)
            except Exception as _:
                self.calibrator = CalibratedClassifierCV(self.model, method='sigmoid', cv='prefit')
                self.calibrator.fit(X_val, y_val)

            # Eşik optimizasyonu: yüksek precision hedefi (min recall = 0.2)
            val_proba = self.calibrator.predict_proba(X_val)[:, 1] if self.calibrator else self.model.predict_proba(X_val)[:, 1]
            thresholds = [round(t, 3) for t in list(np.linspace(0.2, 0.9, 71))]
            best = {'thr': 0.5, 'precision': -1, 'recall': 0, 'f1': 0}
            for t in thresholds:
                y_hat = (val_proba >= t).astype(int)
                prec = precision_score(y_val, y_hat, zero_division=0)
                rec = recall_score(y_val, y_hat, zero_division=0)
                f1 = f1_score(y_val, y_hat, zero_division=0)
                # Önce min recall sağlanarak precision maksimize edilir, eşit ise f1'e bakılır
                if rec >= 0.2 and (prec > best['precision'] or (prec == best['precision'] and f1 > best['f1'])):
                    best = {'thr': t, 'precision': float(prec), 'recall': float(rec), 'f1': float(f1)}
            # Eğer hiç threshold min recall'ü sağlamazsa, en iyi f1'i seç
            if best['precision'] < 0:
                for t in thresholds:
                    y_hat = (val_proba >= t).astype(int)
                    prec = precision_score(y_val, y_hat, zero_division=0)
                    rec = recall_score(y_val, y_hat, zero_division=0)
                    f1 = f1_score(y_val, y_hat, zero_division=0)
                    if f1 > best['f1']:
                        best = {'thr': t, 'precision': float(prec), 'recall': float(rec), 'f1': float(f1)}
            self.best_threshold = float(best['thr'])
            
            # Feature importance
            feature_importance = pd.DataFrame({
                'feature': self.feature_names,
                'importance': self.model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            logger.info("Top 10 önemli feature'lar:")
            for _, row in feature_importance.head(10).iterrows():
                logger.info(f"  {row['feature']}: {row['importance']:.4f}")
            
            # Model kaydet
            self.save_model()
            
            self.is_trained = True
            
            return {
                'validation_scores': validation_scores,
                'feature_importance': feature_importance.to_dict('records'),
                'training_date': datetime.now().isoformat(),
                'feature_count': len(self.feature_names),
                'calibration': {
                    'method': 'isotonic/sigmoid',
                    'best_threshold': self.best_threshold,
                    'val_precision': best.get('precision'),
                    'val_recall': best.get('recall'),
                    'val_f1': best.get('f1')
                }
            }
            
        except Exception as e:
            logger.error(f"Model eğitimi hatası: {e}")
            return {}
    
    def predict(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Tahmin yap"""
        try:
            if not self.is_trained or self.model is None:
                raise ValueError("Model eğitilmemiş")
            
            # Feature'ları oluştur
            features_df = self.create_features(df)
            X = features_df[self.feature_names].iloc[-1:].fillna(0)
            
            # Tahmin (kalibre edilmiş olasılık ve optimize eşik)
            if self.calibrator:
                probability = float(self.calibrator.predict_proba(X)[0][1])
            else:
                probability = float(self.model.predict_proba(X)[0][1])
            prediction = 1 if probability >= self.best_threshold else 0
            
            return prediction, probability
            
        except Exception as e:
            logger.error(f"Tahmin hatası: {e}")
            return 0, 0.0
    
    def save_model(self):
        """Modeli kaydet"""
        try:
            import os
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'feature_names': self.feature_names,
                'params': self.params,
                'training_date': datetime.now().isoformat(),
                'best_threshold': self.best_threshold
            }
            
            joblib.dump(model_data, self.model_path)
            logger.info(f"Model kaydedildi: {self.model_path}")
            
        except Exception as e:
            logger.error(f"Model kaydetme hatası: {e}")
    
    def load_model(self):
        """Modeli yükle"""
        try:
            if os.path.exists(self.model_path):
                model_data = joblib.load(self.model_path)
                self.model = model_data['model']
                self.scaler = model_data['scaler']
                self.feature_names = model_data['feature_names']
                self.params = model_data['params']
                self.is_trained = True
                self.best_threshold = float(model_data.get('best_threshold', 0.5))
                # Kalibratörü yeniden inşa etmek için None bırakıyoruz; ihtiyaç halinde tekrar kalibre edilebilir
                logger.info("Model yüklendi")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Model yükleme hatası: {e}")
            return False

# Test fonksiyonu
def test_lightgbm():
    """LightGBM model test"""
    # Örnek veri oluştur
    dates = pd.date_range('2024-01-01', periods=100, freq='D')
    np.random.seed(42)
    
    # Trend + noise
    trend = np.linspace(100, 120, 100)
    noise = np.random.normal(0, 2, 100)
    prices = trend + noise
    
    df = pd.DataFrame({
        'Date': dates,
        'Open': prices * 0.99,
        'High': prices * 1.02,
        'Low': prices * 0.98,
        'Close': prices,
        'Volume': np.random.randint(1000000, 5000000, 100)
    })
    
    print("=== LightGBM Model Test ===")
    print(f"Veri boyutu: {len(df)}")
    
    # Model oluştur ve eğit
    model = LightGBMModel()
    training_results = model.train(df)
    
    if training_results:
        print(f"Eğitim tamamlandı!")
        print(f"Validation AUC: {training_results['validation_scores']['avg_auc']:.4f}")
        print(f"Feature sayısı: {training_results['feature_count']}")
        
        # Tahmin test
        prediction, probability = model.predict(df)
        print(f"Son tahmin: {prediction} (probability: {probability:.4f})")
        
        return model
    else:
        print("Eğitim başarısız!")
        return None

if __name__ == "__main__":
    test_lightgbm()
