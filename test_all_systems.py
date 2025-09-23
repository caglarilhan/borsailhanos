#!/usr/bin/env python3
"""
🧪 ALL SYSTEMS TEST
Test all advanced systems and generate comprehensive report
"""

import logging
import sys
import os

# Add backend to path
sys.path.append('backend')

# Import all systems
from phase1_enhanced_system import Phase1EnhancedSystem
from nobel_mathematical_system import NobelMathematicalSystem
from historical_trend_analyzer import HistoricalTrendAnalyzer
from quantum_inspired_optimizer import QuantumInspiredOptimizer
from fractal_market_analyzer import FractalMarketAnalyzer
from ensemble_of_ensembles import EnsembleOfEnsembles
from advanced_feature_engineering import AdvancedFeatureEngineering
from market_microstructure_analyzer import MarketMicrostructureAnalyzer
from multi_dimensional_signal_fusion import MultiDimensionalSignalFusion
from ultimate_master_system import UltimateMasterSystem

def test_all_systems():
    """Test all systems and generate comprehensive report"""
    logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
    logger = logging.getLogger(__name__)
    
    logger.info("🧪 ALL SYSTEMS TEST başlıyor...")
    
    # Test symbols
    test_symbols = ["GARAN.IS", "AKBNK.IS", "SISE.IS", "ASELS.IS", "YKBNK.IS"]
    
    # Initialize all systems
    systems = {
        'Phase1Enhanced': Phase1EnhancedSystem(),
        'NobelMathematical': NobelMathematicalSystem(),
        'HistoricalTrend': HistoricalTrendAnalyzer(),
        'QuantumOptimization': QuantumInspiredOptimizer(),
        'FractalAnalysis': FractalMarketAnalyzer(),
        'EnsembleOfEnsembles': EnsembleOfEnsembles(),
        'AdvancedFeatures': AdvancedFeatureEngineering(),
        'Microstructure': MarketMicrostructureAnalyzer(),
        'MultiDimensionalFusion': MultiDimensionalSignalFusion(),
        'UltimateMaster': UltimateMasterSystem()
    }
    
    # Test each system
    results = {}
    
    for system_name, system in systems.items():
        logger.info(f"🧪 {system_name} test ediliyor...")
        
        try:
            if system_name == 'Phase1Enhanced':
                # Use existing method
                enhanced_signals = system.generate_phase1_enhanced_signals(test_symbols)
                result = f"Phase1Enhanced: {len(enhanced_signals) if enhanced_signals else 0} signals generated"
            elif system_name == 'NobelMathematical':
                # Use existing method
                nobel_signals = []
                for symbol in test_symbols:
                    signal = system.analyze_stock(symbol)
                    if signal:
                        nobel_signals.append(signal)
                result = f"NobelMathematical: {len(nobel_signals)} signals generated"
            elif system_name == 'HistoricalTrend':
                # Use existing method
                trend_signals = []
                for symbol in test_symbols:
                    signal = system.get_trend_bias(symbol)
                    trend_signals.append(signal)
                result = f"HistoricalTrend: {len(trend_signals)} signals generated"
            elif system_name == 'QuantumOptimization':
                # Use existing method
                quantum_signals = []
                for symbol in test_symbols:
                    signal = system.get_optimization_bias(symbol, test_symbols)
                    quantum_signals.append(signal)
                result = f"QuantumOptimization: {len(quantum_signals)} signals generated"
            elif system_name == 'FractalAnalysis':
                # Use existing method
                fractal_signals = []
                for symbol in test_symbols:
                    signal = system.analyze_fractal_market(symbol)
                    fractal_signals.append(signal)
                result = f"FractalAnalysis: {len(fractal_signals)} signals generated"
            elif system_name == 'EnsembleOfEnsembles':
                # Create test signals for ensemble
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
                    ],
                    "ASELS.IS": [
                        {"signal": "BUY", "confidence": 0.8, "accuracy_estimate": 80.0, "source": "System1"},
                        {"signal": "NEUTRAL", "confidence": 0.6, "accuracy_estimate": 70.0, "source": "System2"},
                        {"signal": "SELL", "confidence": 0.5, "accuracy_estimate": 60.0, "source": "System3"},
                        {"signal": "BUY", "confidence": 0.7, "accuracy_estimate": 75.0, "source": "System4"}
                    ],
                    "YKBNK.IS": [
                        {"signal": "NEUTRAL", "confidence": 0.6, "accuracy_estimate": 65.0, "source": "System1"},
                        {"signal": "SELL", "confidence": 0.7, "accuracy_estimate": 70.0, "source": "System2"},
                        {"signal": "BUY", "confidence": 0.5, "accuracy_estimate": 60.0, "source": "System3"},
                        {"signal": "NEUTRAL", "confidence": 0.6, "accuracy_estimate": 65.0, "source": "System4"}
                    ]
                }
                result = system.generate_ensemble_report(test_symbols, test_signals)
            elif system_name == 'AdvancedFeatures':
                result = system.generate_feature_report(test_symbols)
            elif system_name == 'Microstructure':
                result = system.generate_microstructure_report(test_symbols)
            elif system_name == 'MultiDimensionalFusion':
                # Create test signals for multi-dimensional fusion
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
                    ],
                    "ASELS.IS": [
                        {"signal": "BUY", "confidence": 0.8, "accuracy_estimate": 80.0, "dimension": "technical"},
                        {"signal": "NEUTRAL", "confidence": 0.6, "accuracy_estimate": 70.0, "dimension": "fundamental"},
                        {"signal": "SELL", "confidence": 0.5, "accuracy_estimate": 60.0, "dimension": "sentiment"},
                        {"signal": "BUY", "confidence": 0.7, "accuracy_estimate": 75.0, "dimension": "macro"},
                        {"signal": "BUY", "confidence": 0.8, "accuracy_estimate": 80.0, "dimension": "microstructure"},
                        {"signal": "NEUTRAL", "confidence": 0.5, "accuracy_estimate": 50.0, "dimension": "fractal"},
                        {"signal": "BUY", "confidence": 0.7, "accuracy_estimate": 75.0, "dimension": "ensemble"}
                    ],
                    "YKBNK.IS": [
                        {"signal": "NEUTRAL", "confidence": 0.6, "accuracy_estimate": 65.0, "dimension": "technical"},
                        {"signal": "SELL", "confidence": 0.7, "accuracy_estimate": 70.0, "dimension": "fundamental"},
                        {"signal": "BUY", "confidence": 0.5, "accuracy_estimate": 60.0, "dimension": "sentiment"},
                        {"signal": "NEUTRAL", "confidence": 0.6, "accuracy_estimate": 65.0, "dimension": "macro"},
                        {"signal": "SELL", "confidence": 0.7, "accuracy_estimate": 70.0, "dimension": "microstructure"},
                        {"signal": "NEUTRAL", "confidence": 0.5, "accuracy_estimate": 50.0, "dimension": "fractal"},
                        {"signal": "NEUTRAL", "confidence": 0.6, "accuracy_estimate": 65.0, "dimension": "ensemble"}
                    ]
                }
                result = system.generate_fusion_report(test_symbols, test_signals)
            elif system_name == 'UltimateMaster':
                result = system.generate_ultimate_report(test_symbols)
            
            results[system_name] = result
            logger.info(f"✅ {system_name} test tamamlandı")
            
        except Exception as e:
            logger.error(f"❌ {system_name} test hatası: {e}")
            results[system_name] = f"Error: {e}"
    
    # Generate comprehensive report
    logger.info("="*80)
    logger.info("🧪 ALL SYSTEMS TEST RESULTS")
    logger.info("="*80)
    
    for system_name, result in results.items():
        logger.info(f"\n📊 {system_name}:")
        if isinstance(result, str):
            logger.info(f"   Result: {result}")
        else:
            logger.info(f"   Result: Generated successfully")
    
    logger.info("\n" + "="*80)
    logger.info("🎯 ALL SYSTEMS TEST COMPLETED")
    logger.info("="*80)
    
    return results

if __name__ == "__main__":
    test_all_systems()
