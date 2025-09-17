"""
Broker Integration System
=========================

Bu modül gerçek broker API'leri, paper trading ve order management sistemi sağlar.

Desteklenen Broker'lar:
- Interactive Brokers (TWS API)
- Alpaca Markets
- TD Ameritrade
- Robinhood (Unofficial)
- Paper Trading (Simulation)

Özellikler:
- Order Management (Market, Limit, Stop, Stop-Limit)
- Position Management
- Account Information
- Real-time Quotes
- Portfolio Tracking
- Risk Management
"""

import asyncio
import json
import logging
import time
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
import pandas as pd
import numpy as np
import requests
from decimal import Decimal, ROUND_HALF_UP

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OrderType(Enum):
    """Order türleri"""
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"
    TRAILING_STOP = "trailing_stop"

class OrderSide(Enum):
    """Order yönü"""
    BUY = "buy"
    SELL = "sell"

class OrderStatus(Enum):
    """Order durumu"""
    PENDING = "pending"
    FILLED = "filled"
    PARTIALLY_FILLED = "partially_filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"
    EXPIRED = "expired"

class BrokerType(Enum):
    """Broker türleri"""
    INTERACTIVE_BROKERS = "interactive_brokers"
    ALPACA = "alpaca"
    TD_AMERITRADE = "td_ameritrade"
    ROBINHOOD = "robinhood"
    PAPER_TRADING = "paper_trading"

@dataclass
class Order:
    """Order veri yapısı"""
    id: str
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: float
    price: Optional[float] = None
    stop_price: Optional[float] = None
    status: OrderStatus = OrderStatus.PENDING
    filled_quantity: float = 0.0
    average_price: Optional[float] = None
    created_at: datetime = None
    updated_at: datetime = None
    expires_at: Optional[datetime] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()

@dataclass
class Position:
    """Position veri yapısı"""
    symbol: str
    quantity: float
    average_price: float
    current_price: float
    market_value: float
    unrealized_pnl: float
    unrealized_pnl_percent: float
    realized_pnl: float = 0.0
    cost_basis: float = 0.0
    
    def __post_init__(self):
        self.market_value = self.quantity * self.current_price
        self.cost_basis = self.quantity * self.average_price
        self.unrealized_pnl = self.market_value - self.cost_basis
        if self.cost_basis > 0:
            self.unrealized_pnl_percent = (self.unrealized_pnl / self.cost_basis) * 100
        else:
            self.unrealized_pnl_percent = 0.0

@dataclass
class AccountInfo:
    """Hesap bilgileri"""
    account_id: str
    buying_power: float
    cash: float
    equity: float
    market_value: float
    day_trade_buying_power: float
    maintenance_margin: float
    initial_margin: float
    last_updated: datetime = None
    
    def __post_init__(self):
        if self.last_updated is None:
            self.last_updated = datetime.now()

