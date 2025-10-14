"""
Crypto Trading Servisi
Robinhood, Coinbase benzeri özellikler
"""

import yfinance as yf
import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json

class CryptoService:
    """Crypto trading servisi"""
    
    def __init__(self):
        self.crypto_portfolios = {}  # user_id -> crypto_portfolio
        self.crypto_watchlists = {}  # user_id -> crypto_watchlist
        self.crypto_alerts = {}      # user_id -> crypto_alerts
        
    def get_crypto_data(self, symbol: str, period: str = "1d") -> Dict[str, Any]:
        """Crypto verilerini getir"""
        try:
            # Crypto sembolleri için yfinance kullan
            crypto_symbol = f"{symbol}-USD" if not symbol.endswith("-USD") else symbol
            ticker = yf.Ticker(crypto_symbol)
            
            # Güncel veri
            hist = ticker.history(period=period)
            info = ticker.info
            
            if hist.empty:
                return {"error": f"No data available for {symbol}"}
            
            current_price = hist['Close'].iloc[-1]
            prev_close = hist['Open'].iloc[-1] if len(hist) > 1 else current_price
            change = current_price - prev_close
            change_percent = (change / prev_close) * 100 if prev_close != 0 else 0
            
            # 24h veriler
            high_24h = hist['High'].max()
            low_24h = hist['Low'].min()
            volume_24h = hist['Volume'].sum()
            
            return {
                "symbol": symbol,
                "name": info.get('longName', symbol),
                "current_price": float(current_price),
                "change": float(change),
                "change_percent": float(change_percent),
                "high_24h": float(high_24h),
                "low_24h": float(low_24h),
                "volume_24h": float(volume_24h),
                "market_cap": info.get('marketCap'),
                "circulating_supply": info.get('circulatingSupply'),
                "max_supply": info.get('maxSupply'),
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"error": f"Failed to get crypto data: {str(e)}"}
    
    def get_crypto_list(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Popüler crypto listesi"""
        # Popüler crypto sembolleri
        popular_cryptos = [
            "BTC", "ETH", "BNB", "XRP", "ADA", "SOL", "DOT", "DOGE", "AVAX", "SHIB",
            "MATIC", "LTC", "UNI", "LINK", "ATOM", "ALGO", "VET", "FIL", "TRX", "ETC",
            "XLM", "NEAR", "FTM", "MANA", "SAND", "AXS", "CHZ", "FLOW", "ICP", "HBAR",
            "THETA", "EOS", "AAVE", "MKR", "COMP", "YFI", "SNX", "CRV", "1INCH", "BAT",
            "ZRX", "ENJ", "BAND", "KNC", "REN", "LRC", "STORJ", "REP", "NMR", "KEEP"
        ]
        
        crypto_data = []
        
        for symbol in popular_cryptos[:limit]:
            data = self.get_crypto_data(symbol)
            if "error" not in data:
                crypto_data.append(data)
        
        # Market cap'e göre sırala
        crypto_data.sort(key=lambda x: x.get('market_cap', 0), reverse=True)
        
        return crypto_data
    
    def get_crypto_trending(self) -> List[Dict[str, Any]]:
        """Trending crypto'lar"""
        # En çok değişen crypto'lar
        cryptos = self.get_crypto_list(20)
        
        # Değişim yüzdesine göre sırala
        trending = sorted(cryptos, key=lambda x: abs(x.get('change_percent', 0)), reverse=True)
        
        return trending[:10]
    
    def get_crypto_gainers_losers(self) -> Dict[str, List[Dict[str, Any]]]:
        """Kazanan ve kaybeden crypto'lar"""
        cryptos = self.get_crypto_list(30)
        
        gainers = [c for c in cryptos if c.get('change_percent', 0) > 0]
        losers = [c for c in cryptos if c.get('change_percent', 0) < 0]
        
        # Sırala
        gainers.sort(key=lambda x: x.get('change_percent', 0), reverse=True)
        losers.sort(key=lambda x: x.get('change_percent', 0))
        
        return {
            "gainers": gainers[:10],
            "losers": losers[:10]
        }
    
    def create_crypto_portfolio(self, user_id: str, name: str, initial_cash: float = 10000) -> Dict[str, Any]:
        """Crypto portfolio oluştur"""
        portfolio = {
            "id": f"crypto_pf_{user_id}_{len(self.crypto_portfolios.get(user_id, [])) + 1}",
            "name": name,
            "initial_cash": initial_cash,
            "current_cash": initial_cash,
            "positions": {},  # symbol -> {amount, avg_price, current_price}
            "total_value": initial_cash,
            "total_return": 0.0,
            "total_return_percent": 0.0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        if user_id not in self.crypto_portfolios:
            self.crypto_portfolios[user_id] = []
            
        self.crypto_portfolios[user_id].append(portfolio)
        return portfolio
    
    def add_crypto_position(self, user_id: str, portfolio_id: str, symbol: str, amount: float, price: float) -> Dict[str, Any]:
        """Crypto portfolio'ya pozisyon ekle"""
        if user_id not in self.crypto_portfolios:
            return {"error": "User not found"}
            
        for portfolio in self.crypto_portfolios[user_id]:
            if portfolio["id"] == portfolio_id:
                total_cost = amount * price
                
                if total_cost > portfolio["current_cash"]:
                    return {"error": "Insufficient cash"}
                
                if symbol in portfolio["positions"]:
                    # Mevcut pozisyonu güncelle
                    existing = portfolio["positions"][symbol]
                    total_amount = existing["amount"] + amount
                    total_cost_existing = existing["amount"] * existing["avg_price"]
                    new_avg_price = (total_cost_existing + total_cost) / total_amount
                    
                    portfolio["positions"][symbol] = {
                        "amount": total_amount,
                        "avg_price": new_avg_price,
                        "current_price": price
                    }
                else:
                    # Yeni pozisyon
                    portfolio["positions"][symbol] = {
                        "amount": amount,
                        "avg_price": price,
                        "current_price": price
                    }
                
                portfolio["current_cash"] -= total_cost
                portfolio["updated_at"] = datetime.now().isoformat()
                
                # Portfolio değerini güncelle
                self._update_crypto_portfolio_value(portfolio)
                
                return portfolio
                
        return {"error": "Portfolio not found"}
    
    def get_crypto_portfolio_data(self, user_id: str, portfolio_id: str) -> Dict[str, Any]:
        """Crypto portfolio verilerini getir"""
        if user_id not in self.crypto_portfolios:
            return {"error": "User not found"}
            
        for portfolio in self.crypto_portfolios[user_id]:
            if portfolio["id"] == portfolio_id:
                # Güncel fiyatları al
                positions_data = []
                total_positions_value = 0
                
                for symbol, position in portfolio["positions"].items():
                    try:
                        crypto_data = self.get_crypto_data(symbol)
                        
                        if "error" not in crypto_data:
                            current_price = crypto_data["current_price"]
                            position["current_price"] = current_price
                            
                            position_value = position["amount"] * current_price
                            cost_basis = position["amount"] * position["avg_price"]
                            gain_loss = position_value - cost_basis
                            gain_loss_percent = (gain_loss / cost_basis) * 100 if cost_basis > 0 else 0
                            
                            positions_data.append({
                                "symbol": symbol,
                                "name": crypto_data.get("name", symbol),
                                "amount": position["amount"],
                                "avg_price": position["avg_price"],
                                "current_price": current_price,
                                "position_value": position_value,
                                "cost_basis": cost_basis,
                                "gain_loss": gain_loss,
                                "gain_loss_percent": gain_loss_percent,
                                "change_24h": crypto_data.get("change_percent", 0)
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
    
    def create_crypto_watchlist(self, user_id: str, name: str, symbols: List[str] = None) -> Dict[str, Any]:
        """Crypto watchlist oluştur"""
        if user_id not in self.crypto_watchlists:
            self.crypto_watchlists[user_id] = []
            
        watchlist = {
            "id": f"crypto_wl_{len(self.crypto_watchlists[user_id]) + 1}",
            "name": name,
            "symbols": symbols or [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        self.crypto_watchlists[user_id].append(watchlist)
        return watchlist
    
    def get_crypto_watchlist_data(self, user_id: str, watchlist_id: str) -> Dict[str, Any]:
        """Crypto watchlist verilerini getir"""
        if user_id not in self.crypto_watchlists:
            return {"error": "User not found"}
            
        for watchlist in self.crypto_watchlists[user_id]:
            if watchlist["id"] == watchlist_id:
                symbols_data = []
                
                for symbol in watchlist["symbols"]:
                    data = self.get_crypto_data(symbol)
                    if "error" not in data:
                        symbols_data.append(data)
                
                return {
                    "watchlist": watchlist,
                    "symbols_data": symbols_data,
                    "total_symbols": len(watchlist["symbols"]),
                    "last_updated": datetime.now().isoformat()
                }
                
        return {"error": "Watchlist not found"}
    
    def create_crypto_alert(self, user_id: str, symbol: str, target_price: float, 
                          condition: str = "above") -> Dict[str, Any]:
        """Crypto alarmı oluştur"""
        if user_id not in self.crypto_alerts:
            self.crypto_alerts[user_id] = []
            
        alert = {
            "id": f"crypto_alert_{len(self.crypto_alerts[user_id]) + 1}",
            "symbol": symbol,
            "target_price": target_price,
            "condition": condition,  # above, below
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "triggered_at": None
        }
        
        self.crypto_alerts[user_id].append(alert)
        return alert
    
    def check_crypto_alerts(self, user_id: str) -> List[Dict[str, Any]]:
        """Crypto alarmları kontrol et"""
        if user_id not in self.crypto_alerts:
            return []
            
        triggered_alerts = []
        
        for alert in self.crypto_alerts[user_id]:
            if alert["status"] != "active":
                continue
                
            try:
                crypto_data = self.get_crypto_data(alert["symbol"])
                
                if "error" not in crypto_data:
                    current_price = crypto_data["current_price"]
                    
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
                            "current_price": current_price
                        })
                        
            except Exception as e:
                continue
                
        return triggered_alerts
    
    def _update_crypto_portfolio_value(self, portfolio: Dict[str, Any]):
        """Crypto portfolio değerini güncelle"""
        total_positions_value = 0
        
        for symbol, position in portfolio["positions"].items():
            try:
                crypto_data = self.get_crypto_data(symbol)
                
                if "error" not in crypto_data:
                    current_price = crypto_data["current_price"]
                    position["current_price"] = current_price
                    total_positions_value += position["amount"] * current_price
                    
            except Exception:
                continue
        
        portfolio["total_value"] = portfolio["current_cash"] + total_positions_value
        portfolio["total_return"] = portfolio["total_value"] - portfolio["initial_cash"]
        portfolio["total_return_percent"] = (portfolio["total_return"] / portfolio["initial_cash"]) * 100

# Global instance
crypto_service = CryptoService()

def get_crypto_data(symbol: str, period: str = "1d") -> Dict[str, Any]:
    """Crypto verilerini getir"""
    return crypto_service.get_crypto_data(symbol, period)

def get_crypto_list(limit: int = 50) -> List[Dict[str, Any]]:
    """Crypto listesi"""
    return crypto_service.get_crypto_list(limit)

def get_crypto_trending() -> List[Dict[str, Any]]:
    """Trending crypto'lar"""
    return crypto_service.get_crypto_trending()

def get_crypto_gainers_losers() -> Dict[str, List[Dict[str, Any]]]:
    """Kazanan ve kaybeden crypto'lar"""
    return crypto_service.get_crypto_gainers_losers()

def create_crypto_portfolio(user_id: str, name: str, initial_cash: float = 10000) -> Dict[str, Any]:
    """Crypto portfolio oluştur"""
    return crypto_service.create_crypto_portfolio(user_id, name, initial_cash)

def add_crypto_position(user_id: str, portfolio_id: str, symbol: str, amount: float, price: float) -> Dict[str, Any]:
    """Crypto pozisyon ekle"""
    return crypto_service.add_crypto_position(user_id, portfolio_id, symbol, amount, price)

def get_crypto_portfolio_data(user_id: str, portfolio_id: str) -> Dict[str, Any]:
    """Crypto portfolio verilerini getir"""
    return crypto_service.get_crypto_portfolio_data(user_id, portfolio_id)
