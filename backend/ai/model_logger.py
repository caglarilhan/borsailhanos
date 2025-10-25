"""
🚀 BIST AI Smart Trader - Model Logger
=====================================

Model versiyonlarını, performans skorlarını ve tarih damgalarını kaydeden sistem.
Model geçmişi ve audit trail sağlar.

Özellikler:
- Model versiyonlama
- Performans tracking
- Audit trail
- Rollback desteği
- Model metadata
"""

import json
import logging
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path
from dataclasses import dataclass, asdict
import hashlib
import pickle

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ModelMetadata:
    """Model metadata"""
    model_id: str
    model_type: str
    version: str
    created_at: datetime
    file_path: str
    file_size: int
    file_hash: str
    training_data_hash: str
    hyperparameters: Dict[str, Any]
    performance_metrics: Dict[str, float]
    training_duration: float
    training_samples: int
    test_samples: int
    environment: Dict[str, str]
    
    def to_dict(self):
        data = asdict(self)
        data['created_at'] = self.created_at.isoformat()
        return data

@dataclass
class TrainingSession:
    """Eğitim oturumu"""
    session_id: str
    start_time: datetime
    end_time: Optional[datetime]
    model_type: str
    status: str  # 'running', 'completed', 'failed'
    error_message: Optional[str]
    metrics: Dict[str, float]
    
    def to_dict(self):
        data = asdict(self)
        data['start_time'] = self.start_time.isoformat()
        data['end_time'] = self.end_time.isoformat() if self.end_time else None
        return data