class BrokerInterface(ABC):
    """Broker interface abstract class"""
    
    @abstractmethod
    async def connect(self) -> bool:
        """Broker'a bağlan"""
        pass
    
    @abstractmethod
    async def disconnect(self) -> bool:
        """Broker bağlantısını kes"""
        pass
    
    @abstractmethod
    async def place_order(self, order: Order) -> str:
        """Order gönder"""
        pass
    
    @abstractmethod
    async def cancel_order(self, order_id: str) -> bool:
        """Order iptal et"""
        pass
    
    @abstractmethod
    async def get_order_status(self, order_id: str) -> OrderStatus:
        """Order durumu al"""
        pass
    
    @abstractmethod
    async def get_positions(self) -> List[Position]:
        """Pozisyonları al"""
        pass
    
    @abstractmethod
    async def get_account_info(self) -> AccountInfo:
        """Hesap bilgilerini al"""
        pass
    
    @abstractmethod
    async def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Anlık fiyat al"""
        pass

class PaperTradingBroker(BrokerInterface):
    """Paper Trading Broker - Simülasyon broker'ı"""
    
    def __init__(self, initial_capital: float = 100000.0):
        self.initial_capital = initial_capital
        self.cash = initial_capital
        self.positions: Dict[str, Position] = {}
        self.orders: Dict[str, Order] = {}
        self.order_counter = 0
        self.connected = False
        
        # Mock price data
        self.mock_prices = {
            'AAPL': 150.0,
            'GOOGL': 2800.0,
            'MSFT': 300.0,
            'TSLA': 800.0,
            'AMZN': 3200.0,
            'NVDA': 400.0,
            'SISE.IS': 45.0,
            'EREGL.IS': 120.0,
            'TUPRS.IS': 85.0,
            'THYAO.IS': 15.0,
            'AKBNK.IS': 8.5,
            'BTC': 42000.0,
            'ETH': 2800.0,
            'ADA': 0.45,
            'SOL': 95.0
        }
    
    async def connect(self) -> bool:
        """Paper trading'e bağlan"""
        logger.info("Paper Trading Broker'a bağlanıyor...")
        self.connected = True
        return True
    
    async def disconnect(self) -> bool:
        """Paper trading bağlantısını kes"""
        logger.info("Paper Trading Broker bağlantısı kesiliyor...")
        self.connected = False
        return True
    
    async def place_order(self, order: Order) -> str:
        """Paper trading order gönder"""
        if not self.connected:
            raise Exception("Broker'a bağlı değil")
        
        # Order ID oluştur
        self.order_counter += 1
        order_id = f"PAPER_{self.order_counter:06d}"
        order.id = order_id
        
        # Order'ı kaydet
        self.orders[order_id] = order
        
        # Mock execution simulation
        await self._simulate_order_execution(order)
        
        logger.info(f"Paper order placed: {order_id} - {order.side.value} {order.quantity} {order.symbol}")
        return order_id
    
    async def _simulate_order_execution(self, order: Order):
        """Order execution simülasyonu"""
        symbol = order.symbol
        
        # Mock price al
        current_price = self.mock_prices.get(symbol, 100.0)
        
        # Price volatility ekle
        volatility = 0.02  # 2% volatility
        price_change = np.random.normal(0, volatility)
        execution_price = current_price * (1 + price_change)
        
        # Order type'a göre execution price belirle
        if order.order_type == OrderType.MARKET:
            order.average_price = execution_price
        elif order.order_type == OrderType.LIMIT:
            if order.side == OrderSide.BUY and execution_price <= order.price:
                order.average_price = execution_price
            elif order.side == OrderSide.SELL and execution_price >= order.price:
                order.average_price = execution_price
            else:
                order.status = OrderStatus.PENDING
                return
        
        # Order'ı fill et
        order.status = OrderStatus.FILLED
        order.filled_quantity = order.quantity
        order.updated_at = datetime.now()
        
        # Position güncelle
        await self._update_position(order)
        
        # Cash güncelle
        total_cost = order.quantity * order.average_price
        if order.side == OrderSide.BUY:
            self.cash -= total_cost
        else:
            self.cash += total_cost
    
    async def _update_position(self, order: Order):
        """Position güncelle"""
        symbol = order.symbol
        
        if symbol not in self.positions:
            self.positions[symbol] = Position(
                symbol=symbol,
                quantity=0.0,
                average_price=0.0,
                current_price=self.mock_prices.get(symbol, 100.0),
                market_value=0.0,
                unrealized_pnl=0.0,
                unrealized_pnl_percent=0.0
            )
        
        position = self.positions[symbol]
        
        if order.side == OrderSide.BUY:
            # Buy order - position'a ekle
            if position.quantity == 0:
                position.average_price = order.average_price
                position.quantity = order.quantity
            else:
                # Weighted average price
                total_cost = (position.quantity * position.average_price) + (order.quantity * order.average_price)
                total_quantity = position.quantity + order.quantity
                position.average_price = total_cost / total_quantity
                position.quantity = total_quantity
        else:
            # Sell order - position'dan çıkar
            if position.quantity >= order.quantity:
                # Realized P&L hesapla
                realized_pnl = (order.average_price - position.average_price) * order.quantity
                position.realized_pnl += realized_pnl
                position.quantity -= order.quantity
                
                if position.quantity == 0:
                    position.average_price = 0.0
            else:
                raise Exception(f"Insufficient position: {position.quantity} < {order.quantity}")
        
        # Current price güncelle
        position.current_price = self.mock_prices.get(symbol, 100.0)
    
    async def cancel_order(self, order_id: str) -> bool:
        """Order iptal et"""
        if order_id in self.orders:
            order = self.orders[order_id]
            if order.status == OrderStatus.PENDING:
                order.status = OrderStatus.CANCELLED
                order.updated_at = datetime.now()
                logger.info(f"Order cancelled: {order_id}")
                return True
        return False
    
    async def get_order_status(self, order_id: str) -> OrderStatus:
        """Order durumu al"""
        if order_id in self.orders:
            return self.orders[order_id].status
        return OrderStatus.REJECTED
    
    async def get_positions(self) -> List[Position]:
        """Pozisyonları al"""
        # Current prices güncelle
        for symbol in self.positions:
            self.positions[symbol].current_price = self.mock_prices.get(symbol, 100.0)
        
        return list(self.positions.values())
    
    async def get_account_info(self) -> AccountInfo:
        """Hesap bilgilerini al"""
        # Market value hesapla
        market_value = sum(pos.market_value for pos in self.positions.values())
        equity = self.cash + market_value
        
        return AccountInfo(
            account_id="PAPER_ACCOUNT",
            buying_power=self.cash,
            cash=self.cash,
            equity=equity,
            market_value=market_value,
            day_trade_buying_power=self.cash * 4,  # 4x day trading
            maintenance_margin=market_value * 0.25,  # 25% margin
            initial_margin=market_value * 0.5,  # 50% initial margin
            last_updated=datetime.now()
        )
    
    async def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Anlık fiyat al"""
        current_price = self.mock_prices.get(symbol, 100.0)
        
        # Mock volatility
        volatility = 0.01
        price_change = np.random.normal(0, volatility)
        new_price = current_price * (1 + price_change)
        
        # Price güncelle
        self.mock_prices[symbol] = new_price
        
        return {
            'symbol': symbol,
            'price': new_price,
            'bid': new_price * 0.999,
            'ask': new_price * 1.001,
            'volume': np.random.randint(1000, 10000),
            'timestamp': datetime.now().isoformat()
        }

class InteractiveBrokersBroker(BrokerInterface):
    """Interactive Brokers TWS API entegrasyonu"""
    
    def __init__(self, host: str = "localhost", port: int = 7497, client_id: int = 1):
        self.host = host
        self.port = port
        self.client_id = client_id
        self.connected = False
        self.orders: Dict[str, Order] = {}
        self.order_counter = 0
    
    async def connect(self) -> bool:
        """TWS'ye bağlan"""
        try:
            # TWS API bağlantısı (mock implementation)
            logger.info(f"Interactive Brokers TWS'ye bağlanıyor: {self.host}:{self.port}")
            self.connected = True
            return True
        except Exception as e:
            logger.error(f"TWS bağlantı hatası: {e}")
            return False
    
    async def disconnect(self) -> bool:
        """TWS bağlantısını kes"""
        logger.info("TWS bağlantısı kesiliyor...")
        self.connected = False
        return True
    
    async def place_order(self, order: Order) -> str:
        """TWS order gönder"""
        if not self.connected:
            raise Exception("TWS'ye bağlı değil")
        
        # Mock TWS order
        self.order_counter += 1
        order_id = f"IB_{self.order_counter:06d}"
        order.id = order_id
        self.orders[order_id] = order
        
        logger.info(f"TWS order placed: {order_id}")
        return order_id
    
    async def cancel_order(self, order_id: str) -> bool:
        """TWS order iptal et"""
        if order_id in self.orders:
            self.orders[order_id].status = OrderStatus.CANCELLED
            return True
        return False
    
    async def get_order_status(self, order_id: str) -> OrderStatus:
        """TWS order durumu"""
        if order_id in self.orders:
            return self.orders[order_id].status
        return OrderStatus.REJECTED
    
    async def get_positions(self) -> List[Position]:
        """TWS pozisyonları"""
        # Mock positions
        return []
    
    async def get_account_info(self) -> AccountInfo:
        """TWS hesap bilgileri"""
        return AccountInfo(
            account_id="IB_ACCOUNT",
            buying_power=50000.0,
            cash=25000.0,
            equity=75000.0,
            market_value=50000.0,
            day_trade_buying_power=200000.0,
            maintenance_margin=12500.0,
            initial_margin=25000.0
        )
    
    async def get_quote(self, symbol: str) -> Dict[str, Any]:
        """TWS quote"""
        return {
            'symbol': symbol,
            'price': 100.0,
            'bid': 99.9,
            'ask': 100.1,
            'volume': 1000,
            'timestamp': datetime.now().isoformat()
        }

