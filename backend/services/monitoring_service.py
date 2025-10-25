#!/usr/bin/env python3
"""
Monitoring Service - Prometheus Metrics
Sistem ve uygulama metrikleri
"""

import json
from datetime import datetime
import time
import random

class MonitoringService:
    """
    Sistem izleme servisi
    """
    
    def __init__(self):
        self.metrics = {
            'api_calls': 0,
            'api_errors': 0,
            'api_latencies': [],
            'active_users': 0,
            'predictions_made': 0,
            'notifications_sent': 0,
            'start_time': time.time()
        }
        
        self.endpoint_stats = {}  # {endpoint: {count, avg_latency, errors}}
    
    def record_api_call(self, endpoint: str, latency_ms: float, status_code: int):
        """
        API çağrısını kaydet
        """
        self.metrics['api_calls'] += 1
        self.metrics['api_latencies'].append(latency_ms)
        
        if status_code >= 400:
            self.metrics['api_errors'] += 1
        
        # Endpoint istatistikleri
        if endpoint not in self.endpoint_stats:
            self.endpoint_stats[endpoint] = {
                'count': 0,
                'total_latency': 0,
                'errors': 0,
                'success': 0
            }
        
        self.endpoint_stats[endpoint]['count'] += 1
        self.endpoint_stats[endpoint]['total_latency'] += latency_ms
        
        if status_code >= 400:
            self.endpoint_stats[endpoint]['errors'] += 1
        else:
            self.endpoint_stats[endpoint]['success'] += 1
    
    def get_prometheus_metrics(self):
        """
        Prometheus formatında metrikler
        """
        uptime_seconds = time.time() - self.metrics['start_time']
        avg_latency = sum(self.metrics['api_latencies']) / len(self.metrics['api_latencies']) if self.metrics['api_latencies'] else 0
        error_rate = self.metrics['api_errors'] / self.metrics['api_calls'] if self.metrics['api_calls'] > 0 else 0
        
        return {
            # Counters
            'api_calls_total': self.metrics['api_calls'],
            'api_errors_total': self.metrics['api_errors'],
            'predictions_total': self.metrics['predictions_made'],
            'notifications_total': self.metrics['notifications_sent'],
            
            # Gauges
            'active_users': self.metrics['active_users'],
            'uptime_seconds': round(uptime_seconds, 2),
            
            # Histograms
            'api_latency_avg_ms': round(avg_latency, 2),
            'api_latency_p95_ms': self._percentile(self.metrics['api_latencies'], 95),
            'api_latency_p99_ms': self._percentile(self.metrics['api_latencies'], 99),
            
            # Rates
            'error_rate': round(error_rate, 4),
            'success_rate': round(1 - error_rate, 4),
            
            'timestamp': datetime.now().isoformat()
        }
    
    def get_endpoint_stats(self):
        """
        Endpoint bazlı istatistikler
        """
        stats = []
        
        for endpoint, data in self.endpoint_stats.items():
            avg_latency = data['total_latency'] / data['count'] if data['count'] > 0 else 0
            success_rate = data['success'] / data['count'] if data['count'] > 0 else 0
            
            stats.append({
                'endpoint': endpoint,
                'calls': data['count'],
                'avg_latency_ms': round(avg_latency, 2),
                'success_rate': round(success_rate, 4),
                'errors': data['errors']
            })
        
        # En çok çağrılan endpoint'lere göre sırala
        stats.sort(key=lambda x: x['calls'], reverse=True)
        
        return {
            'total_endpoints': len(stats),
            'endpoints': stats,
            'timestamp': datetime.now().isoformat()
        }
    
    def _percentile(self, data: list, percentile: int):
        """
        Percentile hesaplama
        """
        if not data:
            return 0
        
        sorted_data = sorted(data)
        index = int(len(sorted_data) * (percentile / 100))
        return round(sorted_data[min(index, len(sorted_data) - 1)], 2)
    
    def get_health_status(self):
        """
        Sistem sağlık durumu
        """
        uptime_seconds = time.time() - self.metrics['start_time']
        avg_latency = sum(self.metrics['api_latencies']) / len(self.metrics['api_latencies']) if self.metrics['api_latencies'] else 0
        error_rate = self.metrics['api_errors'] / self.metrics['api_calls'] if self.metrics['api_calls'] > 0 else 0
        
        # Health score (0-100)
        latency_score = max(0, 100 - avg_latency / 10)  # <100ms = 100, >1000ms = 0
        error_score = (1 - error_rate) * 100
        uptime_score = min(100, uptime_seconds / 36)  # 1 saat = 100
        
        health_score = (latency_score * 0.4 + error_score * 0.4 + uptime_score * 0.2)
        
        if health_score >= 90:
            status = 'healthy'
        elif health_score >= 70:
            status = 'degraded'
        else:
            status = 'unhealthy'
        
        return {
            'status': status,
            'health_score': round(health_score, 1),
            'uptime_hours': round(uptime_seconds / 3600, 2),
            'avg_latency_ms': round(avg_latency, 2),
            'error_rate': round(error_rate, 4),
            'total_calls': self.metrics['api_calls'],
            'timestamp': datetime.now().isoformat()
        }

# Global instance
monitoring = MonitoringService()

if __name__ == '__main__':
    # Test
    print("📊 Monitoring Service Test")
    print("=" * 50)
    
    # Simulate API calls
    for i in range(100):
        endpoint = random.choice(['/api/signals', '/api/market', '/api/risk'])
        latency = random.uniform(50, 300)
        status = random.choice([200, 200, 200, 200, 500])  # 80% success
        monitoring.record_api_call(endpoint, latency, status)
    
    # Get metrics
    metrics = monitoring.get_prometheus_metrics()
    print("\nPrometheus Metrics:")
    print(json.dumps(metrics, indent=2))
    
    print("\nEndpoint Stats:")
    endpoint_stats = monitoring.get_endpoint_stats()
    print(json.dumps(endpoint_stats, indent=2))
    
    print("\nHealth Status:")
    health = monitoring.get_health_status()
    print(json.dumps(health, indent=2))
