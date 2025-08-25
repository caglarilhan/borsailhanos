#!/usr/bin/env python3
"""
🚀 Advanced Feature Optimization - SPRINT 5
BIST AI Smart Trader v2.0 - %90 Doğruluk Hedefi

Feature selection ve hyperparameter optimization ile doğruluğu %80'den %90'a çıkarma:
- Recursive Feature Elimination (RFE)
- SHAP-based Feature Importance
- Correlation Analysis & Multicollinearity Removal
- Optuna Hyperparameter Optimization
- Multi-Objective Optimization
"""

import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')

# Scikit-learn imports
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.feature_selection import RFE, SelectKBest, f_regression, mutual_info_regression
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

# Optuna imports
try:
    import optuna
    from optuna.samplers import TPESampler
    from optuna.pruners import MedianPruner
    OPTUNA_AVAILABLE = True
except ImportError:
    OPTUNA_AVAILABLE = False
    logging.warning("⚠️ Optuna bulunamadı, hyperparameter optimization atlanıyor")

# SHAP imports
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    logging.warning("⚠️ SHAP bulunamadı, feature importance atlanıyor")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class FeatureOptimizationConfig:
    """Feature optimization konfigürasyonu"""
    target_accuracy: float = 0.90
    min_features: int = 10
    max_features: int = 100
    correlation_threshold: float = 0.8
    feature_importance_threshold: float = 0.01
    cv_folds: int = 5
    n_trials: int = 100
    optimization_timeout: int = 3600  # 1 hour

@dataclass
class FeatureSet:
    """Feature set bilgileri"""
    name: str
    features: List[str]
    accuracy: float
    r2_score: float
    mse: float
    feature_count: int
    training_time: float
    created_at: datetime