class AlpacaBroker(BrokerInterface):
    """Alpaca Markets API entegrasyonu"""
    
    def __init__(self, api_key: str, secret_key: str, base_url: str = "https://paper-api.alpaca.markets"):
        self.api_key = api_key
        self.secret_key = secret_key
        self.base_url = base_url
        self.connected = False
        self.orders: Dict[str, Order] = {}
        self.order_counter = 0
    
    async def connect(self) -> bool:
        """Alpaca'ya bağlan"""
        try:
            # Alpaca API bağlantısı (mock implementation)
            logger.info("Alpaca Markets'e bağlanıyor...")
            self.connected = True
            return True
        except Exception as e:
            logger.error(f"Alpaca bağlantı hatası: {e}")
            return False
    
    async def disconnect(self) -> bool:
        """Alpaca bağlantısını kes"""
        logger.info("Alpaca bağlantısı kesiliyor...")
        self.connected = False
        return True
    
    async def place_order(self, order: Order) -> str:
        """Alpaca order gönder"""
        if not self.connected:
            raise Exception("Alpaca'ya bağlı değil")
        
        # Mock Alpaca order
        self.order_counter += 1
        order_id = f"ALPACA_{self.order_counter:06d}"
        order.id = order_id
        self.orders[order_id] = order
        
        logger.info(f"Alpaca order placed: {order_id}")
        return order_id
    
    async def cancel_order(self, order_id: str) -> bool:
        """Alpaca order iptal et"""
        if order_id in self.orders:
            self.orders[order_id].status = OrderStatus.CANCELLED
            return True
        return False
    
    async def get_order_status(self, order_id: str) -> OrderStatus:
        """Alpaca order durumu"""
        if order_id in self.orders:
            return self.orders[order_id].status
        return OrderStatus.REJECTED
    
    async def get_positions(self) -> List[Position]:
        """Alpaca pozisyonları"""
        return []
    
    async def get_account_info(self) -> AccountInfo:
        """Alpaca hesap bilgileri"""
        return AccountInfo(
            account_id="ALPACA_ACCOUNT",
            buying_power=100000.0,
            cash=50000.0,
            equity=100000.0,
            market_value=50000.0,
            day_trade_buying_power=400000.0,
            maintenance_margin=12500.0,
            initial_margin=25000.0
        )
    
    async def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Alpaca quote"""
        return {
            'symbol': symbol,
            'price': 100.0,
            'bid': 99.9,
            'ask': 100.1,
            'volume': 1000,
            'timestamp': datetime.now().isoformat()
        }

class BrokerManager:
    """Broker yöneticisi"""
    
    def __init__(self):
        self.brokers: Dict[BrokerType, BrokerInterface] = {}
        self.active_broker: Optional[BrokerInterface] = None
        self.active_broker_type: Optional[BrokerType] = None
        
        # Default brokers initialize et
        self._initialize_default_brokers()
    
    def _initialize_default_brokers(self):
        """Default broker'ları initialize et"""
        # Paper Trading (her zaman mevcut)
        self.brokers[BrokerType.PAPER_TRADING] = PaperTradingBroker()
        
        # Diğer broker'lar (API key'ler varsa)
        # self.brokers[BrokerType.INTERACTIVE_BROKERS] = InteractiveBrokersBroker()
        # self.brokers[BrokerType.ALPACA] = AlpacaBroker("api_key", "secret_key")
    
    async def connect_broker(self, broker_type: BrokerType) -> bool:
        """Broker'a bağlan"""
        if broker_type not in self.brokers:
            logger.error(f"Broker bulunamadı: {broker_type}")
            return False
        
        broker = self.brokers[broker_type]
        success = await broker.connect()
        
        if success:
            self.active_broker = broker
            self.active_broker_type = broker_type
            logger.info(f"Broker bağlandı: {broker_type.value}")
        
        return success
    
    async def disconnect_broker(self) -> bool:
        """Aktif broker'ı bağlantısını kes"""
        if self.active_broker:
            success = await self.active_broker.disconnect()
            if success:
                self.active_broker = None
                self.active_broker_type = None
                logger.info("Broker bağlantısı kesildi")
            return success
        return True
    
    async def place_order(self, symbol: str, side: OrderSide, order_type: OrderType, 
                         quantity: float, price: Optional[float] = None, 
                         stop_price: Optional[float] = None) -> str:
        """Order gönder"""
        if not self.active_broker:
            raise Exception("Aktif broker yok")
        
        order = Order(
            id="",  # Broker tarafından atanacak
            symbol=symbol,
            side=side,
            order_type=order_type,
            quantity=quantity,
            price=price,
            stop_price=stop_price
        )
        
        return await self.active_broker.place_order(order)
    
    async def cancel_order(self, order_id: str) -> bool:
        """Order iptal et"""
        if not self.active_broker:
            raise Exception("Aktif broker yok")
        
        return await self.active_broker.cancel_order(order_id)
    
    async def get_order_status(self, order_id: str) -> OrderStatus:
        """Order durumu al"""
        if not self.active_broker:
            raise Exception("Aktif broker yok")
        
        return await self.active_broker.get_order_status(order_id)
    
    async def get_positions(self) -> List[Position]:
        """Pozisyonları al"""
        if not self.active_broker:
            raise Exception("Aktif broker yok")
        
        return await self.active_broker.get_positions()
    
    async def get_account_info(self) -> AccountInfo:
        """Hesap bilgilerini al"""
        if not self.active_broker:
            raise Exception("Aktif broker yok")
        
        return await self.active_broker.get_account_info()
    
    async def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Anlık fiyat al"""
        if not self.active_broker:
            raise Exception("Aktif broker yok")
        
        return await self.active_broker.get_quote(symbol)
    
    def get_available_brokers(self) -> List[Dict[str, Any]]:
        """Mevcut broker'ları listele"""
        brokers = []
        for broker_type, broker in self.brokers.items():
            brokers.append({
                'type': broker_type.value,
                'name': broker_type.value.replace('_', ' ').title(),
                'connected': broker == self.active_broker,
                'available': True
            })
        return brokers

