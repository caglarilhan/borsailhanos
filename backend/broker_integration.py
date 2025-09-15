import asyncio
import logging
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class BrokerType(Enum):
    PAPER = "paper"  # Paper trading
    MOCK = "mock"    # Mock broker (test)
    # Gerçek broker entegrasyonları için:
    # GARANTI = "garanti"
    # ISBANK = "isbank"
    # VAKIFBANK = "vakifbank"

@dataclass
class OrderRequest:
    symbol: str
    side: str  # "BUY" or "SELL"
    quantity: int
    price: float
    order_type: str  # "MARKET" or "LIMIT"
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None

@dataclass
class OrderResponse:
    order_id: str
    status: str  # "PENDING", "FILLED", "CANCELLED", "REJECTED"
    filled_quantity: int
    filled_price: float
    commission: float
    timestamp: datetime

@dataclass
class Position:
    symbol: str
    quantity: int
    average_price: float
    current_price: float
    unrealized_pnl: float
    realized_pnl: float

class BrokerInterface:
    """Broker entegrasyonu için temel arayüz"""
    
    def __init__(self, broker_type: BrokerType, api_key: str = None):
        self.broker_type = broker_type
        self.api_key = api_key
        self.positions: Dict[str, Position] = {}
        self.orders: Dict[str, OrderResponse] = {}
        
        logger.info(f"🔗 Broker bağlantısı başlatıldı: {broker_type.value}")
    
    async def connect(self) -> bool:
        """Broker'a bağlan"""
        try:
            if self.broker_type == BrokerType.PAPER:
                logger.info("📄 Paper trading modu aktif")
                return True
            elif self.broker_type == BrokerType.MOCK:
                logger.info("🎭 Mock broker modu aktif")
                return True
            else:
                logger.error(f"❌ Desteklenmeyen broker tipi: {self.broker_type}")
                return False
        except Exception as e:
            logger.error(f"❌ Broker bağlantı hatası: {e}")
            return False
    
    async def get_account_info(self) -> Dict:
        """Hesap bilgilerini al"""
        try:
            if self.broker_type == BrokerType.PAPER:
                return {
                    'account_id': 'PAPER_001',
                    'balance': 100000.0,
                    'equity': 100000.0,
                    'margin': 0.0,
                    'free_margin': 100000.0,
                    'currency': 'TRY'
                }
            elif self.broker_type == BrokerType.MOCK:
                return {
                    'account_id': 'MOCK_001',
                    'balance': 50000.0,
                    'equity': 50000.0,
                    'margin': 0.0,
                    'free_margin': 50000.0,
                    'currency': 'TRY'
                }
            else:
                return {}
        except Exception as e:
            logger.error(f"❌ Hesap bilgisi alma hatası: {e}")
            return {}
    
    async def get_positions(self) -> List[Position]:
        """Açık pozisyonları al"""
        try:
            return list(self.positions.values())
        except Exception as e:
            logger.error(f"❌ Pozisyon alma hatası: {e}")
            return []
    
    async def place_order(self, order_request: OrderRequest) -> OrderResponse:
        """Sipariş ver"""
        try:
            order_id = f"ORDER_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
            
            # Paper/Mock trading için simüle et
            if self.broker_type in [BrokerType.PAPER, BrokerType.MOCK]:
                # Sipariş başarılı kabul et
                order_response = OrderResponse(
                    order_id=order_id,
                    status="FILLED",
                    filled_quantity=order_request.quantity,
                    filled_price=order_request.price,
                    commission=order_request.quantity * order_request.price * 0.001,  # %0.1 komisyon
                    timestamp=datetime.now()
                )
                
                # Pozisyonu güncelle
                if order_request.side == "BUY":
                    if order_request.symbol in self.positions:
                        # Mevcut pozisyonu güncelle
                        pos = self.positions[order_request.symbol]
                        total_quantity = pos.quantity + order_request.quantity
                        total_cost = (pos.quantity * pos.average_price) + (order_request.quantity * order_request.price)
                        new_avg_price = total_cost / total_quantity
                        
                        self.positions[order_request.symbol] = Position(
                            symbol=order_request.symbol,
                            quantity=total_quantity,
                            average_price=new_avg_price,
                            current_price=order_request.price,
                            unrealized_pnl=0.0,
                            realized_pnl=pos.realized_pnl
                        )
                    else:
                        # Yeni pozisyon oluştur
                        self.positions[order_request.symbol] = Position(
                            symbol=order_request.symbol,
                            quantity=order_request.quantity,
                            average_price=order_request.price,
                            current_price=order_request.price,
                            unrealized_pnl=0.0,
                            realized_pnl=0.0
                        )
                
                elif order_request.side == "SELL":
                    if order_request.symbol in self.positions:
                        pos = self.positions[order_request.symbol]
                        if order_request.quantity >= pos.quantity:
                            # Tüm pozisyonu kapat
                            realized_pnl = (order_request.price - pos.average_price) * pos.quantity
                            del self.positions[order_request.symbol]
                        else:
                            # Kısmi satış
                            realized_pnl = (order_request.price - pos.average_price) * order_request.quantity
                            remaining_quantity = pos.quantity - order_request.quantity
                            
                            self.positions[order_request.symbol] = Position(
                                symbol=order_request.symbol,
                                quantity=remaining_quantity,
                                average_price=pos.average_price,
                                current_price=order_request.price,
                                unrealized_pnl=0.0,
                                realized_pnl=pos.realized_pnl + realized_pnl
                            )
                
                # Siparişi kaydet
                self.orders[order_id] = order_response
                
                logger.info(f"✅ Sipariş başarılı: {order_request.side} {order_request.quantity} {order_request.symbol} @ {order_request.price}")
                return order_response
            
            else:
                # Gerçek broker entegrasyonu burada olacak
                logger.error("❌ Gerçek broker entegrasyonu henüz implement edilmedi")
                return OrderResponse(
                    order_id=order_id,
                    status="REJECTED",
                    filled_quantity=0,
                    filled_price=0.0,
                    commission=0.0,
                    timestamp=datetime.now()
                )
                
        except Exception as e:
            logger.error(f"❌ Sipariş verme hatası: {e}")
            return OrderResponse(
                order_id="ERROR",
                status="REJECTED",
                filled_quantity=0,
                filled_price=0.0,
                commission=0.0,
                timestamp=datetime.now()
            )
    
    async def cancel_order(self, order_id: str) -> bool:
        """Siparişi iptal et"""
        try:
            if order_id in self.orders:
                self.orders[order_id].status = "CANCELLED"
                logger.info(f"✅ Sipariş iptal edildi: {order_id}")
                return True
            else:
                logger.warning(f"⚠️ Sipariş bulunamadı: {order_id}")
                return False
        except Exception as e:
            logger.error(f"❌ Sipariş iptal hatası: {e}")
            return False
    
    async def get_order_status(self, order_id: str) -> Optional[OrderResponse]:
        """Sipariş durumunu al"""
        try:
            return self.orders.get(order_id)
        except Exception as e:
            logger.error(f"❌ Sipariş durumu alma hatası: {e}")
            return None
    
    async def update_positions(self, current_prices: Dict[str, float]):
        """Pozisyonları güncelle (fiyat değişiklikleri için)"""
        try:
            for symbol, current_price in current_prices.items():
                if symbol in self.positions:
                    pos = self.positions[symbol]
                    unrealized_pnl = (current_price - pos.average_price) * pos.quantity
                    
                    self.positions[symbol] = Position(
                        symbol=symbol,
                        quantity=pos.quantity,
                        average_price=pos.average_price,
                        current_price=current_price,
                        unrealized_pnl=unrealized_pnl,
                        realized_pnl=pos.realized_pnl
                    )
        except Exception as e:
            logger.error(f"❌ Pozisyon güncelleme hatası: {e}")
    
    def get_total_pnl(self) -> float:
        """Toplam kar/zarar hesapla"""
        try:
            total_pnl = 0.0
            for pos in self.positions.values():
                total_pnl += pos.unrealized_pnl + pos.realized_pnl
            return total_pnl
        except Exception as e:
            logger.error(f"❌ Toplam PnL hesaplama hatası: {e}")
            return 0.0

