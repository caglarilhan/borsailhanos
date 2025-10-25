"""
🚀 BIST AI Smart Trader - Performance Monitor
============================================

Her model inference süresini kaydeden, ortalama latency raporlayan sistem.
Sistem performansını izler ve optimizasyon önerileri sunar.

Özellikler:
- Inference latency tracking
- Memory usage monitoring
- CPU usage tracking
- Performance alerts
- Optimization suggestions
"""

import asyncio
import json
import logging
import os
import psutil
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import threading
import queue

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class PerformanceMetric:
    """Performans metriği"""
    timestamp: datetime
    metric_type: str  # 'inference', 'memory', 'cpu', 'disk'
    value: float
    unit: str
    metadata: Dict[str, Any]
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

@dataclass
class InferenceRecord:
    """Inference kaydı"""
    model_id: str
    model_type: str
    start_time: datetime
    end_time: datetime
    duration: float
    input_size: int
    output_size: int
    memory_used: float
    cpu_usage: float
    success: bool
    error_message: Optional[str]
    
    def to_dict(self):
        data = asdict(self)
        data['start_time'] = self.start_time.isoformat()
        data['end_time'] = self.end_time.isoformat()
        return data

class PerformanceMonitor:
    """Performans izleme sistemi"""
    
    def __init__(self, logs_dir: str = "backend/ai/logs"):
        self.logs_dir = Path(logs_dir)
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        
        # Log dosyaları
        self.performance_log = self.logs_dir / "performance_monitor.json"
        self.inference_log = self.logs_dir / "inference_log.json"
        
        # In-memory storage
        self.performance_metrics: List[PerformanceMetric] = []
        self.inference_records: List[InferenceRecord] = []
        
        # Monitoring state
        self.is_monitoring = False
        self.monitor_thread = None
        self.metric_queue = queue.Queue()
        
        # Thresholds
        self.thresholds = {
            'inference_latency_ms': 1000,  # 1 saniye
            'memory_usage_percent': 80,    # %80
            'cpu_usage_percent': 90,      # %90
            'disk_usage_percent': 85      # %85
        }
        
        # Load existing data
        self.load_logs()
    
    def load_logs(self):
        """Log dosyalarını yükle"""
        try:
            # Performance metrics
            if self.performance_log.exists():
                with open(self.performance_log, 'r') as f:
                    metrics_data = json.load(f)
                    self.performance_metrics = [self._dict_to_performance_metric(data) for data in metrics_data]
            
            # Inference records
            if self.inference_log.exists():
                with open(self.inference_log, 'r') as f:
                    inference_data = json.load(f)
                    self.inference_records = [self._dict_to_inference_record(data) for data in inference_data]
            
            logger.info(f"✅ Loaded {len(self.performance_metrics)} metrics, {len(self.inference_records)} inference records")
            
        except Exception as e:
            logger.error(f"❌ Load logs error: {e}")
    
    def _dict_to_performance_metric(self, data: Dict) -> PerformanceMetric:
        """Dict'ten PerformanceMetric'a çevir"""
        data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        return PerformanceMetric(**data)
    
    def _dict_to_inference_record(self, data: Dict) -> InferenceRecord:
        """Dict'ten InferenceRecord'a çevir"""
        data['start_time'] = datetime.fromisoformat(data['start_time'])
        data['end_time'] = datetime.fromisoformat(data['end_time'])
        return InferenceRecord(**data)
    
    def start_monitoring(self):
        """Performans izlemeyi başlat"""
        try:
            if self.is_monitoring:
                logger.warning("⚠️ Performance monitoring already running")
                return
            
            self.is_monitoring = True
            self.monitor_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
            self.monitor_thread.start()
            
            logger.info("🚀 Performance monitoring started")
            
        except Exception as e:
            logger.error(f"❌ Start monitoring error: {e}")
    
    def stop_monitoring(self):
        """Performans izlemeyi durdur"""
        try:
            self.is_monitoring = False
            
            if self.monitor_thread and self.monitor_thread.is_alive():
                self.monitor_thread.join(timeout=5)
            
            logger.info("🛑 Performance monitoring stopped")
            
        except Exception as e:
            logger.error(f"❌ Stop monitoring error: {e}")
    
    def _monitoring_loop(self):
        """İzleme döngüsü"""
        while self.is_monitoring:
            try:
                # Sistem metriklerini topla
                self._collect_system_metrics()
                
                # Queue'daki metrikleri işle
                self._process_metric_queue()
                
                # 5 saniye bekle
                time.sleep(5)
                
            except Exception as e:
                logger.error(f"❌ Monitoring loop error: {e}")
                time.sleep(10)  # Hata durumunda daha uzun bekle
    
    def _collect_system_metrics(self):
        """Sistem metriklerini topla"""
        try:
            # CPU kullanımı
            cpu_percent = psutil.cpu_percent(interval=1)
            self._add_metric('cpu', cpu_percent, 'percent', {'core_count': psutil.cpu_count()})
            
            # Memory kullanımı
            memory = psutil.virtual_memory()
            self._add_metric('memory', memory.percent, 'percent', {
                'total_gb': memory.total / (1024**3),
                'available_gb': memory.available / (1024**3),
                'used_gb': memory.used / (1024**3)
            })
            
            # Disk kullanımı
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            self._add_metric('disk', disk_percent, 'percent', {
                'total_gb': disk.total / (1024**3),
                'used_gb': disk.used / (1024**3),
                'free_gb': disk.free / (1024**3)
            })
            
            # Process bilgileri
            process = psutil.Process()
            process_memory = process.memory_info()
            self._add_metric('process_memory', process_memory.rss / (1024**2), 'MB', {
                'pid': process.pid,
                'name': process.name()
            })
            
        except Exception as e:
            logger.error(f"❌ Collect system metrics error: {e}")
    
    def _add_metric(self, metric_type: str, value: float, unit: str, metadata: Dict[str, Any] = None):
        """Metrik ekle"""
        try:
            metric = PerformanceMetric(
                timestamp=datetime.now(),
                metric_type=metric_type,
                value=value,
                unit=unit,
                metadata=metadata or {}
            )
            
            self.performance_metrics.append(metric)
            
            # Threshold kontrolü
            self._check_thresholds(metric)
            
            # Son 1000 metrik sakla
            if len(self.performance_metrics) > 1000:
                self.performance_metrics = self.performance_metrics[-1000:]
            
        except Exception as e:
            logger.error(f"❌ Add metric error: {e}")
    
    def _check_thresholds(self, metric: PerformanceMetric):
        """Threshold kontrolü yap"""
        try:
            threshold_key = f"{metric.metric_type}_percent"
            threshold = self.thresholds.get(threshold_key)
            
            if threshold and metric.value > threshold:
                logger.warning(f"⚠️ Threshold exceeded: {metric.metric_type} = {metric.value:.1f}% (threshold: {threshold}%)")
                
                # Alert gönder
                self._send_performance_alert(metric, threshold)
                
        except Exception as e:
            logger.error(f"❌ Check thresholds error: {e}")
    
    def _send_performance_alert(self, metric: PerformanceMetric, threshold: float):
        """Performans uyarısı gönder"""
        try:
            alert_message = f"🚨 Performance Alert: {metric.metric_type} usage is {metric.value:.1f}% (threshold: {threshold}%)"
            logger.warning(alert_message)
            
            # Burada email/Slack bildirimi gönderilebilir
            # notification_service.send_alert(alert_message)
            
        except Exception as e:
            logger.error(f"❌ Send performance alert error: {e}")
    
    def _process_metric_queue(self):
        """Metrik queue'sunu işle"""
        try:
            while not self.metric_queue.empty():
                metric = self.metric_queue.get_nowait()
                self.performance_metrics.append(metric)
                
        except Exception as e:
            logger.error(f"❌ Process metric queue error: {e}")
    
    def log_inference(self, 
                      model_id: str,
                      model_type: str,
                      start_time: datetime,
                      end_time: datetime,
                      input_size: int,
                      output_size: int,
                      success: bool,
                      error_message: str = None) -> bool:
        """Inference kaydını logla"""
        try:
            duration = (end_time - start_time).total_seconds() * 1000  # milliseconds
            
            # Memory ve CPU kullanımını al
            process = psutil.Process()
            memory_used = process.memory_info().rss / (1024**2)  # MB
            cpu_usage = process.cpu_percent()
            
            record = InferenceRecord(
                model_id=model_id,
                model_type=model_type,
                start_time=start_time,
                end_time=end_time,
                duration=duration,
                input_size=input_size,
                output_size=output_size,
                memory_used=memory_used,
                cpu_usage=cpu_usage,
                success=success,
                error_message=error_message
            )
            
            self.inference_records.append(record)
            
            # Son 1000 kayıt sakla
            if len(self.inference_records) > 1000:
                self.inference_records = self.inference_records[-1000:]
            
            # Threshold kontrolü
            if duration > self.thresholds['inference_latency_ms']:
                logger.warning(f"⚠️ Slow inference: {model_id} took {duration:.1f}ms")
            
            logger.info(f"📊 Inference logged: {model_id} - {duration:.1f}ms")
            return True
            
        except Exception as e:
            logger.error(f"❌ Log inference error: {e}")
            return False
    
    def get_performance_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Performans özetini getir"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            # Son N saatteki metrikler
            recent_metrics = [m for m in self.performance_metrics if m.timestamp >= cutoff_time]
            recent_inferences = [i for i in self.inference_records if i.start_time >= cutoff_time]
            
            summary = {
                'time_range_hours': hours,
                'total_metrics': len(recent_metrics),
                'total_inferences': len(recent_inferences),
                'system_health': self._calculate_system_health(recent_metrics),
                'inference_stats': self._calculate_inference_stats(recent_inferences),
                'alerts': self._get_recent_alerts(recent_metrics),
                'recommendations': self._get_optimization_recommendations(recent_metrics, recent_inferences)
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Get performance summary error: {e}")
            return {}
    
    def _calculate_system_health(self, metrics: List[PerformanceMetric]) -> Dict[str, Any]:
        """Sistem sağlığını hesapla"""
        try:
            if not metrics:
                return {'status': 'unknown', 'score': 0}
            
            # Son metrikleri al
            latest_metrics = {}
            for metric in metrics[-10:]:  # Son 10 metrik
                latest_metrics[metric.metric_type] = metric.value
            
            # Sağlık skoru hesapla (0-100)
            health_score = 100
            
            # CPU kontrolü
            cpu_usage = latest_metrics.get('cpu', 0)
            if cpu_usage > 90:
                health_score -= 30
            elif cpu_usage > 80:
                health_score -= 15
            
            # Memory kontrolü
            memory_usage = latest_metrics.get('memory', 0)
            if memory_usage > 90:
                health_score -= 30
            elif memory_usage > 80:
                health_score -= 15
            
            # Disk kontrolü
            disk_usage = latest_metrics.get('disk', 0)
            if disk_usage > 90:
                health_score -= 20
            elif disk_usage > 80:
                health_score -= 10
            
            # Durum belirleme
            if health_score >= 80:
                status = 'excellent'
            elif health_score >= 60:
                status = 'good'
            elif health_score >= 40:
                status = 'warning'
            else:
                status = 'critical'
            
            return {
                'status': status,
                'score': max(0, health_score),
                'cpu_usage': cpu_usage,
                'memory_usage': memory_usage,
                'disk_usage': disk_usage
            }
            
        except Exception as e:
            logger.error(f"❌ Calculate system health error: {e}")
            return {'status': 'error', 'score': 0}
    
    def _calculate_inference_stats(self, inferences: List[InferenceRecord]) -> Dict[str, Any]:
        """Inference istatistiklerini hesapla"""
        try:
            if not inferences:
                return {'count': 0, 'avg_duration': 0, 'success_rate': 0}
            
            successful_inferences = [i for i in inferences if i.success]
            
            avg_duration = sum(i.duration for i in successful_inferences) / len(successful_inferences) if successful_inferences else 0
            success_rate = len(successful_inferences) / len(inferences) * 100
            
            # Model türlerine göre istatistikler
            model_stats = {}
            for model_type in set(i.model_type for i in inferences):
                type_inferences = [i for i in inferences if i.model_type == model_type]
                type_successful = [i for i in type_inferences if i.success]
                
                model_stats[model_type] = {
                    'count': len(type_inferences),
                    'avg_duration': sum(i.duration for i in type_successful) / len(type_successful) if type_successful else 0,
                    'success_rate': len(type_successful) / len(type_inferences) * 100 if type_inferences else 0
                }
            
            return {
                'count': len(inferences),
                'avg_duration': avg_duration,
                'success_rate': success_rate,
                'model_stats': model_stats
            }
            
        except Exception as e:
            logger.error(f"❌ Calculate inference stats error: {e}")
            return {'count': 0, 'avg_duration': 0, 'success_rate': 0}
    
    def _get_recent_alerts(self, metrics: List[PerformanceMetric]) -> List[Dict]:
        """Son uyarıları getir"""
        try:
            alerts = []
            
            for metric in metrics[-50:]:  # Son 50 metrik
                threshold_key = f"{metric.metric_type}_percent"
                threshold = self.thresholds.get(threshold_key)
                
                if threshold and metric.value > threshold:
                    alerts.append({
                        'timestamp': metric.timestamp.isoformat(),
                        'type': metric.metric_type,
                        'value': metric.value,
                        'threshold': threshold,
                        'severity': 'high' if metric.value > threshold * 1.2 else 'medium'
                    })
            
            return alerts[-10:]  # Son 10 uyarı
            
        except Exception as e:
            logger.error(f"❌ Get recent alerts error: {e}")
            return []
    
    def _get_optimization_recommendations(self, metrics: List[PerformanceMetric], inferences: List[InferenceRecord]) -> List[str]:
        """Optimizasyon önerilerini getir"""
        try:
            recommendations = []
            
            # CPU kullanımı önerileri
            cpu_metrics = [m for m in metrics if m.metric_type == 'cpu']
            if cpu_metrics:
                avg_cpu = sum(m.value for m in cpu_metrics[-10:]) / len(cpu_metrics[-10:])
                if avg_cpu > 80:
                    recommendations.append("🔧 High CPU usage detected. Consider reducing model complexity or increasing server resources.")
            
            # Memory kullanımı önerileri
            memory_metrics = [m for m in metrics if m.metric_type == 'memory']
            if memory_metrics:
                avg_memory = sum(m.value for m in memory_metrics[-10:]) / len(memory_metrics[-10:])
                if avg_memory > 80:
                    recommendations.append("💾 High memory usage detected. Consider implementing model caching or memory optimization.")
            
            # Inference latency önerileri
            if inferences:
                avg_latency = sum(i.duration for i in inferences[-20:]) / len(inferences[-20:])
                if avg_latency > 500:  # 500ms
                    recommendations.append("⚡ High inference latency detected. Consider model optimization or hardware upgrade.")
            
            # Success rate önerileri
            if inferences:
                success_rate = len([i for i in inferences if i.success]) / len(inferences) * 100
                if success_rate < 95:
                    recommendations.append("🎯 Low success rate detected. Check model stability and error handling.")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ Get optimization recommendations error: {e}")
            return []
    
    def save_logs(self):
        """Log dosyalarını kaydet"""
        try:
            # Performance metrics
            metrics_data = [m.to_dict() for m in self.performance_metrics]
            with open(self.performance_log, 'w') as f:
                json.dump(metrics_data, f, indent=2)
            
            # Inference records
            inference_data = [i.to_dict() for i in self.inference_records]
            with open(self.inference_log, 'w') as f:
                json.dump(inference_data, f, indent=2)
            
            logger.info("💾 Performance logs saved")
            
        except Exception as e:
            logger.error(f"❌ Save logs error: {e}")
    
    def cleanup_old_data(self, days: int = 7):
        """Eski verileri temizle"""
        try:
            cutoff_time = datetime.now() - timedelta(days=days)
            
            # Eski metrikleri temizle
            self.performance_metrics = [m for m in self.performance_metrics if m.timestamp >= cutoff_time]
            
            # Eski inference kayıtlarını temizle
            self.inference_records = [i for i in self.inference_records if i.start_time >= cutoff_time]
            
            logger.info(f"🧹 Cleaned up data older than {days} days")
            
        except Exception as e:
            logger.error(f"❌ Cleanup old data error: {e}")

# Global instance
performance_monitor = PerformanceMonitor()

# Decorator for automatic inference logging
def monitor_inference(model_id: str, model_type: str):
    """Inference monitoring decorator"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = datetime.now()
            success = True
            error_message = None
            
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                success = False
                error_message = str(e)
                raise
            finally:
                end_time = datetime.now()
                performance_monitor.log_inference(
                    model_id=model_id,
                    model_type=model_type,
                    start_time=start_time,
                    end_time=end_time,
                    input_size=len(args) + len(kwargs),
                    output_size=1,
                    success=success,
                    error_message=error_message
                )
        
        return wrapper
    return decorator

if __name__ == "__main__":
    # Test fonksiyonu
    logger.info("🧪 Testing Performance Monitor...")
    
    # Monitoring başlat
    performance_monitor.start_monitoring()
    
    # Test inference logging
    @monitor_inference("test_model", "prophet")
    def test_inference():
        time.sleep(0.1)  # Simulate inference
        return "success"
    
    # Test çalıştır
    result = test_inference()
    logger.info(f"✅ Test inference result: {result}")
    
    # Performans özetini al
    summary = performance_monitor.get_performance_summary(hours=1)
    logger.info(f"📊 Performance summary: {summary}")
    
    # Monitoring durdur
    performance_monitor.stop_monitoring()
    
    logger.info("✅ Performance Monitor test completed")