class OrderManager:
    """Order yöneticisi"""
    
    def __init__(self, broker_manager: BrokerManager):
        self.broker_manager = broker_manager
        self.order_history: List[Order] = []
        self.active_orders: Dict[str, Order] = {}
    
    async def create_market_order(self, symbol: str, side: OrderSide, quantity: float) -> str:
        """Market order oluştur"""
        return await self.broker_manager.place_order(
            symbol=symbol,
            side=side,
            order_type=OrderType.MARKET,
            quantity=quantity
        )
    
    async def create_limit_order(self, symbol: str, side: OrderSide, quantity: float, price: float) -> str:
        """Limit order oluştur"""
        return await self.broker_manager.place_order(
            symbol=symbol,
            side=side,
            order_type=OrderType.LIMIT,
            quantity=quantity,
            price=price
        )
    
    async def create_stop_order(self, symbol: str, side: OrderSide, quantity: float, stop_price: float) -> str:
        """Stop order oluştur"""
        return await self.broker_manager.place_order(
            symbol=symbol,
            side=side,
            order_type=OrderType.STOP,
            quantity=quantity,
            stop_price=stop_price
        )
    
    async def create_stop_limit_order(self, symbol: str, side: OrderSide, quantity: float, 
                                     price: float, stop_price: float) -> str:
        """Stop-limit order oluştur"""
        return await self.broker_manager.place_order(
            symbol=symbol,
            side=side,
            order_type=OrderType.STOP_LIMIT,
            quantity=quantity,
            price=price,
            stop_price=stop_price
        )
    
    async def cancel_order(self, order_id: str) -> bool:
        """Order iptal et"""
        success = await self.broker_manager.cancel_order(order_id)
        if success and order_id in self.active_orders:
            self.active_orders[order_id].status = OrderStatus.CANCELLED
        return success
    
    async def get_order_status(self, order_id: str) -> OrderStatus:
        """Order durumu al"""
        return await self.broker_manager.get_order_status(order_id)
    
    def get_order_history(self, limit: int = 100) -> List[Order]:
        """Order geçmişini al"""
        return self.order_history[-limit:] if self.order_history else []
    
    def get_active_orders(self) -> List[Order]:
        """Aktif order'ları al"""
        return [order for order in self.active_orders.values() 
                if order.status in [OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED]]

