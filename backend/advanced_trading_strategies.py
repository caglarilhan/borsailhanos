"""
Advanced Trading Strategies System
==================================

Bu modül gelişmiş trading stratejilerini içerir:

1. High Frequency Trading (HFT)
   - Scalping stratejileri
   - Market making
   - Latency arbitrage
   - Order flow prediction

2. Arbitrage Strategies
   - Statistical arbitrage
   - Triangular arbitrage
   - Cross-exchange arbitrage
   - Calendar arbitrage

3. Pairs Trading
   - Cointegration-based pairs
   - Correlation-based pairs
   - Mean reversion pairs
   - Momentum pairs

4. Advanced Order Types
   - Iceberg orders
   - TWAP/VWAP orders
   - Smart order routing
   - Dark pool strategies

5. Risk Management
   - Dynamic position sizing
   - Real-time risk monitoring
   - Circuit breakers
   - Portfolio heat maps
"""

import asyncio
import logging
import numpy as np
import pandas as pd
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Tuple, Any, Callable
import scipy.stats as stats
from scipy.optimize import minimize
import warnings
warnings.filterwarnings('ignore')

# Broker entegrasyonu (paper için otomatik emir)
from broker_integration_system import broker_manager, order_manager, OrderSide, BrokerType

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StrategyType(Enum):
    """Strateji türleri"""
    HFT_SCALPING = "hft_scalping"
    MARKET_MAKING = "market_making"
    STATISTICAL_ARBITRAGE = "statistical_arbitrage"
    TRIANGULAR_ARBITRAGE = "triangular_arbitrage"
    PAIRS_TRADING = "pairs_trading"
    MOMENTUM_ARBITRAGE = "momentum_arbitrage"
    MEAN_REVERSION = "mean_reversion"
    VOLATILITY_ARBITRAGE = "volatility_arbitrage"

class OrderFlow(Enum):
    """Order flow türleri"""
    BUY_PRESSURE = "buy_pressure"
    SELL_PRESSURE = "sell_pressure"
    NEUTRAL = "neutral"

class MarketRegime(Enum):
    """Market rejimleri"""
    TRENDING_UP = "trending_up"
    TRENDING_DOWN = "trending_down"
    RANGING = "ranging"
    HIGH_VOLATILITY = "high_volatility"
    LOW_VOLATILITY = "low_volatility"

@dataclass
class TradingSignal:
    """Trading sinyali"""
    symbol: str
    action: str  # BUY, SELL, HOLD
    confidence: float
    price: float
    quantity: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    strategy_type: StrategyType = StrategyType.HFT_SCALPING
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class MarketData:
    """Market verisi"""
    symbol: str
    price: float
    volume: float
    bid: float
    ask: float
    spread: float
    timestamp: datetime
    order_flow: OrderFlow = OrderFlow.NEUTRAL
    volatility: float = 0.0
    momentum: float = 0.0

@dataclass
class StrategyMetrics:
    """Strateji metrikleri"""
    total_trades: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    total_pnl: float = 0.0
    max_drawdown: float = 0.0
    sharpe_ratio: float = 0.0
    win_rate: float = 0.0
    avg_trade_duration: float = 0.0
    profit_factor: float = 0.0

class BaseStrategy(ABC):
    """Base strategy abstract class"""
    
    def __init__(self, name: str, symbols: List[str]):
        self.name = name
        self.symbols = symbols
        self.is_active = False
        self.metrics = StrategyMetrics()
        self.positions: Dict[str, float] = {}
        self.last_signals: Dict[str, TradingSignal] = {}
        
    @abstractmethod
    async def generate_signal(self, market_data: MarketData) -> Optional[TradingSignal]:
        """Sinyal üret"""
        pass
    
    @abstractmethod
    async def update_position(self, signal: TradingSignal) -> bool:
        """Pozisyon güncelle"""
        pass
    
    def calculate_metrics(self) -> StrategyMetrics:
        """Metrikleri hesapla"""
        if self.metrics.total_trades > 0:
            self.metrics.win_rate = self.metrics.winning_trades / self.metrics.total_trades
            if self.metrics.losing_trades > 0:
                self.metrics.profit_factor = self.metrics.winning_trades / self.metrics.losing_trades
        return self.metrics

