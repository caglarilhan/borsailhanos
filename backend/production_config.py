#!/usr/bin/env python3
"""
BIST AI Smart Trader - Production Configuration
Production ortamı için konfigürasyon ayarları
"""

import os
from typing import List, Optional

class ProductionConfig:
    """Production ortamı konfigürasyonu"""
    
    # Application Settings
    DEBUG = False
    LOG_LEVEL = "INFO"
    HOST = "0.0.0.0"
    PORT = 8001
    WORKERS = 4
    
    # API Keys (Production)
    TIMEGPT_API_KEY = os.getenv("TIMEGPT_API_KEY", "your_timegpt_api_key_here")
    FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "your_finnhub_api_key_here")
    FMP_API_KEY = os.getenv("FMP_API_KEY", "your_fmp_api_key_here")
    
    # Database Settings
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://bist_user:bist_password@localhost:5432/bist_ai_trader")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here_change_in_production")
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://yourdomain.com"]
    
    # Performance
    MAX_WORKERS = 4
    WORKER_TIMEOUT = 30
    KEEPALIVE_TIMEOUT = 5
    
    # Monitoring
    ENABLE_METRICS = True
    METRICS_PORT = 9090
    ENABLE_HEALTH_CHECK = True
    
    # Logging
    LOG_FILE = "logs/production.log"
    LOG_MAX_SIZE = "100MB"
    LOG_BACKUP_COUNT = 5
    
    # AI Models
    MODEL_CACHE_SIZE = 1000
    MODEL_UPDATE_INTERVAL = 3600
    ENABLE_AUTO_OPTIMIZATION = True
    
    # Trading Settings
    PAPER_TRADING = True
    MAX_POSITION_SIZE = 10000
    RISK_PER_TRADE = 0.02
    ENABLE_STOP_LOSS = True
    
    @classmethod
    def validate(cls) -> bool:
        """Konfigürasyon validasyonu"""
        required_keys = [
            "TIMEGPT_API_KEY",
            "FINNHUB_API_KEY", 
            "FMP_API_KEY"
        ]
        
        missing_keys = [key for key in required_keys if getattr(cls, key) == f"your_{key.lower()}_here"]
        
        if missing_keys:
            print(f"⚠️  Missing required API keys: {missing_keys}")
            print("Please set these environment variables before running in production")
            return False
        
        return True
    
    @classmethod
    def get_database_config(cls) -> dict:
        """Database konfigürasyonu"""
        return {
            "url": cls.DATABASE_URL,
            "pool_size": 20,
            "max_overflow": 30,
            "pool_timeout": 30,
            "pool_recycle": 3600
        }
    
    @classmethod
    def get_redis_config(cls) -> dict:
        """Redis konfigürasyonu"""
        return {
            "url": cls.REDIS_URL,
            "max_connections": 50,
            "socket_timeout": 5,
            "socket_connect_timeout": 5
        }

# Production config instance
production_config = ProductionConfig()

if __name__ == "__main__":
    print("🚀 Production Configuration Test")
    print("=" * 50)
    
    if production_config.validate():
        print("✅ Configuration validation passed")
        print(f"📊 Workers: {production_config.WORKERS}")
        print(f"🔒 Debug: {production_config.DEBUG}")
        print(f"📝 Log Level: {production_config.LOG_LEVEL}")
    else:
        print("❌ Configuration validation failed")
        print("Please fix the missing configuration values")
