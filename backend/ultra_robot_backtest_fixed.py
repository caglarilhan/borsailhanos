"""
Ultra Trading Robot - Geçmişe Yönelik Backtest (Düzeltilmiş)
PRD v2.0 - Başarı oranı karşılaştırması
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple
import matplotlib.pyplot as plt
import seaborn as sns
from ultra_trading_robot import UltraTradingRobot, TimeFrame, StrategyType, TradingSignal

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UltraRobotBacktestFixed:
    """Ultra Trading Robot Backtest Engine (Düzeltilmiş)"""
    
    def __init__(self):
        self.robot = UltraTradingRobot()
        self.backtest_results = {}
        self.comparison_data = {}
        
    def run_historical_backtest(self, symbol: str, start_date: str, end_date: str, 
                               timeframes: List[TimeFrame]) -> Dict:
        """Geçmişe yönelik backtest çalıştır"""
        try:
            logger.info(f"🚀 {symbol} için geçmişe yönelik backtest başlatılıyor...")
            logger.info(f"📅 Tarih aralığı: {start_date} - {end_date}")
            logger.info(f"⏰ Zaman dilimleri: {[tf.value for tf in timeframes]}")
            
            # Strateji oluştur
            strategy = self.robot.create_multi_timeframe_strategy(symbol, timeframes)
            
            # Geçmiş veri çek (düzeltilmiş)
            historical_data = self._get_historical_data_fixed(symbol, start_date, end_date, timeframes)
            
            # Her zaman dilimi için backtest
            results = {}
            for timeframe in timeframes:
                logger.info(f"📊 {timeframe.value} zaman dilimi analiz ediliyor...")
                
                timeframe_data = historical_data.get(timeframe, pd.DataFrame())
                if not timeframe_data.empty:
                    timeframe_result = self._backtest_timeframe(symbol, timeframe, timeframe_data)
                    results[timeframe] = timeframe_result
                else:
                    logger.warning(f"⚠️ {timeframe.value} için veri bulunamadı")
            
            # Sonuçları kaydet
            self.backtest_results[symbol] = {
                "strategy": strategy,
                "results": results,
                "summary": self._calculate_summary_stats(results),
                "metadata": {
                    "symbol": symbol,
                    "start_date": start_date,
                    "end_date": end_date,
                    "timeframes": [tf.value for tf in timeframes],
                    "backtest_date": datetime.now().isoformat()
                }
            }
            
            logger.info(f"✅ {symbol} backtest tamamlandı!")
            return self.backtest_results[symbol]
            
        except Exception as e:
            logger.error(f"❌ Backtest hatası: {e}")
            return {"error": str(e)}
    
    def _get_historical_data_fixed(self, symbol: str, start_date: str, end_date: str, 
                                  timeframes: List[TimeFrame]) -> Dict[TimeFrame, pd.DataFrame]:
        """Geçmiş veri çek (düzeltilmiş)"""
        try:
            data = {}
            
            for timeframe in timeframes:
                logger.info(f"📥 {timeframe.value} verisi çekiliyor...")
                
                # Yahoo Finance'dan veri (düzeltilmiş)
                stock = yf.Ticker(symbol)
                
                try:
                    # Sadece start ve end date kullan, period kullanma
                    df = stock.history(start=start_date, end=end_date, interval=timeframe.value)
                    
                    if not df.empty:
                        data[timeframe] = df
                        logger.info(f"✅ {timeframe.value}: {len(df)} veri noktası")
                        
                        # Veri özeti
                        logger.info(f"   📊 Fiyat aralığı: {df['Close'].min():.2f} - {df['Close'].max():.2f}")
                        logger.info(f"   📈 İlk tarih: {df.index[0]}")
                        logger.info(f"   📉 Son tarih: {df.index[-1]}")
                    else:
                        logger.warning(f"⚠️ {timeframe.value}: Veri bulunamadı")
                        
                except Exception as e:
                    logger.error(f"❌ {timeframe.value} veri çekme hatası: {e}")
                    # Fallback: period kullan
                    try:
                        if timeframe in [TimeFrame.M1, TimeFrame.M15, TimeFrame.M30]:
                            period = "60d"
                        elif timeframe in [TimeFrame.H1, TimeFrame.H4]:
                            period = "2y"
                        else:
                            period = "5y"
                        
                        df = stock.history(period=period, interval=timeframe.value)
                        if not df.empty:
                            data[timeframe] = df
                            logger.info(f"✅ {timeframe.value} (fallback): {len(df)} veri noktası")
                        else:
                            logger.warning(f"⚠️ {timeframe.value} fallback da başarısız")
                    except Exception as fallback_error:
                        logger.error(f"❌ {timeframe.value} fallback hatası: {fallback_error}")
            
            return data
            
        except Exception as e:
            logger.error(f"❌ Veri çekme hatası: {e}")
            return {}
    
    def _backtest_timeframe(self, symbol: str, timeframe: TimeFrame, data: pd.DataFrame) -> Dict:
        """Tek zaman dilimi için backtest"""
        try:
            logger.info(f"🔍 {timeframe.value} analiz ediliyor...")
            
            # Teknik indikatörleri hesapla
            indicators = self._calculate_all_indicators(data)
            
            # Sinyal üret
            signals = self._generate_historical_signals(data, indicators, timeframe)
            
            # Trade simulation
            trades = self._simulate_trades(data, signals, timeframe)
            
            # Performance metrics
            performance = self._calculate_performance_metrics(trades, data)
            
            return {
                "data": data,
                "indicators": indicators,
                "signals": signals,
                "trades": trades,
                "performance": performance
            }
            
        except Exception as e:
            logger.error(f"❌ Zaman dilimi backtest hatası: {e}")
            return {"error": str(e)}
    
    def _calculate_all_indicators(self, data: pd.DataFrame) -> Dict:
        """Tüm teknik indikatörleri hesapla"""
        try:
            indicators = {}
            
            # RSI
            indicators["RSI"] = self._calculate_rsi(data['Close'])
            
            # MACD
            macd_data = self._calculate_macd(data['Close'])
            indicators["MACD"] = macd_data["macd"]
            indicators["MACD_Signal"] = macd_data["signal"]
            indicators["MACD_Histogram"] = macd_data["histogram"]
            
            # Bollinger Bands
            bb_data = self._calculate_bollinger_bands(data['Close'])
            indicators["BB_Upper"] = bb_data["upper"]
            indicators["BB_Lower"] = bb_data["lower"]
            indicators["BB_Middle"] = bb_data["middle"]
            indicators["BB_Width"] = bb_data["width"]
            indicators["BB_Position"] = bb_data["position"]
            
            # ATR
            indicators["ATR"] = self._calculate_atr(data)
            
            # Volume
            indicators["Volume_SMA"] = data['Volume'].rolling(20).mean()
            indicators["Volume_Ratio"] = data['Volume'] / indicators["Volume_SMA"]
            
            # Moving Averages
            indicators["SMA_20"] = data['Close'].rolling(20).mean()
            indicators["SMA_50"] = data['Close'].rolling(50).mean()
            indicators["EMA_12"] = data['Close'].ewm(span=12).mean()
            indicators["EMA_26"] = data['Close'].ewm(span=26).mean()
            
            # Stochastic
            stoch_data = self._calculate_stochastic(data)
            indicators["Stoch_K"] = stoch_data["k"]
            indicators["Stoch_D"] = stoch_data["d"]
            
            # ADX
            indicators["ADX"] = self._calculate_adx(data)
            
            # CCI
            indicators["CCI"] = self._calculate_cci(data)
            
            return indicators
            
        except Exception as e:
            logger.error(f"❌ İndikatör hesaplama hatası: {e}")
            return {}
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """RSI hesapla"""
        try:
            delta = prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(period).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            return rsi
        except:
            return pd.Series([50] * len(prices), index=prices.index)
    
    def _calculate_macd(self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Dict:
        """MACD hesapla"""
        try:
            ema_fast = prices.ewm(span=fast).mean()
            ema_slow = prices.ewm(span=slow).mean()
            macd = ema_fast - ema_slow
            signal_line = macd.ewm(span=signal).mean()
            histogram = macd - signal_line
            
            return {
                "macd": macd,
                "signal": signal_line,
                "histogram": histogram
            }
        except:
            zeros = pd.Series([0] * len(prices), index=prices.index)
            return {"macd": zeros, "signal": zeros, "histogram": zeros}
    
    def _calculate_bollinger_bands(self, prices: pd.Series, period: int = 20, std_dev: int = 2) -> Dict:
        """Bollinger Bands hesapla"""
        try:
            sma = prices.rolling(period).mean()
            std = prices.rolling(period).std()
            upper = sma + (std * std_dev)
            lower = sma - (std * std_dev)
            width = (upper - lower) / sma
            position = (prices - lower) / (upper - lower)
            
            return {
                "upper": upper,
                "lower": lower,
                "middle": sma,
                "width": width,
                "position": position
            }
        except:
            current_price = prices.iloc[-1] if not prices.empty else 0
            zeros = pd.Series([current_price] * len(prices), index=prices.index)
            return {"upper": zeros, "lower": zeros, "middle": zeros, "width": zeros, "position": zeros}
    
    def _calculate_atr(self, data: pd.DataFrame, period: int = 14) -> pd.Series:
        """ATR hesapla"""
        try:
            high_low = data['High'] - data['Low']
            high_close = np.abs(data['High'] - data['Close'].shift())
            low_close = np.abs(data['Low'] - data['Close'].shift())
            
            ranges = pd.concat([high_low, high_close, low_close], axis=1)
            true_range = np.max(ranges, axis=1)
            atr = true_range.rolling(period).mean()
            
            return atr
        except:
            return pd.Series([data['Close'].iloc[-1] * 0.01] * len(data), index=data.index)
    
    def _calculate_stochastic(self, data: pd.DataFrame, k_period: int = 14, d_period: int = 3) -> Dict:
        """Stochastic hesapla"""
        try:
            lowest_low = data['Low'].rolling(k_period).min()
            highest_high = data['High'].rolling(k_period).max()
            
            k = 100 * ((data['Close'] - lowest_low) / (highest_high - lowest_low))
            d = k.rolling(d_period).mean()
            
            return {"k": k, "d": d}
        except:
            zeros = pd.Series([50] * len(data), index=data.index)
            return {"k": zeros, "d": zeros}
    
    def _calculate_adx(self, data: pd.DataFrame, period: int = 14) -> pd.Series:
        """ADX hesapla (basitleştirilmiş)"""
        try:
            # Basit trend strength
            close_diff = data['Close'].diff()
            trend_strength = close_diff.rolling(period).std()
            adx = 100 * (trend_strength / data['Close'])
            return adx
        except:
            return pd.Series([25] * len(data), index=data.index)
    
    def _calculate_cci(self, data: pd.DataFrame, period: int = 20) -> pd.Series:
        """CCI hesapla"""
        try:
            typical_price = (data['High'] + data['Low'] + data['Close']) / 3
            sma = typical_price.rolling(period).mean()
            mad = typical_price.rolling(period).apply(lambda x: np.mean(np.abs(x - x.mean())))
            cci = (typical_price - sma) / (0.015 * mad)
            return cci
        except:
            return pd.Series([0] * len(data), index=data.index)
    
    def _generate_historical_signals(self, data: pd.DataFrame, indicators: Dict, timeframe: TimeFrame) -> List[Dict]:
        """Geçmiş sinyaller üret"""
        try:
            signals = []
            
            # Her gün için sinyal kontrol et (ilk 50 günü atla)
            start_index = max(50, len(data) // 10)  # En az %10 veri kullan
            
            for i in range(start_index, len(data)):
                signal = self._check_signal_at_point(data, indicators, i, timeframe)
                if signal:
                    signals.append(signal)
            
            logger.info(f"📊 {len(signals)} sinyal üretildi")
            return signals
            
        except Exception as e:
            logger.error(f"❌ Sinyal üretme hatası: {e}")
            return []
    
    def _check_signal_at_point(self, data: pd.DataFrame, indicators: Dict, index: int, timeframe: TimeFrame) -> Optional[Dict]:
        """Belirli bir noktada sinyal kontrol et"""
        try:
            current_price = data['Close'].iloc[index]
            current_volume = data['Volume'].iloc[index]
            
            # RSI
            rsi = indicators.get("RSI", pd.Series([50] * len(data))).iloc[index]
            
            # MACD
            macd = indicators.get("MACD", pd.Series([0] * len(data))).iloc[index]
            macd_signal = indicators.get("MACD_Signal", pd.Series([0] * len(data))).iloc[index]
            
            # Bollinger
            bb_position = indicators.get("BB_Position", pd.Series([0.5] * len(data))).iloc[index]
            
            # Volume
            volume_ratio = indicators.get("Volume_Ratio", pd.Series([1] * len(data))).iloc[index]
            
            # Signal logic
            signal_strength = 0.0
            action = "HOLD"
            reasons = []
            
            # RSI conditions
            if rsi < 30:
                signal_strength += 0.4
                reasons.append("RSI oversold")
            elif rsi > 70:
                signal_strength -= 0.4
                reasons.append("RSI overbought")
            
            # MACD conditions
            if macd > macd_signal:
                signal_strength += 0.3
                reasons.append("MACD bullish")
            else:
                signal_strength -= 0.3
                reasons.append("MACD bearish")
            
            # Bollinger conditions
            if bb_position < 0.2:
                signal_strength += 0.2
                reasons.append("Price near BB lower")
            elif bb_position > 0.8:
                signal_strength -= 0.2
                reasons.append("Price near BB upper")
            
            # Volume conditions
            if volume_ratio > 1.5:
                signal_strength += 0.1
                reasons.append("High volume")
            
            # Signal decision
            if signal_strength > 0.5:
                action = "BUY"
            elif signal_strength < -0.5:
                action = "SELL"
            
            if action == "HOLD":
                return None
            
            # Calculate levels
            atr = indicators.get("ATR", pd.Series([current_price * 0.01] * len(data))).iloc[index]
            stop_loss = current_price - (atr * 2) if action == "BUY" else current_price + (atr * 2)
            take_profit = current_price + (atr * 3) if action == "BUY" else current_price - (atr * 3)
            
            return {
                "date": data.index[index],
                "action": action,
                "price": current_price,
                "stop_loss": stop_loss,
                "take_profit": take_profit,
                "confidence": abs(signal_strength),
                "reasons": reasons,
                "volume_ratio": volume_ratio,
                "rsi": rsi,
                "macd": macd,
                "bb_position": bb_position
            }
            
        except Exception as e:
            return None
    
    def _simulate_trades(self, data: pd.DataFrame, signals: List[Dict], timeframe: TimeFrame) -> List[Dict]:
        """Trade simulation"""
        try:
            trades = []
            
            for signal in signals:
                if signal["action"] == "BUY":
                    # Entry
                    entry_price = signal["price"]
                    entry_date = signal["date"]
                    
                    # Find exit (stop loss or take profit)
                    exit_info = self._find_exit_point(data, signal, entry_date, "BUY")
                    
                    if exit_info:
                        trade = {
                            "entry_date": entry_date,
                            "entry_price": entry_price,
                            "exit_date": exit_info["date"],
                            "exit_price": exit_info["price"],
                            "exit_reason": exit_info["reason"],
                            "pnl": (exit_info["price"] - entry_price) / entry_price,
                            "hold_days": (exit_info["date"] - entry_date).days,
                            "signal_confidence": signal["confidence"]
                        }
                        trades.append(trade)
                
                elif signal["action"] == "SELL":
                    # Short position simulation
                    entry_price = signal["price"]
                    entry_date = signal["date"]
                    
                    exit_info = self._find_exit_point(data, signal, entry_date, "SELL")
                    
                    if exit_info:
                        trade = {
                            "entry_date": entry_date,
                            "entry_price": entry_price,
                            "exit_date": exit_info["date"],
                            "exit_price": exit_info["price"],
                            "exit_reason": exit_info["reason"],
                            "pnl": (entry_price - exit_info["price"]) / entry_price,
                            "hold_days": (exit_info["date"] - entry_date).days,
                            "signal_confidence": signal["confidence"]
                        }
                        trades.append(trade)
            
            logger.info(f"📈 {len(trades)} trade simüle edildi")
            return trades
            
        except Exception as e:
            logger.error(f"❌ Trade simulation hatası: {e}")
            return []
    
    def _find_exit_point(self, data: pd.DataFrame, signal: Dict, entry_date: datetime, action: str) -> Optional[Dict]:
        """Exit point bul"""
        try:
            # Entry date'den sonraki verileri al
            future_data = data[data.index > entry_date]
            
            if future_data.empty:
                return None
            
            entry_price = signal["price"]
            stop_loss = signal["stop_loss"]
            take_profit = signal["take_profit"]
            
            for date, row in future_data.iterrows():
                current_price = row['Close']
                
                # Stop loss check
                if action == "BUY" and current_price <= stop_loss:
                    return {"date": date, "price": current_price, "reason": "Stop Loss"}
                elif action == "SELL" and current_price >= stop_loss:
                    return {"date": date, "price": current_price, "reason": "Stop Loss"}
                
                # Take profit check
                if action == "BUY" and current_price >= take_profit:
                    return {"date": date, "price": current_price, "reason": "Take Profit"}
                elif action == "SELL" and current_price <= take_profit:
                    return {"date": date, "price": current_price, "reason": "Take Profit"}
            
            # Son fiyat ile exit
            last_price = future_data['Close'].iloc[-1]
            last_date = future_data.index[-1]
            
            return {"date": last_date, "price": last_price, "reason": "End of Data"}
            
        except Exception as e:
            return None
    
    def _calculate_performance_metrics(self, trades: List[Dict], data: pd.DataFrame) -> Dict:
        """Performance metrics hesapla"""
        try:
            if not trades:
                return {
                    "total_trades": 0,
                    "win_rate": 0,
                    "total_return": 0,
                    "avg_return": 0,
                    "best_trade": 0,
                    "worst_trade": 0,
                    "avg_hold_days": 0,
                    "sharpe_ratio": 0,
                    "max_drawdown": 0
                }
            
            # Basic metrics
            total_trades = len(trades)
            winning_trades = [t for t in trades if t["pnl"] > 0]
            losing_trades = [t for t in trades if t["pnl"] < 0]
            
            win_rate = len(winning_trades) / total_trades if total_trades > 0 else 0
            
            # Returns
            total_return = sum(t["pnl"] for t in trades)
            avg_return = total_return / total_trades if total_trades > 0 else 0
            
            best_trade = max(t["pnl"] for t in trades) if trades else 0
            worst_trade = min(t["pnl"] for t in trades) if trades else 0
            
            # Hold time
            avg_hold_days = sum(t["hold_days"] for t in trades) / total_trades if total_trades > 0 else 0
            
            # Sharpe ratio (basitleştirilmiş)
            returns = [t["pnl"] for t in trades]
            if returns:
                sharpe_ratio = np.mean(returns) / np.std(returns) if np.std(returns) > 0 else 0
            else:
                sharpe_ratio = 0
            
            # Max drawdown
            cumulative_returns = np.cumsum(returns)
            running_max = np.maximum.accumulate(cumulative_returns)
            drawdown = cumulative_returns - running_max
            max_drawdown = np.min(drawdown) if len(drawdown) > 0 else 0
            
            return {
                "total_trades": total_trades,
                "win_rate": win_rate,
                "total_return": total_return,
                "avg_return": avg_return,
                "best_trade": best_trade,
                "worst_trade": worst_trade,
                "avg_hold_days": avg_hold_days,
                "sharpe_ratio": sharpe_ratio,
                "max_drawdown": max_drawdown,
                "winning_trades": len(winning_trades),
                "losing_trades": len(losing_trades)
            }
            
        except Exception as e:
            logger.error(f"❌ Performance metrics hatası: {e}")
            return {}
    
    def _calculate_summary_stats(self, results: Dict) -> Dict:
        """Özet istatistikler"""
        try:
            summary = {
                "total_timeframes": len(results),
                "overall_performance": {},
                "timeframe_comparison": {},
                "best_timeframe": None,
                "worst_timeframe": None
            }
            
            # Her timeframe için performance
            timeframe_performances = {}
            for timeframe, result in results.items():
                if "performance" in result:
                    perf = result["performance"]
                    timeframe_performances[timeframe.value] = {
                        "win_rate": perf.get("win_rate", 0),
                        "total_return": perf.get("total_return", 0),
                        "sharpe_ratio": perf.get("sharpe_ratio", 0),
                        "total_trades": perf.get("total_trades", 0)
                    }
            
            # En iyi ve en kötü timeframe
            if timeframe_performances:
                best_tf = max(timeframe_performances.items(), key=lambda x: x[1]["total_return"])
                worst_tf = min(timeframe_performances.items(), key=lambda x: x[1]["total_return"])
                
                summary["best_timeframe"] = best_tf[0]
                summary["worst_timeframe"] = worst_tf[0]
            
            # Overall performance
            all_trades = []
            for result in results.values():
                if "trades" in result:
                    all_trades.extend(result["trades"])
            
            if all_trades:
                overall_perf = self._calculate_performance_metrics(all_trades, pd.DataFrame())
                summary["overall_performance"] = overall_perf
            
            summary["timeframe_comparison"] = timeframe_performances
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Özet istatistik hatası: {e}")
            return {}
    
    def compare_strategies(self, symbol: str, strategies: List[Dict]) -> Dict:
        """Farklı stratejileri karşılaştır"""
        try:
            logger.info(f"🔍 {symbol} için strateji karşılaştırması...")
            
            comparison = {
                "symbol": symbol,
                "strategies": {},
                "best_strategy": None,
                "summary": {}
            }
            
            for strategy in strategies:
                strategy_name = strategy["name"]
                logger.info(f"📊 {strategy_name} analiz ediliyor...")
                
                # Backtest çalıştır
                result = self.run_historical_backtest(
                    symbol=symbol,
                    start_date=strategy["start_date"],
                    end_date=strategy["start_date"],  # Sadece start date kullan
                    timeframes=strategy["timeframes"]
                )
                
                if "error" not in result:
                    comparison["strategies"][strategy_name] = result
                    
                    # Performance summary
                    summary = result.get("summary", {})
                    overall_perf = summary.get("overall_performance", {})
                    
                    comparison["strategies"][strategy_name]["performance_summary"] = {
                        "total_return": overall_perf.get("total_return", 0),
                        "win_rate": overall_perf.get("win_rate", 0),
                        "sharpe_ratio": overall_perf.get("sharpe_ratio", 0),
                        "total_trades": overall_perf.get("total_trades", 0)
                    }
            
            # En iyi stratejiyi bul
            if comparison["strategies"]:
                best_strategy = max(
                    comparison["strategies"].items(),
                    key=lambda x: x[1]["performance_summary"]["total_return"]
                )
                comparison["best_strategy"] = best_strategy[0]
            
            # Genel özet
            comparison["summary"] = {
                "total_strategies": len(comparison["strategies"]),
                "best_return": max(
                    [s["performance_summary"]["total_return"] for s in comparison["strategies"].values()],
                    default=0
                ),
                "avg_win_rate": np.mean([
                    s["performance_summary"]["win_rate"] for s in comparison["strategies"].values()
                ]),
                "comparison_date": datetime.now().isoformat()
            }
            
            self.comparison_data[symbol] = comparison
            
            logger.info(f"✅ {symbol} strateji karşılaştırması tamamlandı!")
            return comparison
            
        except Exception as e:
            logger.error(f"❌ Strateji karşılaştırma hatası: {e}")
            return {"error": str(e)}
    
    def generate_report(self, symbol: str) -> str:
        """Rapor oluştur"""
        try:
            if symbol not in self.comparison_data:
                return "Rapor bulunamadı. Önce karşılaştırma çalıştırın."
            
            comparison = self.comparison_data[symbol]
            
            report = f"""
