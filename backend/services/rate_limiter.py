#!/usr/bin/env python3
"""
Rate Limiter Service - Request Throttling
Redis backend ile rate limiting + fallback in-memory cache
"""

import json
from datetime import datetime, timedelta
import time
from collections import defaultdict

class RateLimiter:
    """
    Rate limiting servisi
    Brute-force ve spam koruması
    """
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client  # Production'da Redis kullanılacak
        self.in_memory_store = defaultdict(list)  # Fallback storage
        
        # Rate limit rules
        self.limits = {
            '/api/ai/': {'max_requests': 20, 'window_seconds': 60},      # AI: 20/min
            '/api/trading/': {'max_requests': 10, 'window_seconds': 60},  # Trading: 10/min
            '/api/auth/': {'max_requests': 5, 'window_seconds': 900},     # Auth: 5/15min (brute-force protection)
            'default': {'max_requests': 100, 'window_seconds': 60}         # Default: 100/min
        }
    
    def is_allowed(self, client_id: str, endpoint: str):
        """
        İstek izin kontrolü
        
        Args:
            client_id: IP veya user ID
            endpoint: API endpoint
        
        Returns:
            tuple: (allowed: bool, remaining: int, reset_time: int)
        """
        # Endpoint için limit kuralını bul
        limit_rule = self._get_limit_rule(endpoint)
        
        # Redis varsa kullan, yoksa in-memory
        if self.redis_client:
            return self._check_redis(client_id, endpoint, limit_rule)
        else:
            return self._check_memory(client_id, endpoint, limit_rule)
    
    def _get_limit_rule(self, endpoint: str):
        """Endpoint için uygun limit kuralını getir"""
        for pattern, rule in self.limits.items():
            if pattern in endpoint:
                return rule
        return self.limits['default']
    
    def _check_memory(self, client_id: str, endpoint: str, rule: dict):
        """In-memory rate limit kontrolü"""
        key = f"{client_id}:{endpoint}"
        current_time = time.time()
        window_start = current_time - rule['window_seconds']
        
        # Eski istekleri temizle
        self.in_memory_store[key] = [
            req_time for req_time in self.in_memory_store[key]
            if req_time > window_start
        ]
        
        # İstek sayısını kontrol et
        request_count = len(self.in_memory_store[key])
        
        if request_count < rule['max_requests']:
            # İzin ver, isteği kaydet
            self.in_memory_store[key].append(current_time)
            remaining = rule['max_requests'] - request_count - 1
            reset_time = int(window_start + rule['window_seconds'])
            return (True, remaining, reset_time)
        else:
            # Reddet
            remaining = 0
            reset_time = int(self.in_memory_store[key][0] + rule['window_seconds'])
            return (False, remaining, reset_time)
    
    def _check_redis(self, client_id: str, endpoint: str, rule: dict):
        """Redis rate limit kontrolü (production)"""
        # TODO: Redis implementation
        # key = f"ratelimit:{client_id}:{endpoint}"
        # count = redis.incr(key)
        # if count == 1:
        #     redis.expire(key, rule['window_seconds'])
        # return count <= rule['max_requests']
        
        # Şimdilik fallback
        return self._check_memory(client_id, endpoint, rule)
    
    def get_rate_limit_headers(self, allowed: bool, remaining: int, reset_time: int):
        """
        Rate limit header'ları oluştur
        
        Returns:
            dict: HTTP headers
        """
        return {
            'X-RateLimit-Limit': str(self.limits['default']['max_requests']),
            'X-RateLimit-Remaining': str(remaining),
            'X-RateLimit-Reset': str(reset_time),
            'Retry-After': str(reset_time - int(time.time())) if not allowed else '0'
        }
    
    def get_stats(self):
        """Rate limit istatistikleri"""
        total_clients = len(self.in_memory_store)
        total_requests = sum(len(requests) for requests in self.in_memory_store.values())
        
        return {
            'total_clients': total_clients,
            'total_requests': total_requests,
            'limits': self.limits,
            'timestamp': datetime.now().isoformat()
        }

# Global instance
rate_limiter = RateLimiter()

if __name__ == '__main__':
    # Test
    print("🚦 Rate Limiter Test")
    print("=" * 50)
    
    client_id = '192.168.1.100'
    
    # Test normal requests
    for i in range(25):
        allowed, remaining, reset = rate_limiter.is_allowed(client_id, '/api/ai/predictions')
        if allowed:
            print(f"✅ Request {i+1}: Allowed (Remaining: {remaining})")
        else:
            print(f"❌ Request {i+1}: Blocked (Reset in: {reset - int(time.time())}s)")
    
    print("\n📊 Stats:")
    stats = rate_limiter.get_stats()
    print(json.dumps(stats, indent=2))
