#!/usr/bin/env python3
"""
Ultra-High Accuracy Trading Signal System - Master Test File
Tüm sistemleri test eder ve raporlar üretir
"""

import sys
import os
import logging
from datetime import datetime
import traceback

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('test_results.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def test_system(system_name, test_func):
    """Tek bir sistemi test eder"""
    try:
        logger.info(f"🧪 {system_name} testi başlatılıyor...")
        result = test_func()
        logger.info(f"✅ {system_name} testi başarılı!")
        return result
    except Exception as e:
        logger.error(f"❌ {system_name} test hatası: {str(e)}")
        logger.error(f"Detay: {traceback.format_exc()}")
        return None

def main():
    """Ana test fonksiyonu"""
    logger.info("🚀 Ultra-High Accuracy Trading Signal System Test Başlatılıyor...")
    
    # Test edilecek sistemler
    test_results = {}
    
    # 1. Phase1 Enhanced System Test
    try:
        from phase1_enhanced_system import Phase1EnhancedSystem
        phase1 = Phase1EnhancedSystem()
        
        def test_phase1():
            symbols = ['AAPL', 'MSFT', 'GOOGL']
            results = {}
            for symbol in symbols:
                try:
                    signals = phase1.generate_phase1_enhanced_signals(symbol)
                    results[symbol] = signals
                except Exception as e:
                    logger.error(f"Phase1 {symbol} hatası: {e}")
                    results[symbol] = None
            return results
        
        test_results['Phase1Enhanced'] = test_system('Phase1Enhanced', test_phase1)
    except Exception as e:
        logger.error(f"❌ Phase1Enhanced import hatası: {e}")
        test_results['Phase1Enhanced'] = None
    
    # 2. Nobel Mathematical System Test
    try:
        from nobel_mathematical_system import NobelMathematicalSystem
        nobel = NobelMathematicalSystem()
        
        def test_nobel():
            symbols = ['AAPL', 'MSFT', 'GOOGL']
            results = {}
            for symbol in symbols:
                try:
                    analysis = nobel.analyze_stock(symbol)
                    results[symbol] = analysis
                except Exception as e:
                    logger.error(f"Nobel {symbol} hatası: {e}")
                    results[symbol] = None
            return results
        
        test_results['NobelMathematical'] = test_system('NobelMathematical', test_nobel)
    except Exception as e:
        logger.error(f"❌ NobelMathematical import hatası: {e}")
        test_results['NobelMathematical'] = None
    
    # 3. Historical Trend Analyzer Test
    try:
        from historical_trend_analyzer import HistoricalTrendAnalyzer
        trend = HistoricalTrendAnalyzer()
        
        def test_trend():
            symbols = ['AAPL', 'MSFT', 'GOOGL']
            results = {}
            for symbol in symbols:
                try:
                    bias = trend.get_trend_bias(symbol)
                    results[symbol] = bias
                except Exception as e:
                    logger.error(f"Trend {symbol} hatası: {e}")
                    results[symbol] = None
            return results
        
        test_results['HistoricalTrend'] = test_system('HistoricalTrend', test_trend)
    except Exception as e:
        logger.error(f"❌ HistoricalTrend import hatası: {e}")
        test_results['HistoricalTrend'] = None
    
    # 4. Quantum Inspired Optimizer Test
    try:
        from quantum_inspired_optimizer import QuantumInspiredOptimizer
        quantum = QuantumInspiredOptimizer()
        
        def test_quantum():
            symbols = ['AAPL', 'MSFT', 'GOOGL']
            results = {}
            for symbol in symbols:
                try:
                    bias = quantum.get_optimization_bias(symbol)
                    results[symbol] = bias
                except Exception as e:
                    logger.error(f"Quantum {symbol} hatası: {e}")
                    results[symbol] = None
            return results
        
        test_results['QuantumOptimization'] = test_system('QuantumOptimization', test_quantum)
    except Exception as e:
        logger.error(f"❌ QuantumOptimization import hatası: {e}")
        test_results['QuantumOptimization'] = None
    
    # 5. Fractal Market Analyzer Test
    try:
        from fractal_market_analyzer import FractalMarketAnalyzer
        fractal = FractalMarketAnalyzer()
        
        def test_fractal():
            symbols = ['AAPL', 'MSFT', 'GOOGL']
            results = {}
            for symbol in symbols:
                try:
                    analysis = fractal.analyze_fractal_market(symbol)
                    results[symbol] = analysis
                except Exception as e:
                    logger.error(f"Fractal {symbol} hatası: {e}")
                    results[symbol] = None
            return results
        
        test_results['FractalAnalysis'] = test_system('FractalAnalysis', test_fractal)
    except Exception as e:
        logger.error(f"❌ FractalAnalysis import hatası: {e}")
        test_results['FractalAnalysis'] = None
    
    # 6. Advanced Features Test
    try:
        from advanced_feature_engineering import AdvancedFeatureEngineering
        features = AdvancedFeatureEngineering()
        
        def test_features():
            symbols = ['AAPL', 'MSFT', 'GOOGL']
            results = {}
            for symbol in symbols:
                try:
                    features_data = features.extract_features(symbol)
                    results[symbol] = features_data
                except Exception as e:
                    logger.error(f"Features {symbol} hatası: {e}")
                    results[symbol] = None
            return results
        
        test_results['AdvancedFeatures'] = test_system('AdvancedFeatures', test_features)
    except Exception as e:
        logger.error(f"❌ AdvancedFeatures import hatası: {e}")
        test_results['AdvancedFeatures'] = None
    
    # 7. Microstructure Test
    try:
        from market_microstructure_analyzer import MarketMicrostructureAnalyzer
        microstructure = MarketMicrostructureAnalyzer()
        
        def test_microstructure():
            symbols = ['AAPL', 'MSFT', 'GOOGL']
            results = {}
            for symbol in symbols:
                try:
                    analysis = microstructure.analyze_microstructure(symbol)
                    results[symbol] = analysis
                except Exception as e:
                    logger.error(f"Microstructure {symbol} hatası: {e}")
                    results[symbol] = None
            return results
        
        test_results['Microstructure'] = test_system('Microstructure', test_microstructure)
    except Exception as e:
        logger.error(f"❌ Microstructure import hatası: {e}")
        test_results['Microstructure'] = None
    
    # 8. Multi-Dimensional Signal Fusion Test
    try:
        from multi_dimensional_signal_fusion import MultiDimensionalSignalFusion
        fusion = MultiDimensionalSignalFusion()
        
        def test_fusion():
            symbols = ['AAPL', 'MSFT', 'GOOGL']
            results = {}
            for symbol in symbols:
                try:
                    fused_signal = fusion.fuse_signals(symbol)
                    results[symbol] = fused_signal
                except Exception as e:
                    logger.error(f"Fusion {symbol} hatası: {e}")
                    results[symbol] = None
            return results
        
        test_results['SignalFusion'] = test_system('SignalFusion', test_fusion)
    except Exception as e:
        logger.error(f"❌ SignalFusion import hatası: {e}")
        test_results['SignalFusion'] = None
    
    # 9. Ultimate Accuracy Booster Test
    try:
        from ultimate_accuracy_booster import UltimateAccuracyBooster
        booster = UltimateAccuracyBooster()
        
        def test_booster():
            symbols = ['AAPL', 'MSFT', 'GOOGL']
            results = {}
            for symbol in symbols:
                try:
                    boosted_signal = booster.boost_accuracy(symbol)
                    results[symbol] = boosted_signal
                except Exception as e:
                    logger.error(f"Booster {symbol} hatası: {e}")
                    results[symbol] = None
            return results
        
        test_results['AccuracyBooster'] = test_system('AccuracyBooster', test_booster)
    except Exception as e:
        logger.error(f"❌ AccuracyBooster import hatası: {e}")
        test_results['AccuracyBooster'] = None
    
    # 10. Master 90 Accuracy System Test
    try:
        from master_90_accuracy_system import Master90AccuracySystem
        master90 = Master90AccuracySystem()
        
        def test_master90():
            symbols = ['AAPL', 'MSFT', 'GOOGL']
            results = {}
            for symbol in symbols:
                try:
                    master_signal = master90.generate_master_signal(symbol)
                    results[symbol] = master_signal
                except Exception as e:
                    logger.error(f"Master90 {symbol} hatası: {e}")
                    results[symbol] = None
            return results
        
        test_results['Master90'] = test_system('Master90', test_master90)
    except Exception as e:
        logger.error(f"❌ Master90 import hatası: {e}")
        test_results['Master90'] = None
    
    # 11. Final 90 Accuracy Integrator Test
    try:
        from final_90_accuracy_integrator import Final90AccuracyIntegrator
        final_integrator = Final90AccuracyIntegrator()
        
        def test_final_integrator():
            symbols = ['AAPL', 'MSFT', 'GOOGL']
            results = {}
            for symbol in symbols:
                try:
                    final_signal = final_integrator.generate_final_signal(symbol)
                    results[symbol] = final_signal
                except Exception as e:
                    logger.error(f"FinalIntegrator {symbol} hatası: {e}")
                    results[symbol] = None
            return results
        
        test_results['FinalIntegrator'] = test_system('FinalIntegrator', test_final_integrator)
    except Exception as e:
        logger.error(f"❌ FinalIntegrator import hatası: {e}")
        test_results['FinalIntegrator'] = None
    
    # 12. Ultimate Master System Test
    try:
        from ultimate_master_system import UltimateMasterSystem
        ultimate = UltimateMasterSystem()
        
        def test_ultimate():
            symbols = ['AAPL', 'MSFT', 'GOOGL']
            results = {}
            for symbol in symbols:
                try:
                    ultimate_signal = ultimate.generate_ultimate_signal(symbol)
                    results[symbol] = ultimate_signal
                except Exception as e:
                    logger.error(f"Ultimate {symbol} hatası: {e}")
                    results[symbol] = None
            return results
        
        test_results['UltimateMaster'] = test_system('UltimateMaster', test_ultimate)
    except Exception as e:
        logger.error(f"❌ UltimateMaster import hatası: {e}")
        test_results['UltimateMaster'] = None
    
    # Test sonuçlarını özetle
    logger.info("\n" + "="*80)
    logger.info("📊 TEST SONUÇLARI ÖZETİ")
    logger.info("="*80)
    
    successful_tests = 0
    total_tests = len(test_results)
    
    for system_name, result in test_results.items():
        if result is not None:
            successful_tests += 1
            logger.info(f"✅ {system_name}: BAŞARILI")
        else:
            logger.info(f"❌ {system_name}: BAŞARISIZ")
    
    logger.info(f"\n📈 Başarı Oranı: {successful_tests}/{total_tests} ({successful_tests/total_tests*100:.1f}%)")
    
    if successful_tests == total_tests:
        logger.info("🎉 TÜM SİSTEMLER BAŞARIYLA TEST EDİLDİ!")
    else:
        logger.info(f"⚠️ {total_tests - successful_tests} sistem test edilemedi")
    
    logger.info("="*80)
    
    return test_results

if __name__ == "__main__":
    try:
        results = main()
        logger.info("🏁 Test süreci tamamlandı!")
    except Exception as e:
        logger.error(f"💥 Ana test hatası: {str(e)}")
        logger.error(f"Detay: {traceback.format_exc()}")
        sys.exit(1)
