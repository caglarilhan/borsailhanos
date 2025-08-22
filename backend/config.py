"""
BIST AI Smart Trader - Production Configuration
"""

import os
from typing import Dict, Any

class Config:
    """Production configuration class"""
    
    # Server settings
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 8001))
    DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # API Keys
    TIMEGPT_API_KEY = os.getenv('TIMEGPT_API_KEY', '')
    FINNHUB_API_KEY = os.getenv('FINNHUB_API_KEY', '')
    FMP_API_KEY = os.getenv('FMP_API_KEY', '')
    
    # Firebase/Firestore
    FIRESTORE_PROJECT_ID = os.getenv('FIRESTORE_PROJECT_ID', '')
    FIRESTORE_PRIVATE_KEY_ID = os.getenv('FIRESTORE_PRIVATE_KEY_ID', '')
    FIRESTORE_PRIVATE_KEY = os.getenv('FIRESTORE_PRIVATE_KEY', '')
    FIRESTORE_CLIENT_EMAIL = os.getenv('FIRESTORE_CLIENT_EMAIL', '')
    FIRESTORE_CLIENT_ID = os.getenv('FIRESTORE_CLIENT_ID', '')
    
    # Model settings
    HMM_ENABLED = os.getenv('HMM_ENABLED', 'true').lower() == 'true'
    SENTIMENT_ENABLED = os.getenv('SENTIMENT_ENABLED', 'true').lower() == 'true'
    LSTM_ENABLED = os.getenv('LSTM_ENABLED', 'true').lower() == 'true'
    ENSEMBLE_WEIGHTS_UPDATE_INTERVAL = int(os.getenv('ENSEMBLE_WEIGHTS_UPDATE_INTERVAL', 3600))
    
    # External APIs
    KAP_API_ENABLED = os.getenv('KAP_API_ENABLED', 'false').lower() == 'true'
    TWITTER_API_ENABLED = os.getenv('TWITTER_API_ENABLED', 'false').lower() == 'true'
    NEWS_API_KEY = os.getenv('NEWS_API_KEY', '')
    
    # Monitoring
    PROMETHEUS_ENABLED = os.getenv('PROMETHEUS_ENABLED', 'true').lower() == 'true'
    SENTRY_DSN = os.getenv('SENTRY_DSN', '')
    
    @classmethod
    def get_model_config(cls) -> Dict[str, Any]:
        """Model configuration"""
        return {
            'hmm_enabled': cls.HMM_ENABLED,
            'sentiment_enabled': cls.SENTIMENT_ENABLED,
            'lstm_enabled': cls.LSTM_ENABLED,
            'ensemble_update_interval': cls.ENSEMBLE_WEIGHTS_UPDATE_INTERVAL
        }
    
    @classmethod
    def get_api_config(cls) -> Dict[str, Any]:
        """API configuration"""
        return {
            'timegpt_key': bool(cls.TIMEGPT_API_KEY),
            'finnhub_key': bool(cls.FINNHUB_API_KEY),
            'fmp_key': bool(cls.FMP_API_KEY),
            'kap_enabled': cls.KAP_API_ENABLED,
            'twitter_enabled': cls.TWITTER_API_ENABLED
        }
    
    @classmethod
    def is_production(cls) -> bool:
        """Check if running in production"""
        return not cls.DEBUG and cls.LOG_LEVEL == 'INFO'

class MarketDataConfig:
    """Market data configuration for BIST Performance Tracker"""
    
    def __init__(self):
        self.bist_stocks = [
            'SISE.IS', 'EREGL.IS', 'TUPRS.IS', 'AKBNK.IS', 'GARAN.IS',
            'THYAO.IS', 'ASELS.IS', 'KRDMD.IS', 'BIMAS.IS', 'SAHOL.IS'
        ]
        self.performance_metrics = ['return', 'volatility', 'sharpe', 'drawdown']
        self.target_metrics = {'min_return': 0.15, 'max_volatility': 0.30}
        self.update_interval = 3600  # 1 hour

class BISTPerformanceTracker:
    """Mock BIST Performance Tracker for compatibility"""
    
    def __init__(self):
        self.is_active = False
    
    def start_tracking(self):
        self.is_active = True
        return {'status': 'started'}
    
    def get_performance_summary(self):
        return {'status': 'mock', 'total_stocks': 10}

class AccuracyOptimizer:
    """Mock Accuracy Optimizer for compatibility"""
    
    def __init__(self):
        self.is_active = False
    
    def start_optimization(self):
        self.is_active = True
        return {'status': 'started'}
    
    def get_optimization_status(self):
        return {'status': 'mock', 'accuracy': 0.85}

# Global config instance
config = Config()