class HFTStrategy(BaseStrategy):
    """High Frequency Trading Strategy"""
    
    def __init__(self, symbols: List[str], latency_threshold: float = 0.2):
        super().__init__("HFT_Scalping", symbols)
        self.latency_threshold = latency_threshold  # 200ms
        self.price_threshold = 0.0005  # 0.05%
        self.volume_threshold = 500
        self.order_flow_window = 10
        self.order_flow_history: Dict[str, List[OrderFlow]] = {}
        
    async def generate_signal(self, market_data: MarketData) -> Optional[TradingSignal]:
        """HFT sinyal üret"""
        symbol = market_data.symbol
        
        # Order flow analizi
        await self._update_order_flow(symbol, market_data.order_flow)
        
        # Latency kontrolü
        latency = (datetime.now() - market_data.timestamp).total_seconds()
        if latency > self.latency_threshold:
            return None
        
        # Spread analizi
        spread_pct = (market_data.ask - market_data.bid) / max(1e-6, market_data.price)
        if spread_pct > 0.003:  # Spread toleransı artırıldı (0.3%)
            return None
        
        # Volume analizi
        if market_data.volume < self.volume_threshold:
            return None
        
        # Momentum analizi
        momentum = market_data.momentum
        volatility = market_data.volatility
        
        # Sinyal üret
        if momentum > 0.15 and volatility < 0.05:  # Eşik gevşetildi
            return TradingSignal(
                symbol=symbol,
                action="BUY",
                confidence=min(0.9, max(0.2, momentum)),
                price=market_data.ask,
                quantity=self._calculate_position_size(symbol, market_data),
                strategy_type=StrategyType.HFT_SCALPING,
                metadata={
                    "momentum": momentum,
                    "volatility": volatility,
                    "spread": spread_pct,
                    "latency": latency
                }
            )
        elif momentum < -0.15 and volatility < 0.05:  # Eşik gevşetildi
            return TradingSignal(
                symbol=symbol,
                action="SELL",
                confidence=min(0.9, max(0.2, abs(momentum))),
                price=market_data.bid,
                quantity=self._calculate_position_size(symbol, market_data),
                strategy_type=StrategyType.HFT_SCALPING,
                metadata={
                    "momentum": momentum,
                    "volatility": volatility,
                    "spread": spread_pct,
                    "latency": latency
                }
            )
        # Order flow tabanlı opportunistic girişler
        elif market_data.order_flow == OrderFlow.BUY_PRESSURE and momentum > 0.0 and volatility < 0.06:
            return TradingSignal(
                symbol=symbol,
                action="BUY",
                confidence=0.25,
                price=market_data.ask,
                quantity=self._calculate_position_size(symbol, market_data) * 0.5,
                strategy_type=StrategyType.HFT_SCALPING,
                metadata={
                    "rule": "order_flow_buy",
                    "momentum": momentum,
                    "volatility": volatility,
                    "spread": spread_pct,
                    "latency": latency
                }
            )
        elif market_data.order_flow == OrderFlow.SELL_PRESSURE and momentum < 0.0 and volatility < 0.06:
            return TradingSignal(
                symbol=symbol,
                action="SELL",
                confidence=0.25,
                price=market_data.bid,
                quantity=self._calculate_position_size(symbol, market_data) * 0.5,
                strategy_type=StrategyType.HFT_SCALPING,
                metadata={
                    "rule": "order_flow_sell",
                    "momentum": momentum,
                    "volatility": volatility,
                    "spread": spread_pct,
                    "latency": latency
                }
            )
        
        return None
    
    async def _update_order_flow(self, symbol: str, order_flow: OrderFlow):
        """Order flow güncelle"""
        if symbol not in self.order_flow_history:
            self.order_flow_history[symbol] = []
        
        self.order_flow_history[symbol].append(order_flow)
        if len(self.order_flow_history[symbol]) > self.order_flow_window:
            self.order_flow_history[symbol].pop(0)
    
    def _calculate_position_size(self, symbol: str, market_data: MarketData) -> float:
        """Pozisyon boyutu hesapla"""
        # Kelly Criterion benzeri hesaplama
        confidence = min(0.9, abs(market_data.momentum))
        volatility = market_data.volatility
        
        # Risk-adjusted position size
        base_size = 1000  # Base position size
        risk_multiplier = confidence / (1 + volatility * 10)
        
        return base_size * risk_multiplier
    
    async def update_position(self, signal: TradingSignal) -> bool:
        """Pozisyon güncelle"""
        symbol = signal.symbol
        
        if signal.action == "BUY":
            self.positions[symbol] = self.positions.get(symbol, 0) + signal.quantity
        elif signal.action == "SELL":
            self.positions[symbol] = self.positions.get(symbol, 0) - signal.quantity
        
        self.last_signals[symbol] = signal
        self.metrics.total_trades += 1
        
        return True

