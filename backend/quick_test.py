#!/usr/bin/env python3
"""
🚀 Quick Test Script - Sistem Testi
"""

import sys
import os

def main():
    print("🚀 BIST AI Smart Trader - Quick Test")
    print("=" * 50)
    
    # Test 1: Python version
    print(f"🐍 Python Version: {sys.version}")
    
    # Test 2: Working directory
    print(f"📁 Working Directory: {os.getcwd()}")
    
    # Test 3: Import test
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
    
    try:
        import torch
        print("✅ PyTorch: OK")
    except ImportError as e:
        print(f"❌ PyTorch: {e}")
    
    try:
        import tensorflow as tf
        print("✅ TensorFlow: OK")
    except ImportError as e:
        print(f"❌ TensorFlow: {e}")
    
    # Test 4: File existence
    files_to_check = [
        'optimized_final_integrator.py',
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
    
    print("\n🎯 Quick Test tamamlandı!")

if __name__ == "__main__":
    main()
