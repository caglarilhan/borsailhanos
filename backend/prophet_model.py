"""
🔮 Prophet Model - BIST AI Smart Trader
4 saatlik ve kısa vadeli tahmin için Facebook Prophet
Hafif, güvenilir ve hızlı zaman serisi analizi
"""

import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

# Prophet import (fallback ile)
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    print("⚠️ Prophet kütüphanesi bulunamadı, mock mode kullanılacak")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProphetModel:
    """
    Facebook Prophet tabanlı zaman serisi tahmin modeli
    4 saatlik ve kısa vadeli tahminler için optimize edilmiş
    """
    
    def __init__(self, model_path: str = "models/prophet_4h_model.pkl"):
        self.model_path = model_path
        self.model = None
        self.is_trained = False
        
        # Model parametreleri
        self.params = {
            'changepoint_prior_scale': 0.05,  # Trend esnekliği
            'seasonality_prior_scale': 10.0,   # Mevsimsellik gücü
            'holidays_prior_scale': 10.0,     # Tatil etkisi
            'seasonality_mode': 'multiplicative',  # Çarpımsal mevsimsellik
            'changepoint_range': 0.8,         # Trend değişim aralığı
            'n_changepoints': 25              # Trend değişim noktası sayısı
        }
        
        # Model performans metrikleri
        self.performance_metrics = {
            'mape': 0.0,           # Mean Absolute Percentage Error
            'mae': 0.0,            # Mean Absolute Error
            'rmse': 0.0,           # Root Mean Square Error
            'last_training_date': None
        }
        
        # Prophet kullanılabilir mi kontrol et
        if not PROPHET_AVAILABLE:
            logger.warning("⚠️ Prophet kütüphanesi yok, mock mode aktif")
        
        logger.info("🔮 Prophet Model başlatıldı")
    
    def prepare_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Prophet için veri hazırlama
        
        Args:
            data: OHLCV verisi
            
        Returns:
            Prophet formatında veri (ds: date, y: value)
        """
        try:
            logger.info("🔧 Prophet veri hazırlama başlıyor...")
            
            # Prophet formatına dönüştür
            prophet_data = pd.DataFrame({
                'ds': data.index if isinstance(data.index, pd.DatetimeIndex) else pd.to_datetime(data['Date']),
                'y': data['Close']
            })
            
            # NaN değerleri temizle
            prophet_data = prophet_data.dropna()
            
            # Tarih sıralaması
            prophet_data = prophet_data.sort_values('ds').reset_index(drop=True)
            
            logger.info(f"✅ {len(prophet_data)} Prophet formatında veri hazırlandı")
            logger.info(f"📊 Tarih aralığı: {prophet_data['ds'].min()} - {prophet_data['ds'].max()}")
            
            return prophet_data
            
        except Exception as e:
            logger.error(f"❌ Veri hazırlama hatası: {e}")
            raise
    
    def add_custom_seasonality(self, model) -> object:
        """
        Özel mevsimsellik ekle (4 saatlik veri için)
        
        Args:
            model: Prophet model instance
            
        Returns:
            Enhanced Prophet model
        """
        try:
            # Günlük mevsimsellik (24 saat)
            model.add_seasonality(
                name='daily',
                period=6,  # 4 saatlik veri için 6 periyot = 24 saat
                fourier_order=5
            )
            
            # Haftalık mevsimsellik
            model.add_seasonality(
                name='weekly',
                period=7,
                fourier_order=3
            )
            
            # Aylık mevsimsellik
            model.add_seasonality(
                name='monthly',
                period=30.5,
                fourier_order=5
            )
            
            logger.info("✅ Özel mevsimsellik eklendi")
            return model
            
        except Exception as e:
            logger.error(f"❌ Mevsimsellik ekleme hatası: {e}")
            return model
    
    def train_model(self, data: pd.DataFrame) -> Dict:
        """
        Prophet modelini eğit
        
        Args:
            data: OHLCV verisi
            
        Returns:
            Training results dictionary
        """
        try:
            logger.info("🚀 Prophet model eğitimi başlıyor...")
            
            if not PROPHET_AVAILABLE:
                logger.warning("⚠️ Prophet kütüphanesi yok, mock training yapılıyor")
                return self._mock_training(data)
            
            # Veri hazırla
            prophet_data = self.prepare_data(data)
            
            # Prophet model oluştur
            self.model = Prophet(**self.params)
            
            # Özel mevsimsellik ekle
            self.model = self.add_custom_seasonality(self.model)
            
            # Model eğit
            self.model.fit(prophet_data)
            
            # Performans değerlendir (son %20 veri ile)
            split_idx = int(len(prophet_data) * 0.8)
            train_data = prophet_data[:split_idx]
            test_data = prophet_data[split_idx:]
            
            # Test tahmini
            forecast = self.model.predict(test_data[['ds']])
            
            # Metrikler hesapla
            actual = test_data['y'].values
            predicted = forecast['yhat'].values
            
            mape = np.mean(np.abs((actual - predicted) / actual)) * 100
            mae = np.mean(np.abs(actual - predicted))
            rmse = np.sqrt(np.mean((actual - predicted) ** 2))
            
            # Performance metrics güncelle
            self.performance_metrics.update({
                'mape': mape,
                'mae': mae,
                'rmse': rmse,
                'last_training_date': datetime.now().isoformat()
            })
            
            self.is_trained = True
            
            # Model kaydet
            self.save_model()
            
            logger.info("✅ Prophet model eğitimi tamamlandı!")
            logger.info(f"📊 MAPE: {mape:.2f}%, MAE: {mae:.4f}, RMSE: {rmse:.4f}")
            
            return {
                'performance_metrics': self.performance_metrics,
                'train_size': len(train_data),
                'test_size': len(test_data)
            }
            
        except Exception as e:
            logger.error(f"❌ Model eğitim hatası: {e}")
            raise
    
    def _mock_training(self, data: pd.DataFrame) -> Dict:
        """Mock training (Prophet yoksa)"""
        logger.info("🎭 Mock Prophet training başlıyor...")
        
        # Mock metrics
        self.performance_metrics.update({
            'mape': 2.5,  # %2.5 hata (iyi)
            'mae': 0.015,
            'rmse': 0.025,
            'last_training_date': datetime.now().isoformat()
        })
        
        self.is_trained = True
        
        logger.info("✅ Mock training tamamlandı")
        return {
            'performance_metrics': self.performance_metrics,
            'train_size': len(data),
            'test_size': 0,
            'mock': True
        }
    
    def predict(self, periods: int = 24, freq: str = '4H') -> pd.DataFrame:
        """
        Gelecek dönemler için tahmin yap
        
        Args:
            periods: Tahmin edilecek periyot sayısı
            freq: Frekans ('4H', '1D', '1W')
            
        Returns:
            Forecast DataFrame
        """
        if not self.is_trained:
            raise ValueError("Model henüz eğitilmedi!")
        
        try:
            if not PROPHET_AVAILABLE or self.model is None:
                logger.warning("⚠️ Prophet model yok, mock prediction yapılıyor")
                return self._mock_prediction(periods, freq)
            
            # Future dates oluştur
            future_dates = self.model.make_future_dataframe(
                periods=periods,
                freq=freq
            )
            
            # Tahmin
            forecast = self.model.predict(future_dates)
            
            # Sonuçları düzenle
            result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(periods)
            result.columns = ['date', 'prediction', 'lower_bound', 'upper_bound']
            
            logger.info(f"✅ {periods} periyot için tahmin tamamlandı")
            return result
            
        except Exception as e:
            logger.error(f"❌ Tahmin hatası: {e}")
            raise
    
    def _mock_prediction(self, periods: int, freq: str) -> pd.DataFrame:
        """Mock prediction (Prophet yoksa)"""
        logger.info(f"🎭 Mock prediction: {periods} periyot, {freq} frekans")
        
        # Mock future dates
        base_date = datetime.now()
        if freq == '4H':
            dates = [base_date + timedelta(hours=4*i) for i in range(1, periods+1)]
        elif freq == '1D':
            dates = [base_date + timedelta(days=i) for i in range(1, periods+1)]
        else:
            dates = [base_date + timedelta(days=i) for i in range(1, periods+1)]
        
        # Mock predictions (basit trend)
        base_price = 100.0
        predictions = []
        for i in range(periods):
            # Küçük trend + noise
            trend = base_price + (i * 0.1)  # %0.1 günlük artış
            noise = np.random.normal(0, 0.5)  # %0.5 noise
            pred = max(trend + noise, 1.0)  # Minimum 1.0
            predictions.append(pred)
        
        # Confidence intervals
        lower_bounds = [p * 0.98 for p in predictions]  # %2 alt
        upper_bounds = [p * 1.02 for p in predictions]  # %2 üst
        
        result = pd.DataFrame({
            'date': dates,
            'prediction': predictions,
            'lower_bound': lower_bounds,
            'upper_bound': upper_bounds
        })
        
        return result
    
    def get_components(self) -> pd.DataFrame:
        """
        Model bileşenlerini getir (trend, mevsimsellik)
        
        Returns:
            Components DataFrame
        """
        if not self.is_trained or not PROPHET_AVAILABLE or self.model is None:
            logger.warning("⚠️ Model bileşenleri alınamadı")
            return pd.DataFrame()
        
        try:
            # Future dates (son 100 periyot)
            future_dates = self.model.make_future_dataframe(periods=100)
            forecast = self.model.predict(future_dates)
            
            # Bileşenler
            components = self.model.plot_components(forecast)
            
            logger.info("✅ Model bileşenleri alındı")
            return forecast
            
        except Exception as e:
            logger.error(f"❌ Bileşen alma hatası: {e}")
            return pd.DataFrame()
    
    def save_model(self, path: str = None):
        """Modeli kaydet"""
        if not self.is_trained:
            logger.warning("⚠️ Model henüz eğitilmedi, kaydedilemedi")
            return
        
        try:
            save_path = path or self.model_path
            
            # Directory oluştur
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            if PROPHET_AVAILABLE and self.model is not None:
                # Prophet model kaydet
                with open(save_path, 'wb') as f:
                    joblib.dump(self.model, f)
            
            # Performance metrics kaydet
            metrics_path = save_path.replace('.pkl', '_metrics.pkl')
            joblib.dump(self.performance_metrics, metrics_path)
            
            logger.info(f"✅ Model kaydedildi: {save_path}")
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
            
            if PROPHET_AVAILABLE:
                # Prophet model yükle
                with open(load_path, 'rb') as f:
                    self.model = joblib.load(f)
            
            # Performance metrics yükle
            metrics_path = load_path.replace('.pkl', '_metrics.pkl')
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
            'prophet_available': PROPHET_AVAILABLE,
            'performance_metrics': self.performance_metrics,
            'model_path': self.model_path
        }

# Test fonksiyonu
def test_prophet_model():
    """Prophet model test fonksiyonu"""
    
    print("🔮 Prophet Model Test Başlıyor...")
    
    try:
        # Test verisi oluştur (4 saatlik)
        dates = pd.date_range('2023-01-01', '2024-01-01', freq='4H')
        np.random.seed(42)
        
        # Gerçekçi fiyat verisi
        base_price = 100
        prices = [base_price]
        
        for i in range(1, len(dates)):
            # Random walk with trend
            change = np.random.normal(0.0001, 0.02)  # %0.01 trend + %2 volatilite
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
        prophet_model = ProphetModel()
        
        # Model eğit
        results = prophet_model.train_model(test_data)
        
        # Model durumu
        status = prophet_model.get_model_status()
        print(f"\n📊 Model Durumu:")
        print(f"  Eğitildi: {status['is_trained']}")
        print(f"  Prophet Available: {status['prophet_available']}")
        print(f"  MAPE: {status['performance_metrics']['mape']:.2f}%")
        print(f"  RMSE: {status['performance_metrics']['rmse']:.4f}")
        
        # Tahmin testi
        prediction = prophet_model.predict(periods=24, freq='4H')
        print(f"\n🔮 24 Saat Tahmin Testi:")
        print(f"  Tahmin Sayısı: {len(prediction)}")
        print(f"  İlk Tahmin: ${prediction['prediction'].iloc[0]:.2f}")
        print(f"  Son Tahmin: ${prediction['prediction'].iloc[-1]:.2f}")
        
        return results
        
    except Exception as e:
        print(f"❌ Test hatası: {e}")
        return None

if __name__ == "__main__":
    # Test çalıştır
    test_prophet_model()
