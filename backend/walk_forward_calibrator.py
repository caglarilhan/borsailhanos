"""
Walk-Forward Kalibrasyon Sistemi
Confidence ve eşiklerin otomatik ayarı için
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import logging
from dataclasses import dataclass
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import TimeSeriesSplit
import joblib
import os

logger = logging.getLogger(__name__)

@dataclass
class CalibrationResult:
    """Kalibrasyon sonucu"""
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    optimal_threshold: float
    optimal_confidence_cap: float
    calibration_date: datetime
    symbol: str
    timeframe: str

class WalkForwardCalibrator:
    """Walk-Forward Kalibrasyon Sistemi"""
    
    def __init__(self, data_dir: str = "data/calibration"):
        self.data_dir = data_dir
        self.calibration_results: Dict[str, CalibrationResult] = {}
        self.min_samples = 100  # Minimum örnek sayısı
        self.walk_forward_periods = 5  # Walk-forward periyot sayısı
        
        # Kalibrasyon dosyalarını oluştur
        os.makedirs(data_dir, exist_ok=True)
        
    def collect_signal_data(self, symbol: str, timeframe: str, 
                           signal_data: Dict, actual_prices: pd.DataFrame) -> pd.DataFrame:
        """Sinyal verilerini topla ve gerçek fiyatlarla birleştir"""
        try:
            # Sinyal verilerini DataFrame'e çevir
            signals_df = pd.DataFrame(signal_data)
            signals_df['timestamp'] = pd.to_datetime(signals_df['timestamp'])
            signals_df = signals_df.set_index('timestamp')
            
            # Gerçek fiyatlarla birleştir
            merged_data = pd.merge(
                signals_df, 
                actual_prices[['Close']], 
                left_index=True, 
                right_index=True, 
                how='inner'
            )
            
            # Sinyal doğruluğunu hesapla
            merged_data['signal_correct'] = self._calculate_signal_accuracy(merged_data)
            
            return merged_data
            
        except Exception as e:
            logger.error(f"❌ Sinyal verisi toplama hatası {symbol}: {e}")
            return pd.DataFrame()
    
    def _calculate_signal_accuracy(self, data: pd.DataFrame) -> pd.Series:
        """Sinyal doğruluğunu hesapla"""
        try:
            # 48 saat sonraki fiyat değişimini hesapla
            data['future_price'] = data['Close'].shift(-48)  # 48 saat sonra
            data['price_change'] = (data['future_price'] - data['Close']) / data['Close']
            
            # Sinyal doğruluğunu kontrol et
            def is_signal_correct(row):
                if pd.isna(row['future_price']) or pd.isna(row['price_change']):
                    return np.nan
                
                action = row['action']
                price_change = row['price_change']
                
                if action in ['BUY', 'STRONG_BUY', 'WEAK_BUY']:
                    return price_change > 0.01  # %1'den fazla artış
                elif action in ['SELL', 'STRONG_SELL', 'WEAK_SELL']:
                    return price_change < -0.01  # %1'den fazla düşüş
                else:
                    return np.nan
            
            return data.apply(is_signal_correct, axis=1)
            
        except Exception as e:
            logger.error(f"❌ Sinyal doğruluk hesaplama hatası: {e}")
            return pd.Series([np.nan] * len(data))
    
    def calibrate_confidence_thresholds(self, symbol: str, timeframe: str, 
                                      signal_data: pd.DataFrame) -> CalibrationResult:
        """Confidence eşiklerini kalibre et"""
        try:
            if len(signal_data) < self.min_samples:
                logger.warning(f"⚠️ {symbol} {timeframe}: Yeterli veri yok ({len(signal_data)} < {self.min_samples})")
                return None
            
            # Walk-forward cross-validation
            tscv = TimeSeriesSplit(n_splits=self.walk_forward_periods)
            
            best_threshold = 0.5
            best_confidence_cap = 0.85
            best_accuracy = 0.0
            
            # Confidence eşiklerini test et
            thresholds = np.arange(0.3, 0.9, 0.05)
            confidence_caps = np.arange(0.7, 0.95, 0.05)
            
            for threshold in thresholds:
                for cap in confidence_caps:
                    accuracies = []
                    
                    for train_idx, test_idx in tscv.split(signal_data):
                        train_data = signal_data.iloc[train_idx]
                        test_data = signal_data.iloc[test_idx]
                        
                        # Eğitim verisiyle eşik belirle
                        train_accuracy = self._evaluate_threshold(train_data, threshold, cap)
                        
                        # Test verisiyle doğrula
                        test_accuracy = self._evaluate_threshold(test_data, threshold, cap)
                        
                        accuracies.append(test_accuracy)
                    
                    avg_accuracy = np.mean(accuracies)
                    
                    if avg_accuracy > best_accuracy:
                        best_accuracy = avg_accuracy
                        best_threshold = threshold
                        best_confidence_cap = cap
            
            # Final değerlendirme
            final_data = signal_data
            precision = self._calculate_precision(final_data, best_threshold, best_confidence_cap)
            recall = self._calculate_recall(final_data, best_threshold, best_confidence_cap)
            f1 = self._calculate_f1(final_data, best_threshold, best_confidence_cap)
            
            result = CalibrationResult(
                accuracy=best_accuracy,
                precision=precision,
                recall=recall,
                f1_score=f1,
                optimal_threshold=best_threshold,
                optimal_confidence_cap=best_confidence_cap,
                calibration_date=datetime.now(),
                symbol=symbol,
                timeframe=timeframe
            )
            
            # Sonucu kaydet
            self.calibration_results[f"{symbol}_{timeframe}"] = result
            self._save_calibration_result(result)
            
            logger.info(f"✅ {symbol} {timeframe} kalibrasyon tamamlandı:")
            logger.info(f"   Accuracy: {best_accuracy:.3f}")
            logger.info(f"   Precision: {precision:.3f}")
            logger.info(f"   Recall: {recall:.3f}")
            logger.info(f"   F1: {f1:.3f}")
            logger.info(f"   Optimal Threshold: {best_threshold:.3f}")
            logger.info(f"   Optimal Confidence Cap: {best_confidence_cap:.3f}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Kalibrasyon hatası {symbol} {timeframe}: {e}")
            return None
    
    def _evaluate_threshold(self, data: pd.DataFrame, threshold: float, cap: float) -> float:
        """Eşik değerini değerlendir"""
        try:
            # Confidence eşiğini uygula
            filtered_data = data[
                (data['confidence'] >= threshold) & 
                (data['confidence'] <= cap)
            ]
            
            if len(filtered_data) == 0:
                return 0.0
            
            # Doğruluk oranını hesapla
            correct_signals = filtered_data['signal_correct'].sum()
            total_signals = len(filtered_data)
            
            return correct_signals / total_signals if total_signals > 0 else 0.0
            
        except Exception as e:
            logger.error(f"❌ Eşik değerlendirme hatası: {e}")
            return 0.0
    
    def _calculate_precision(self, data: pd.DataFrame, threshold: float, cap: float) -> float:
        """Precision hesapla"""
        try:
            filtered_data = data[
                (data['confidence'] >= threshold) & 
                (data['confidence'] <= cap)
            ]
            
            if len(filtered_data) == 0:
                return 0.0
            
            # Pozitif sinyallerin doğruluk oranı
            positive_signals = filtered_data[filtered_data['action'].isin(['BUY', 'STRONG_BUY', 'WEAK_BUY'])]
            
            if len(positive_signals) == 0:
                return 0.0
            
            correct_positive = positive_signals['signal_correct'].sum()
            return correct_positive / len(positive_signals)
            
        except Exception as e:
            logger.error(f"❌ Precision hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_recall(self, data: pd.DataFrame, threshold: float, cap: float) -> float:
        """Recall hesapla"""
        try:
            # Tüm doğru sinyaller
            all_correct_signals = data[data['signal_correct'] == True]
            
            if len(all_correct_signals) == 0:
                return 0.0
            
            # Eşik altındaki doğru sinyaller
            filtered_correct = all_correct_signals[
                (all_correct_signals['confidence'] >= threshold) & 
                (all_correct_signals['confidence'] <= cap)
            ]
            
            return len(filtered_correct) / len(all_correct_signals)
            
        except Exception as e:
            logger.error(f"❌ Recall hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_f1(self, data: pd.DataFrame, threshold: float, cap: float) -> float:
        """F1 score hesapla"""
        try:
            precision = self._calculate_precision(data, threshold, cap)
            recall = self._calculate_recall(data, threshold, cap)
            
            if precision + recall == 0:
                return 0.0
            
            return 2 * (precision * recall) / (precision + recall)
            
        except Exception as e:
            logger.error(f"❌ F1 hesaplama hatası: {e}")
            return 0.0
    
    def _save_calibration_result(self, result: CalibrationResult):
        """Kalibrasyon sonucunu kaydet"""
        try:
            filename = f"{result.symbol}_{result.timeframe}_calibration.json"
            filepath = os.path.join(self.data_dir, filename)
            
            # JSON olarak kaydet
            import json
            result_dict = {
                'accuracy': result.accuracy,
                'precision': result.precision,
                'recall': result.recall,
                'f1_score': result.f1_score,
                'optimal_threshold': result.optimal_threshold,
                'optimal_confidence_cap': result.optimal_confidence_cap,
                'calibration_date': result.calibration_date.isoformat(),
                'symbol': result.symbol,
                'timeframe': result.timeframe
            }
            
            with open(filepath, 'w') as f:
                json.dump(result_dict, f, indent=2)
            
            logger.info(f"✅ Kalibrasyon sonucu kaydedildi: {filepath}")
            
        except Exception as e:
            logger.error(f"❌ Kalibrasyon kaydetme hatası: {e}")
    
    def load_calibration_result(self, symbol: str, timeframe: str) -> Optional[CalibrationResult]:
        """Kalibrasyon sonucunu yükle"""
        try:
            filename = f"{symbol}_{timeframe}_calibration.json"
            filepath = os.path.join(self.data_dir, filename)
            
            if not os.path.exists(filepath):
                return None
            
            import json
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            return CalibrationResult(
                accuracy=data['accuracy'],
                precision=data['precision'],
                recall=data['recall'],
                f1_score=data['f1_score'],
                optimal_threshold=data['optimal_threshold'],
                optimal_confidence_cap=data['optimal_confidence_cap'],
                calibration_date=datetime.fromisoformat(data['calibration_date']),
                symbol=data['symbol'],
                timeframe=data['timeframe']
            )
            
        except Exception as e:
            logger.error(f"❌ Kalibrasyon yükleme hatası: {e}")
            return None
    
    def get_optimal_threshold(self, symbol: str, timeframe: str) -> Tuple[float, float]:
        """Optimal eşik değerlerini al"""
        try:
            result = self.load_calibration_result(symbol, timeframe)
            
            if result:
                return result.optimal_threshold, result.optimal_confidence_cap
            else:
                # Varsayılan değerler
                return 0.5, 0.85
                
        except Exception as e:
            logger.error(f"❌ Optimal eşik alma hatası: {e}")
            return 0.5, 0.85
    
    def run_weekly_calibration(self, all_signals: Dict[str, Dict]) -> Dict[str, CalibrationResult]:
        """Haftalık kalibrasyon çalıştır"""
        try:
            logger.info("🔄 Haftalık kalibrasyon başlatılıyor...")
            
            results = {}
            
            for symbol, timeframes in all_signals.items():
                for timeframe, signal_data in timeframes.items():
                    if len(signal_data) >= self.min_samples:
                        result = self.calibrate_confidence_thresholds(symbol, timeframe, signal_data)
                        if result:
                            results[f"{symbol}_{timeframe}"] = result
            
            logger.info(f"✅ Haftalık kalibrasyon tamamlandı: {len(results)} sonuç")
            return results
            
        except Exception as e:
            logger.error(f"❌ Haftalık kalibrasyon hatası: {e}")
            return {}
