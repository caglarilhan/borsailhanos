#!/usr/bin/env python3
"""
Test script for new features:
- Intelligent Cache
- Online Learning System
- Advanced Feature Engineering
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.intelligent_cache import IntelligentCache, get_cache
from services.online_learning_system import OnlineLearningSystem, get_online_learner
from services.advanced_feature_engineering_v3 import AdvancedFeatureEngineering, get_feature_engine
import numpy as np
import pandas as pd
from datetime import datetime

def test_cache():
    """Test intelligent cache"""
    print("\n" + "="*60)
    print("🧪 TEST 1: Intelligent Cache")
    print("="*60)
    
    cache = get_cache()
    
    # Test 1: Set and get
    test_data = {'prediction': 'BUY', 'confidence': 0.87, 'symbol': 'THYAO'}
    cache.set('predictions', test_data, 'THYAO', 'ensemble', '1d')
    
    cached = cache.get('predictions', 'THYAO', 'ensemble', '1d')
    print(f"✅ Cache set/get test: {cached == test_data}")
    
    # Test 2: Cache stats
    stats = cache.get_stats()
    print(f"✅ Cache stats: {stats}")
    
    # Test 3: Cache invalidation
    cache.invalidate('predictions:THYAO')
    cached_after_invalidate = cache.get('predictions', 'THYAO', 'ensemble', '1d')
    print(f"✅ Cache invalidation test: {cached_after_invalidate is None}")


def test_online_learning():
    """Test online learning system"""
    print("\n" + "="*60)
    print("🧪 TEST 2: Online Learning System")
    print("="*60)
    
    learner = get_online_learner(model_type='classification')
    
    # Test 1: Initial state
    print(f"✅ Online learner initialized: {learner is not None}")
    
    # Test 2: Partial fit (if sklearn available)
    try:
        X = np.random.rand(10, 5)
        y = np.random.randint(0, 2, 10)
        learner.partial_fit(X, y)
        print(f"✅ Partial fit test: PASSED")
    except Exception as e:
        print(f"⚠️ Partial fit test: {e}")
    
    # Test 3: Performance metrics
    metrics = learner.get_performance_metrics()
    print(f"✅ Performance metrics: {metrics}")


def test_feature_engineering():
    """Test advanced feature engineering"""
    print("\n" + "="*60)
    print("🧪 TEST 3: Advanced Feature Engineering")
    print("="*60)
    
    feature_engine = get_feature_engine()
    
    # Test 1: Create mock price data
    dates = pd.date_range(start='2024-01-01', periods=100, freq='D')
    price_data = pd.DataFrame({
        'Open': np.random.uniform(90, 110, 100),
        'High': np.random.uniform(100, 120, 100),
        'Low': np.random.uniform(80, 100, 100),
        'Close': np.random.uniform(90, 110, 100),
        'Volume': np.random.uniform(1000000, 5000000, 100)
    }, index=dates)
    
    # Test 2: Generate advanced features
    try:
        features = feature_engine.create_all_features(
            symbol='THYAO',
            price_data=price_data,
            market_data=None
        )
        print(f"✅ Feature generation: {len(features.columns)} features created")
        print(f"   Feature names: {list(features.columns)[:10]}...")  # İlk 10 feature
    except Exception as e:
        print(f"❌ Feature generation failed: {e}")
    
    # Test 3: Feature importance
    try:
        target = pd.Series(np.random.rand(100))
        importance = feature_engine.get_feature_importance(features, target)
        print(f"✅ Feature importance: {len(importance)} features analyzed")
        # En önemli 5 feature
        top_features = sorted(importance.items(), key=lambda x: x[1], reverse=True)[:5]
        print(f"   Top 5 features: {top_features}")
    except Exception as e:
        print(f"⚠️ Feature importance calculation: {e}")


def test_integration():
    """Test integration of all features"""
    print("\n" + "="*60)
    print("🧪 TEST 4: Integration Test")
    print("="*60)
    
    try:
        from services.advanced_ai_ensemble import AdvancedAIEnsemble
        
        ensemble = AdvancedAIEnsemble()
        print(f"✅ Ensemble initialized with new modules: {ensemble.cache is not None}")
        print(f"   Cache available: {ensemble.cache is not None}")
        print(f"   Online learner available: {ensemble.online_learner is not None}")
        print(f"   Feature engine available: {ensemble.feature_engine is not None}")
        
    except Exception as e:
        print(f"❌ Integration test failed: {e}")


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Testing New Features: Cache, Online Learning, Feature Engineering")
    print("="*60)
    
    test_cache()
    test_online_learning()
    test_feature_engineering()
    test_integration()
    
    print("\n" + "="*60)
    print("✅ All tests completed!")
    print("="*60 + "\n")

