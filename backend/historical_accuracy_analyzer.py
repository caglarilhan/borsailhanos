#!/usr/bin/env python3
"""
BIST AI Smart Trader - Historical Accuracy Analyzer
Tüm geçmiş hisseler için doğruluk, düşüş ve çıkış analizi
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Any, Optional, Tuple
import json
import os
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HistoricalAccuracyAnalyzer:
    """Geçmiş performans analizi ve doğruluk hesaplama"""
    
    def __init__(self, data_dir: str = "data/historical"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # BIST100 sembolleri
        self.bist100_symbols = [
            'SISE.IS', 'EREGL.IS', 'TUPRS.IS', 'AKBNK.IS', 'GARAN.IS',
            'THYAO.IS', 'ASELS.IS', 'KRDMD.IS', 'BIMAS.IS', 'SAHOL.IS',
            'KCHOL.IS', 'PGSUS.IS', 'SASA.IS', 'VESTL.IS', 'TOASO.IS',
            'FROTO.IS', 'SABAN.IS', 'TAVHL.IS', 'MGROS.IS', 'ULKER.IS'
        ]
        
        # Analiz parametreleri
        self.lookback_periods = [30, 90, 180, 365]  # gün
        self.min_data_points = 100
        self.accuracy_thresholds = [0.5, 0.6, 0.7, 0.8, 0.9]
        
        logger.info(f"✅ Historical Accuracy Analyzer başlatıldı - {len(self.bist100_symbols)} sembol")
    
    def analyze_all_symbols(self, force_update: bool = False) -> Dict[str, Any]:
        """Tüm semboller için kapsamlı analiz"""
        try:
            results = {}
            total_symbols = len(self.bist100_symbols)
            
            logger.info(f"🔍 {total_symbols} sembol analiz ediliyor...")
            
            for i, symbol in enumerate(self.bist100_symbols, 1):
                logger.info(f"📊 {i}/{total_symbols} - {symbol} analiz ediliyor...")
                
                try:
                    analysis = self.analyze_single_symbol(symbol, force_update)
                    if analysis and 'error' not in analysis:
                        results[symbol] = analysis
                    else:
                        results[symbol] = {'error': 'Analiz başarısız'}
                        
                except Exception as e:
                    logger.error(f"❌ {symbol} analiz hatası: {e}")
                    results[symbol] = {'error': str(e)}
                
                # Progress göstergesi
                if i % 5 == 0:
                    logger.info(f"📈 Progress: {i}/{total_symbols} ({i/total_symbols*100:.1f}%)")
            
            # Genel istatistikler
            summary = self.calculate_overall_statistics(results)
            
            # Sonuçları kaydet
            self.save_analysis_results(results, summary)
            
            return {
                'symbols_analyzed': len(results),
                'successful_analyses': len([r for r in results.values() if 'error' not in r]),
                'failed_analyses': len([r for r in results.values() if 'error' in r]),
                'overall_summary': summary,
                'individual_results': results,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Genel analiz hatası: {e}")
            return {'error': str(e)}
    
    def analyze_single_symbol(self, symbol: str, force_update: bool = False) -> Dict[str, Any]:
        """Tek sembol için detaylı analiz"""
        try:
            # Cache dosyası kontrol et
            cache_file = self.data_dir / f"{symbol.replace('.IS', '')}_analysis.json"
            
            if not force_update and cache_file.exists():
                with open(cache_file, 'r', encoding='utf-8') as f:
                    cached_data = json.load(f)
                    # Cache 24 saat eskiyse güncelle
                    if (datetime.now() - datetime.fromisoformat(cached_data['timestamp'])).days < 1:
                        logger.info(f"✅ {symbol} cache'den yüklendi")
                        return cached_data
            
            # Yeni analiz yap
            logger.info(f"🔄 {symbol} için yeni analiz yapılıyor...")
            
            # Veri çek
            data = self.fetch_symbol_data(symbol)
            if data.empty:
                return {'error': 'Veri bulunamadı'}
            
            # Teknik analiz
            technical_analysis = self.perform_technical_analysis(data, symbol)
            
            # Doğruluk analizi
            accuracy_analysis = self.calculate_accuracy_metrics(data, symbol)
            
            # Düşüş/çıkış analizi
            drawdown_analysis = self.analyze_drawdowns_and_recoveries(data, symbol)
            
            # Trend analizi
            trend_analysis = self.analyze_trends(data, symbol)
            
            # Volatilite analizi
            volatility_analysis = self.analyze_volatility(data, symbol)
            
            # Sonuçları birleştir
            result = {
                'symbol': symbol,
                'data_period': {
                    'start_date': data.index[0].isoformat(),
                    'end_date': data.index[-1].isoformat(),
                    'total_days': len(data),
                    'data_points': len(data)
                },
                'technical_analysis': technical_analysis,
                'accuracy_metrics': accuracy_analysis,
                'drawdown_analysis': drawdown_analysis,
                'trend_analysis': trend_analysis,
                'volatility_analysis': volatility_analysis,
                'timestamp': datetime.now().isoformat()
            }
            
            # Cache'e kaydet
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            
            return result
            
        except Exception as e:
            logger.error(f"❌ {symbol} analiz hatası: {e}")
            return {'error': str(e)}
    
    def fetch_symbol_data(self, symbol: str, period: str = "2y") -> pd.DataFrame:
        """Sembol verisi çek"""
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period, interval="1d")
            
            if data.empty:
                logger.warning(f"⚠️ {symbol} için veri bulunamadı")
                return pd.DataFrame()
            
            # Veri kalitesi kontrol
            if len(data) < self.min_data_points:
                logger.warning(f"⚠️ {symbol} için yetersiz veri: {len(data)} < {self.min_data_points}")
                return pd.DataFrame()
            
            # NaN değerleri temizle
            data = data.dropna()
            
            # Returns hesapla
            data['Returns'] = data['Close'].pct_change()
            data['Log_Returns'] = np.log(data['Close'] / data['Close'].shift(1))
            
            # Cumulative returns
            data['Cumulative_Returns'] = (1 + data['Returns']).cumprod()
            
            return data
            
        except Exception as e:
            logger.error(f"❌ {symbol} veri çekme hatası: {e}")
            return pd.DataFrame()
    
    def perform_technical_analysis(self, data: pd.DataFrame, symbol: str) -> Dict[str, Any]:
        """Teknik analiz yap"""
        try:
            close = data['Close']
            high = data['High']
            low = data['Low']
            volume = data['Volume']
            
            # Moving Averages
            sma_20 = close.rolling(20).mean()
            sma_50 = close.rolling(50).mean()
            sma_200 = close.rolling(200).mean()
            
            ema_12 = close.ewm(span=12).mean()
            ema_26 = close.ewm(span=26).mean()
            
            # RSI
            delta = close.diff()
            gain = (delta.where(delta > 0, 0)).rolling(14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            
            # MACD
            macd = ema_12 - ema_26
            macd_signal = macd.ewm(span=9).mean()
            macd_histogram = macd - macd_signal
            
            # Bollinger Bands
            bb_middle = sma_20
            bb_std = close.rolling(20).std()
            bb_upper = bb_middle + (bb_std * 2)
            bb_lower = bb_middle - (bb_std * 2)
            
            # Support/Resistance
            support_levels = self.find_support_resistance_levels(data)
            
            # Volume analysis
            volume_sma = volume.rolling(20).mean()
            volume_ratio = volume / volume_sma
            
            # Current values
            current_price = close.iloc[-1]
            current_rsi = rsi.iloc[-1]
            current_macd = macd.iloc[-1]
            
            # Signal generation
            signals = {
                'trend': 'bullish' if sma_20.iloc[-1] > sma_50.iloc[-1] > sma_200.iloc[-1] else 'bearish' if sma_20.iloc[-1] < sma_50.iloc[-1] < sma_200.iloc[-1] else 'neutral',
                'rsi': 'oversold' if current_rsi < 30 else 'overbought' if current_rsi > 70 else 'neutral',
                'macd': 'bullish' if current_macd > macd_signal.iloc[-1] else 'bearish',
                'bollinger': 'upper' if current_price > bb_upper.iloc[-1] else 'lower' if current_price < bb_lower.iloc[-1] else 'middle',
                'volume': 'high' if volume_ratio.iloc[-1] > 1.5 else 'low' if volume_ratio.iloc[-1] < 0.5 else 'normal'
            }
            
            return {
                'signals': signals,
                'current_values': {
                    'price': float(current_price),
                    'rsi': float(current_rsi) if not pd.isna(current_rsi) else 50.0,
                    'macd': float(current_macd) if not pd.isna(current_macd) else 0.0,
                    'sma_20': float(sma_20.iloc[-1]) if not pd.isna(sma_20.iloc[-1]) else 0.0,
                    'sma_50': float(sma_50.iloc[-1]) if not pd.isna(sma_50.iloc[-1]) else 0.0,
                    'sma_200': float(sma_200.iloc[-1]) if not pd.isna(sma_200.iloc[-1]) else 0.0
                },
                'support_resistance': support_levels,
                'volume_analysis': {
                    'current_ratio': float(volume_ratio.iloc[-1]) if not pd.isna(volume_ratio.iloc[-1]) else 1.0,
                    'avg_volume': float(volume_sma.iloc[-1]) if not pd.isna(volume_sma.iloc[-1]) else 0.0
                }
            }
            
        except Exception as e:
            logger.error(f"❌ {symbol} teknik analiz hatası: {e}")
            return {'error': str(e)}
    
    def find_support_resistance_levels(self, data: pd.DataFrame, window: int = 20) -> Dict[str, List[float]]:
        """Support ve resistance seviyelerini bul"""
        try:
            highs = data['High'].rolling(window, center=True).max()
            lows = data['Low'].rolling(window, center=True).min()
            
            # Local maxima ve minima
            resistance_levels = []
            support_levels = []
            
            for i in range(window, len(data) - window):
                if highs.iloc[i] == data['High'].iloc[i]:
                    resistance_levels.append(float(data['High'].iloc[i]))
                if lows.iloc[i] == data['Low'].iloc[i]:
                    support_levels.append(float(data['Low'].iloc[i]))
            
            # Unique levels
            resistance_levels = sorted(list(set(resistance_levels)), reverse=True)[:5]
            support_levels = sorted(list(set(support_levels)))[:5]
            
            return {
                'resistance': resistance_levels,
                'support': support_levels
            }
            
        except Exception as e:
            logger.error(f"❌ Support/Resistance bulma hatası: {e}")
            return {'resistance': [], 'support': []}
    
    def calculate_accuracy_metrics(self, data: pd.DataFrame, symbol: str) -> Dict[str, Any]:
        """Doğruluk metriklerini hesapla"""
        try:
            close = data['Close']
            returns = data['Returns'].dropna()
            
            # Direction accuracy (yön doğruluğu)
            direction_changes = np.diff(close) > 0
            direction_accuracy = np.mean(direction_changes)
            
            # Volatility accuracy
            volatility = returns.std() * np.sqrt(252)
            volatility_accuracy = 1 / (1 + volatility)  # Düşük volatilite = yüksek accuracy
            
            # Trend accuracy
            sma_20 = close.rolling(20).mean()
            sma_50 = close.rolling(50).mean()
            trend_signals = (sma_20 > sma_50).astype(int)
            trend_accuracy = np.mean(trend_signals)
            
            # RSI accuracy
            rsi = self.calculate_rsi(close)
            rsi_signals = ((rsi < 30) | (rsi > 70)).astype(int)
            rsi_accuracy = np.mean(rsi_signals)
            
            # MACD accuracy
            ema_12 = close.ewm(span=12).mean()
            ema_26 = close.ewm(span=26).mean()
            macd = ema_12 - ema_26
            macd_signals = (macd > 0).astype(int)
            macd_accuracy = np.mean(macd_signals)
            
            # Combined accuracy
            combined_accuracy = np.mean([
                direction_accuracy,
                volatility_accuracy,
                trend_accuracy,
                rsi_accuracy,
                macd_accuracy
            ])
            
            return {
                'direction_accuracy': float(direction_accuracy),
                'volatility_accuracy': float(volatility_accuracy),
                'trend_accuracy': float(trend_accuracy),
                'rsi_accuracy': float(rsi_accuracy),
                'macd_accuracy': float(macd_accuracy),
                'combined_accuracy': float(combined_accuracy),
                'volatility': float(volatility),
                'total_signals': len(returns)
            }
            
        except Exception as e:
            logger.error(f"❌ {symbol} accuracy hesaplama hatası: {e}")
            return {'error': str(e)}
    
    def calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """RSI hesapla"""
        try:
            delta = prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(period).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            return rsi
        except:
            return pd.Series([50] * len(prices))
    
    def analyze_drawdowns_and_recoveries(self, data: pd.DataFrame, symbol: str) -> Dict[str, Any]:
        """Düşüş ve toparlanma analizi"""
        try:
            close = data['Close']
            returns = data['Returns'].dropna()
            
            # Cumulative returns
            cumulative = (1 + returns).cumprod()
            
            # Running maximum
            running_max = cumulative.expanding().max()
            
            # Drawdown
            drawdown = (cumulative - running_max) / running_max
            
            # Drawdown periods
            drawdown_periods = []
            recovery_periods = []
            
            in_drawdown = False
            drawdown_start = None
            drawdown_bottom = None
            
            for i, dd in enumerate(drawdown):
                if dd < 0 and not in_drawdown:
                    # Drawdown başladı
                    in_drawdown = True
                    drawdown_start = i
                    drawdown_bottom = i
                elif dd < 0 and in_drawdown:
                    # Drawdown devam ediyor
                    if dd < drawdown[drawdown_bottom]:
                        drawdown_bottom = i
                elif dd >= 0 and in_drawdown:
                    # Recovery
                    in_drawdown = False
                    drawdown_periods.append({
                        'start_idx': drawdown_start,
                        'bottom_idx': drawdown_bottom,
                        'end_idx': i,
                        'max_drawdown': float(drawdown[drawdown_bottom]),
                        'duration': i - drawdown_start,
                        'recovery_time': i - drawdown_bottom
                    })
            
            # Eğer hala drawdown'da ise
            if in_drawdown:
                drawdown_periods.append({
                    'start_idx': drawdown_start,
                    'bottom_idx': drawdown_bottom,
                    'end_idx': len(drawdown) - 1,
                    'max_drawdown': float(drawdown[drawdown_bottom]),
                    'duration': len(drawdown) - 1 - drawdown_start,
                    'recovery_time': None
                })
            
            # İstatistikler
            if drawdown_periods:
                max_drawdown = min([d['max_drawdown'] for d in drawdown_periods])
                avg_drawdown = np.mean([d['max_drawdown'] for d in drawdown_periods])
                avg_duration = np.mean([d['duration'] for d in drawdown_periods])
                avg_recovery = np.mean([d['recovery_time'] for d in drawdown_periods if d['recovery_time'] is not None])
            else:
                max_drawdown = avg_drawdown = avg_duration = avg_recovery = 0
            
            return {
                'max_drawdown': float(max_drawdown),
                'avg_drawdown': float(avg_drawdown),
                'avg_duration': float(avg_duration),
                'avg_recovery_time': float(avg_recovery) if avg_recovery > 0 else None,
                'total_drawdowns': len(drawdown_periods),
                'current_drawdown': float(drawdown.iloc[-1]) if drawdown.iloc[-1] < 0 else 0,
                'drawdown_periods': drawdown_periods
            }
            
        except Exception as e:
            logger.error(f"❌ {symbol} drawdown analiz hatası: {e}")
            return {'error': str(e)}
    
    def analyze_trends(self, data: pd.DataFrame, symbol: str) -> Dict[str, Any]:
        """Trend analizi"""
        try:
            close = data['Close']
            
            # Trend periods
            trend_periods = []
            current_trend = 'neutral'
            trend_start = 0
            trend_direction = 0
            
            for i in range(20, len(close)):
                sma_20 = close.iloc[i-20:i].mean()
                sma_50 = close.iloc[i-50:i].mean() if i >= 50 else sma_20
                
                if sma_20 > sma_50 * 1.02:  # %2 üzerinde
                    new_trend = 'uptrend'
                elif sma_20 < sma_50 * 0.98:  # %2 altında
                    new_trend = 'downtrend'
                else:
                    new_trend = 'sideways'
                
                if new_trend != current_trend:
                    if current_trend != 'neutral':
                        trend_periods.append({
                            'trend': current_trend,
                            'start_idx': trend_start,
                            'end_idx': i,
                            'duration': i - trend_start,
                            'price_change': float((close.iloc[i] - close.iloc[trend_start]) / close.iloc[trend_start] * 100)
                        })
                    
                    current_trend = new_trend
                    trend_start = i
            
            # Son trend
            if current_trend != 'neutral':
                trend_periods.append({
                    'trend': current_trend,
                    'start_idx': trend_start,
                    'end_idx': len(close) - 1,
                    'duration': len(close) - 1 - trend_start,
                    'price_change': float((close.iloc[-1] - close.iloc[trend_start]) / close.iloc[trend_start] * 100)
                })
            
            # Trend istatistikleri
            uptrends = [t for t in trend_periods if t['trend'] == 'uptrend']
            downtrends = [t for t in trend_periods if t['trend'] == 'downtrend']
            sideways = [t for t in trend_periods if t['trend'] == 'sideways']
            
            return {
                'current_trend': current_trend,
                'trend_periods': trend_periods,
                'uptrends': len(uptrends),
                'downtrends': len(downtrends),
                'sideways_periods': len(sideways),
                'avg_uptrend_duration': np.mean([t['duration'] for t in uptrends]) if uptrends else 0,
                'avg_downtrend_duration': np.mean([t['duration'] for t in downtrends]) if downtrends else 0,
                'avg_uptrend_gain': np.mean([t['price_change'] for t in uptrends]) if uptrends else 0,
                'avg_downtrend_loss': np.mean([t['price_change'] for t in downtrends]) if downtrends else 0
            }
            
        except Exception as e:
            logger.error(f"❌ {symbol} trend analiz hatası: {e}")
            return {'error': str(e)}
    
    def analyze_volatility(self, data: pd.DataFrame, symbol: str) -> Dict[str, Any]:
        """Volatilite analizi"""
        try:
            returns = data['Returns'].dropna()
            
            # Rolling volatility
            rolling_vol = returns.rolling(20).std() * np.sqrt(252)
            
            # Volatility regimes
            low_vol = rolling_vol < rolling_vol.quantile(0.33)
            medium_vol = (rolling_vol >= rolling_vol.quantile(0.33)) & (rolling_vol < rolling_vol.quantile(0.66))
            high_vol = rolling_vol >= rolling_vol.quantile(0.66)
            
            # Volatility clustering
            vol_clustering = np.corrcoef(rolling_vol[:-1], rolling_vol[1:])[0, 1]
            
            # GARCH-like volatility persistence
            vol_persistence = np.corrcoef(rolling_vol[:-5], rolling_vol[5:])[0, 1] if len(rolling_vol) > 10 else 0
            
            return {
                'current_volatility': float(rolling_vol.iloc[-1]) if not pd.isna(rolling_vol.iloc[-1]) else 0,
                'avg_volatility': float(rolling_vol.mean()),
                'volatility_std': float(rolling_vol.std()),
                'low_vol_periods': int(low_vol.sum()),
                'medium_vol_periods': int(medium_vol.sum()),
                'high_vol_periods': int(high_vol.sum()),
                'volatility_clustering': float(vol_clustering) if not np.isnan(vol_clustering) else 0,
                'volatility_persistence': float(vol_persistence) if not np.isnan(vol_persistence) else 0,
                'volatility_trend': 'increasing' if rolling_vol.iloc[-1] > rolling_vol.iloc[-20] else 'decreasing'
            }
            
        except Exception as e:
            logger.error(f"❌ {symbol} volatilite analiz hatası: {e}")
            return {'error': str(e)}
    
    def calculate_overall_statistics(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Genel istatistikleri hesapla"""
        try:
            successful_results = [r for r in results.values() if 'error' not in r]
            
            if not successful_results:
                return {'error': 'Başarılı analiz bulunamadı'}
            
            # Accuracy metrics
            accuracies = [r['accuracy_metrics']['combined_accuracy'] for r in successful_results if 'accuracy_metrics' in r]
            avg_accuracy = np.mean(accuracies) if accuracies else 0
            
            # Drawdown metrics
            max_drawdowns = [r['drawdown_analysis']['max_drawdown'] for r in successful_results if 'drawdown_analysis' in r]
            avg_max_drawdown = np.mean(max_drawdowns) if max_drawdowns else 0
            
            # Volatility metrics
            volatilities = [r['volatility_analysis']['current_volatility'] for r in successful_results if 'volatility_analysis' in r]
            avg_volatility = np.mean(volatilities) if volatilities else 0
            
            # Trend distribution
            trends = [r['trend_analysis']['current_trend'] for r in successful_results if 'trend_analysis' in r]
            trend_distribution = pd.Series(trends).value_counts().to_dict()
            
            # Top performers
            top_accuracy = sorted(successful_results, key=lambda x: x.get('accuracy_metrics', {}).get('combined_accuracy', 0), reverse=True)[:5]
            top_accuracy_symbols = [r['symbol'] for r in top_accuracy]
            
            # Worst performers
            worst_accuracy = sorted(successful_results, key=lambda x: x.get('accuracy_metrics', {}).get('combined_accuracy', 0))[:5]
            worst_accuracy_symbols = [r['symbol'] for r in worst_accuracy]
            
            return {
                'total_symbols': len(successful_results),
                'average_accuracy': float(avg_accuracy),
                'accuracy_std': float(np.std(accuracies)) if len(accuracies) > 1 else 0,
                'average_max_drawdown': float(avg_max_drawdown),
                'average_volatility': float(avg_volatility),
                'trend_distribution': trend_distribution,
                'top_5_accuracy': top_accuracy_symbols,
                'worst_5_accuracy': worst_accuracy_symbols,
                'accuracy_distribution': {
                    'excellent': len([a for a in accuracies if a >= 0.8]),
                    'good': len([a for a in accuracies if 0.6 <= a < 0.8]),
                    'fair': len([a for a in accuracies if 0.4 <= a < 0.6]),
                    'poor': len([a for a in accuracies if a < 0.4])
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Genel istatistik hesaplama hatası: {e}")
            return {'error': str(e)}
    
    def save_analysis_results(self, results: Dict[str, Any], summary: Dict[str, Any]):
        """Analiz sonuçlarını kaydet"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Detaylı sonuçlar
            detailed_file = self.data_dir / f"detailed_analysis_{timestamp}.json"
            with open(detailed_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            
            # Özet sonuçlar
            summary_file = self.data_dir / f"summary_analysis_{timestamp}.json"
            with open(summary_file, 'w', encoding='utf-8') as f:
                json.dump(summary, f, indent=2, ensure_ascii=False)
            
            # En güncel özet
            latest_summary = self.data_dir / "latest_summary.json"
            with open(latest_summary, 'w', encoding='utf-8') as f:
                json.dump({
                    'summary': summary,
                    'timestamp': datetime.now().isoformat(),
                    'total_symbols': len(results)
                }, f, indent=2, ensure_ascii=False)
            
            logger.info(f"✅ Analiz sonuçları kaydedildi: {detailed_file}, {summary_file}")
            
        except Exception as e:
            logger.error(f"❌ Sonuç kaydetme hatası: {e}")
    
    def generate_accuracy_report(self) -> Dict[str, Any]:
        """Doğruluk raporu oluştur"""
        try:
            # En güncel özeti oku
            latest_file = self.data_dir / "latest_summary.json"
            
            if not latest_file.exists():
                return {'error': 'Henüz analiz yapılmamış'}
            
            with open(latest_file, 'r', encoding='utf-8') as f:
                latest_data = json.load(f)
            
            summary = latest_data['summary']
            
            # Rapor formatı
            report = {
                'report_date': datetime.now().isoformat(),
                'analysis_summary': {
                    'total_symbols': summary['total_symbols'],
                    'overall_accuracy': f"{summary['average_accuracy']:.2%}",
                    'accuracy_grade': self.get_accuracy_grade(summary['average_accuracy']),
                    'best_performer': summary['top_5_accuracy'][0] if summary['top_5_accuracy'] else 'N/A',
                    'worst_performer': summary['worst_5_accuracy'][0] if summary['worst_5_accuracy'] else 'N/A'
                },
                'accuracy_distribution': summary['accuracy_distribution'],
                'trend_analysis': summary['trend_distribution'],
                'risk_metrics': {
                    'average_drawdown': f"{summary['average_max_drawdown']:.2%}",
                    'average_volatility': f"{summary['average_volatility']:.2%}"
                },
                'recommendations': self.generate_recommendations(summary)
            }
            
            return report
            
        except Exception as e:
            logger.error(f"❌ Rapor oluşturma hatası: {e}")
            return {'error': str(e)}
    
    def get_accuracy_grade(self, accuracy: float) -> str:
        """Doğruluk skoruna göre not ver"""
        if accuracy >= 0.8:
            return "A+ (Mükemmel)"
        elif accuracy >= 0.7:
            return "A (Çok İyi)"
        elif accuracy >= 0.6:
            return "B+ (İyi)"
        elif accuracy >= 0.5:
            return "B (Orta)"
        elif accuracy >= 0.4:
            return "C (Zayıf)"
        else:
            return "D (Çok Zayıf)"
    
    def generate_recommendations(self, summary: Dict[str, Any]) -> List[str]:
        """Öneriler oluştur"""
        recommendations = []
        
        if summary['average_accuracy'] < 0.6:
            recommendations.append("📉 Genel doğruluk düşük - Model optimizasyonu gerekli")
        
        if summary['average_max_drawdown'] < -0.15:
            recommendations.append("⚠️ Yüksek drawdown riski - Risk yönetimi iyileştirilmeli")
        
        if summary['average_volatility'] > 0.4:
            recommendations.append("📊 Yüksek volatilite - Daha stabil stratejiler gerekli")
        
        if summary['trend_distribution'].get('sideways', 0) > summary['total_symbols'] * 0.5:
            recommendations.append("🔄 Çok fazla sideways trend - Trend takip stratejileri geliştirilmeli")
        
        if summary['accuracy_distribution']['excellent'] < summary['total_symbols'] * 0.2:
            recommendations.append("🎯 Düşük excellent accuracy oranı - Model kalitesi artırılmalı")
        
        if not recommendations:
            recommendations.append("✅ Genel performans iyi - Mevcut stratejiler sürdürülmeli")
        
        return recommendations

def test_historical_analyzer():
    """Test function"""
    print("📊 Historical Accuracy Analyzer Test başlıyor...")
    print("=" * 60)
    
    analyzer = HistoricalAccuracyAnalyzer()
    
    # Test sembolleri
    test_symbols = ['SISE.IS', 'EREGL.IS', 'TUPRS.IS']
    
    print("🔍 Test sembolleri analiz ediliyor...")
    for symbol in test_symbols:
        print(f"\n📈 {symbol} analiz ediliyor...")
        analysis = analyzer.analyze_single_symbol(symbol)
        
        if 'error' not in analysis:
            accuracy = analysis['accuracy_metrics']['combined_accuracy']
            max_dd = analysis['drawdown_analysis']['max_drawdown']
            current_trend = analysis['trend_analysis']['current_trend']
            
            print(f"✅ {symbol}: Accuracy: {accuracy:.2%}, Max DD: {max_dd:.2%}, Trend: {current_trend}")
        else:
            print(f"❌ {symbol}: {analysis['error']}")
    
    print(f"\n📊 Genel analiz başlatılıyor...")
    results = analyzer.analyze_all_symbols()
    
    if 'error' not in results:
        print(f"✅ Genel analiz tamamlandı!")
        print(f"📈 Toplam sembol: {results['symbols_analyzed']}")
        print(f"🎯 Başarılı analiz: {results['successful_analyses']}")
        print(f"📊 Ortalama doğruluk: {results['overall_summary']['average_accuracy']:.2%}")
        
        # Rapor oluştur
        report = analyzer.generate_accuracy_report()
        print(f"\n📋 Rapor oluşturuldu!")
        print(f"📊 Genel doğruluk: {report['analysis_summary']['overall_accuracy']}")
        print(f"🏆 En iyi performans: {report['analysis_summary']['best_performer']}")
        
    else:
        print(f"❌ Genel analiz hatası: {results['error']}")
    
    print(f"\n✅ Historical Accuracy Analyzer test completed!")

if __name__ == "__main__":
    test_historical_analyzer()