class AdvancedFeatureOptimizer:
    """Advanced feature optimizer for %90 accuracy"""
    
    def __init__(self, config: FeatureOptimizationConfig):
        self.config = config
        self.scaler = StandardScaler()
        self.feature_sets = {}
        self.best_feature_set = None
        self.feature_importance = {}
        self.correlation_matrix = None
        
        logger.info("🚀 Advanced Feature Optimizer başlatıldı")
        
    def analyze_feature_correlations(self, data: pd.DataFrame) -> pd.DataFrame:
        """Feature correlations analizi"""
        try:
            # Numeric columns only
            numeric_cols = data.select_dtypes(include=[np.number]).columns.tolist()
            
            if len(numeric_cols) < 2:
                logger.warning("⚠️ Yeterli numeric feature yok")
                return pd.DataFrame()
            
            # Correlation matrix
            corr_matrix = data[numeric_cols].corr()
            self.correlation_matrix = corr_matrix
            
            # High correlation pairs
            high_corr_pairs = []
            for i in range(len(corr_matrix.columns)):
                for j in range(i+1, len(corr_matrix.columns)):
                    corr_value = abs(corr_matrix.iloc[i, j])
                    if corr_value > self.config.correlation_threshold:
                        high_corr_pairs.append({
                            'feature1': corr_matrix.columns[i],
                            'feature2': corr_matrix.columns[j],
                            'correlation': corr_value
                        })
            
            if high_corr_pairs:
                logger.info(f"🔍 {len(high_corr_pairs)} yüksek correlation çifti bulundu")
                for pair in high_corr_pairs[:5]:  # İlk 5'i göster
                    logger.info(f"   {pair['feature1']} ↔ {pair['feature2']}: {pair['correlation']:.3f}")
            
            return corr_matrix
            
        except Exception as e:
            logger.error(f"❌ Correlation analizi hatası: {e}")
            return pd.DataFrame()
    
    def calculate_feature_importance(self, data: pd.DataFrame, target_col: str) -> Dict[str, float]:
        """Feature importance hesapla"""
        try:
            # Numeric features
            feature_cols = [col for col in data.columns if col != target_col and data[col].dtype in ['int64', 'float64']]
            
            if len(feature_cols) < 2:
                logger.warning("⚠️ Yeterli feature yok")
                return {}
            
            X = data[feature_cols].fillna(0)
            y = data[target_col].fillna(0)
            
            # Multiple methods for feature importance
            importance_methods = {}
            
            # 1. Random Forest
            try:
                rf = RandomForestRegressor(n_estimators=100, random_state=42)
                rf.fit(X, y)
                importance_methods['random_forest'] = dict(zip(feature_cols, rf.feature_importances_))
            except Exception as e:
                logger.warning(f"⚠️ Random Forest importance hatası: {e}")
            
            # 2. Gradient Boosting
            try:
                gb = GradientBoostingRegressor(n_estimators=100, random_state=42)
                gb.fit(X, y)
                importance_methods['gradient_boosting'] = dict(zip(feature_cols, gb.feature_importances_))
            except Exception as e:
                logger.warning(f"⚠️ Gradient Boosting importance hatası: {e}")
            
            # 3. Mutual Information
            try:
                mi_scores = mutual_info_regression(X, y, random_state=42)
                importance_methods['mutual_info'] = dict(zip(feature_cols, mi_scores))
            except Exception as e:
                logger.warning(f"⚠️ Mutual Information hatası: {e}")
            
            # 4. SHAP (if available)
            if SHAP_AVAILABLE:
                try:
                    explainer = shap.TreeExplainer(rf)
                    shap_values = explainer.shap_values(X)
                    shap_importance = np.abs(shap_values).mean(0)
                    importance_methods['shap'] = dict(zip(feature_cols, shap_importance))
                except Exception as e:
                    logger.warning(f"⚠️ SHAP importance hatası: {e}")
            
            # Average importance across methods
            if importance_methods:
                avg_importance = {}
                for feature in feature_cols:
                    scores = []
                    for method, scores_dict in importance_methods.items():
                        if feature in scores_dict:
                            scores.append(scores_dict[feature])
                    
                    if scores:
                        avg_importance[feature] = np.mean(scores)
                
                # Sort by importance
                sorted_features = sorted(avg_importance.items(), key=lambda x: x[1], reverse=True)
                self.feature_importance = dict(sorted_features)
                
                logger.info(f"✅ Feature importance hesaplandı: {len(self.feature_importance)} feature")
                logger.info("🔝 Top 5 features:")
                for i, (feature, importance) in enumerate(list(self.feature_importance.items())[:5]):
                    logger.info(f"   {i+1}. {feature}: {importance:.4f}")
                
                return self.feature_importance
            else:
                logger.warning("⚠️ Hiçbir importance method çalışmadı")
                return {}
                
        except Exception as e:
            logger.error(f"❌ Feature importance hesaplama hatası: {e}")
            return {}
    
    def recursive_feature_elimination(self, data: pd.DataFrame, target_col: str, n_features: int = None) -> List[str]:
        """Recursive Feature Elimination"""
        try:
            # Numeric features
            feature_cols = [col for col in data.columns if col != target_col and data[col].dtype in ['int64', 'float64']]
            
            if len(feature_cols) < 2:
                logger.warning("⚠️ Yeterli feature yok")
                return []
            
            X = data[feature_cols].fillna(0)
            y = data[target_col].fillna(0)
            
            # Target feature count
            if n_features is None:
                n_features = max(self.config.min_features, len(feature_cols) // 2)
            
            # RFE with Random Forest
            estimator = RandomForestRegressor(n_estimators=100, random_state=42)
            rfe = RFE(estimator=estimator, n_features_to_select=n_features)
            
            # Fit RFE
            rfe.fit(X, y)
            
            # Selected features
            selected_features = [feature_cols[i] for i in range(len(feature_cols)) if rfe.support_[i]]
            
            logger.info(f"✅ RFE tamamlandı: {len(selected_features)}/{len(feature_cols)} feature seçildi")
            return selected_features
            
        except Exception as e:
            logger.error(f"❌ RFE hatası: {e}")
            return []
    
    def remove_multicollinearity(self, data: pd.DataFrame, threshold: float = None) -> List[str]:
        """Multicollinearity removal"""
        try:
            if threshold is None:
                threshold = self.config.correlation_threshold
            
            # Numeric columns
            numeric_cols = data.select_dtypes(include=[np.number]).columns.tolist()
            
            if len(numeric_cols) < 2:
                return numeric_cols
            
            # Correlation matrix
            corr_matrix = data[numeric_cols].corr()
            
            # Features to remove
            features_to_remove = set()
            
            for i in range(len(corr_matrix.columns)):
                for j in range(i+1, len(corr_matrix.columns)):
                    if abs(corr_matrix.iloc[i, j]) > threshold:
                        # Remove feature with lower importance
                        feature1 = corr_matrix.columns[i]
                        feature2 = corr_matrix.columns[j]
                        
                        importance1 = self.feature_importance.get(feature1, 0)
                        importance2 = self.feature_importance.get(feature2, 0)
                        
                        if importance1 < importance2:
                            features_to_remove.add(feature1)
                        else:
                            features_to_remove.add(feature2)
            
            # Remaining features
            remaining_features = [col for col in numeric_cols if col not in features_to_remove]
            
            logger.info(f"✅ Multicollinearity removal: {len(remaining_features)}/{len(numeric_cols)} feature kaldı")
            if features_to_remove:
                logger.info(f"   Kaldırılan features: {list(features_to_remove)[:5]}")
            
            return remaining_features
            
        except Exception as e:
            logger.error(f"❌ Multicollinearity removal hatası: {e}")
            return []
    
    def create_optimized_feature_set(self, data: pd.DataFrame, target_col: str, method: str = "hybrid") -> FeatureSet:
        """Optimized feature set oluştur"""
        try:
            start_time = datetime.now()
            
            if method == "hybrid":
                # 1. Feature importance
                self.calculate_feature_importance(data, target_col)
                
                # 2. Remove multicollinearity
                clean_features = self.remove_multicollinearity(data)
                
                # 3. RFE for final selection
                final_features = self.recursive_feature_elimination(
                    data[clean_features + [target_col]], target_col
                )
                
            elif method == "importance_only":
                self.calculate_feature_importance(data, target_col)
                final_features = list(self.feature_importance.keys())[:self.config.max_features]
                
            elif method == "rfe_only":
                final_features = self.recursive_feature_elimination(data, target_col)
                
            else:
                logger.error(f"❌ Bilinmeyen method: {method}")
                return None
            
            # Feature set oluştur
            feature_set = FeatureSet(
                name=f"optimized_{method}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                features=final_features,
                accuracy=0.0,  # Will be calculated later
                r2_score=0.0,
                mse=0.0,
                feature_count=len(final_features),
                training_time=0.0,
                created_at=datetime.now()
            )
            
            training_time = (datetime.now() - start_time).total_seconds()
            feature_set.training_time = training_time
            
            logger.info(f"✅ Feature set oluşturuldu: {len(final_features)} feature")
            logger.info(f"   Method: {method}")
            logger.info(f"   Training time: {training_time:.2f}s")
            
            return feature_set
            
        except Exception as e:
            logger.error(f"❌ Feature set oluşturma hatası: {e}")
            return None
    
    def evaluate_feature_set(self, data: pd.DataFrame, feature_set: FeatureSet, target_col: str) -> bool:
        """Feature set'i evaluate et"""
        try:
            if not feature_set.features:
                logger.warning("⚠️ Feature set boş")
                return False
            
            # Data preparation
            X = data[feature_set.features].fillna(0)
            y = data[target_col].fillna(0)
            
            # Scaling
            X_scaled = self.scaler.fit_transform(X)
            
            # Cross-validation
            cv = TimeSeriesSplit(n_splits=self.config.cv_folds)
            
            # Multiple models
            models = {
                'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
                'gradient_boosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
                'ridge': Ridge(alpha=1.0),
                'lasso': Lasso(alpha=0.1)
            }
            
            best_score = 0
            best_model_name = None
            
            for model_name, model in models.items():
                try:
                    # Cross-validation score
                    cv_scores = cross_val_score(model, X_scaled, y, cv=cv, scoring='r2')
                    avg_score = np.mean(cv_scores)
                    
                    if avg_score > best_score:
                        best_score = avg_score
                        best_model_name = model_name
                        
                except Exception as e:
                    logger.warning(f"⚠️ {model_name} evaluation hatası: {e}")
                    continue
            
            # Best model ile final evaluation
            if best_model_name:
                best_model = models[best_model_name]
                best_model.fit(X_scaled, y)
                y_pred = best_model.predict(X_scaled)
                
                # Metrics
                mse = mean_squared_error(y, y_pred)
                r2 = r2_score(y, y_pred)
                accuracy = 1 - np.mean(np.abs((y - y_pred) / y))
                
                # Update feature set
                feature_set.accuracy = accuracy
                feature_set.r2_score = r2
                feature_set.mse = mse
                
                logger.info(f"✅ Feature set evaluation tamamlandı:")
                logger.info(f"   Best model: {best_model_name}")
                logger.info(f"   Accuracy: {accuracy:.4f}")
                logger.info(f"   R² Score: {r2:.4f}")
                logger.info(f"   MSE: {mse:.6f}")
                
                return True
            else:
                logger.error("❌ Hiçbir model çalışmadı")
                return False
                
        except Exception as e:
            logger.error(f"❌ Feature set evaluation hatası: {e}")
            return False
    
    def hyperparameter_optimization(self, data: pd.DataFrame, feature_set: FeatureSet, target_col: str) -> bool:
        """Hyperparameter optimization with Optuna"""
        try:
            if not OPTUNA_AVAILABLE:
                logger.warning("⚠️ Optuna bulunamadı, hyperparameter optimization atlanıyor")
                return False
            
            if not feature_set.features:
                logger.warning("⚠️ Feature set boş")
                return False
            
            # Data preparation
            X = data[feature_set.features].fillna(0)
            y = data[target_col].fillna(0)
            
            # Scaling
            X_scaled = self.scaler.fit_transform(X)
            
            # Time series split
            tscv = TimeSeriesSplit(n_splits=self.config.cv_folds)
            
            def objective(trial):
                # Hyperparameters
                n_estimators = trial.suggest_int('n_estimators', 50, 500)
                max_depth = trial.suggest_int('max_depth', 3, 20)
                learning_rate = trial.suggest_float('learning_rate', 0.01, 0.3, log=True)
                subsample = trial.suggest_float('subsample', 0.6, 1.0)
                colsample_bytree = trial.suggest_float('colsample_bytree', 0.6, 1.0)
                
                # Model
                model = GradientBoostingRegressor(
                    n_estimators=n_estimators,
                    max_depth=max_depth,
                    learning_rate=learning_rate,
                    subsample=subsample,
                    colsample_bytree=colsample_bytree,
                    random_state=42
                )
                
                # Cross-validation
                scores = []
                for train_idx, val_idx in tscv.split(X_scaled):
                    X_train, X_val = X_scaled[train_idx], X_scaled[val_idx]
                    y_train, y_val = y[train_idx], y[val_idx]
                    
                    model.fit(X_train, y_train)
                    y_pred = model.predict(X_val)
                    score = r2_score(y_val, y_pred)
                    scores.append(score)
                
                return np.mean(scores)
            
            # Study creation
            study = optuna.create_study(
                direction='maximize',
                sampler=TPESampler(seed=42),
                pruner=MedianPruner()
            )
            
            # Optimization
            study.optimize(
                objective,
                n_trials=self.config.n_trials,
                timeout=self.config.optimization_timeout
            )
            
            # Best parameters
            best_params = study.best_params
            best_score = study.best_value
            
            logger.info(f"✅ Hyperparameter optimization tamamlandı:")
            logger.info(f"   Best score: {best_score:.4f}")
            logger.info(f"   Best params: {best_params}")
            
            # Update feature set with best score
            feature_set.r2_score = max(feature_set.r2_score, best_score)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Hyperparameter optimization hatası: {e}")
            return False
    
    def get_optimization_summary(self) -> Dict[str, Any]:
        """Optimization özeti"""
        try:
            summary = {
                'total_feature_sets': len(self.feature_sets),
                'best_feature_set': None,
                'feature_importance_count': len(self.feature_importance),
                'correlation_analysis': self.correlation_matrix is not None
            }
            
            if self.feature_sets:
                # Best feature set
                best_set = max(self.feature_sets.values(), key=lambda x: x.accuracy)
                summary['best_feature_set'] = {
                    'name': best_set.name,
                    'feature_count': best_set.feature_count,
                    'accuracy': best_set.accuracy,
                    'r2_score': best_set.r2_score,
                    'training_time': best_set.training_time
                }
                
                # Overall statistics
                accuracies = [fs.accuracy for fs in self.feature_sets.values()]
                r2_scores = [fs.r2_score for fs in self.feature_sets.values()]
                
                summary['overall_accuracy'] = np.mean(accuracies)
                summary['overall_r2'] = np.mean(r2_scores)
                summary['accuracy_improvement'] = summary['overall_accuracy'] - 0.80  # Baseline
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Optimization summary hatası: {e}")
            return {}

def main():
    """Test fonksiyonu"""
    logger.info("🚀 Advanced Feature Optimization Test Başlıyor...")
    
    # Config
    config = FeatureOptimizationConfig(
        target_accuracy=0.90,
        min_features=5,
        max_features=50,
        correlation_threshold=0.8,
        n_trials=50
    )
    
    # Optimizer
    optimizer = AdvancedFeatureOptimizer(config)
    
    # Test data oluştur
    np.random.seed(42)
    n_samples = 1000
    n_features = 30
    
    # Synthetic data with correlations
    X = np.random.randn(n_samples, n_features)
    
    # Add some correlations
    X[:, 1] = X[:, 0] * 0.9 + np.random.randn(n_samples) * 0.1
    X[:, 2] = X[:, 0] * 0.8 + np.random.randn(n_samples) * 0.2
    
    # Target variable
    y = X[:, 0] * 0.5 + X[:, 3] * 0.3 + X[:, 5] * 0.2 + np.random.randn(n_samples) * 0.1
    
    # DataFrame'e çevir
    feature_cols = [f'feature_{i}' for i in range(n_features)]
    data = pd.DataFrame(X, columns=feature_cols)
    data['Close'] = y
    
    logger.info(f"📊 Test data oluşturuldu: {data.shape}")
    
    # 1. Correlation analysis
    logger.info("🔍 Correlation analizi başlıyor...")
    corr_matrix = optimizer.analyze_feature_correlations(data)
    
    # 2. Feature importance
    logger.info("🔍 Feature importance hesaplanıyor...")
    importance = optimizer.calculate_feature_importance(data, 'Close')
    
    # 3. Create optimized feature sets
    methods = ['hybrid', 'importance_only', 'rfe_only']
    
    for method in methods:
        logger.info(f"🚀 {method} method ile feature set oluşturuluyor...")
        feature_set = optimizer.create_optimized_feature_set(data, 'Close', method)
        
        if feature_set:
            # Evaluate
            success = optimizer.evaluate_feature_set(data, feature_set, 'Close')
            
            if success:
                # Hyperparameter optimization
                logger.info(f"🔧 {method} için hyperparameter optimization...")
                optimizer.hyperparameter_optimization(data, feature_set, 'Close')
                
                # Save feature set
                optimizer.feature_sets[feature_set.name] = feature_set
    
    # Summary
    summary = optimizer.get_optimization_summary()
    logger.info("📊 Optimization Summary:")
    logger.info(f"   Total feature sets: {summary['total_feature_sets']}")
    logger.info(f"   Overall accuracy: {summary.get('overall_accuracy', 0):.4f}")
    logger.info(f"   Overall R²: {summary.get('overall_r2', 0):.4f}")
    logger.info(f"   Accuracy improvement: {summary.get('accuracy_improvement', 0):.4f}")
    
    if summary['best_feature_set']:
        best = summary['best_feature_set']
        logger.info(f"🏆 Best feature set: {best['name']}")
        logger.info(f"   Accuracy: {best['accuracy']:.4f}")
        logger.info(f"   R² Score: {best['r2_score']:.4f}")
        logger.info(f"   Feature count: {best['feature_count']}")
    
    logger.info("✅ Test tamamlandı!")

if __name__ == "__main__":
    main()