class StatisticalArbitrageStrategy(BaseStrategy):
    """Statistical Arbitrage Strategy"""
    
    def __init__(self, symbols: List[str], lookback_period: int = 252):
        super().__init__("Statistical_Arbitrage", symbols)
        self.lookback_period = lookback_period
        self.z_score_threshold = 2.0
        self.cointegration_threshold = 0.05
        self.price_history: Dict[str, List[float]] = {}
        self.cointegration_pairs: List[Tuple[str, str]] = []
        
    async def generate_signal(self, market_data: MarketData) -> Optional[TradingSignal]:
        """Statistical arbitrage sinyal üret"""
        symbol = market_data.symbol
        
        # Price history güncelle
        if symbol not in self.price_history:
            self.price_history[symbol] = []
        
        self.price_history[symbol].append(market_data.price)
        if len(self.price_history[symbol]) > self.lookback_period:
            self.price_history[symbol].pop(0)
        
        # Yeterli veri yoksa bekle
        if len(self.price_history[symbol]) < 50:
            return None
        
        # Cointegration analizi
        await self._update_cointegration_pairs()
        
        # Her pair için sinyal kontrol et
        for pair_symbol, target_symbol in self.cointegration_pairs:
            if symbol in [pair_symbol, target_symbol]:
                signal = await self._check_pair_signal(pair_symbol, target_symbol)
                if signal:
                    return signal
        
        return None
    
    async def _update_cointegration_pairs(self):
        """Cointegration pair'ları güncelle"""
        symbols = list(self.price_history.keys())
        
        for i in range(len(symbols)):
            for j in range(i + 1, len(symbols)):
                symbol1, symbol2 = symbols[i], symbols[j]
                
                if (len(self.price_history[symbol1]) >= 50 and 
                    len(self.price_history[symbol2]) >= 50):
                    
                    # Cointegration test
                    is_cointegrated = await self._test_cointegration(
                        self.price_history[symbol1],
                        self.price_history[symbol2]
                    )
                    
                    if is_cointegrated:
                        pair = (symbol1, symbol2)
                        if pair not in self.cointegration_pairs:
                            self.cointegration_pairs.append(pair)
                            logger.info(f"Cointegrated pair found: {symbol1} - {symbol2}")
    
    async def _test_cointegration(self, series1: List[float], series2: List[float]) -> bool:
        """Cointegration test"""
        try:
            # Engle-Granger test
            from statsmodels.tsa.stattools import coint
            
            result = coint(series1, series2)
            p_value = result[1]
            
            return p_value < self.cointegration_threshold
        except:
            return False
    
    async def _check_pair_signal(self, symbol1: str, symbol2: str) -> Optional[TradingSignal]:
        """Pair sinyal kontrolü"""
        prices1 = np.array(self.price_history[symbol1])
        prices2 = np.array(self.price_history[symbol2])
        
        # Spread hesapla
        spread = prices1 - prices2
        
        # Z-score hesapla
        z_score = (spread[-1] - np.mean(spread)) / np.std(spread)
        
        # Sinyal üret
        if z_score > self.z_score_threshold:
            # Spread çok yüksek, symbol1 sat, symbol2 al
            return TradingSignal(
                symbol=symbol1,
                action="SELL",
                confidence=min(0.9, abs(z_score) / 3.0),
                price=self.price_history[symbol1][-1],
                quantity=1000,
                strategy_type=StrategyType.STATISTICAL_ARBITRAGE,
                metadata={
                    "pair_symbol": symbol2,
                    "z_score": z_score,
                    "spread": spread[-1]
                }
            )
        elif z_score < -self.z_score_threshold:
            # Spread çok düşük, symbol1 al, symbol2 sat
            return TradingSignal(
                symbol=symbol1,
                action="BUY",
                confidence=min(0.9, abs(z_score) / 3.0),
                price=self.price_history[symbol1][-1],
                quantity=1000,
                strategy_type=StrategyType.STATISTICAL_ARBITRAGE,
                metadata={
                    "pair_symbol": symbol2,
                    "z_score": z_score,
                    "spread": spread[-1]
                }
            )
        
        return None
    
    async def update_position(self, signal: TradingSignal) -> bool:
        """Pozisyon güncelle"""
        symbol = signal.symbol
        
        if signal.action == "BUY":
            self.positions[symbol] = self.positions.get(symbol, 0) + signal.quantity
        elif signal.action == "SELL":
            self.positions[symbol] = self.positions.get(symbol, 0) - signal.quantity
        
        self.last_signals[symbol] = signal
        self.metrics.total_trades += 1
        
        return True

