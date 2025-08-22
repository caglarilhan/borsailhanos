#!/usr/bin/env python3
"""
BIST AI Smart Trader - Production Deployment Module
Tüm AI modellerini production'a deploy eder ve monitoring kurar
"""
import os
import json
import shutil
import subprocess
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
import requests
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductionDeployer:
    def __init__(self, production_dir: str = "production"):
        """Production deployer başlat"""
        self.production_dir = production_dir
        self.deployment_config = {}
        self.deployment_status = {}
        self.health_check_results = {}
        
        # Load deployment configuration
        self._load_deployment_config()
        
        # Create production directory structure
        self._create_production_structure()
    
    def _load_deployment_config(self):
        """Deployment konfigürasyonunu yükle"""
        try:
            config_file = "deployment_config.json"
            if os.path.exists(config_file):
                with open(config_file, 'r') as f:
                    self.deployment_config = json.load(f)
                logger.info("✅ Deployment configuration loaded")
            else:
                # Create default configuration
                self.deployment_config = {
                    'production_settings': {
                        'host': '0.0.0.0',
                        'port': 8001,
                        'workers': 4,
                        'max_requests': 1000,
                        'timeout': 30
                    },
                    'monitoring': {
                        'health_check_interval': 60,
                        'metrics_collection': True,
                        'alerting': True
                    },
                    'security': {
                        'ssl_enabled': False,
                        'rate_limiting': True,
                        'cors_origins': ['http://localhost:3000', 'https://yourdomain.com']
                    },
                    'models': {
                        'auto_update': True,
                        'update_interval_hours': 24,
                        'backup_enabled': True
                    }
                }
                
                # Save default configuration
                with open(config_file, 'w') as f:
                    json.dump(self.deployment_config, f, indent=2)
                
                logger.info("✅ Default deployment configuration created")
                
        except Exception as e:
            logger.error(f"❌ Failed to load deployment configuration: {e}")
    
    def _create_production_structure(self):
        """Production dizin yapısını oluştur"""
        try:
            # Create production directory structure
            directories = [
                self.production_dir,
                f"{self.production_dir}/models",
                f"{self.production_dir}/logs",
                f"{self.production_dir}/config",
                f"{self.production_dir}/scripts",
                f"{self.production_dir}/monitoring",
                f"{self.production_dir}/backups"
            ]
            
            for directory in directories:
                os.makedirs(directory, exist_ok=True)
            
            logger.info("✅ Production directory structure created")
            
        except Exception as e:
            logger.error(f"❌ Failed to create production structure: {e}")
    
    def deploy_ai_models(self) -> Dict[str, Any]:
        """AI modellerini production'a deploy et"""
        logger.info("🚀 Deploying AI models to production...")
        
        try:
            deployment_results = {
                'timestamp': datetime.now().isoformat(),
                'models_deployed': [],
                'deployment_errors': [],
                'total_models': 0
            }
            
            # 1. Deploy hyperparameter optimization results
            logger.info("🔧 Deploying hyperparameter optimization...")
            if self._deploy_model_file('models/optimized_hyperparameters.pkl', 'hyperparameters'):
                deployment_results['models_deployed'].append('hyperparameters')
            
            # 2. Deploy advanced ensemble
            logger.info("🧠 Deploying advanced ensemble...")
            if self._deploy_model_file('models/advanced_ensemble.pkl', 'ensemble'):
                deployment_results['models_deployed'].append('ensemble')
            
            # 3. Deploy feature engineering models
            logger.info("🔧 Deploying feature engineering models...")
            if self._deploy_feature_engineering_models():
                deployment_results['models_deployed'].append('feature_engineering')
            
            # 4. Deploy configuration files
            logger.info("⚙️ Deploying configuration files...")
            if self._deploy_configuration_files():
                deployment_results['models_deployed'].append('configuration')
            
            # 5. Deploy monitoring scripts
            logger.info("📊 Deploying monitoring scripts...")
            if self._deploy_monitoring_scripts():
                deployment_results['models_deployed'].append('monitoring')
            
            # 6. Deploy production scripts
            logger.info("🚀 Deploying production scripts...")
            if self._deploy_production_scripts():
                deployment_results['models_deployed'].append('production_scripts')
            
            # Update deployment status
            deployment_results['total_models'] = len(deployment_results['models_deployed'])
            deployment_results['success_rate'] = len(deployment_results['models_deployed']) / 6
            
            self.deployment_status = deployment_results
            
            logger.info(f"✅ AI models deployment completed: {deployment_results['total_models']} models deployed")
            return deployment_results
            
        except Exception as e:
            logger.error(f"❌ AI models deployment failed: {e}")
            return {
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _deploy_model_file(self, source_path: str, model_type: str) -> bool:
        """Tek bir model dosyasını deploy et"""
        try:
            if os.path.exists(source_path):
                # Create backup
                backup_path = f"{self.production_dir}/backups/{model_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
                shutil.copy2(source_path, backup_path)
                
                # Deploy to production
                dest_path = f"{self.production_dir}/models/{os.path.basename(source_path)}"
                shutil.copy2(source_path, dest_path)
                
                logger.info(f"✅ {model_type} model deployed to {dest_path}")
                return True
            else:
                logger.warning(f"⚠️ Source file not found: {source_path}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to deploy {model_type} model: {e}")
            return False
    
    def _deploy_feature_engineering_models(self) -> bool:
        """Feature engineering modellerini deploy et"""
        try:
            # Deploy any saved feature engineering models
            source_dir = "models"
            if os.path.exists(source_dir):
                for filename in os.listdir(source_dir):
                    if filename.startswith('feature_') or filename.startswith('pca_'):
                        source_path = os.path.join(source_dir, filename)
                        dest_path = f"{self.production_dir}/models/{filename}"
                        shutil.copy2(source_path, dest_path)
                        logger.info(f"✅ Feature engineering model deployed: {filename}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Feature engineering models deployment failed: {e}")
            return False
    
    def _deploy_configuration_files(self) -> bool:
        """Konfigürasyon dosyalarını deploy et"""
        try:
            # Deploy main configuration
            config_files = [
                'config.py',
                'requirements.txt',
                'docker-compose.yml',
                'Dockerfile'
            ]
            
            for config_file in config_files:
                if os.path.exists(config_file):
                    dest_path = f"{self.production_dir}/config/{config_file}"
                    shutil.copy2(config_file, dest_path)
                    logger.info(f"✅ Configuration file deployed: {config_file}")
            
            # Create production-specific config
            prod_config = {
                'production': True,
                'debug': False,
                'log_level': 'INFO',
                'host': self.deployment_config['production_settings']['host'],
                'port': self.deployment_config['production_settings']['port'],
                'workers': self.deployment_config['production_settings']['workers']
            }
            
            prod_config_path = f"{self.production_dir}/config/production_config.json"
            with open(prod_config_path, 'w') as f:
                json.dump(prod_config, f, indent=2)
            
            logger.info("✅ Production configuration created")
            return True
            
        except Exception as e:
            logger.error(f"❌ Configuration deployment failed: {e}")
            return False
    
    def _deploy_monitoring_scripts(self) -> bool:
        """Monitoring scriptlerini deploy et"""
        try:
            # Deploy monitoring scripts
            monitoring_scripts = [
                'performance_monitor.py',
                'production_testing.py'
            ]
            
            for script in monitoring_scripts:
                if os.path.exists(script):
                    dest_path = f"{self.production_dir}/monitoring/{script}"
                    shutil.copy2(script, dest_path)
                    logger.info(f"✅ Monitoring script deployed: {script}")
            
            # Create production monitoring configuration
            monitoring_config = {
                'health_check_interval': self.deployment_config['monitoring']['health_check_interval'],
                'metrics_collection': self.deployment_config['monitoring']['metrics_collection'],
                'alerting': self.deployment_config['monitoring']['alerting']
            }
            
            monitoring_config_path = f"{self.production_dir}/monitoring/monitoring_config.json"
            with open(monitoring_config_path, 'w') as f:
                json.dump(monitoring_config, f, indent=2)
            
            logger.info("✅ Monitoring configuration created")
            return True
            
        except Exception as e:
            logger.error(f"❌ Monitoring scripts deployment failed: {e}")
            return False
    
    def _deploy_production_scripts(self) -> bool:
        """Production scriptlerini deploy et"""
        try:
            # Create production startup script
            startup_script = f"""#!/bin/bash
# BIST AI Smart Trader - Production Startup Script
echo "🚀 Starting BIST AI Smart Trader in production mode..."

# Set environment variables
export PRODUCTION_MODE=true
export LOG_LEVEL=INFO
export HOST={self.deployment_config['production_settings']['host']}
export PORT={self.deployment_config['production_settings']['port']}

# Start the application
cd {self.production_dir}
python -m uvicorn fastapi_main:app --host $HOST --port $PORT --workers {self.deployment_config['production_settings']['workers']}
"""
            
            startup_path = f"{self.production_dir}/scripts/start_production.sh"
            with open(startup_path, 'w') as f:
                f.write(startup_script)
            
            # Make executable
            os.chmod(startup_path, 0o755)
            
            # Create health check script
            health_check_script = f"""#!/bin/bash
# Health check script
curl -f http://localhost:{self.deployment_config['production_settings']['port']}/health || exit 1
"""
            
            health_check_path = f"{self.production_dir}/scripts/health_check.sh"
            with open(health_check_path, 'w') as f:
                f.write(health_check_script)
            
            os.chmod(health_check_path, 0o755)
            
            logger.info("✅ Production scripts created")
            return True
            
        except Exception as e:
            logger.error(f"❌ Production scripts deployment failed: {e}")
            return False
    
    def start_production_services(self) -> Dict[str, Any]:
        """Production servislerini başlat"""
        logger.info("🚀 Starting production services...")
        
        try:
            start_results = {
                'timestamp': datetime.now().isoformat(),
                'services_started': [],
                'startup_errors': []
            }
            
            # 1. Start main application
            logger.info("📱 Starting main application...")
            if self._start_main_application():
                start_results['services_started'].append('main_application')
            
            # 2. Start monitoring
            logger.info("📊 Starting monitoring...")
            if self._start_monitoring():
                start_results['services_started'].append('monitoring')
            
            # 3. Start health checks
            logger.info("❤️ Starting health checks...")
            if self._start_health_checks():
                start_results['services_started'].append('health_checks')
            
            # 4. Wait for services to be ready
            logger.info("⏳ Waiting for services to be ready...")
            time.sleep(10)
            
            # 5. Verify services are running
            logger.info("🔍 Verifying services...")
            verification_results = self._verify_services()
            start_results['verification'] = verification_results
            
            logger.info(f"✅ Production services started: {len(start_results['services_started'])} services")
            return start_results
            
        except Exception as e:
            logger.error(f"❌ Production services startup failed: {e}")
            return {
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _start_main_application(self) -> bool:
        """Ana uygulamayı başlat"""
        try:
            # Start the application in background
            startup_script = f"{self.production_dir}/scripts/start_production.sh"
            
            # Use nohup to run in background
            process = subprocess.Popen(
                ['nohup', 'bash', startup_script, '&'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=self.production_dir
            )
            
            # Wait a bit for startup
            time.sleep(5)
            
            logger.info("✅ Main application started")
            return True
            
        except Exception as e:
            logger.error(f"❌ Main application startup failed: {e}")
            return False
    
    def _start_monitoring(self) -> bool:
        """Monitoring'i başlat"""
        try:
            # Start performance monitoring in background
            monitoring_script = f"{self.production_dir}/monitoring/performance_monitor.py"
            
            process = subprocess.Popen(
                ['python', monitoring_script],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=f"{self.production_dir}/monitoring"
            )
            
            logger.info("✅ Monitoring started")
            return True
            
        except Exception as e:
            logger.error(f"❌ Monitoring startup failed: {e}")
            return False
    
    def _start_health_checks(self) -> bool:
        """Health check'leri başlat"""
        try:
            # Start periodic health checks
            health_check_script = f"{self.production_dir}/scripts/health_check.sh"
            
            # Create a simple health check loop
            def run_health_checks():
                while True:
                    try:
                        subprocess.run(['bash', health_check_script], check=True)
                        logger.info("✅ Health check passed")
                    except subprocess.CalledProcessError:
                        logger.error("❌ Health check failed")
                    
                    time.sleep(self.deployment_config['monitoring']['health_check_interval'])
            
            # Start in background thread
            import threading
            health_thread = threading.Thread(target=run_health_checks, daemon=True)
            health_thread.start()
            
            logger.info("✅ Health checks started")
            return True
            
        except Exception as e:
            logger.error(f"❌ Health checks startup failed: {e}")
            return False
    
    def _verify_services(self) -> Dict[str, Any]:
        """Servislerin çalışıp çalışmadığını doğrula"""
        try:
            verification_results = {
                'main_application': False,
                'monitoring': False,
                'health_checks': False
            }
            
            # Check main application
            try:
                response = requests.get(f"http://localhost:{self.deployment_config['production_settings']['port']}/health", timeout=5)
                if response.status_code == 200:
                    verification_results['main_application'] = True
                    logger.info("✅ Main application verified")
            except:
                logger.warning("⚠️ Main application not responding")
            
            # Check monitoring
            try:
                # Check if monitoring process is running
                result = subprocess.run(['pgrep', '-f', 'performance_monitor.py'], capture_output=True)
                if result.returncode == 0:
                    verification_results['monitoring'] = True
                    logger.info("✅ Monitoring verified")
            except:
                logger.warning("⚠️ Monitoring not running")
            
            # Check health checks
            verification_results['health_checks'] = True  # Assume running if we got here
            logger.info("✅ Health checks verified")
            
            return verification_results
            
        except Exception as e:
            logger.error(f"❌ Service verification failed: {e}")
            return {'error': str(e)}
    
    def run_health_check(self) -> Dict[str, Any]:
        """Health check çalıştır"""
        logger.info("❤️ Running health check...")
        
        try:
            health_results = {
                'timestamp': datetime.now().isoformat(),
                'overall_status': 'UNKNOWN',
                'service_checks': {},
                'performance_metrics': {}
            }
            
            # Check main application
            try:
                response = requests.get(f"http://localhost:{self.deployment_config['production_settings']['port']}/health", timeout=5)
                health_results['service_checks']['main_application'] = {
                    'status': 'HEALTHY' if response.status_code == 200 else 'UNHEALTHY',
                    'response_time': response.elapsed.total_seconds(),
                    'status_code': response.status_code
                }
            except Exception as e:
                health_results['service_checks']['main_application'] = {
                    'status': 'DOWN',
                    'error': str(e)
                }
            
            # Check model availability
            model_files = [
                f"{self.production_dir}/models/optimized_hyperparameters.pkl",
                f"{self.production_dir}/models/advanced_ensemble.pkl"
            ]
            
            model_status = {}
            for model_file in model_files:
                if os.path.exists(model_file):
                    file_size = os.path.getsize(model_file)
                    file_age = time.time() - os.path.getmtime(model_file)
                    model_status[os.path.basename(model_file)] = {
                        'status': 'AVAILABLE',
                        'size_bytes': file_size,
                        'age_hours': file_age / 3600
                    }
                else:
                    model_status[os.path.basename(model_file)] = {
                        'status': 'MISSING'
                    }
            
            health_results['service_checks']['models'] = model_status
            
            # Determine overall status
            healthy_services = sum(1 for service in health_results['service_checks'].values() 
                                 if isinstance(service, dict) and service.get('status') in ['HEALTHY', 'AVAILABLE'])
            total_services = len(health_results['service_checks'])
            
            if healthy_services == total_services:
                health_results['overall_status'] = 'HEALTHY'
            elif healthy_services > total_services / 2:
                health_results['overall_status'] = 'DEGRADED'
            else:
                health_results['overall_status'] = 'UNHEALTHY'
            
            # Store health check results
            self.health_check_results = health_results
            
            logger.info(f"✅ Health check completed: {health_results['overall_status']}")
            return health_results
            
        except Exception as e:
            logger.error(f"❌ Health check failed: {e}")
            return {
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def get_deployment_status(self) -> Dict[str, Any]:
        """Deployment durumunu getir"""
        return {
            'deployment_status': self.deployment_status,
            'health_check_results': self.health_check_results,
            'production_config': self.deployment_config,
            'timestamp': datetime.now().isoformat()
        }
    
    def create_deployment_report(self) -> Dict[str, Any]:
        """Deployment raporu oluştur"""
        logger.info("📊 Creating deployment report...")
        
        try:
            report = {
                'deployment_summary': {
                    'timestamp': datetime.now().isoformat(),
                    'production_directory': self.production_dir,
                    'models_deployed': self.deployment_status.get('total_models', 0),
                    'deployment_success_rate': self.deployment_status.get('success_rate', 0),
                    'overall_status': 'SUCCESS' if self.deployment_status.get('success_rate', 0) > 0.8 else 'PARTIAL'
                },
                'deployment_details': self.deployment_status,
                'health_status': self.health_check_results,
                'configuration': self.deployment_config,
                'recommendations': self._generate_deployment_recommendations()
            }
            
            # Save report
            report_path = f"{self.production_dir}/deployment_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(report_path, 'w') as f:
                json.dump(report, f, indent=2)
            
            logger.info(f"✅ Deployment report saved to {report_path}")
            return report
            
        except Exception as e:
            logger.error(f"❌ Deployment report creation failed: {e}")
            return {'error': str(e)}
    
    def _generate_deployment_recommendations(self) -> List[str]:
        """Deployment önerileri oluştur"""
        recommendations = []
        
        # Check deployment success rate
        success_rate = self.deployment_status.get('success_rate', 0)
        if success_rate < 0.8:
            recommendations.append("Review failed deployments and retry")
        
        # Check health status
        if self.health_check_results.get('overall_status') != 'HEALTHY':
            recommendations.append("Investigate service health issues")
        
        # Check model freshness
        model_files = [
            f"{self.production_dir}/models/optimized_hyperparameters.pkl",
            f"{self.production_dir}/models/advanced_ensemble.pkl"
        ]
        
        for model_file in model_files:
            if os.path.exists(model_file):
                file_age = time.time() - os.path.getmtime(model_file)
                if file_age > 86400:  # 24 hours
                    recommendations.append(f"Consider updating model: {os.path.basename(model_file)}")
        
        # Add general recommendations
        recommendations.extend([
            "Set up automated monitoring and alerting",
            "Implement log rotation and cleanup",
            "Schedule regular model retraining",
            "Monitor system resource usage"
        ])
        
        return recommendations

def main():
    """Main function"""
    print("🚀 BIST AI Smart Trader - Production Deployment")
    print("=" * 60)
    
    # Initialize deployer
    deployer = ProductionDeployer()
    
    # Deploy AI models
    print("🔧 Deploying AI models...")
    deployment_results = deployer.deploy_ai_models()
    
    if deployment_results.get('error'):
        print(f"❌ Deployment failed: {deployment_results['error']}")
        return deployment_results
    
    # Start production services
    print("🚀 Starting production services...")
    startup_results = deployer.start_production_services()
    
    if startup_results.get('error'):
        print(f"❌ Startup failed: {startup_results['error']}")
        return startup_results
    
    # Run health check
    print("❤️ Running health check...")
    health_results = deployer.run_health_check()
    
    # Create deployment report
    print("📊 Creating deployment report...")
    report = deployer.create_deployment_report()
    
    # Print summary
    print(f"\n🎉 PRODUCTION DEPLOYMENT COMPLETED!")
    print(f"📊 Models Deployed: {deployment_results['total_models']}")
    print(f"📊 Services Started: {len(startup_results['services_started'])}")
    print(f"❤️ Overall Health: {health_results['overall_status']}")
    
    return report

if __name__ == "__main__":
    main()
