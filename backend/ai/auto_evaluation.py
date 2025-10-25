"""
🚀 BIST AI Smart Trader - Auto Evaluation & Retrain Trigger
==========================================================

Model performansını otomatik değerlendiren ve retrain tetikleyen sistem.
Sürekli öğrenme ve model iyileştirme.

Özellikler:
- Otomatik model değerlendirme
- Performance threshold kontrolü
- Retrain trigger sistemi
- Model versioning
- A/B testing
"""

import asyncio
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import threading
import time

# ML Libraries
try:
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
    from sklearn.model_selection import cross_val_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("⚠️ Scikit-learn not available")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ModelEvaluation:
    """Model değerlendirme sonucu"""
    model_id: str
    model_type: str
    evaluation_date: datetime
    metrics: Dict[str, float]
    performance_score: float
    threshold_met: bool
    retrain_recommended: bool
    evaluation_data_size: int
    evaluation_duration: float
    
    def to_dict(self):
        data = asdict(self)
        data['evaluation_date'] = self.evaluation_date.isoformat()
        return data

@dataclass
class RetrainTrigger:
    """Retrain tetikleyici"""
    trigger_id: str
    model_id: str
    trigger_reason: str
    trigger_date: datetime
    priority: str  # 'low', 'medium', 'high', 'critical'
    status: str  # 'pending', 'in_progress', 'completed', 'failed'
    retrain_config: Dict[str, Any]
    
    def to_dict(self):
        data = asdict(self)
        data['trigger_date'] = self.trigger_date.isoformat()
        return data

@dataclass
class ModelVersion:
    """Model versiyonu"""
    version_id: str
    model_id: str
    version_number: str
    created_at: datetime
    performance_metrics: Dict[str, float]
    is_active: bool
    is_production: bool
    file_path: str
    
    def to_dict(self):
        data = asdict(self)
        data['created_at'] = data['created_at'].isoformat()
        return data

