"""
Backtest Sistemi
Sinyal doğruluğunu ölçmek için
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import logging
from dataclasses import dataclass
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import matplotlib.pyplot as plt
import seaborn as sns
import os

logger = logging.getLogger(__name__)

@dataclass
class BacktestResult:
    """Backtest sonucu"""
    symbol: str
    timeframe: str
    total_signals: int
    correct_signals: int
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    profit_loss: float
    max_drawdown: float
    sharpe_ratio: float
    win_rate: float
    avg_win: float
    avg_loss: float
    backtest_date: datetime
    confidence_stats: Dict[str, float]

class BacktestEngine:
    """Backtest Motoru"""
    
    def __init__(self, data_dir: str = "data/backtest"):
        self.data_dir = data_dir
        self.backtest_results: Dict[str, BacktestResult] = {}
        
        # Backtest dosyalarını oluştur
        os.makedirs(data_dir, exist_ok=True)
        
    def run_backtest(self, symbol: str, timeframe: str, 
                    signals: List[Dict], actual_prices: pd.DataFrame) -> BacktestResult:
        """Backtest çalıştır"""
        try:
            logger.info(f"🔄 {symbol} {timeframe} backtest başlatılıyor...")
            
            # Sinyalleri DataFrame'e çevir
            signals_df = pd.DataFrame(signals)
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
            
            if len(merged_data) == 0:
                logger.warning(f"⚠️ {symbol} {timeframe}: Veri bulunamadı")
                return None
            
            # Backtest metriklerini hesapla
            accuracy = self._calculate_accuracy(merged_data)
            precision = self._calculate_precision(merged_data)
            recall = self._calculate_recall(merged_data)
            f1 = self._calculate_f1(merged_data)
            roc_auc = self._calculate_roc_auc(merged_data)
            
            # Finansal metrikler
            profit_loss = self._calculate_profit_loss(merged_data)
            max_drawdown = self._calculate_max_drawdown(merged_data)
            sharpe_ratio = self._calculate_sharpe_ratio(merged_data)
            win_rate = self._calculate_win_rate(merged_data)
            avg_win, avg_loss = self._calculate_avg_win_loss(merged_data)
            
            # Confidence istatistikleri
            confidence_stats = self._calculate_confidence_stats(merged_data)
            
            result = BacktestResult(
                symbol=symbol,
                timeframe=timeframe,
                total_signals=len(merged_data),
                correct_signals=int(merged_data['signal_correct'].sum()),
                accuracy=accuracy,
                precision=precision,
                recall=recall,
                f1_score=f1,
                roc_auc=roc_auc,
                profit_loss=profit_loss,
                max_drawdown=max_drawdown,
                sharpe_ratio=sharpe_ratio,
                win_rate=win_rate,
                avg_win=avg_win,
                avg_loss=avg_loss,
                backtest_date=datetime.now(),
                confidence_stats=confidence_stats
            )
            
            # Sonucu kaydet
            self.backtest_results[f"{symbol}_{timeframe}"] = result
            self._save_backtest_result(result)
            
            logger.info(f"✅ {symbol} {timeframe} backtest tamamlandı:")
            logger.info(f"   Accuracy: {accuracy:.3f}")
            logger.info(f"   Precision: {precision:.3f}")
            logger.info(f"   Recall: {recall:.3f}")
            logger.info(f"   F1: {f1:.3f}")
            logger.info(f"   ROC-AUC: {roc_auc:.3f}")
            logger.info(f"   Profit/Loss: {profit_loss:.2f}%")
            logger.info(f"   Max Drawdown: {max_drawdown:.2f}%")
            logger.info(f"   Sharpe Ratio: {sharpe_ratio:.3f}")
            logger.info(f"   Win Rate: {win_rate:.2f}%")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Backtest hatası {symbol} {timeframe}: {e}")
            return None
    
    def _calculate_accuracy(self, data: pd.DataFrame) -> float:
        """Accuracy hesapla"""
        try:
            # Sinyal doğruluğunu hesapla
            data['signal_correct'] = self._calculate_signal_accuracy(data)
            
            correct_signals = data['signal_correct'].sum()
            total_signals = len(data)
            
            return correct_signals / total_signals if total_signals > 0 else 0.0
            
        except Exception as e:
            logger.error(f"❌ Accuracy hesaplama hatası: {e}")
            return 0.0
    
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
    
    def _calculate_precision(self, data: pd.DataFrame) -> float:
        """Precision hesapla"""
        try:
            # Pozitif sinyaller
            positive_signals = data[data['action'].isin(['BUY', 'STRONG_BUY', 'WEAK_BUY'])]
            
            if len(positive_signals) == 0:
                return 0.0
            
            correct_positive = positive_signals['signal_correct'].sum()
            return correct_positive / len(positive_signals)
            
        except Exception as e:
            logger.error(f"❌ Precision hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_recall(self, data: pd.DataFrame) -> float:
        """Recall hesapla"""
        try:
            # Tüm doğru sinyaller
            all_correct_signals = data[data['signal_correct'] == True]
            
            if len(all_correct_signals) == 0:
                return 0.0
            
            # Pozitif sinyaller arasındaki doğru olanlar
            positive_signals = data[data['action'].isin(['BUY', 'STRONG_BUY', 'WEAK_BUY'])]
            correct_positive = positive_signals[positive_signals['signal_correct'] == True]
            
            return len(correct_positive) / len(all_correct_signals)
            
        except Exception as e:
            logger.error(f"❌ Recall hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_f1(self, data: pd.DataFrame) -> float:
        """F1 score hesapla"""
        try:
            precision = self._calculate_precision(data)
            recall = self._calculate_recall(data)
            
            if precision + recall == 0:
                return 0.0
            
            return 2 * (precision * recall) / (precision + recall)
            
        except Exception as e:
            logger.error(f"❌ F1 hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_roc_auc(self, data: pd.DataFrame) -> float:
        """ROC-AUC hesapla"""
        try:
            # Confidence skorlarını al
            y_scores = data['confidence'].values
            
            # Sinyal doğruluğunu binary'e çevir
            y_true = data['signal_correct'].astype(int).values
            
            # NaN değerleri temizle
            mask = ~(np.isnan(y_scores) | np.isnan(y_true))
            y_scores = y_scores[mask]
            y_true = y_true[mask]
            
            if len(y_scores) == 0 or len(np.unique(y_true)) < 2:
                return 0.0
            
            return roc_auc_score(y_true, y_scores)
            
        except Exception as e:
            logger.error(f"❌ ROC-AUC hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_profit_loss(self, data: pd.DataFrame) -> float:
        """Profit/Loss hesapla"""
        try:
            # Her sinyal için P&L hesapla
            data['pnl'] = 0.0
            
            for idx, row in data.iterrows():
                if pd.isna(row['future_price']) or pd.isna(row['price_change']):
                    continue
                
                action = row['action']
                price_change = row['price_change']
                
                if action in ['BUY', 'STRONG_BUY', 'WEAK_BUY']:
                    data.loc[idx, 'pnl'] = price_change * 100  # %100 pozisyon
                elif action in ['SELL', 'STRONG_SELL', 'WEAK_SELL']:
                    data.loc[idx, 'pnl'] = -price_change * 100  # %100 kısa pozisyon
            
            return data['pnl'].sum()
            
        except Exception as e:
            logger.error(f"❌ Profit/Loss hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_max_drawdown(self, data: pd.DataFrame) -> float:
        """Maksimum drawdown hesapla"""
        try:
            # Kümülatif P&L hesapla
            data['cumulative_pnl'] = data['pnl'].cumsum()
            
            # Peak değerleri bul
            data['peak'] = data['cumulative_pnl'].expanding().max()
            
            # Drawdown hesapla
            data['drawdown'] = (data['cumulative_pnl'] - data['peak']) / data['peak'] * 100
            
            return data['drawdown'].min()
            
        except Exception as e:
            logger.error(f"❌ Max drawdown hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_sharpe_ratio(self, data: pd.DataFrame) -> float:
        """Sharpe ratio hesapla"""
        try:
            # P&L serisini al
            pnl_series = data['pnl'].dropna()
            
            if len(pnl_series) == 0:
                return 0.0
            
            # Sharpe ratio hesapla (risk-free rate = 0 varsayımı)
            mean_return = pnl_series.mean()
            std_return = pnl_series.std()
            
            if std_return == 0:
                return 0.0
            
            return mean_return / std_return
            
        except Exception as e:
            logger.error(f"❌ Sharpe ratio hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_win_rate(self, data: pd.DataFrame) -> float:
        """Win rate hesapla"""
        try:
            # Pozitif P&L'li sinyaller
            winning_signals = data[data['pnl'] > 0]
            total_signals = len(data[data['pnl'] != 0])
            
            if total_signals == 0:
                return 0.0
            
            return len(winning_signals) / total_signals * 100
            
        except Exception as e:
            logger.error(f"❌ Win rate hesaplama hatası: {e}")
            return 0.0
    
    def _calculate_avg_win_loss(self, data: pd.DataFrame) -> Tuple[float, float]:
        """Ortalama kazanç ve kayıp hesapla"""
        try:
            # Pozitif ve negatif P&L'leri ayır
            positive_pnl = data[data['pnl'] > 0]['pnl']
            negative_pnl = data[data['pnl'] < 0]['pnl']
            
            avg_win = positive_pnl.mean() if len(positive_pnl) > 0 else 0.0
            avg_loss = negative_pnl.mean() if len(negative_pnl) > 0 else 0.0
            
            return avg_win, avg_loss
            
        except Exception as e:
            logger.error(f"❌ Avg win/loss hesaplama hatası: {e}")
            return 0.0, 0.0
    
    def _calculate_confidence_stats(self, data: pd.DataFrame) -> Dict[str, float]:
        """Confidence istatistiklerini hesapla"""
        try:
            confidence_stats = {
                'mean_confidence': data['confidence'].mean(),
                'std_confidence': data['confidence'].std(),
                'min_confidence': data['confidence'].min(),
                'max_confidence': data['confidence'].max(),
                'median_confidence': data['confidence'].median(),
                'q25_confidence': data['confidence'].quantile(0.25),
                'q75_confidence': data['confidence'].quantile(0.75)
            }
            
            return confidence_stats
            
        except Exception as e:
            logger.error(f"❌ Confidence stats hesaplama hatası: {e}")
            return {}
    
    def _save_backtest_result(self, result: BacktestResult):
        """Backtest sonucunu kaydet"""
        try:
            filename = f"{result.symbol}_{result.timeframe}_backtest.json"
            filepath = os.path.join(self.data_dir, filename)
            
            # JSON olarak kaydet
            import json
            result_dict = {
                'symbol': result.symbol,
                'timeframe': result.timeframe,
                'total_signals': result.total_signals,
                'correct_signals': result.correct_signals,
                'accuracy': result.accuracy,
                'precision': result.precision,
                'recall': result.recall,
                'f1_score': result.f1_score,
                'roc_auc': result.roc_auc,
                'profit_loss': result.profit_loss,
                'max_drawdown': result.max_drawdown,
                'sharpe_ratio': result.sharpe_ratio,
                'win_rate': result.win_rate,
                'avg_win': result.avg_win,
                'avg_loss': result.avg_loss,
                'backtest_date': result.backtest_date.isoformat(),
                'confidence_stats': result.confidence_stats
            }
            
            with open(filepath, 'w') as f:
                json.dump(result_dict, f, indent=2)
            
            logger.info(f"✅ Backtest sonucu kaydedildi: {filepath}")
            
        except Exception as e:
            logger.error(f"❌ Backtest kaydetme hatası: {e}")
    
    def generate_report(self, symbol: str, timeframe: str) -> str:
        """Backtest raporu oluştur"""
        try:
            result = self.backtest_results.get(f"{symbol}_{timeframe}")
            
            if not result:
                return f"❌ {symbol} {timeframe} için backtest sonucu bulunamadı"
            
            report = f"""
