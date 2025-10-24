"""
Broker Paper Trading Module
==========================
Render deployment için mock broker paper trading modülü
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class PaperTrade:
    """Paper trade kaydı"""
    symbol: str
    side: str  # "BUY" or "SELL"
    quantity: int
    price: float
    timestamp: datetime
    trade_id: str

class BrokerPaperTrading:
    """Paper trading broker simülasyonu"""
    
    def __init__(self, initial_capital: float = 100000.0):
        self.initial_capital = initial_capital
        self.cash = initial_capital
        self.positions: Dict[str, int] = {}
        self.trades: List[PaperTrade] = []
        self.trade_counter = 0
        
        logger.info(f"✅ Broker Paper Trading başlatıldı - Başlangıç sermayesi: ₺{initial_capital:,.2f}")
    
    def place_order(self, symbol: str, side: str, quantity: int, price: float) -> Dict[str, Any]:
        """Paper order yerleştir"""
        self.trade_counter += 1
        trade_id = f"PAPER_{self.trade_counter:06d}"
        
        trade = PaperTrade(
            symbol=symbol,
            side=side,
            quantity=quantity,
            price=price,
            timestamp=datetime.now(),
            trade_id=trade_id
        )
        
        self.trades.append(trade)
        
        # Position güncelle
        if side == "BUY":
            self.positions[symbol] = self.positions.get(symbol, 0) + quantity
            self.cash -= quantity * price
        else:  # SELL
            self.positions[symbol] = self.positions.get(symbol, 0) - quantity
            self.cash += quantity * price
        
        logger.info(f"📊 Paper Trade: {side} {quantity} {symbol} @ ₺{price:.2f}")
        
        return {
            "trade_id": trade_id,
            "status": "filled",
            "symbol": symbol,
            "side": side,
            "quantity": quantity,
            "price": price,
            "timestamp": trade.timestamp.isoformat()
        }
    
    def get_portfolio(self) -> Dict[str, Any]:
        """Portföy durumunu getir"""
        total_value = self.cash
        
        for symbol, quantity in self.positions.items():
            if quantity > 0:
                # Mock fiyat (gerçek uygulamada API'den çekilir)
                mock_price = 50.0
                total_value += quantity * mock_price
        
        return {
            "cash": self.cash,
            "positions": self.positions,
            "total_value": total_value,
            "total_trades": len(self.trades),
            "pnl": total_value - self.initial_capital
        }
    
    def get_trade_history(self, symbol: Optional[str] = None) -> List[Dict[str, Any]]:
        """Trade geçmişini getir"""
        trades = self.trades
        
        if symbol:
            trades = [t for t in trades if t.symbol == symbol]
        
        return [
            {
                "trade_id": trade.trade_id,
                "symbol": trade.symbol,
                "side": trade.side,
                "quantity": trade.quantity,
                "price": trade.price,
                "timestamp": trade.timestamp.isoformat()
            }
            for trade in trades
        ]

# Global instance
broker_paper = BrokerPaperTrading(initial_capital=100000.0)
