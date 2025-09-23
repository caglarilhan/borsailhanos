#!/usr/bin/env python3
"""
🌐 MULTI-DIMENSIONAL SIGNAL FUSION
Advanced multi-dimensional signal fusion system
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA, FastICA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import warnings

warnings.filterwarnings("ignore")

logger = logging.getLogger(__name__)

@dataclass
class MultiDimensionalSignal:
    """Çok boyutlu sinyal"""
    symbol: str
    signal: str
    confidence: float
    accuracy_estimate: float
    dimensions: Dict[str, float]
    fusion_method: str
    timestamp: datetime

class MultiDimensionalSignalFusion:
    """Çok boyutlu sinyal füzyonu"""
    
    def __init__(self):
        self.dimensions = {
            'technical': 0.25,
            'fundamental': 0.20,
            'sentiment': 0.15,
            'macro': 0.15,
            'microstructure': 0.10,
            'fractal': 0.10,
            'ensemble': 0.05
        }
        
        self.fusion_methods = {
            'weighted_average': 0.3,
            'pca_fusion': 0.25,
            'ica_fusion': 0.20,
            'clustering_fusion': 0.15,
            'neural_fusion': 0.10
        }
        
        self.signal_weights = {
            'BUY': 1.0,
            'STRONG_BUY': 1.5,
            'SELL': -1.0,
            'STRONG_SELL': -1.5,
            'NEUTRAL': 0.0
        }
    
    def weighted_average_fusion(self, signals: List[Dict]) -> Tuple[str, float, float]:
        """Ağırlıklı ortalama füzyonu"""
        try:
            if not signals:
                return "NEUTRAL", 0.5, 50.0
            
            # Calculate weighted averages
            weighted_signal_value = 0
            weighted_confidence = 0
            weighted_accuracy = 0
            total_weight = 0
            
            for signal in signals:
                dimension = signal.get('dimension', 'technical')
                weight = self.dimensions.get(dimension, 0.1)
                
                signal_value = self.signal_weights.get(signal.get('signal', 'NEUTRAL'), 0.0)
                confidence = signal.get('confidence', 0.5)
                accuracy = signal.get('accuracy_estimate', 50.0)
                
                weighted_signal_value += signal_value * weight
                weighted_confidence += confidence * weight
                weighted_accuracy += accuracy * weight
                total_weight += weight
            
            if total_weight > 0:
                weighted_signal_value /= total_weight
                weighted_confidence /= total_weight
                weighted_accuracy /= total_weight
            
            # Convert to signal
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
            logger.error(f"Weighted average fusion error: {e}")
            return "NEUTRAL", 0.5, 50.0
    
    def pca_fusion(self, signals: List[Dict]) -> Tuple[str, float, float]:
        """PCA tabanlı füzyon"""
        try:
            if len(signals) < 3:
                return self.weighted_average_fusion(signals)
            
            # Convert signals to feature matrix
            features = []
            for signal in signals:
                signal_value = self.signal_weights.get(signal.get('signal', 'NEUTRAL'), 0.0)
                confidence = signal.get('confidence', 0.5)
                accuracy = signal.get('accuracy_estimate', 50.0)
                dimension_weight = self.dimensions.get(signal.get('dimension', 'technical'), 0.1)
                
                features.append([signal_value, confidence, accuracy, dimension_weight])
            
            features = np.array(features)
            
            # Apply PCA
            scaler = StandardScaler()
            features_scaled = scaler.fit_transform(features)
            
            pca = PCA(n_components=min(3, len(features)))
            pca_features = pca.fit_transform(features_scaled)
            
            # Use first principal component as fusion result
            pc1 = pca_features[:, 0]
            pc1_weighted = np.mean(pc1)
            
            # Convert to signal
            if pc1_weighted > 0.5:
                final_signal = "BUY"
            elif pc1_weighted < -0.5:
                final_signal = "SELL"
            else:
                final_signal = "NEUTRAL"
            
            # Calculate confidence and accuracy
            final_confidence = min(0.95, abs(pc1_weighted) + 0.5)
            final_accuracy = final_confidence * 100
            
            return final_signal, final_confidence, final_accuracy
            
        except Exception as e:
            logger.error(f"PCA fusion error: {e}")
            return self.weighted_average_fusion(signals)
    
    def ica_fusion(self, signals: List[Dict]) -> Tuple[str, float, float]:
        """ICA tabanlı füzyon"""
        try:
            if len(signals) < 3:
                return self.weighted_average_fusion(signals)
            
            # Convert signals to feature matrix
            features = []
            for signal in signals:
                signal_value = self.signal_weights.get(signal.get('signal', 'NEUTRAL'), 0.0)
                confidence = signal.get('confidence', 0.5)
                accuracy = signal.get('accuracy_estimate', 50.0)
                dimension_weight = self.dimensions.get(signal.get('dimension', 'technical'), 0.1)
                
                features.append([signal_value, confidence, accuracy, dimension_weight])
            
            features = np.array(features)
            
            # Apply ICA
            scaler = StandardScaler()
            features_scaled = scaler.fit_transform(features)
            
            ica = FastICA(n_components=min(3, len(features)), random_state=42)
            ica_features = ica.fit_transform(features_scaled)
            
            # Use first independent component as fusion result
            ic1 = ica_features[:, 0]
            ic1_weighted = np.mean(ic1)
            
            # Convert to signal
            if ic1_weighted > 0.5:
                final_signal = "BUY"
            elif ic1_weighted < -0.5:
                final_signal = "SELL"
            else:
                final_signal = "NEUTRAL"
            
            # Calculate confidence and accuracy
            final_confidence = min(0.95, abs(ic1_weighted) + 0.5)
            final_accuracy = final_confidence * 100
            
            return final_signal, final_confidence, final_accuracy
            
        except Exception as e:
            logger.error(f"ICA fusion error: {e}")
            return self.weighted_average_fusion(signals)
    
    def clustering_fusion(self, signals: List[Dict]) -> Tuple[str, float, float]:
        """Kümeleme tabanlı füzyon"""
        try:
            if len(signals) < 3:
                return self.weighted_average_fusion(signals)
            
            # Convert signals to feature matrix
            features = []
            for signal in signals:
                signal_value = self.signal_weights.get(signal.get('signal', 'NEUTRAL'), 0.0)
                confidence = signal.get('confidence', 0.5)
                accuracy = signal.get('accuracy_estimate', 50.0)
                dimension_weight = self.dimensions.get(signal.get('dimension', 'technical'), 0.1)
                
                features.append([signal_value, confidence, accuracy, dimension_weight])
            
            features = np.array(features)
            
            # Apply K-means clustering
            scaler = StandardScaler()
            features_scaled = scaler.fit_transform(features)
            
            # Determine optimal number of clusters
            n_clusters = min(3, len(features))
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            cluster_labels = kmeans.fit_predict(features_scaled)
            
            # Calculate cluster centroids
            cluster_centers = kmeans.cluster_centers_
            
            # Find the cluster with highest confidence
            cluster_confidences = []
            for i in range(n_clusters):
                cluster_mask = cluster_labels == i
                cluster_features = features_scaled[cluster_mask]
                if len(cluster_features) > 0:
                    cluster_confidences.append(np.mean(cluster_features[:, 1]))  # confidence column
                else:
                    cluster_confidences.append(0)
            
            best_cluster = np.argmax(cluster_confidences)
            best_center = cluster_centers[best_cluster]
            
            # Convert to signal
            if best_center[0] > 0.5:  # signal value column
                final_signal = "BUY"
            elif best_center[0] < -0.5:
                final_signal = "SELL"
            else:
                final_signal = "NEUTRAL"
            
            # Calculate confidence and accuracy
            final_confidence = min(0.95, abs(best_center[0]) + 0.5)
            final_accuracy = final_confidence * 100
            
            return final_signal, final_confidence, final_accuracy
            
        except Exception as e:
            logger.error(f"Clustering fusion error: {e}")
            return self.weighted_average_fusion(signals)
    
    def neural_fusion(self, signals: List[Dict]) -> Tuple[str, float, float]:
        """Neural network tabanlı füzyon (simplified)"""
        try:
            if len(signals) < 3:
                return self.weighted_average_fusion(signals)
            
            # Simple neural network simulation
            # In real implementation, use TensorFlow/PyTorch
            
            # Convert signals to feature vector
            features = []
            for signal in signals:
                signal_value = self.signal_weights.get(signal.get('signal', 'NEUTRAL'), 0.0)
                confidence = signal.get('confidence', 0.5)
                accuracy = signal.get('accuracy_estimate', 50.0)
                dimension_weight = self.dimensions.get(signal.get('dimension', 'technical'), 0.1)
                
                features.extend([signal_value, confidence, accuracy, dimension_weight])
            
            features = np.array(features)
            
            # Simple neural network simulation
            # Hidden layer weights (random but consistent)
            np.random.seed(42)
            hidden_weights = np.random.randn(len(features), 8)
            output_weights = np.random.randn(8, 3)  # 3 outputs: signal, confidence, accuracy
            
            # Forward pass
            hidden_output = np.tanh(np.dot(features, hidden_weights))
            output = np.dot(hidden_output, output_weights)
            
            # Normalize outputs
            signal_output = np.tanh(output[0])
            confidence_output = 1 / (1 + np.exp(-output[1]))  # Sigmoid
            accuracy_output = 1 / (1 + np.exp(-output[2]))  # Sigmoid
            
            # Convert to signal
            if signal_output > 0.3:
                final_signal = "BUY"
            elif signal_output < -0.3:
                final_signal = "SELL"
            else:
                final_signal = "NEUTRAL"
            
            # Calculate confidence and accuracy
            final_confidence = min(0.95, confidence_output)
            final_accuracy = min(95.0, accuracy_output * 100)
            
            return final_signal, final_confidence, final_accuracy
            
        except Exception as e:
            logger.error(f"Neural fusion error: {e}")
            return self.weighted_average_fusion(signals)
    
    def fuse_all_methods(self, signals: List[Dict]) -> Tuple[str, float, float]:
        """Tüm füzyon metodlarını birleştir"""
        try:
            if not signals:
                return "NEUTRAL", 0.5, 50.0
            
            # Run all fusion methods
            wa_signal, wa_conf, wa_acc = self.weighted_average_fusion(signals)
            pca_signal, pca_conf, pca_acc = self.pca_fusion(signals)
            ica_signal, ica_conf, ica_acc = self.ica_fusion(signals)
            cluster_signal, cluster_conf, cluster_acc = self.clustering_fusion(signals)
            neural_signal, neural_conf, neural_acc = self.neural_fusion(signals)
            
            # Combine results with weights
            fusion_results = [
                (wa_signal, wa_conf, wa_acc, self.fusion_methods['weighted_average']),
                (pca_signal, pca_conf, pca_acc, self.fusion_methods['pca_fusion']),
                (ica_signal, ica_conf, ica_acc, self.fusion_methods['ica_fusion']),
                (cluster_signal, cluster_conf, cluster_acc, self.fusion_methods['clustering_fusion']),
                (neural_signal, neural_conf, neural_acc, self.fusion_methods['neural_fusion'])
            ]
            
            # Weighted combination
            final_signal_value = 0
            final_confidence = 0
            final_accuracy = 0
            total_weight = 0
            
            for signal, conf, acc, weight in fusion_results:
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
            logger.error(f"All methods fusion error: {e}")
            return "NEUTRAL", 0.5, 50.0
    
    def generate_multi_dimensional_signal(self, symbol: str, all_signals: Dict[str, List[Dict]]) -> MultiDimensionalSignal:
        """Çok boyutlu sinyal oluştur"""
        logger.info(f"🌐 {symbol} çok boyutlu sinyal füzyonu başlıyor...")
        
        try:
            if symbol not in all_signals:
                return MultiDimensionalSignal(
                    symbol=symbol,
                    signal="NEUTRAL",
                    confidence=0.5,
                    accuracy_estimate=50.0,
                    dimensions={},
                    fusion_method='Error',
                    timestamp=datetime.now()
                )
            
            signals = all_signals[symbol]
            
            # Fuse all methods
            final_signal, final_confidence, final_accuracy = self.fuse_all_methods(signals)
            
            # Calculate dimension scores
            dimension_scores = {}
            for dimension in self.dimensions.keys():
                dimension_signals = [s for s in signals if s.get('dimension') == dimension]
                if dimension_signals:
                    avg_confidence = np.mean([s.get('confidence', 0.5) for s in dimension_signals])
                    dimension_scores[dimension] = avg_confidence
                else:
                    dimension_scores[dimension] = 0.0
            
            # Determine fusion method used
            fusion_method = 'MultiDimensionalFusion'
            
            # Create multi-dimensional signal
            multi_signal = MultiDimensionalSignal(
                symbol=symbol,
                signal=final_signal,
                confidence=final_confidence,
                accuracy_estimate=final_accuracy,
                dimensions=dimension_scores,
                fusion_method=fusion_method,
                timestamp=datetime.now()
            )
            
            logger.info(f"✅ {symbol} çok boyutlu füzyon tamamlandı: {final_signal} ({final_accuracy:.1f}%)")
            return multi_signal
            
        except Exception as e:
            logger.error(f"❌ {symbol} çok boyutlu füzyon hatası: {e}")
            return MultiDimensionalSignal(
                symbol=symbol,
                signal="NEUTRAL",
                confidence=0.5,
                accuracy_estimate=50.0,
                dimensions={},
                fusion_method='Error',
                timestamp=datetime.now()
            )
    
    def generate_fusion_report(self, symbols: List[str], all_signals: Dict[str, List[Dict]]) -> str:
        """Füzyon raporu oluştur"""
        report = "\n" + "="*80 + "\n"
        report += "🌐 MULTI-DIMENSIONAL SIGNAL FUSION RESULTS\n"
        report += "="*80 + "\n"
        
        total_confidence = 0
        total_accuracy = 0
        signal_distribution = {}
        dimension_scores = {dim: [] for dim in self.dimensions.keys()}
        
        for symbol in symbols:
            multi_signal = self.generate_multi_dimensional_signal(symbol, all_signals)
            
            report += f"🎯 {symbol}:\n"
            report += f"   Final Signal: {multi_signal.signal}\n"
            report += f"   Final Confidence: {multi_signal.confidence:.3f}\n"
            report += f"   Final Accuracy: {multi_signal.accuracy_estimate:.1f}%\n"
            report += f"   Fusion Method: {multi_signal.fusion_method}\n"
            report += f"   Dimension Scores: {multi_signal.dimensions}\n"
            report += "\n"
            
            total_confidence += multi_signal.confidence
            total_accuracy += multi_signal.accuracy_estimate
            
            signal_distribution[multi_signal.signal] = signal_distribution.get(multi_signal.signal, 0) + 1
            
            # Collect dimension scores
            for dim, score in multi_signal.dimensions.items():
                dimension_scores[dim].append(score)
        
        if symbols:
            avg_confidence = total_confidence / len(symbols)
            avg_accuracy = total_accuracy / len(symbols)
            
            report += "📊 MULTI-DIMENSIONAL FUSION SUMMARY:\n"
            report += f"   Total Symbols: {len(symbols)}\n"
            report += f"   Average Confidence: {avg_confidence:.3f}\n"
            report += f"   Average Accuracy: {avg_accuracy:.1f}%\n"
            report += f"   Signal Distribution: {signal_distribution}\n"
            
            # Dimension analysis
            report += f"   Dimension Analysis:\n"
            for dim, scores in dimension_scores.items():
                if scores:
                    avg_score = np.mean(scores)
                    report += f"     {dim}: {avg_score:.3f}\n"
            
            report += f"   🎯 MULTI-DIMENSIONAL ACCURACY ESTIMATE: {avg_accuracy:.1f}%\n"
            report += "="*80 + "\n"
        
        return report

def test_multi_dimensional_signal_fusion():
    """Multi-dimensional signal fusion test"""
    logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
    logger.info("🧪 MULTI-DIMENSIONAL SIGNAL FUSION test başlıyor...")
    
    fusion_system = MultiDimensionalSignalFusion()
    
    # Test signals
    test_symbols = ["GARAN.IS", "AKBNK.IS", "SISE.IS"]
    test_signals = {
        "GARAN.IS": [
            {"signal": "BUY", "confidence": 0.7, "accuracy_estimate": 75.0, "dimension": "technical"},
            {"signal": "BUY", "confidence": 0.6, "accuracy_estimate": 70.0, "dimension": "fundamental"},
            {"signal": "NEUTRAL", "confidence": 0.5, "accuracy_estimate": 60.0, "dimension": "sentiment"},
            {"signal": "SELL", "confidence": 0.4, "accuracy_estimate": 55.0, "dimension": "macro"},
            {"signal": "BUY", "confidence": 0.8, "accuracy_estimate": 80.0, "dimension": "microstructure"},
            {"signal": "NEUTRAL", "confidence": 0.5, "accuracy_estimate": 50.0, "dimension": "fractal"},
            {"signal": "BUY", "confidence": 0.6, "accuracy_estimate": 65.0, "dimension": "ensemble"}
        ],
        "AKBNK.IS": [
            {"signal": "SELL", "confidence": 0.8, "accuracy_estimate": 80.0, "dimension": "technical"},
            {"signal": "SELL", "confidence": 0.7, "accuracy_estimate": 75.0, "dimension": "fundamental"},
            {"signal": "BUY", "confidence": 0.6, "accuracy_estimate": 70.0, "dimension": "sentiment"},
            {"signal": "NEUTRAL", "confidence": 0.5, "accuracy_estimate": 60.0, "dimension": "macro"},
            {"signal": "SELL", "confidence": 0.7, "accuracy_estimate": 75.0, "dimension": "microstructure"},
            {"signal": "NEUTRAL", "confidence": 0.5, "accuracy_estimate": 50.0, "dimension": "fractal"},
            {"signal": "SELL", "confidence": 0.6, "accuracy_estimate": 65.0, "dimension": "ensemble"}
        ],
        "SISE.IS": [
            {"signal": "BUY", "confidence": 0.9, "accuracy_estimate": 85.0, "dimension": "technical"},
            {"signal": "BUY", "confidence": 0.8, "accuracy_estimate": 80.0, "dimension": "fundamental"},
            {"signal": "BUY", "confidence": 0.7, "accuracy_estimate": 75.0, "dimension": "sentiment"},
            {"signal": "BUY", "confidence": 0.6, "accuracy_estimate": 70.0, "dimension": "macro"},
            {"signal": "BUY", "confidence": 0.8, "accuracy_estimate": 80.0, "dimension": "microstructure"},
            {"signal": "BUY", "confidence": 0.7, "accuracy_estimate": 75.0, "dimension": "fractal"},
            {"signal": "BUY", "confidence": 0.8, "accuracy_estimate": 80.0, "dimension": "ensemble"}
        ]
    }
    
    print(fusion_system.generate_fusion_report(test_symbols, test_signals))

if __name__ == "__main__":
    test_multi_dimensional_signal_fusion()
