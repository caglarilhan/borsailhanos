#!/usr/bin/env python3
"""
🚀 ULTRA SIMPLE TEST - Çalışan sistem
"""

print("🚀 BIST AI Smart Trader - Ultra Simple Test")
print("=" * 50)

# Test 1: Basic imports
try:
    import numpy as np
    print("✅ NumPy: OK")
except ImportError as e:
    print(f"❌ NumPy: {e}")

try:
    import pandas as pd
    print("✅ Pandas: OK")
except ImportError as e:
    print(f"❌ Pandas: {e}")

try:
    import sklearn
    print("✅ Scikit-learn: OK")
except ImportError as e:
    print(f"❌ Scikit-learn: {e}")

# Test 2: Simple calculation
try:
    # Create simple data
    data = np.random.randn(100, 5)
    target = np.random.randn(100)
    
    print(f"📊 Data shape: {data.shape}")
    print(f"📊 Target shape: {target.shape}")
    
    # Simple model
    from sklearn.linear_model import LinearRegression
    model = LinearRegression()
    model.fit(data, target)
    
    # Predict
    pred = model.predict(data)
    
    # Calculate accuracy (simple correlation)
    correlation = np.corrcoef(target, pred)[0, 1]
    accuracy = (correlation + 1) / 2  # Convert to 0-1 scale
    
    print(f"🎯 Model accuracy: {accuracy*100:.1f}%")
    print("✅ Simple test başarılı!")
    
except Exception as e:
    print(f"❌ Test hatası: {e}")
    import traceback
    traceback.print_exc()

print("\n🎯 Ultra Simple Test tamamlandı!")