class PairsTradingStrategy(BaseStrategy):
    """Pairs Trading Strategy"""
    
    def __init__(self, symbols: List[str], correlation_threshold: float = 0.7):
        super().__init__("Pairs_Trading", symbols)
        self.correlation_threshold = correlation_threshold
        self.mean_reversion_threshold = 1.5
        self.price_history: Dict[str, List[float]] = {}
        self.correlation_pairs: List[Tuple[str, str, float]] = []
        
    async def generate_signal(self, market_data: MarketData) -> Optional[TradingSignal]:
        """Pairs trading sinyal üret"""
        symbol = market_data.symbol
        
        # Price history güncelle
        if symbol not in self.price_history:
            self.price_history[symbol] = []
        
        self.price_history[symbol].append(market_data.price)
        if len(self.price_history[symbol]) > 100:
            self.price_history[symbol].pop(0)
        
        # Yeterli veri yoksa bekle
        if len(self.price_history[symbol]) < 30:
            return None
        
        # Correlation analizi
        await self._update_correlation_pairs()
        
        # Her pair için sinyal kontrol et
        for pair_symbol, target_symbol, correlation in self.correlation_pairs:
            if symbol in [pair_symbol, target_symbol]:
                signal = await self._check_correlation_signal(pair_symbol, target_symbol, correlation)
                if signal:
                    return signal
        
        return None
    
    async def _update_correlation_pairs(self):
        """Correlation pair'ları güncelle"""
        symbols = list(self.price_history.keys())
        
        for i in range(len(symbols)):
            for j in range(i + 1, len(symbols)):
                symbol1, symbol2 = symbols[i], symbols[j]
                
                if (len(self.price_history[symbol1]) >= 30 and 
                    len(self.price_history[symbol2]) >= 30):
                    
                    # Correlation hesapla
                    correlation = np.corrcoef(
                        self.price_history[symbol1][-30:],
                        self.price_history[symbol2][-30:]
                    )[0, 1]
                    
                    if abs(correlation) > self.correlation_threshold:
                        pair = (symbol1, symbol2, correlation)
                        if not any(p[0] == symbol1 and p[1] == symbol2 for p in self.correlation_pairs):
                            self.correlation_pairs.append(pair)
                            logger.info(f"Correlated pair found: {symbol1} - {symbol2} ({correlation:.3f})")
    
    async def _check_correlation_signal(self, symbol1: str, symbol2: str, correlation: float) -> Optional[TradingSignal]:
        """Correlation sinyal kontrolü"""
        prices1 = np.array(self.price_history[symbol1])
        prices2 = np.array(self.price_history[symbol2])
        
        # Price ratio hesapla
        ratio = prices1 / prices2
        
        # Z-score hesapla
        z_score = (ratio[-1] - np.mean(ratio)) / np.std(ratio)
        
        # Sinyal üret
        if z_score > self.mean_reversion_threshold:
            # Ratio çok yüksek, symbol1 sat, symbol2 al
            return TradingSignal(
                symbol=symbol1,
                action="SELL",
                confidence=min(0.9, abs(z_score) / 3.0),
                price=self.price_history[symbol1][-1],
                quantity=1000,
                strategy_type=StrategyType.PAIRS_TRADING,
                metadata={
                    "pair_symbol": symbol2,
                    "z_score": z_score,
                    "ratio": ratio[-1],
                    "correlation": correlation
                }
            )
        elif z_score < -self.mean_reversion_threshold:
            # Ratio çok düşük, symbol1 al, symbol2 sat
            return TradingSignal(
                symbol=symbol1,
                action="BUY",
                confidence=min(0.9, abs(z_score) / 3.0),
                price=self.price_history[symbol1][-1],
                quantity=1000,
                strategy_type=StrategyType.PAIRS_TRADING,
                metadata={
                    "pair_symbol": symbol2,
                    "z_score": z_score,
                    "ratio": ratio[-1],
                    "correlation": correlation
                }
            )
        
        return None
    
    async def update_position(self, signal: TradingSignal) -> bool:
        """Pozisyon güncelle"""
        symbol = signal.symbol
        
        if signal.action == "BUY":
            self.positions[symbol] = self.positions.get(symbol, 0) + signal.quantity
        elif signal.action == "SELL":
            self.positions[symbol] = self.positions.get(symbol, 0) - signal.quantity
        
        self.last_signals[symbol] = signal
        self.metrics.total_trades += 1
        
        return True

