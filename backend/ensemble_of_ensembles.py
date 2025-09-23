#!/usr/bin/env python3
"""
🎭 ENSEMBLE OF ENSEMBLES SYSTEM
Meta-ensemble that combines multiple ensemble methods
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import warnings

warnings.filterwarnings("ignore")

logger = logging.getLogger(__name__)

@dataclass
class EnsembleSignal:
    """Ensemble sinyali"""
    symbol: str
    signal: str
    confidence: float
    accuracy_estimate: float
    ensemble_type: str
    timestamp: datetime

class EnsembleOfEnsembles:
    """Ensemble of ensembles sistemi"""
    
    def __init__(self):
        self.ensemble_weights = {
            'voting': 0.25,
            'stacking': 0.25,
            'bagging': 0.25,
            'boosting': 0.25
        }
        
        self.signal_weights = {
            'BUY': 1.0,
            'STRONG_BUY': 1.5,
            'SELL': -1.0,
            'STRONG_SELL': -1.5,
            'NEUTRAL': 0.0
        }
        
        self.accuracy_thresholds = {
            'EXCELLENT': 0.9,
            'GOOD': 0.8,
            'FAIR': 0.7,
            'POOR': 0.6
        }
    
    def voting_ensemble(self, signals: List[EnsembleSignal]) -> Tuple[str, float, float]:
        """Majority voting ensemble"""
        try:
            if not signals:
                return "NEUTRAL", 0.5, 0.0
            
            # Count votes
            vote_counts = {}
            total_confidence = 0
            
            for signal in signals:
                vote_counts[signal.signal] = vote_counts.get(signal.signal, 0) + 1
                total_confidence += signal.confidence
            
            # Find majority
            majority_signal = max(vote_counts, key=vote_counts.get)
            majority_votes = vote_counts[majority_signal]
            total_votes = len(signals)
            
            # Calculate confidence based on majority strength
            voting_confidence = majority_votes / total_votes
            avg_confidence = total_confidence / total_votes
            
            # Combine voting strength with average confidence
            final_confidence = (voting_confidence * 0.6) + (avg_confidence * 0.4)
            
            # Calculate accuracy estimate
            accuracy_estimate = final_confidence * 100
            
            return majority_signal, final_confidence, accuracy_estimate
            
        except Exception as e:
            logger.error(f"Voting ensemble error: {e}")
            return "NEUTRAL", 0.5, 50.0
    
    def stacking_ensemble(self, signals: List[EnsembleSignal]) -> Tuple[str, float, float]:
        """Stacking ensemble (meta-learner)"""
        try:
            if not signals:
                return "NEUTRAL", 0.5, 0.0
            
            # Convert signals to numerical features
            features = []
            for signal in signals:
                signal_value = self.signal_weights.get(signal.signal, 0.0)
                features.append([signal_value, signal.confidence, signal.accuracy_estimate])
            
            features = np.array(features)
            
            # Simple meta-learner: weighted average based on confidence
            weights = features[:, 1]  # confidence as weights
            weights = weights / np.sum(weights) if np.sum(weights) > 0 else np.ones(len(weights)) / len(weights)
            
            # Weighted signal prediction
            weighted_signal_value = np.sum(features[:, 0] * weights)
            weighted_confidence = np.sum(features[:, 1] * weights)
            weighted_accuracy = np.sum(features[:, 2] * weights)
            
            # Convert back to signal
            if weighted_signal_value > 0.3:
                final_signal = "BUY"
            elif weighted_signal_value > 0.1:
                final_signal = "BUY"
            elif weighted_signal_value < -0.3:
                final_signal = "SELL"
            elif weighted_signal_value < -0.1:
                final_signal = "SELL"
            else:
                final_signal = "NEUTRAL"
            
            # Enhance signal if confidence is high
            if weighted_confidence > 0.8:
                if final_signal == "BUY":
                    final_signal = "STRONG_BUY"
                elif final_signal == "SELL":
                    final_signal = "STRONG_SELL"
            
            return final_signal, weighted_confidence, weighted_accuracy
            
        except Exception as e:
            logger.error(f"Stacking ensemble error: {e}")
            return "NEUTRAL", 0.5, 50.0
    
    def bagging_ensemble(self, signals: List[EnsembleSignal]) -> Tuple[str, float, float]:
        """Bootstrap aggregating ensemble"""
        try:
            if not signals:
                return "NEUTRAL", 0.5, 0.0
            
            # Bootstrap sampling (with replacement)
            n_samples = len(signals)
            bootstrap_samples = []
            
            for _ in range(10):  # 10 bootstrap samples
                sample_indices = np.random.choice(n_samples, size=n_samples, replace=True)
                bootstrap_sample = [signals[i] for i in sample_indices]
                bootstrap_samples.append(bootstrap_sample)
            
            # Aggregate bootstrap results
            bootstrap_signals = []
            bootstrap_confidences = []
            bootstrap_accuracies = []
            
            for sample in bootstrap_samples:
                # Simple aggregation for each bootstrap sample
                signal_values = [self.signal_weights.get(s.signal, 0.0) for s in sample]
                confidences = [s.confidence for s in sample]
                accuracies = [s.accuracy_estimate for s in sample]
                
                avg_signal_value = np.mean(signal_values)
                avg_confidence = np.mean(confidences)
                avg_accuracy = np.mean(accuracies)
                
                bootstrap_signals.append(avg_signal_value)
                bootstrap_confidences.append(avg_confidence)
                bootstrap_accuracies.append(avg_accuracy)
            
            # Final aggregation
            final_signal_value = np.mean(bootstrap_signals)
            final_confidence = np.mean(bootstrap_confidences)
            final_accuracy = np.mean(bootstrap_accuracies)
            
            # Convert to signal
            if final_signal_value > 0.3:
                final_signal = "BUY"
            elif final_signal_value > 0.1:
                final_signal = "BUY"
            elif final_signal_value < -0.3:
                final_signal = "SELL"
            elif final_signal_value < -0.1:
                final_signal = "SELL"
            else:
                final_signal = "NEUTRAL"
            
            return final_signal, final_confidence, final_accuracy
            
        except Exception as e:
            logger.error(f"Bagging ensemble error: {e}")
            return "NEUTRAL", 0.5, 50.0
    
    def boosting_ensemble(self, signals: List[EnsembleSignal]) -> Tuple[str, float, float]:
        """Boosting ensemble (adaptive weighting)"""
        try:
            if not signals:
                return "NEUTRAL", 0.5, 0.0
            
            # Initialize weights
            weights = np.ones(len(signals)) / len(signals)
            
            # Adaptive boosting iterations
            for iteration in range(5):  # 5 boosting iterations
                # Calculate weighted prediction
                weighted_signal_value = 0
                total_weight = 0
                
                for i, signal in enumerate(signals):
                    signal_value = self.signal_weights.get(signal.signal, 0.0)
                    weighted_signal_value += signal_value * weights[i]
                    total_weight += weights[i]
                
                if total_weight > 0:
                    weighted_signal_value /= total_weight
                
                # Calculate error and update weights
                errors = []
                for i, signal in enumerate(signals):
                    signal_value = self.signal_weights.get(signal.signal, 0.0)
                    error = abs(signal_value - weighted_signal_value)
                    errors.append(error)
                
                # Update weights based on errors
                if np.sum(errors) > 0:
                    error_weights = np.array(errors) / np.sum(errors)
                    weights = weights * (1 + error_weights)  # Increase weight for high-error signals
                    weights = weights / np.sum(weights)  # Normalize
            
            # Final prediction
            final_signal_value = 0
            final_confidence = 0
            final_accuracy = 0
            total_weight = 0
            
            for i, signal in enumerate(signals):
                signal_value = self.signal_weights.get(signal.signal, 0.0)
                final_signal_value += signal_value * weights[i]
                final_confidence += signal.confidence * weights[i]
                final_accuracy += signal.accuracy_estimate * weights[i]
                total_weight += weights[i]
            
            if total_weight > 0:
                final_signal_value /= total_weight
                final_confidence /= total_weight
                final_accuracy /= total_weight
            
            # Convert to signal
            if final_signal_value > 0.3:
                final_signal = "BUY"
            elif final_signal_value > 0.1:
                final_signal = "BUY"
            elif final_signal_value < -0.3:
                final_signal = "SELL"
            elif final_signal_value < -0.1:
                final_signal = "SELL"
            else:
                final_signal = "NEUTRAL"
            
            return final_signal, final_confidence, final_accuracy
            
        except Exception as e:
            logger.error(f"Boosting ensemble error: {e}")
            return "NEUTRAL", 0.5, 50.0
    
    def combine_ensembles(self, signals: List[EnsembleSignal]) -> Tuple[str, float, float]:
        """Tüm ensemble metodlarını birleştir"""
        try:
            if not signals:
                return "NEUTRAL", 0.5, 50.0
            
            # Run all ensemble methods
            voting_signal, voting_conf, voting_acc = self.voting_ensemble(signals)
            stacking_signal, stacking_conf, stacking_acc = self.stacking_ensemble(signals)
            bagging_signal, bagging_conf, bagging_acc = self.bagging_ensemble(signals)
            boosting_signal, boosting_conf, boosting_acc = self.boosting_ensemble(signals)
            
            # Combine results with weights
            ensemble_results = [
                (voting_signal, voting_conf, voting_acc, self.ensemble_weights['voting']),
                (stacking_signal, stacking_conf, stacking_acc, self.ensemble_weights['stacking']),
                (bagging_signal, bagging_conf, bagging_acc, self.ensemble_weights['bagging']),
                (boosting_signal, boosting_conf, boosting_acc, self.ensemble_weights['boosting'])
            ]
            
            # Weighted combination
            final_signal_value = 0
            final_confidence = 0
            final_accuracy = 0
            total_weight = 0
            
            for signal, conf, acc, weight in ensemble_results:
                signal_value = self.signal_weights.get(signal, 0.0)
                final_signal_value += signal_value * weight
                final_confidence += conf * weight
                final_accuracy += acc * weight
                total_weight += weight
            
            if total_weight > 0:
                final_signal_value /= total_weight
                final_confidence /= total_weight
                final_accuracy /= total_weight
            
            # Convert to final signal
            if final_signal_value > 0.3:
                final_signal = "BUY"
            elif final_signal_value > 0.1:
                final_signal = "BUY"
            elif final_signal_value < -0.3:
                final_signal = "SELL"
            elif final_signal_value < -0.1:
                final_signal = "SELL"
            else:
                final_signal = "NEUTRAL"
            
            # Enhance signal if confidence is very high
            if final_confidence > 0.85:
                if final_signal == "BUY":
                    final_signal = "STRONG_BUY"
                elif final_signal == "SELL":
                    final_signal = "STRONG_SELL"
            
            return final_signal, final_confidence, final_accuracy
            
        except Exception as e:
            logger.error(f"Ensemble combination error: {e}")
            return "NEUTRAL", 0.5, 50.0
    
    def generate_ensemble_signals(self, symbol: str, base_signals: List[Dict]) -> EnsembleSignal:
        """Ensemble sinyalleri oluştur"""
        logger.info(f"🎭 {symbol} ensemble of ensembles analizi başlıyor...")
        
        try:
            # Convert base signals to EnsembleSignal objects
            ensemble_signals = []
            for signal_data in base_signals:
                ensemble_signal = EnsembleSignal(
                    symbol=symbol,
                    signal=signal_data.get('signal', 'NEUTRAL'),
                    confidence=signal_data.get('confidence', 0.5),
                    accuracy_estimate=signal_data.get('accuracy_estimate', 50.0),
                    ensemble_type=signal_data.get('source', 'Unknown'),
                    timestamp=datetime.now()
                )
                ensemble_signals.append(ensemble_signal)
            
            # Combine ensembles
            final_signal, final_confidence, final_accuracy = self.combine_ensembles(ensemble_signals)
            
            # Create final ensemble signal
            final_ensemble_signal = EnsembleSignal(
                symbol=symbol,
                signal=final_signal,
                confidence=final_confidence,
                accuracy_estimate=final_accuracy,
                ensemble_type='EnsembleOfEnsembles',
                timestamp=datetime.now()
            )
            
            logger.info(f"✅ {symbol} ensemble of ensembles tamamlandı: {final_signal} ({final_accuracy:.1f}%)")
            return final_ensemble_signal
            
        except Exception as e:
            logger.error(f"❌ {symbol} ensemble of ensembles hatası: {e}")
            return EnsembleSignal(
                symbol=symbol,
                signal="NEUTRAL",
                confidence=0.5,
                accuracy_estimate=50.0,
                ensemble_type='Error',
                timestamp=datetime.now()
            )
    
    def generate_ensemble_report(self, symbols: List[str], all_signals: Dict[str, List[Dict]]) -> str:
        """Ensemble raporu oluştur"""
        report = "\n" + "="*80 + "\n"
        report += "🎭 ENSEMBLE OF ENSEMBLES RESULTS\n"
        report += "="*80 + "\n"
        
        total_confidence = 0
        total_accuracy = 0
        signal_distribution = {}
        
        for symbol in symbols:
            if symbol in all_signals:
                ensemble_signal = self.generate_ensemble_signals(symbol, all_signals[symbol])
                
                report += f"🎯 {symbol}:\n"
                report += f"   Final Signal: {ensemble_signal.signal}\n"
                report += f"   Final Confidence: {ensemble_signal.confidence:.3f}\n"
                report += f"   Final Accuracy: {ensemble_signal.accuracy_estimate:.1f}%\n"
                report += f"   Ensemble Type: {ensemble_signal.ensemble_type}\n"
                report += "\n"
                
                total_confidence += ensemble_signal.confidence
                total_accuracy += ensemble_signal.accuracy_estimate
                
                signal_distribution[ensemble_signal.signal] = signal_distribution.get(ensemble_signal.signal, 0) + 1
        
        if symbols:
            avg_confidence = total_confidence / len(symbols)
            avg_accuracy = total_accuracy / len(symbols)
            
            report += "📊 ENSEMBLE OF ENSEMBLES SUMMARY:\n"
            report += f"   Total Symbols: {len(symbols)}\n"
            report += f"   Average Confidence: {avg_confidence:.3f}\n"
            report += f"   Average Accuracy: {avg_accuracy:.1f}%\n"
            report += f"   Signal Distribution: {signal_distribution}\n"
            report += f"   🎯 ENSEMBLE ACCURACY ESTIMATE: {avg_accuracy:.1f}%\n"
            report += "="*80 + "\n"
        
        return report

def test_ensemble_of_ensembles():
    """Ensemble of ensembles test"""
    logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
    logger.info("🧪 ENSEMBLE OF ENSEMBLES test başlıyor...")
    
    ensemble_system = EnsembleOfEnsembles()
    
    # Test signals
    test_symbols = ["GARAN.IS", "AKBNK.IS", "SISE.IS"]
    test_signals = {
        "GARAN.IS": [
            {"signal": "BUY", "confidence": 0.7, "accuracy_estimate": 75.0, "source": "System1"},
            {"signal": "BUY", "confidence": 0.6, "accuracy_estimate": 70.0, "source": "System2"},
            {"signal": "NEUTRAL", "confidence": 0.5, "accuracy_estimate": 60.0, "source": "System3"},
            {"signal": "SELL", "confidence": 0.4, "accuracy_estimate": 55.0, "source": "System4"}
        ],
        "AKBNK.IS": [
            {"signal": "SELL", "confidence": 0.8, "accuracy_estimate": 80.0, "source": "System1"},
            {"signal": "SELL", "confidence": 0.7, "accuracy_estimate": 75.0, "source": "System2"},
            {"signal": "BUY", "confidence": 0.6, "accuracy_estimate": 70.0, "source": "System3"},
            {"signal": "NEUTRAL", "confidence": 0.5, "accuracy_estimate": 60.0, "source": "System4"}
        ],
        "SISE.IS": [
            {"signal": "BUY", "confidence": 0.9, "accuracy_estimate": 85.0, "source": "System1"},
            {"signal": "BUY", "confidence": 0.8, "accuracy_estimate": 80.0, "source": "System2"},
            {"signal": "BUY", "confidence": 0.7, "accuracy_estimate": 75.0, "source": "System3"},
            {"signal": "BUY", "confidence": 0.6, "accuracy_estimate": 70.0, "source": "System4"}
        ]
    }
    
    print(ensemble_system.generate_ensemble_report(test_symbols, test_signals))

if __name__ == "__main__":
    test_ensemble_of_ensembles()
