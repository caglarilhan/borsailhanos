#!/usr/bin/env python3
"""
Advanced Feature Engineering Module
Gelişmiş özellik mühendisliği modülü
"""

import pandas as pd
import numpy as np
import ta
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class AdvancedFeatureEngineer:
    """Gelişmiş özellik mühendisliği sınıfı"""
    
    def __init__(self):
        """Constructor"""
        self.feature_cache = {}
        self.feature_stats = {}
        
    def calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Teknik indikatörleri hesapla"""
        try:
            # TA-Lib yerine ta kütüphanesi kullan
            # Trend indikatörleri
            df['sma_20'] = ta.trend.sma_indicator(df['Close'], window=20)
            df['sma_50'] = ta.trend.sma_indicator(df['Close'], window=50)
            df['ema_12'] = ta.trend.ema_indicator(df['Close'], window=12)
            df['ema_26'] = ta.trend.ema_indicator(df['Close'], window=26)
            
            # Momentum indikatörleri
            df['rsi'] = ta.momentum.rsi(df['Close'], window=14)
            df['stoch'] = ta.momentum.stoch(df['High'], df['Low'], df['Close'], window=14)
            df['williams_r'] = ta.momentum.williams_r(df['High'], df['Low'], df['Close'], window=14)
            
            # Volatilite indikatörleri
            df['bb_upper'], df['bb_middle'], df['bb_lower'] = ta.volatility.bollinger_bands(df['Close'], window=20)
            df['atr'] = ta.volatility.average_true_range(df['High'], df['Low'], df['Close'], window=14)
            
            # Hacim indikatörleri
            df['obv'] = ta.volume.on_balance_volume(df['Close'], df['Volume'])
            df['vwap'] = ta.volume.volume_weighted_average_price(df['High'], df['Low'], df['Close'], df['Volume'])
            
            logger.info(f"Teknik indikatörler hesaplandı: {len(df.columns)} özellik")
            return df
            
        except Exception as e:
            logger.error(f"Teknik indikatör hesaplama hatası: {e}")
            return df
    
    def calculate_advanced_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Gelişmiş özellikleri hesapla"""
        try:
            # Fiyat değişim oranları
            df['price_change'] = df['Close'].pct_change()
            df['price_change_5d'] = df['Close'].pct_change(periods=5)
            df['price_change_20d'] = df['Close'].pct_change(periods=20)
            
            # Volatilite özellikleri
            df['volatility_20d'] = df['price_change'].rolling(window=20).std()
            df['volatility_60d'] = df['price_change'].rolling(window=60).std()
            
            # Hacim özellikleri
            df['volume_sma_20'] = df['Volume'].rolling(window=20).mean()
            df['volume_ratio'] = df['Volume'] / df['volume_sma_20']
            
            # Momentum özellikleri
            df['momentum_5d'] = df['Close'] / df['Close'].shift(5) - 1
            df['momentum_20d'] = df['Close'] / df['Close'].shift(20) - 1
            
            # Trend gücü
            df['trend_strength'] = abs(df['sma_20'] - df['sma_50']) / df['sma_50']
            
            logger.info(f"Gelişmiş özellikler hesaplandı: {len(df.columns)} özellik")
            return df
            
        except Exception as e:
            logger.error(f"Gelişmiş özellik hesaplama hatası: {e}")
            return df
    
    def create_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Etkileşim özellikleri oluştur"""
        try:
            # Fiyat-hacim etkileşimi
            df['price_volume_interaction'] = df['price_change'] * df['volume_ratio']
            
            # Trend-momentum etkileşimi
            df['trend_momentum_interaction'] = df['trend_strength'] * df['momentum_20d']
            
            # Volatilite-momentum etkileşimi
            df['volatility_momentum_interaction'] = df['volatility_20d'] * df['momentum_5d']
            
            # RSI-trend etkileşimi
            df['rsi_trend_interaction'] = df['rsi'] * df['trend_strength']
            
            logger.info(f"Etkileşim özellikleri oluşturuldu: {len(df.columns)} özellik")
            return df
            
        except Exception as e:
            logger.error(f"Etkileşim özelliği oluşturma hatası: {e}")
            return df
    
    def create_lag_features(self, df: pd.DataFrame, lags: List[int] = [1, 2, 3, 5, 10]) -> pd.DataFrame:
        """Gecikme özellikleri oluştur"""
        try:
            for lag in lags:
                df[f'price_lag_{lag}'] = df['Close'].shift(lag)
                df[f'volume_lag_{lag}'] = df['Volume'].shift(lag)
                df[f'rsi_lag_{lag}'] = df['rsi'].shift(lag)
                
            logger.info(f"Gecikme özellikleri oluşturuldu: {len(lags)} gecikme")
            return df
            
        except Exception as e:
            logger.error(f"Gecikme özelliği oluşturma hatası: {e}")
            return df
    
    def create_rolling_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Rolling window özellikleri oluştur"""
        try:
            # Rolling ortalamalar
            for window in [5, 10, 20, 50]:
                df[f'price_ma_{window}'] = df['Close'].rolling(window=window).mean()
                df[f'volume_ma_{window}'] = df['Volume'].rolling(window=window).mean()
                df[f'rsi_ma_{window}'] = df['rsi'].rolling(window=window).mean()
            
            # Rolling standart sapmalar
            for window in [5, 10, 20]:
                df[f'price_std_{window}'] = df['Close'].rolling(window=window).std()
                df[f'volume_std_{window}'] = df['Volume'].rolling(window=window).std()
            
            # Rolling min/max
            for window in [5, 10, 20]:
                df[f'price_max_{window}'] = df['Close'].rolling(window=window).max()
                df[f'price_min_{window}'] = df['Close'].rolling(window=window).min()
                
            logger.info(f"Rolling özellikleri oluşturuldu")
            return df
            
        except Exception as e:
            logger.error(f"Rolling özelliği oluşturma hatası: {e}")
            return df
    
    def engineer_all_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Tüm özellikleri mühendislik et"""
        try:
            logger.info("Özellik mühendisliği başlıyor...")
            
            # Sırayla özellikleri ekle
            df = self.calculate_technical_indicators(df)
            df = self.calculate_advanced_features(df)
            df = self.create_interaction_features(df)
            df = self.create_lag_features(df)
            df = self.create_rolling_features(df)
            
            # NaN değerleri temizle
            df = df.dropna()
            
            logger.info(f"Özellik mühendisliği tamamlandı: {len(df.columns)} özellik, {len(df)} satır")
            return df
            
        except Exception as e:
            logger.error(f"Özellik mühendisliği hatası: {e}")
            return df
    
    def get_feature_importance(self, df: pd.DataFrame, target_col: str = 'price_change') -> Dict[str, float]:
        """Özellik önemini hesapla"""
        try:
            from sklearn.ensemble import RandomForestRegressor
            from sklearn.preprocessing import StandardScaler
            
            # Hedef değişkeni hazırla
            target = df[target_col].shift(-1).dropna()
            features = df.drop([target_col], axis=1, errors='ignore').iloc[:-1]
            
            # NaN değerleri temizle
            common_idx = target.index.intersection(features.index)
            target = target.loc[common_idx]
            features = features.loc[common_idx]
            
            # Sayısal sütunları seç
            numeric_features = features.select_dtypes(include=[np.number])
            
            if len(numeric_features.columns) == 0:
                logger.warning("Sayısal özellik bulunamadı")
                return {}
            
            # NaN değerleri doldur
            numeric_features = numeric_features.fillna(0)
            
            # Standardize et
            scaler = StandardScaler()
            features_scaled = scaler.fit_transform(numeric_features)
            
            # Random Forest ile özellik önemini hesapla
            rf = RandomForestRegressor(n_estimators=100, random_state=42)
            rf.fit(features_scaled, target)
            
            # Özellik önemini sözlük olarak döndür
            feature_importance = dict(zip(numeric_features.columns, rf.feature_importances_))
            
            # Önem sırasına göre sırala
            feature_importance = dict(sorted(feature_importance.items(), 
                                          key=lambda x: x[1], reverse=True))
            
            logger.info(f"Özellik önem hesaplandı: {len(feature_importance)} özellik")
            return feature_importance
            
        except Exception as e:
            logger.error(f"Özellik önem hesaplama hatası: {e}")
            return {}
    
    def get_feature_correlation(self, df: pd.DataFrame, target_col: str = 'price_change') -> Dict[str, float]:
        """Özellik korelasyonunu hesapla"""
        try:
            # Sayısal sütunları seç
            numeric_df = df.select_dtypes(include=[np.number])
            
            if target_col not in numeric_df.columns:
                logger.warning(f"Hedef sütun {target_col} bulunamadı")
                return {}
            
            # Korelasyon hesapla
            correlations = numeric_df.corr()[target_col].abs().sort_values(ascending=False)
            
            # Kendisi hariç en yüksek korelasyonları al
            correlations = correlations[correlations.index != target_col]
            
            logger.info(f"Özellik korelasyon hesaplandı: {len(correlations)} özellik")
            return correlations.to_dict()
            
        except Exception as e:
            logger.error(f"Özellik korelasyon hesaplama hatası: {e}")
            return {}
    
    def get_feature_summary(self, df: pd.DataFrame) -> Dict:
        """Özellik özeti al"""
        try:
            summary = {
                'total_features': len(df.columns),
                'total_rows': len(df),
                'numeric_features': len(df.select_dtypes(include=[np.number]).columns),
                'categorical_features': len(df.select_dtypes(include=['object']).columns),
                'missing_values': df.isnull().sum().sum(),
                'duplicate_rows': df.duplicated().sum()
            }
            
            logger.info(f"Özellik özeti alındı: {summary}")
            return summary
            
        except Exception as e:
            logger.error(f"Özellik özet alma hatası: {e}")
            return {}
