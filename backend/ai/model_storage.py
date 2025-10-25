"""
🚀 BIST AI Smart Trader - Model Storage & Governance
==================================================

Model versiyonlama, saklama ve yönetim sistemi.
MLOps best practices ile model lifecycle yönetimi.

Özellikler:
- Model versioning
- Model storage
- Model governance
- Model lineage tracking
- Model rollback
- Model metadata management
"""

import asyncio
import json
import logging
import shutil
import hashlib
import pickle
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import uuid
import zipfile
import tarfile

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ModelMetadata:
    """Model metadata"""
    model_id: str
    version: str
    model_type: str
    created_at: datetime
    created_by: str
    description: str
    tags: List[str]
    performance_metrics: Dict[str, float]
    training_data_hash: str
    model_file_hash: str
    dependencies: Dict[str, str]
    environment: Dict[str, str]
    
    def to_dict(self):
        data = asdict(self)
        data['created_at'] = self.created_at.isoformat()
        return data

@dataclass
class ModelVersion:
    """Model versiyonu"""
    version_id: str
    model_id: str
    version_number: str
    file_path: str
    metadata: ModelMetadata
    is_active: bool
    is_production: bool
    created_at: datetime
    size_bytes: int
    
    def to_dict(self):
        data = asdict(self)
        data['created_at'] = self.created_at.isoformat()
        data['metadata'] = self.metadata.to_dict()
        return data

@dataclass
class ModelLineage:
    """Model lineage"""
    model_id: str
    parent_models: List[str]
    child_models: List[str]
    training_data_sources: List[str]
    feature_engineering_steps: List[str]
    hyperparameters: Dict[str, Any]
    created_at: datetime
    
    def to_dict(self):
        data = asdict(self)
        data['created_at'] = self.created_at.isoformat()
        return data