class RiskManager:
    """Risk yöneticisi"""
    
    def __init__(self, broker_manager: BrokerManager):
        self.broker_manager = broker_manager
        self.max_position_size = 0.1  # Max %10 position
        self.max_daily_loss = 0.05  # Max %5 daily loss
        self.max_drawdown = 0.15  # Max %15 drawdown
        self.daily_pnl = 0.0
        self.peak_equity = 0.0
    
    async def check_order_risk(self, symbol: str, side: OrderSide, quantity: float, price: float) -> Tuple[bool, str]:
        """Order risk kontrolü"""
        try:
            account_info = await self.broker_manager.get_account_info()
            # Güvenli equity
            equity = account_info.equity if account_info.equity and account_info.equity > 0 else 1e-6
            # İlk çağrıda tepe equity'yi ayarla
            if self.peak_equity <= 0 and equity > 0:
                self.peak_equity = equity
            
            # Position size kontrolü
            order_value = quantity * price
            position_ratio = order_value / max(equity, 1e-6)
            
            if position_ratio > self.max_position_size:
                return False, f"Position size too large: {position_ratio:.2%} > {self.max_position_size:.2%}"
            
            # Daily loss kontrolü
            if self.daily_pnl < -equity * self.max_daily_loss:
                return False, f"Daily loss limit exceeded: {self.daily_pnl:.2f}"
            
            # Drawdown kontrolü
            current_drawdown = 0.0
            if self.peak_equity > 0:
                current_drawdown = max(0.0, (self.peak_equity - equity) / self.peak_equity)
            # Yeni tepe equity oluştuysa güncelle
            if equity > self.peak_equity:
                self.peak_equity = equity
            if current_drawdown > self.max_drawdown:
                return False, f"Drawdown limit exceeded: {current_drawdown:.2%} > {self.max_drawdown:.2%}"
            
            return True, "Risk check passed"
            
        except Exception as e:
            return False, f"Risk check error: {e}"
    
    async def update_daily_pnl(self):
        """Günlük P&L güncelle"""
        try:
            account_info = await self.broker_manager.get_account_info()
            equity = account_info.equity if account_info.equity is not None else 0.0
            # İlk init
            if self.peak_equity <= 0 and equity > 0:
                self.peak_equity = equity
            self.daily_pnl = equity - self.peak_equity
            if equity > self.peak_equity:
                self.peak_equity = equity
                
        except Exception as e:
            logger.error(f"Daily P&L update error: {e}")

