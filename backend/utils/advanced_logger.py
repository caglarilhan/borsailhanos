#!/usr/bin/env python3
"""
BIST AI Smart Trader - Advanced Logging & Error Pipeline
Sentry integration + structured logging + error tracking
"""

import logging
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional
import traceback
import sys

# Sentry SDK (optional - install with: pip install sentry-sdk)
try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False
    print("⚠️ Sentry SDK not available - install with: pip install sentry-sdk")

class AdvancedLogger:
    def __init__(self, service_name: str = "bist-ai", sentry_dsn: str = None):
        self.service_name = service_name
        self.sentry_dsn = sentry_dsn or os.getenv('SENTRY_DSN')
        
        # Initialize Sentry if available
        if SENTRY_AVAILABLE and self.sentry_dsn:
            self.init_sentry()
        
        # Setup structured logging
        self.setup_logging()
        
        # Error tracking
        self.error_counts = {}
        self.performance_metrics = {}
        
        print(f"🔍 Advanced Logger initialized for {service_name}")

    def init_sentry(self):
        """Initialize Sentry for error tracking"""
        try:
            sentry_sdk.init(
                dsn=self.sentry_dsn,
                integrations=[
                    FastApiIntegration(auto_enabling_instrumentations=True),
                    SqlalchemyIntegration(),
                ],
                traces_sample_rate=0.1,
                environment=os.getenv('APP_ENV', 'development'),
                release=f"{self.service_name}@1.0.0",
                before_send=self.before_send_filter,
            )
            
            # Set user context
            sentry_sdk.set_context("service", {
                "name": self.service_name,
                "version": "1.0.0",
                "environment": os.getenv('APP_ENV', 'development')
            })
            
            print("✅ Sentry initialized successfully")
            
        except Exception as e:
            print(f"❌ Sentry initialization failed: {e}")

    def setup_logging(self):
        """Setup structured logging"""
        # Create logs directory
        os.makedirs('logs', exist_ok=True)
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(f'logs/{self.service_name}.log'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
        # Create structured logger
        self.logger = logging.getLogger(self.service_name)
        
        # Add JSON formatter for structured logs
        self.json_handler = logging.FileHandler(f'logs/{self.service_name}_structured.json')
        self.json_handler.setFormatter(JsonFormatter())
        self.logger.addHandler(self.json_handler)

    def before_send_filter(self, event, hint):
        """Filter events before sending to Sentry"""
        # Don't send certain types of errors
        if 'exc_info' in hint:
            exc_type, exc_value, tb = hint['exc_info']
            if exc_type.__name__ in ['KeyboardInterrupt', 'SystemExit']:
                return None
        
        # Add custom tags
        event['tags'] = event.get('tags', {})
        event['tags']['service'] = self.service_name
        event['tags']['version'] = '1.0.0'
        
        return event

    def log_error(self, error: Exception, context: Dict[str, Any] = None, level: str = 'error'):
        """Log error with context"""
        error_info = {
            'error_type': type(error).__name__,
            'error_message': str(error),
            'traceback': traceback.format_exc(),
            'context': context or {},
            'timestamp': datetime.now().isoformat(),
            'service': self.service_name
        }
        
        # Log to file
        if level == 'error':
            self.logger.error(f"Error: {error_info['error_message']}", extra=error_info)
        elif level == 'warning':
            self.logger.warning(f"Warning: {error_info['error_message']}", extra=error_info)
        
        # Send to Sentry
        if SENTRY_AVAILABLE and self.sentry_dsn:
            with sentry_sdk.push_scope() as scope:
                if context:
                    scope.set_context("custom", context)
                scope.set_tag("error_type", error_info['error_type'])
                sentry_sdk.capture_exception(error)
        
        # Track error counts
        error_type = error_info['error_type']
        self.error_counts[error_type] = self.error_counts.get(error_type, 0) + 1
        
        return error_info

    def log_performance(self, operation: str, duration: float, metadata: Dict[str, Any] = None):
        """Log performance metrics"""
        perf_info = {
            'operation': operation,
            'duration_ms': duration * 1000,
            'metadata': metadata or {},
            'timestamp': datetime.now().isoformat(),
            'service': self.service_name
        }
        
        self.logger.info(f"Performance: {operation} took {perf_info['duration_ms']:.2f}ms", extra=perf_info)
        
        # Track performance metrics
        if operation not in self.performance_metrics:
            self.performance_metrics[operation] = []
        self.performance_metrics[operation].append(perf_info['duration_ms'])
        
        # Keep only last 100 measurements
        if len(self.performance_metrics[operation]) > 100:
            self.performance_metrics[operation] = self.performance_metrics[operation][-100:]
        
        # Send to Sentry as performance data
        if SENTRY_AVAILABLE and self.sentry_dsn:
            sentry_sdk.add_breadcrumb(
                message=f"Performance: {operation}",
                category="performance",
                data=perf_info
            )

    def log_ai_event(self, event_type: str, model_name: str, metrics: Dict[str, Any], context: Dict[str, Any] = None):
        """Log AI-specific events"""
        ai_info = {
            'event_type': event_type,
            'model_name': model_name,
            'metrics': metrics,
            'context': context or {},
            'timestamp': datetime.now().isoformat(),
            'service': self.service_name
        }
        
        self.logger.info(f"AI Event: {event_type} for {model_name}", extra=ai_info)
        
        # Send to Sentry with AI context
        if SENTRY_AVAILABLE and self.sentry_dsn:
            with sentry_sdk.push_scope() as scope:
                scope.set_context("ai", ai_info)
                scope.set_tag("model", model_name)
                scope.set_tag("event_type", event_type)
                
                if event_type == 'error':
                    sentry_sdk.capture_message(f"AI Error in {model_name}: {metrics.get('error', 'Unknown error')}")
                else:
                    sentry_sdk.add_breadcrumb(
                        message=f"AI Event: {event_type}",
                        category="ai",
                        data=ai_info
                    )

    def log_user_action(self, user_id: str, action: str, details: Dict[str, Any] = None):
        """Log user actions"""
        user_info = {
            'user_id': user_id,
            'action': action,
            'details': details or {},
            'timestamp': datetime.now().isoformat(),
            'service': self.service_name
        }
        
        self.logger.info(f"User Action: {user_id} performed {action}", extra=user_info)
        
        # Send to Sentry with user context
        if SENTRY_AVAILABLE and self.sentry_dsn:
            sentry_sdk.set_user({"id": user_id})
            sentry_sdk.add_breadcrumb(
                message=f"User Action: {action}",
                category="user",
                data=user_info
            )

    def get_error_summary(self) -> Dict[str, Any]:
        """Get error summary for monitoring"""
        return {
            'error_counts': self.error_counts,
            'total_errors': sum(self.error_counts.values()),
            'performance_metrics': {
                op: {
                    'avg_duration_ms': sum(durations) / len(durations),
                    'max_duration_ms': max(durations),
                    'min_duration_ms': min(durations),
                    'count': len(durations)
                }
                for op, durations in self.performance_metrics.items()
            },
            'timestamp': datetime.now().isoformat()
        }

    def health_check(self) -> Dict[str, Any]:
        """Health check for logging system"""
        try:
            # Check if log files are writable
            log_file = f'logs/{self.service_name}.log'
            with open(log_file, 'a') as f:
                f.write(f"Health check at {datetime.now().isoformat()}\n")
            
            return {
                'status': 'healthy',
                'sentry_enabled': SENTRY_AVAILABLE and bool(self.sentry_dsn),
                'log_file_writable': True,
                'error_count': sum(self.error_counts.values()),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

class JsonFormatter(logging.Formatter):
    """JSON formatter for structured logs"""
    def format(self, record):
        log_entry = {
            'timestamp': datetime.fromtimestamp(record.created).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        
        # Add extra fields
        if hasattr(record, 'error_type'):
            log_entry['error_type'] = record.error_type
        if hasattr(record, 'error_message'):
            log_entry['error_message'] = record.error_message
        if hasattr(record, 'context'):
            log_entry['context'] = record.context
        if hasattr(record, 'service'):
            log_entry['service'] = record.service
        
        return json.dumps(log_entry, ensure_ascii=False)

# Global logger instances
backend_logger = AdvancedLogger("backend")
realtime_logger = AdvancedLogger("realtime")
ai_logger = AdvancedLogger("ai-engine")
monitoring_logger = AdvancedLogger("monitoring")

# Decorator for automatic error logging
def log_errors(logger_instance=None):
    """Decorator to automatically log errors"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            logger = logger_instance or backend_logger
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger.log_error(e, {
                    'function': func.__name__,
                    'args': str(args)[:200],  # Limit args length
                    'kwargs': str(kwargs)[:200]
                })
                raise
        return wrapper
    return decorator

# Performance monitoring decorator
def log_performance(logger_instance=None):
    """Decorator to automatically log performance"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            logger = logger_instance or backend_logger
            start_time = datetime.now()
            try:
                result = func(*args, **kwargs)
                duration = (datetime.now() - start_time).total_seconds()
                logger.log_performance(func.__name__, duration, {
                    'args_count': len(args),
                    'kwargs_count': len(kwargs)
                })
                return result
            except Exception as e:
                duration = (datetime.now() - start_time).total_seconds()
                logger.log_performance(func.__name__, duration, {
                    'error': str(e),
                    'args_count': len(args),
                    'kwargs_count': len(kwargs)
                })
                raise
        return wrapper
    return decorator

if __name__ == "__main__":
    # Test the logging system
    logger = AdvancedLogger("test")
    
    # Test error logging
    try:
        raise ValueError("Test error")
    except Exception as e:
        logger.log_error(e, {'test': True})
    
    # Test performance logging
    logger.log_performance("test_operation", 0.123, {'test': True})
    
    # Test AI event logging
    logger.log_ai_event("training_complete", "prophet_model", {
        'mse': 0.014,
        'r2': 0.93,
        'training_time': 120.5
    })
    
    # Test user action logging
    logger.log_user_action("user123", "login", {'ip': '192.168.1.1'})
    
    # Get summary
    summary = logger.get_error_summary()
    print("Error Summary:", json.dumps(summary, indent=2))
    
    # Health check
    health = logger.health_check()
    print("Health Check:", json.dumps(health, indent=2))