class AutoEvaluationEngine:
    """Otomatik değerlendirme motoru"""
    
    def __init__(self, data_dir: str = "backend/ai/data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Model registry
        self.model_registry: Dict[str, Dict[str, Any]] = {}
        
        # Evaluation history
        self.evaluation_history: List[ModelEvaluation] = []
        
        # Retrain triggers
        self.retrain_triggers: List[RetrainTrigger] = []
        
        # Model versions
        self.model_versions: List[ModelVersion] = []
        
        # Performance thresholds
        self.performance_thresholds = {
            'accuracy': 0.75,
            'precision': 0.70,
            'recall': 0.70,
            'f1_score': 0.70,
            'roc_auc': 0.75,
            'min_data_points': 100,
            'max_evaluation_age_hours': 24
        }
        
        # Evaluation schedule
        self.evaluation_schedule = {
            'prophet': 6,  # hours
            'lstm': 4,     # hours
            'lightgbm': 2, # hours
            'ensemble': 1  # hours
        }
        
        # Auto-evaluation state
        self.is_evaluating = False
        self.evaluation_thread = None
        
        # Load existing data
        self._load_data()
    
    def _load_data(self):
        """Mevcut verileri yükle"""
        try:
            # Model registry
            registry_file = self.data_dir / "model_registry.json"
            if registry_file.exists():
                with open(registry_file, 'r') as f:
                    self.model_registry = json.load(f)
            
            # Evaluation history
            eval_file = self.data_dir / "evaluation_history.json"
            if eval_file.exists():
                with open(eval_file, 'r') as f:
                    eval_data = json.load(f)
                    self.evaluation_history = [
                        ModelEvaluation(**item) for item in eval_data
                    ]
            
            # Retrain triggers
            triggers_file = self.data_dir / "retrain_triggers.json"
            if triggers_file.exists():
                with open(triggers_file, 'r') as f:
                    trigger_data = json.load(f)
                    self.retrain_triggers = [
                        RetrainTrigger(**item) for item in trigger_data
                    ]
            
            # Model versions
            versions_file = self.data_dir / "model_versions.json"
            if versions_file.exists():
                with open(versions_file, 'r') as f:
                    version_data = json.load(f)
                    self.model_versions = [
                        ModelVersion(**item) for item in version_data
                    ]
            
            logger.info(f"✅ Loaded {len(self.model_registry)} models, {len(self.evaluation_history)} evaluations")
            
        except Exception as e:
            logger.error(f"❌ Load data error: {e}")
    
    def _save_data(self):
        """Verileri kaydet"""
        try:
            # Model registry
            registry_file = self.data_dir / "model_registry.json"
            with open(registry_file, 'w') as f:
                json.dump(self.model_registry, f, indent=2)
            
            # Evaluation history
            eval_file = self.data_dir / "evaluation_history.json"
            eval_data = [eval.to_dict() for eval in self.evaluation_history]
            with open(eval_file, 'w') as f:
                json.dump(eval_data, f, indent=2)
            
            # Retrain triggers
            triggers_file = self.data_dir / "retrain_triggers.json"
            trigger_data = [trigger.to_dict() for trigger in self.retrain_triggers]
            with open(triggers_file, 'w') as f:
                json.dump(trigger_data, f, indent=2)
            
            # Model versions
            versions_file = self.data_dir / "model_versions.json"
            version_data = [version.to_dict() for version in self.model_versions]
            with open(versions_file, 'w') as f:
                json.dump(version_data, f, indent=2)
            
            logger.info("💾 Auto evaluation data saved")
            
        except Exception as e:
            logger.error(f"❌ Save data error: {e}")
    
    def register_model(self, 
                      model_id: str,
                      model_type: str,
                      file_path: str,
                      metadata: Dict[str, Any] = None) -> bool:
        """Modeli kaydet"""
        try:
            self.model_registry[model_id] = {
                'model_type': model_type,
                'file_path': file_path,
                'created_at': datetime.now().isoformat(),
                'last_evaluation': None,
                'performance_score': 0.0,
                'is_active': True,
                'metadata': metadata or {}
            }
            
            logger.info(f"✅ Model registered: {model_id} ({model_type})")
            return True
            
        except Exception as e:
            logger.error(f"❌ Register model error: {e}")
            return False
    
    def evaluate_model(self, 
                      model_id: str,
                      test_data: pd.DataFrame,
                      test_labels: pd.Series) -> ModelEvaluation:
        """Modeli değerlendir"""
        try:
            if model_id not in self.model_registry:
                raise ValueError(f"Model not registered: {model_id}")
            
            model_info = self.model_registry[model_id]
            model_type = model_info['model_type']
            
            start_time = time.time()
            
            # Model yükle (bu gerçek implementasyon olacak)
            # model = self._load_model(model_id)
            
            # Mock predictions (gerçek implementasyonda model.predict() kullanılacak)
            predictions = np.random.choice([0, 1], size=len(test_labels), p=[0.3, 0.7])
            
            # Metrikleri hesapla
            metrics = self._calculate_metrics(test_labels, predictions)
            
            # Performance skoru hesapla
            performance_score = self._calculate_performance_score(metrics)
            
            # Threshold kontrolü
            threshold_met = self._check_thresholds(metrics)
            
            # Retrain önerisi
            retrain_recommended = self._should_retrain(metrics, model_id)
            
            # Değerlendirme sonucu
            evaluation = ModelEvaluation(
                model_id=model_id,
                model_type=model_type,
                evaluation_date=datetime.now(),
                metrics=metrics,
                performance_score=performance_score,
                threshold_met=threshold_met,
                retrain_recommended=retrain_recommended,
                evaluation_data_size=len(test_data),
                evaluation_duration=time.time() - start_time
            )
            
            # Geçmişe ekle
            self.evaluation_history.append(evaluation)
            
            # Model registry'yi güncelle
            self.model_registry[model_id]['last_evaluation'] = evaluation.evaluation_date.isoformat()
            self.model_registry[model_id]['performance_score'] = performance_score
            
            # Retrain trigger oluştur
            if retrain_recommended:
                self._create_retrain_trigger(model_id, evaluation)
            
            logger.info(f"✅ Model evaluated: {model_id} - Score: {performance_score:.3f}")
            return evaluation
            
        except Exception as e:
            logger.error(f"❌ Evaluate model error: {e}")
            raise
    
    def _calculate_metrics(self, y_true: pd.Series, y_pred: np.ndarray) -> Dict[str, float]:
        """Metrikleri hesapla"""
        try:
            metrics = {
                'accuracy': accuracy_score(y_true, y_pred),
                'precision': precision_score(y_true, y_pred, average='weighted'),
                'recall': recall_score(y_true, y_pred, average='weighted'),
                'f1_score': f1_score(y_true, y_pred, average='weighted')
            }
            
            # ROC AUC (binary classification için)
            if len(np.unique(y_true)) == 2:
                metrics['roc_auc'] = roc_auc_score(y_true, y_pred)
            else:
                metrics['roc_auc'] = 0.5  # Multi-class için default
            
            return metrics
            
        except Exception as e:
            logger.error(f"❌ Calculate metrics error: {e}")
            return {
                'accuracy': 0.0,
                'precision': 0.0,
                'recall': 0.0,
                'f1_score': 0.0,
                'roc_auc': 0.5
            }
    
    def _calculate_performance_score(self, metrics: Dict[str, float]) -> float:
        """Performance skoru hesapla"""
        try:
            # Ağırlıklı ortalama
            weights = {
                'accuracy': 0.3,
                'precision': 0.2,
                'recall': 0.2,
                'f1_score': 0.2,
                'roc_auc': 0.1
            }
            
            score = sum(metrics.get(metric, 0) * weight for metric, weight in weights.items())
            return min(max(score, 0.0), 1.0)  # 0-1 arasında sınırla
            
        except Exception as e:
            logger.error(f"❌ Calculate performance score error: {e}")
            return 0.0
    
    def _check_thresholds(self, metrics: Dict[str, float]) -> bool:
        """Threshold kontrolü yap"""
        try:
            for metric, threshold in self.performance_thresholds.items():
                if metric in metrics and metrics[metric] < threshold:
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Check thresholds error: {e}")
            return False
    
    def _should_retrain(self, metrics: Dict[str, float], model_id: str) -> bool:
        """Retrain gerekli mi kontrol et"""
        try:
            # Performance threshold kontrolü
            if not self._check_thresholds(metrics):
                return True
            
            # Son değerlendirme tarihi kontrolü
            model_info = self.model_registry.get(model_id, {})
            last_eval = model_info.get('last_evaluation')
            
            if last_eval:
                last_eval_date = datetime.fromisoformat(last_eval)
                hours_since_eval = (datetime.now() - last_eval_date).total_seconds() / 3600
                
                model_type = model_info.get('model_type', 'unknown')
                max_age = self.evaluation_schedule.get(model_type, 24)
                
                if hours_since_eval > max_age:
                    return True
            
            # Performance skoru düşükse
            performance_score = self._calculate_performance_score(metrics)
            if performance_score < 0.6:  # Düşük threshold
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Should retrain error: {e}")
            return False
    
    def _create_retrain_trigger(self, model_id: str, evaluation: ModelEvaluation):
        """Retrain trigger oluştur"""
        try:
            # Priority belirleme
            if evaluation.performance_score < 0.5:
                priority = 'critical'
            elif evaluation.performance_score < 0.6:
                priority = 'high'
            elif evaluation.performance_score < 0.7:
                priority = 'medium'
            else:
                priority = 'low'
            
            # Trigger reason
            reasons = []
            if not evaluation.threshold_met:
                reasons.append("Performance thresholds not met")
            if evaluation.performance_score < 0.7:
                reasons.append(f"Low performance score: {evaluation.performance_score:.3f}")
            
            trigger_reason = "; ".join(reasons) if reasons else "Scheduled retrain"
            
            # Retrain trigger oluştur
            trigger = RetrainTrigger(
                trigger_id=f"trigger_{model_id}_{int(time.time())}",
                model_id=model_id,
                trigger_reason=trigger_reason,
                trigger_date=datetime.now(),
                priority=priority,
                status='pending',
                retrain_config={
                    'model_type': evaluation.model_type,
                    'performance_score': evaluation.performance_score,
                    'metrics': evaluation.metrics,
                    'data_size': evaluation.evaluation_data_size
                }
            )
            
            self.retrain_triggers.append(trigger)
            
            logger.info(f"✅ Retrain trigger created: {model_id} - {priority}")
            
        except Exception as e:
            logger.error(f"❌ Create retrain trigger error: {e}")
    
    def start_auto_evaluation(self):
        """Otomatik değerlendirmeyi başlat"""
        try:
            if self.is_evaluating:
                logger.warning("⚠️ Auto evaluation already running")
                return
            
            self.is_evaluating = True
            self.evaluation_thread = threading.Thread(target=self._evaluation_loop, daemon=True)
            self.evaluation_thread.start()
            
            logger.info("🚀 Auto evaluation started")
            
        except Exception as e:
            logger.error(f"❌ Start auto evaluation error: {e}")
    
    def stop_auto_evaluation(self):
        """Otomatik değerlendirmeyi durdur"""
        try:
            self.is_evaluating = False
            
            if self.evaluation_thread and self.evaluation_thread.is_alive():
                self.evaluation_thread.join(timeout=5)
            
            logger.info("🛑 Auto evaluation stopped")
            
        except Exception as e:
            logger.error(f"❌ Stop auto evaluation error: {e}")
    
    def _evaluation_loop(self):
        """Değerlendirme döngüsü"""
        while self.is_evaluating:
            try:
                # Kayıtlı modelleri kontrol et
                for model_id, model_info in self.model_registry.items():
                    if not model_info.get('is_active', True):
                        continue
                    
                    # Son değerlendirme tarihi kontrolü
                    last_eval = model_info.get('last_evaluation')
                    if last_eval:
                        last_eval_date = datetime.fromisoformat(last_eval)
                        hours_since_eval = (datetime.now() - last_eval_date).total_seconds() / 3600
                        
                        model_type = model_info.get('model_type', 'unknown')
                        eval_interval = self.evaluation_schedule.get(model_type, 24)
                        
                        if hours_since_eval >= eval_interval:
                            # Değerlendirme gerekli
                            logger.info(f"🔄 Auto evaluation needed for {model_id}")
                            # Burada gerçek değerlendirme yapılacak
                            # self.evaluate_model(model_id, test_data, test_labels)
                
                # 1 saat bekle
                time.sleep(3600)
                
            except Exception as e:
                logger.error(f"❌ Evaluation loop error: {e}")
                time.sleep(300)  # Hata durumunda 5 dakika bekle
    
    def get_evaluation_summary(self, model_id: str = None) -> Dict[str, Any]:
        """Değerlendirme özetini getir"""
        try:
            if model_id:
                # Belirli model için özet
                model_evals = [eval for eval in self.evaluation_history if eval.model_id == model_id]
            else:
                # Tüm modeller için özet
                model_evals = self.evaluation_history
            
            if not model_evals:
                return {'total_evaluations': 0}
            
            # İstatistikleri hesapla
            total_evaluations = len(model_evals)
            avg_performance = sum(eval.performance_score for eval in model_evals) / total_evaluations
            
            # Son değerlendirme
            latest_eval = max(model_evals, key=lambda x: x.evaluation_date)
            
            # Retrain trigger sayısı
            retrain_count = len([trigger for trigger in self.retrain_triggers 
                               if trigger.model_id == model_id or model_id is None])
            
            summary = {
                'total_evaluations': total_evaluations,
                'average_performance': avg_performance,
                'latest_performance': latest_eval.performance_score,
                'latest_evaluation_date': latest_eval.evaluation_date.isoformat(),
                'retrain_triggers': retrain_count,
                'threshold_met': latest_eval.threshold_met,
                'retrain_recommended': latest_eval.retrain_recommended
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Get evaluation summary error: {e}")
            return {}
    
    def get_statistics(self) -> Dict[str, Any]:
        """İstatistikleri getir"""
        try:
            stats = {
                'total_models': len(self.model_registry),
                'active_models': len([m for m in self.model_registry.values() if m.get('is_active', True)]),
                'total_evaluations': len(self.evaluation_history),
                'pending_triggers': len([t for t in self.retrain_triggers if t.status == 'pending']),
                'total_triggers': len(self.retrain_triggers),
                'model_versions': len(self.model_versions),
                'is_evaluating': self.is_evaluating,
                'performance_thresholds': self.performance_thresholds,
                'evaluation_schedule': self.evaluation_schedule
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Get statistics error: {e}")
            return {}

# Global instance
auto_evaluation_engine = AutoEvaluationEngine()

if __name__ == "__main__":
    async def test_auto_evaluation():
        """Test fonksiyonu"""
        logger.info("🧪 Testing Auto Evaluation Engine...")
        
        # Test modeli kaydet
        auto_evaluation_engine.register_model(
            model_id="test_prophet",
            model_type="prophet",
            file_path="test_model.pkl",
            metadata={"test": True}
        )
        
        # Test verisi oluştur
        test_data = pd.DataFrame({
            'feature1': np.random.randn(100),
            'feature2': np.random.randn(100),
            'feature3': np.random.randn(100)
        })
        test_labels = pd.Series(np.random.choice([0, 1], size=100))
        
        # Model değerlendir
        evaluation = auto_evaluation_engine.evaluate_model(
            model_id="test_prophet",
            test_data=test_data,
            test_labels=test_labels
        )
        
        logger.info(f"✅ Evaluation completed: {evaluation.performance_score:.3f}")
        
        # Özet getir
        summary = auto_evaluation_engine.get_evaluation_summary("test_prophet")
        logger.info(f"📊 Summary: {summary}")
        
        # İstatistikler
        stats = auto_evaluation_engine.get_statistics()
        logger.info(f"📈 Statistics: {stats}")
        
        logger.info("✅ Auto Evaluation Engine test completed")
    
    # Test çalıştır
    asyncio.run(test_auto_evaluation())
