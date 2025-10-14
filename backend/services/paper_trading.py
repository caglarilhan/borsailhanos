#!/usr/bin/env python3
"""
Paper Trading Simülasyonu
Webull benzeri sanal trading özelliği
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import uuid
import json
import random

class PaperTradingService:
    def __init__(self):
        self.portfolios = {}  # {user_id: portfolio}
        self.orders = {}  # {order_id: order}
        self.transactions = {}  # {transaction_id: transaction}
        self.market_data = {}  # {symbol: current_price}
        
        # Demo market data oluştur
        self._initialize_market_data()
    
    def _initialize_market_data(self):
        """Demo market data oluştur"""
        symbols = [
            "SISE.IS", "EREGL.IS", "TUPRS.IS", "AKBNK.IS", "GARAN.IS",
            "ISCTR.IS", "THYAO.IS", "KCHOL.IS", "SAHOL.IS", "HALKB.IS",
            "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"
        ]
        
        for symbol in symbols:
            self.market_data[symbol] = {
                "price": round(random.uniform(10, 300), 2),
                "change": round(random.uniform(-0.05, 0.05), 4),
                "volume": random.randint(100000, 5000000),
                "last_update": datetime.now()
            }
    
    def create_portfolio(self, user_id: str, initial_cash: float = 100000.0) -> Dict:
        """Yeni paper trading portföyü oluştur"""
        portfolio = {
            "user_id": user_id,
            "cash": initial_cash,
            "total_value": initial_cash,
            "positions": {},  # {symbol: position_info}
            "created_at": datetime.now().isoformat(),
            "last_update": datetime.now().isoformat(),
            "total_return": 0.0,
            "daily_return": 0.0,
            "win_rate": 0.0,
            "total_trades": 0,
            "winning_trades": 0
        }
        
        self.portfolios[user_id] = portfolio
        
        return {
            "success": True,
            "portfolio": portfolio,
            "message": "Paper trading portföyü oluşturuldu"
        }
    
    def get_portfolio(self, user_id: str) -> Optional[Dict]:
        """Portföy bilgilerini getir"""
        portfolio = self.portfolios.get(user_id)
        if not portfolio:
            return None
        
        # Güncel fiyatlarla portföy değerini güncelle
        self._update_portfolio_value(portfolio)
        
        return portfolio
    
    def _update_portfolio_value(self, portfolio: Dict):
        """Portföy değerini güncelle"""
        total_value = portfolio["cash"]
        
        for symbol, position in portfolio["positions"].items():
            current_price = self.market_data.get(symbol, {}).get("price", position["avg_price"])
            position["current_value"] = position["quantity"] * current_price
            position["unrealized_pnl"] = position["current_value"] - position["cost_basis"]
            total_value += position["current_value"]
        
        portfolio["total_value"] = total_value
        portfolio["total_return"] = (total_value - 100000) / 100000  # Initial cash
        portfolio["last_update"] = datetime.now().isoformat()
    
    def place_order(self, user_id: str, symbol: str, action: str, quantity: int, order_type: str = "market") -> Dict:
        """Sipariş ver"""
        portfolio = self.portfolios.get(user_id)
        if not portfolio:
            return {"success": False, "error": "Portföy bulunamadı"}
        
        current_price = self.market_data.get(symbol, {}).get("price", 0)
        if current_price == 0:
            return {"success": False, "error": "Sembol bulunamadı"}
        
        order_id = str(uuid.uuid4())
        total_cost = quantity * current_price
        
        # Cash kontrolü
        if action == "BUY" and portfolio["cash"] < total_cost:
            return {"success": False, "error": "Yetersiz nakit"}
        
        # Position kontrolü
        if action == "SELL":
            current_position = portfolio["positions"].get(symbol, {})
            if current_position.get("quantity", 0) < quantity:
                return {"success": False, "error": "Yetersiz pozisyon"}
        
        # Sipariş oluştur
        order = {
            "id": order_id,
            "user_id": user_id,
            "symbol": symbol,
            "action": action,
            "quantity": quantity,
            "price": current_price,
            "total_cost": total_cost,
            "order_type": order_type,
            "status": "filled",  # Paper trading'de hemen fill edilir
            "created_at": datetime.now().isoformat(),
            "filled_at": datetime.now().isoformat()
        }
        
        self.orders[order_id] = order
        
        # İşlemi gerçekleştir
        self._execute_order(order, portfolio)
        
        return {
            "success": True,
            "order": order,
            "message": "Sipariş başarıyla verildi"
        }
    
    def _execute_order(self, order: Dict, portfolio: Dict):
        """Siparişi gerçekleştir"""
        symbol = order["symbol"]
        action = order["action"]
        quantity = order["quantity"]
        price = order["price"]
        total_cost = order["total_cost"]
        
        if action == "BUY":
            # Cash'ten düş
            portfolio["cash"] -= total_cost
            
            # Position ekle/güncelle
            if symbol in portfolio["positions"]:
                position = portfolio["positions"][symbol]
                total_quantity = position["quantity"] + quantity
                total_cost_basis = position["cost_basis"] + total_cost
                
                position["quantity"] = total_quantity
                position["avg_price"] = total_cost_basis / total_quantity
                position["cost_basis"] = total_cost_basis
            else:
                portfolio["positions"][symbol] = {
                    "quantity": quantity,
                    "avg_price": price,
                    "cost_basis": total_cost,
                    "current_value": total_cost,
                    "unrealized_pnl": 0.0
                }
        
        elif action == "SELL":
            # Position'dan düş
            position = portfolio["positions"][symbol]
            position["quantity"] -= quantity
            position["cost_basis"] -= (quantity * position["avg_price"])
            
            # Cash'e ekle
            portfolio["cash"] += total_cost
            
            # Position boşsa sil
            if position["quantity"] == 0:
                del portfolio["positions"][symbol]
        
        # Trade sayısını güncelle
        portfolio["total_trades"] += 1
        
        # Transaction kaydet
        transaction_id = str(uuid.uuid4())
        self.transactions[transaction_id] = {
            "id": transaction_id,
            "user_id": order["user_id"],
            "symbol": symbol,
            "action": action,
            "quantity": quantity,
            "price": price,
            "total_cost": total_cost,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_orders(self, user_id: str, limit: int = 50) -> List[Dict]:
        """Kullanıcının siparişlerini getir"""
        user_orders = []
        for order_id, order in self.orders.items():
            if order["user_id"] == user_id:
                user_orders.append(order)
        
        # Tarihe göre sırala
        user_orders.sort(key=lambda x: x["created_at"], reverse=True)
        return user_orders[:limit]
    
    def get_transactions(self, user_id: str, limit: int = 50) -> List[Dict]:
        """Kullanıcının işlemlerini getir"""
        user_transactions = []
        for transaction_id, transaction in self.transactions.items():
            if transaction["user_id"] == user_id:
                user_transactions.append(transaction)
        
        # Tarihe göre sırala
        user_transactions.sort(key=lambda x: x["timestamp"], reverse=True)
        return user_transactions[:limit]
    
    def get_portfolio_performance(self, user_id: str) -> Dict:
        """Portföy performansını getir"""
        portfolio = self.portfolios.get(user_id)
        if not portfolio:
            return {"error": "Portföy bulunamadı"}
        
        # Performans metrikleri hesapla
        total_return = portfolio["total_return"]
        daily_return = random.uniform(-0.05, 0.05)  # Demo değer
        
        # Win rate hesapla
        win_rate = portfolio["winning_trades"] / max(portfolio["total_trades"], 1)
        
        # Sharpe ratio (basit hesaplama)
        sharpe_ratio = total_return / max(abs(daily_return), 0.01)
        
        # Max drawdown (demo)
        max_drawdown = abs(random.uniform(0.05, 0.15))
        
        return {
            "total_return": round(total_return, 4),
            "daily_return": round(daily_return, 4),
            "win_rate": round(win_rate, 4),
            "sharpe_ratio": round(sharpe_ratio, 4),
            "max_drawdown": round(max_drawdown, 4),
            "total_trades": portfolio["total_trades"],
            "winning_trades": portfolio["winning_trades"],
            "portfolio_value": portfolio["total_value"],
            "cash": portfolio["cash"]
        }
    
    def get_market_data(self, symbols: List[str] = None) -> Dict:
        """Market verilerini getir"""
        if symbols is None:
            symbols = list(self.market_data.keys())
        
        result = {}
        for symbol in symbols:
            if symbol in self.market_data:
                result[symbol] = self.market_data[symbol]
        
        return result
    
    def update_market_data(self, symbol: str, new_price: float):
        """Market verilerini güncelle"""
        if symbol in self.market_data:
            old_price = self.market_data[symbol]["price"]
            change = (new_price - old_price) / old_price
            
            self.market_data[symbol].update({
                "price": new_price,
                "change": change,
                "last_update": datetime.now()
            })
    
    def get_leaderboard(self, limit: int = 10) -> List[Dict]:
        """Leaderboard getir"""
        leaderboard = []
        
        for user_id, portfolio in self.portfolios.items():
            self._update_portfolio_value(portfolio)
            
            leaderboard.append({
                "user_id": user_id,
                "total_return": portfolio["total_return"],
                "portfolio_value": portfolio["total_value"],
                "win_rate": portfolio["winning_trades"] / max(portfolio["total_trades"], 1),
                "total_trades": portfolio["total_trades"]
            })
        
        # Total return'a göre sırala
        leaderboard.sort(key=lambda x: x["total_return"], reverse=True)
        return leaderboard[:limit]

# Global instance
paper_trading_service = PaperTradingService()
