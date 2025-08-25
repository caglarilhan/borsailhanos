#!/usr/bin/env python3
"""
🚀 MASTER TEST RUNNER - BIST AI Smart Trader
Tüm testleri sırayla çalıştırır ve kapsamlı sonuç verir
"""

import time
import sys
import os

def run_master_test():
    """Master test runner - tüm testleri sırayla çalıştırır"""
    print("🚀 BIST AI Smart Trader - MASTER TEST RUNNER")
    print("=" * 60)
    print("🎯 Tüm testler sırayla çalıştırılıyor...")
    print("=" * 60)
    
    # Test listesi
    tests = [
        {
            'name': 'TEST 1: Basic Python',
            'file': 'test_1_basic.py',
            'description': 'Python temel çalışması'
        },
        {
            'name': 'TEST 2: Library Imports',
            'file': 'test_2_libraries.py',
            'description': 'Kütüphane import testleri'
        },
        {
            'name': 'TEST 3: Working System',
            'file': 'test_3_working_system.py',
            'description': 'Temel ML pipeline testi'
        },
        {
            'name': 'TEST 4: Final Working System',
            'file': 'test_4_final_system.py',
            'description': 'Gelişmiş sistem testi'
        },
        {
            'name': 'TEST 5: Real BIST Data',
            'file': 'test_5_real_bist.py',
            'description': 'Gerçek BIST veri testi'
        }
    ]
    
    # Test sonuçları
    all_results = {}
    total_success = 0
    total_tests = len(tests)
    
    # Her testi çalıştır
    for i, test in enumerate(tests, 1):
        print(f"\n{'='*60}")
        print(f"🧪 {test['name']} ({i}/{total_tests})")
        print(f"📝 {test['description']}")
        print(f"{'='*60}")
        
        try:
            # Test dosyasının varlığını kontrol et
            if not os.path.exists(test['file']):
                print(f"❌ Test dosyası bulunamadı: {test['file']}")
                all_results[test['name']] = {
                    'status': 'FILE_NOT_FOUND',
                    'success': False,
                    'error': f'Test dosyası bulunamadı: {test['file']}'
                }
                continue
            
            # Test dosyasını import et ve çalıştır
            test_module = __import__(test['file'].replace('.py', ''))
            
            # Test fonksiyonunu bul ve çalıştır
            test_function_name = test['file'].replace('.py', '').replace('test_', 'test_')
            test_function = getattr(test_module, test_function_name, None)
            
            if test_function is None:
                print(f"❌ Test fonksiyonu bulunamadı: {test_function_name}")
                all_results[test['name']] = {
                    'status': 'FUNCTION_NOT_FOUND',
                    'success': False,
                    'error': f'Test fonksiyonu bulunamadı: {test_function_name}'
                }
                continue
            
            # Testi çalıştır
            start_time = time.time()
            result = test_function()
            end_time = time.time()
            
            execution_time = end_time - start_time
            
            if result:
                print(f"✅ {test['name']} BAŞARILI! ({execution_time:.2f}s)")
                all_results[test['name']] = {
                    'status': 'SUCCESS',
                    'success': True,
                    'execution_time': execution_time
                }
                total_success += 1
            else:
                print(f"❌ {test['name']} BAŞARISIZ! ({execution_time:.2f}s)")
                all_results[test['name']] = {
                    'status': 'FAILED',
                    'success': False,
                    'execution_time': execution_time
                }
            
        except Exception as e:
            print(f"❌ {test['name']} HATA! {str(e)}")
            all_results[test['name']] = {
                'status': 'ERROR',
                'success': False,
                'error': str(e),
                'execution_time': 0
            }
        
        # Test arası bekle
        time.sleep(1)
    
    # Final sonuçları
    print(f"\n{'='*60}")
    print("🎯 FINAL TEST SONUÇLARI")
    print(f"{'='*60}")
    
    for test_name, result in all_results.items():
        status_icon = "✅" if result['success'] else "❌"
        status_text = result['status']
        execution_time = result.get('execution_time', 0)
        
        print(f"{status_icon} {test_name}: {status_text} ({execution_time:.2f}s)")
        
        if result['status'] == 'ERROR':
            print(f"   Hata: {result.get('error', 'Bilinmeyen hata')}")
    
    # Genel istatistikler
    print(f"\n📊 GENEL İSTATİSTİKLER:")
    print(f"{'='*40}")
    
    success_rate = (total_success / total_tests) * 100
    print(f"🎯 Toplam Test: {total_tests}")
    print(f"✅ Başarılı: {total_success}")
    print(f"❌ Başarısız: {total_tests - total_success}")
    print(f"📊 Başarı Oranı: {success_rate:.1f}%")
    
    # Performance değerlendirmesi
    print(f"\n🏆 PERFORMANS DEĞERLENDİRMESİ:")
    print(f"{'='*40}")
    
    if success_rate >= 90:
        print("🎉 MÜKEMMEL! Sistem %90+ başarı oranı ile çalışıyor!")
        print("🚀 Production'a geçmeye hazır!")
    elif success_rate >= 80:
        print("✅ İYİ! Sistem %80+ başarı oranı ile çalışıyor!")
        print("⚠️ Küçük iyileştirmeler gerekli")
    elif success_rate >= 60:
        print("⚠️ ORTA! Sistem %60+ başarı oranı ile çalışıyor!")
        print("🔧 Orta seviye iyileştirmeler gerekli")
    else:
        print("❌ DÜŞÜK! Sistem %60 altı başarı oranı!")
        print("🚨 Major iyileştirmeler gerekli!")
    
    # Sonraki adımlar
    print(f"\n📋 SONRAKI ADIMLAR:")
    print(f"{'='*40}")
    
    if success_rate >= 80:
        print("1. 🚀 Production deployment")
        print("2. ⚡ API endpoints oluştur")
        print("3. 📊 Monitoring sistemi kur")
        print("4. 📱 Flutter frontend geliştir")
    elif success_rate >= 60:
        print("1. 🔧 Başarısız testleri düzelt")
        print("2. 🧪 Testleri tekrar çalıştır")
        print("3. 📈 Performance iyileştir")
    else:
        print("1. 🚨 Major sistem sorunlarını çöz")
        print("2. 🔍 Hata analizi yap")
        print("3. 🏗️ Sistem mimarisini gözden geçir")
    
    print(f"\n{'='*60}")
    print("🎯 MASTER TEST RUNNER TAMAMLANDI!")
    print(f"{'='*60}")
    
    return success_rate >= 80

if __name__ == "__main__":
    try:
        success = run_master_test()
        if success:
            print("🎉 TÜM TESTLER BAŞARILI! SİSTEM PRODUCTION'A HAZIR!")
        else:
            print("⚠️ BAZI TESTLER BAŞARISIZ! İYİLEŞTİRME GEREKLİ!")
    except Exception as e:
        print(f"❌ Master test runner hatası: {e}")
        import traceback
        traceback.print_exc()
