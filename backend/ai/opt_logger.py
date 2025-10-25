"""
🚀 BIST AI Smart Trader - Optimization Tracker
==============================================

Denenen parametre setlerini ve başarı skorlarını kaydeden sistem.
Optimizasyon geçmişini izler ve analiz eder.

Özellikler:
- Parameter tracking
- Performance monitoring
- Optimization history
- Best parameter identification
- Convergence analysis
- Performance visualization
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
import matplotlib.pyplot as plt
import seaborn as sns

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ParameterSet:
    """Parametre seti"""
    parameter_id: str
    model_type: str
    parameters: Dict[str, Any]
    performance_metrics: Dict[str, float]
    evaluation_time: float
    timestamp: datetime
    status: str  # 'evaluated', 'failed', 'pending'
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

@dataclass
class OptimizationSession:
    """Optimizasyon oturumu"""
    session_id: str
    model_type: str
    start_time: datetime
    end_time: Optional[datetime]
    total_evaluations: int
    best_parameter_set: Optional[ParameterSet]
    best_performance: float
    parameter_sets: List[ParameterSet]
    convergence_data: List[Dict[str, Any]]
    
    def to_dict(self):
        data = asdict(self)
        data['start_time'] = self.start_time.isoformat()
        data['end_time'] = self.end_time.isoformat() if self.end_time else None
        data['best_parameter_set'] = self.best_parameter_set.to_dict() if self.best_parameter_set else None
        data['parameter_sets'] = [ps.to_dict() for ps in self.parameter_sets]
        return data

@dataclass
class PerformanceAnalysis:
    """Performans analizi"""
    model_type: str
    total_sessions: int
    best_overall_performance: float
    average_performance: float
    performance_std: float
    convergence_rate: float
    parameter_importance: Dict[str, float]
    performance_trend: List[float]
    
    def to_dict(self):
        return asdict(self)

class OptimizationTracker:
    """Optimization Tracker"""
    
    def __init__(self, data_dir: str = "backend/ai/data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Storage paths
        self.sessions_file = self.data_dir / "optimization_sessions.json"
        self.parameters_file = self.data_dir / "parameter_sets.json"
        self.analysis_file = self.data_dir / "performance_analysis.json"
        
        # In-memory storage
        self.optimization_sessions: List[OptimizationSession] = []
        self.parameter_sets: List[ParameterSet] = []
        self.performance_analyses: List[PerformanceAnalysis] = []
        
        # Current session
        self.current_session: Optional[OptimizationSession] = None
        
        # Load existing data
        self._load_data()
        
        logger.info("✅ Optimization Tracker initialized")
    
    def _load_data(self):
        """Mevcut verileri yükle"""
        try:
            # Optimization sessions
            if self.sessions_file.exists():
                with open(self.sessions_file, 'r') as f:
                    sessions_data = json.load(f)
                    self.optimization_sessions = [
                        OptimizationSession(**session) for session in sessions_data
                    ]
            
            # Parameter sets
            if self.parameters_file.exists():
                with open(self.parameters_file, 'r') as f:
                    parameters_data = json.load(f)
                    self.parameter_sets = [
                        ParameterSet(**param) for param in parameters_data
                    ]
            
            # Performance analyses
            if self.analysis_file.exists():
                with open(self.analysis_file, 'r') as f:
                    analysis_data = json.load(f)
                    self.performance_analyses = [
                        PerformanceAnalysis(**analysis) for analysis in analysis_data
                    ]
            
            logger.info(f"✅ Loaded {len(self.optimization_sessions)} sessions, "
                       f"{len(self.parameter_sets)} parameter sets")
            
        except Exception as e:
            logger.error(f"❌ Load data error: {e}")
    
    def _save_data(self):
        """Verileri kaydet"""
        try:
            # Optimization sessions
            sessions_data = [session.to_dict() for session in self.optimization_sessions]
            with open(self.sessions_file, 'w') as f:
                json.dump(sessions_data, f, indent=2)
            
            # Parameter sets
            parameters_data = [param.to_dict() for param in self.parameter_sets]
            with open(self.parameters_file, 'w') as f:
                json.dump(parameters_data, f, indent=2)
            
            # Performance analyses
            analysis_data = [analysis.to_dict() for analysis in self.performance_analyses]
            with open(self.analysis_file, 'w') as f:
                json.dump(analysis_data, f, indent=2)
            
            logger.info("💾 Optimization data saved")
            
        except Exception as e:
            logger.error(f"❌ Save data error: {e}")
    
    def start_optimization_session(self, model_type: str) -> str:
        """Optimizasyon oturumu başlat"""
        try:
            session_id = f"opt_session_{int(datetime.now().timestamp())}"
            
            session = OptimizationSession(
                session_id=session_id,
                model_type=model_type,
                start_time=datetime.now(),
                end_time=None,
                total_evaluations=0,
                best_parameter_set=None,
                best_performance=-np.inf,
                parameter_sets=[],
                convergence_data=[]
            )
            
            self.optimization_sessions.append(session)
            self.current_session = session
            
            logger.info(f"🚀 Optimization session started: {session_id} for {model_type}")
            
            return session_id
            
        except Exception as e:
            logger.error(f"❌ Start optimization session error: {e}")
            return ""
    
    def end_optimization_session(self, session_id: str) -> bool:
        """Optimizasyon oturumunu bitir"""
        try:
            session = next((s for s in self.optimization_sessions if s.session_id == session_id), None)
            
            if not session:
                logger.error(f"❌ Session not found: {session_id}")
                return False
            
            session.end_time = datetime.now()
            
            # Convergence analizi yap
            self._analyze_convergence(session)
            
            # Session'ı kaydet
            self._save_data()
            
            logger.info(f"✅ Optimization session ended: {session_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ End optimization session error: {e}")
            return False
    
    def track_parameter_set(self,
                           parameters: Dict[str, Any],
                           performance_metrics: Dict[str, float],
                           evaluation_time: float,
                           model_type: str,
                           status: str = 'evaluated') -> str:
        """Parametre setini takip et"""
        try:
            parameter_id = f"param_{int(datetime.now().timestamp())}_{len(self.parameter_sets)}"
            
            parameter_set = ParameterSet(
                parameter_id=parameter_id,
                model_type=model_type,
                parameters=parameters,
                performance_metrics=performance_metrics,
                evaluation_time=evaluation_time,
                timestamp=datetime.now(),
                status=status
            )
            
            self.parameter_sets.append(parameter_set)
            
            # Current session'a ekle
            if self.current_session:
                self.current_session.parameter_sets.append(parameter_set)
                self.current_session.total_evaluations += 1
                
                # En iyi performansı güncelle
                primary_metric = performance_metrics.get('objective', 0.0)
                if primary_metric > self.current_session.best_performance:
                    self.current_session.best_performance = primary_metric
                    self.current_session.best_parameter_set = parameter_set
                
                # Convergence data ekle
                convergence_point = {
                    'evaluation': self.current_session.total_evaluations,
                    'performance': primary_metric,
                    'timestamp': datetime.now().isoformat()
                }
                self.current_session.convergence_data.append(convergence_point)
            
            logger.info(f"📊 Parameter set tracked: {parameter_id} - {primary_metric:.4f}")
            
            return parameter_id
            
        except Exception as e:
            logger.error(f"❌ Track parameter set error: {e}")
            return ""
    
    def _analyze_convergence(self, session: OptimizationSession):
        """Convergence analizi yap"""
        try:
            if len(session.convergence_data) < 5:
                return
            
            # Performance values
            performances = [point['performance'] for point in session.convergence_data]
            
            # Convergence metrics
            convergence_metrics = {
                'total_evaluations': len(performances),
                'best_performance': max(performances),
                'worst_performance': min(performances),
                'performance_range': max(performances) - min(performances),
                'final_performance': performances[-1],
                'improvement': max(performances) - performances[0],
                'convergence_rate': self._calculate_convergence_rate(performances),
                'stability': self._calculate_stability(performances)
            }
            
            # Session'a convergence metrics ekle
            session.convergence_data[-1]['convergence_metrics'] = convergence_metrics
            
            logger.info(f"📈 Convergence analysis: {convergence_metrics['convergence_rate']:.3f}")
            
        except Exception as e:
            logger.error(f"❌ Analyze convergence error: {e}")
    
    def _calculate_convergence_rate(self, performances: List[float]) -> float:
        """Convergence rate hesapla"""
        try:
            if len(performances) < 10:
                return 0.0
            
            # Son 10 değerin standart sapması
            recent_performances = performances[-10:]
            convergence_rate = 1.0 / (1.0 + np.std(recent_performances))
            
            return convergence_rate
            
        except Exception as e:
            logger.error(f"❌ Calculate convergence rate error: {e}")
            return 0.0
    
    def _calculate_stability(self, performances: List[float]) -> float:
        """Stability hesapla"""
        try:
            if len(performances) < 5:
                return 0.0
            
            # Performans değişimlerinin standart sapması
            performance_changes = np.diff(performances)
            stability = 1.0 / (1.0 + np.std(performance_changes))
            
            return stability
            
        except Exception as e:
            logger.error(f"❌ Calculate stability error: {e}")
            return 0.0
    
    def get_best_parameters(self, model_type: str) -> Optional[ParameterSet]:
        """En iyi parametreleri getir"""
        try:
            model_parameters = [p for p in self.parameter_sets if p.model_type == model_type]
            
            if not model_parameters:
                return None
            
            # En iyi performansı bul
            best_parameter = max(model_parameters, 
                               key=lambda p: p.performance_metrics.get('objective', -np.inf))
            
            return best_parameter
            
        except Exception as e:
            logger.error(f"❌ Get best parameters error: {e}")
            return None
    
    def get_optimization_history(self, model_type: str = None) -> List[OptimizationSession]:
        """Optimizasyon geçmişini getir"""
        try:
            if model_type:
                return [s for s in self.optimization_sessions if s.model_type == model_type]
            else:
                return self.optimization_sessions
            
        except Exception as e:
            logger.error(f"❌ Get optimization history error: {e}")
            return []
    
    def analyze_parameter_importance(self, model_type: str) -> Dict[str, float]:
        """Parametre önemini analiz et"""
        try:
            model_parameters = [p for p in self.parameter_sets if p.model_type == model_type]
            
            if len(model_parameters) < 10:
                return {}
            
            # Parametre değerleri ve performansları
            param_data = {}
            performances = []
            
            for param_set in model_parameters:
                performance = param_set.performance_metrics.get('objective', 0.0)
                performances.append(performance)
                
                for param_name, param_value in param_set.parameters.items():
                    if param_name not in param_data:
                        param_data[param_name] = []
                    param_data[param_name].append(param_value)
            
            # Parametre önemini hesapla
            param_importance = {}
            
            for param_name, param_values in param_data.items():
                if len(param_values) < 5:
                    continue
                
                # Parametre değerleri ile performans arasındaki korelasyon
                correlation = np.corrcoef(param_values, performances)[0, 1]
                
                # Parametre varyansı
                variance = np.var(param_values)
                
                # Önem skoru
                importance = abs(correlation) * variance
                param_importance[param_name] = importance
            
            # Önem skorlarını normalize et
            total_importance = sum(param_importance.values())
            if total_importance > 0:
                param_importance = {k: v/total_importance for k, v in param_importance.items()}
            
            return param_importance
            
        except Exception as e:
            logger.error(f"❌ Analyze parameter importance error: {e}")
            return {}
    
    def generate_performance_report(self, model_type: str) -> Dict[str, Any]:
        """Performans raporu oluştur"""
        try:
            model_sessions = [s for s in self.optimization_sessions if s.model_type == model_type]
            model_parameters = [p for p in self.parameter_sets if p.model_type == model_type]
            
            if not model_sessions:
                return {'error': 'No optimization sessions found'}
            
            # Temel istatistikler
            total_sessions = len(model_sessions)
            total_evaluations = sum(s.total_evaluations for s in model_sessions)
            
            # Performans metrikleri
            all_performances = []
            for param_set in model_parameters:
                performance = param_set.performance_metrics.get('objective', 0.0)
                all_performances.append(performance)
            
            best_performance = max(all_performances) if all_performances else 0.0
            average_performance = np.mean(all_performances) if all_performances else 0.0
            performance_std = np.std(all_performances) if all_performances else 0.0
            
            # Convergence analizi
            convergence_rates = []
            for session in model_sessions:
                if session.convergence_data:
                    last_point = session.convergence_data[-1]
                    convergence_metrics = last_point.get('convergence_metrics', {})
                    convergence_rate = convergence_metrics.get('convergence_rate', 0.0)
                    convergence_rates.append(convergence_rate)
            
            average_convergence = np.mean(convergence_rates) if convergence_rates else 0.0
            
            # Parametre önem analizi
            param_importance = self.analyze_parameter_importance(model_type)
            
            # Performans trendi
            performance_trend = []
            for session in model_sessions:
                if session.convergence_data:
                    trend_performances = [point['performance'] for point in session.convergence_data]
                    performance_trend.extend(trend_performances)
            
            report = {
                'model_type': model_type,
                'total_sessions': total_sessions,
                'total_evaluations': total_evaluations,
                'best_performance': best_performance,
                'average_performance': average_performance,
                'performance_std': performance_std,
                'average_convergence_rate': average_convergence,
                'parameter_importance': param_importance,
                'performance_trend': performance_trend,
                'optimization_sessions': [s.session_id for s in model_sessions],
                'generated_at': datetime.now().isoformat()
            }
            
            return report
            
        except Exception as e:
            logger.error(f"❌ Generate performance report error: {e}")
            return {}
    
    def get_statistics(self) -> Dict[str, Any]:
        """İstatistikleri getir"""
        try:
            stats = {
                'total_sessions': len(self.optimization_sessions),
                'total_parameter_sets': len(self.parameter_sets),
                'active_sessions': len([s for s in self.optimization_sessions if s.end_time is None]),
                'model_types': list(set(s.model_type for s in self.optimization_sessions)),
                'total_evaluations': sum(s.total_evaluations for s in self.optimization_sessions),
                'average_evaluations_per_session': np.mean([s.total_evaluations for s in self.optimization_sessions]) if self.optimization_sessions else 0,
                'best_overall_performance': max([s.best_performance for s in self.optimization_sessions]) if self.optimization_sessions else 0.0
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Get statistics error: {e}")
            return {}

# Global instance
optimization_tracker = OptimizationTracker()

if __name__ == "__main__":
    async def test_optimization_tracker():
        """Test fonksiyonu"""
        logger.info("🧪 Testing Optimization Tracker...")
        
        # Test optimizasyon oturumu başlat
        session_id = optimization_tracker.start_optimization_session("test_model")
        logger.info(f"✅ Session started: {session_id}")
        
        # Test parametre setleri
        test_parameters = [
            {'param1': 0.1, 'param2': 1, 'param3': 'option1'},
            {'param1': 0.5, 'param2': 3, 'param3': 'option2'},
            {'param1': 0.9, 'param2': 5, 'param3': 'option1'}
        ]
        
        test_performances = [0.7, 0.9, 0.6]
        
        # Parametre setlerini takip et
        for i, (params, perf) in enumerate(zip(test_parameters, test_performances)):
            param_id = optimization_tracker.track_parameter_set(
                parameters=params,
                performance_metrics={'objective': perf, 'accuracy': perf * 0.9},
                evaluation_time=1.0 + i * 0.5,
                model_type="test_model"
            )
            logger.info(f"📊 Parameter set tracked: {param_id}")
        
        # Oturumu bitir
        optimization_tracker.end_optimization_session(session_id)
        
        # En iyi parametreleri getir
        best_params = optimization_tracker.get_best_parameters("test_model")
        if best_params:
            logger.info(f"🏆 Best parameters: {best_params.parameters}")
        
        # Performans raporu
        report = optimization_tracker.generate_performance_report("test_model")
        logger.info(f"📈 Performance report: {report}")
        
        # İstatistikler
        stats = optimization_tracker.get_statistics()
        logger.info(f"📊 Statistics: {stats}")
        
        logger.info("✅ Optimization Tracker test completed")
    
    # Test çalıştır
    asyncio.run(test_optimization_tracker())
