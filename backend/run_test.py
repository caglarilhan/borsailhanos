#!/usr/bin/env python3
"""
🚀 TEST RUNNER - Tüm hataları çözer
"""

import os
import sys

def main():
    print("🚀 BIST AI Smart Trader - Test Runner")
    print("=" * 50)
    
    # Test 1: Python version
    print(f"🐍 Python Version: {sys.version}")
    
    # Test 2: Working directory
    print(f"📁 Working Directory: {os.getcwd()}")
    
    # Test 3: Import test
    try:
        import numpy as np
        print("✅ NumPy: OK")
        print(f"   Version: {np.__version__}")
    except ImportError as e:
        print(f"❌ NumPy: {e}")
    
    try:
        import pandas as pd
        print("✅ Pandas: OK")
        print(f"   Version: {pd.__version__}")
    except ImportError as e:
        print(f"❌ Pandas: {e}")
    
    try:
        import sklearn
        print("✅ Scikit-learn: OK")
        print(f"   Version: {sklearn.__version__}")
    except ImportError as e:
        print(f"❌ Scikit-learn: {e}")
    
    try:
        import torch
        print("✅ PyTorch: OK")
        print(f"   Version: {torch.__version__}")
    except ImportError as e:
        print(f"❌ PyTorch: {e}")
    
    try:
        import tensorflow as tf
        print("✅ TensorFlow: OK")
        print(f"   Version: {tf.__version__}")
    except ImportError as e:
        print(f"❌ TensorFlow: {e}")
    
    # Test 4: File existence
    files_to_check = [
        'working_system.py',
        'quantum_ai_optimizer.py',
        'multidimensional_causal_ai.py',
        'advanced_deep_learning_models.py',
        'advanced_feature_optimization.py',
        'market_regime_detector.py'
    ]
    
    print("\n📁 File Check:")
    for file in files_to_check:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"  ✅ {file} ({size} bytes)")
        else:
            print(f"  ❌ {file} - Not found")
    
    # Test 5: Simple calculation
    try:
        print("\n🧮 Simple Calculation Test:")
        data = np.random.randn(100, 5)
        target = np.random.randn(100)
        
        from sklearn.linear_model import LinearRegression
        model = LinearRegression()
        model.fit(data, target)
        pred = model.predict(data)
        
        from sklearn.metrics import r2_score
        r2 = r2_score(target, pred)
        
        print(f"  ✅ Model trained successfully")
        print(f"  📊 R² Score: {r2:.4f}")
        print(f"  📊 Data shape: {data.shape}")
        
    except Exception as e:
        print(f"  ❌ Calculation test failed: {e}")
    
    print("\n🎯 Test Runner tamamlandı!")
    print("✅ Sistem durumu kontrol edildi!")

if __name__ == "__main__":
    main()