class ModelStorageGovernance:
    """Model Storage & Governance"""
    
    def __init__(self, storage_dir: str = "backend/ai/model_storage"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        
        # Storage yapısı
        self.models_dir = self.storage_dir / "models"
        self.metadata_dir = self.storage_dir / "metadata"
        self.lineage_dir = self.storage_dir / "lineage"
        self.backups_dir = self.storage_dir / "backups"
        
        # Dizinleri oluştur
        for dir_path in [self.models_dir, self.metadata_dir, self.lineage_dir, self.backups_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)
        
        # Model registry
        self.model_registry: Dict[str, Dict[str, Any]] = {}
        self.model_versions: List[ModelVersion] = []
        self.model_lineages: List[ModelLineage] = []
        
        # Load existing data
        self._load_registry()
    
    def _load_registry(self):
        """Registry'yi yükle"""
        try:
            registry_file = self.storage_dir / "model_registry.json"
            if registry_file.exists():
                with open(registry_file, 'r') as f:
                    self.model_registry = json.load(f)
            
            versions_file = self.storage_dir / "model_versions.json"
            if versions_file.exists():
                with open(versions_file, 'r') as f:
                    version_data = json.load(f)
                    self.model_versions = [
                        ModelVersion(**item) for item in version_data
                    ]
            
            lineages_file = self.storage_dir / "model_lineages.json"
            if lineages_file.exists():
                with open(lineages_file, 'r') as f:
                    lineage_data = json.load(f)
                    self.model_lineages = [
                        ModelLineage(**item) for item in lineage_data
                    ]
            
            logger.info(f"✅ Loaded {len(self.model_registry)} models, {len(self.model_versions)} versions")
            
        except Exception as e:
            logger.error(f"❌ Load registry error: {e}")
    
    def _save_registry(self):
        """Registry'yi kaydet"""
        try:
            # Model registry
            registry_file = self.storage_dir / "model_registry.json"
            with open(registry_file, 'w') as f:
                json.dump(self.model_registry, f, indent=2)
            
            # Model versions
            versions_file = self.storage_dir / "model_versions.json"
            version_data = [version.to_dict() for version in self.model_versions]
            with open(versions_file, 'w') as f:
                json.dump(version_data, f, indent=2)
            
            # Model lineages
            lineages_file = self.storage_dir / "model_lineages.json"
            lineage_data = [lineage.to_dict() for lineage in self.model_lineages]
            with open(lineages_file, 'w') as f:
                json.dump(lineage_data, f, indent=2)
            
            logger.info("💾 Model registry saved")
            
        except Exception as e:
            logger.error(f"❌ Save registry error: {e}")
    
    def _calculate_file_hash(self, file_path: Path) -> str:
        """Dosya hash'ini hesapla"""
        try:
            hash_md5 = hashlib.md5()
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
            
        except Exception as e:
            logger.error(f"❌ Calculate file hash error: {e}")
            return ""
    
    def _get_next_version(self, model_id: str) -> str:
        """Sonraki versiyon numarasını getir"""
        try:
            model_versions = [v for v in self.model_versions if v.model_id == model_id]
            
            if not model_versions:
                return "1.0.0"
            
            # En yüksek versiyon numarasını bul
            version_numbers = []
            for version in model_versions:
                try:
                    # Semantic versioning (major.minor.patch)
                    parts = version.version_number.split('.')
                    if len(parts) == 3:
                        version_numbers.append((int(parts[0]), int(parts[1]), int(parts[2])))
                except ValueError:
                    continue
            
            if not version_numbers:
                return "1.0.0"
            
            # En yüksek versiyonu bul ve patch'i artır
            latest = max(version_numbers)
            return f"{latest[0]}.{latest[1]}.{latest[2] + 1}"
            
        except Exception as e:
            logger.error(f"❌ Get next version error: {e}")
            return "1.0.0"
    
    def store_model(self,
                   model_id: str,
                   model_type: str,
                   model_object: Any,
                   training_data_hash: str,
                   performance_metrics: Dict[str, float],
                   description: str = "",
                   tags: List[str] = None,
                   dependencies: Dict[str, str] = None,
                   environment: Dict[str, str] = None,
                   created_by: str = "system") -> str:
        """Modeli sakla"""
        try:
            # Versiyon numarası
            version_number = self._get_next_version(model_id)
            
            # Model dosya yolu
            model_dir = self.models_dir / model_id / version_number
            model_dir.mkdir(parents=True, exist_ok=True)
            
            model_file = model_dir / f"{model_id}_{version_number}.pkl"
            
            # Modeli kaydet
            with open(model_file, 'wb') as f:
                pickle.dump(model_object, f)
            
            # Dosya hash'i
            model_file_hash = self._calculate_file_hash(model_file)
            
            # Metadata oluştur
            metadata = ModelMetadata(
                model_id=model_id,
                version=version_number,
                model_type=model_type,
                created_at=datetime.now(),
                created_by=created_by,
                description=description,
                tags=tags or [],
                performance_metrics=performance_metrics,
                training_data_hash=training_data_hash,
                model_file_hash=model_file_hash,
                dependencies=dependencies or {},
                environment=environment or {}
            )
            
            # Model versiyonu oluştur
            version_id = str(uuid.uuid4())
            model_version = ModelVersion(
                version_id=version_id,
                model_id=model_id,
                version_number=version_number,
                file_path=str(model_file),
                metadata=metadata,
                is_active=True,
                is_production=False,
                created_at=datetime.now(),
                size_bytes=model_file.stat().st_size
            )
            
            # Registry'ye ekle
            self.model_versions.append(model_version)
            
            # Model registry'yi güncelle
            if model_id not in self.model_registry:
                self.model_registry[model_id] = {
                    'model_type': model_type,
                    'total_versions': 0,
                    'latest_version': version_number,
                    'created_at': datetime.now().isoformat(),
                    'last_updated': datetime.now().isoformat()
                }
            
            self.model_registry[model_id]['total_versions'] += 1
            self.model_registry[model_id]['latest_version'] = version_number
            self.model_registry[model_id]['last_updated'] = datetime.now().isoformat()
            
            # Registry'yi kaydet
            self._save_registry()
            
            logger.info(f"✅ Model stored: {model_id} v{version_number}")
            return version_id
            
        except Exception as e:
            logger.error(f"❌ Store model error: {e}")
            return ""
    
    def load_model(self, model_id: str, version: str = None) -> Optional[Any]:
        """Modeli yükle"""
        try:
            # Versiyon belirtilmemişse en son versiyonu kullan
            if not version:
                version = self.model_registry.get(model_id, {}).get('latest_version')
                if not version:
                    logger.error(f"❌ No version found for model: {model_id}")
                    return None
            
            # Model versiyonunu bul
            model_version = next(
                (v for v in self.model_versions 
                 if v.model_id == model_id and v.version_number == version),
                None
            )
            
            if not model_version:
                logger.error(f"❌ Model version not found: {model_id} v{version}")
                return None
            
            # Model dosyasını yükle
            model_file = Path(model_version.file_path)
            if not model_file.exists():
                logger.error(f"❌ Model file not found: {model_file}")
                return None
            
            with open(model_file, 'rb') as f:
                model = pickle.load(f)
            
            logger.info(f"✅ Model loaded: {model_id} v{version}")
            return model
            
        except Exception as e:
            logger.error(f"❌ Load model error: {e}")
            return None
    
    def get_model_metadata(self, model_id: str, version: str = None) -> Optional[ModelMetadata]:
        """Model metadata'sını getir"""
        try:
            if not version:
                version = self.model_registry.get(model_id, {}).get('latest_version')
            
            model_version = next(
                (v for v in self.model_versions 
                 if v.model_id == model_id and v.version_number == version),
                None
            )
            
            if not model_version:
                return None
            
            return model_version.metadata
            
        except Exception as e:
            logger.error(f"❌ Get model metadata error: {e}")
            return None
    
    def list_model_versions(self, model_id: str) -> List[ModelVersion]:
        """Model versiyonlarını listele"""
        try:
            return [v for v in self.model_versions if v.model_id == model_id]
            
        except Exception as e:
            logger.error(f"❌ List model versions error: {e}")
            return []
    
    def set_production_model(self, model_id: str, version: str) -> bool:
        """Production modeli ayarla"""
        try:
            # Önceki production modeli kaldır
            for model_version in self.model_versions:
                if model_version.model_id == model_id and model_version.is_production:
                    model_version.is_production = False
            
            # Yeni production modeli ayarla
            target_version = next(
                (v for v in self.model_versions 
                 if v.model_id == model_id and v.version_number == version),
                None
            )
            
            if not target_version:
                logger.error(f"❌ Model version not found: {model_id} v{version}")
                return False
            
            target_version.is_production = True
            target_version.is_active = True
            
            # Registry'yi kaydet
            self._save_registry()
            
            logger.info(f"✅ Production model set: {model_id} v{version}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Set production model error: {e}")
            return False
    
    def rollback_model(self, model_id: str, target_version: str) -> bool:
        """Modeli geri al"""
        try:
            # Hedef versiyonun var olduğunu kontrol et
            target_model_version = next(
                (v for v in self.model_versions 
                 if v.model_id == model_id and v.version_number == target_version),
                None
            )
            
            if not target_model_version:
                logger.error(f"❌ Target version not found: {model_id} v{target_version}")
                return False
            
            # Mevcut production modeli deaktive et
            for model_version in self.model_versions:
                if model_version.model_id == model_id and model_version.is_production:
                    model_version.is_production = False
            
            # Hedef versiyonu production yap
            target_model_version.is_production = True
            target_model_version.is_active = True
            
            # Registry'yi güncelle
            self.model_registry[model_id]['latest_version'] = target_version
            self.model_registry[model_id]['last_updated'] = datetime.now().isoformat()
            
            # Registry'yi kaydet
            self._save_registry()
            
            logger.info(f"✅ Model rolled back: {model_id} to v{target_version}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Rollback model error: {e}")
            return False
    
    def create_model_lineage(self,
                           model_id: str,
                           parent_models: List[str] = None,
                           training_data_sources: List[str] = None,
                           feature_engineering_steps: List[str] = None,
                           hyperparameters: Dict[str, Any] = None) -> bool:
        """Model lineage oluştur"""
        try:
            lineage = ModelLineage(
                model_id=model_id,
                parent_models=parent_models or [],
                child_models=[],
                training_data_sources=training_data_sources or [],
                feature_engineering_steps=feature_engineering_steps or [],
                hyperparameters=hyperparameters or {},
                created_at=datetime.now()
            )
            
            # Parent modellerin child listesine ekle
            for parent_id in parent_models or []:
                parent_lineage = next(
                    (l for l in self.model_lineages if l.model_id == parent_id),
                    None
                )
                if parent_lineage:
                    parent_lineage.child_models.append(model_id)
            
            self.model_lineages.append(lineage)
            self._save_registry()
            
            logger.info(f"✅ Model lineage created: {model_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Create model lineage error: {e}")
            return False
    
    def get_model_lineage(self, model_id: str) -> Optional[ModelLineage]:
        """Model lineage'ini getir"""
        try:
            return next(
                (l for l in self.model_lineages if l.model_id == model_id),
                None
            )
            
        except Exception as e:
            logger.error(f"❌ Get model lineage error: {e}")
            return None
    
    def backup_model(self, model_id: str, version: str) -> bool:
        """Modeli yedekle"""
        try:
            model_version = next(
                (v for v in self.model_versions 
                 if v.model_id == model_id and v.version_number == version),
                None
            )
            
            if not model_version:
                logger.error(f"❌ Model version not found: {model_id} v{version}")
                return False
            
            # Backup dosya yolu
            backup_file = self.backups_dir / f"{model_id}_{version}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
            
            # Model dosyasını ve metadata'yı yedekle
            with zipfile.ZipFile(backup_file, 'w') as zipf:
                # Model dosyası
                model_file = Path(model_version.file_path)
                if model_file.exists():
                    zipf.write(model_file, f"model_{model_file.name}")
                
                # Metadata
                metadata_file = self.metadata_dir / f"{model_id}_{version}.json"
                if metadata_file.exists():
                    zipf.write(metadata_file, f"metadata_{metadata_file.name}")
            
            logger.info(f"✅ Model backed up: {backup_file}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Backup model error: {e}")
            return False
    
    def cleanup_old_versions(self, model_id: str, keep_versions: int = 5) -> bool:
        """Eski versiyonları temizle"""
        try:
            model_versions = [v for v in self.model_versions if v.model_id == model_id]
            
            if len(model_versions) <= keep_versions:
                return True
            
            # Versiyonları tarihe göre sırala
            model_versions.sort(key=lambda x: x.created_at, reverse=True)
            
            # Eski versiyonları sil
            versions_to_delete = model_versions[keep_versions:]
            
            for version in versions_to_delete:
                # Dosyayı sil
                model_file = Path(version.file_path)
                if model_file.exists():
                    model_file.unlink()
                
                # Registry'den kaldır
                self.model_versions.remove(version)
            
            # Registry'yi kaydet
            self._save_registry()
            
            logger.info(f"✅ Cleaned up {len(versions_to_delete)} old versions for {model_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Cleanup old versions error: {e}")
            return False
    
    def get_storage_statistics(self) -> Dict[str, Any]:
        """Storage istatistiklerini getir"""
        try:
            total_models = len(self.model_registry)
            total_versions = len(self.model_versions)
            production_models = len([v for v in self.model_versions if v.is_production])
            
            # Toplam dosya boyutu
            total_size = sum(v.size_bytes for v in self.model_versions)
            
            # Model türlerine göre dağılım
            model_types = {}
            for model_id, info in self.model_registry.items():
                model_type = info.get('model_type', 'unknown')
                model_types[model_type] = model_types.get(model_type, 0) + 1
            
            stats = {
                'total_models': total_models,
                'total_versions': total_versions,
                'production_models': production_models,
                'total_size_bytes': total_size,
                'total_size_mb': total_size / (1024 * 1024),
                'model_types': model_types,
                'storage_path': str(self.storage_dir),
                'backup_count': len(list(self.backups_dir.glob('*.zip')))
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Get storage statistics error: {e}")
            return {}

# Global instance
model_storage_governance = ModelStorageGovernance()

if __name__ == "__main__":
    async def test_model_storage():
        """Test fonksiyonu"""
        logger.info("🧪 Testing Model Storage & Governance...")
        
        # Test modeli oluştur
        test_model = {"test": "model", "accuracy": 0.85}
        
        # Modeli sakla
        version_id = model_storage_governance.store_model(
            model_id="test_model",
            model_type="test",
            model_object=test_model,
            training_data_hash="test_hash",
            performance_metrics={"accuracy": 0.85, "precision": 0.80},
            description="Test model",
            tags=["test", "demo"]
        )
        
        logger.info(f"✅ Model stored: {version_id}")
        
        # Modeli yükle
        loaded_model = model_storage_governance.load_model("test_model")
        logger.info(f"✅ Model loaded: {loaded_model}")
        
        # Metadata getir
        metadata = model_storage_governance.get_model_metadata("test_model")
        logger.info(f"📊 Metadata: {metadata.description}")
        
        # İstatistikler
        stats = model_storage_governance.get_storage_statistics()
        logger.info(f"📈 Storage stats: {stats}")
        
        logger.info("✅ Model Storage & Governance test completed")
    
    # Test çalıştır
    asyncio.run(test_model_storage())
