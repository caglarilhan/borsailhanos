"""
PRD v2.0 - Ultra Trading Robot
Dünyanın en güçlü al-sat robotu: Çoklu zaman dilimi + AI + Risk yönetimi
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple, Any
import asyncio
import json
from dataclasses import dataclass
from enum import Enum

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TimeFrame(Enum):
    """Zaman dilimleri"""
    M1 = "1m"      # 1 dakika
    M5 = "5m"      # 5 dakika
    M15 = "15m"    # 15 dakika
    M30 = "30m"    # 30 dakika
    H1 = "1h"      # 1 saat
    H4 = "4h"      # 4 saat
    D1 = "1d"      # 1 gün
    W1 = "1wk"     # 1 hafta
    M = "1mo"      # 1 ay

class StrategyType(Enum):
    """Strateji türleri"""
    SCALPING = "scalping"           # Saniye/dakika bazlı
    DAY_TRADING = "day_trading"     # Günlük işlemler
    SWING_TRADING = "swing_trading" # Haftalık işlemler
    POSITION_TRADING = "position"   # Aylık işlemler
    ARBITRAGE = "arbitrage"         # Arbitraj
    GRID_TRADING = "grid"           # Grid trading
    MARTINGALE = "martingale"       # Martingale
    MEAN_REVERSION = "mean_reversion" # Ortalama dönüşüm

@dataclass
class TradingSignal:
    """Trading sinyali"""
    symbol: str
    action: str  # BUY, SELL, HOLD
    timeframe: TimeFrame
    strategy: StrategyType
    confidence: float
    entry_price: float
    stop_loss: float
    take_profit: float
    position_size: float
    risk_reward: float
    timestamp: datetime
    reasons: List[str]
    technical_indicators: Dict
    fundamental_score: float
    sentiment_score: float

class UltraTradingRobot:
    """Dünyanın en güçlü al-sat robotu"""
    
    def __init__(self):
        self.active_strategies = {}
        self.portfolio = {}
        self.risk_manager = None
        self.performance_tracker = {}
        
        # Robot konfigürasyonu
        self.config = {
            "max_positions": 10,           # Maksimum pozisyon sayısı
            "max_risk_per_trade": 0.02,   # %2 maksimum risk
            "max_portfolio_risk": 0.10,   # %10 maksimum portföy riski
            "min_risk_reward": 2.0,       # Minimum risk/ödül oranı
            "max_drawdown": 0.15,         # %15 maksimum drawdown
            "auto_rebalance": True,       # Otomatik rebalancing
            "stop_loss_trailing": True,   # Trailing stop loss
            "partial_profit": True,       # Kısmi kar alma
            "hedging": True,              # Hedge işlemleri
            "correlation_filter": True,   # Korelasyon filtresi
        }
        
        # Zaman dilimi stratejileri
        self.timeframe_strategies = {
            TimeFrame.M1: {
                "strategies": [StrategyType.SCALPING],
                "indicators": ["RSI", "MACD", "Bollinger", "Volume"],
                "update_interval": 1,     # 1 saniye
                "max_hold_time": 300      # 5 dakika
            },
            # TimeFrame.M5 devre dışı (stabilite için kaldırıldı)
            TimeFrame.M15: {
                "strategies": [StrategyType.DAY_TRADING],
                "indicators": ["RSI", "MACD", "Bollinger", "Volume", "ATR", "Stochastic"],
                "update_interval": 15,    # 15 saniye
                "max_hold_time": 7200     # 2 saat
            },
            TimeFrame.H1: {
                "strategies": [StrategyType.DAY_TRADING, StrategyType.SWING_TRADING],
                "indicators": ["RSI", "MACD", "Bollinger", "Volume", "ATR", "Stochastic", "ADX"],
                "update_interval": 60,    # 1 dakika
                "max_hold_time": 86400    # 24 saat
            },
            TimeFrame.H4: {
                "strategies": [StrategyType.SWING_TRADING],
                "indicators": ["RSI", "MACD", "Bollinger", "Volume", "ATR", "Stochastic", "ADX", "CCI"],
                "update_interval": 240,   # 4 dakika
                "max_hold_time": 604800   # 1 hafta
            },
            TimeFrame.D1: {
                "strategies": [StrategyType.SWING_TRADING, StrategyType.POSITION_TRADING],
                "indicators": ["RSI", "MACD", "Bollinger", "Volume", "ATR", "Stochastic", "ADX", "CCI", "Williams %R"],
                "update_interval": 1440,  # 24 dakika
                "max_hold_time": 2592000  # 1 ay
            },
            TimeFrame.W1: {
                "strategies": [StrategyType.POSITION_TRADING],
                "indicators": ["RSI", "MACD", "Bollinger", "Volume", "ATR", "Stochastic", "ADX", "CCI", "Williams %R", "Ichimoku"],
                "update_interval": 10080, # 1 hafta
                "max_hold_time": 7776000  # 3 ay
            }
        }
        
        # Strateji parametreleri
        self.strategy_params = {
            StrategyType.SCALPING: {
                "min_volume": 1000000,    # Minimum hacim
                "max_spread": 0.001,      # Maksimum spread
                "min_volatility": 0.02,   # Minimum volatilite
                "profit_target": 0.005,   # %0.5 kar hedefi
                "stop_loss": 0.003,       # %0.3 stop loss
                "max_hold_time": 300      # 5 dakika
            },
            StrategyType.DAY_TRADING: {
                "min_volume": 500000,     # Minimum hacim
                "max_spread": 0.005,      # Maksimum spread
                "min_volatility": 0.015,  # Minimum volatilite
                "profit_target": 0.02,    # %2 kar hedefi
                "stop_loss": 0.01,        # %1 stop loss
                "max_hold_time": 86400    # 24 saat
            },
            StrategyType.SWING_TRADING: {
                "min_volume": 200000,     # Minimum hacim
                "max_spread": 0.01,       # Maksimum spread
                "min_volatility": 0.01,   # Minimum volatilite
                "profit_target": 0.05,    # %5 kar hedefi
                "stop_loss": 0.025,       # %2.5 stop loss
                "max_hold_time": 604800   # 1 hafta
            },
            StrategyType.POSITION_TRADING: {
                "min_volume": 100000,     # Minimum hacim
                "max_spread": 0.02,       # Maksimum spread
                "min_volatility": 0.008,  # Minimum volatilite
                "profit_target": 0.15,    # %15 kar hedefi
                "stop_loss": 0.05,        # %5 stop loss
                "max_hold_time": 2592000  # 1 ay
            }
        }
    
    def create_multi_timeframe_strategy(self, symbol: str, timeframes: List[TimeFrame]) -> Dict:
        """Çoklu zaman dilimi stratejisi oluştur"""
        try:
            logger.info(f"🚀 {symbol} için çoklu zaman dilimi stratejisi oluşturuluyor...")
            
            strategy_config = {
                "symbol": symbol,
                "timeframes": {},
                "signals": {},
                "portfolio_allocation": {},
                "risk_management": {},
                "performance_tracking": {}
            }
            
            # Her zaman dilimi için strateji
            for timeframe in timeframes:
                if timeframe in self.timeframe_strategies:
                    config = self.timeframe_strategies[timeframe]
                    
                    strategy_config["timeframes"][timeframe] = {
                        "strategies": config["strategies"],
                        "indicators": config["indicators"],
                        "update_interval": config["update_interval"],
                        "max_hold_time": config["max_hold_time"],
                        "active": True,
                        "last_update": datetime.now(),
                        "signals_generated": 0,
                        "successful_trades": 0,
                        "total_trades": 0
                    }
            
            # Portfolio allocation
            total_timeframes = len(timeframes)
            base_allocation = 1.0 / total_timeframes
            
            for timeframe in timeframes:
                strategy_config["portfolio_allocation"][timeframe] = {
                    "allocation": base_allocation,
                    "max_position_size": base_allocation * self.config["max_portfolio_risk"],
                    "current_positions": [],
                    "unrealized_pnl": 0.0,
                    "realized_pnl": 0.0
                }
            
            # Risk management
            strategy_config["risk_management"] = {
                "max_correlation": 0.7,           # Maksimum korelasyon
                "sector_diversification": True,   # Sektör çeşitlendirmesi
                "geographic_diversification": True, # Coğrafi çeşitlendirme
                "volatility_target": 0.15,       # Hedef volatilite
                "drawdown_limit": self.config["max_drawdown"],
                "rebalance_frequency": "daily"   # Günlük rebalancing
            }
            
            # Performance tracking
            strategy_config["performance_tracking"] = {
                "start_date": datetime.now(),
                "total_return": 0.0,
                "sharpe_ratio": 0.0,
                "max_drawdown": 0.0,
                "win_rate": 0.0,
                "profit_factor": 0.0,
                "average_trade": 0.0,
                "best_trade": 0.0,
                "worst_trade": 0.0
            }
            
            # Stratejiyi kaydet
            self.active_strategies[symbol] = strategy_config
            
            logger.info(f"✅ {symbol} çoklu zaman dilimi stratejisi oluşturuldu")
            logger.info(f"📊 Zaman dilimleri: {[tf.value for tf in timeframes]}")
            
            return strategy_config
            
        except Exception as e:
            logger.error(f"❌ Çoklu zaman dilimi stratejisi hatası: {e}")
            return {"error": str(e)}
    
    def generate_multi_timeframe_signals(self, symbol: str) -> List[TradingSignal]:
        """Çoklu zaman dilimi sinyalleri üret"""
        try:
            if symbol not in self.active_strategies:
                return []
            
            strategy = self.active_strategies[symbol]
            signals = []
            
            # Her zaman dilimi için sinyal üret
            for timeframe, config in strategy["timeframes"].items():
                if not config["active"]:
                    continue
                
                # Sinyal üret
                signal = self._generate_timeframe_signal(symbol, timeframe, config)
                if signal:
                    signals.append(signal)
                    
                    # Strateji güncelle
                    config["signals_generated"] += 1
                    config["last_update"] = datetime.now()
            
            # Sinyal filtreleme ve optimizasyon
            filtered_signals = self._filter_and_optimize_signals(signals)
            
            # Portfolio allocation güncelle
            self._update_portfolio_allocation(symbol, filtered_signals)
            
            return filtered_signals
            
        except Exception as e:
            logger.error(f"❌ Çoklu zaman dilimi sinyali hatası: {e}")
            return []
    
    def _generate_timeframe_signal(self, symbol: str, timeframe: TimeFrame, config: Dict) -> Optional[TradingSignal]:
        """Tek zaman dilimi için sinyal üret"""
        try:
            # Veri çek
            data = self._get_market_data(symbol, timeframe)
            if data.empty:
                return None
            
            # Teknik analiz
            technical_indicators = self._calculate_technical_indicators(data, config["indicators"])
            
            # Strateji bazlı sinyal üretimi
            signal = None
            
            for strategy_type in config["strategies"]:
                if strategy_type == StrategyType.SCALPING:
                    signal = self._scalping_signal(data, technical_indicators, timeframe)
                elif strategy_type == StrategyType.DAY_TRADING:
                    signal = self._day_trading_signal(data, technical_indicators, timeframe)
                elif strategy_type == StrategyType.SWING_TRADING:
                    signal = self._swing_trading_signal(data, technical_indicators, timeframe)
                elif strategy_type == StrategyType.POSITION_TRADING:
                    signal = self._position_trading_signal(data, technical_indicators, timeframe)
                
                if signal:
                    break
            
            if not signal:
                return None
            
            # Risk yönetimi
            risk_managed_signal = self._apply_risk_management(signal, timeframe)
            
            return risk_managed_signal
            
        except Exception as e:
            logger.error(f"❌ Zaman dilimi sinyali hatası: {e}")
            return None
    
    def _scalping_signal(self, data: pd.DataFrame, indicators: Dict, timeframe: TimeFrame) -> Optional[TradingSignal]:
        """Scalping sinyali"""
        try:
            # Son veriler
            current_price = data['Close'].iloc[-1]
            current_volume = data['Volume'].iloc[-1]
            
            # RSI
            rsi = indicators.get('RSI', 50)
            
            # MACD
            macd = indicators.get('MACD', 0)
            macd_signal = indicators.get('MACD_Signal', 0)
            
            # Bollinger Bands
            bb_upper = indicators.get('BB_Upper', current_price)
            bb_lower = indicators.get('BB_Lower', current_price)
            bb_position = (current_price - bb_lower) / (bb_upper - bb_lower) if bb_upper > bb_lower else 0.5
            
            # Volume analysis
            avg_volume = data['Volume'].rolling(20).mean().iloc[-1]
            volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1
            
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
            atr = indicators.get('ATR', current_price * 0.01)
            stop_loss = current_price - (atr * 2) if action == "BUY" else current_price + (atr * 2)
            take_profit = current_price + (atr * 3) if action == "BUY" else current_price - (atr * 3)
            
            # Position sizing
            risk_amount = self.config["max_risk_per_trade"]
            position_size = risk_amount / abs(current_price - stop_loss) if abs(current_price - stop_loss) > 0 else 0
            
            return TradingSignal(
                symbol=data.index.name if data.index.name else "UNKNOWN",
                action=action,
                timeframe=timeframe,
                strategy=StrategyType.SCALPING,
                confidence=abs(signal_strength),
                entry_price=current_price,
                stop_loss=stop_loss,
                take_profit=take_profit,
                position_size=position_size,
                risk_reward=abs(take_profit - current_price) / abs(current_price - stop_loss),
                timestamp=datetime.now(),
                reasons=reasons,
                technical_indicators=indicators,
                fundamental_score=0.5,  # Placeholder
                sentiment_score=0.5     # Placeholder
            )
            
        except Exception as e:
            logger.error(f"❌ Scalping sinyali hatası: {e}")
            return None
    
    def _day_trading_signal(self, data: pd.DataFrame, indicators: Dict, timeframe: TimeFrame) -> Optional[TradingSignal]:
        """Day trading sinyali"""
        try:
            # Day trading logic (daha detaylı)
            # ... (benzer mantık ama daha uzun vadeli)
            return None
        except Exception as e:
            logger.error(f"❌ Day trading sinyali hatası: {e}")
            return None
    
    def _swing_trading_signal(self, data: pd.DataFrame, indicators: Dict, timeframe: TimeFrame) -> Optional[TradingSignal]:
        """Swing trading sinyali"""
        try:
            # Swing trading logic
            # ... (haftalık trend analizi)
            return None
        except Exception as e:
            logger.error(f"❌ Swing trading sinyali hatası: {e}")
            return None
    
    def _position_trading_signal(self, data: pd.DataFrame, indicators: Dict, timeframe: TimeFrame) -> Optional[TradingSignal]:
        """Position trading sinyali"""
        try:
            # Position trading logic
            # ... (aylık trend analizi)
            return None
        except Exception as e:
            logger.error(f"❌ Position trading sinyali hatası: {e}")
            return None
    
    def _get_market_data(self, symbol: str, timeframe: TimeFrame) -> pd.DataFrame:
        """Market verisi çek"""
        try:
            # Yahoo Finance'dan veri
            stock = yf.Ticker(symbol)
            data = stock.history(period="2y", interval=timeframe.value)
            
            if data.empty:
                return pd.DataFrame()
            
            return data
            
        except Exception as e:
            logger.error(f"❌ Market veri hatası: {e}")
            return pd.DataFrame()
    
    def _calculate_technical_indicators(self, data: pd.DataFrame, indicators: List[str]) -> Dict:
        """Teknik indikatörleri hesapla"""
        try:
            result = {}
            
            # Basit hesaplamalar (gerçek uygulamada ta-lib kullanılacak)
            if "RSI" in indicators:
                result["RSI"] = self._calculate_rsi(data['Close'])
            
            if "MACD" in indicators:
                macd_data = self._calculate_macd(data['Close'])
                result["MACD"] = macd_data["macd"]
                result["MACD_Signal"] = macd_data["signal"]
            
            if "Bollinger" in indicators:
                bb_data = self._calculate_bollinger_bands(data['Close'])
                result["BB_Upper"] = bb_data["upper"]
                result["BB_Lower"] = bb_data["lower"]
                result["BB_Middle"] = bb_data["middle"]
            
            if "ATR" in indicators:
                result["ATR"] = self._calculate_atr(data)
            
            if "Volume" in indicators:
                result["Volume_SMA"] = data['Volume'].rolling(20).mean()
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Teknik indikatör hatası: {e}")
            return {}
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> float:
        """RSI hesapla"""
        try:
            delta = prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(period).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            return rsi.iloc[-1] if not rsi.empty else 50
        except:
            return 50
    
    def _calculate_macd(self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Dict:
        """MACD hesapla"""
        try:
            ema_fast = prices.ewm(span=fast).mean()
            ema_slow = prices.ewm(span=slow).mean()
            macd = ema_fast - ema_slow
            signal_line = macd.ewm(span=signal).mean()
            
            return {
                "macd": macd.iloc[-1] if not macd.empty else 0,
                "signal": signal_line.iloc[-1] if not signal_line.empty else 0
            }
        except:
            return {"macd": 0, "signal": 0}
    
    def _calculate_bollinger_bands(self, prices: pd.Series, period: int = 20, std_dev: int = 2) -> Dict:
        """Bollinger Bands hesapla"""
        try:
            sma = prices.rolling(period).mean()
            std = prices.rolling(period).std()
            upper = sma + (std * std_dev)
            lower = sma - (std * std_dev)
            
            return {
                "upper": upper.iloc[-1] if not upper.empty else prices.iloc[-1],
                "lower": lower.iloc[-1] if not lower.empty else prices.iloc[-1],
                "middle": sma.iloc[-1] if not sma.empty else prices.iloc[-1]
            }
        except:
            current_price = prices.iloc[-1] if not prices.empty else 0
            return {"upper": current_price, "lower": current_price, "middle": current_price}
    
    def _calculate_atr(self, data: pd.DataFrame, period: int = 14) -> float:
        """ATR hesapla"""
        try:
            high_low = data['High'] - data['Low']
            high_close = np.abs(data['High'] - data['Close'].shift())
            low_close = np.abs(data['Low'] - data['Close'].shift())
            
            ranges = pd.concat([high_low, high_close, low_close], axis=1)
            true_range = np.max(ranges, axis=1)
            atr = true_range.rolling(period).mean()
            
            return atr.iloc[-1] if not atr.empty else data['Close'].iloc[-1] * 0.01
        except:
            return data['Close'].iloc[-1] * 0.01 if not data.empty else 0
    
    def _filter_and_optimize_signals(self, signals: List[TradingSignal]) -> List[TradingSignal]:
        """Sinyalleri filtrele ve optimize et"""
        try:
            if not signals:
                return []
            
            # Confidence filter
            filtered_signals = [s for s in signals if s.confidence > 0.6]
            
            # Risk/reward filter
            filtered_signals = [s for s in filtered_signals if s.risk_reward > self.config["min_risk_reward"]]
            
            # Correlation filter
            if self.config["correlation_filter"]:
                filtered_signals = self._apply_correlation_filter(filtered_signals)
            
            # Portfolio allocation optimization
            optimized_signals = self._optimize_portfolio_allocation(filtered_signals)
            
            return optimized_signals
            
        except Exception as e:
            logger.error(f"❌ Sinyal filtreleme hatası: {e}")
            return signals
    
    def _apply_correlation_filter(self, signals: List[TradingSignal]) -> List[TradingSignal]:
        """Korelasyon filtresi uygula"""
        try:
            # Basit korelasyon filtresi
            # Gerçek uygulamada portföy korelasyon matrisi kullanılacak
            return signals
        except Exception as e:
            logger.error(f"❌ Korelasyon filtresi hatası: {e}")
            return signals
    
    def _optimize_portfolio_allocation(self, signals: List[TradingSignal]) -> List[TradingSignal]:
        """Portföy allocation optimizasyonu"""
        try:
            # Basit optimizasyon
            # Gerçek uygulamada Markowitz optimization kullanılacak
            return signals
        except Exception as e:
            logger.error(f"❌ Portfolio optimizasyon hatası: {e}")
            return signals
    
    def _apply_risk_management(self, signal: TradingSignal, timeframe: TimeFrame) -> TradingSignal:
        """Risk yönetimi uygula"""
        try:
            # Position sizing adjustment
            max_position = self.strategy_params[signal.strategy]["max_position_size"]
            signal.position_size = min(signal.position_size, max_position)
            
            # Stop loss adjustment
            max_stop_loss = self.strategy_params[signal.strategy]["stop_loss"]
            current_stop_loss = abs(signal.entry_price - signal.stop_loss) / signal.entry_price
            
            if current_stop_loss > max_stop_loss:
                if signal.action == "BUY":
                    signal.stop_loss = signal.entry_price * (1 - max_stop_loss)
                else:
                    signal.stop_loss = signal.entry_price * (1 + max_stop_loss)
            
            # Take profit adjustment
            min_profit = self.strategy_params[signal.strategy]["profit_target"]
            current_profit = abs(signal.take_profit - signal.entry_price) / signal.entry_price
            
            if current_profit < min_profit:
                if signal.action == "BUY":
                    signal.take_profit = signal.entry_price * (1 + min_profit)
                else:
                    signal.take_profit = signal.entry_price * (1 - min_profit)
            
            return signal
            
        except Exception as e:
            logger.error(f"❌ Risk yönetimi hatası: {e}")
            return signal
    
    def _update_portfolio_allocation(self, symbol: str, signals: List[TradingSignal]) -> None:
        """Portföy allocation güncelle"""
        try:
            if symbol not in self.active_strategies:
                return
            
            strategy = self.active_strategies[symbol]
            
            # Her zaman dilimi için allocation güncelle
            for timeframe in strategy["timeframes"]:
                timeframe_signals = [s for s in signals if s.timeframe == timeframe]
                
                if timeframe_signals:
                    # Başarı oranına göre allocation ayarla
                    success_rate = self._calculate_success_rate(timeframe_signals)
                    
                    # Allocation adjustment
                    base_allocation = strategy["portfolio_allocation"][timeframe]["allocation"]
                    adjusted_allocation = base_allocation * (1 + (success_rate - 0.5))
                    
                    strategy["portfolio_allocation"][timeframe]["allocation"] = max(0.1, min(0.5, adjusted_allocation))
            
        except Exception as e:
            logger.error(f"❌ Portfolio allocation güncelleme hatası: {e}")
    
    def _calculate_success_rate(self, signals: List[TradingSignal]) -> float:
        """Başarı oranı hesapla"""
        try:
            if not signals:
                return 0.5
            
            # Basit hesaplama (gerçek uygulamada trade history kullanılacak)
            return 0.6  # Placeholder
            
        except Exception as e:
            logger.error(f"❌ Başarı oranı hesaplama hatası: {e}")
            return 0.5
    
    def get_robot_status(self) -> Dict:
        """Robot durumu"""
        try:
            return {
                "active_strategies": len(self.active_strategies),
                "total_positions": sum(len(strategy["portfolio_allocation"]) for strategy in self.active_strategies.values()),
                "config": self.config,
                "performance": self._calculate_overall_performance(),
                "last_update": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"❌ Robot durumu hatası: {e}")
            return {"error": str(e)}
    
    def _calculate_overall_performance(self) -> Dict:
        """Genel performans hesapla"""
        try:
            total_return = 0.0
            total_trades = 0
            successful_trades = 0
            
            for strategy in self.active_strategies.values():
                for timeframe, config in strategy["timeframes"].items():
                    total_trades += config["total_trades"]
                    successful_trades += config["successful_trades"]
                
                for timeframe, allocation in strategy["portfolio_allocation"].items():
                    total_return += allocation["realized_pnl"]
            
            win_rate = successful_trades / total_trades if total_trades > 0 else 0
            
            return {
                "total_return": total_return,
                "total_trades": total_trades,
                "win_rate": win_rate,
                "sharpe_ratio": 0.0,  # Placeholder
                "max_drawdown": 0.0    # Placeholder
            }
            
        except Exception as e:
            logger.error(f"❌ Performans hesaplama hatası: {e}")
            return {}

# Test fonksiyonu
if __name__ == "__main__":
    robot = UltraTradingRobot()
    
    # Test
    logger.info("✅ Ultra Trading Robot hazır!")
    logger.info(f"📊 Desteklenen zaman dilimleri: {[tf.value for tf in TimeFrame]}")
    logger.info(f"🔧 Strateji türleri: {[st.value for st in StrategyType]}")
    
    # Test stratejisi
    test_symbol = "GARAN.IS"
    test_timeframes = [TimeFrame.M15, TimeFrame.H1]
    
    strategy = robot.create_multi_timeframe_strategy(test_symbol, test_timeframes)
    logger.info(f"📈 {test_symbol} stratejisi oluşturuldu")
    
    # Robot durumu
    status = robot.get_robot_status()
    logger.info(f"🤖 Robot durumu: {status}")
