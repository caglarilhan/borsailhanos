"""
🚀 BIST AI Smart Trader - Bayesian Optimizer
===========================================

Prophet ve LSTM parametrelerini optimize eden sistem.
Bayesian search ile hiperparametre tuning.

Özellikler:
- Gaussian Process optimization
- Prophet parameter tuning
- LSTM parameter tuning
- Multi-objective optimization
- Parameter space exploration
- Optimization history tracking
"""

import asyncio
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Callable
from dataclasses import dataclass, asdict
from pathlib import Path
import itertools
import random

# ML Libraries
try:
    from sklearn.gaussian_process import GaussianProcessRegressor
    from sklearn.gaussian_process.kernels import RBF, Matern, WhiteKernel
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("⚠️ Scikit-learn not available")

try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    print("⚠️ Prophet not available")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ParameterSpace:
    """Parametre uzayı tanımı"""
    name: str
    param_type: str  # 'continuous', 'discrete', 'categorical'
    bounds: Tuple[float, float]  # For continuous
    values: List[Any]  # For discrete/categorical
    default_value: Any
    
    def to_dict(self):
        return asdict(self)

@dataclass
class OptimizationResult:
    """Optimizasyon sonucu"""
    parameters: Dict[str, Any]
    objective_value: float
    evaluation_time: float
    timestamp: datetime
    model_type: str
    metadata: Dict[str, Any]
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

@dataclass
class OptimizationHistory:
    """Optimizasyon geçmişi"""
    optimization_id: str
    model_type: str
    total_evaluations: int
    best_parameters: Dict[str, Any]
    best_objective: float
    optimization_time: float
    results: List[OptimizationResult]
    timestamp: datetime
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        data['results'] = [r.to_dict() for r in self.results]
        return data

