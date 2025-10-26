#!/usr/bin/env python3
"""
BIST AI Smart Trader - CORS Whitelist Middleware
Production-ready CORS configuration with whitelist
"""

import logging
import os
from typing import List
from starlette.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CORSWhitelist:
    """CORS Whitelist manager"""
    
    def __init__(self):
        self.allowed_origins = self._get_allowed_origins()
        self.allowed_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
        self.allowed_headers = [
            "Content-Type",
            "Authorization",
            "X-API-Key",
            "X-Request-ID",
            "X-RateLimit-Limit",
            "X-RateLimit-Remaining",
            "X-RateLimit-Reset"
        ]
        
        logger.info(f"✅ CORS Whitelist initialized with {len(self.allowed_origins)} allowed origins")
    
    def _get_allowed_origins(self) -> List[str]:
        """Get allowed origins from environment or default"""
        # Production origins
        default_origins = [
            "https://bist-ai-smart-trader.render.com",
            "https://www.bist-ai-smart-trader.com",
            "https://bist-ai-smart-trader.com",
        ]
        
        # Development origins
        dev_origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://localhost:8080",
            "http://127.0.0.1:8080",
        ]
        
        # Get from environment
        env_origins = os.getenv("CORS_ORIGINS", "")
        if env_origins:
            custom_origins = [origin.strip() for origin in env_origins.split(",")]
        else:
            custom_origins = []
        
        # Combine all origins
        all_origins = default_origins + custom_origins
        
        # Add dev origins only in development
        env = os.getenv("APP_ENV", "production")
        if env == "development" or env == "dev":
            all_origins += dev_origins
        
        # Log origins (don't log in production)
        if env != "production":
            logger.info(f"📍 CORS allowed origins: {all_origins}")
        
        return all_origins
    
    def is_origin_allowed(self, origin: str) -> bool:
        """Check if origin is allowed"""
        return origin in self.allowed_origins
    
    def get_cors_middleware(self, app):
        """Get CORS middleware for FastAPI app"""
        middleware = CORSMiddleware(
            app=app,
            allow_origins=self.allowed_origins,
            allow_credentials=True,
            allow_methods=self.allowed_methods,
            allow_headers=self.allowed_headers,
            expose_headers=[
                "X-RateLimit-Limit",
                "X-RateLimit-Remaining",
                "X-RateLimit-Reset",
                "X-Request-ID",
                "X-Response-Time"
            ],
            max_age=3600,  # Cache preflight requests for 1 hour
        )
        
        logger.info("✅ CORS Whitelist middleware configured")
        return middleware
    
    def get_stats(self):
        """Get CORS stats"""
        return {
            'allowed_origins_count': len(self.allowed_origins),
            'allowed_methods': self.allowed_methods,
            'allowed_headers': self.allowed_headers,
            'whitelist_enabled': True
        }

# Global instance
cors_whitelist = CORSWhitelist()

# Helper function to add CORS to FastAPI app
def add_cors_to_app(app):
    """Add CORS whitelist to FastAPI app"""
    return cors_whitelist.get_cors_middleware(app)
    
# Test function
if __name__ == "__main__":
    print("🧪 Testing CORS Whitelist...")
    
    # Test allowed origins
    test_origins = [
        "https://bist-ai-smart-trader.render.com",
        "http://localhost:3000",
        "https://malicious-site.com",  # Should be blocked
    ]
    
    for origin in test_origins:
        allowed = cors_whitelist.is_origin_allowed(origin)
        status = "✅ ALLOWED" if allowed else "❌ BLOCKED"
        print(f"{status}: {origin}")
    
    print("\n📊 CORS Stats:")
    print(cors_whitelist.get_stats())
