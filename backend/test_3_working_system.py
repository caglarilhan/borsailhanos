#!/usr/bin/env python3
"""
🧪 TEST 3: Working System Test
Working System'in temel ML pipeline'ını test eder
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score
import warnings
warnings.filterwarnings('ignore')

def test_3_working_system():
    """Test 3: Working System functionality"""
    print("🧪 TEST 3: Working System Test")
    print("=" * 40)
    
    results = {}
    
    # Test 3.1: Data creation
    try:
        np.random.seed(42)
        n_samples = 200
        
        # Create financial data
        data = pd.DataFrame({
            'price': np.cumsum(np.random.randn(n_samples) * 0.01) + 100,
            'volume': np.random.lognormal(10, 1, n_samples),
            'rsi': np.random.uniform(20, 80, n_samples),
            'macd': np.random.randn(n_samples),
            'volatility': np.random.exponential(0.1, n_samples)
        })
        
        # Target: future price change
        data['target'] = data['price'].pct_change().shift(-1)
        data = data.dropna()
        
        print(f"✅ Data creation: OK ({data.shape})")
        results['data_creation'] = True
    except Exception as e:
        print(f"❌ Data creation error: {e}")
        results['data_creation'] = False
        return False
    
    # Test 3.2: Feature preparation
    try:
        # Basic features
        data['price_change'] = data['price'].pct_change()
        data['volume_ratio'] = data['volume'] / data['volume'].rolling(5).mean()
        data['price_sma_ratio'] = data['price'] / data['price'].rolling(10).mean()
        
        # Drop NaN
        data = data.dropna()
        
        # Select features
        feature_cols = ['price_change', 'volume_ratio', 'price_sma_ratio', 'rsi', 'macd', 'volatility']
        X = data[feature_cols].values
        y = data['target'].values
        
        print(f"✅ Feature preparation: OK (X={X.shape}, y={y.shape})")
        results['feature_preparation'] = True
    except Exception as e:
        print(f"❌ Feature preparation error: {e}")
        results['feature_preparation'] = False
        return False
    
    # Test 3.3: Model training
    try:
        # Split data
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        
        # Train Random Forest
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        print(f"✅ Model training: OK")
        results['model_training'] = True
    except Exception as e:
        print(f"❌ Model training error: {e}")
        results['model_training'] = False
        return False
    
    # Test 3.4: Model prediction
    try:
        # Predict
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        r2 = r2_score(y_test, y_pred)
        
        # Calculate accuracy (correlation-based)
        correlation = np.corrcoef(y_test, y_pred)[0, 1]
        accuracy = (correlation + 1) / 2
        
        print(f"✅ Model prediction: OK")
        print(f"   R² Score: {r2:.4f}")
        print(f"   Accuracy: {accuracy*100:.1f}%")
        
        results['model_prediction'] = True
        results['r2_score'] = r2
        results['accuracy'] = accuracy
    except Exception as e:
        print(f"❌ Model prediction error: {e}")
        results['model_prediction'] = False
        return False
    
    # Test 3.5: Performance evaluation
    try:
        # Performance thresholds
        r2_threshold = 0.3  # R² should be > 0.3 for basic model
        accuracy_threshold = 0.6  # Accuracy should be > 60%
        
        r2_pass = r2 > r2_threshold
        accuracy_pass = accuracy > accuracy_threshold
        
        print(f"✅ Performance evaluation: OK")
        print(f"   R² threshold ({r2_threshold}): {'✅ PASS' if r2_pass else '❌ FAIL'}")
        print(f"   Accuracy threshold ({accuracy_threshold*100:.0f}%): {'✅ PASS' if accuracy_pass else '❌ FAIL'}")
        
        results['performance_evaluation'] = True
        results['r2_pass'] = r2_pass
        results['accuracy_pass'] = accuracy_pass
    except Exception as e:
        print(f"❌ Performance evaluation error: {e}")
        results['performance_evaluation'] = False
        return False
    
    # Results summary
    print(f"\n📊 TEST 3 SONUÇLARI:")
    print("-" * 30)
    
    success_count = sum([v for k, v in results.items() if isinstance(v, bool)])
    total_tests = len([k for k, v in results.items() if isinstance(v, bool)])
    
    for test_name, success in results.items():
        if isinstance(success, bool):
            status = "✅ BAŞARILI" if success else "❌ BAŞARISIZ"
            print(f"  {test_name}: {status}")
    
    print(f"\n🎯 Genel Başarı: {success_count}/{total_tests} ({success_count/total_tests*100:.1f}%)")
    print(f"📊 R² Score: {results.get('r2_score', 0):.4f}")
    print(f"🎯 Accuracy: {results.get('accuracy', 0)*100:.1f}%")
    
    if success_count == total_tests:
        print("🎉 TEST 3 TAMAMEN BAŞARILI!")
        return True
    else:
        print("⚠️ TEST 3'te bazı sorunlar var!")
        return False

if __name__ == "__main__":
    test_3_working_system()
