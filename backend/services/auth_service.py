#!/usr/bin/env python3
"""
Auth Service - JWT Authentication + RBAC
Kullanıcı kimlik doğrulama ve yetkilendirme
"""

import json
from datetime import datetime, timedelta
import hashlib
import secrets

class AuthService:
    """
    JWT Authentication servisi
    """
    
    def __init__(self):
        self.secret_key = secrets.token_hex(32)
        self.access_token_expire = 3600  # 1 saat
        self.refresh_token_expire = 604800  # 7 gün
        self.users = {}  # {username: {password_hash, role, ...}}
        self.tokens = {}  # {token: {user, expires, ...}}
        
        # Demo kullanıcı
        self._create_demo_users()
    
    def _create_demo_users(self):
        """Demo kullanıcılar oluştur"""
        self.register('admin', 'admin123', 'admin', 'admin@bistai.com')
        self.register('trader', 'trader123', 'trader', 'trader@bistai.com')
        self.register('viewer', 'viewer123', 'viewer', 'viewer@bistai.com')
    
    def register(self, username: str, password: str, role: str = 'trader', email: str = ''):
        """
        Yeni kullanıcı kaydı
        """
        if username in self.users:
            return {'status': 'error', 'message': 'Kullanıcı zaten mevcut'}
        
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        self.users[username] = {
            'password_hash': password_hash,
            'role': role,
            'email': email,
            'created_at': datetime.now().isoformat(),
            'last_login': None
        }
        
        return {
            'status': 'success',
            'message': 'Kullanıcı oluşturuldu',
            'username': username,
            'role': role
        }
    
    def login(self, username: str, password: str):
        """
        Kullanıcı girişi - Access ve Refresh token döndür
        """
        if username not in self.users:
            return {'status': 'error', 'message': 'Kullanıcı bulunamadı'}
        
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        if self.users[username]['password_hash'] != password_hash:
            return {'status': 'error', 'message': 'Şifre yanlış'}
        
        # Access token oluştur
        access_token = secrets.token_urlsafe(32)
        refresh_token = secrets.token_urlsafe(32)
        
        # Token kaydet
        self.tokens[access_token] = {
            'username': username,
            'role': self.users[username]['role'],
            'type': 'access',
            'expires': (datetime.now() + timedelta(seconds=self.access_token_expire)).isoformat()
        }
        
        self.tokens[refresh_token] = {
            'username': username,
            'role': self.users[username]['role'],
            'type': 'refresh',
            'expires': (datetime.now() + timedelta(seconds=self.refresh_token_expire)).isoformat()
        }
        
        # Last login güncelle
        self.users[username]['last_login'] = datetime.now().isoformat()
        
        return {
            'status': 'success',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': self.access_token_expire,
            'user': {
                'username': username,
                'role': self.users[username]['role'],
                'email': self.users[username]['email']
            }
        }
    
    def verify_token(self, token: str):
        """
        Token doğrula
        """
        if token not in self.tokens:
            return {'status': 'error', 'message': 'Geçersiz token'}
        
        token_data = self.tokens[token]
        expires = datetime.fromisoformat(token_data['expires'])
        
        if datetime.now() > expires:
            del self.tokens[token]
            return {'status': 'error', 'message': 'Token süresi dolmuş'}
        
        return {
            'status': 'success',
            'username': token_data['username'],
            'role': token_data['role']
        }
    
    def refresh_access_token(self, refresh_token: str):
        """
        Access token yenile
        """
        verify_result = self.verify_token(refresh_token)
        
        if verify_result['status'] != 'success':
            return verify_result
        
        if self.tokens[refresh_token]['type'] != 'refresh':
            return {'status': 'error', 'message': 'Geçersiz refresh token'}
        
        # Yeni access token oluştur
        new_access_token = secrets.token_urlsafe(32)
        
        self.tokens[new_access_token] = {
            'username': verify_result['username'],
            'role': verify_result['role'],
            'type': 'access',
            'expires': (datetime.now() + timedelta(seconds=self.access_token_expire)).isoformat()
        }
        
        return {
            'status': 'success',
            'access_token': new_access_token,
            'expires_in': self.access_token_expire
        }
    
    def logout(self, token: str):
        """
        Çıkış yap - token'ı sil
        """
        if token in self.tokens:
            del self.tokens[token]
            return {'status': 'success', 'message': 'Çıkış başarılı'}
        
        return {'status': 'error', 'message': 'Token bulunamadı'}
    
    def check_permission(self, token: str, required_role: str):
        """
        Yetki kontrolü (RBAC)
        
        Roles: admin > trader > viewer
        """
        verify_result = self.verify_token(token)
        
        if verify_result['status'] != 'success':
            return False
        
        role_hierarchy = {'admin': 3, 'trader': 2, 'viewer': 1}
        
        user_role_level = role_hierarchy.get(verify_result['role'], 0)
        required_role_level = role_hierarchy.get(required_role, 0)
        
        return user_role_level >= required_role_level

# Global instance
auth_service = AuthService()

if __name__ == '__main__':
    # Test
    print("🔐 Auth Service Test")
    print("=" * 50)
    
    # Login
    login_result = auth_service.login('admin', 'admin123')
    print("Login:", json.dumps(login_result, indent=2))
    
    if login_result['status'] == 'success':
        access_token = login_result['access_token']
        
        # Verify
        verify = auth_service.verify_token(access_token)
        print("\nVerify:", verify)
        
        # Check permission
        can_admin = auth_service.check_permission(access_token, 'admin')
        print(f"\nCan admin: {can_admin}")
        
        # Refresh
        refresh = auth_service.refresh_access_token(login_result['refresh_token'])
        print("\nRefresh:", refresh)
