#!/usr/bin/env python3
"""
Sosyal Trading ve Copy Trading Sistemi
Robinhood ve eToro benzeri özellikler
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import uuid
import json

class SocialTradingService:
    def __init__(self):
        self.traders = {}  # {trader_id: trader_info}
        self.followers = {}  # {trader_id: [follower_ids]}
        self.copy_trades = {}  # {copy_id: copy_info}
        self.performance_history = {}  # {trader_id: [performance_data]}
        
        # Demo trader'lar oluştur
        self._create_demo_traders()
    
    def _create_demo_traders(self):
        """Demo trader'lar oluştur"""
        demo_traders = [
            {
                "id": "trader_1",
                "name": "BIST Master",
                "avatar": "👑",
                "followers_count": 1250,
                "win_rate": 0.78,
                "total_return": 0.45,
                "risk_level": "Medium",
                "specialty": "BIST 100",
                "bio": "BIST uzmanı, 5 yıllık deneyim",
                "verified": True,
                "created_at": datetime.now() - timedelta(days=365),
                "last_active": datetime.now() - timedelta(hours=2),
            },
            {
                "id": "trader_2", 
                "name": "Tech Trader",
                "avatar": "🚀",
                "followers_count": 890,
                "win_rate": 0.72,
                "total_return": 0.38,
                "risk_level": "High",
                "specialty": "Technology",
                "bio": "Teknoloji hisseleri uzmanı",
                "verified": True,
                "created_at": datetime.now() - timedelta(days=200),
                "last_active": datetime.now() - timedelta(minutes=30),
            },
            {
                "id": "trader_3",
                "name": "Safe Investor",
                "avatar": "🛡️",
                "followers_count": 2100,
                "win_rate": 0.85,
                "total_return": 0.28,
                "risk_level": "Low",
                "specialty": "Blue Chips",
                "bio": "Güvenli yatırım stratejileri",
                "verified": True,
                "created_at": datetime.now() - timedelta(days=500),
                "last_active": datetime.now() - timedelta(hours=1),
            }
        ]
        
        for trader in demo_traders:
            self.traders[trader["id"]] = trader
            self.followers[trader["id"]] = []
            self.performance_history[trader["id"]] = self._generate_performance_data()
    
    def _generate_performance_data(self):
        """Demo performans verisi oluştur"""
        import random
        data = []
        for i in range(30):  # Son 30 gün
            date = datetime.now() - timedelta(days=30-i)
            daily_return = random.uniform(-0.05, 0.08)
            data.append({
                "date": date.isoformat(),
                "daily_return": round(daily_return, 4),
                "cumulative_return": round(sum([d["daily_return"] for d in data]) + daily_return, 4)
            })
        return data
    
    def get_top_traders(self, limit: int = 10) -> List[Dict]:
        """En iyi trader'ları getir"""
        traders = list(self.traders.values())
        # Followers count'a göre sırala
        traders.sort(key=lambda x: x["followers_count"], reverse=True)
        return traders[:limit]
    
    def get_trader_details(self, trader_id: str) -> Optional[Dict]:
        """Trader detaylarını getir"""
        trader = self.traders.get(trader_id)
        if not trader:
            return None
        
        # Performans verilerini ekle
        trader["performance_history"] = self.performance_history.get(trader_id, [])
        trader["recent_trades"] = self._get_recent_trades(trader_id)
        
        return trader
    
    def _get_recent_trades(self, trader_id: str) -> List[Dict]:
        """Son işlemleri getir"""
        import random
        
        trades = []
        symbols = ["SISE.IS", "EREGL.IS", "TUPRS.IS", "AKBNK.IS", "GARAN.IS"]
        
        for i in range(5):  # Son 5 işlem
            trade = {
                "id": f"trade_{i}",
                "symbol": random.choice(symbols),
                "action": random.choice(["BUY", "SELL"]),
                "quantity": random.randint(100, 1000),
                "price": round(random.uniform(10, 200), 2),
                "timestamp": datetime.now() - timedelta(hours=i*2),
                "profit_loss": round(random.uniform(-500, 1000), 2),
                "status": "completed"
            }
            trades.append(trade)
        
        return trades
    
    def follow_trader(self, trader_id: str, follower_id: str) -> Dict:
        """Trader'ı takip et"""
        if trader_id not in self.traders:
            return {"success": False, "error": "Trader bulunamadı"}
        
        if trader_id not in self.followers:
            self.followers[trader_id] = []
        
        if follower_id not in self.followers[trader_id]:
            self.followers[trader_id].append(follower_id)
            self.traders[trader_id]["followers_count"] += 1
            
            return {
                "success": True,
                "message": f"Trader takip edildi",
                "followers_count": self.traders[trader_id]["followers_count"]
            }
        
        return {"success": False, "error": "Zaten takip ediliyor"}
    
    def unfollow_trader(self, trader_id: str, follower_id: str) -> Dict:
        """Trader takibini bırak"""
        if trader_id in self.followers and follower_id in self.followers[trader_id]:
            self.followers[trader_id].remove(follower_id)
            self.traders[trader_id]["followers_count"] -= 1
            
            return {
                "success": True,
                "message": "Takip bırakıldı",
                "followers_count": self.traders[trader_id]["followers_count"]
            }
        
        return {"success": False, "error": "Takip edilmiyor"}
    
    def create_copy_trade(self, trader_id: str, follower_id: str, amount: float) -> Dict:
        """Copy trade oluştur"""
        trader = self.traders.get(trader_id)
        if not trader:
            return {"success": False, "error": "Trader bulunamadı"}
        
        copy_id = str(uuid.uuid4())
        copy_trade = {
            "id": copy_id,
            "trader_id": trader_id,
            "follower_id": follower_id,
            "amount": amount,
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "performance": 0.0,
            "risk_level": trader["risk_level"]
        }
        
        self.copy_trades[copy_id] = copy_trade
        
        return {
            "success": True,
            "copy_trade": copy_trade,
            "message": "Copy trade başlatıldı"
        }
    
    def get_copy_trades(self, user_id: str) -> List[Dict]:
        """Kullanıcının copy trade'lerini getir"""
        user_trades = []
        for copy_id, copy_trade in self.copy_trades.items():
            if copy_trade["follower_id"] == user_id:
                trader_info = self.traders.get(copy_trade["trader_id"])
                if trader_info:
                    copy_trade["trader_name"] = trader_info["name"]
                    copy_trade["trader_avatar"] = trader_info["avatar"]
                user_trades.append(copy_trade)
        
        return user_trades
    
    def get_social_feed(self, limit: int = 20) -> List[Dict]:
        """Sosyal feed getir"""
        import random
        
        feed_items = []
        traders = list(self.traders.values())
        
        for i in range(limit):
            trader = random.choice(traders)
            item = {
                "id": f"feed_{i}",
                "trader_id": trader["id"],
                "trader_name": trader["name"],
                "trader_avatar": trader["avatar"],
                "action": random.choice(["BUY", "SELL", "ANALYSIS", "COMMENT"]),
                "symbol": random.choice(["SISE.IS", "EREGL.IS", "TUPRS.IS"]),
                "content": self._generate_feed_content(trader["name"]),
                "timestamp": datetime.now() - timedelta(hours=i),
                "likes": random.randint(5, 50),
                "comments": random.randint(0, 10),
                "verified": trader["verified"]
            }
            feed_items.append(item)
        
        return feed_items
    
    def _generate_feed_content(self, trader_name: str) -> str:
        """Feed içeriği oluştur"""
        contents = [
            f"{trader_name} SISE.IS için güçlü BUY sinyali verdi!",
            f"{trader_name} teknoloji sektöründe fırsat görüyor",
            f"{trader_name} portföyünü %15 artırdı",
            f"{trader_name} risk yönetimi stratejisini paylaştı",
            f"{trader_name} BIST 100 analizi yayınladı"
        ]
        import random
        return random.choice(contents)
    
    def like_feed_item(self, feed_id: str, user_id: str) -> Dict:
        """Feed item'ını beğen"""
        # Demo için basit implementasyon
        return {
            "success": True,
            "message": "Beğenildi",
            "likes": 42  # Demo değer
        }
    
    def comment_feed_item(self, feed_id: str, user_id: str, comment: str) -> Dict:
        """Feed item'ına yorum yap"""
        return {
            "success": True,
            "message": "Yorum eklendi",
            "comment_id": str(uuid.uuid4()),
            "comment": comment,
            "timestamp": datetime.now().isoformat()
        }

# Global instance
social_trading_service = SocialTradingService()