class MarketMakingStrategy(BaseStrategy):
    """Market Making Strategy"""
    
    def __init__(self, symbols: List[str], spread_multiplier: float = 1.5):
        super().__init__("Market_Making", symbols)
        self.spread_multiplier = spread_multiplier
        self.inventory_threshold = 10000
        self.price_history: Dict[str, List[float]] = {}
        
    async def generate_signal(self, market_data: MarketData) -> Optional[TradingSignal]:
        """Market making sinyal üret"""
        symbol = market_data.symbol
        
        # Price history güncelle
        if symbol not in self.price_history:
            self.price_history[symbol] = []
        
        self.price_history[symbol].append(market_data.price)
        if len(self.price_history[symbol]) > 20:
            self.price_history[symbol].pop(0)
        
        # Yeterli veri yoksa bekle
        if len(self.price_history[symbol]) < 10:
            return None
        
        # Inventory kontrolü
        current_position = self.positions.get(symbol, 0)
        
        # Volatility hesapla
        returns = np.diff(self.price_history[symbol])
        volatility = np.std(returns) if len(returns) > 1 else 0.01
        
        # Spread hesapla
        fair_value = np.mean(self.price_history[symbol])
        spread = volatility * self.spread_multiplier
        
        # Bid/Ask fiyatları
        bid_price = fair_value - spread / 2
        ask_price = fair_value + spread / 2
        
        # Inventory skew
        inventory_skew = current_position / self.inventory_threshold
        
        # Sinyal üret
        if current_position < -self.inventory_threshold * 0.5:
            # Çok fazla short pozisyon, al
            return TradingSignal(
                symbol=symbol,
                action="BUY",
                confidence=0.8,
                price=ask_price,
                quantity=1000,
                strategy_type=StrategyType.MARKET_MAKING,
                metadata={
                    "fair_value": fair_value,
                    "spread": spread,
                    "inventory_skew": inventory_skew,
                    "volatility": volatility
                }
            )
        elif current_position > self.inventory_threshold * 0.5:
            # Çok fazla long pozisyon, sat
            return TradingSignal(
                symbol=symbol,
                action="SELL",
                confidence=0.8,
                price=bid_price,
                quantity=1000,
                strategy_type=StrategyType.MARKET_MAKING,
                metadata={
                    "fair_value": fair_value,
                    "spread": spread,
                    "inventory_skew": inventory_skew,
                    "volatility": volatility
                }
            )
        
        return None
    
    async def update_position(self, signal: TradingSignal) -> bool:
        """Pozisyon güncelle"""
        symbol = signal.symbol
        
        if signal.action == "BUY":
            self.positions[symbol] = self.positions.get(symbol, 0) + signal.quantity
        elif signal.action == "SELL":
            self.positions[symbol] = self.positions.get(symbol, 0) - signal.quantity
        
        self.last_signals[symbol] = signal
        self.metrics.total_trades += 1
        
        return True

