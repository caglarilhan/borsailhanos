#!/usr/bin/env python3
"""
🧪 TEST 1: Basic Python Test
Python'un temel çalışmasını kontrol eder
"""

import sys
import os

def test_1_basic_python():
    """Test 1: Basic Python functionality"""
    print("🧪 TEST 1: Basic Python Test")
    print("=" * 40)
    
    results = {}
    
    # Test 1.1: Python version
    try:
        version = sys.version
        print(f"✅ Python Version: {version}")
        results['python_version'] = True
    except Exception as e:
        print(f"❌ Python Version Error: {e}")
        results['python_version'] = False
    
    # Test 1.2: Working directory
    try:
        cwd = os.getcwd()
        print(f"✅ Working Directory: {cwd}")
        results['working_directory'] = True
    except Exception as e:
        print(f"❌ Working Directory Error: {e}")
        results['working_directory'] = False
    
    # Test 1.3: File existence
    try:
        files = os.listdir('.')
        print(f"✅ Files in directory: {len(files)} files")
        results['file_access'] = True
    except Exception as e:
        print(f"❌ File Access Error: {e}")
        results['file_access'] = False
    
    # Test 1.4: Basic math
    try:
        result = 2 + 2
        if result == 4:
            print("✅ Basic Math: 2 + 2 = 4")
            results['basic_math'] = True
        else:
            print(f"❌ Basic Math Error: 2 + 2 = {result}")
            results['basic_math'] = False
    except Exception as e:
        print(f"❌ Basic Math Error: {e}")
        results['basic_math'] = False
    
    # Test 1.5: String operations
    try:
        text = "BIST AI Smart Trader"
        if "AI" in text:
            print("✅ String Operations: 'AI' found in text")
            results['string_operations'] = True
        else:
            print("❌ String Operations Error")
            results['string_operations'] = False
    except Exception as e:
        print(f"❌ String Operations Error: {e}")
        results['string_operations'] = False
    
    # Results summary
    print(f"\n📊 TEST 1 SONUÇLARI:")
    print("-" * 30)
    
    success_count = sum(results.values())
    total_tests = len(results)
    
    for test_name, success in results.items():
        status = "✅ BAŞARILI" if success else "❌ BAŞARISIZ"
        print(f"  {test_name}: {status}")
    
    print(f"\n🎯 Genel Başarı: {success_count}/{total_tests} ({success_count/total_tests*100:.1f}%)")
    
    if success_count == total_tests:
        print("🎉 TEST 1 TAMAMEN BAŞARILI!")
        return True
    else:
        print("⚠️ TEST 1'de bazı sorunlar var!")
        return False

if __name__ == "__main__":
    test_1_basic_python()
