"""
Operasyonel Güçlendirme Sistemi
- Health Probe ve Monitoring
- Log Rotasyonu
- Process Watchdog
- Performance Metrics
"""

import os
import time
import json
import logging
import psutil
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import requests
from pathlib import Path

logger = logging.getLogger(__name__)

@dataclass
class HealthStatus:
    """Sistem sağlık durumu"""
    timestamp: str
    status: str  # HEALTHY, WARNING, CRITICAL
    uptime: float
    memory_usage: float
    cpu_usage: float
    disk_usage: float
    api_response_time: float
    signal_count: int
    error_count: int
    warnings: List[str]
    metrics: Dict[str, Any]

@dataclass
class ProcessInfo:
    """Process bilgileri"""
    pid: int
    name: str
    cpu_percent: float
    memory_percent: float
    status: str
    uptime: float

class LogRotator:
    """Log rotasyonu sistemi"""
    
    def __init__(self, log_dir: str = "logs", max_size_mb: int = 100, keep_files: int = 7):
        self.log_dir = Path(log_dir)
        self.max_size_bytes = max_size_mb * 1024 * 1024
        self.keep_files = keep_files
        self.log_dir.mkdir(exist_ok=True)
        
    def rotate_logs(self):
        """Log dosyalarını rotasyon yap"""
        try:
            for log_file in self.log_dir.glob("*.log"):
                if log_file.stat().st_size > self.max_size_bytes:
                    # Eski dosyayı arşivle
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    archive_name = f"{log_file.stem}_{timestamp}.log"
                    archive_path = self.log_dir / archive_name
                    
                    log_file.rename(archive_path)
                    logger.info(f"📁 Log rotasyonu: {log_file.name} -> {archive_name}")
                    
                    # Eski arşiv dosyalarını temizle
                    self._cleanup_old_logs()
                    
        except Exception as e:
            logger.error(f"❌ Log rotasyon hatası: {e}")
    
    def _cleanup_old_logs(self):
        """Eski log dosyalarını temizle"""
        try:
            log_files = list(self.log_dir.glob("*.log"))
            log_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
            
            # En yeni dosyaları koru
            for old_file in log_files[self.keep_files:]:
                old_file.unlink()
                logger.info(f"🗑️ Eski log silindi: {old_file.name}")
                
        except Exception as e:
            logger.error(f"❌ Log temizleme hatası: {e}")

class ProcessWatchdog:
    """Process watchdog sistemi"""
    
    def __init__(self):
        self.processes: Dict[str, ProcessInfo] = {}
        self.critical_processes = ["uvicorn", "bist100_scanner", "python"]
        
    def monitor_processes(self) -> Dict[str, ProcessInfo]:
        """Process'leri izle"""
        processes = {}
        
        try:
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'status', 'create_time']):
                try:
                    proc_info = proc.info
                    name = proc_info['name']
                    
                    # Kritik process'leri filtrele
                    if any(critical in name.lower() for critical in self.critical_processes):
                        processes[name] = ProcessInfo(
                            pid=proc_info['pid'],
                            name=name,
                            cpu_percent=proc_info['cpu_percent'] or 0,
                            memory_percent=proc_info['memory_percent'] or 0,
                            status=proc_info['status'],
                            uptime=time.time() - proc_info['create_time']
                        )
                        
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
                    
        except Exception as e:
            logger.error(f"❌ Process izleme hatası: {e}")
            
        self.processes = processes
        return processes
    
    def check_critical_processes(self) -> List[str]:
        """Kritik process'leri kontrol et"""
        warnings = []
        
        for critical in self.critical_processes:
            found = False
            for proc_name in self.processes:
                if critical in proc_name.lower():
                    found = True
                    break
                    
            if not found:
                warnings.append(f"⚠️ Kritik process bulunamadı: {critical}")
                
        return warnings

