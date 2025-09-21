#!/usr/bin/env python3
"""
Broker Paper Trading Sistemi
$100 → $1000 hedefi için gerçekçi simülasyon
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from enum import Enum
import json
import os
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OrderType(Enum):
    """Emir türleri"""
    MARKET = "MARKET"
    LIMIT = "LIMIT"
    STOP = "STOP"
    BRACKET = "BRACKET"

class OrderSide(Enum):
    """Emir yönü"""
    BUY = "BUY"
    SELL = "SELL"

class OrderStatus(Enum):
    """Emir durumu"""
    PENDING = "PENDING"
    FILLED = "FILLED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"
    PARTIAL = "PARTIAL"

class PositionSide(Enum):
    """Pozisyon yönü"""
    LONG = "LONG"
    SHORT = "SHORT"

@dataclass
class Order:
    """Emir sınıfı"""
    id: str
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: float
    price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    status: OrderStatus = OrderStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    filled_at: Optional[datetime] = None
    filled_price: Optional[float] = None
    filled_quantity: float = 0.0
    commission: float = 0.0
    metadata: Dict = field(default_factory=dict)

@dataclass
class Position:
    """Pozisyon sınıfı"""
    symbol: str
    side: PositionSide
    quantity: float
    entry_price: float
    current_price: float
    unrealized_pnl: float = 0.0
    realized_pnl: float = 0.0
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    metadata: Dict = field(default_factory=dict)

@dataclass
class Trade:
    """İşlem sınıfı"""
    id: str
    symbol: str
    side: OrderSide
    quantity: float
    price: float
    pnl: float
    commission: float
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict = field(default_factory=dict)

class BrokerPaperTrading:
    """Broker Paper Trading Sistemi"""
    
    def __init__(self, initial_capital: float = 100.0):
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        self.available_cash = initial_capital
        
        # Trading verileri
        self.orders: Dict[str, Order] = {}
        self.positions: Dict[str, Position] = {}
        self.trades: List[Trade] = []
        self.order_counter = 0
        
        # Risk yönetimi
        self.max_position_size = 0.1  # Maksimum pozisyon boyutu (%10)
        self.max_daily_loss = 0.02     # Günlük maksimum kayıp (%2)
        self.commission_rate = 0.001   # Komisyon oranı (%0.1)
        
        # Circuit breaker
        self.circuit_breaker_active = False
        self.consecutive_losses = 0
        self.max_consecutive_losses = 3
        self.daily_pnl = 0.0
        self.last_reset_date = datetime.now().date()
        
        # Performance tracking
        self.performance_history = []
        
        logger.info(f"🏦 Broker Paper Trading başlatıldı - Başlangıç sermayesi: ${initial_capital:.2f}")
    
    def _generate_order_id(self) -> str:
        """Emir ID'si oluştur"""
        self.order_counter += 1
        return f"ORD_{self.order_counter:06d}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    def _generate_trade_id(self) -> str:
        """İşlem ID'si oluştur"""
        return f"TRD_{len(self.trades)+1:06d}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    def _check_circuit_breaker(self) -> Tuple[bool, str]:
        """Circuit breaker kontrolü"""
        # Günlük sıfırlama
        current_date = datetime.now().date()
        if current_date != self.last_reset_date:
            self.daily_pnl = 0.0
            self.consecutive_losses = 0
            self.circuit_breaker_active = False
            self.last_reset_date = current_date
            logger.info("🔄 Circuit breaker günlük sıfırlandı")
        
        if self.circuit_breaker_active:
            return False, "Circuit breaker aktif - işlem durduruldu"
        
        # Ardışık kayıp kontrolü
        if self.consecutive_losses >= self.max_consecutive_losses:
            self.circuit_breaker_active = True
            logger.warning(f"🚨 Circuit breaker devreye girdi: {self.consecutive_losses} ardışık kayıp")
            return False, f"Maksimum ardışık kayıp limiti aşıldı: {self.consecutive_losses}"
        
        # Günlük kayıp kontrolü
        if self.daily_pnl <= -self.max_daily_loss:
            self.circuit_breaker_active = True
            logger.warning(f"🚨 Circuit breaker devreye girdi: Günlük kayıp %{self.daily_pnl*100:.2f}")
            return False, f"Günlük maksimum kayıp limiti aşıldı: %{self.daily_pnl*100:.2f}"
        
        return True, "Circuit breaker kontrolleri geçildi"
    
    def _calculate_position_size(self, symbol: str, price: float, confidence: float = 1.0) -> float:
        """Pozisyon boyutu hesapla"""
        try:
            # Mevcut pozisyonu kontrol et
            current_position = self.positions.get(symbol)
            if current_position:
                logger.warning(f"⚠️ {symbol} için zaten pozisyon var: {current_position.quantity}")
                return 0.0
            
            # Risk yönetimi ile pozisyon boyutu hesapla
            risk_amount = self.current_capital * self.max_position_size
            position_value = risk_amount * confidence  # Confidence'a göre ayarla
            
            # Mevcut nakit kontrolü
            if position_value > self.available_cash:
                position_value = self.available_cash * 0.95  # %95 nakit kullan
            
            # Pozisyon miktarı
            quantity = position_value / price
            
            logger.info(f"📊 {symbol} pozisyon boyutu: ${position_value:.2f} ({quantity:.2f} adet)")
            return quantity
            
        except Exception as e:
            logger.error(f"❌ Pozisyon boyutu hesaplama hatası: {e}")
            return 0.0
    
    def _get_current_price(self, symbol: str) -> Optional[float]:
        """Güncel fiyat al"""
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period="1d", interval="1m")
            if not data.empty:
                return float(data['Close'].iloc[-1])
            return None
        except Exception as e:
            logger.error(f"❌ {symbol} fiyat hatası: {e}")
            return None
    
    def place_order(self, symbol: str, side: OrderSide, quantity: float, 
                   price: Optional[float] = None, stop_loss: Optional[float] = None,
                   take_profit: Optional[float] = None, confidence: float = 1.0) -> Optional[str]:
        """Emir ver"""
        try:
            # Circuit breaker kontrolü
            can_trade, reason = self._check_circuit_breaker()
            if not can_trade:
                logger.warning(f"🚨 Emir reddedildi: {reason}")
                return None
            
            # Güncel fiyat al
            current_price = self._get_current_price(symbol)
            if not current_price:
                logger.error(f"❌ {symbol} fiyat bulunamadı")
                return None
            
            # Fiyat belirtilmemişse market price kullan
            if price is None:
                price = current_price
            
            # Pozisyon boyutu hesapla
            if quantity <= 0:
                quantity = self._calculate_position_size(symbol, price, confidence)
                if quantity <= 0:
                    logger.warning(f"⚠️ {symbol} pozisyon boyutu hesaplanamadı")
                    return None
            
            # Emir oluştur
            order_id = self._generate_order_id()
            order = Order(
                id=order_id,
                symbol=symbol,
                side=side,
                order_type=OrderType.BRACKET if stop_loss or take_profit else OrderType.MARKET,
                quantity=quantity,
                price=price,
                stop_loss=stop_loss,
                take_profit=take_profit,
                metadata={"confidence": confidence}
            )
            
            # Emir kaydet
            self.orders[order_id] = order
            
            # Emri hemen doldur (paper trading)
            self._fill_order(order_id)
            
            logger.info(f"✅ Emir verildi: {order_id} - {symbol} {side.value} {quantity:.2f} @ ${price:.2f}")
            return order_id
            
        except Exception as e:
            logger.error(f"❌ Emir verme hatası: {e}")
            return None
    
    def _fill_order(self, order_id: str):
        """Emri doldur"""
        try:
            order = self.orders.get(order_id)
            if not order:
                logger.error(f"❌ Emir bulunamadı: {order_id}")
                return
            
            # Güncel fiyat al
            current_price = self._get_current_price(order.symbol)
            if not current_price:
                logger.error(f"❌ {order.symbol} fiyat bulunamadı")
                return
            
            # Emir fiyatı kontrolü
            fill_price = order.price if order.price else current_price
            
            # Komisyon hesapla
            commission = order.quantity * fill_price * self.commission_rate
            
            # Nakit kontrolü
            required_cash = order.quantity * fill_price + commission
            if order.side == OrderSide.BUY and required_cash > self.available_cash:
                logger.warning(f"⚠️ Yetersiz nakit: ${required_cash:.2f} > ${self.available_cash:.2f}")
                order.status = OrderStatus.REJECTED
                return
            
            # Emri doldur
            order.status = OrderStatus.FILLED
            order.filled_at = datetime.now()
            order.filled_price = fill_price
            order.filled_quantity = order.quantity
            order.commission = commission
            
            # Nakit güncelle
            if order.side == OrderSide.BUY:
                self.available_cash -= required_cash
            else:
                self.available_cash += (order.quantity * fill_price - commission)
            
            # Pozisyon oluştur/güncelle
            self._update_position(order)
            
            # İşlem kaydet
            self._record_trade(order)
            
            logger.info(f"✅ Emir dolduruldu: {order_id} - {order.symbol} {order.side.value} {order.quantity:.2f} @ ${fill_price:.2f}")
            
        except Exception as e:
            logger.error(f"❌ Emir doldurma hatası: {e}")
    
    def _update_position(self, order: Order):
        """Pozisyon güncelle"""
        try:
            symbol = order.symbol
            current_position = self.positions.get(symbol)
            
            if order.side == OrderSide.BUY:
                if current_position:
                    # Mevcut pozisyonu güncelle
                    if current_position.side == PositionSide.LONG:
                        # Long pozisyonu artır
                        total_quantity = current_position.quantity + order.quantity
                        total_value = (current_position.quantity * current_position.entry_price + 
                                     order.quantity * order.filled_price)
                        avg_price = total_value / total_quantity
                        
                        current_position.quantity = total_quantity
                        current_position.entry_price = avg_price
                        current_position.updated_at = datetime.now()
                    else:
                        # Short pozisyonu kapat
                        self._close_position(symbol, order)
                else:
                    # Yeni long pozisyon
                    position = Position(
                        symbol=symbol,
                        side=PositionSide.LONG,
                        quantity=order.quantity,
                        entry_price=order.filled_price,
                        current_price=order.filled_price,
                        stop_loss=order.stop_loss,
                        take_profit=order.take_profit
                    )
                    self.positions[symbol] = position
            
            else:  # SELL
                if current_position:
                    if current_position.side == PositionSide.LONG:
                        # Long pozisyonu kapat
                        self._close_position(symbol, order)
                    else:
                        # Short pozisyonu artır
                        total_quantity = current_position.quantity + order.quantity
                        total_value = (current_position.quantity * current_position.entry_price + 
                                     order.quantity * order.filled_price)
                        avg_price = total_value / total_quantity
                        
                        current_position.quantity = total_quantity
                        current_position.entry_price = avg_price
                        current_position.updated_at = datetime.now()
                else:
                    # Yeni short pozisyon
                    position = Position(
                        symbol=symbol,
                        side=PositionSide.SHORT,
                        quantity=order.quantity,
                        entry_price=order.filled_price,
                        current_price=order.filled_price,
                        stop_loss=order.stop_loss,
                        take_profit=order.take_profit
                    )
                    self.positions[symbol] = position
            
        except Exception as e:
            logger.error(f"❌ Pozisyon güncelleme hatası: {e}")
    
    def _close_position(self, symbol: str, order: Order):
        """Pozisyonu kapat"""
        try:
            position = self.positions.get(symbol)
            if not position:
                logger.warning(f"⚠️ {symbol} pozisyonu bulunamadı")
                return
            
            # PnL hesapla
            if position.side == PositionSide.LONG:
                pnl = (order.filled_price - position.entry_price) * order.quantity
            else:
                pnl = (position.entry_price - order.filled_price) * order.quantity
            
            # Komisyon düş
            pnl -= order.commission
            
            # Pozisyonu güncelle
            position.quantity -= order.quantity
            position.realized_pnl += pnl
            
            # Günlük PnL güncelle
            self.daily_pnl += pnl
            
            # Ardışık kayıp sayacını güncelle
            if pnl < 0:
                self.consecutive_losses += 1
                logger.warning(f"⚠️ Ardışık kayıp: {self.consecutive_losses}")
            else:
                self.consecutive_losses = 0
                logger.info("✅ Ardışık kayıp sıfırlandı")
            
            # Pozisyon tamamen kapatıldıysa sil
            if position.quantity <= 0:
                del self.positions[symbol]
                logger.info(f"✅ {symbol} pozisyonu tamamen kapatıldı")
            else:
                logger.info(f"📊 {symbol} pozisyonu kısmen kapatıldı: {position.quantity:.2f} kaldı")
            
        except Exception as e:
            logger.error(f"❌ Pozisyon kapatma hatası: {e}")
    
    def _record_trade(self, order: Order):
        """İşlem kaydet"""
        try:
            trade_id = self._generate_trade_id()
            
            # PnL hesapla (basit)
            pnl = 0.0  # Bu daha karmaşık hesaplanabilir
            
            trade = Trade(
                id=trade_id,
                symbol=order.symbol,
                side=order.side,
                quantity=order.quantity,
                price=order.filled_price,
                pnl=pnl,
                commission=order.commission,
                metadata=order.metadata
            )
            
            self.trades.append(trade)
            
        except Exception as e:
            logger.error(f"❌ İşlem kaydetme hatası: {e}")
    
    def update_positions(self):
        """Pozisyonları güncelle"""
        try:
            for symbol, position in self.positions.items():
                current_price = self._get_current_price(symbol)
                if current_price:
                    position.current_price = current_price
                    
                    # Unrealized PnL hesapla
                    if position.side == PositionSide.LONG:
                        position.unrealized_pnl = (current_price - position.entry_price) * position.quantity
                    else:
                        position.unrealized_pnl = (position.entry_price - current_price) * position.quantity
                    
                    position.updated_at = datetime.now()
                    
                    # Stop loss / Take profit kontrolü
                    self._check_stop_loss_take_profit(symbol, position)
            
        except Exception as e:
            logger.error(f"❌ Pozisyon güncelleme hatası: {e}")
    
    def _check_stop_loss_take_profit(self, symbol: str, position: Position):
        """Stop loss / Take profit kontrolü"""
        try:
            if not position.stop_loss and not position.take_profit:
                return
            
            current_price = position.current_price
            
            # Stop loss kontrolü
            if position.stop_loss:
                if position.side == PositionSide.LONG and current_price <= position.stop_loss:
                    logger.warning(f"🚨 {symbol} Stop Loss tetiklendi: ${current_price:.2f} <= ${position.stop_loss:.2f}")
                    self.place_order(symbol, OrderSide.SELL, position.quantity, current_price)
                    return
                elif position.side == PositionSide.SHORT and current_price >= position.stop_loss:
                    logger.warning(f"🚨 {symbol} Stop Loss tetiklendi: ${current_price:.2f} >= ${position.stop_loss:.2f}")
                    self.place_order(symbol, OrderSide.BUY, position.quantity, current_price)
                    return
            
            # Take profit kontrolü
            if position.take_profit:
                if position.side == PositionSide.LONG and current_price >= position.take_profit:
                    logger.info(f"🎉 {symbol} Take Profit tetiklendi: ${current_price:.2f} >= ${position.take_profit:.2f}")
                    self.place_order(symbol, OrderSide.SELL, position.quantity, current_price)
                    return
                elif position.side == PositionSide.SHORT and current_price <= position.take_profit:
                    logger.info(f"🎉 {symbol} Take Profit tetiklendi: ${current_price:.2f} <= ${position.take_profit:.2f}")
                    self.place_order(symbol, OrderSide.BUY, position.quantity, current_price)
                    return
            
        except Exception as e:
            logger.error(f"❌ Stop loss/Take profit kontrol hatası: {e}")
    
    def get_portfolio_summary(self) -> Dict:
        """Portföy özeti al"""
        try:
            # Pozisyonları güncelle
            self.update_positions()
            
            # Toplam unrealized PnL
            total_unrealized_pnl = sum(pos.unrealized_pnl for pos in self.positions.values())
            
            # Toplam realized PnL
            total_realized_pnl = sum(pos.realized_pnl for pos in self.positions.values())
            
            # Toplam PnL
            total_pnl = total_unrealized_pnl + total_realized_pnl
            
            # Portföy değeri
            portfolio_value = self.available_cash + sum(pos.quantity * pos.current_price for pos in self.positions.values())
            
            # Performans
            total_return = (portfolio_value - self.initial_capital) / self.initial_capital
            
            return {
                "initial_capital": self.initial_capital,
                "current_capital": self.current_capital,
                "available_cash": self.available_cash,
                "portfolio_value": portfolio_value,
                "total_pnl": total_pnl,
                "unrealized_pnl": total_unrealized_pnl,
                "realized_pnl": total_realized_pnl,
                "total_return": total_return,
                "total_return_pct": total_return * 100,
                "positions_count": len(self.positions),
                "trades_count": len(self.trades),
                "circuit_breaker_active": self.circuit_breaker_active,
                "consecutive_losses": self.consecutive_losses,
                "daily_pnl": self.daily_pnl,
                "last_update": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Portföy özeti hatası: {e}")
            return {}
    
    def get_positions(self) -> List[Dict]:
        """Pozisyonları al"""
        try:
            self.update_positions()
            
            positions = []
            for symbol, position in self.positions.items():
                positions.append({
                    "symbol": symbol,
                    "side": position.side.value,
                    "quantity": position.quantity,
                    "entry_price": position.entry_price,
                    "current_price": position.current_price,
                    "unrealized_pnl": position.unrealized_pnl,
                    "realized_pnl": position.realized_pnl,
                    "stop_loss": position.stop_loss,
                    "take_profit": position.take_profit,
                    "created_at": position.created_at.isoformat(),
                    "updated_at": position.updated_at.isoformat()
                })
            
            return positions
            
        except Exception as e:
            logger.error(f"❌ Pozisyonlar alma hatası: {e}")
            return []
    
    def get_trades(self, limit: int = 50) -> List[Dict]:
        """İşlemleri al"""
        try:
            trades = []
            for trade in self.trades[-limit:]:
                trades.append({
                    "id": trade.id,
                    "symbol": trade.symbol,
                    "side": trade.side.value,
                    "quantity": trade.quantity,
                    "price": trade.price,
                    "pnl": trade.pnl,
                    "commission": trade.commission,
                    "timestamp": trade.timestamp.isoformat(),
                    "metadata": trade.metadata
                })
            
            return trades
            
        except Exception as e:
            logger.error(f"❌ İşlemler alma hatası: {e}")
            return []
    
    def reset_circuit_breaker(self):
        """Circuit breaker'ı sıfırla"""
        self.circuit_breaker_active = False
        self.consecutive_losses = 0
        self.daily_pnl = 0.0
        logger.info("🔄 Circuit breaker sıfırlandı")
    
    def save_state(self, filename: str = "broker_state.json"):
        """Durumu kaydet"""
        try:
            state = {
                "initial_capital": self.initial_capital,
                "current_capital": self.current_capital,
                "available_cash": self.available_cash,
                "orders": {oid: {
                    "id": order.id,
                    "symbol": order.symbol,
                    "side": order.side.value,
                    "order_type": order.order_type.value,
                    "quantity": order.quantity,
                    "price": order.price,
                    "stop_loss": order.stop_loss,
                    "take_profit": order.take_profit,
                    "status": order.status.value,
                    "created_at": order.created_at.isoformat(),
                    "filled_at": order.filled_at.isoformat() if order.filled_at else None,
                    "filled_price": order.filled_price,
                    "filled_quantity": order.filled_quantity,
                    "commission": order.commission,
                    "metadata": order.metadata
                } for oid, order in self.orders.items()},
                "positions": {symbol: {
                    "symbol": pos.symbol,
                    "side": pos.side.value,
                    "quantity": pos.quantity,
                    "entry_price": pos.entry_price,
                    "current_price": pos.current_price,
                    "unrealized_pnl": pos.unrealized_pnl,
                    "realized_pnl": pos.realized_pnl,
                    "stop_loss": pos.stop_loss,
                    "take_profit": pos.take_profit,
                    "created_at": pos.created_at.isoformat(),
                    "updated_at": pos.updated_at.isoformat(),
                    "metadata": pos.metadata
                } for symbol, pos in self.positions.items()},
                "trades": [{
                    "id": trade.id,
                    "symbol": trade.symbol,
                    "side": trade.side.value,
                    "quantity": trade.quantity,
                    "price": trade.price,
                    "pnl": trade.pnl,
                    "commission": trade.commission,
                    "timestamp": trade.timestamp.isoformat(),
                    "metadata": trade.metadata
                } for trade in self.trades],
                "circuit_breaker_active": self.circuit_breaker_active,
                "consecutive_losses": self.consecutive_losses,
                "daily_pnl": self.daily_pnl,
                "last_reset_date": self.last_reset_date.isoformat(),
                "order_counter": self.order_counter,
                "timestamp": datetime.now().isoformat()
            }
            
            with open(filename, 'w') as f:
                json.dump(state, f, indent=2)
            
            logger.info(f"💾 Broker durumu kaydedildi: {filename}")
            
        except Exception as e:
            logger.error(f"❌ Durum kaydetme hatası: {e}")

def main():
    """Test fonksiyonu"""
    try:
        logger.info("🚀 Broker Paper Trading test ediliyor...")
        
        # Broker oluştur
        broker = BrokerPaperTrading(initial_capital=100.0)
        
        # Test emirleri
        logger.info("📊 Test emirleri veriliyor...")
        
        # NVDA BUY emri
        order_id = broker.place_order(
            symbol="NVDA",
            side=OrderSide.BUY,
            quantity=0.5,  # 0.5 adet
            confidence=0.85,
            stop_loss=160.0,
            take_profit=180.0
        )
        
        if order_id:
            logger.info(f"✅ NVDA emri verildi: {order_id}")
        
        # Portföy özeti
        summary = broker.get_portfolio_summary()
        print("\n" + "="*60)
        print("🏦 BROKER PAPER TRADING RAPORU")
        print("="*60)
        print(f"💰 Başlangıç Sermayesi: ${summary['initial_capital']:.2f}")
        print(f"💵 Mevcut Nakit: ${summary['available_cash']:.2f}")
        print(f"📊 Portföy Değeri: ${summary['portfolio_value']:.2f}")
        print(f"📈 Toplam PnL: ${summary['total_pnl']:.2f}")
        print(f"📊 Toplam Getiri: {summary['total_return_pct']:.2f}%")
        print(f"🎯 Pozisyon Sayısı: {summary['positions_count']}")
        print(f"📝 İşlem Sayısı: {summary['trades_count']}")
        print(f"🚨 Circuit Breaker: {'Aktif' if summary['circuit_breaker_active'] else 'Pasif'}")
        print()
        
        # Pozisyonlar
        positions = broker.get_positions()
        if positions:
            print("📊 POZİSYONLAR")
            print("-"*40)
            for pos in positions:
                print(f"{pos['symbol']}: {pos['side']} {pos['quantity']:.2f} @ ${pos['entry_price']:.2f}")
                print(f"  Güncel: ${pos['current_price']:.2f} | PnL: ${pos['unrealized_pnl']:.2f}")
                if pos['stop_loss']:
                    print(f"  Stop Loss: ${pos['stop_loss']:.2f}")
                if pos['take_profit']:
                    print(f"  Take Profit: ${pos['take_profit']:.2f}")
                print()
        
        # Durumu kaydet
        broker.save_state("test_broker_state.json")
        
        logger.info("✅ Broker Paper Trading test tamamlandı!")
        
    except Exception as e:
        logger.error(f"❌ Test hatası: {e}")

if __name__ == "__main__":
    main()