class BayesianOptimizer:
    """Bayesian Optimizer"""
    
    def __init__(self, 
                 parameter_space: Dict[str, ParameterSpace],
                 objective_function: Callable,
                 acquisition_function: str = 'expected_improvement',
                 n_initial_points: int = 10,
                 n_iterations: int = 50):
        
        self.parameter_space = parameter_space
        self.objective_function = objective_function
        self.acquisition_function = acquisition_function
        self.n_initial_points = n_initial_points
        self.n_iterations = n_iterations
        
        # Optimization state
        self.X_evaluated = []  # Evaluated parameters
        self.y_evaluated = []  # Objective values
        self.gp_model = None
        self.scaler = StandardScaler()
        
        # Optimization history
        self.optimization_history = []
        self.current_optimization_id = None
        
        # Parameter bounds for continuous parameters
        self.continuous_bounds = []
        self.continuous_param_names = []
        
        # Setup parameter space
        self._setup_parameter_space()
        
        logger.info(f"✅ Bayesian Optimizer initialized with {len(parameter_space)} parameters")
    
    def _setup_parameter_space(self):
        """Parametre uzayını hazırla"""
        try:
            for param_name, param_space in self.parameter_space.items():
                if param_space.param_type == 'continuous':
                    self.continuous_bounds.append(param_space.bounds)
                    self.continuous_param_names.append(param_name)
            
            logger.info(f"📊 Parameter space setup: {len(self.continuous_param_names)} continuous parameters")
            
        except Exception as e:
            logger.error(f"❌ Setup parameter space error: {e}")
    
    def _sample_initial_points(self) -> List[Dict[str, Any]]:
        """İlk noktaları örnekle"""
        try:
            initial_points = []
            
            for _ in range(self.n_initial_points):
                point = {}
                
                for param_name, param_space in self.parameter_space.items():
                    if param_space.param_type == 'continuous':
                        # Uniform sampling within bounds
                        value = np.random.uniform(param_space.bounds[0], param_space.bounds[1])
                        point[param_name] = value
                    
                    elif param_space.param_type == 'discrete':
                        # Random choice from discrete values
                        value = random.choice(param_space.values)
                        point[param_name] = value
                    
                    elif param_space.param_type == 'categorical':
                        # Random choice from categorical values
                        value = random.choice(param_space.values)
                        point[param_name] = value
                
                initial_points.append(point)
            
            logger.info(f"🎯 Sampled {len(initial_points)} initial points")
            return initial_points
            
        except Exception as e:
            logger.error(f"❌ Sample initial points error: {e}")
            return []
    
    def _evaluate_parameters(self, parameters: Dict[str, Any]) -> float:
        """Parametreleri değerlendir"""
        try:
            start_time = datetime.now()
            
            # Objective function'ı çağır
            objective_value = self.objective_function(parameters)
            
            evaluation_time = (datetime.now() - start_time).total_seconds()
            
            # Sonucu kaydet
            result = OptimizationResult(
                parameters=parameters,
                objective_value=objective_value,
                evaluation_time=evaluation_time,
                timestamp=datetime.now(),
                model_type='unknown',
                metadata={}
            )
            
            self.optimization_history[-1].results.append(result)
            
            logger.info(f"📊 Evaluated parameters: {objective_value:.4f} in {evaluation_time:.2f}s")
            
            return objective_value
            
        except Exception as e:
            logger.error(f"❌ Evaluate parameters error: {e}")
            return -np.inf
    
    def _fit_gaussian_process(self):
        """Gaussian Process modelini eğit"""
        try:
            if not SKLEARN_AVAILABLE:
                logger.warning("⚠️ Scikit-learn not available - using random search")
                return
            
            if len(self.X_evaluated) < 2:
                logger.warning("⚠️ Not enough data points for GP")
                return
            
            # Continuous parameters için GP eğit
            X_continuous = []
            for params in self.X_evaluated:
                continuous_params = [params[name] for name in self.continuous_param_names]
                X_continuous.append(continuous_params)
            
            X_continuous = np.array(X_continuous)
            y_array = np.array(self.y_evaluated)
            
            # GP kernel
            kernel = Matern(length_scale=1.0, nu=2.5) + WhiteKernel(noise_level=0.1)
            
            # GP model
            self.gp_model = GaussianProcessRegressor(
                kernel=kernel,
                alpha=1e-6,
                normalize_y=True,
                n_restarts_optimizer=10
            )
            
            # Model eğit
            self.gp_model.fit(X_continuous, y_array)
            
            logger.info("✅ Gaussian Process model fitted")
            
        except Exception as e:
            logger.error(f"❌ Fit Gaussian Process error: {e}")
    
    def _acquisition_function_ei(self, X: np.ndarray) -> np.ndarray:
        """Expected Improvement acquisition function"""
        try:
            if self.gp_model is None:
                return np.random.random(X.shape[0])
            
            # GP predictions
            mu, sigma = self.gp_model.predict(X, return_std=True)
            
            # Best observed value
            best_y = max(self.y_evaluated)
            
            # Expected improvement
            improvement = mu - best_y
            z = improvement / (sigma + 1e-9)
            
            ei = improvement * self._normal_cdf(z) + sigma * self._normal_pdf(z)
            
            return ei
            
        except Exception as e:
            logger.error(f"❌ Acquisition function EI error: {e}")
            return np.random.random(X.shape[0])
    
    def _normal_cdf(self, x: np.ndarray) -> np.ndarray:
        """Normal CDF"""
        return 0.5 * (1 + np.sign(x) * np.sqrt(1 - np.exp(-2 * x**2 / np.pi)))
    
    def _normal_pdf(self, x: np.ndarray) -> np.ndarray:
        """Normal PDF"""
        return np.exp(-0.5 * x**2) / np.sqrt(2 * np.pi)
    
    def _suggest_next_point(self) -> Dict[str, Any]:
        """Sonraki noktayı öner"""
        try:
            if len(self.X_evaluated) < self.n_initial_points:
                # İlk noktaları örnekle
                initial_points = self._sample_initial_points()
                return initial_points[len(self.X_evaluated)]
            
            # GP modelini eğit
            self._fit_gaussian_process()
            
            if self.gp_model is None:
                # Random search fallback
                return self._sample_initial_points()[0]
            
            # Acquisition function ile en iyi noktayı bul
            best_point = None
            best_acquisition = -np.inf
            
            # Random sampling ile acquisition function'ı optimize et
            for _ in range(1000):
                # Random point sample
                point = {}
                X_continuous = []
                
                for param_name, param_space in self.parameter_space.items():
                    if param_space.param_type == 'continuous':
                        value = np.random.uniform(param_space.bounds[0], param_space.bounds[1])
                        point[param_name] = value
                        X_continuous.append(value)
                    else:
                        value = random.choice(param_space.values)
                        point[param_name] = value
                
                X_continuous = np.array(X_continuous).reshape(1, -1)
                
                # Acquisition value
                acquisition_value = self._acquisition_function_ei(X_continuous)[0]
                
                if acquisition_value > best_acquisition:
                    best_acquisition = acquisition_value
                    best_point = point
            
            return best_point
            
        except Exception as e:
            logger.error(f"❌ Suggest next point error: {e}")
            return self._sample_initial_points()[0]
    
    def optimize(self, model_type: str = 'unknown') -> OptimizationHistory:
        """Optimizasyonu çalıştır"""
        try:
            # Optimization ID
            self.current_optimization_id = f"opt_{int(datetime.now().timestamp())}"
            
            # Optimization history oluştur
            optimization_history = OptimizationHistory(
                optimization_id=self.current_optimization_id,
                model_type=model_type,
                total_evaluations=0,
                best_parameters={},
                best_objective=-np.inf,
                optimization_time=0.0,
                results=[],
                timestamp=datetime.now()
            )
            
            self.optimization_history.append(optimization_history)
            
            start_time = datetime.now()
            
            logger.info(f"🚀 Starting Bayesian optimization for {model_type}")
            
            # Optimization loop
            for iteration in range(self.n_iterations):
                logger.info(f"🔄 Iteration {iteration + 1}/{self.n_iterations}")
                
                # Sonraki noktayı öner
                next_point = self._suggest_next_point()
                
                # Parametreleri değerlendir
                objective_value = self._evaluate_parameters(next_point)
                
                # Sonuçları kaydet
                self.X_evaluated.append(next_point)
                self.y_evaluated.append(objective_value)
                
                # En iyi sonucu güncelle
                if objective_value > optimization_history.best_objective:
                    optimization_history.best_objective = objective_value
                    optimization_history.best_parameters = next_point.copy()
                
                optimization_history.total_evaluations += 1
                
                logger.info(f"📊 Best objective so far: {optimization_history.best_objective:.4f}")
            
            # Optimization time
            optimization_history.optimization_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"✅ Optimization completed: {optimization_history.best_objective:.4f}")
            logger.info(f"⏱️ Total time: {optimization_history.optimization_time:.2f}s")
            
            return optimization_history
            
        except Exception as e:
            logger.error(f"❌ Optimize error: {e}")
            return None
    
    def get_optimization_summary(self, optimization_id: str = None) -> Dict[str, Any]:
        """Optimizasyon özetini getir"""
        try:
            if optimization_id:
                history = next((h for h in self.optimization_history if h.optimization_id == optimization_id), None)
            else:
                history = self.optimization_history[-1] if self.optimization_history else None
            
            if not history:
                return {'error': 'Optimization not found'}
            
            # Objective values
            objective_values = [r.objective_value for r in history.results]
            
            summary = {
                'optimization_id': history.optimization_id,
                'model_type': history.model_type,
                'total_evaluations': history.total_evaluations,
                'best_objective': history.best_objective,
                'best_parameters': history.best_parameters,
                'optimization_time': history.optimization_time,
                'mean_objective': np.mean(objective_values),
                'std_objective': np.std(objective_values),
                'improvement': history.best_objective - min(objective_values) if objective_values else 0,
                'convergence': self._calculate_convergence(objective_values)
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Get optimization summary error: {e}")
            return {}
    
    def _calculate_convergence(self, objective_values: List[float]) -> float:
        """Convergence hesapla"""
        try:
            if len(objective_values) < 10:
                return 0.0
            
            # Son 10 değerin standart sapması
            recent_values = objective_values[-10:]
            convergence = 1.0 / (1.0 + np.std(recent_values))
            
            return convergence
            
        except Exception as e:
            logger.error(f"❌ Calculate convergence error: {e}")
            return 0.0
    
    def reset_optimization(self):
        """Optimizasyonu sıfırla"""
        try:
            self.X_evaluated = []
            self.y_evaluated = []
            self.gp_model = None
            
            logger.info("🔄 Optimization reset")
            
        except Exception as e:
            logger.error(f"❌ Reset optimization error: {e}")

class ProphetOptimizer:
    """Prophet model optimizasyonu"""
    
    def __init__(self):
        self.parameter_space = {
            'changepoint_prior_scale': ParameterSpace(
                name='changepoint_prior_scale',
                param_type='continuous',
                bounds=(0.001, 0.5),
                values=[],
                default_value=0.05
            ),
            'seasonality_prior_scale': ParameterSpace(
                name='seasonality_prior_scale',
                param_type='continuous',
                bounds=(0.01, 10.0),
                values=[],
                default_value=10.0
            ),
            'holidays_prior_scale': ParameterSpace(
                name='holidays_prior_scale',
                param_type='continuous',
                bounds=(0.01, 10.0),
                values=[],
                default_value=10.0
            ),
            'seasonality_mode': ParameterSpace(
                name='seasonality_mode',
                param_type='categorical',
                bounds=(),
                values=['additive', 'multiplicative'],
                default_value='multiplicative'
            )
        }
        
        self.bayesian_optimizer = None
    
    def create_objective_function(self, train_data: pd.DataFrame, test_data: pd.DataFrame) -> Callable:
        """Objective function oluştur"""
        def objective_function(parameters: Dict[str, Any]) -> float:
            try:
                if not PROPHET_AVAILABLE:
                    return 0.0
                
                # Prophet model oluştur
                model = Prophet(
                    changepoint_prior_scale=parameters['changepoint_prior_scale'],
                    seasonality_prior_scale=parameters['seasonality_prior_scale'],
                    holidays_prior_scale=parameters['holidays_prior_scale'],
                    seasonality_mode=parameters['seasonality_mode']
                )
                
                # Modeli eğit
                model.fit(train_data)
                
                # Tahmin yap
                future = model.make_future_dataframe(periods=len(test_data))
                forecast = model.predict(future)
                
                # Test verisi için tahminleri al
                test_forecast = forecast.tail(len(test_data))
                
                # RMSE hesapla
                rmse = np.sqrt(np.mean((test_data['y'] - test_forecast['yhat'])**2))
                
                # Objective: negative RMSE (minimize RMSE)
                return -rmse
                
            except Exception as e:
                logger.error(f"❌ Prophet objective function error: {e}")
                return -np.inf
        
        return objective_function
    
    def optimize_prophet(self, train_data: pd.DataFrame, test_data: pd.DataFrame) -> OptimizationHistory:
        """Prophet modelini optimize et"""
        try:
            # Objective function oluştur
            objective_function = self.create_objective_function(train_data, test_data)
            
            # Bayesian optimizer oluştur
            self.bayesian_optimizer = BayesianOptimizer(
                parameter_space=self.parameter_space,
                objective_function=objective_function,
                n_initial_points=5,
                n_iterations=20
            )
            
            # Optimizasyonu çalıştır
            optimization_history = self.bayesian_optimizer.optimize('prophet')
            
            logger.info(f"✅ Prophet optimization completed: {optimization_history.best_objective:.4f}")
            
            return optimization_history
            
        except Exception as e:
            logger.error(f"❌ Optimize Prophet error: {e}")
            return None

# Global instances
bayesian_optimizer = BayesianOptimizer({}, lambda x: 0.0)
prophet_optimizer = ProphetOptimizer()

if __name__ == "__main__":
    async def test_bayesian_optimizer():
        """Test fonksiyonu"""
        logger.info("🧪 Testing Bayesian Optimizer...")
        
        # Test parametre uzayı
        parameter_space = {
            'param1': ParameterSpace(
                name='param1',
                param_type='continuous',
                bounds=(0.0, 1.0),
                values=[],
                default_value=0.5
            ),
            'param2': ParameterSpace(
                name='param2',
                param_type='discrete',
                bounds=(),
                values=[1, 2, 3, 4, 5],
                default_value=3
            )
        }
        
        # Test objective function
        def test_objective(params):
            return -(params['param1'] - 0.7)**2 - (params['param2'] - 3)**2
        
        # Bayesian optimizer oluştur
        optimizer = BayesianOptimizer(
            parameter_space=parameter_space,
            objective_function=test_objective,
            n_initial_points=5,
            n_iterations=10
        )
        
        # Optimizasyonu çalıştır
        history = optimizer.optimize('test')
        
        if history:
            logger.info(f"✅ Optimization completed: {history.best_objective:.4f}")
            logger.info(f"📊 Best parameters: {history.best_parameters}")
            
            # Özet getir
            summary = optimizer.get_optimization_summary()
            logger.info(f"📈 Summary: {summary}")
        
        logger.info("✅ Bayesian Optimizer test completed")
    
    # Test çalıştır
    asyncio.run(test_bayesian_optimizer())
