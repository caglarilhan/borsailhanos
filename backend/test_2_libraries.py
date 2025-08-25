#!/usr/bin/env python3
"""
🧪 TEST 2: Library Import Test
Tüm gerekli kütüphanelerin import edilebilirliğini kontrol eder
"""

def test_2_libraries():
    """Test 2: Library imports"""
    print("🧪 TEST 2: Library Import Test")
    print("=" * 40)
    
    results = {}
    
    # Test 2.1: NumPy
    try:
        import numpy as np
        print(f"✅ NumPy: OK (Version: {np.__version__})")
        results['numpy'] = True
    except ImportError as e:
        print(f"❌ NumPy: {e}")
        results['numpy'] = False
    
    # Test 2.2: Pandas
    try:
        import pandas as pd
        print(f"✅ Pandas: OK (Version: {pd.__version__})")
        results['pandas'] = True
    except ImportError as e:
        print(f"❌ Pandas: {e}")
        results['pandas'] = False
    
    # Test 2.3: Scikit-learn
    try:
        import sklearn
        print(f"✅ Scikit-learn: OK (Version: {sklearn.__version__})")
        results['sklearn'] = True
    except ImportError as e:
        print(f"❌ Scikit-learn: {e}")
        results['sklearn'] = False
    
    # Test 2.4: PyTorch
    try:
        import torch
        print(f"✅ PyTorch: OK (Version: {torch.__version__})")
        results['pytorch'] = True
    except ImportError as e:
        print(f"❌ PyTorch: {e}")
        results['pytorch'] = False
    
    # Test 2.5: TensorFlow
    try:
        import tensorflow as tf
        print(f"✅ TensorFlow: OK (Version: {tf.__version__})")
        results['tensorflow'] = True
    except ImportError as e:
        print(f"❌ TensorFlow: {e}")
        results['tensorflow'] = False
    
    # Test 2.6: YFinance
    try:
        import yfinance as yf
        print(f"✅ YFinance: OK")
        results['yfinance'] = True
    except ImportError as e:
        print(f"❌ YFinance: {e}")
        results['yfinance'] = False
    
    # Test 2.7: Matplotlib
    try:
        import matplotlib
        print(f"✅ Matplotlib: OK (Version: {matplotlib.__version__})")
        results['matplotlib'] = True
    except ImportError as e:
        print(f"❌ Matplotlib: {e}")
        results['matplotlib'] = False
    
    # Test 2.8: Seaborn
    try:
        import seaborn as sns
        print(f"✅ Seaborn: OK")
        results['seaborn'] = True
    except ImportError as e:
        print(f"❌ Seaborn: {e}")
        results['seaborn'] = False
    
    # Test 2.9: Plotly
    try:
        import plotly
        print(f"✅ Plotly: OK")
        results['plotly'] = True
    except ImportError as e:
        print(f"❌ Plotly: {e}")
        results['plotly'] = False
    
    # Test 2.10: Optuna
    try:
        import optuna
        print(f"✅ Optuna: OK")
        results['optuna'] = True
    except ImportError as e:
        print(f"❌ Optuna: {e}")
        results['optuna'] = False
    
    # Results summary
    print(f"\n📊 TEST 2 SONUÇLARI:")
    print("-" * 30)
    
    success_count = sum(results.values())
    total_tests = len(results)
    
    for test_name, success in results.items():
        status = "✅ BAŞARILI" if success else "❌ BAŞARISIZ"
        print(f"  {test_name}: {status}")
    
    print(f"\n🎯 Genel Başarı: {success_count}/{total_tests} ({success_count/total_tests*100:.1f}%)")
    
    if success_count == total_tests:
        print("🎉 TEST 2 TAMAMEN BAŞARILI!")
        return True
    elif success_count >= total_tests * 0.8:
        print("⚠️ TEST 2 genel olarak başarılı, bazı kütüphaneler eksik")
        return True
    else:
        print("❌ TEST 2'de çok fazla kütüphane eksik!")
        return False

if __name__ == "__main__":
    test_2_libraries()