class BrokerManager:
    """Broker yöneticisi - birden fazla broker'ı yönetir"""
    
    def __init__(self):
        self.brokers: Dict[str, BrokerInterface] = {}
        self.active_broker: Optional[BrokerInterface] = None
        
        logger.info("🏦 Broker Manager başlatıldı")
    
    async def add_broker(self, name: str, broker_type: BrokerType, api_key: str = None) -> bool:
        """Broker ekle"""
        try:
            broker = BrokerInterface(broker_type, api_key)
            if await broker.connect():
                self.brokers[name] = broker
                if not self.active_broker:
                    self.active_broker = broker
                logger.info(f"✅ Broker eklendi: {name} ({broker_type.value})")
                return True
            else:
                logger.error(f"❌ Broker bağlantısı başarısız: {name}")
                return False
        except Exception as e:
            logger.error(f"❌ Broker ekleme hatası: {e}")
            return False
    
    def set_active_broker(self, name: str) -> bool:
        """Aktif broker'ı değiştir"""
        try:
            if name in self.brokers:
                self.active_broker = self.brokers[name]
                logger.info(f"✅ Aktif broker değiştirildi: {name}")
                return True
            else:
                logger.error(f"❌ Broker bulunamadı: {name}")
                return False
        except Exception as e:
            logger.error(f"❌ Aktif broker değiştirme hatası: {e}")
            return False
    
    async def get_account_info(self) -> Dict:
        """Aktif broker'dan hesap bilgisi al"""
        try:
            if self.active_broker:
                return await self.active_broker.get_account_info()
            else:
                logger.error("❌ Aktif broker yok")
                return {}
        except Exception as e:
            logger.error(f"❌ Hesap bilgisi alma hatası: {e}")
            return {}
    
    async def place_order(self, order_request: OrderRequest) -> OrderResponse:
        """Aktif broker üzerinden sipariş ver"""
        try:
            if self.active_broker:
                return await self.active_broker.place_order(order_request)
            else:
                logger.error("❌ Aktif broker yok")
                return OrderResponse(
                    order_id="NO_BROKER",
                    status="REJECTED",
                    filled_quantity=0,
                    filled_price=0.0,
                    commission=0.0,
                    timestamp=datetime.now()
                )
        except Exception as e:
            logger.error(f"❌ Sipariş verme hatası: {e}")
            return OrderResponse(
                order_id="ERROR",
                status="REJECTED",
                filled_quantity=0,
                filled_price=0.0,
                commission=0.0,
                timestamp=datetime.now()
            )
    
    async def get_positions(self) -> List[Position]:
        """Aktif broker'dan pozisyonları al"""
        try:
            if self.active_broker:
                return await self.active_broker.get_positions()
            else:
                logger.error("❌ Aktif broker yok")
                return []
        except Exception as e:
            logger.error(f"❌ Pozisyon alma hatası: {e}")
            return []
    
    def get_broker_list(self) -> List[str]:
        """Mevcut broker listesini döndür"""
        return list(self.brokers.keys())
    
    def get_active_broker_name(self) -> Optional[str]:
        """Aktif broker adını döndür"""
        if self.active_broker:
            for name, broker in self.brokers.items():
                if broker == self.active_broker:
                    return name
        return None