# 🚀 ULTRA TRADING ROBOT - PERFORMANS RAPORU (DÜZELTİLMİŞ)
## 📊 {symbol} Analizi
**Rapor Tarihi:** {comparison['summary']['comparison_date']}

## 📈 GENEL ÖZET
- **Toplam Strateji:** {comparison['summary']['total_strategies']}
- **En İyi Getiri:** %{comparison['summary']['best_return']*100:.2f}
- **Ortalama Kazanma Oranı:** %{comparison['summary']['avg_win_rate']*100:.2f}

## 🏆 EN İYİ STRATEJİ
**{comparison['best_strategy']}** - {comparison['strategies'][comparison['best_strategy']]['performance_summary']['total_return']*100:.2f}% getiri

## 📊 STRATEJİ KARŞILAŞTIRMASI
"""
            
            for strategy_name, strategy_data in comparison["strategies"].items():
                perf = strategy_data["performance_summary"]
                report += f"""
### {strategy_name}
- **Toplam Getiri:** %{perf['total_return']*100:.2f}
- **Kazanma Oranı:** %{perf['win_rate']*100:.2f}
- **Sharpe Ratio:** {perf['sharpe_ratio']:.2f}
- **Toplam İşlem:** {perf['total_trades']}
"""
            
            return report
            
        except Exception as e:
            logger.error(f"❌ Rapor oluşturma hatası: {e}")
            return f"Rapor oluşturulamadı: {e}"

# Test fonksiyonu
if __name__ == "__main__":
    backtest = UltraRobotBacktestFixed()
    
    # Test stratejileri (düzeltilmiş)
    test_strategies = [
        {
            "name": "Scalping Strategy (5m-15m)",
            "start_date": "2024-01-01",
            "timeframes": [TimeFrame.M15]
        },
        {
            "name": "Swing Trading Strategy (1h-4h-1d)",
            "start_date": "2023-01-01",
            "timeframes": [TimeFrame.H1, TimeFrame.H4, TimeFrame.D1]
        },
        {
            "name": "Position Trading Strategy (1d-1wk)",
            "start_date": "2022-01-01",
            "timeframes": [TimeFrame.D1, TimeFrame.W1]
        }
    ]
    
    # Test sembolü
    test_symbol = "GARAN.IS"
    
    logger.info("🚀 Ultra Robot Backtest (Düzeltilmiş) başlatılıyor...")
    
    # Strateji karşılaştırması
    comparison = backtest.compare_strategies(test_symbol, test_strategies)
    
    if "error" not in comparison:
        # Rapor oluştur
        report = backtest.generate_report(test_symbol)
        print(report)
        
        # Sonuçları kaydet
        with open(f"backtest_report_fixed_{test_symbol}.txt", "w", encoding="utf-8") as f:
            f.write(report)
        
        logger.info(f"📄 Rapor kaydedildi: backtest_report_fixed_{test_symbol}.txt")
    else:
        logger.error(f"❌ Backtest hatası: {comparison['error']}")