class HealthProbe:
    """Sistem sağlık probe'u"""
    
    def __init__(self, api_url: str = "http://127.0.0.1:8000"):
        self.api_url = api_url
        self.start_time = time.time()
        self.error_count = 0
        self.warning_count = 0
        self.log_rotator = LogRotator()
        self.process_watchdog = ProcessWatchdog()
        
    def get_system_metrics(self) -> Dict[str, Any]:
        """Sistem metriklerini al"""
        try:
            # CPU ve Memory
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available_gb": memory.available / (1024**3),
                "disk_percent": disk.percent,
                "disk_free_gb": disk.free / (1024**3),
                "uptime": time.time() - self.start_time
            }
        except Exception as e:
            logger.error(f"❌ Sistem metrikleri hatası: {e}")
            return {}
    
    def check_api_health(self) -> tuple[float, bool]:
        """API sağlığını kontrol et"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.api_url}/", timeout=5)
            response_time = time.time() - start_time
            
            is_healthy = response.status_code == 200
            return response_time, is_healthy
            
        except Exception as e:
            logger.error(f"❌ API health check hatası: {e}")
            return 999.0, False
    
    def get_signal_count(self) -> int:
        """Aktif sinyal sayısını al"""
        try:
            response = requests.get(f"{self.api_url}/strategies/signals?flat=true", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return data.get('count', 0)
        except Exception as e:
            logger.error(f"❌ Sinyal sayısı alma hatası: {e}")
        return 0
    
    def run_health_check(self) -> HealthStatus:
        """Tam sağlık kontrolü çalıştır"""
        warnings = []
        
        # Sistem metrikleri
        metrics = self.get_system_metrics()
        
        # API kontrolü
        api_response_time, api_healthy = self.check_api_health()
        
        # Process kontrolü
        processes = self.process_watchdog.monitor_processes()
        process_warnings = self.process_watchdog.check_critical_processes()
        warnings.extend(process_warnings)
        
        # Sinyal sayısı
        signal_count = self.get_signal_count()
        
        # Uyarıları kontrol et
        if metrics.get('cpu_percent', 0) > 80:
            warnings.append(f"⚠️ Yüksek CPU kullanımı: {metrics['cpu_percent']:.1f}%")
            
        if metrics.get('memory_percent', 0) > 85:
            warnings.append(f"⚠️ Yüksek memory kullanımı: {metrics['memory_percent']:.1f}%")
            
        if metrics.get('disk_percent', 0) > 90:
            warnings.append(f"⚠️ Disk doluluk: {metrics['disk_percent']:.1f}%")
            
        if api_response_time > 5.0:
            warnings.append(f"⚠️ Yavaş API yanıtı: {api_response_time:.2f}s")
            
        if not api_healthy:
            warnings.append("❌ API sağlıksız")
            
        if signal_count == 0:
            warnings.append("⚠️ Aktif sinyal yok")
        
        # Durum belirleme
        if len(warnings) == 0:
            status = "HEALTHY"
        elif len(warnings) <= 3:
            status = "WARNING"
        else:
            status = "CRITICAL"
        
        return HealthStatus(
            timestamp=datetime.now().isoformat(),
            status=status,
            uptime=metrics.get('uptime', 0),
            memory_usage=metrics.get('memory_percent', 0),
            cpu_usage=metrics.get('cpu_percent', 0),
            disk_usage=metrics.get('disk_percent', 0),
            api_response_time=api_response_time,
            signal_count=signal_count,
            error_count=self.error_count,
            warnings=warnings,
            metrics=metrics
        )

class OperationalManager:
    """Operasyonel yönetici"""
    
    def __init__(self):
        self.health_probe = HealthProbe()
        self.log_rotator = LogRotator()
        self.running = False
        self.health_thread: Optional[threading.Thread] = None
        self.last_health_status: Optional[HealthStatus] = None
        
    def start_monitoring(self):
        """İzlemeyi başlat"""
        if self.running:
            logger.warning("⚠️ İzleme zaten çalışıyor")
            return
            
        self.running = True
        self.health_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self.health_thread.start()
        logger.info("✅ Operasyonel izleme başlatıldı")
    
    def stop_monitoring(self):
        """İzlemeyi durdur"""
        self.running = False
        if self.health_thread:
            self.health_thread.join(timeout=5)
        logger.info("⏹️ Operasyonel izleme durduruldu")
    
    def _monitoring_loop(self):
        """İzleme döngüsü"""
        while self.running:
            try:
                # Sağlık kontrolü
                health_status = self.health_probe.run_health_check()
                self.last_health_status = health_status
                
                # Log rotasyonu (günde bir)
                if datetime.now().hour == 0 and datetime.now().minute < 5:
                    self.log_rotator.rotate_logs()
                
                # Kritik durumda alarm
                if health_status.status == "CRITICAL":
                    logger.error(f"🚨 KRİTİK DURUM: {len(health_status.warnings)} uyarı")
                    for warning in health_status.warnings:
                        logger.error(f"  - {warning}")
                
                # Sağlık durumunu logla
                logger.info(f"💚 Sağlık: {health_status.status} | "
                          f"CPU: {health_status.cpu_usage:.1f}% | "
                          f"Memory: {health_status.memory_usage:.1f}% | "
                          f"API: {health_status.api_response_time:.2f}s | "
                          f"Sinyaller: {health_status.signal_count}")
                
                time.sleep(60)  # 1 dakikada bir kontrol
                
            except Exception as e:
                logger.error(f"❌ İzleme döngüsü hatası: {e}")
                time.sleep(60)
    
    def get_health_status(self) -> Optional[HealthStatus]:
        """Son sağlık durumunu al"""
        return self.last_health_status
    
    def get_health_report(self) -> Dict[str, Any]:
        """Sağlık raporu oluştur"""
        if not self.last_health_status:
            return {"status": "NO_DATA", "message": "Henüz sağlık kontrolü yapılmadı"}
        
        status = self.last_health_status
        return {
            "status": status.status,
            "timestamp": status.timestamp,
            "uptime_hours": status.uptime / 3600,
            "system_health": {
                "cpu_percent": status.cpu_usage,
                "memory_percent": status.memory_usage,
                "disk_percent": status.disk_usage
            },
            "api_health": {
                "response_time": status.api_response_time,
                "signal_count": status.signal_count
            },
            "warnings": status.warnings,
            "metrics": status.metrics
        }

# Global instance
operational_manager = OperationalManager()

if __name__ == "__main__":
    # Test
    logging.basicConfig(level=logging.INFO)
    
    manager = OperationalManager()
    manager.start_monitoring()
    
    try:
        while True:
            time.sleep(10)
            report = manager.get_health_report()
            print(f"Sağlık Raporu: {json.dumps(report, indent=2)}")
    except KeyboardInterrupt:
        manager.stop_monitoring()
        print("Test tamamlandı")
