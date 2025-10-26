#!/usr/bin/env python3
"""
BIST AI Smart Trader - Sentry Error Tracking
Production-level error tracking and monitoring
"""

import logging
import os
from typing import Optional, Dict, Any
from datetime import datetime

# Sentry import (fallback if not available)
try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.logging import LoggingIntegration
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False
    logging.warning("⚠️ Sentry bulunamadı: pip install sentry-sdk")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SentryClient:
    """Sentry error tracking client"""
    
    def __init__(self):
        self.sentry_enabled = False
        self.dsn = os.getenv("SENTRY_DSN", "")
        
        if SENTRY_AVAILABLE and self.dsn:
            self._init_sentry()
            self.sentry_enabled = True
            logger.info("✅ Sentry error tracking enabled")
        else:
            logger.warning("⚠️ Sentry disabled (DSN not configured)")
    
    def _init_sentry(self):
        """Initialize Sentry SDK"""
        try:
            sentry_sdk.init(
                dsn=self.dsn,
                integrations=[
                    FastApiIntegration(),
                    LoggingIntegration(
                        level=logging.INFO,        # Capture info logs
                        event_level=logging.ERROR  # Send errors as events
                    ),
                ],
                traces_sample_rate=float(os.getenv("SENTRY_SAMPLE_RATE", "0.1")),
                environment=os.getenv("APP_ENV", "production"),
                # User information
                send_default_pii=False,  # GDPR compliance
                
                # Release tracking
                release=os.getenv("RELEASE_VERSION", "v3.2.0"),
                
                # Filtering
                before_send=self._filter_sensitive_data,
                
                # Debug mode
                debug=os.getenv("SENTRY_DEBUG", "false").lower() == "true"
            )
            
            # Set user context
            sentry_sdk.set_context("app", {
                "name": "BIST AI Smart Trader",
                "version": "3.2.0",
                "environment": os.getenv("APP_ENV", "production")
            })
            
            logger.info("✅ Sentry initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Sentry initialization failed: {e}")
            self.sentry_enabled = False
    
    def _filter_sensitive_data(self, event, hint):
        """Filter sensitive data from events"""
        # Don't send sensitive info
        if "password" in str(event).lower():
            return None
        if "api_key" in str(event).lower():
            return None
        if "secret" in str(event).lower():
            return None
        
        return event
    
    def capture_error(self, error: Exception, context: Optional[Dict[str, Any]] = None):
        """Capture an error"""
        if not self.sentry_enabled:
            logger.warning(f"⚠️ Sentry not enabled: {error}")
            return
        
        try:
            with sentry_sdk.push_scope() as scope:
                # Add context
                if context:
                    for key, value in context.items():
                        scope.set_extra(key, value)
                
                # Capture exception
                sentry_sdk.capture_exception(error)
                
            logger.info(f"📊 Error captured in Sentry: {type(error).__name__}")
            
        except Exception as e:
            logger.error(f"❌ Failed to capture error in Sentry: {e}")
    
    def capture_message(self, message: str, level: str = "info", context: Optional[Dict[str, Any]] = None):
        """Capture a message"""
        if not self.sentry_enabled:
            logger.info(f"📝 {message}")
            return
        
        try:
            with sentry_sdk.push_scope() as scope:
                # Add context
                if context:
                    for key, value in context.items():
                        scope.set_extra(key, value)
                
                # Map level
                level_map = {
                    "info": "info",
                    "warning": "warning",
                    "error": "error",
                    "critical": "critical"
                }
                sentry_level = level_map.get(level, "info")
                
                # Capture message
                sentry_sdk.capture_message(message, level=sentry_level)
                
            logger.info(f"📊 Message captured in Sentry: {message}")
            
        except Exception as e:
            logger.error(f"❌ Failed to capture message in Sentry: {e}")
    
    def set_user_context(self, user_id: str, email: str = None, username: str = None):
        """Set user context for tracking"""
        if not self.sentry_enabled:
            return
        
        try:
            sentry_sdk.set_user({
                "id": user_id,
                "email": email,
                "username": username
            })
        except Exception as e:
            logger.error(f"❌ Failed to set user context: {e}")
    
    def add_breadcrumb(self, message: str, category: str = "default", level: str = "info"):
        """Add breadcrumb for debugging"""
        if not self.sentry_enabled:
            return
        
        try:
            sentry_sdk.add_breadcrumb(
                message=message,
                category=category,
                level=level
            )
        except Exception as e:
            logger.error(f"❌ Failed to add breadcrumb: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get Sentry statistics"""
        return {
            "enabled": self.sentry_enabled,
            "dsn_configured": bool(self.dsn),
            "sdk_available": SENTRY_AVAILABLE,
            "timestamp": datetime.now().isoformat()
        }

# Global Sentry client
sentry_client = SentryClient()

# FastAPI middleware helper
def sentry_middleware(app):
    """Add Sentry to FastAPI app"""
    if not sentry_client.sentry_enabled:
        logger.warning("⚠️ Sentry middleware not enabled (DSN missing)")
        return app
    
    try:
        # Sentry is already initialized globally
        logger.info("✅ Sentry middleware active")
    except Exception as e:
        logger.error(f"❌ Sentry middleware error: {e}")
    
    return app

# Test function
def test_sentry():
    """Test Sentry integration"""
    print("🧪 Testing Sentry integration...")
    
    # Test capture message
    sentry_client.capture_message("Sentry test message", level="info")
    
    # Test capture error
    try:
        raise ValueError("Test error for Sentry")
    except Exception as e:
        sentry_client.capture_error(e, context={"test": True})
    
    print("✅ Sentry test completed")
    print(sentry_client.get_stats())

if __name__ == "__main__":
    test_sentry()
