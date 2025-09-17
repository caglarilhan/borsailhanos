"""
FastAPI Güvenlik Sistemi
Rate limiting, API key authentication, audit logging
"""

import time
import hashlib
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from collections import defaultdict, deque
from functools import wraps
import json
import os

from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

class RateLimiter:
    """Rate limiting sistemi"""
    
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(deque)
        self.blocked_ips = set()
        self.blocked_until = {}
    
    def is_allowed(self, client_ip: str) -> bool:
        """İstek izin verilir mi kontrol et"""
        now = time.time()
        
        # Blocked IP kontrolü
        if client_ip in self.blocked_ips:
            if client_ip in self.blocked_until and now < self.blocked_until[client_ip]:
                return False
            else:
                # Block süresi dolmuş
                self.blocked_ips.remove(client_ip)
                if client_ip in self.blocked_until:
                    del self.blocked_until[client_ip]
        
        # Eski istekleri temizle
        while self.requests[client_ip] and self.requests[client_ip][0] <= now - self.window_seconds:
            self.requests[client_ip].popleft()
        
        # Yeni istek ekle
        self.requests[client_ip].append(now)
        
        # Limit kontrolü
        if len(self.requests[client_ip]) > self.max_requests:
            # IP'yi blokla
            self.blocked_ips.add(client_ip)
            self.blocked_until[client_ip] = now + 300  # 5 dakika blok
            logger.warning(f"⚠️ IP bloklandı: {client_ip} (rate limit aşıldı)")
            return False
        
        return True
    
    def get_stats(self) -> Dict[str, Any]:
        """Rate limiter istatistikleri"""
        return {
            'max_requests': self.max_requests,
            'window_seconds': self.window_seconds,
            'active_ips': len(self.requests),
            'blocked_ips': len(self.blocked_ips),
            'total_requests': sum(len(reqs) for reqs in self.requests.values())
        }

class APIKeyManager:
    """API key yönetimi"""
    
    def __init__(self):
        self.api_keys = {}
        self.key_usage = defaultdict(list)
        self.key_limits = {}
        self.load_api_keys()
    
    def load_api_keys(self):
        """API key'leri yükle"""
        # Environment'dan API key'leri yükle
        api_keys_env = os.getenv('API_KEYS', '')
        if api_keys_env:
            try:
                keys_data = json.loads(api_keys_env)
                for key_data in keys_data:
                    key = key_data['key']
                    self.api_keys[key] = {
                        'name': key_data.get('name', 'Unknown'),
                        'permissions': key_data.get('permissions', ['read']),
                        'rate_limit': key_data.get('rate_limit', 1000),
                        'created_at': datetime.now().isoformat()
                    }
                    self.key_limits[key] = key_data.get('rate_limit', 1000)
            except Exception as e:
                logger.error(f"❌ API key yükleme hatası: {e}")
        
        # Varsayılan API key ekle
        if not self.api_keys:
            default_key = self.generate_api_key('default')
            self.api_keys[default_key] = {
                'name': 'Default API Key',
                'permissions': ['read', 'write'],
                'rate_limit': 100,
                'created_at': datetime.now().isoformat()
            }
            self.key_limits[default_key] = 100
            logger.info(f"✅ Varsayılan API key oluşturuldu: {default_key}")
    
    def generate_api_key(self, name: str) -> str:
        """Yeni API key oluştur"""
        timestamp = str(int(time.time()))
        random_data = os.urandom(16).hex()
        key_data = f"{name}_{timestamp}_{random_data}"
        api_key = hashlib.sha256(key_data.encode()).hexdigest()[:32]
        return api_key
    
    def validate_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """API key doğrula"""
        if api_key not in self.api_keys:
            return None
        
        # Rate limit kontrolü
        now = time.time()
        key_requests = self.key_usage[api_key]
        
        # Eski istekleri temizle (1 saatlik pencere)
        while key_requests and key_requests[0] <= now - 3600:
            key_requests.pop(0)
        
        # Limit kontrolü
        if len(key_requests) >= self.key_limits[api_key]:
            logger.warning(f"⚠️ API key rate limit aşıldı: {api_key}")
            return None
        
        # Yeni istek ekle
        key_requests.append(now)
        
        return self.api_keys[api_key]
    
    def has_permission(self, api_key: str, permission: str) -> bool:
        """İzin kontrolü"""
        key_info = self.api_keys.get(api_key)
        if not key_info:
            return False
        
        return permission in key_info['permissions']
    
    def get_stats(self) -> Dict[str, Any]:
        """API key istatistikleri"""
        return {
            'total_keys': len(self.api_keys),
            'active_keys': len([k for k, v in self.key_usage.items() if v]),
            'key_usage': {k: len(v) for k, v in self.key_usage.items()}
        }

