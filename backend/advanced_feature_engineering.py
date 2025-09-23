#!/usr/bin/env python3
"""
🔧 ADVANCED FEATURE ENGINEERING
Advanced feature extraction and engineering for trading signals
"""

import numpy as np
import pandas as pd
import yfinance as yf
import logging
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
from scipy import stats
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.decomposition import PCA, FastICA
from sklearn.feature_selection import SelectKBest, f_regression
import warnings

warnings.filterwarnings("ignore")

logger = logging.getLogger(__name__)

class AdvancedFeatureEngineering:
    """Gelişmiş özellik mühendisliği"""
    
    def __init__(self):
        self.history_days = 252  # 1 yıl
        self.feature_scaler = RobustScaler()
        self.pca_components = 10
        self.ica_components = 8
        
    def _get_historical_data(self, symbol: str, period: str = "1y", interval: str = "1d"):
        """Tarihsel veri al"""
        try:
            data = yf.download(symbol, period=period, interval=interval)
            if data.empty:
                logger.error(f"No data found for {symbol}")
                return None
            return data
        except Exception as e:
            logger.error(f"Error getting data for {symbol}: {e}")
            return None
    
    def extract_technical_features(self, data: pd.DataFrame) -> Dict[str, float]:
        """Teknik analiz özellikleri çıkar"""
        try:
            features = {}
            
            # Price-based features
            features['price_momentum'] = (data['Close'].iloc[-1] - data['Close'].iloc[-20]) / data['Close'].iloc[-20]
            features['price_acceleration'] = features['price_momentum'] - ((data['Close'].iloc[-10] - data['Close'].iloc[-30]) / data['Close'].iloc[-30])
            
            # Volatility features
            returns = data['Close'].pct_change().dropna()
            features['volatility_20d'] = returns.tail(20).std() * np.sqrt(252)
            features['volatility_5d'] = returns.tail(5).std() * np.sqrt(252)
            features['volatility_ratio'] = features['volatility_5d'] / features['volatility_20d'] if features['volatility_20d'] > 0 else 1.0
            
            # Volume features
            if 'Volume' in data.columns:
                features['volume_momentum'] = (data['Volume'].iloc[-1] - data['Volume'].iloc[-20]) / data['Volume'].iloc[-20] if data['Volume'].iloc[-20] > 0 else 0
                features['volume_price_trend'] = np.corrcoef(data['Close'].tail(20), data['Volume'].tail(20))[0, 1] if len(data) >= 20 else 0
            else:
                features['volume_momentum'] = 0
                features['volume_price_trend'] = 0
            
            # Moving averages
            features['sma_20'] = data['Close'].tail(20).mean()
            features['sma_50'] = data['Close'].tail(50).mean() if len(data) >= 50 else data['Close'].mean()
            features['sma_ratio'] = features['sma_20'] / features['sma_50'] if features['sma_50'] > 0 else 1.0
            
            # RSI-like features
            gains = returns[returns > 0].sum()
            losses = abs(returns[returns < 0].sum())
            features['rsi_strength'] = gains / (gains + losses) if (gains + losses) > 0 else 0.5
            
            # Bollinger Bands
            bb_period = 20
            if len(data) >= bb_period:
                sma = data['Close'].tail(bb_period).mean()
                std = data['Close'].tail(bb_period).std()
                upper_band = sma + (2 * std)
                lower_band = sma - (2 * std)
                current_price = data['Close'].iloc[-1]
                features['bb_position'] = (current_price - lower_band) / (upper_band - lower_band) if (upper_band - lower_band) > 0 else 0.5
            else:
                features['bb_position'] = 0.5
            
            # Trend strength
            if len(data) >= 20:
                x = np.arange(20)
                y = data['Close'].tail(20).values
                slope, _, r_value, _, _ = stats.linregress(x, y)
                features['trend_slope'] = slope / data['Close'].iloc[-1]  # Normalized slope
                features['trend_strength'] = abs(r_value)
            else:
                features['trend_slope'] = 0
                features['trend_strength'] = 0
            
            return features
            
        except Exception as e:
            logger.error(f"Technical features extraction error: {e}")
            return {}
    
    def extract_statistical_features(self, data: pd.DataFrame) -> Dict[str, float]:
        """İstatistiksel özellikler çıkar"""
        try:
            features = {}
            returns = data['Close'].pct_change().dropna()
            
            if len(returns) < 10:
                return {}
            
            # Distribution features
            features['skewness'] = stats.skew(returns)
            features['kurtosis'] = stats.kurtosis(returns)
            features['jarque_bera'] = stats.jarque_bera(returns)[0]
            
            # Autocorrelation features
            features['autocorr_1'] = returns.autocorr(lag=1) if len(returns) > 1 else 0
            features['autocorr_5'] = returns.autocorr(lag=5) if len(returns) > 5 else 0
            
            # Regime change features
            features['regime_volatility'] = np.std(returns.tail(10)) / np.std(returns.tail(50)) if len(returns) >= 50 else 1.0
            features['regime_mean'] = np.mean(returns.tail(10)) / np.mean(returns.tail(50)) if len(returns) >= 50 else 1.0
            
            # Extreme value features
            features['extreme_positive'] = np.percentile(returns, 95)
            features['extreme_negative'] = np.percentile(returns, 5)
            features['extreme_ratio'] = abs(features['extreme_positive']) / abs(features['extreme_negative']) if features['extreme_negative'] != 0 else 1.0
            
            # Persistence features
            features['persistence'] = np.corrcoef(returns[:-1], returns[1:])[0, 1] if len(returns) > 1 else 0
            
            return features
            
        except Exception as e:
            logger.error(f"Statistical features extraction error: {e}")
            return {}
    
    def extract_frequency_features(self, data: pd.DataFrame) -> Dict[str, float]:
        """Frekans domain özellikleri çıkar"""
        try:
            features = {}
            returns = data['Close'].pct_change().dropna()
            
            if len(returns) < 50:
                return {}
            
            # FFT features
            fft = np.fft.fft(returns.values)
            power_spectrum = np.abs(fft) ** 2
            
            # Dominant frequency
            freqs = np.fft.fftfreq(len(returns))
            dominant_freq_idx = np.argmax(power_spectrum[1:len(power_spectrum)//2]) + 1
            features['dominant_frequency'] = abs(freqs[dominant_freq_idx])
            
            # Spectral entropy
            normalized_spectrum = power_spectrum / np.sum(power_spectrum)
            features['spectral_entropy'] = -np.sum(normalized_spectrum * np.log(normalized_spectrum + 1e-10))
            
            # High frequency power
            high_freq_mask = np.abs(freqs) > 0.1
            features['high_freq_power'] = np.sum(power_spectrum[high_freq_mask]) / np.sum(power_spectrum)
            
            # Low frequency power
            low_freq_mask = np.abs(freqs) < 0.05
            features['low_freq_power'] = np.sum(power_spectrum[low_freq_mask]) / np.sum(power_spectrum)
            
            return features
            
        except Exception as e:
            logger.error(f"Frequency features extraction error: {e}")
            return {}
    
    def extract_interaction_features(self, features: Dict[str, float]) -> Dict[str, float]:
        """Etkileşim özellikleri çıkar"""
        try:
            interaction_features = {}
            
            # Price-volume interactions
            if 'price_momentum' in features and 'volume_momentum' in features:
                interaction_features['price_volume_interaction'] = features['price_momentum'] * features['volume_momentum']
                interaction_features['price_volume_ratio'] = features['price_momentum'] / (abs(features['volume_momentum']) + 1e-10)
            
            # Volatility-trend interactions
            if 'volatility_20d' in features and 'trend_slope' in features:
                interaction_features['volatility_trend_interaction'] = features['volatility_20d'] * features['trend_slope']
                interaction_features['volatility_trend_ratio'] = features['trend_slope'] / (features['volatility_20d'] + 1e-10)
            
            # RSI-volatility interactions
            if 'rsi_strength' in features and 'volatility_ratio' in features:
                interaction_features['rsi_volatility_interaction'] = features['rsi_strength'] * features['volatility_ratio']
            
            # Bollinger-trend interactions
            if 'bb_position' in features and 'trend_strength' in features:
                interaction_features['bb_trend_interaction'] = features['bb_position'] * features['trend_strength']
            
            # Statistical interactions
            if 'skewness' in features and 'kurtosis' in features:
                interaction_features['skewness_kurtosis_interaction'] = features['skewness'] * features['kurtosis']
            
            return interaction_features
            
        except Exception as e:
            logger.error(f"Interaction features extraction error: {e}")
            return {}
    
    def apply_dimensionality_reduction(self, features: Dict[str, float]) -> Dict[str, float]:
        """Boyut azaltma uygula"""
        try:
            # Convert features to array
            feature_names = list(features.keys())
            feature_values = np.array(list(features.values())).reshape(1, -1)
            
            if len(feature_values[0]) < 2:
                return features
            
            # Standardize features
            standardized_features = self.feature_scaler.fit_transform(feature_values)
            
            # PCA
            if len(feature_values[0]) >= self.pca_components:
                pca = PCA(n_components=self.pca_components)
                pca_features = pca.fit_transform(standardized_features)
                
                pca_features_dict = {}
                for i in range(self.pca_components):
                    pca_features_dict[f'pca_component_{i+1}'] = pca_features[0, i]
                
                # Add explained variance ratio
                for i, ratio in enumerate(pca.explained_variance_ratio_):
                    pca_features_dict[f'pca_variance_ratio_{i+1}'] = ratio
                
                features.update(pca_features_dict)
            
            # ICA
            if len(feature_values[0]) >= self.ica_components:
                ica = FastICA(n_components=self.ica_components, random_state=42)
                ica_features = ica.fit_transform(standardized_features)
                
                ica_features_dict = {}
                for i in range(self.ica_components):
                    ica_features_dict[f'ica_component_{i+1}'] = ica_features[0, i]
                
                features.update(ica_features_dict)
            
            return features
            
        except Exception as e:
            logger.error(f"Dimensionality reduction error: {e}")
            return features
    
    def extract_all_features(self, symbol: str) -> Dict[str, float]:
        """Tüm özellikleri çıkar"""
        logger.info(f"🔧 {symbol} gelişmiş özellik mühendisliği başlıyor...")
        
        data = self._get_historical_data(symbol, period=f"{self.history_days}d")
        if data is None or data.empty:
            return {}
        
        try:
            # Extract different types of features
            technical_features = self.extract_technical_features(data)
            statistical_features = self.extract_statistical_features(data)
            frequency_features = self.extract_frequency_features(data)
            
            # Combine all features
            all_features = {}
            all_features.update(technical_features)
            all_features.update(statistical_features)
            all_features.update(frequency_features)
            
            # Extract interaction features
            interaction_features = self.extract_interaction_features(all_features)
            all_features.update(interaction_features)
            
            # Apply dimensionality reduction
            reduced_features = self.apply_dimensionality_reduction(all_features)
            
            logger.info(f"✅ {symbol} özellik mühendisliği tamamlandı: {len(reduced_features)} özellik")
            return reduced_features
            
        except Exception as e:
            logger.error(f"❌ {symbol} özellik mühendisliği hatası: {e}")
            return {}
    
    def generate_feature_report(self, symbols: List[str]) -> str:
        """Özellik mühendisliği raporu"""
        report = "\n" + "="*80 + "\n"
        report += "🔧 ADVANCED FEATURE ENGINEERING RESULTS\n"
        report += "="*80 + "\n"
        
        all_features = {}
        total_features = 0
        
        for symbol in symbols:
            features = self.extract_all_features(symbol)
            all_features[symbol] = features
            total_features += len(features)
            
            report += f"🎯 {symbol}:\n"
            report += f"   Total Features: {len(features)}\n"
            
            # Feature categories
            technical_count = sum(1 for k in features.keys() if not k.startswith(('pca_', 'ica_', 'skewness', 'kurtosis', 'autocorr', 'spectral')))
            statistical_count = sum(1 for k in features.keys() if k.startswith(('skewness', 'kurtosis', 'autocorr', 'regime', 'extreme', 'persistence')))
            frequency_count = sum(1 for k in features.keys() if k.startswith(('dominant_frequency', 'spectral', 'high_freq', 'low_freq')))
            pca_count = sum(1 for k in features.keys() if k.startswith('pca_'))
            ica_count = sum(1 for k in features.keys() if k.startswith('ica_'))
            
            report += f"   Technical Features: {technical_count}\n"
            report += f"   Statistical Features: {statistical_count}\n"
            report += f"   Frequency Features: {frequency_count}\n"
            report += f"   PCA Features: {pca_count}\n"
            report += f"   ICA Features: {ica_count}\n"
            report += "\n"
        
        avg_features = total_features / len(symbols) if symbols else 0
        
        report += "📊 FEATURE ENGINEERING SUMMARY:\n"
        report += f"   Total Symbols: {len(symbols)}\n"
        report += f"   Total Features: {total_features}\n"
        report += f"   Average Features per Symbol: {avg_features:.1f}\n"
        report += f"   🎯 FEATURE RICHNESS: {avg_features:.1f} features/symbol\n"
        report += "="*80 + "\n"
        
        return report

def test_advanced_feature_engineering():
    """Advanced feature engineering test"""
    logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
    logger.info("🧪 ADVANCED FEATURE ENGINEERING test başlıyor...")
    
    engineer = AdvancedFeatureEngineering()
    test_symbols = ["GARAN.IS", "AKBNK.IS", "SISE.IS", "ASELS.IS", "YKBNK.IS"]
    
    print(engineer.generate_feature_report(test_symbols))

if __name__ == "__main__":
    test_advanced_feature_engineering()
