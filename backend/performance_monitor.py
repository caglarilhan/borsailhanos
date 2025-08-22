#!/usr/bin/env python3
"""
BIST AI Smart Trader - Performance Monitoring Module
Doğruluk artışını ölçer ve model performansını sürekli takip eder
"""
import pandas as pd
import numpy as np
import json
import os
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Any, Optional
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PerformanceMonitor:
    def __init__(self, data_dir: str = "test_results"):
        """Performance monitor başlat"""
        self.data_dir = data_dir
        self.performance_history = []
        self.metrics_trends = {}
        
        # Load existing performance data
        self._load_performance_history()
        
        # Performance thresholds
        self.accuracy_thresholds = {
            'excellent': 0.90,
            'good': 0.80,
            'acceptable': 0.70,
            'poor': 0.60
        }
        
        # Monitoring periods
        self.monitoring_periods = {
            'daily': 1,
            'weekly': 7,
            'monthly': 30,
            'quarterly': 90
        }
    
    def _load_performance_history(self):
        """Mevcut performance verilerini yükle"""
        try:
            if os.path.exists(self.data_dir):
                for filename in os.listdir(self.data_dir):
                    if filename.endswith('.json'):
                        filepath = os.path.join(self.data_dir, filename)
                        try:
                            with open(filepath, 'r') as f:
                                data = json.load(f)
                                
                            # Extract timestamp from filename
                            timestamp_str = filename.replace('production_test_', '').replace('.json', '')
                            timestamp = datetime.strptime(timestamp_str, "%Y%m%d_%H%M%S")
                            
                            # Add timestamp to data
                            data['test_timestamp'] = timestamp.isoformat()
                            
                            self.performance_history.append(data)
                            
                        except Exception as e:
                            logger.warning(f"⚠️ Failed to load {filename}: {e}")
                
                # Sort by timestamp
                self.performance_history.sort(key=lambda x: x.get('test_timestamp', ''))
                
                logger.info(f"✅ Loaded {len(self.performance_history)} performance records")
                
        except Exception as e:
            logger.error(f"❌ Failed to load performance history: {e}")
    
    def analyze_accuracy_trends(self) -> Dict[str, Any]:
        """Doğruluk trendlerini analiz et"""
        logger.info("📊 Analyzing accuracy trends...")
        
        try:
            if not self.performance_history:
                return {'error': 'No performance data available'}
            
            accuracy_data = []
            
            for record in self.performance_history:
                timestamp = record.get('test_timestamp', '')
                if timestamp:
                    try:
                        dt = datetime.fromisoformat(timestamp)
                        
                        # Extract accuracy from symbol tests
                        symbol_tests = record.get('symbol_tests', {})
                        for symbol, test_results in symbol_tests.items():
                            if 'ensemble_manager' in test_results:
                                pred_metrics = test_results['ensemble_manager'].get('prediction_metrics', {})
                                if 'accuracy' in pred_metrics:
                                    accuracy_data.append({
                                        'timestamp': dt,
                                        'symbol': symbol,
                                        'accuracy': pred_metrics['accuracy'],
                                        'confidence_mean': pred_metrics.get('confidence_mean', 0),
                                        'confidence_std': pred_metrics.get('confidence_std', 0)
                                    })
                    except Exception as e:
                        logger.warning(f"⚠️ Failed to parse timestamp {timestamp}: {e}")
            
            if not accuracy_data:
                return {'error': 'No accuracy data found'}
            
            # Convert to DataFrame
            df = pd.DataFrame(accuracy_data)
            df['date'] = pd.to_datetime(df['timestamp'])
            
            # Calculate trends
            trends = {
                'total_accuracy_records': len(df),
                'date_range': {
                    'start': df['date'].min().isoformat(),
                    'end': df['date'].max().isoformat(),
                    'days': (df['date'].max() - df['date'].min()).days
                },
                'accuracy_statistics': {
                    'mean': float(df['accuracy'].mean()),
                    'std': float(df['accuracy'].std()),
                    'min': float(df['accuracy'].min()),
                    'max': float(df['accuracy'].max()),
                    'median': float(df['accuracy'].median())
                },
                'confidence_statistics': {
                    'mean': float(df['confidence_mean'].mean()),
                    'std': float(df['confidence_mean'].std()),
                    'min': float(df['confidence_mean'].min()),
                    'max': float(df['confidence_mean'].max())
                },
                'symbol_performance': {}
            }
            
            # Symbol-specific performance
            for symbol in df['symbol'].unique():
                symbol_data = df[df['symbol'] == symbol]
                trends['symbol_performance'][symbol] = {
                    'accuracy_mean': float(symbol_data['accuracy'].mean()),
                    'accuracy_std': float(symbol_data['accuracy'].std()),
                    'record_count': len(symbol_data),
                    'best_accuracy': float(symbol_data['accuracy'].max()),
                    'worst_accuracy': float(symbol_data['accuracy'].min())
                }
            
            # Calculate improvement trends
            if len(df) > 1:
                # Sort by date
                df_sorted = df.sort_values('date')
                
                # Calculate improvement over time
                first_accuracy = df_sorted['accuracy'].iloc[0]
                last_accuracy = df_sorted['accuracy'].iloc[-1]
                total_improvement = last_accuracy - first_accuracy
                
                # Calculate daily improvement rate
                days_diff = (df_sorted['date'].max() - df_sorted['date'].min()).days
                daily_improvement_rate = total_improvement / days_diff if days_diff > 0 else 0
                
                trends['improvement_analysis'] = {
                    'first_accuracy': float(first_accuracy),
                    'last_accuracy': float(last_accuracy),
                    'total_improvement': float(total_improvement),
                    'improvement_percentage': float((total_improvement / first_accuracy) * 100),
                    'daily_improvement_rate': float(daily_improvement_rate),
                    'estimated_90_day_accuracy': float(last_accuracy + (daily_improvement_rate * 90))
                }
            
            # Performance grading
            current_accuracy = trends['accuracy_statistics']['mean']
            trends['performance_grade'] = self._grade_performance(current_accuracy)
            
            self.metrics_trends['accuracy'] = trends
            logger.info(f"✅ Accuracy trends analyzed: {len(accuracy_data)} records")
            
            return trends
            
        except Exception as e:
            logger.error(f"❌ Accuracy trend analysis failed: {e}")
            return {'error': str(e)}
    
    def analyze_processing_performance(self) -> Dict[str, Any]:
        """İşlem performansını analiz et"""
        logger.info("⏱️ Analyzing processing performance...")
        
        try:
            if not self.performance_history:
                return {'error': 'No performance data available'}
            
            processing_data = []
            
            for record in self.performance_history:
                timestamp = record.get('test_timestamp', '')
                if timestamp:
                    try:
                        dt = datetime.fromisoformat(timestamp)
                        
                        # Extract processing times
                        symbol_tests = record.get('symbol_tests', {})
                        for symbol, test_results in symbol_tests.items():
                            for test_name, test_result in test_results.items():
                                if test_result.get('status') == 'completed' and 'duration_seconds' in test_result:
                                    processing_data.append({
                                        'timestamp': dt,
                                        'symbol': symbol,
                                        'test_name': test_name,
                                        'duration_seconds': test_result['duration_seconds']
                                    })
                    except Exception as e:
                        logger.warning(f"⚠️ Failed to parse timestamp {timestamp}: {e}")
            
            if not processing_data:
                return {'error': 'No processing data found'}
            
            # Convert to DataFrame
            df = pd.DataFrame(processing_data)
            df['date'] = pd.to_datetime(df['timestamp'])
            
            # Calculate processing trends
            trends = {
                'total_processing_records': len(df),
                'processing_statistics': {
                    'mean_duration': float(df['duration_seconds'].mean()),
                    'std_duration': float(df['duration_seconds'].std()),
                    'min_duration': float(df['duration_seconds'].min()),
                    'max_duration': float(df['duration_seconds'].max()),
                    'median_duration': float(df['duration_seconds'].median())
                },
                'test_performance': {}
            }
            
            # Test-specific performance
            for test_name in df['test_name'].unique():
                test_data = df[df['test_name'] == test_name]
                trends['test_performance'][test_name] = {
                    'mean_duration': float(test_data['duration_seconds'].mean()),
                    'std_duration': float(test_data['duration_seconds'].std()),
                    'record_count': len(test_data),
                    'total_duration': float(test_data['duration_seconds'].sum())
                }
            
            # Performance optimization opportunities
            slow_tests = []
            for test_name, perf in trends['test_performance'].items():
                if perf['mean_duration'] > 10:  # Tests taking more than 10 seconds
                    slow_tests.append({
                        'test_name': test_name,
                        'mean_duration': perf['mean_duration'],
                        'optimization_priority': 'HIGH' if perf['mean_duration'] > 30 else 'MEDIUM'
                    })
            
            trends['optimization_opportunities'] = {
                'slow_tests': slow_tests,
                'total_slow_tests': len(slow_tests)
            }
            
            self.metrics_trends['processing'] = trends
            logger.info(f"✅ Processing performance analyzed: {len(processing_data)} records")
            
            return trends
            
        except Exception as e:
            logger.error(f"❌ Processing performance analysis failed: {e}")
            return {'error': str(e)}
    
    def analyze_feature_engineering_performance(self) -> Dict[str, Any]:
        """Feature engineering performansını analiz et"""
        logger.info("🔧 Analyzing feature engineering performance...")
        
        try:
            if not self.performance_history:
                return {'error': 'No performance data available'}
            
            feature_data = []
            
            for record in self.performance_history:
                timestamp = record.get('test_timestamp', '')
                if timestamp:
                    try:
                        dt = datetime.fromisoformat(timestamp)
                        
                        # Extract feature engineering data
                        symbol_tests = record.get('symbol_tests', {})
                        for symbol, test_results in symbol_tests.items():
                            if 'feature_engineering' in test_results:
                                feature_result = test_results['feature_engineering']
                                if feature_result.get('status') == 'completed':
                                    feature_stats = feature_result.get('feature_statistics', {})
                                    feature_data.append({
                                        'timestamp': dt,
                                        'symbol': symbol,
                                        'original_features': feature_stats.get('original_features', 0),
                                        'final_features': feature_stats.get('final_features', 0),
                                        'feature_expansion_ratio': feature_stats.get('feature_expansion_ratio', 0),
                                        'pca_components': feature_stats.get('pca_components', 0),
                                        'processing_time': feature_stats.get('processing_time_seconds', 0)
                                    })
                    except Exception as e:
                        logger.warning(f"⚠️ Failed to parse timestamp {timestamp}: {e}")
            
            if not feature_data:
                return {'error': 'No feature engineering data found'}
            
            # Convert to DataFrame
            df = pd.DataFrame(feature_data)
            df['date'] = pd.to_datetime(df['timestamp'])
            
            # Calculate feature engineering trends
            trends = {
                'total_feature_records': len(df),
                'feature_statistics': {
                    'mean_original_features': float(df['original_features'].mean()),
                    'mean_final_features': float(df['final_features'].mean()),
                    'mean_expansion_ratio': float(df['feature_expansion_ratio'].mean()),
                    'mean_pca_components': float(df['pca_components'].mean()),
                    'mean_processing_time': float(df['processing_time'].mean())
                },
                'feature_efficiency': {
                    'avg_feature_reduction': float(1 - (df['final_features'].mean() / df['original_features'].mean())),
                    'avg_pca_efficiency': float(df['pca_components'].mean() / df['final_features'].mean())
                }
            }
            
            self.metrics_trends['feature_engineering'] = trends
            logger.info(f"✅ Feature engineering performance analyzed: {len(feature_data)} records")
            
            return trends
            
        except Exception as e:
            logger.error(f"❌ Feature engineering performance analysis failed: {e}")
            return {'error': str(e)}
    
    def generate_performance_report(self) -> Dict[str, Any]:
        """Kapsamlı performance raporu oluştur"""
        logger.info("📊 Generating comprehensive performance report...")
        
        try:
            # Run all analyses
            accuracy_trends = self.analyze_accuracy_trends()
            processing_performance = self.analyze_processing_performance()
            feature_performance = self.analyze_feature_engineering_performance()
            
            # Generate report
            report = {
                'report_timestamp': datetime.now().isoformat(),
                'report_period': {
                    'start': self.performance_history[0]['test_timestamp'] if self.performance_history else None,
                    'end': self.performance_history[-1]['test_timestamp'] if self.performance_history else None,
                    'total_records': len(self.performance_history)
                },
                'accuracy_analysis': accuracy_trends,
                'processing_analysis': processing_performance,
                'feature_engineering_analysis': feature_performance,
                'overall_assessment': self._generate_overall_assessment()
            }
            
            # Save report
            self._save_performance_report(report)
            
            logger.info("✅ Performance report generated successfully")
            return report
            
        except Exception as e:
            logger.error(f"❌ Performance report generation failed: {e}")
            return {'error': str(e)}
    
    def _grade_performance(self, accuracy: float) -> str:
        """Performansı derecelendir"""
        if accuracy >= self.accuracy_thresholds['excellent']:
            return 'EXCELLENT'
        elif accuracy >= self.accuracy_thresholds['good']:
            return 'GOOD'
        elif accuracy >= self.accuracy_thresholds['acceptable']:
            return 'ACCEPTABLE'
        elif accuracy >= self.accuracy_thresholds['poor']:
            return 'POOR'
        else:
            return 'CRITICAL'
    
    def _generate_overall_assessment(self) -> Dict[str, Any]:
        """Genel değerlendirme oluştur"""
        try:
            assessment = {
                'current_status': 'UNKNOWN',
                'trend_direction': 'UNKNOWN',
                'recommendations': [],
                'risk_level': 'UNKNOWN'
            }
            
            # Get current accuracy
            if 'accuracy' in self.metrics_trends:
                accuracy_data = self.metrics_trends['accuracy']
                current_accuracy = accuracy_data.get('accuracy_statistics', {}).get('mean', 0)
                
                # Determine current status
                assessment['current_status'] = self._grade_performance(current_accuracy)
                
                # Determine trend direction
                if 'improvement_analysis' in accuracy_data:
                    improvement = accuracy_data['improvement_analysis'].get('total_improvement', 0)
                    if improvement > 0.05:
                        assessment['trend_direction'] = 'IMPROVING'
                    elif improvement < -0.05:
                        assessment['trend_direction'] = 'DECLINING'
                    else:
                        assessment['trend_direction'] = 'STABLE'
                
                # Generate recommendations
                if current_accuracy < 0.80:
                    assessment['recommendations'].append('Increase training data quality and quantity')
                    assessment['recommendations'].append('Review feature engineering pipeline')
                    assessment['recommendations'].append('Consider ensemble model adjustments')
                
                if current_accuracy < 0.70:
                    assessment['recommendations'].append('Critical: Immediate model retraining required')
                    assessment['recommendations'].append('Review data preprocessing steps')
                    assessment['risk_level'] = 'HIGH'
                elif current_accuracy < 0.80:
                    assessment['risk_level'] = 'MEDIUM'
                else:
                    assessment['risk_level'] = 'LOW'
                
                # Add specific recommendations based on analysis
                if 'processing' in self.metrics_trends:
                    processing_data = self.metrics_trends['processing']
                    if processing_data.get('optimization_opportunities', {}).get('total_slow_tests', 0) > 0:
                        assessment['recommendations'].append('Optimize slow-performing test modules')
            
            return assessment
            
        except Exception as e:
            logger.error(f"❌ Overall assessment generation failed: {e}")
            return {'error': str(e)}
    
    def _save_performance_report(self, report: Dict[str, Any]):
        """Performance raporunu kaydet"""
        try:
            os.makedirs('performance_reports', exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"performance_reports/performance_report_{timestamp}.json"
            
            with open(filename, 'w') as f:
                json.dump(report, f, indent=2)
            
            logger.info(f"✅ Performance report saved to {filename}")
            
        except Exception as e:
            logger.error(f"❌ Report save failed: {e}")
    
    def print_performance_summary(self):
        """Performance özetini yazdır"""
        if not self.metrics_trends:
            print("❌ No performance data available")
            return
        
        print("\n📊 PERFORMANCE MONITORING SUMMARY:")
        print("=" * 60)
        
        # Accuracy summary
        if 'accuracy' in self.metrics_trends:
            acc_data = self.metrics_trends['accuracy']
            print(f"🎯 ACCURACY PERFORMANCE:")
            print(f"   Current Grade: {acc_data.get('performance_grade', 'UNKNOWN')}")
            print(f"   Mean Accuracy: {acc_data.get('accuracy_statistics', {}).get('mean', 0):.1%}")
            print(f"   Accuracy Range: {acc_data.get('accuracy_statistics', {}).get('min', 0):.1%} - {acc_data.get('accuracy_statistics', {}).get('max', 0):.1%}")
            
            if 'improvement_analysis' in acc_data:
                imp_data = acc_data['improvement_analysis']
                print(f"   Total Improvement: {imp_data.get('total_improvement', 0):.1%}")
                print(f"   Daily Improvement Rate: {imp_data.get('daily_improvement_rate', 0):.4f}")
                print(f"   90-Day Forecast: {imp_data.get('estimated_90_day_accuracy', 0):.1%}")
        
        # Processing summary
        if 'processing' in self.metrics_trends:
            proc_data = self.metrics_trends['processing']
            print(f"\n⏱️  PROCESSING PERFORMANCE:")
            print(f"   Mean Duration: {proc_data.get('processing_statistics', {}).get('mean_duration', 0):.2f}s")
            print(f"   Slow Tests: {proc_data.get('optimization_opportunities', {}).get('total_slow_tests', 0)}")
        
        # Feature engineering summary
        if 'feature_engineering' in self.metrics_trends:
            feat_data = self.metrics_trends['feature_engineering']
            print(f"\n🔧 FEATURE ENGINEERING:")
            print(f"   Feature Reduction: {feat_data.get('feature_efficiency', {}).get('avg_feature_reduction', 0):.1%}")
            print(f"   PCA Efficiency: {feat_data.get('feature_efficiency', {}).get('avg_pca_efficiency', 0):.1%}")
        
        print(f"\n✅ Performance monitoring completed!")

def main():
    """Main function"""
    print("📊 BIST AI Smart Trader - Performance Monitoring")
    print("=" * 60)
    
    # Initialize monitor
    monitor = PerformanceMonitor()
    
    # Generate performance report
    report = monitor.generate_performance_report()
    
    # Print summary
    monitor.print_performance_summary()
    
    return report

if __name__ == "__main__":
    main()