📊 BACKTEST RAPORU - {symbol} {timeframe}
{'='*50}

📈 GENEL METRİKLER:
   • Toplam Sinyal: {result.total_signals}
   • Doğru Sinyal: {result.correct_signals}
   • Accuracy: {result.accuracy:.3f} ({result.accuracy*100:.1f}%)
   • Precision: {result.precision:.3f} ({result.precision*100:.1f}%)
   • Recall: {result.recall:.3f} ({result.recall*100:.1f}%)
   • F1 Score: {result.f1_score:.3f}
   • ROC-AUC: {result.roc_auc:.3f}

💰 FİNANSAL METRİKLER:
   • Profit/Loss: {result.profit_loss:.2f}%
   • Max Drawdown: {result.max_drawdown:.2f}%
   • Sharpe Ratio: {result.sharpe_ratio:.3f}
   • Win Rate: {result.win_rate:.2f}%
   • Ortalama Kazanç: {result.avg_win:.2f}%
   • Ortalama Kayıp: {result.avg_loss:.2f}%

🧠 CONFIDENCE İSTATİSTİKLERİ:
   • Ortalama: {result.confidence_stats.get('mean_confidence', 0):.3f}
   • Standart Sapma: {result.confidence_stats.get('std_confidence', 0):.3f}
   • Minimum: {result.confidence_stats.get('min_confidence', 0):.3f}
   • Maksimum: {result.confidence_stats.get('max_confidence', 0):.3f}
   • Medyan: {result.confidence_stats.get('median_confidence', 0):.3f}

📅 Backtest Tarihi: {result.backtest_date.strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            return report
            
        except Exception as e:
            logger.error(f"❌ Rapor oluşturma hatası: {e}")
            return f"❌ Rapor oluşturma hatası: {e}"
    
    def run_comprehensive_backtest(self, all_signals: Dict[str, Dict]) -> Dict[str, BacktestResult]:
        """Kapsamlı backtest çalıştır"""
        try:
            logger.info("🔄 Kapsamlı backtest başlatılıyor...")
            
            results = {}
            
            for symbol, timeframes in all_signals.items():
                for timeframe, signal_data in timeframes.items():
                    if len(signal_data) > 0:
                        result = self.run_backtest(symbol, timeframe, signal_data, None)
                        if result:
                            results[f"{symbol}_{timeframe}"] = result
            
            logger.info(f"✅ Kapsamlı backtest tamamlandı: {len(results)} sonuç")
            return results
            
        except Exception as e:
            logger.error(f"❌ Kapsamlı backtest hatası: {e}")
            return {}
