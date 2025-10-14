"""
Watchlist ve Portfolio Tracker Servisi
TradingView, Robinhood benzeri özellikler
"""

import yfinance as yf
import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json

class WatchlistService:
    """Watchlist ve portfolio takip servisi"""
    
    def __init__(self):
        self.watchlists = {}  # user_id -> watchlist
        self.portfolios = {}  # user_id -> portfolio
        self.alerts = {}      # user_id -> alerts
        
    def create_watchlist(self, user_id: str, name: str, symbols: List[str] = None) -> Dict[str, Any]:
        """Yeni watchlist oluştur"""
        if user_id not in self.watchlists:
            self.watchlists[user_id] = []
            
        watchlist = {
            "id": f"wl_{len(self.watchlists[user_id]) + 1}",
            "name": name,
            "symbols": symbols or [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        self.watchlists[user_id].append(watchlist)
        return watchlist
    
    def add_to_watchlist(self, user_id: str, watchlist_id: str, symbol: str) -> Dict[str, Any]:
        """Watchlist'e sembol ekle"""
        if user_id not in self.watchlists:
            return {"error": "User not found"}
            
        for watchlist in self.watchlists[user_id]:
            if watchlist["id"] == watchlist_id:
                if symbol not in watchlist["symbols"]:
                    watchlist["symbols"].append(symbol)
                    watchlist["updated_at"] = datetime.now().isoformat()
                return watchlist
                
        return {"error": "Watchlist not found"}
    
    def remove_from_watchlist(self, user_id: str, watchlist_id: str, symbol: str) -> Dict[str, Any]:
        """Watchlist'ten sembol çıkar"""
        if user_id not in self.watchlists:
            return {"error": "User not found"}
            
        for watchlist in self.watchlists[user_id]:
            if watchlist["id"] == watchlist_id:
                if symbol in watchlist["symbols"]:
                    watchlist["symbols"].remove(symbol)
                    watchlist["updated_at"] = datetime.now().isoformat()
                return watchlist
                
        return {"error": "Watchlist not found"}
    
    def get_watchlist_data(self, user_id: str, watchlist_id: str) -> Dict[str, Any]:
        """Watchlist verilerini getir"""
        if user_id not in self.watchlists:
            return {"error": "User not found"}
            
        for watchlist in self.watchlists[user_id]:
            if watchlist["id"] == watchlist_id:
                symbols_data = []
                
                for symbol in watchlist["symbols"]:
                    try:
                        ticker = yf.Ticker(symbol)
                        hist = ticker.history(period="1d")
                        
                        if not hist.empty:
                            current_price = hist['Close'].iloc[-1]
                            prev_close = hist['Open'].iloc[-1]
                            change = current_price - prev_close
                            change_percent = (change / prev_close) * 100
                            
                            symbols_data.append({
                                "symbol": symbol,
                                "current_price": float(current_price),
                                "change": float(change),
                                "change_percent": float(change_percent),
                                "volume": int(hist['Volume'].iloc[-1]) if 'Volume' in hist.columns else 0,
                                "market_cap": self._get_market_cap(symbol),
                                "pe_ratio": self._get_pe_ratio(symbol),
                                "last_updated": datetime.now().isoformat()
                            })
                    except Exception as e:
                        symbols_data.append({
                            "symbol": symbol,
                            "error": str(e)
                        })
                
                return {
                    "watchlist": watchlist,
                    "symbols_data": symbols_data,
                    "total_symbols": len(watchlist["symbols"]),
                    "last_updated": datetime.now().isoformat()
                }
                
        return {"error": "Watchlist not found"}
    
    def create_portfolio(self, user_id: str, name: str, initial_cash: float = 10000) -> Dict[str, Any]:
        """Yeni portfolio oluştur"""
        portfolio = {
            "id": f"pf_{user_id}_{len(self.portfolios.get(user_id, [])) + 1}",
            "name": name,
            "initial_cash": initial_cash,
            "current_cash": initial_cash,
            "positions": {},  # symbol -> {shares, avg_price, current_price}
            "total_value": initial_cash,
            "total_return": 0.0,
            "total_return_percent": 0.0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        if user_id not in self.portfolios:
            self.portfolios[user_id] = []
            
        self.portfolios[user_id].append(portfolio)
        return portfolio
    
    def add_position(self, user_id: str, portfolio_id: str, symbol: str, shares: float, price: float) -> Dict[str, Any]:
        """Portfolio'ya pozisyon ekle"""
        if user_id not in self.portfolios:
            return {"error": "User not found"}
            
        for portfolio in self.portfolios[user_id]:
            if portfolio["id"] == portfolio_id:
                total_cost = shares * price
                
                if total_cost > portfolio["current_cash"]:
                    return {"error": "Insufficient cash"}
                
                if symbol in portfolio["positions"]:
                    # Mevcut pozisyonu güncelle
                    existing = portfolio["positions"][symbol]
                    total_shares = existing["shares"] + shares
                    total_cost_existing = existing["shares"] * existing["avg_price"]
                    new_avg_price = (total_cost_existing + total_cost) / total_shares
                    
                    portfolio["positions"][symbol] = {
                        "shares": total_shares,
                        "avg_price": new_avg_price,
                        "current_price": price
                    }
                else:
                    # Yeni pozisyon
                    portfolio["positions"][symbol] = {
                        "shares": shares,
                        "avg_price": price,
                        "current_price": price
                    }
                
                portfolio["current_cash"] -= total_cost
                portfolio["updated_at"] = datetime.now().isoformat()
                
                # Portfolio değerini güncelle
                self._update_portfolio_value(portfolio)
                
                return portfolio
                
        return {"error": "Portfolio not found"}
    
    def remove_position(self, user_id: str, portfolio_id: str, symbol: str, shares: float) -> Dict[str, Any]:
        """Portfolio'dan pozisyon çıkar"""
        if user_id not in self.portfolios:
            return {"error": "User not found"}
            
        for portfolio in self.portfolios[user_id]:
            if portfolio["id"] == portfolio_id:
                if symbol not in portfolio["positions"]:
                    return {"error": "Position not found"}
                
                position = portfolio["positions"][symbol]
                
                if shares >= position["shares"]:
                    # Tüm pozisyonu sat
                    sale_value = position["shares"] * position["current_price"]
                    portfolio["current_cash"] += sale_value
                    del portfolio["positions"][symbol]
                else:
                    # Kısmi satış
                    sale_value = shares * position["current_price"]
                    portfolio["current_cash"] += sale_value
                    position["shares"] -= shares
                
                portfolio["updated_at"] = datetime.now().isoformat()
                
                # Portfolio değerini güncelle
                self._update_portfolio_value(portfolio)
                
                return portfolio
                
        return {"error": "Portfolio not found"}
    
    def get_portfolio_data(self, user_id: str, portfolio_id: str) -> Dict[str, Any]:
        """Portfolio verilerini getir"""
        if user_id not in self.portfolios:
            return {"error": "User not found"}
            
        for portfolio in self.portfolios[user_id]:
            if portfolio["id"] == portfolio_id:
                # Güncel fiyatları al
                positions_data = []
                total_positions_value = 0
                
                for symbol, position in portfolio["positions"].items():
                    try:
                        ticker = yf.Ticker(symbol)
                        hist = ticker.history(period="1d")
                        
                        if not hist.empty:
                            current_price = hist['Close'].iloc[-1]
                            position["current_price"] = float(current_price)
                            
                            position_value = position["shares"] * current_price
                            cost_basis = position["shares"] * position["avg_price"]
                            gain_loss = position_value - cost_basis
                            gain_loss_percent = (gain_loss / cost_basis) * 100 if cost_basis > 0 else 0
                            
                            positions_data.append({
                                "symbol": symbol,
                                "shares": position["shares"],
                                "avg_price": position["avg_price"],
                                "current_price": current_price,
                                "position_value": position_value,
                                "cost_basis": cost_basis,
                                "gain_loss": gain_loss,
                                "gain_loss_percent": gain_loss_percent
                            })
                            
                            total_positions_value += position_value
                            
                    except Exception as e:
                        positions_data.append({
                            "symbol": symbol,
                            "error": str(e)
                        })
                
                # Portfolio özeti
                total_value = portfolio["current_cash"] + total_positions_value
                total_return = total_value - portfolio["initial_cash"]
                total_return_percent = (total_return / portfolio["initial_cash"]) * 100
                
                return {
                    "portfolio": {
                        **portfolio,
                        "total_value": total_value,
                        "total_return": total_return,
                        "total_return_percent": total_return_percent
                    },
                    "positions": positions_data,
                    "summary": {
                        "cash": portfolio["current_cash"],
                        "positions_value": total_positions_value,
                        "total_value": total_value,
                        "total_return": total_return,
                        "total_return_percent": total_return_percent
                    },
                    "last_updated": datetime.now().isoformat()
                }
                
        return {"error": "Portfolio not found"}
    
    def create_alert(self, user_id: str, symbol: str, alert_type: str, target_price: float, 
                    condition: str = "above") -> Dict[str, Any]:
        """Fiyat alarmı oluştur"""
        if user_id not in self.alerts:
            self.alerts[user_id] = []
            
        alert = {
            "id": f"alert_{len(self.alerts[user_id]) + 1}",
            "symbol": symbol,
            "alert_type": alert_type,  # price, volume, etc.
            "target_price": target_price,
            "condition": condition,  # above, below
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "triggered_at": None
        }
        
        self.alerts[user_id].append(alert)
        return alert
    
    def check_alerts(self, user_id: str) -> List[Dict[str, Any]]:
        """Aktif alarmları kontrol et"""
        if user_id not in self.alerts:
            return []
            
        triggered_alerts = []
        
        for alert in self.alerts[user_id]:
            if alert["status"] != "active":
                continue
                
            try:
                ticker = yf.Ticker(alert["symbol"])
                hist = ticker.history(period="1d")
                
                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
                    
                    triggered = False
                    if alert["condition"] == "above" and current_price >= alert["target_price"]:
                        triggered = True
                    elif alert["condition"] == "below" and current_price <= alert["target_price"]:
                        triggered = True
                    
                    if triggered:
                        alert["status"] = "triggered"
                        alert["triggered_at"] = datetime.now().isoformat()
                        triggered_alerts.append({
                            **alert,
                            "current_price": float(current_price)
                        })
                        
            except Exception as e:
                continue
                
        return triggered_alerts
    
    def _update_portfolio_value(self, portfolio: Dict[str, Any]):
        """Portfolio değerini güncelle"""
        total_positions_value = 0
        
        for symbol, position in portfolio["positions"].items():
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="1d")
                
                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
                    position["current_price"] = float(current_price)
                    total_positions_value += position["shares"] * current_price
                    
            except Exception:
                continue
        
        portfolio["total_value"] = portfolio["current_cash"] + total_positions_value
        portfolio["total_return"] = portfolio["total_value"] - portfolio["initial_cash"]
        portfolio["total_return_percent"] = (portfolio["total_return"] / portfolio["initial_cash"]) * 100
    
    def _get_market_cap(self, symbol: str) -> Optional[float]:
        """Market cap bilgisi al"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return info.get('marketCap')
        except:
            return None
    
    def _get_pe_ratio(self, symbol: str) -> Optional[float]:
        """P/E ratio bilgisi al"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return info.get('trailingPE')
        except:
            return None

# Global instance
watchlist_service = WatchlistService()

def create_watchlist(user_id: str, name: str, symbols: List[str] = None) -> Dict[str, Any]:
    """Watchlist oluştur"""
    return watchlist_service.create_watchlist(user_id, name, symbols)

def add_to_watchlist(user_id: str, watchlist_id: str, symbol: str) -> Dict[str, Any]:
    """Watchlist'e ekle"""
    return watchlist_service.add_to_watchlist(user_id, watchlist_id, symbol)

def get_watchlist_data(user_id: str, watchlist_id: str) -> Dict[str, Any]:
    """Watchlist verilerini getir"""
    return watchlist_service.get_watchlist_data(user_id, watchlist_id)

def create_portfolio(user_id: str, name: str, initial_cash: float = 10000) -> Dict[str, Any]:
    """Portfolio oluştur"""
    return watchlist_service.create_portfolio(user_id, name, initial_cash)

def add_position(user_id: str, portfolio_id: str, symbol: str, shares: float, price: float) -> Dict[str, Any]:
    """Portfolio'ya pozisyon ekle"""
    return watchlist_service.add_position(user_id, portfolio_id, symbol, shares, price)

def get_portfolio_data(user_id: str, portfolio_id: str) -> Dict[str, Any]:
    """Portfolio verilerini getir"""
    return watchlist_service.get_portfolio_data(user_id, portfolio_id)

def create_alert(user_id: str, symbol: str, alert_type: str, target_price: float, condition: str = "above") -> Dict[str, Any]:
    """Alarm oluştur"""
    return watchlist_service.create_alert(user_id, symbol, alert_type, target_price, condition)

def check_alerts(user_id: str) -> List[Dict[str, Any]]:
    """Alarmları kontrol et"""
    return watchlist_service.check_alerts(user_id)
