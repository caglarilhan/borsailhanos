#!/usr/bin/env python3
"""
🧠 Adaptive Learning System
Real-time model improvement for maximum accuracy
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import pickle
import json
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

@dataclass
class TradeResult:
    """İşlem sonucu"""
    symbol: str
    prediction: str
    actual_result: str
    confidence: float
    actual_return: float
    timestamp: datetime
    features_snapshot: Dict

class AdaptiveLearningSystem:
    """Adaptive öğrenme sistemi"""
    
    def __init__(self):
        self.trade_history = []
        self.model_performance = {}
        self.feature_performance = {}
        self.learning_rate = 0.1
        self.performance_threshold = 0.85
        self.retrain_interval = 10  # Her 10 işlemde bir retrain
        
    def record_trade_result(self, trade_result: TradeResult):
        """İşlem sonucunu kaydet"""
        logger.info(f"📝 {trade_result.symbol} işlem sonucu kaydediliyor...")
        
        self.trade_history.append(trade_result)
        
        # Performance güncelle
        self._update_performance_metrics()
        
        # Adaptive retraining kontrolü
        if len(self.trade_history) % self.retrain_interval == 0:
            self._trigger_adaptive_retraining()
    
    def _update_performance_metrics(self):
        """Performans metriklerini güncelle"""
        if not self.trade_history:
            return
        
        # Son 50 işlemin performansı
        recent_trades = self.trade_history[-50:]
        
        # Accuracy
        correct_predictions = sum(1 for trade in recent_trades 
                                if self._is_prediction_correct(trade))
        accuracy = correct_predictions / len(recent_trades)
        
        # Symbol-based performance
        symbol_performance = {}
        for trade in recent_trades:
            symbol = trade.symbol
            if symbol not in symbol_performance:
                symbol_performance[symbol] = {'correct': 0, 'total': 0}
            
            symbol_performance[symbol]['total'] += 1
            if self._is_prediction_correct(trade):
                symbol_performance[symbol]['correct'] += 1
        
        # Feature importance tracking
        self._update_feature_importance(recent_trades)
        
        self.model_performance = {
            'overall_accuracy': accuracy,
            'symbol_performance': symbol_performance,
            'total_trades': len(self.trade_history),
            'recent_trades': len(recent_trades),
            'last_updated': datetime.now().isoformat()
        }
        
        logger.info(f"📊 Performance güncellendi: Accuracy {accuracy:.2%}")
    
    def _is_prediction_correct(self, trade: TradeResult) -> bool:
        """Tahmin doğru mu?"""
        if trade.prediction in ['STRONG_BUY', 'BUY']:
            return trade.actual_return > 0.01  # >1% kazanç
        elif trade.prediction in ['STRONG_SELL', 'SELL']:
            return trade.actual_return < -0.01  # >1% zarar
        else:  # HOLD
            return -0.01 <= trade.actual_return <= 0.01  # ±1% aralığında
    
    def _update_feature_importance(self, trades: List[TradeResult]):
        """Feature importance güncelle"""
        try:
            # Feature performance tracking
            feature_scores = {}
            
            for trade in trades:
                is_correct = self._is_prediction_correct(trade)
                
                for feature, value in trade.features_snapshot.items():
                    if feature not in feature_scores:
                        feature_scores[feature] = {'correct': 0, 'total': 0, 'avg_value': 0}
                    
                    feature_scores[feature]['total'] += 1
                    feature_scores[feature]['avg_value'] += value
                    
                    if is_correct:
                        feature_scores[feature]['correct'] += 1
            
            # Calculate feature accuracy
            for feature, data in feature_scores.items():
                if data['total'] > 0:
                    data['accuracy'] = data['correct'] / data['total']
                    data['avg_value'] /= data['total']
            
            self.feature_performance = feature_scores
            
        except Exception as e:
            logger.error(f"❌ Feature importance güncelleme hatası: {e}")
    
    def _trigger_adaptive_retraining(self):
        """Adaptive retraining tetikle"""
        logger.info("🔄 Adaptive retraining tetiklendi...")
        
        try:
            current_accuracy = self.model_performance.get('overall_accuracy', 0)
            
            if current_accuracy < self.performance_threshold:
                logger.warning(f"⚠️ Accuracy düşük ({current_accuracy:.2%}), model iyileştiriliyor...")
                
                # Feature selection optimization
                best_features = self._get_best_features()
                
                # Hyperparameter optimization
                optimized_params = self._optimize_hyperparameters()
                
                # Model ensemble reweighting
                ensemble_weights = self._recalculate_ensemble_weights()
                
                logger.info("✅ Adaptive retraining tamamlandı")
                
                return {
                    'best_features': best_features,
                    'optimized_params': optimized_params,
                    'ensemble_weights': ensemble_weights
                }
            else:
                logger.info(f"✅ Accuracy iyi seviyede ({current_accuracy:.2%})")
                return None
                
        except Exception as e:
            logger.error(f"❌ Adaptive retraining hatası: {e}")
            return None
    
    def _get_best_features(self) -> List[str]:
        """En iyi feature'ları seç"""
        if not self.feature_performance:
            return []
        
        # Accuracy'e göre sırala
        sorted_features = sorted(
            self.feature_performance.items(),
            key=lambda x: x[1].get('accuracy', 0),
            reverse=True
        )
        
        # Top %80'i al
        top_count = max(1, int(len(sorted_features) * 0.8))
        best_features = [feature for feature, _ in sorted_features[:top_count]]
        
        logger.info(f"🎯 En iyi {len(best_features)} feature seçildi")
        return best_features
    
    def _optimize_hyperparameters(self) -> Dict:
        """Hyperparameter optimizasyonu"""
        # Recent performance'a göre adaptive parameters
        recent_accuracy = self.model_performance.get('overall_accuracy', 0.6)
        
        if recent_accuracy < 0.7:
            # Accuracy düşükse, more conservative parameters
            params = {
                'learning_rate': 0.05,
                'max_depth': 8,
                'n_estimators': 300,
                'regularization': 0.1
            }
        elif recent_accuracy < 0.8:
            # Orta seviye
            params = {
                'learning_rate': 0.1,
                'max_depth': 10,
                'n_estimators': 200,
                'regularization': 0.05
            }
        else:
            # Accuracy iyiyse, more aggressive
            params = {
                'learning_rate': 0.15,
                'max_depth': 12,
                'n_estimators': 150,
                'regularization': 0.01
            }
        
        logger.info(f"⚙️ Hyperparameter optimized for accuracy {recent_accuracy:.2%}")
        return params
    
    def _recalculate_ensemble_weights(self) -> Dict[str, float]:
        """Ensemble ağırlıklarını yeniden hesapla"""
        # Symbol performance'a göre weights
        symbol_perf = self.model_performance.get('symbol_performance', {})
        
        total_trades = sum(data['total'] for data in symbol_perf.values())
        
        ensemble_weights = {}
        
        if total_trades > 0:
            for symbol, data in symbol_perf.items():
                accuracy = data['correct'] / data['total'] if data['total'] > 0 else 0.5
                weight = (accuracy ** 2) * (data['total'] / total_trades)  # Accuracy² * frequency
                ensemble_weights[symbol] = weight
        
        # Normalize weights
        total_weight = sum(ensemble_weights.values())
        if total_weight > 0:
            for symbol in ensemble_weights:
                ensemble_weights[symbol] /= total_weight
        
        logger.info(f"⚖️ Ensemble weights recalculated: {len(ensemble_weights)} symbols")
        return ensemble_weights
    
    def get_performance_report(self) -> Dict:
        """Performans raporu"""
        if not self.trade_history:
            return {"error": "No trade history available"}
        
        # Recent performance (last 30 days)
        cutoff_date = datetime.now() - timedelta(days=30)
        recent_trades = [t for t in self.trade_history if t.timestamp > cutoff_date]
        
        if not recent_trades:
            recent_trades = self.trade_history[-50:]  # Son 50 işlem
        
        # Statistics
        total_trades = len(recent_trades)
        correct_predictions = sum(1 for t in recent_trades if self._is_prediction_correct(t))
        accuracy = correct_predictions / total_trades if total_trades > 0 else 0
        
        # Returns analysis
        returns = [t.actual_return for t in recent_trades]
        avg_return = np.mean(returns) if returns else 0
        win_rate = sum(1 for r in returns if r > 0) / len(returns) if returns else 0
        
        # Best/worst predictions
        sorted_trades = sorted(recent_trades, key=lambda x: x.actual_return, reverse=True)
        best_trades = sorted_trades[:5]
        worst_trades = sorted_trades[-5:]
        
        report = {
            'performance_summary': {
                'total_trades': total_trades,
                'accuracy': accuracy,
                'win_rate': win_rate,
                'average_return': avg_return,
                'period_days': (datetime.now() - recent_trades[0].timestamp).days if recent_trades else 0
            },
            'best_predictions': [
                {
                    'symbol': t.symbol,
                    'prediction': t.prediction,
                    'return': t.actual_return,
                    'confidence': t.confidence
                } for t in best_trades
            ],
            'worst_predictions': [
                {
                    'symbol': t.symbol,
                    'prediction': t.prediction,
                    'return': t.actual_return,
                    'confidence': t.confidence
                } for t in worst_trades
            ],
            'feature_performance': dict(list(self.feature_performance.items())[:10]),  # Top 10 features
            'model_performance': self.model_performance,
            'generated_at': datetime.now().isoformat()
        }
        
        return report
    
    def save_learning_state(self, filepath: str):
        """Öğrenme durumunu kaydet"""
        try:
            state = {
                'trade_history': [asdict(trade) for trade in self.trade_history],
                'model_performance': self.model_performance,
                'feature_performance': self.feature_performance,
                'learning_rate': self.learning_rate,
                'saved_at': datetime.now().isoformat()
            }
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(state, f, ensure_ascii=False, indent=2, default=str)
            
            logger.info(f"💾 Learning state saved: {filepath}")
            
        except Exception as e:
            logger.error(f"❌ Learning state save hatası: {e}")
    
    def load_learning_state(self, filepath: str):
        """Öğrenme durumunu yükle"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                state = json.load(f)
            
            # Reconstruct trade history
            self.trade_history = []
            for trade_data in state.get('trade_history', []):
                trade_data['timestamp'] = datetime.fromisoformat(trade_data['timestamp'])
                trade = TradeResult(**trade_data)
                self.trade_history.append(trade)
            
            self.model_performance = state.get('model_performance', {})
            self.feature_performance = state.get('feature_performance', {})
            self.learning_rate = state.get('learning_rate', 0.1)
            
            logger.info(f"📚 Learning state loaded: {len(self.trade_history)} trades")
            
        except Exception as e:
            logger.error(f"❌ Learning state load hatası: {e}")

def test_adaptive_learning():
    """Adaptive learning test"""
    logger.info("🧪 Adaptive Learning System test başlıyor...")
    
    learning_system = AdaptiveLearningSystem()
    
    # Simulate some trade results
    test_trades = [
        TradeResult(
            symbol="GARAN.IS",
            prediction="BUY",
            actual_result="SUCCESS",
            confidence=0.85,
            actual_return=0.025,
            timestamp=datetime.now() - timedelta(days=5),
            features_snapshot={'ema_20_ratio': 1.02, 'volume_ratio': 1.5, 'rsi': 45}
        ),
        TradeResult(
            symbol="AKBNK.IS",
            prediction="STRONG_BUY",
            actual_result="SUCCESS",
            confidence=0.92,
            actual_return=0.034,
            timestamp=datetime.now() - timedelta(days=4),
            features_snapshot={'ema_20_ratio': 1.05, 'volume_ratio': 2.1, 'rsi': 38}
        ),
        TradeResult(
            symbol="SISE.IS",
            prediction="BUY",
            actual_result="FAILURE",
            confidence=0.72,
            actual_return=-0.015,
            timestamp=datetime.now() - timedelta(days=3),
            features_snapshot={'ema_20_ratio': 0.98, 'volume_ratio': 0.8, 'rsi': 65}
        )
    ]
    
    # Record trades
    for trade in test_trades:
        learning_system.record_trade_result(trade)
    
    # Get performance report
    report = learning_system.get_performance_report()
    
    logger.info("="*60)
    logger.info("📊 ADAPTIVE LEARNING REPORT")
    logger.info("="*60)
    logger.info(f"Accuracy: {report['performance_summary']['accuracy']:.2%}")
    logger.info(f"Win Rate: {report['performance_summary']['win_rate']:.2%}")
    logger.info(f"Avg Return: {report['performance_summary']['average_return']:.2%}")
    logger.info("="*60)
    
    return learning_system

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_adaptive_learning()