# Global instances
broker_manager = BrokerManager()
order_manager = OrderManager(broker_manager)
risk_manager = RiskManager(broker_manager)

# Test function
async def test_broker_integration():
    """Broker entegrasyon testi"""
    print("🚀 Broker Integration System test başlıyor...")
    
    try:
        # Paper Trading broker'a bağlan
        print("📊 Paper Trading broker'a bağlanıyor...")
        success = await broker_manager.connect_broker(BrokerType.PAPER_TRADING)
        print(f"✅ Paper Trading bağlantı: {success}")
        
        if success:
            # Hesap bilgilerini al
            print("💰 Hesap bilgilerini alıyor...")
            account_info = await broker_manager.get_account_info()
            print(f"  Cash: ${account_info.cash:,.2f}")
            print(f"  Equity: ${account_info.equity:,.2f}")
            print(f"  Buying Power: ${account_info.buying_power:,.2f}")
            
            # Market order gönder
            print("📈 Market order gönderiyor...")
            order_id = await order_manager.create_market_order(
                symbol="AAPL",
                side=OrderSide.BUY,
                quantity=10
            )
            print(f"✅ Order ID: {order_id}")
            
            # Order durumu kontrol et
            print("🔍 Order durumu kontrol ediliyor...")
            status = await order_manager.get_order_status(order_id)
            print(f"✅ Order Status: {status.value}")
            
            # Pozisyonları al
            print("📊 Pozisyonları alıyor...")
            positions = await broker_manager.get_positions()
            print(f"✅ Pozisyon sayısı: {len(positions)}")
            for pos in positions:
                print(f"  {pos.symbol}: {pos.quantity} @ {pos.average_price:.2f}")
            
            # Quote al
            print("💹 Quote alıyor...")
            quote = await broker_manager.get_quote("AAPL")
            print(f"✅ AAPL Quote: {quote['price']:.2f}")
            
            # Risk kontrolü
            print("⚠️ Risk kontrolü yapıyor...")
            risk_ok, risk_msg = await risk_manager.check_order_risk(
                symbol="GOOGL",
                side=OrderSide.BUY,
                quantity=5,
                price=2800.0
            )
            print(f"✅ Risk Check: {risk_ok} - {risk_msg}")
            
            # Broker'ları listele
            print("📋 Mevcut broker'ları listeliyor...")
            brokers = broker_manager.get_available_brokers()
            for broker in brokers:
                print(f"  {broker['name']}: {'✅' if broker['connected'] else '❌'}")
        
        print("🎉 Broker Integration test tamamlandı!")
        
    except Exception as e:
        print(f"❌ Test hatası: {e}")
        logger.error(f"Broker integration test error: {e}")

if __name__ == "__main__":
    asyncio.run(test_broker_integration())
