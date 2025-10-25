"""
🚀 BIST AI Smart Trader - Socket Auth Middleware
==============================================

WebSocket bağlantıları için JWT doğrulama katmanı.
Rate limiting ve güvenlik kontrolleri ile.

Özellikler:
- JWT token doğrulama
- Rate limiting
- IP filtering
- User session management
- Connection logging
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import jwt
import hashlib
import socketio
from backend.services.auth_service import AuthService
from backend.services.rate_limiter import RateLimiter

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SocketSession:
    """Socket session veri yapısı"""
    sid: str
    user_id: Optional[str]
    ip_address: str
    user_agent: str
    connected_at: datetime
    last_activity: datetime
    permissions: List[str]
    rate_limit_data: Dict
    is_authenticated: bool = False

class SocketAuthMiddleware:
    """Socket authentication middleware"""
    
    def __init__(self, secret_key: str = "your-secret-key"):
        self.secret_key = secret_key
        self.auth_service = AuthService()
        self.rate_limiter = RateLimiter()
        self.active_sessions: Dict[str, SocketSession] = {}
        self.blocked_ips: Dict[str, datetime] = {}
        self.failed_attempts: Dict[str, List[datetime]] = {}
        
        # Rate limiting ayarları
        self.max_connections_per_ip = 10
        self.max_failed_attempts = 5
        self.block_duration = timedelta(minutes=15)
        self.cleanup_interval = timedelta(minutes=5)
        
        # Cleanup task başlat
        asyncio.create_task(self.cleanup_expired_sessions())
    
    async def authenticate_connection(self, sid: str, environ: Dict, auth: Optional[Dict] = None) -> Tuple[bool, Optional[str], Dict]:
        """Bağlantı doğrulaması"""
        try:
            # IP adresini al
            ip_address = self.get_client_ip(environ)
            user_agent = environ.get('HTTP_USER_AGENT', 'Unknown')
            
            # IP blocking kontrolü
            if self.is_ip_blocked(ip_address):
                logger.warning(f"🚫 Blocked IP attempted connection: {ip_address}")
                return False, "IP address is blocked", {}
            
            # Rate limiting kontrolü
            if not self.check_connection_rate_limit(ip_address):
                logger.warning(f"🚫 Rate limit exceeded for IP: {ip_address}")
                return False, "Rate limit exceeded", {}
            
            # JWT token doğrulama
            user_data = None
            permissions = []
            is_authenticated = False
            
            if auth and 'token' in auth:
                try:
                    user_data = self.auth_service.verify_token(auth['token'])
                    permissions = user_data.get('permissions', [])
                    is_authenticated = True
                    logger.info(f"✅ Authenticated user: {user_data.get('user_id')}")
                except jwt.ExpiredSignatureError:
                    logger.warning(f"⚠️ Expired token for {ip_address}")
                    return False, "Token expired", {}
                except jwt.InvalidTokenError:
                    logger.warning(f"⚠️ Invalid token for {ip_address}")
                    self.record_failed_attempt(ip_address)
                    return False, "Invalid token", {}
                except Exception as e:
                    logger.error(f"❌ Token verification error: {e}")
                    return False, "Authentication failed", {}
            else:
                # Anonymous connection
                logger.info(f"📱 Anonymous connection from {ip_address}")
            
            # Session oluştur
            session = SocketSession(
                sid=sid,
                user_id=user_data.get('user_id') if user_data else None,
                ip_address=ip_address,
                user_agent=user_agent,
                connected_at=datetime.now(),
                last_activity=datetime.now(),
                permissions=permissions,
                rate_limit_data={
                    'requests': 0,
                    'window_start': datetime.now()
                },
                is_authenticated=is_authenticated
            )
            
            self.active_sessions[sid] = session
            
            # Başarılı bağlantıyı logla
            logger.info(f"✅ Socket connection established: {sid} from {ip_address}")
            
            return True, None, {
                'user_id': session.user_id,
                'permissions': permissions,
                'is_authenticated': is_authenticated
            }
            
        except Exception as e:
            logger.error(f"❌ Authentication error: {e}")
            return False, "Authentication failed", {}
    
    def get_client_ip(self, environ: Dict) -> str:
        """Client IP adresini al"""
        # Proxy headers kontrolü
        forwarded_for = environ.get('HTTP_X_FORWARDED_FOR')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        
        real_ip = environ.get('HTTP_X_REAL_IP')
        if real_ip:
            return real_ip
        
        # Direct connection
        return environ.get('REMOTE_ADDR', 'unknown')
    
    def is_ip_blocked(self, ip_address: str) -> bool:
        """IP adresinin bloklu olup olmadığını kontrol et"""
        if ip_address in self.blocked_ips:
            block_time = self.blocked_ips[ip_address]
            if datetime.now() - block_time < self.block_duration:
                return True
            else:
                # Block süresi dolmuş, kaldır
                del self.blocked_ips[ip_address]
        
        return False
    
    def check_connection_rate_limit(self, ip_address: str) -> bool:
        """Bağlantı rate limiting kontrolü"""
        try:
            # Aynı IP'den aktif bağlantı sayısı
            active_connections = sum(
                1 for session in self.active_sessions.values()
                if session.ip_address == ip_address
            )
            
            if active_connections >= self.max_connections_per_ip:
                return False
            
            # Rate limiter kontrolü
            return self.rate_limiter.is_allowed(ip_address)
            
        except Exception as e:
            logger.error(f"❌ Rate limit check error: {e}")
            return True  # Hata durumunda izin ver
    
    def record_failed_attempt(self, ip_address: str):
        """Başarısız deneme kaydet"""
        try:
            now = datetime.now()
            
            if ip_address not in self.failed_attempts:
                self.failed_attempts[ip_address] = []
            
            self.failed_attempts[ip_address].append(now)
            
            # Eski kayıtları temizle (1 saat öncesi)
            cutoff_time = now - timedelta(hours=1)
            self.failed_attempts[ip_address] = [
                attempt for attempt in self.failed_attempts[ip_address]
                if attempt > cutoff_time
            ]
            
            # Çok fazla başarısız deneme varsa IP'yi blokla
            if len(self.failed_attempts[ip_address]) >= self.max_failed_attempts:
                self.blocked_ips[ip_address] = now
                logger.warning(f"🚫 IP blocked due to failed attempts: {ip_address}")
                
        except Exception as e:
            logger.error(f"❌ Record failed attempt error: {e}")
    
    def check_permission(self, sid: str, permission: str) -> bool:
        """Kullanıcı izni kontrolü"""
        try:
            if sid not in self.active_sessions:
                return False
            
            session = self.active_sessions[sid]
            
            # Anonymous kullanıcılar için temel izinler
            if not session.is_authenticated:
                basic_permissions = ['read_prices', 'read_signals']
                return permission in basic_permissions
            
            # Authenticated kullanıcılar için tam izin kontrolü
            return permission in session.permissions
            
        except Exception as e:
            logger.error(f"❌ Permission check error: {e}")
            return False
    
    def update_activity(self, sid: str):
        """Session aktivitesini güncelle"""
        try:
            if sid in self.active_sessions:
                self.active_sessions[sid].last_activity = datetime.now()
                
        except Exception as e:
            logger.error(f"❌ Update activity error: {e}")
    
    def check_rate_limit(self, sid: str, action: str = 'request') -> bool:
        """Action rate limiting kontrolü"""
        try:
            if sid not in self.active_sessions:
                return False
            
            session = self.active_sessions[sid]
            now = datetime.now()
            
            # Rate limit window kontrolü
            window_duration = timedelta(minutes=1)
            if now - session.rate_limit_data['window_start'] > window_duration:
                session.rate_limit_data['requests'] = 0
                session.rate_limit_data['window_start'] = now
            
            # Request limit kontrolü
            max_requests = 100 if session.is_authenticated else 30
            
            if session.rate_limit_data['requests'] >= max_requests:
                return False
            
            session.rate_limit_data['requests'] += 1
            return True
            
        except Exception as e:
            logger.error(f"❌ Rate limit check error: {e}")
            return True  # Hata durumunda izin ver
    
    def disconnect_session(self, sid: str):
        """Session'ı kapat"""
        try:
            if sid in self.active_sessions:
                session = self.active_sessions[sid]
                logger.info(f"❌ Session disconnected: {sid} ({session.ip_address})")
                del self.active_sessions[sid]
                
        except Exception as e:
            logger.error(f"❌ Disconnect session error: {e}")
    
    def get_session_info(self, sid: str) -> Optional[Dict]:
        """Session bilgilerini getir"""
        try:
            if sid in self.active_sessions:
                session = self.active_sessions[sid]
                return {
                    'sid': session.sid,
                    'user_id': session.user_id,
                    'ip_address': session.ip_address,
                    'connected_at': session.connected_at.isoformat(),
                    'last_activity': session.last_activity.isoformat(),
                    'permissions': session.permissions,
                    'is_authenticated': session.is_authenticated,
                    'rate_limit_data': session.rate_limit_data
                }
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Get session info error: {e}")
            return None
    
    def get_all_sessions(self) -> List[Dict]:
        """Tüm aktif session'ları getir"""
        try:
            return [
                self.get_session_info(sid)
                for sid in self.active_sessions.keys()
            ]
            
        except Exception as e:
            logger.error(f"❌ Get all sessions error: {e}")
            return []
    
    async def cleanup_expired_sessions(self):
        """Süresi dolmuş session'ları temizle"""
        while True:
            try:
                now = datetime.now()
                expired_sessions = []
                
                for sid, session in self.active_sessions.items():
                    # 1 saat boyunca aktivite yoksa session'ı kapat
                    if now - session.last_activity > timedelta(hours=1):
                        expired_sessions.append(sid)
                
                for sid in expired_sessions:
                    logger.info(f"🧹 Cleaning up expired session: {sid}")
                    del self.active_sessions[sid]
                
                # Blocked IP'leri temizle
                expired_blocks = []
                for ip, block_time in self.blocked_ips.items():
                    if now - block_time > self.block_duration:
                        expired_blocks.append(ip)
                
                for ip in expired_blocks:
                    del self.blocked_ips[ip]
                
                # Failed attempts'ları temizle
                for ip in list(self.failed_attempts.keys()):
                    cutoff_time = now - timedelta(hours=1)
                    self.failed_attempts[ip] = [
                        attempt for attempt in self.failed_attempts[ip]
                        if attempt > cutoff_time
                    ]
                    
                    if not self.failed_attempts[ip]:
                        del self.failed_attempts[ip]
                
                await asyncio.sleep(self.cleanup_interval.total_seconds())
                
            except Exception as e:
                logger.error(f"❌ Cleanup error: {e}")
                await asyncio.sleep(60)  # Hata durumunda 1 dakika bekle
    
    def get_stats(self) -> Dict:
        """Middleware istatistikleri"""
        try:
            authenticated_count = sum(
                1 for session in self.active_sessions.values()
                if session.is_authenticated
            )
            
            anonymous_count = len(self.active_sessions) - authenticated_count
            
            return {
                'total_sessions': len(self.active_sessions),
                'authenticated_sessions': authenticated_count,
                'anonymous_sessions': anonymous_count,
                'blocked_ips': len(self.blocked_ips),
                'failed_attempts': len(self.failed_attempts),
                'uptime': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Get stats error: {e}")
            return {}

# Global middleware instance
socket_auth_middleware = SocketAuthMiddleware()

# Socket.IO middleware fonksiyonu
def socket_auth_middleware_func(sid, environ, auth=None):
    """Socket.IO middleware fonksiyonu"""
    return socket_auth_middleware.authenticate_connection(sid, environ, auth)

if __name__ == "__main__":
    async def test_middleware():
        """Test fonksiyonu"""
        logger.info("🧪 Testing Socket Auth Middleware...")
        
        # Test bağlantısı
        test_environ = {
            'REMOTE_ADDR': '127.0.0.1',
            'HTTP_USER_AGENT': 'Test Client'
        }
        
        success, error, data = await socket_auth_middleware.authenticate_connection(
            'test_sid', test_environ
        )
        
        if success:
            logger.info("✅ Test connection successful")
        else:
            logger.error(f"❌ Test connection failed: {error}")
        
        # İstatistikleri göster
        stats = socket_auth_middleware.get_stats()
        logger.info(f"📊 Middleware stats: {stats}")
    
    # Test çalıştır
    asyncio.run(test_middleware())
