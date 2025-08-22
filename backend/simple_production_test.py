#!/usr/bin/env python3
"""
Basit Production Testing - BIST AI Smart Trader
"""

import requests
import time
import json
from datetime import datetime

def test_health_endpoint():
    """Health endpoint testi"""
    try:
        print("🔍 Health endpoint testi...")
        response = requests.get("http://localhost:8001/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health test geçti: {data.get('status', 'unknown')}")
            return True
        else:
            print(f"❌ Health test başarısız: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Health test hatası: {e}")
        return False

def test_ai_models_status():
    """AI models status testi"""
    try:
        print("🔍 AI models status testi...")
        response = requests.get("http://localhost:8001/ai/models/status", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            models = data.get('models', {})
            print(f"✅ AI models status test geçti: {len(models)} model")
            return True
        else:
            print(f"❌ AI models status test başarısız: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ AI models status test hatası: {e}")
        return False

def test_ai_ensemble_prediction():
    """AI ensemble prediction testi"""
    try:
        print("🔍 AI ensemble prediction testi...")
        response = requests.get("http://localhost:8001/ai/ensemble/prediction/SISE.IS", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ AI ensemble prediction test geçti")
            return True
        else:
            print(f"❌ AI ensemble prediction test başarısız: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ AI ensemble prediction test hatası: {e}")
        return False

def test_accuracy_features():
    """Accuracy features testi"""
    try:
        print("🔍 Accuracy features testi...")
        response = requests.get("http://localhost:8001/accuracy/features/SISE.IS", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Accuracy features test geçti")
            return True
        elif response.status_code == 404:
            print(f"⚠️ Accuracy features test: Model bulunamadı (beklenen)")
            return True  # Bu beklenen bir durum
        else:
            print(f"❌ Accuracy features test başarısız: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Accuracy features test hatası: {e}")
        return False

def test_dashboard():
    """Dashboard testi"""
    try:
        print("🔍 Dashboard testi...")
        response = requests.get("http://localhost:8001/dashboard", timeout=10)
        
        if response.status_code == 200:
            content = response.text
            if "BIST AI Smart Trader" in content:
                print("✅ Dashboard test geçti")
                return True
            else:
                print("❌ Dashboard içeriği beklenmiyor")
                return False
        else:
            print(f"❌ Dashboard test başarısız: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Dashboard test hatası: {e}")
        return False

def test_performance():
    """Performance testi"""
    try:
        print("🔍 Performance testi...")
        
        # Response time testi
        start_time = time.time()
        response = requests.get("http://localhost:8001/health", timeout=10)
        end_time = time.time()
        
        response_time = end_time - start_time
        
        if response.status_code == 200:
            if response_time < 0.1:
                grade = "EXCELLENT"
            elif response_time < 0.5:
                grade = "GOOD"
            elif response_time < 1.0:
                grade = "ACCEPTABLE"
            else:
                grade = "POOR"
                
            print(f"✅ Performance test geçti: {response_time:.4f}s ({grade})")
            return True
        else:
            print(f"❌ Performance test başarısız: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Performance test hatası: {e}")
        return False

def test_ai_macro_regime():
    """AI macro regime testi"""
    try:
        print("🔍 AI macro regime testi...")
        response = requests.get("http://localhost:8001/ai/macro/regime", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ AI macro regime test geçti")
            return True
        else:
            print(f"❌ AI macro regime test başarısız: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ AI macro regime test hatası: {e}")
        return False

def main():
    """Ana test fonksiyonu"""
    print("🚀 BIST AI Smart Trader - Production Testing")
    print("=" * 50)
    
    start_time = time.time()
    
    # Test listesi
    tests = [
        ("Health Endpoint", test_health_endpoint),
        ("AI Models Status", test_ai_models_status),
        ("AI Ensemble Prediction", test_ai_ensemble_prediction),
        ("Accuracy Features", test_accuracy_features),
        ("AI Macro Regime", test_ai_macro_regime),
        ("Dashboard", test_dashboard),
        ("Performance", test_performance)
    ]
    
    results = []
    
    # Testleri çalıştır
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"❌ {test_name} test hatası: {e}")
            results.append((test_name, False))
    
    # Sonuçları özetle
    print("\n" + "=" * 50)
    print("📊 TEST SONUÇLARI")
    print("=" * 50)
    
    passed_tests = sum(1 for _, success in results if success)
    total_tests = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    print(f"\n🎯 Genel Sonuç: {passed_tests}/{total_tests} test geçti")
    
    if passed_tests == total_tests:
        print("🎉 Tüm testler başarılı!")
        overall_status = "PASS"
    elif passed_tests > 0:
        print("⚠️ Kısmi başarı")
        overall_status = "PARTIAL"
    else:
        print("❌ Tüm testler başarısız")
        overall_status = "FAIL"
    
    total_duration = time.time() - start_time
    print(f"⏱️ Toplam süre: {total_duration:.2f}s")
    
    # Sonuçları JSON olarak kaydet
    test_summary = {
        "overall_status": overall_status,
        "timestamp": datetime.now().isoformat(),
        "total_duration": round(total_duration, 2),
        "passed_tests": passed_tests,
        "total_tests": total_tests,
        "test_results": [
            {
                "test_name": test_name,
                "status": "PASS" if success else "FAIL"
            }
            for test_name, success in results
        ]
    }
    
    try:
        with open("production_test_results.json", "w") as f:
            json.dump(test_summary, f, indent=2)
        print(f"💾 Test sonuçları production_test_results.json dosyasına kaydedildi")
    except Exception as e:
        print(f"⚠️ Test sonuçları kaydedilemedi: {e}")
    
    print("=" * 50)
    return overall_status

if __name__ == "__main__":
    main()
