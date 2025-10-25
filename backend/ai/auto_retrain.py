#!/usr/bin/env python3
"""
BIST AI Smart Trader - Auto Retrain Pipeline
Automated model retraining based on performance degradation
"""

import asyncio
import logging
import schedule
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any
import json
import os
from pathlib import Path

# Import ensemble engine
from ensemble_engine import ensemble_engine

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/auto_retrain.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AutoRetrainPipeline:
    def __init__(self):
        self.retrain_config = {
            'enabled': True,
            'schedule': {
                'daily': '06:00',  # 6 AM daily
                'weekly': 'sunday',  # Sunday weekly
                'monthly': 1  # 1st of month
            },
            'triggers': {
                'performance_threshold': 0.75,  # Retrain if accuracy < 75%
                'data_freshness_hours': 24,  # Retrain if data older than 24h
                'error_rate_threshold': 0.1  # Retrain if error rate > 10%
            },
            'symbols': ['THYAO.IS', 'ASELS.IS', 'TUPRS.IS', 'SISE.IS', 'EREGL.IS']
        }
        
        self.retrain_history = []
        self.performance_monitor = {}
        
        # Create logs directory
        os.makedirs('logs', exist_ok=True)
        
        logger.info("🔄 Auto Retrain Pipeline initialized")

    def check_performance_degradation(self) -> Dict[str, Any]:
        """Check if models need retraining based on performance"""
        degradation_report = {
            'needs_retrain': False,
            'reasons': [],
            'models_affected': []
        }
        
        try:
            # Load current performance history
            perf_file = Path('./ai/models/performance_history.json')
            if not perf_file.exists():
                degradation_report['reasons'].append('No performance history found')
                degradation_report['needs_retrain'] = True
                return degradation_report
            
            with open(perf_file, 'r') as f:
                performance_history = json.load(f)
            
            current_time = datetime.now()
            threshold = self.retrain_config['triggers']['performance_threshold']
            
            for model_name, perf_data in performance_history.items():
                # Check if performance is below threshold
                if perf_data.get('mse', 1.0) > (1 - threshold):
                    degradation_report['models_affected'].append(model_name)
                    degradation_report['reasons'].append(f'{model_name} performance below threshold')
                
                # Check data freshness
                last_updated = datetime.fromisoformat(perf_data.get('last_updated', '2020-01-01'))
                hours_old = (current_time - last_updated).total_seconds() / 3600
                
                if hours_old > self.retrain_config['triggers']['data_freshness_hours']:
                    degradation_report['models_affected'].append(model_name)
                    degradation_report['reasons'].append(f'{model_name} data is {hours_old:.1f} hours old')
            
            if degradation_report['models_affected']:
                degradation_report['needs_retrain'] = True
            
            logger.info(f"📊 Performance check completed: {len(degradation_report['models_affected'])} models need retraining")
            
        except Exception as e:
            logger.error(f"❌ Performance check failed: {e}")
            degradation_report['reasons'].append(f'Performance check error: {e}')
            degradation_report['needs_retrain'] = True
        
        return degradation_report

    def check_error_rate(self) -> Dict[str, Any]:
        """Check error rates from recent predictions"""
        error_report = {
            'needs_retrain': False,
            'error_rate': 0.0,
            'recent_errors': []
        }
        
        try:
            # Check recent error logs
            error_log_file = Path('logs/prediction_errors.json')
            if not error_log_file.exists():
                return error_report
            
            with open(error_log_file, 'r') as f:
                error_logs = json.load(f)
            
            # Get errors from last 24 hours
            current_time = datetime.now()
            recent_errors = []
            
            for error_log in error_logs:
                error_time = datetime.fromisoformat(error_log.get('timestamp', '2020-01-01'))
                if (current_time - error_time).total_seconds() < 86400:  # 24 hours
                    recent_errors.append(error_log)
            
            # Calculate error rate
            total_predictions = len(recent_errors) + 100  # Assume 100 successful predictions
            error_rate = len(recent_errors) / total_predictions
            
            error_report['error_rate'] = error_rate
            error_report['recent_errors'] = recent_errors
            
            if error_rate > self.retrain_config['triggers']['error_rate_threshold']:
                error_report['needs_retrain'] = True
                logger.warning(f"⚠️ High error rate detected: {error_rate:.2%}")
            
        except Exception as e:
            logger.error(f"❌ Error rate check failed: {e}")
        
        return error_report

    async def retrain_models(self, reason: str = "scheduled") -> Dict[str, Any]:
        """Retrain all models"""
        retrain_start = datetime.now()
        logger.info(f"🔄 Starting model retraining - Reason: {reason}")
        
        retrain_result = {
            'status': 'started',
            'start_time': retrain_start.isoformat(),
            'reason': reason,
            'models_trained': [],
            'models_failed': [],
            'performance_improvements': {}
        }
        
        try:
            # Train ensemble models
            training_results = await ensemble_engine.train_ensemble(self.retrain_config['symbols'])
            
            # Process results
            for symbol, results in training_results.items():
                for model_type, result in results.items():
                    model_name = f"{symbol}_{model_type}"
                    
                    if result.get('status') == 'success':
                        retrain_result['models_trained'].append(model_name)
                        
                        # Record performance improvement
                        if 'mse' in result:
                            retrain_result['performance_improvements'][model_name] = {
                                'mse': result['mse'],
                                'mae': result.get('mae', 0)
                            }
                    else:
                        retrain_result['models_failed'].append({
                            'model': model_name,
                            'error': result.get('error', 'Unknown error')
                        })
            
            # Save models
            ensemble_engine.save_models()
            
            # Update retrain history
            retrain_result['status'] = 'completed'
            retrain_result['end_time'] = datetime.now().isoformat()
            retrain_result['duration_minutes'] = (datetime.now() - retrain_start).total_seconds() / 60
            
            self.retrain_history.append(retrain_result)
            
            # Save retrain history
            self.save_retrain_history()
            
            logger.info(f"✅ Retraining completed: {len(retrain_result['models_trained'])} models trained, {len(retrain_result['models_failed'])} failed")
            
        except Exception as e:
            logger.error(f"❌ Retraining failed: {e}")
            retrain_result['status'] = 'failed'
            retrain_result['error'] = str(e)
            retrain_result['end_time'] = datetime.now().isoformat()
        
        return retrain_result

    def save_retrain_history(self):
        """Save retrain history to file"""
        try:
            history_file = Path('logs/retrain_history.json')
            with open(history_file, 'w') as f:
                json.dump(self.retrain_history, f, indent=2)
        except Exception as e:
            logger.error(f"❌ Failed to save retrain history: {e}")

    def load_retrain_history(self):
        """Load retrain history from file"""
        try:
            history_file = Path('logs/retrain_history.json')
            if history_file.exists():
                with open(history_file, 'r') as f:
                    self.retrain_history = json.load(f)
                logger.info(f"📂 Loaded {len(self.retrain_history)} retrain records")
        except Exception as e:
            logger.error(f"❌ Failed to load retrain history: {e}")

    async def scheduled_retrain(self):
        """Scheduled retraining task"""
        logger.info("⏰ Scheduled retraining triggered")
        
        # Check if retraining is needed
        perf_check = self.check_performance_degradation()
        error_check = self.check_error_rate()
        
        if perf_check['needs_retrain'] or error_check['needs_retrain']:
            reasons = perf_check['reasons'] + [f"Error rate: {error_check['error_rate']:.2%}"]
            reason = "scheduled - " + "; ".join(reasons)
            
            await self.retrain_models(reason)
        else:
            logger.info("✅ No retraining needed - models performing well")

    async def emergency_retrain(self, reason: str = "emergency"):
        """Emergency retraining for critical issues"""
        logger.warning(f"🚨 Emergency retraining triggered - Reason: {reason}")
        await self.retrain_models(f"emergency - {reason}")

    def setup_scheduler(self):
        """Setup scheduled retraining"""
        # Daily retraining
        schedule.every().day.at(self.retrain_config['schedule']['daily']).do(
            lambda: asyncio.create_task(self.scheduled_retrain())
        )
        
        # Weekly retraining
        if self.retrain_config['schedule']['weekly'] == 'sunday':
            schedule.every().sunday.at(self.retrain_config['schedule']['daily']).do(
                lambda: asyncio.create_task(self.scheduled_retrain())
            )
        
        # Monthly retraining
        schedule.every().month.do(
            lambda: asyncio.create_task(self.scheduled_retrain())
        )
        
        logger.info("⏰ Scheduler setup completed")

    async def run_scheduler(self):
        """Run the scheduler loop"""
        logger.info("🔄 Starting auto retrain scheduler")
        
        while True:
            try:
                schedule.run_pending()
                await asyncio.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"❌ Scheduler error: {e}")
                await asyncio.sleep(60)

    def get_retrain_status(self) -> Dict[str, Any]:
        """Get current retrain status"""
        perf_check = self.check_performance_degradation()
        error_check = self.check_error_rate()
        
        return {
            'enabled': self.retrain_config['enabled'],
            'last_retrain': self.retrain_history[-1] if self.retrain_history else None,
            'performance_status': perf_check,
            'error_status': error_check,
            'next_scheduled': schedule.next_run().isoformat() if schedule.jobs else None,
            'total_retrains': len(self.retrain_history)
        }

# Global auto retrain instance
auto_retrain = AutoRetrainPipeline()

async def main():
    """Main function for testing"""
    # Load existing history
    auto_retrain.load_retrain_history()
    
    # Setup scheduler
    auto_retrain.setup_scheduler()
    
    # Test retraining
    result = await auto_retrain.retrain_models("test")
    print(f"Retrain result: {result['status']}")
    
    # Get status
    status = auto_retrain.get_retrain_status()
    print(f"Status: {status}")

if __name__ == "__main__":
    asyncio.run(main())