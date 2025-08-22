#!/usr/bin/env python3
"""
Rate Limiting Middleware for BIST AI Smart Trader
"""

import time
from collections import defaultdict, deque
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware"""
    
    def __init__(self, app, calls: int = 100, period: int = 60):
        super().__init__(app)
        self.calls = calls  # Max calls per period
        self.period = period  # Period in seconds
        self.requests = defaultdict(deque)
        
    async def dispatch(self, request: Request, call_next):
        """Process request with rate limiting"""
        try:
            # Get client IP
            client_ip = self.get_client_ip(request)
            
            # Check rate limit
            if not self.is_allowed(client_ip):
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "Rate limit exceeded",
                        "limit": self.calls,
                        "period": self.period,
                        "retry_after": self.get_retry_after(client_ip)
                    }
                )
            
            # Record request
            self.record_request(client_ip)
            
            # Process request
            response = await call_next(request)
            
            # Add rate limit headers
            remaining = self.get_remaining_calls(client_ip)
            response.headers["X-RateLimit-Limit"] = str(self.calls)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(int(time.time()) + self.period)
            
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Rate limiter error: {e}")
            # Continue without rate limiting on error
            return await call_next(request)
    
    def get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        # Check for forwarded headers (behind proxy)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to client host
        return request.client.host if request.client else "unknown"
    
    def is_allowed(self, client_ip: str) -> bool:
        """Check if request is allowed"""
        now = time.time()
        client_requests = self.requests[client_ip]
        
        # Remove old requests
        while client_requests and client_requests[0] <= now - self.period:
            client_requests.popleft()
        
        # Check if under limit
        return len(client_requests) < self.calls
    
    def record_request(self, client_ip: str):
        """Record a request"""
        now = time.time()
        self.requests[client_ip].append(now)
    
    def get_remaining_calls(self, client_ip: str) -> int:
        """Get remaining calls for client"""
        now = time.time()
        client_requests = self.requests[client_ip]
        
        # Remove old requests
        while client_requests and client_requests[0] <= now - self.period:
            client_requests.popleft()
        
        return max(0, self.calls - len(client_requests))
    
    def get_retry_after(self, client_ip: str) -> int:
        """Get retry after seconds"""
        now = time.time()
        client_requests = self.requests[client_ip]
        
        if not client_requests:
            return 0
        
        # Time until oldest request expires
        oldest_request = client_requests[0]
        return max(0, int(oldest_request + self.period - now))

class APIRateLimitMiddleware(RateLimitMiddleware):
    """Enhanced rate limiter for API endpoints"""
    
    def __init__(self, app):
        super().__init__(app)
        # Different limits for different endpoint types
        self.endpoint_limits = {
            "/api/": {"calls": 60, "period": 60},      # API endpoints: 60/min
            "/signals": {"calls": 30, "period": 60},   # Signals: 30/min
            "/metrics": {"calls": 120, "period": 60},  # Metrics: 120/min
            "/health": {"calls": 300, "period": 60},   # Health: 300/min
            "default": {"calls": 100, "period": 60}    # Default: 100/min
        }
    
    def get_endpoint_limit(self, path: str) -> dict:
        """Get rate limit for specific endpoint"""
        for pattern, limit in self.endpoint_limits.items():
            if pattern in path:
                return limit
        return self.endpoint_limits["default"]
    
    async def dispatch(self, request: Request, call_next):
        """Process request with endpoint-specific rate limiting"""
        try:
            # Get client IP and endpoint
            client_ip = self.get_client_ip(request)
            path = str(request.url.path)
            
            # Get endpoint-specific limits
            limit_config = self.get_endpoint_limit(path)
            calls = limit_config["calls"]
            period = limit_config["period"]
            
            # Create unique key for client + endpoint
            rate_key = f"{client_ip}:{path.split('/')[1] if '/' in path else 'root'}"
            
            # Check rate limit
            if not self.is_allowed_for_key(rate_key, calls, period):
                logger.warning(f"Rate limit exceeded for {rate_key}")
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "Rate limit exceeded",
                        "endpoint": path,
                        "limit": calls,
                        "period": period,
                        "retry_after": self.get_retry_after_for_key(rate_key, period)
                    }
                )
            
            # Record request
            self.record_request_for_key(rate_key)
            
            # Process request
            response = await call_next(request)
            
            # Add rate limit headers
            remaining = self.get_remaining_calls_for_key(rate_key, calls, period)
            response.headers["X-RateLimit-Limit"] = str(calls)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(int(time.time()) + period)
            response.headers["X-RateLimit-Endpoint"] = path
            
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"API rate limiter error: {e}")
            return await call_next(request)
    
    def is_allowed_for_key(self, key: str, calls: int, period: int) -> bool:
        """Check if request is allowed for specific key"""
        now = time.time()
        key_requests = self.requests[key]
        
        # Remove old requests
        while key_requests and key_requests[0] <= now - period:
            key_requests.popleft()
        
        return len(key_requests) < calls
    
    def record_request_for_key(self, key: str):
        """Record request for specific key"""
        now = time.time()
        self.requests[key].append(now)
    
    def get_remaining_calls_for_key(self, key: str, calls: int, period: int) -> int:
        """Get remaining calls for specific key"""
        now = time.time()
        key_requests = self.requests[key]
        
        # Remove old requests
        while key_requests and key_requests[0] <= now - period:
            key_requests.popleft()
        
        return max(0, calls - len(key_requests))
    
    def get_retry_after_for_key(self, key: str, period: int) -> int:
        """Get retry after seconds for specific key"""
        now = time.time()
        key_requests = self.requests[key]
        
        if not key_requests:
            return 0
        
        oldest_request = key_requests[0]
        return max(0, int(oldest_request + period - now))
