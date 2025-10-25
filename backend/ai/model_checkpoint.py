#!/usr/bin/env python3
"""
BIST AI Smart Trader - Model Checkpoint & Versioning System
Advanced model management with versioning, metrics tracking, and rollback capability
"""

import os
import json
import shutil
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import hashlib

# Import advanced logger (with fallback)
try:
    from utils.advanced_logger import ai_logger
except ImportError:
    import logging
    ai_logger = logging.getLogger(__name__)

class ModelCheckpointManager:
    def __init__(self, base_path: str = "./ai/models"):
        self.base_path = Path(base_path)
        self.checkpoints_path = self.base_path / "checkpoints"
        self.metrics_path = self.base_path / "metrics"
        self.current_path = self.base_path / "current"
        
        # Create directories
        self.checkpoints_path.mkdir(parents=True, exist_ok=True)
        self.metrics_path.mkdir(parents=True, exist_ok=True)
        self.current_path.mkdir(parents=True, exist_ok=True)
        
        # Version tracking
        self.version_file = self.base_path / "version_history.json"
        self.load_version_history()
        
        logging.info("🔧 Model Checkpoint Manager initialized")

    def load_version_history(self):
        """Load version history from file"""
        if self.version_file.exists():
            with open(self.version_file, 'r') as f:
                self.version_history = json.load(f)
        else:
            self.version_history = {
                'versions': [],
                'current_version': None,
                'last_updated': None
            }

    def save_version_history(self):
        """Save version history to file"""
        self.version_history['last_updated'] = datetime.now().isoformat()
        with open(self.version_file, 'w') as f:
            json.dump(self.version_history, f, indent=2)

    def generate_version_id(self, model_name: str) -> str:
        """Generate unique version ID"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{model_name}_v{timestamp}"

    def calculate_model_hash(self, model_path: str) -> str:
        """Calculate hash of model file for integrity checking"""
        try:
            with open(model_path, 'rb') as f:
                file_hash = hashlib.md5()
                while chunk := f.read(8192):
                    file_hash.update(chunk)
            return file_hash.hexdigest()
        except Exception as e:
            logging.error(f"❌ Failed to calculate hash for {model_path}: {e}")
            return ""

    def save_model_checkpoint(self, model, model_name: str, metrics: Dict[str, Any], 
                            metadata: Dict[str, Any] = None) -> str:
        """Save model checkpoint with versioning"""
        try:
            # Generate version ID
            version_id = self.generate_version_id(model_name)
            
            # Create version directory
            version_dir = self.checkpoints_path / version_id
            version_dir.mkdir(exist_ok=True)
            
            # Save model
            model_path = version_dir / f"{model_name}.joblib"
            joblib.dump(model, model_path)
            
            # Calculate model hash
            model_hash = self.calculate_model_hash(str(model_path))
            
            # Prepare version info
            version_info = {
                'version_id': version_id,
                'model_name': model_name,
                'created_at': datetime.now().isoformat(),
                'model_path': str(model_path),
                'model_hash': model_hash,
                'metrics': metrics,
                'metadata': metadata or {},
                'status': 'active'
            }
            
            # Save version info
            version_info_path = version_dir / "version_info.json"
            with open(version_info_path, 'w') as f:
                json.dump(version_info, f, indent=2)
            
            # Update version history
            self.version_history['versions'].append(version_info)
            self.version_history['current_version'] = version_id
            
            # Save version history
            self.save_version_history()
            
            # Log AI event
            ai_logger.log_ai_event(
                'model_checkpoint_saved',
                model_name,
                metrics,
                {
                    'version_id': version_id,
                    'model_hash': model_hash,
                    'metadata': metadata
                }
            )
            
            logging.info(f"✅ Model checkpoint saved: {version_id}")
            return version_id
            
        except Exception as e:
            logging.error(f"❌ Failed to save model checkpoint: {e}")
            ai_logger.log_error(e, {
                'operation': 'save_model_checkpoint',
                'model_name': model_name,
                'metrics': metrics
            })
            raise

    def load_model_checkpoint(self, version_id: str) -> Tuple[Any, Dict[str, Any]]:
        """Load model checkpoint by version ID"""
        try:
            version_dir = self.checkpoints_path / version_id
            version_info_path = version_dir / "version_info.json"
            
            if not version_info_path.exists():
                raise FileNotFoundError(f"Version info not found: {version_id}")
            
            # Load version info
            with open(version_info_path, 'r') as f:
                version_info = json.load(f)
            
            # Load model
            model_path = version_info['model_path']
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            # Verify model integrity
            current_hash = self.calculate_model_hash(model_path)
            if current_hash != version_info['model_hash']:
                logging.warning(f"⚠️ Model hash mismatch for {version_id}")
            
            model = joblib.load(model_path)
            
            logging.info(f"✅ Model checkpoint loaded: {version_id}")
            return model, version_info
            
        except Exception as e:
            logging.error(f"❌ Failed to load model checkpoint: {e}")
            ai_logger.log_error(e, {
                'operation': 'load_model_checkpoint',
                'version_id': version_id
            })
            raise

    def get_current_model(self, model_name: str) -> Tuple[Any, Dict[str, Any]]:
        """Get current active model"""
        try:
            current_version = self.version_history.get('current_version')
            if not current_version:
                raise ValueError("No current model version set")
            
            return self.load_model_checkpoint(current_version)
            
        except Exception as e:
            logging.error(f"❌ Failed to get current model: {e}")
            raise

    def set_current_model(self, version_id: str) -> bool:
        """Set current active model version"""
        try:
            # Verify version exists
            version_dir = self.checkpoints_path / version_id
            if not version_dir.exists():
                raise FileNotFoundError(f"Version not found: {version_id}")
            
            # Update current version
            self.version_history['current_version'] = version_id
            
            # Copy to current directory
            version_info_path = version_dir / "version_info.json"
            with open(version_info_path, 'r') as f:
                version_info = json.load(f)
            
            model_name = version_info['model_name']
            model_path = version_info['model_path']
            
            # Copy model to current directory
            current_model_path = self.current_path / f"{model_name}.joblib"
            shutil.copy2(model_path, current_model_path)
            
            # Copy version info to current directory
            current_info_path = self.current_path / "current_version.json"
            shutil.copy2(version_info_path, current_info_path)
            
            # Save version history
            self.save_version_history()
            
            logging.info(f"✅ Current model set to: {version_id}")
            return True
            
        except Exception as e:
            logging.error(f"❌ Failed to set current model: {e}")
            ai_logger.log_error(e, {
                'operation': 'set_current_model',
                'version_id': version_id
            })
            return False

    def rollback_model(self, version_id: str) -> bool:
        """Rollback to previous model version"""
        try:
            return self.set_current_model(version_id)
        except Exception as e:
            logging.error(f"❌ Failed to rollback model: {e}")
            return False

    def get_model_versions(self, model_name: str = None) -> List[Dict[str, Any]]:
        """Get list of model versions"""
        try:
            versions = self.version_history.get('versions', [])
            
            if model_name:
                versions = [v for v in versions if v['model_name'] == model_name]
            
            # Sort by creation date (newest first)
            versions.sort(key=lambda x: x['created_at'], reverse=True)
            
            return versions
            
        except Exception as e:
            logging.error(f"❌ Failed to get model versions: {e}")
            return []

    def compare_model_versions(self, version_id1: str, version_id2: str) -> Dict[str, Any]:
        """Compare two model versions"""
        try:
            model1, info1 = self.load_model_checkpoint(version_id1)
            model2, info2 = self.load_model_checkpoint(version_id2)
            
            comparison = {
                'version1': {
                    'version_id': version_id1,
                    'created_at': info1['created_at'],
                    'metrics': info1['metrics']
                },
                'version2': {
                    'version_id': version_id2,
                    'created_at': info2['created_at'],
                    'metrics': info2['metrics']
                },
                'comparison': {}
            }
            
            # Compare metrics
            metrics1 = info1['metrics']
            metrics2 = info2['metrics']
            
            for metric in ['mse', 'mae', 'r2_score', 'accuracy']:
                if metric in metrics1 and metric in metrics2:
                    val1 = metrics1[metric]
                    val2 = metrics2[metric]
                    
                    if isinstance(val1, (int, float)) and isinstance(val2, (int, float)):
                        improvement = val2 - val1
                        improvement_pct = (improvement / val1 * 100) if val1 != 0 else 0
                        
                        comparison['comparison'][metric] = {
                            'version1': val1,
                            'version2': val2,
                            'improvement': improvement,
                            'improvement_percentage': improvement_pct,
                            'better_version': version_id2 if improvement > 0 else version_id1
                        }
            
            return comparison
            
        except Exception as e:
            logging.error(f"❌ Failed to compare model versions: {e}")
            return {}

    def cleanup_old_versions(self, keep_count: int = 10) -> int:
        """Clean up old model versions, keeping only the most recent ones"""
        try:
            versions = self.get_model_versions()
            deleted_count = 0
            
            # Keep only the most recent versions
            versions_to_keep = versions[:keep_count]
            versions_to_delete = versions[keep_count:]
            
            for version in versions_to_delete:
                version_id = version['version_id']
                version_dir = self.checkpoints_path / version_id
                
                if version_dir.exists():
                    shutil.rmtree(version_dir)
                    deleted_count += 1
                    
                    # Remove from version history
                    self.version_history['versions'] = [
                        v for v in self.version_history['versions'] 
                        if v['version_id'] != version_id
                    ]
            
            # Save updated version history
            self.save_version_history()
            
            logging.info(f"🧹 Cleaned up {deleted_count} old model versions")
            return deleted_count
            
        except Exception as e:
            logging.error(f"❌ Failed to cleanup old versions: {e}")
            return 0

    def get_model_performance_history(self, model_name: str) -> pd.DataFrame:
        """Get performance history for a model as DataFrame"""
        try:
            versions = self.get_model_versions(model_name)
            
            if not versions:
                return pd.DataFrame()
            
            # Extract metrics for each version
            performance_data = []
            for version in versions:
                row = {
                    'version_id': version['version_id'],
                    'created_at': version['created_at'],
                    'model_name': version['model_name']
                }
                
                # Add metrics
                metrics = version.get('metrics', {})
                for metric, value in metrics.items():
                    row[metric] = value
                
                performance_data.append(row)
            
            df = pd.DataFrame(performance_data)
            
            if not df.empty:
                df['created_at'] = pd.to_datetime(df['created_at'])
                df = df.sort_values('created_at')
            
            return df
            
        except Exception as e:
            logging.error(f"❌ Failed to get performance history: {e}")
            return pd.DataFrame()

    def export_model_metrics(self, output_path: str = None) -> str:
        """Export all model metrics to JSON file"""
        try:
            if output_path is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_path = self.metrics_path / f"model_metrics_{timestamp}.json"
            
            export_data = {
                'export_timestamp': datetime.now().isoformat(),
                'version_history': self.version_history,
                'performance_summary': {}
            }
            
            # Add performance summary for each model
            model_names = set(v['model_name'] for v in self.version_history['versions'])
            for model_name in model_names:
                df = self.get_model_performance_history(model_name)
                if not df.empty:
                    export_data['performance_summary'][model_name] = {
                        'total_versions': len(df),
                        'latest_metrics': df.iloc[-1].to_dict(),
                        'best_metrics': df.loc[df['mse'].idxmin()].to_dict() if 'mse' in df.columns else None
                    }
            
            with open(output_path, 'w') as f:
                json.dump(export_data, f, indent=2, default=str)
            
            logging.info(f"📊 Model metrics exported to: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logging.error(f"❌ Failed to export model metrics: {e}")
            return ""

    def get_checkpoint_status(self) -> Dict[str, Any]:
        """Get checkpoint system status"""
        try:
            versions = self.version_history.get('versions', [])
            current_version = self.version_history.get('current_version')
            
            status = {
                'total_versions': len(versions),
                'current_version': current_version,
                'checkpoints_directory': str(self.checkpoints_path),
                'current_directory': str(self.current_path),
                'last_updated': self.version_history.get('last_updated'),
                'models': {}
            }
            
            # Count versions per model
            model_counts = {}
            for version in versions:
                model_name = version['model_name']
                model_counts[model_name] = model_counts.get(model_name, 0) + 1
            
            status['models'] = model_counts
            
            return status
            
        except Exception as e:
            logging.error(f"❌ Failed to get checkpoint status: {e}")
            return {}

# Global checkpoint manager instance
checkpoint_manager = ModelCheckpointManager()

if __name__ == "__main__":
    # Test the checkpoint system
    import numpy as np
    from sklearn.linear_model import LinearRegression
    
    # Create a dummy model
    X = np.random.randn(100, 5)
    y = np.random.randn(100)
    model = LinearRegression()
    model.fit(X, y)
    
    # Test metrics
    y_pred = model.predict(X)
    mse = mean_squared_error(y, y_pred)
    mae = mean_absolute_error(y, y_pred)
    r2 = r2_score(y, y_pred)
    
    metrics = {
        'mse': mse,
        'mae': mae,
        'r2_score': r2,
        'training_samples': len(X),
        'features': X.shape[1]
    }
    
    # Save checkpoint
    version_id = checkpoint_manager.save_model_checkpoint(
        model, 
        'test_model', 
        metrics,
        {'test': True, 'description': 'Test model checkpoint'}
    )
    
    print(f"✅ Model saved with version: {version_id}")
    
    # Load checkpoint
    loaded_model, version_info = checkpoint_manager.load_model_checkpoint(version_id)
    print(f"✅ Model loaded: {version_info['version_id']}")
    
    # Get versions
    versions = checkpoint_manager.get_model_versions('test_model')
    print(f"📋 Found {len(versions)} versions")
    
    # Get status
    status = checkpoint_manager.get_checkpoint_status()
    print(f"📊 Status: {status}")
    
    # Export metrics
    export_path = checkpoint_manager.export_model_metrics()
    print(f"📤 Metrics exported to: {export_path}")