class AdvancedStrategyManager:
    """Gelişmiş strateji yöneticisi"""
    
    def __init__(self):
        self.strategies: Dict[str, BaseStrategy] = {}
        self.market_data_buffer: Dict[str, List[MarketData]] = {}
        self.is_running = False
        
    def add_strategy(self, strategy: BaseStrategy):
        """Strateji ekle"""
        self.strategies[strategy.name] = strategy
        logger.info(f"Strategy added: {strategy.name}")
    
    def remove_strategy(self, strategy_name: str):
        """Strateji kaldır"""
        if strategy_name in self.strategies:
            del self.strategies[strategy_name]
            logger.info(f"Strategy removed: {strategy_name}")
    
    async def start(self):
        """Strateji yöneticisini başlat"""
        self.is_running = True
        logger.info("Advanced Strategy Manager started")
        
        # Her stratejiyi başlat
        for strategy in self.strategies.values():
            strategy.is_active = True
        
        # Ana döngü
        while self.is_running:
            await self._process_market_data()
            await asyncio.sleep(0.1)  # 100ms interval
    
    async def stop(self):
        """Strateji yöneticisini durdur"""
        self.is_running = False
        logger.info("Advanced Strategy Manager stopped")
        
        # Her stratejiyi durdur
        for strategy in self.strategies.values():
            strategy.is_active = False
    
    async def add_market_data(self, market_data: MarketData):
        """Market verisi ekle"""
        symbol = market_data.symbol
        
        if symbol not in self.market_data_buffer:
            self.market_data_buffer[symbol] = []
        
        self.market_data_buffer[symbol].append(market_data)
        
        # Buffer'ı temizle (son 100 veri)
        if len(self.market_data_buffer[symbol]) > 100:
            self.market_data_buffer[symbol].pop(0)
    
    async def _process_market_data(self):
        """Market verilerini işle"""
        for symbol, data_list in self.market_data_buffer.items():
            if not data_list:
                continue
            
            latest_data = data_list[-1]
            
            # Her strateji için sinyal üret
            for strategy in self.strategies.values():
                if strategy.is_active and symbol in strategy.symbols:
                    try:
                        signal = await strategy.generate_signal(latest_data)
                        if signal:
                            await strategy.update_position(signal)
                            logger.info(f"Signal generated: {strategy.name} - {signal.symbol} - {signal.action}")
                            # Oto-emir: sadece paper_trading bağlıysa market order gönder
                            try:
                                if broker_manager.active_broker_type == BrokerType.PAPER_TRADING:
                                    side = OrderSide.BUY if signal.action == "BUY" else OrderSide.SELL
                                    qty = max(1, int(signal.quantity // 1))
                                    await order_manager.create_market_order(signal.symbol, side, qty)
                            except Exception as e:
                                logger.warning(f"Auto-order error: {e}")
                    except Exception as e:
                        logger.error(f"Strategy error: {strategy.name} - {e}")
    
    def get_strategy_metrics(self) -> Dict[str, StrategyMetrics]:
        """Strateji metriklerini al"""
        metrics = {}
        for name, strategy in self.strategies.items():
            metrics[name] = strategy.calculate_metrics()
        return metrics
    
    def get_positions(self) -> Dict[str, Dict[str, float]]:
        """Pozisyonları al"""
        positions = {}
        for name, strategy in self.strategies.items():
            positions[name] = strategy.positions.copy()
        return positions

class RiskManager:
    """Risk yöneticisi"""
    
    def __init__(self, max_position_size: float = 100000, max_drawdown: float = 0.1):
        self.max_position_size = max_position_size
        self.max_drawdown = max_drawdown
        self.current_drawdown = 0.0
        self.peak_equity = 0.0
        
    def check_risk(self, signal: TradingSignal, current_positions: Dict[str, float]) -> Tuple[bool, str]:
        """Risk kontrolü"""
        symbol = signal.symbol
        
        # Position size kontrolü
        current_position = current_positions.get(symbol, 0)
        new_position = current_position + (signal.quantity if signal.action == "BUY" else -signal.quantity)
        
        if abs(new_position) > self.max_position_size:
            return False, f"Position size too large: {new_position}"
        
        # Drawdown kontrolü
        if self.current_drawdown > self.max_drawdown:
            return False, f"Drawdown limit exceeded: {self.current_drawdown:.2%}"
        
        return True, "Risk check passed"
    
    def update_equity(self, equity: float):
        """Equity güncelle"""
        if equity > self.peak_equity:
            self.peak_equity = equity
        
        self.current_drawdown = (self.peak_equity - equity) / self.peak_equity if self.peak_equity > 0 else 0.0

# Global instances
strategy_manager = AdvancedStrategyManager()
risk_manager = RiskManager()

# Test function
async def test_advanced_strategies():
    """Gelişmiş stratejiler testi"""
    print("🚀 Advanced Trading Strategies test başlıyor...")
    
    try:
        # Mock market data
        symbols = ["AAPL", "GOOGL", "MSFT", "TSLA"]
        
        # Stratejileri ekle
        hft_strategy = HFTStrategy(symbols)
        stat_arb_strategy = StatisticalArbitrageStrategy(symbols)
        pairs_strategy = PairsTradingStrategy(symbols)
        market_making_strategy = MarketMakingStrategy(symbols)
        
        strategy_manager.add_strategy(hft_strategy)
        strategy_manager.add_strategy(stat_arb_strategy)
        strategy_manager.add_strategy(pairs_strategy)
        strategy_manager.add_strategy(market_making_strategy)
        
        # Mock market data üret
        for i in range(100):
            for symbol in symbols:
                # Mock price data
                base_price = 100 + i * 0.1
                price = base_price + np.random.normal(0, 0.5)
                volume = np.random.randint(1000, 10000)
                
                market_data = MarketData(
                    symbol=symbol,
                    price=price,
                    volume=volume,
                    bid=price - 0.01,
                    ask=price + 0.01,
                    spread=0.02,
                    timestamp=datetime.now(),
                    order_flow=OrderFlow.BUY_PRESSURE if np.random.random() > 0.5 else OrderFlow.SELL_PRESSURE,
                    volatility=np.random.uniform(0.01, 0.05),
                    momentum=np.random.uniform(-1, 1)
                )
                
                await strategy_manager.add_market_data(market_data)
            
            await asyncio.sleep(0.01)  # 10ms
        
        # Metrikleri al
        metrics = strategy_manager.get_strategy_metrics()
        positions = strategy_manager.get_positions()
        
        print("📊 Strategy Metrics:")
        for name, metric in metrics.items():
            print(f"  {name}:")
            print(f"    Total Trades: {metric.total_trades}")
            print(f"    Win Rate: {metric.win_rate:.2%}")
            print(f"    Total P&L: {metric.total_pnl:.2f}")
        
        print("📈 Positions:")
        for name, pos in positions.items():
            print(f"  {name}: {pos}")
        
        print("🎉 Advanced Trading Strategies test tamamlandı!")
        
    except Exception as e:
        print(f"❌ Test hatası: {e}")
        logger.error(f"Advanced strategies test error: {e}")

if __name__ == "__main__":
    asyncio.run(test_advanced_strategies())
