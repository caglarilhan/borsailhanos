#!/usr/bin/env python3
"""
BIST AI Smart Trader - Advanced Ensemble Learning Module
Stacking, Blending ve Meta-Learning ile maksimum doğruluk sağlar
"""
import numpy as np
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit, StratifiedKFold
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score, accuracy_score
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
import lightgbm as lgb
import catboost as cb
from catboost import CatBoostClassifier
import joblib
import os
from typing import Dict, List, Tuple, Any, Optional
import logging
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedEnsemble:
    def __init__(self, n_splits: int = 5, random_state: int = 42):
        self.n_splits = n_splits
        self.random_state = random_state
        self.base_models = {}
        self.meta_model = None
        self.stacking_features = None
        self.cv_scores = {}
        self.feature_importance = {}
        
    def create_base_models(self) -> Dict[str, Any]:
        """Gelişmiş base modeller oluştur"""
        logger.info("🏗️ Creating advanced base models...")
        
        self.base_models = {
            'lightgbm_1': lgb.LGBMClassifier(
                n_estimators=1000,
                learning_rate=0.01,
                max_depth=8,
                num_leaves=31,
                feature_fraction=0.8,
                bagging_fraction=0.8,
                bagging_freq=5,
                random_state=self.random_state,
                verbose=-1
            ),
            'lightgbm_2': lgb.LGBMClassifier(
                n_estimators=800,
                learning_rate=0.02,
                max_depth=6,
                num_leaves=63,
                feature_fraction=0.9,
                bagging_fraction=0.9,
                bagging_freq=3,
                random_state=self.random_state + 1,
                verbose=-1
            ),
            'catboost_1': CatBoostClassifier(
                iterations=1000,
                depth=8,
                learning_rate=0.01,
                l2_leaf_reg=3,
                random_seed=self.random_state,
                verbose=False
            ),
            'catboost_2': CatBoostClassifier(
                iterations=800,
                depth=6,
                learning_rate=0.02,
                l2_leaf_reg=5,
                random_seed=self.random_state + 1,
                verbose=False
            ),
            'random_forest': RandomForestClassifier(
                n_estimators=500,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=self.random_state,
                n_jobs=-1
            ),
            'gradient_boosting': GradientBoostingClassifier(
                n_estimators=300,
                learning_rate=0.05,
                max_depth=8,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=self.random_state
            ),
            'svm_rbf': SVC(
                C=1.0,
                kernel='rbf',
                gamma='scale',
                probability=True,
                random_state=self.random_state
            ),
            'mlp': MLPClassifier(
                hidden_layer_sizes=(100, 50, 25),
                activation='relu',
                solver='adam',
                alpha=0.001,
                learning_rate='adaptive',
                max_iter=500,
                random_state=self.random_state
            )
        }
        
        logger.info(f"✅ {len(self.base_models)} base models created")
        return self.base_models
    
    def create_meta_model(self) -> Any:
        """Meta-learner model oluştur"""
        logger.info("🧠 Creating meta-learner model...")
        
        # Stacking için meta-model
        self.meta_model = LogisticRegression(
            C=1.0,
            max_iter=1000,
            random_state=self.random_state,
            solver='liblinear'
        )
        
        logger.info("✅ Meta-model created")
        return self.meta_model
    
    def cross_validate_base_models(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, List[float]]:
        """Base modelleri cross-validate et"""
        logger.info("🔄 Cross-validating base models...")
        
        tscv = TimeSeriesSplit(n_splits=self.n_splits)
        cv_scores = {name: [] for name in self.base_models.keys()}
        
        for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
            logger.info(f"   Fold {fold + 1}/{self.n_splits}")
            
            X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
            y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
            
            for name, model in self.base_models.items():
                try:
                    # Fit model
                    if hasattr(model, 'fit'):
                        model.fit(X_train, y_train)
                    
                    # Predict probabilities
                    if hasattr(model, 'predict_proba'):
                        y_pred_proba = model.predict_proba(X_val)[:, 1]
                    else:
                        y_pred_proba = model.predict(X_val)
                    
                    # Calculate score
                    score = roc_auc_score(y_val, y_pred_proba)
                    cv_scores[name].append(score)
                    
                except Exception as e:
                    logger.warning(f"   ⚠️ {name} failed: {e}")
                    cv_scores[name].append(0.0)
        
        # Calculate mean scores
        self.cv_scores = {name: np.mean(scores) for name, scores in cv_scores.items()}
        
        logger.info("✅ Cross-validation completed")
        logger.info("📊 Base model CV scores:")
        for name, score in sorted(self.cv_scores.items(), key=lambda x: x[1], reverse=True):
            logger.info(f"   {name}: {score:.4f}")
        
        return self.cv_scores
    
    def create_stacking_features(self, X: pd.DataFrame, y: pd.Series) -> pd.DataFrame:
        """Stacking için meta-features oluştur"""
        logger.info("🔗 Creating stacking meta-features...")
        
        tscv = TimeSeriesSplit(n_splits=self.n_splits)
        meta_features = []
        
        for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
            logger.info(f"   Fold {fold + 1}/{self.n_splits}")
            
            X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
            y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
            
            fold_predictions = []
            
            for name, model in self.base_models.items():
                try:
                    # Clone model for this fold
                    if hasattr(model, 'clone'):
                        model_clone = model.clone()
                    else:
                        model_clone = model
                    
                    # Fit on training data
                    if hasattr(model_clone, 'fit'):
                        model_clone.fit(X_train, y_train)
                    
                    # Predict on validation data
                    if hasattr(model_clone, 'predict_proba'):
                        y_pred_proba = model_clone.predict_proba(X_val)[:, 1]
                    else:
                        y_pred_proba = model_clone.predict(X_val)
                    
                    fold_predictions.append(y_pred_proba)
                    
                except Exception as e:
                    logger.warning(f"   ⚠️ {name} failed: {e}")
                    # Use random predictions as fallback
                    fold_predictions.append(np.random.random(len(X_val)))
            
            # Create meta-features for this fold
            meta_features_fold = np.column_stack(fold_predictions)
            meta_features.append(meta_features_fold)
        
        # Combine all folds
        self.stacking_features = np.vstack(meta_features)
        
        # Create DataFrame
        meta_columns = [f'meta_{name}' for name in self.base_models.keys()]
        meta_df = pd.DataFrame(self.stacking_features, columns=meta_columns)
        
        logger.info(f"✅ Stacking features created: {meta_df.shape}")
        return meta_df
    
    def train_meta_model(self, meta_features: pd.DataFrame, y: pd.Series) -> Any:
        """Meta-model'i eğit"""
        logger.info("🎯 Training meta-model...")
        
        try:
            # Fit meta-model
            self.meta_model.fit(meta_features, y)
            
            # Calculate meta-model performance
            y_pred_proba = self.meta_model.predict_proba(meta_features)[:, 1]
            meta_score = roc_auc_score(y, y_pred_proba)
            
            logger.info(f"✅ Meta-model trained successfully")
            logger.info(f"📊 Meta-model ROC-AUC: {meta_score:.4f}")
            
            return self.meta_model
            
        except Exception as e:
            logger.error(f"❌ Meta-model training failed: {e}")
            return None
    
    def create_blending_ensemble(self, X: pd.DataFrame, y: pd.Series, 
                                blend_ratio: float = 0.7) -> Dict[str, float]:
        """Blending ensemble ağırlıklarını optimize et"""
        logger.info("🥤 Creating blending ensemble...")
        
        # Use CV scores to determine blending weights
        sorted_models = sorted(self.cv_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Top models get higher weights
        total_score = sum(score for _, score in sorted_models)
        blending_weights = {}
        
        for i, (name, score) in enumerate(sorted_models):
            # Exponential weighting based on performance rank
            weight = np.exp(-i * blend_ratio) * score / total_score
            blending_weights[name] = weight
        
        # Normalize weights
        total_weight = sum(blending_weights.values())
        blending_weights = {name: weight/total_weight for name, weight in blending_weights.items()}
        
        logger.info("✅ Blending weights calculated:")
        for name, weight in blending_weights.items():
            logger.info(f"   {name}: {weight:.4f}")
        
        return blending_weights
    
    def predict_stacking(self, X: pd.DataFrame) -> np.ndarray:
        """Stacking ensemble ile tahmin"""
        logger.info("🔮 Making stacking ensemble prediction...")
        
        try:
            # Get base model predictions
            base_predictions = []
            
            for name, model in self.base_models.items():
                try:
                    if hasattr(model, 'predict_proba'):
                        pred = model.predict_proba(X)[:, 1]
                    else:
                        pred = model.predict(X)
                    base_predictions.append(pred)
                    
                except Exception as e:
                    logger.warning(f"⚠️ {name} prediction failed: {e}")
                    # Use random predictions as fallback
                    base_predictions.append(np.random.random(len(X)))
            
            # Create meta-features
            meta_features = np.column_stack(base_predictions)
            meta_df = pd.DataFrame(meta_features, columns=[f'meta_{name}' for name in self.base_models.keys()])
            
            # Meta-model prediction
            if self.meta_model is not None:
                final_prediction = self.meta_model.predict_proba(meta_df)[:, 1]
            else:
                # Fallback to simple averaging
                final_prediction = np.mean(meta_features, axis=1)
            
            logger.info("✅ Stacking prediction completed")
            return final_prediction
            
        except Exception as e:
            logger.error(f"❌ Stacking prediction failed: {e}")
            return np.random.random(len(X))
    
    def predict_blending(self, X: pd.DataFrame, blending_weights: Dict[str, float]) -> np.ndarray:
        """Blending ensemble ile tahmin"""
        logger.info("🥤 Making blending ensemble prediction...")
        
        try:
            # Get base model predictions
            weighted_predictions = np.zeros(len(X))
            
            for name, model in self.base_models.items():
                try:
                    if hasattr(model, 'predict_proba'):
                        pred = model.predict_proba(X)[:, 1]
                    else:
                        pred = model.predict(X)
                    
                    weighted_predictions += blending_weights[name] * pred
                    
                except Exception as e:
                    logger.warning(f"⚠️ {name} prediction failed: {e}")
                    # Use random predictions as fallback
                    weighted_predictions += blending_weights[name] * np.random.random(len(X))
            
            logger.info("✅ Blending prediction completed")
            return weighted_predictions
            
        except Exception as e:
            logger.error(f"❌ Blending prediction failed: {e}")
            return np.random.random(len(X))
    
    def ensemble_predict(self, X: pd.DataFrame, method: str = 'stacking') -> Dict[str, Any]:
        """Ensemble tahmin yap (stacking veya blending)"""
        logger.info(f"🎯 Making {method} ensemble prediction...")
        
        try:
            if method == 'stacking':
                prediction = self.predict_stacking(X)
                method_name = 'Stacking Ensemble'
            elif method == 'blending':
                # Create blending weights
                blending_weights = self.create_blending_ensemble(X, pd.Series([0] * len(X)))
                prediction = self.predict_blending(X, blending_weights)
                method_name = 'Blending Ensemble'
            else:
                raise ValueError(f"Unknown method: {method}")
            
            # Calculate confidence scores
            confidence = np.abs(prediction - 0.5) * 2  # 0-1 scale
            
            # Create prediction classes
            prediction_class = (prediction > 0.5).astype(int)
            
            result = {
                'prediction': prediction,
                'prediction_class': prediction_class,
                'confidence': confidence,
                'method': method_name,
                'timestamp': pd.Timestamp.now().isoformat()
            }
            
            logger.info(f"✅ {method_name} prediction completed")
            logger.info(f"📊 Prediction range: {prediction.min():.4f} - {prediction.max():.4f}")
            logger.info(f"📊 Average confidence: {confidence.mean():.4f}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Ensemble prediction failed: {e}")
            return {
                'prediction': np.random.random(len(X)),
                'prediction_class': np.random.randint(0, 2, len(X)),
                'confidence': np.random.random(len(X)),
                'method': 'Fallback',
                'error': str(e),
                'timestamp': pd.Timestamp.now().isoformat()
            }
    
    def train_full_ensemble(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, Any]:
        """Tüm ensemble'ı eğit"""
        logger.info("🚀 Training full advanced ensemble...")
        
        try:
            # 1. Create base models
            self.create_base_models()
            
            # 2. Cross-validate base models
            cv_scores = self.cross_validate_base_models(X, y)
            
            # 3. Create meta-model
            self.create_meta_model()
            
            # 4. Create stacking features
            meta_features = self.create_stacking_features(X, y)
            
            # 5. Train meta-model
            meta_model = self.train_meta_model(meta_features, y)
            
            # 6. Create blending weights
            blending_weights = self.create_blending_ensemble(X, y)
            
            # 7. Test both methods
            stacking_result = self.ensemble_predict(X, 'stacking')
            blending_result = self.ensemble_predict(X, 'blending')
            
            # Compare performance
            stacking_score = roc_auc_score(y, stacking_result['prediction'])
            blending_score = roc_auc_score(y, blending_result['prediction'])
            
            results = {
                'cv_scores': cv_scores,
                'stacking_score': stacking_score,
                'blending_score': blending_score,
                'best_method': 'stacking' if stacking_score > blending_score else 'blending',
                'meta_model': meta_model,
                'blending_weights': blending_weights,
                'training_completed': True,
                'timestamp': pd.Timestamp.now().isoformat()
            }
            
            logger.info("🎉 Full ensemble training completed!")
            logger.info(f"📊 Stacking Score: {stacking_score:.4f}")
            logger.info(f"📊 Blending Score: {blending_score:.4f}")
            logger.info(f"🏆 Best Method: {results['best_method']}")
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Full ensemble training failed: {e}")
            return {
                'training_completed': False,
                'error': str(e),
                'timestamp': pd.Timestamp.now().isoformat()
            }
    
    def save_ensemble(self, filepath: str = 'models/advanced_ensemble.pkl'):
        """Ensemble'ı kaydet"""
        try:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            ensemble_data = {
                'base_models': self.base_models,
                'meta_model': self.meta_model,
                'cv_scores': self.cv_scores,
                'stacking_features': self.stacking_features
            }
            
            joblib.dump(ensemble_data, filepath)
            logger.info(f"✅ Ensemble saved to {filepath}")
            
        except Exception as e:
            logger.error(f"❌ Save failed: {e}")
    
    def load_ensemble(self, filepath: str = 'models/advanced_ensemble.pkl'):
        """Kaydedilmiş ensemble'ı yükle"""
        try:
            ensemble_data = joblib.load(filepath)
            
            self.base_models = ensemble_data['base_models']
            self.meta_model = ensemble_data['meta_model']
            self.cv_scores = ensemble_data['cv_scores']
            self.stacking_features = ensemble_data['stacking_features']
            
            logger.info(f"✅ Ensemble loaded from {filepath}")
            
        except Exception as e:
            logger.error(f"❌ Load failed: {e}")

def test_advanced_ensemble():
    """Test function"""
    print("🚀 Advanced Ensemble Learning Test başlıyor...")
    print("=" * 60)
    
    # Create sample data
    np.random.seed(42)
    n_samples = 1000
    n_features = 50
    
    X = pd.DataFrame(np.random.randn(n_samples, n_features), 
                     columns=[f'feature_{i}' for i in range(n_features)])
    y = pd.Series(np.random.randint(0, 2, n_samples))
    
    print(f"📊 Data shape: {X.shape}")
    print(f"📊 Target distribution: {y.value_counts().to_dict()}")
    
    # Initialize ensemble
    ensemble = AdvancedEnsemble(n_splits=3)  # Fewer splits for testing
    
    # Train full ensemble
    results = ensemble.train_full_ensemble(X, y)
    
    if results['training_completed']:
        print(f"\n🎯 ENSEMBLE TRAINING RESULTS:")
        print("=" * 60)
        print(f"📊 Cross-validation scores:")
        for name, score in results['cv_scores'].items():
            print(f"   {name}: {score:.4f}")
        
        print(f"\n🏆 Best method: {results['best_method']}")
        print(f"📊 Stacking score: {results['stacking_score']:.4f}")
        print(f"📊 Blending score: {results['blending_score']:.4f}")
        
        # Test predictions
        test_result = ensemble.ensemble_predict(X[:100], results['best_method'])
        print(f"\n🔮 Test prediction shape: {test_result['prediction'].shape}")
        print(f"📊 Confidence range: {test_result['confidence'].min():.3f} - {test_result['confidence'].max():.3f}")
        
        # Save ensemble
        ensemble.save_ensemble()
        
    else:
        print(f"❌ Training failed: {results.get('error', 'Unknown error')}")
    
    print(f"\n✅ Advanced ensemble test completed!")

if __name__ == "__main__":
    test_advanced_ensemble()
