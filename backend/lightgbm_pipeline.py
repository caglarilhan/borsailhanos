"""
🤖 LightGBM Pipeline - BIST AI Smart Trader
Günlük tahmin için LightGBM ensemble modeli
Walk-Forward CV ile overfitting önleme
"""

import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import joblib
import os
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score
import lightgbm as lgb

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LightGBMPipeline:
    """
    LightGBM tabanlı günlük tahmin pipeline'ı
    Walk-Forward CV ile robust model eğitimi
    """
    
    def __init__(self, model_path: str = "models/lightgbm_ensemble.pkl"):
        self.model_path = model_path
        self.model = None
        self.feature_names = []
        self.is_trained = False
        
        # Model parametreleri
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
        
        # CV parametreleri
        self.cv_params = {
            'n_splits': 5,
            'test_size': 0.2,
            'gap': 5  # Test ve train arasında 5 gün boşluk
        }
        
        # Model performans metrikleri
        self.performance_metrics = {
            'train_auc': 0.0,
            'val_auc': 0.0,
            'test_auc': 0.0,
            'precision': 0.0,
            'recall': 0.0,
            'f1': 0.0,
            'last_training_date': None
        }
        
        logger.info("🤖 LightGBM Pipeline başlatıldı")
    
    def prepare_features(self, data: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Feature hazırlama ve target oluşturma
        
        Args:
            data: Ham fiyat ve teknik indikatör verisi
            
        Returns:
            X: Feature matrix
            y: Target vector (1: yukarı, 0: aşağı)
        """
        try:
            logger.info("🔧 Feature hazırlama başlıyor...")
            
            # Teknik indikatörler
            features = pd.DataFrame()
            
            # Price-based features
            features['price_change'] = data['Close'].pct_change()
            features['price_change_2d'] = data['Close'].pct_change(2)
            features['price_change_5d'] = data['Close'].pct_change(5)
            
            # Volume features
            features['volume_change'] = data['Volume'].pct_change()
            features['volume_ma_ratio'] = data['Volume'] / data['Volume'].rolling(20).mean()
            
            # Moving averages
            features['ma_5_20'] = data['Close'].rolling(5).mean() / data['Close'].rolling(20).mean()
            features['ma_10_50'] = data['Close'].rolling(10).mean() / data['Close'].rolling(50).mean()
            
            # RSI-like features
            delta = data['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            features['rsi_ratio'] = gain / (gain + loss + 1e-8)
            
            # Bollinger Bands
            bb_ma = data['Close'].rolling(20).mean()
            bb_std = data['Close'].rolling(20).std()
            features['bb_position'] = (data['Close'] - bb_ma) / (bb_std + 1e-8)
            
            # Momentum features
            features['momentum_5d'] = data['Close'] / data['Close'].shift(5) - 1
            features['momentum_10d'] = data['Close'] / data['Close'].shift(10) - 1
            
            # Volatility features
            features['volatility_5d'] = data['Close'].pct_change().rolling(5).std()
            features['volatility_20d'] = data['Close'].pct_change().rolling(20).std()
            
            # Target: 1 gün sonraki fiyat yönü
            y = (data['Close'].shift(-1) > data['Close']).astype(int)
            
            # NaN değerleri temizle
            features = features.dropna()
            y = y[features.index]
            
            # Feature names kaydet
            self.feature_names = features.columns.tolist()
            
            logger.info(f"✅ {len(features.columns)} feature hazırlandı, {len(features)} örnek")
            logger.info(f"📊 Target dağılımı: {y.value_counts().to_dict()}")
            
            return features, y
            
        except Exception as e:
            logger.error(f"❌ Feature hazırlama hatası: {e}")
            raise
    
    def create_walk_forward_splits(self, data: pd.DataFrame, target: pd.Series) -> List[Tuple]:
        """
        Walk-Forward CV için zaman serisi split'leri oluştur
        
        Args:
            data: Feature matrix
            target: Target vector
            
        Returns:
            List of (train_idx, val_idx, test_idx) tuples
        """
        try:
            logger.info("🔄 Walk-Forward CV split'leri oluşturuluyor...")
            
            splits = []
            n_samples = len(data)
            test_size = int(n_samples * self.cv_params['test_size'])
            gap = self.cv_params['gap']
            
            for i in range(self.cv_params['n_splits']):
                # Test seti son kısımdan
                test_end = n_samples - (i * test_size)
                test_start = test_end - test_size
                
                # Validation seti test'ten önce
                val_end = test_start - gap
                val_start = val_end - test_size
                
                # Train seti validation'dan önce
                train_end = val_start - gap
                train_start = 0
                
                if train_start < train_end < val_start < val_end < test_start < test_end:
                    splits.append((
                        (train_start, train_end),
                        (val_start, val_end),
                        (test_start, test_end)
                    ))
            
            logger.info(f"✅ {len(splits)} Walk-Forward split oluşturuldu")
            return splits
            
        except Exception as e:
            logger.error(f"❌ Walk-Forward split hatası: {e}")
            raise
    
    def train_model(self, data: pd.DataFrame, target: pd.Series) -> Dict:
        """
        LightGBM modelini Walk-Forward CV ile eğit
        
        Args:
            data: Feature matrix
            target: Target vector
            
        Returns:
            Training results dictionary
        """
        try:
            logger.info("🚀 LightGBM model eğitimi başlıyor...")
            
            # Feature hazırla
            features, y = self.prepare_features(data)
            
            # Walk-Forward splits oluştur
            splits = self.create_walk_forward_splits(features, y)
            
            # CV sonuçları
            cv_results = {
                'fold': [],
                'train_auc': [],
                'val_auc': [],
                'test_auc': [],
                'precision': [],
                'recall': [],
                'f1': []
            }
            
            # Her fold için model eğit
            models = []
            for fold, (train_range, val_range, test_range) in enumerate(splits):
                logger.info(f"🔄 Fold {fold + 1}/{len(splits)} eğitiliyor...")
                
                # Split data
                train_start, train_end = train_range
                val_start, val_end = val_range
                test_start, test_end = test_range
                
                X_train = features.iloc[train_start:train_end]
                y_train = y.iloc[train_start:train_end]
                X_val = features.iloc[val_start:val_end]
                y_val = y.iloc[val_start:val_end]
                X_test = features.iloc[test_start:test_end]
                y_test = y.iloc[test_start:test_end]
                
                # LightGBM dataset
                train_data = lgb.Dataset(X_train, label=y_train)
                val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
                
                # Model eğit
                model = lgb.train(
                    self.params,
                    train_data,
                    valid_sets=[val_data],
                    num_boost_round=1000,
                    callbacks=[lgb.early_stopping(50), lgb.log_evaluation(False)]
                )
                
                # Predictions
                train_pred = model.predict(X_train)
                val_pred = model.predict(X_val)
                test_pred = model.predict(X_test)
                
                # Metrics
                train_auc = roc_auc_score(y_train, train_pred)
                val_auc = roc_auc_score(y_val, val_pred)
                test_auc = roc_auc_score(y_test, test_pred)
                
                # Binary predictions için threshold
                threshold = 0.5
                test_pred_binary = (test_pred > threshold).astype(int)
                
                precision = precision_score(y_test, test_pred_binary, zero_division=0)
                recall = recall_score(y_test, test_pred_binary, zero_division=0)
                f1 = f1_score(y_test, test_pred_binary, zero_division=0)
                
                # Sonuçları kaydet
                cv_results['fold'].append(fold + 1)
                cv_results['train_auc'].append(train_auc)
                cv_results['val_auc'].append(val_auc)
                cv_results['test_auc'].append(test_auc)
                cv_results['precision'].append(precision)
                cv_results['recall'].append(recall)
                cv_results['f1'].append(f1)
                
                models.append(model)
                
                logger.info(f"  Fold {fold + 1}: Train AUC={train_auc:.3f}, Val AUC={val_auc:.3f}, Test AUC={test_auc:.3f}")
            
            # Final model: tüm veri ile eğit
            logger.info("🎯 Final model tüm veri ile eğitiliyor...")
            final_train_data = lgb.Dataset(features, label=y)
            
            self.model = lgb.train(
                self.params,
                final_train_data,
                num_boost_round=1000,
                callbacks=[lgb.log_evaluation(False)]
            )
            
            # Final model performansı
            final_pred = self.model.predict(features)
            final_auc = roc_auc_score(y, final_pred)
            
            # Performance metrics güncelle
            self.performance_metrics.update({
                'train_auc': np.mean(cv_results['train_auc']),
                'val_auc': np.mean(cv_results['val_auc']),
                'test_auc': np.mean(cv_results['test_auc']),
                'precision': np.mean(cv_results['precision']),
                'recall': np.mean(cv_results['recall']),
                'f1': np.mean(cv_results['f1']),
                'last_training_date': datetime.now().isoformat()
            })
            
            self.is_trained = True
            
            # Model kaydet
            self.save_model()
            
            logger.info("✅ LightGBM model eğitimi tamamlandı!")
            logger.info(f"📊 Final AUC: {final_auc:.3f}")
            logger.info(f"📊 CV Test AUC: {self.performance_metrics['test_auc']:.3f}")
            
            return {
                'cv_results': cv_results,
                'final_auc': final_auc,
                'performance_metrics': self.performance_metrics
            }
            
        except Exception as e:
            logger.error(f"❌ Model eğitim hatası: {e}")
            raise
    
    def predict(self, features: pd.DataFrame) -> np.ndarray:
        """
        Yeni veri için tahmin yap
        
        Args:
            features: Feature matrix
            
        Returns:
            Prediction probabilities
        """
        if not self.is_trained or self.model is None:
            raise ValueError("Model henüz eğitilmedi!")
        
        try:
            # Feature names kontrol et
            if list(features.columns) != self.feature_names:
                logger.warning("⚠️ Feature names uyuşmuyor, yeniden düzenleniyor...")
                features = features[self.feature_names]
            
            # Tahmin
            predictions = self.model.predict(features)
            
            logger.info(f"✅ {len(features)} örnek için tahmin tamamlandı")
            return predictions
            
        except Exception as e:
            logger.error(f"❌ Tahmin hatası: {e}")
            raise
    
    def get_feature_importance(self, top_n: int = 10) -> pd.DataFrame:
        """
        Feature importance'ları getir
        
        Args:
            top_n: Top N feature sayısı
            
        Returns:
            Feature importance DataFrame
        """
        if not self.is_trained or self.model is None:
            raise ValueError("Model henüz eğitilmedi!")
        
        try:
            importance = self.model.feature_importance(importance_type='gain')
            feature_imp = pd.DataFrame({
                'feature': self.feature_names,
                'importance': importance
            }).sort_values('importance', ascending=False)
            
            return feature_imp.head(top_n)
            
        except Exception as e:
            logger.error(f"❌ Feature importance hatası: {e}")
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
            model_data = {
                'model': self.model,
                'feature_names': self.feature_names,
                'params': self.params,
                'performance_metrics': self.performance_metrics,
                'is_trained': self.is_trained
            }
            
            joblib.dump(model_data, save_path)
            logger.info(f"✅ Model kaydedildi: {save_path}")
            
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
            model_data = joblib.load(load_path)
            
            self.model = model_data['model']
            self.feature_names = model_data['feature_names']
            self.params = model_data['params']
            self.performance_metrics = model_data['performance_metrics']
            self.is_trained = model_data['is_trained']
            
            logger.info(f"✅ Model yüklendi: {load_path}")
            logger.info(f"📊 Son eğitim: {self.performance_metrics['last_training_date']}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Model yükleme hatası: {e}")
            return False
    
    def get_model_status(self) -> Dict:
        """Model durumunu getir"""
        return {
            'is_trained': self.is_trained,
            'feature_count': len(self.feature_names),
            'performance_metrics': self.performance_metrics,
            'model_path': self.model_path
        }

# Test fonksiyonu
def test_lightgbm_pipeline():
    """LightGBM pipeline test fonksiyonu"""
    
    print("🤖 LightGBM Pipeline Test Başlıyor...")
    
    try:
        # Test verisi oluştur
        dates = pd.date_range('2023-01-01', '2024-01-01', freq='D')
        np.random.seed(42)
        
        test_data = pd.DataFrame({
            'Date': dates,
            'Open': np.random.uniform(100, 200, len(dates)),
            'High': np.random.uniform(100, 200, len(dates)),
            'Low': np.random.uniform(100, 200, len(dates)),
            'Close': np.random.uniform(100, 200, len(dates)),
            'Volume': np.random.uniform(1000000, 5000000, len(dates))
        })
        
        # Pipeline oluştur
        pipeline = LightGBMPipeline()
        
        # Model eğit
        results = pipeline.train_model(test_data, test_data['Close'])
        
        # Model durumu
        status = pipeline.get_model_status()
        print(f"\n📊 Model Durumu:")
        print(f"  Eğitildi: {status['is_trained']}")
        print(f"  Feature Sayısı: {status['feature_count']}")
        print(f"  Test AUC: {status['performance_metrics']['test_auc']:.3f}")
        
        # Feature importance
        importance = pipeline.get_feature_importance(5)
        print(f"\n🏆 Top 5 Feature Importance:")
        print(importance)
        
        return results
        
    except Exception as e:
        print(f"❌ Test hatası: {e}")
        return None

if __name__ == "__main__":
    # Test çalıştır
    test_lightgbm_pipeline()
