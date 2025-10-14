#!/usr/bin/env python3
"""
Kullanıcı yönetim servisi
Firebase Auth + Firestore entegrasyonu
"""

from typing import Dict, Optional, List
from datetime import datetime
import hashlib
import secrets
import json

class UserService:
    def __init__(self):
        self.users = {}  # Geçici in-memory storage
        self.sessions = {}
    
    def register_user(self, email: str, password: str, name: str) -> Dict:
        """Kullanıcı kaydı"""
        try:
            # Email kontrolü
            if email in self.users:
                return {"error": "Bu email zaten kayıtlı"}
            
            # Şifre hash'le
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            # Kullanıcı oluştur
            user_id = secrets.token_hex(16)
            user = {
                "id": user_id,
                "email": email,
                "name": name,
                "password_hash": password_hash,
                "created_at": datetime.now().isoformat(),
                "subscription": "free",  # free, premium, pro
                "preferences": {
                    "notifications": True,
                    "market": "BIST",
                    "theme": "light"
                },
                "portfolio": {
                    "balance": 100000.0,  # Demo bakiye
                    "positions": [],
                    "total_pnl": 0.0
                },
                "api_keys": {
                    "finnhub": None,
                    "broker": None
                }
            }
            
            self.users[email] = user
            
            return {
                "success": True,
                "user_id": user_id,
                "message": "Kullanıcı başarıyla kaydedildi"
            }
            
        except Exception as e:
            return {"error": f"Kayıt hatası: {str(e)}"}
    
    def login_user(self, email: str, password: str) -> Dict:
        """Kullanıcı girişi"""
        try:
            if email not in self.users:
                return {"error": "Email bulunamadı"}
            
            user = self.users[email]
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            if user["password_hash"] != password_hash:
                return {"error": "Şifre hatalı"}
            
            # Session token oluştur
            session_token = secrets.token_hex(32)
            self.sessions[session_token] = {
                "user_id": user["id"],
                "email": email,
                "created_at": datetime.now().isoformat(),
                "expires_at": (datetime.now().timestamp() + 86400)  # 24 saat
            }
            
            return {
                "success": True,
                "session_token": session_token,
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "name": user["name"],
                    "subscription": user["subscription"],
                    "preferences": user["preferences"]
                }
            }
            
        except Exception as e:
            return {"error": f"Giriş hatası: {str(e)}"}
    
    def get_user_by_token(self, session_token: str) -> Optional[Dict]:
        """Session token ile kullanıcı bilgisi al"""
        if session_token not in self.sessions:
            return None
        
        session = self.sessions[session_token]
        
        # Session süresi kontrolü
        if datetime.now().timestamp() > session["expires_at"]:
            del self.sessions[session_token]
            return None
        
        email = session["email"]
        if email not in self.users:
            return None
        
        user = self.users[email].copy()
        del user["password_hash"]  # Şifreyi döndürme
        return user
    
    def update_user_preferences(self, session_token: str, preferences: Dict) -> Dict:
        """Kullanıcı tercihlerini güncelle"""
        user = self.get_user_by_token(session_token)
        if not user:
            return {"error": "Geçersiz session"}
        
        email = user["email"]
        self.users[email]["preferences"].update(preferences)
        
        return {"success": True, "message": "Tercihler güncellendi"}
    
    def upgrade_subscription(self, session_token: str, plan: str) -> Dict:
        """Abonelik yükselt"""
        user = self.get_user_by_token(session_token)
        if not user:
            return {"error": "Geçersiz session"}
        
        if plan not in ["premium", "pro"]:
            return {"error": "Geçersiz plan"}
        
        email = user["email"]
        self.users[email]["subscription"] = plan
        
        return {
            "success": True,
            "message": f"{plan.title()} planına yükseltildi",
            "subscription": plan
        }
    
    def get_user_portfolio(self, session_token: str) -> Dict:
        """Kullanıcı portföyü"""
        user = self.get_user_by_token(session_token)
        if not user:
            return {"error": "Geçersiz session"}
        
        return {
            "portfolio": user["portfolio"],
            "subscription": user["subscription"]
        }
    
    def add_api_key(self, session_token: str, service: str, api_key: str) -> Dict:
        """API anahtarı ekle"""
        user = self.get_user_by_token(session_token)
        if not user:
            return {"error": "Geçersiz session"}
        
        if service not in ["finnhub", "broker"]:
            return {"error": "Geçersiz servis"}
        
        email = user["email"]
        self.users[email]["api_keys"][service] = api_key
        
        return {"success": True, "message": f"{service} API anahtarı eklendi"}

# Global instance
user_service = UserService()

# Test kullanıcıları
def create_test_users():
    """Test kullanıcıları oluştur"""
    test_users = [
        {"email": "demo@bistai.com", "password": "demo123", "name": "Demo Kullanıcı"},
        {"email": "premium@bistai.com", "password": "premium123", "name": "Premium Kullanıcı"},
        {"email": "pro@bistai.com", "password": "pro123", "name": "Pro Kullanıcı"}
    ]
    
    for user_data in test_users:
        result = user_service.register_user(
            user_data["email"],
            user_data["password"], 
            user_data["name"]
        )
        
        # Premium ve Pro kullanıcıları yükselt
        if "premium" in user_data["email"]:
            user_service.users[user_data["email"]]["subscription"] = "premium"
        elif "pro" in user_data["email"]:
            user_service.users[user_data["email"]]["subscription"] = "pro"

# Test kullanıcılarını oluştur
create_test_users()
