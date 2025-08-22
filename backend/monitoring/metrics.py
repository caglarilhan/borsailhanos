#!/usr/bin/env python3
"""
Prometheus Metrics for BIST AI Smart Trader
"""

from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import time
import psutil
import logging

logger = logging.getLogger(__name__)

# Metrics tanımları
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'active_connections',
    'Number of active connections'
)

MODEL_ACCURACY = Gauge(
    'model_accuracy',
    'Model accuracy score',
    ['model_name']
)

PREDICTION_COUNT = Counter(
    'predictions_total',
    'Total predictions made',
    ['model_name', 'symbol']
)

CPU_USAGE = Gauge(
    'cpu_usage_percent',
    'CPU usage percentage'
)

MEMORY_USAGE = Gauge(
    'memory_usage_bytes',
    'Memory usage in bytes'
)

ERROR_COUNT = Counter(
    'errors_total',
    'Total errors',
    ['error_type', 'endpoint']
)

class MetricsCollector:
    """Prometheus metrics collector"""
    
    def __init__(self):
        self.start_time = time.time()
        
    def track_request(self, method: str, endpoint: str, status_code: int, duration: float):
        """HTTP request tracking"""
        REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=str(status_code)).inc()
        REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)
        
    def track_prediction(self, model_name: str, symbol: str, accuracy: float = None):
        """Prediction tracking"""
        PREDICTION_COUNT.labels(model_name=model_name, symbol=symbol).inc()
        if accuracy is not None:
            MODEL_ACCURACY.labels(model_name=model_name).set(accuracy)
    
    def track_error(self, error_type: str, endpoint: str):
        """Error tracking"""
        ERROR_COUNT.labels(error_type=error_type, endpoint=endpoint).inc()
    
    def update_system_metrics(self):
        """System metrics güncelleme"""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=None)
            CPU_USAGE.set(cpu_percent)
            
            # Memory usage
            memory = psutil.virtual_memory()
            MEMORY_USAGE.set(memory.used)
            
            # Process specific metrics
            process = psutil.Process()
            process_memory = process.memory_info().rss
            
        except Exception as e:
            logger.error(f"System metrics update error: {e}")
    
    def get_metrics(self) -> str:
        """Prometheus metrics string"""
        self.update_system_metrics()
        return generate_latest()

# Global metrics instance
metrics_collector = MetricsCollector()

def track_request(method: str, endpoint: str, status_code: int, duration: float):
    """Global request tracking function"""
    metrics_collector.track_request(method, endpoint, status_code, duration)

def track_prediction(model_name: str, symbol: str, accuracy: float = None):
    """Global prediction tracking function"""
    metrics_collector.track_prediction(model_name, symbol, accuracy)

def track_error(error_type: str, endpoint: str):
    """Global error tracking function"""
    metrics_collector.track_error(error_type, endpoint)

def get_metrics() -> str:
    """Get metrics string"""
    return metrics_collector.get_metrics()
