#!/usr/bin/env python3
"""
🚀 Railway Production Testing
BIST AI Smart Trader v2.0 - Railway Deployment Sonrası Test
"""

import requests
import time
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional

# Logging setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RailwayProductionTester:
    """Railway deployment sonrası production testing"""
    
    def __init__(self, base_url: str = "https://your-app.railway.app"):
        self.base_url = base_url
        self.test_results = {}
        self.start_time = time.time()
        
    def test_health_endpoint(self) -> bool:
        """Health endpoint testi"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                logger.info("✅ Health endpoint çalışıyor")
                return True
            else:
                logger.error(f"❌ Health endpoint hatası: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Health endpoint bağlantı hatası: {e}")
            return False
    
    def test_metrics_endpoint(self) -> bool:
        """Prometheus metrics endpoint testi"""
        try:
            response = requests.get(f"{self.base_url}/metrics", timeout=10)
            if response.status_code == 200:
                logger.info("✅ Metrics endpoint çalışıyor")
                return True
            else:
                logger.error(f"❌ Metrics endpoint hatası: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Metrics endpoint bağlantı hatası: {e}")
            return False
    
    def test_dashboard_endpoint(self) -> bool:
        """Dashboard endpoint testi"""
        try:
            response = requests.get(f"{self.base_url}/dashboard", timeout=15)
            if response.status_code == 200:
                logger.info("✅ Dashboard endpoint çalışıyor")
                return True
            else:
                logger.error(f"❌ Dashboard endpoint hatası: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Dashboard endpoint bağlantı hatası: {e}")
            return False
    
    def test_ai_ensemble_prediction(self) -> bool:
        """AI Ensemble prediction testi"""
        try:
            response = requests.get(f"{self.base_url}/ai/ensemble/prediction/GARAN.IS", timeout=20)
            if response.status_code == 200:
                logger.info("✅ AI Ensemble prediction çalışıyor")
                return True
            else:
                logger.warning(f"⚠️ AI Ensemble prediction hatası: {response.status_code}")
                return False
        except Exception as e:
            logger.warning(f"⚠️ AI Ensemble prediction bağlantı hatası: {e}")
            return False
    
    def test_ai_macro_regime(self) -> bool:
        """AI Macro regime testi"""
        try:
            response = requests.get(f"{self.base_url}/ai/macro/regime", timeout=15)
            if response.status_code == 200:
                logger.info("✅ AI Macro regime çalışıyor")
                return True
            else:
                logger.error(f"❌ AI Macro regime hatası: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ AI Macro regime bağlantı hatası: {e}")
            return False
    
    def test_response_time(self) -> bool:
        """Response time testi"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.base_url}/health", timeout=10)
            end_time = time.time()
            
            response_time = end_time - start_time
            
            if response_time < 1.0:
                logger.info(f"✅ Response time testi geçti: {response_time:.4f}s (EXCELLENT)")
                return True
            elif response_time < 2.0:
                logger.info(f"✅ Response time testi geçti: {response_time:.4f}s (GOOD)")
                return True
            elif response_time < 5.0:
                logger.info(f"⚠️ Response time testi geçti: {response_time:.4f}s (ACCEPTABLE)")
                return True
            else:
                logger.error(f"❌ Response time testi başarısız: {response_time:.4f}s (SLOW)")
                return False
        except Exception as e:
            logger.error(f"❌ Response time testi hatası: {e}")
            return False
    
    def run_all_tests(self) -> Dict:
        """Tüm testleri çalıştır"""
        logger.info("🚀 Railway Production Testing Başlıyor...")
        
        tests = [
            ("Health Endpoint", self.test_health_endpoint),
            ("Metrics Endpoint", self.test_metrics_endpoint),
            ("Dashboard Endpoint", self.test_dashboard_endpoint),
            ("AI Ensemble Prediction", self.test_ai_ensemble_prediction),
            ("AI Macro Regime", self.test_ai_macro_regime),
            ("Response Time", self.test_response_time)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            logger.info(f"🧪 {test_name} testi başlıyor...")
            try:
                if test_func():
                    passed += 1
                    self.test_results[test_name] = "PASS"
                else:
                    self.test_results[test_name] = "FAIL"
            except Exception as e:
                logger.error(f"❌ {test_name} testi exception: {e}")
                self.test_results[test_name] = "ERROR"
        
        # Sonuçları hesapla
        end_time = time.time()
        total_time = end_time - self.start_time
        
        # Genel durum
        if passed == total:
            overall_status = "PASS"
        elif passed >= total * 0.8:
            overall_status = "PARTIAL"
        else:
            overall_status = "FAIL"
        
        # Sonuç özeti
        results = {
            "overall_status": overall_status,
            "total_tests": total,
            "passed_tests": passed,
            "failed_tests": total - passed,
            "success_rate": f"{(passed/total)*100:.1f}%",
            "total_time": f"{total_time:.2f}s",
            "timestamp": datetime.now().isoformat(),
            "test_results": self.test_results,
            "railway_url": self.base_url
        }
        
        # Sonuçları logla
        logger.info("=" * 60)
        logger.info("🚀 RAILWAY PRODUCTION TESTING SONUÇLARI")
        logger.info("=" * 60)
        logger.info(f"📊 Genel Durum: {overall_status}")
        logger.info(f"⏱️ Toplam Süre: {total_time:.2f}s")
        logger.info(f"📝 Özet: {passed}/{total} test geçti")
        logger.info(f"🕐 Zaman: {datetime.now().isoformat()}")
        logger.info("=" * 60)
        
        for test_name, result in self.test_results.items():
            status_icon = "✅" if result == "PASS" else "❌" if result == "FAIL" else "⚠️"
            logger.info(f"{status_icon} {test_name}: {result}")
        
        logger.info("=" * 60)
        
        if overall_status == "PASS":
            logger.info("🎉 TÜM TESTLER BAŞARILI! Railway deployment mükemmel!")
        elif overall_status == "PARTIAL":
            logger.info("⚠️ BAZI TESTLER BAŞARILI, İYİLEŞTİRME GEREKLİ")
        else:
            logger.info("❌ ÇOK TEST BAŞARISIZ, ACİL DÜZELTME GEREKLİ")
        
        return results

def main():
    """Ana fonksiyon"""
    # Railway URL'ini buraya girin
    railway_url = input("🚀 Railway URL'ini girin (örn: https://your-app.railway.app): ").strip()
    
    if not railway_url:
        railway_url = "https://your-app.railway.app"
        logger.warning("⚠️ URL girilmedi, varsayılan kullanılıyor")
    
    # Tester'ı başlat
    tester = RailwayProductionTester(railway_url)
    
    # Testleri çalıştır
    results = tester.run_all_tests()
    
    # Sonuçları kaydet
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"railway_production_test_results_{timestamp}.json"
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)
    
    logger.info(f"💾 Test sonuçları kaydedildi: {filename}")
    
    return results

if __name__ == "__main__":
    main()