class AuditLogger:
    """Audit logging sistemi"""
    
    def __init__(self, log_file: str = 'audit.log'):
        self.log_file = log_file
        self.audit_logger = logging.getLogger('audit')
        self.audit_logger.setLevel(logging.INFO)
        
        # File handler ekle
        handler = logging.FileHandler(log_file)
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.audit_logger.addHandler(handler)
    
    def log_request(self, request: Request, api_key: str = None, 
                   response_status: int = None, response_time: float = None):
        """İstek logla"""
        log_data = {
            'timestamp': datetime.now().isoformat(),
            'method': request.method,
            'url': str(request.url),
            'client_ip': request.client.host,
            'user_agent': request.headers.get('user-agent', ''),
            'api_key': api_key,
            'response_status': response_status,
            'response_time': response_time
        }
        
        self.audit_logger.info(json.dumps(log_data))
    
    def log_security_event(self, event_type: str, details: Dict[str, Any]):
        """Güvenlik olayı logla"""
        log_data = {
            'timestamp': datetime.now().isoformat(),
            'event_type': event_type,
            'details': details
        }
        
        self.audit_logger.warning(json.dumps(log_data))

# Global instances
rate_limiter = RateLimiter(max_requests=100, window_seconds=60)
api_key_manager = APIKeyManager()
audit_logger = AuditLogger()

# Security dependencies
security = HTTPBearer()

def get_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """API key al"""
    if not credentials:
        raise HTTPException(status_code=401, detail="API key gerekli")
    
    return credentials.credentials

def verify_api_key(api_key: str = Depends(get_api_key)) -> Dict[str, Any]:
    """API key doğrula"""
    key_info = api_key_manager.validate_api_key(api_key)
    if not key_info:
        raise HTTPException(status_code=401, detail="Geçersiz API key")
    
    return key_info

def check_permission(permission: str):
    """İzin kontrolü decorator"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # API key bilgisini al
            api_key = kwargs.get('api_key')
            if not api_key:
                raise HTTPException(status_code=401, detail="API key gerekli")
            
            if not api_key_manager.has_permission(api_key, permission):
                raise HTTPException(status_code=403, detail=f"{permission} izni gerekli")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def rate_limit_check(request: Request):
    """Rate limit kontrolü"""
    client_ip = request.client.host
    
    if not rate_limiter.is_allowed(client_ip):
        audit_logger.log_security_event('rate_limit_exceeded', {
            'client_ip': client_ip,
            'url': str(request.url)
        })
        raise HTTPException(status_code=429, detail="Rate limit aşıldı")
    
    return True

def security_middleware(request: Request, call_next):
    """Güvenlik middleware"""
    start_time = time.time()
    
    try:
        # Rate limit kontrolü
        rate_limit_check(request)
        
        # İsteği işle
        response = call_next(request)
        
        # Response time hesapla
        response_time = time.time() - start_time
        
        # Audit log
        api_key = None
        if 'authorization' in request.headers:
            try:
                auth_header = request.headers['authorization']
                if auth_header.startswith('Bearer '):
                    api_key = auth_header[7:]
            except:
                pass
        
        audit_logger.log_request(
            request, 
            api_key=api_key,
            response_status=response.status_code,
            response_time=response_time
        )
        
        return response
        
    except HTTPException as e:
        # Güvenlik olayı logla
        audit_logger.log_security_event('http_exception', {
            'status_code': e.status_code,
            'detail': e.detail,
            'client_ip': request.client.host,
            'url': str(request.url)
        })
        raise e
    except Exception as e:
        # Genel hata logla
        audit_logger.log_security_event('unexpected_error', {
            'error': str(e),
            'client_ip': request.client.host,
            'url': str(request.url)
        })
        raise e

def get_security_stats() -> Dict[str, Any]:
    """Güvenlik istatistikleri"""
    return {
        'rate_limiter': rate_limiter.get_stats(),
        'api_keys': api_key_manager.get_stats(),
        'audit_log_file': audit_logger.log_file
    }