class ModelLogger:
    """Model logging sistemi"""
    
    def __init__(self, logs_dir: str = "backend/ai/logs"):
        self.logs_dir = Path(logs_dir)
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        
        # Log dosyaları
        self.models_log = self.logs_dir / "models.json"
        self.sessions_log = self.logs_dir / "training_sessions.json"
        self.performance_log = self.logs_dir / "performance.json"
        
        # In-memory cache
        self.models: List[ModelMetadata] = []
        self.sessions: List[TrainingSession] = []
        self.performance_history: List[Dict] = []
        
        # Log dosyalarını yükle
        self.load_logs()
    
    def load_logs(self):
        """Log dosyalarını yükle"""
        try:
            # Models log
            if self.models_log.exists():
                with open(self.models_log, 'r') as f:
                    models_data = json.load(f)
                    self.models = [self._dict_to_model_metadata(data) for data in models_data]
            
            # Sessions log
            if self.sessions_log.exists():
                with open(self.sessions_log, 'r') as f:
                    sessions_data = json.load(f)
                    self.sessions = [self._dict_to_training_session(data) for data in sessions_data]
            
            # Performance log
            if self.performance_log.exists():
                with open(self.performance_log, 'r') as f:
                    self.performance_history = json.load(f)
            
            logger.info(f"✅ Loaded {len(self.models)} models, {len(self.sessions)} sessions")
            
        except Exception as e:
            logger.error(f"❌ Load logs error: {e}")
    
    def _dict_to_model_metadata(self, data: Dict) -> ModelMetadata:
        """Dict'ten ModelMetadata'ya çevir"""
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        return ModelMetadata(**data)
    
    def _dict_to_training_session(self, data: Dict) -> TrainingSession:
        """Dict'ten TrainingSession'a çevir"""
        data['start_time'] = datetime.fromisoformat(data['start_time'])
        data['end_time'] = datetime.fromisoformat(data['end_time']) if data['end_time'] else None
        return TrainingSession(**data)
    
    def calculate_file_hash(self, file_path: str) -> str:
        """Dosya hash'ini hesapla"""
        try:
            with open(file_path, 'rb') as f:
                file_content = f.read()
                return hashlib.md5(file_content).hexdigest()
        except Exception as e:
            logger.error(f"❌ Calculate hash error: {e}")
            return ""
    
    def get_file_size(self, file_path: str) -> int:
        """Dosya boyutunu al"""
        try:
            return os.path.getsize(file_path)
        except Exception as e:
            logger.error(f"❌ Get file size error: {e}")
            return 0
    
    def get_environment_info(self) -> Dict[str, str]:
        """Sistem ortam bilgilerini al"""
        try:
            import sys
            import platform
            
            return {
                'python_version': sys.version,
                'platform': platform.platform(),
                'architecture': platform.architecture()[0],
                'processor': platform.processor(),
                'hostname': platform.node()
            }
        except Exception as e:
            logger.error(f"❌ Get environment info error: {e}")
            return {}
    
    def start_training_session(self, model_type: str) -> str:
        """Eğitim oturumu başlat"""
        try:
            session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            session = TrainingSession(
                session_id=session_id,
                start_time=datetime.now(),
                end_time=None,
                model_type=model_type,
                status='running',
                error_message=None,
                metrics={}
            )
            
            self.sessions.append(session)
            self.save_sessions_log()
            
            logger.info(f"🚀 Training session started: {session_id}")
            return session_id
            
        except Exception as e:
            logger.error(f"❌ Start training session error: {e}")
            return ""
    
    def end_training_session(self, session_id: str, status: str, metrics: Dict[str, float], error_message: str = None):
        """Eğitim oturumu bitir"""
        try:
            session = next((s for s in self.sessions if s.session_id == session_id), None)
            
            if session:
                session.end_time = datetime.now()
                session.status = status
                session.metrics = metrics
                session.error_message = error_message
                
                self.save_sessions_log()
                
                duration = (session.end_time - session.start_time).total_seconds()
                logger.info(f"✅ Training session ended: {session_id} - Status: {status} - Duration: {duration:.2f}s")
            else:
                logger.warning(f"⚠️ Session not found: {session_id}")
                
        except Exception as e:
            logger.error(f"❌ End training session error: {e}")
    
    def log_model(self, 
                  model_id: str,
                  model_type: str,
                  version: str,
                  file_path: str,
                  training_data_hash: str,
                  hyperparameters: Dict[str, Any],
                  performance_metrics: Dict[str, float],
                  training_duration: float,
                  training_samples: int,
                  test_samples: int) -> bool:
        """Modeli logla"""
        try:
            # Dosya bilgilerini al
            file_size = self.get_file_size(file_path)
            file_hash = self.calculate_file_hash(file_path)
            environment = self.get_environment_info()
            
            # Model metadata oluştur
            metadata = ModelMetadata(
                model_id=model_id,
                model_type=model_type,
                version=version,
                created_at=datetime.now(),
                file_path=file_path,
                file_size=file_size,
                file_hash=file_hash,
                training_data_hash=training_data_hash,
                hyperparameters=hyperparameters,
                performance_metrics=performance_metrics,
                training_duration=training_duration,
                training_samples=training_samples,
                test_samples=test_samples,
                environment=environment
            )
            
            # Modeli listeye ekle
            self.models.append(metadata)
            
            # Log dosyasını kaydet
            self.save_models_log()
            
            logger.info(f"✅ Model logged: {model_id} v{version}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Log model error: {e}")
            return False
    
    def log_performance(self, model_id: str, metrics: Dict[str, float], test_data_info: Dict[str, Any]):
        """Performans metriklerini logla"""
        try:
            performance_record = {
                'timestamp': datetime.now().isoformat(),
                'model_id': model_id,
                'metrics': metrics,
                'test_data_info': test_data_info
            }
            
            self.performance_history.append(performance_record)
            self.save_performance_log()
            
            logger.info(f"📊 Performance logged for {model_id}")
            
        except Exception as e:
            logger.error(f"❌ Log performance error: {e}")
    
    def get_model_history(self, model_type: str = None) -> List[ModelMetadata]:
        """Model geçmişini getir"""
        try:
            if model_type:
                return [m for m in self.models if m.model_type == model_type]
            return self.models
            
        except Exception as e:
            logger.error(f"❌ Get model history error: {e}")
            return []
    
    def get_best_model(self, model_type: str, metric: str = 'accuracy') -> Optional[ModelMetadata]:
        """En iyi modeli getir"""
        try:
            models_of_type = [m for m in self.models if m.model_type == model_type]
            
            if not models_of_type:
                return None
            
            # Metrik değerine göre sırala
            best_model = max(models_of_type, key=lambda m: m.performance_metrics.get(metric, 0))
            
            logger.info(f"🏆 Best {model_type} model: {best_model.model_id} v{best_model.version} ({metric}: {best_model.performance_metrics.get(metric, 0):.3f})")
            return best_model
            
        except Exception as e:
            logger.error(f"❌ Get best model error: {e}")
            return None
    
    def get_model_by_version(self, model_type: str, version: str) -> Optional[ModelMetadata]:
        """Versiyona göre model getir"""
        try:
            model = next((m for m in self.models if m.model_type == model_type and m.version == version), None)
            return model
            
        except Exception as e:
            logger.error(f"❌ Get model by version error: {e}")
            return None
    
    def get_training_sessions(self, model_type: str = None, status: str = None) -> List[TrainingSession]:
        """Eğitim oturumlarını getir"""
        try:
            sessions = self.sessions
            
            if model_type:
                sessions = [s for s in sessions if s.model_type == model_type]
            
            if status:
                sessions = [s for s in sessions if s.status == status]
            
            return sessions
            
        except Exception as e:
            logger.error(f"❌ Get training sessions error: {e}")
            return []
    
    def get_performance_trend(self, model_type: str, metric: str = 'accuracy') -> List[Dict]:
        """Performans trendini getir"""
        try:
            trend_data = []
            
            for record in self.performance_history:
                if record.get('model_id', '').startswith(model_type):
                    trend_data.append({
                        'timestamp': record['timestamp'],
                        'metric_value': record['metrics'].get(metric, 0),
                        'model_id': record['model_id']
                    })
            
            # Tarihe göre sırala
            trend_data.sort(key=lambda x: x['timestamp'])
            
            return trend_data
            
        except Exception as e:
            logger.error(f"❌ Get performance trend error: {e}")
            return []
    
    def cleanup_old_models(self, keep_count: int = 10):
        """Eski modelleri temizle"""
        try:
            # Model türlerine göre grupla
            model_types = set(m.model_type for m in self.models)
            
            for model_type in model_types:
                models_of_type = [m for m in self.models if m.model_type == model_type]
                
                if len(models_of_type) > keep_count:
                    # En eski modelleri sil
                    models_of_type.sort(key=lambda m: m.created_at)
                    models_to_remove = models_of_type[:-keep_count]
                    
                    for model in models_to_remove:
                        # Dosyayı sil
                        try:
                            if os.path.exists(model.file_path):
                                os.remove(model.file_path)
                                logger.info(f"🗑️ Deleted old model file: {model.file_path}")
                        except Exception as e:
                            logger.error(f"❌ Delete model file error: {e}")
                        
                        # Listeden çıkar
                        self.models.remove(model)
                    
                    logger.info(f"🧹 Cleaned up {len(models_to_remove)} old {model_type} models")
            
            # Log dosyasını güncelle
            self.save_models_log()
            
        except Exception as e:
            logger.error(f"❌ Cleanup old models error: {e}")
    
    def save_models_log(self):
        """Models log dosyasını kaydet"""
        try:
            models_data = [m.to_dict() for m in self.models]
            with open(self.models_log, 'w') as f:
                json.dump(models_data, f, indent=2)
                
        except Exception as e:
            logger.error(f"❌ Save models log error: {e}")
    
    def save_sessions_log(self):
        """Sessions log dosyasını kaydet"""
        try:
            sessions_data = [s.to_dict() for s in self.sessions]
            with open(self.sessions_log, 'w') as f:
                json.dump(sessions_data, f, indent=2)
                
        except Exception as e:
            logger.error(f"❌ Save sessions log error: {e}")
    
    def save_performance_log(self):
        """Performance log dosyasını kaydet"""
        try:
            with open(self.performance_log, 'w') as f:
                json.dump(self.performance_history, f, indent=2)
                
        except Exception as e:
            logger.error(f"❌ Save performance log error: {e}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """İstatistikleri getir"""
        try:
            stats = {
                'total_models': len(self.models),
                'total_sessions': len(self.sessions),
                'total_performance_records': len(self.performance_history),
                'models_by_type': {},
                'sessions_by_status': {},
                'average_training_duration': 0,
                'best_models': {}
            }
            
            # Model türlerine göre sayım
            for model in self.models:
                model_type = model.model_type
                if model_type not in stats['models_by_type']:
                    stats['models_by_type'][model_type] = 0
                stats['models_by_type'][model_type] += 1
            
            # Oturum durumlarına göre sayım
            for session in self.sessions:
                status = session.status
                if status not in stats['sessions_by_status']:
                    stats['sessions_by_status'][status] = 0
                stats['sessions_by_status'][status] += 1
            
            # Ortalama eğitim süresi
            completed_sessions = [s for s in self.sessions if s.end_time and s.status == 'completed']
            if completed_sessions:
                total_duration = sum((s.end_time - s.start_time).total_seconds() for s in completed_sessions)
                stats['average_training_duration'] = total_duration / len(completed_sessions)
            
            # En iyi modeller
            model_types = set(m.model_type for m in self.models)
            for model_type in model_types:
                best_model = self.get_best_model(model_type)
                if best_model:
                    stats['best_models'][model_type] = {
                        'model_id': best_model.model_id,
                        'version': best_model.version,
                        'accuracy': best_model.performance_metrics.get('accuracy', 0)
                    }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Get statistics error: {e}")
            return {}

# Global instance
model_logger = ModelLogger()

if __name__ == "__main__":
    # Test fonksiyonu
    logger.info("🧪 Testing Model Logger...")
    
    # Test session
    session_id = model_logger.start_training_session('prophet')
    
    # Test model logging
    model_logger.log_model(
        model_id='test_prophet_001',
        model_type='prophet',
        version='v1.0.0',
        file_path='test_model.pkl',
        training_data_hash='abc123',
        hyperparameters={'changepoint_prior_scale': 0.05},
        performance_metrics={'accuracy': 0.85, 'rmse': 0.12},
        training_duration=120.5,
        training_samples=1000,
        test_samples=200
    )
    
    # Test session end
    model_logger.end_training_session(session_id, 'completed', {'accuracy': 0.85})
    
    # Test statistics
    stats = model_logger.get_statistics()
    logger.info(f"📊 Statistics: {stats}")
    
    logger.info("✅ Model Logger test completed")
