#!/usr/bin/env python3
"""
🚀 COMPREHENSIVE TEST RUNNER
Tüm sistemleri test eder
"""

import os
import sys
import subprocess
import time

def run_test(test_name, command):
    """Test çalıştır"""
    print(f"\n🧪 {test_name} Testi Başlıyor...")
    print("=" * 50)
    
    try:
        # Run command
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print(f"✅ {test_name} BAŞARILI!")
            print("📊 Output:")
            print(result.stdout)
        else:
            print(f"❌ {test_name} BAŞARISIZ!")
            print(f"📊 Error Code: {result.returncode}")
            print("📊 Error Output:")
            print(result.stderr)
            print("📊 Standard Output:")
            print(result.stdout)
            
        return result.returncode == 0
        
    except subprocess.TimeoutExpired:
        print(f"⏰ {test_name} timeout!")
        return False
    except Exception as e:
        print(f"❌ {test_name} hatası: {e}")
        return False

def main():
    """Ana test fonksiyonu"""
    print("🚀 BIST AI Smart Trader - Comprehensive Test Runner")
    print("=" * 60)
    
    # Test listesi
    tests = [
        ("Basic Python", "python3 -c 'print(\"Python çalışıyor\"); import numpy; print(\"NumPy OK\")'"),
        ("Test Runner", "python3 run_test.py"),
        ("Working System", "python3 working_system.py"),
        ("Final Working System", "python3 final_working_system.py"),
        ("Ultra Simple Test", "python3 ultra_simple_test.py")
    ]
    
    # Test sonuçları
    results = {}
    success_count = 0
    
    # Her testi çalıştır
    for test_name, command in tests:
        success = run_test(test_name, command)
        results[test_name] = success
        
        if success:
            success_count += 1
        
        # Test arası bekle
        time.sleep(1)
    
    # Final sonuçlar
    print(f"\n🎯 FINAL TEST SONUÇLARI:")
    print("=" * 40)
    
    for test_name, success in results.items():
        status = "✅ BAŞARILI" if success else "❌ BAŞARISIZ"
        print(f"  {test_name}: {status}")
    
    print(f"\n📊 Genel Başarı: {success_count}/{len(tests)} ({success_count/len(tests)*100:.1f}%)")
    
    if success_count == len(tests):
        print("🎉 TÜM TESTLER BAŞARILI!")
        print("🚀 BIST AI Smart Trader mükemmel çalışıyor!")
    elif success_count > len(tests) / 2:
        print("⚠️ Çoğu test başarılı, bazı sorunlar var")
    else:
        print("❌ Çok fazla test başarısız, sistemde ciddi sorunlar var")
    
    return success_count == len(tests)

if __name__ == "__main__":
    main()
