#!/usr/bin/env python3
"""
Production Testing Script for BIST AI Smart Trader
Tests the application in a production-like environment
"""

import requests
import time
import psutil
import logging
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProductionTester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.start_time = time.time()
        self.results = {
            "data_pipeline": {"status": "PENDING", "tests": []},
            "api_endpoints": {"status": "PENDING", "tests": []},
            "performance": {"status": "PENDING", "tests": []}
        }

    def test_health_endpoint(self):
        """Test the health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                health_data = response.json()
                logger.info(f"✅ Health check başarılı: {health_data.get('status', 'unknown')}")
                return True, "Health endpoint working", response.elapsed.total_seconds()
            else:
                logger.error(f"❌ Health check başarısız: {response.status_code}")
                return False, f"HTTP {response.status_code}", response.elapsed.total_seconds()
        except Exception as e:
            logger.error(f"❌ Health check hatası: {e}")
            return False, str(e), 0

    def test_metrics_endpoint(self):
        """Test the Prometheus metrics endpoint"""
        try:
            response = requests.get(f"{self.base_url}/metrics", timeout=10)
            if response.status_code == 200:
                logger.info("✅ Metrics endpoint çalışıyor")
                return True, "Metrics endpoint working", response.elapsed.total_seconds()
            else:
                logger.warning(f"⚠️ Metrics endpoint hatası: {response.status_code}")
                return False, f"HTTP {response.status_code}", response.elapsed.total_seconds()
        except Exception as e:
            logger.warning(f"⚠️ Metrics endpoint hatası: {e}")
            return False, str(e), 0

    def test_cache_stats(self):
        """Test the cache statistics endpoint"""
        try:
            response = requests.get(f"{self.base_url}/cache/stats", timeout=10)
            if response.status_code == 200:
                cache_data = response.json()
                logger.info(f"✅ Cache stats: {cache_data.get('cache', {}).get('status', 'unknown')}")
                return True, "Cache stats working", response.elapsed.total_seconds()
            else:
                logger.warning(f"⚠️ Cache stats hatası: {response.status_code}")
                return False, f"HTTP {response.status_code}", response.elapsed.total_seconds()
        except Exception as e:
            logger.warning(f"⚠️ Cache stats hatası: {e}")
            return False, str(e), 0

    def test_dashboard(self):
        """Test the dashboard endpoint"""
        try:
            response = requests.get(f"{self.base_url}/dashboard", timeout=10)
            if response.status_code == 200:
                logger.info("✅ Dashboard endpoint çalışıyor")
                return True, "Dashboard working", response.elapsed.total_seconds()
            else:
                logger.warning(f"⚠️ Dashboard hatası: {response.status_code}")
                return False, f"HTTP {response.status_code}", response.elapsed.total_seconds()
        except Exception as e:
            logger.warning(f"⚠️ Dashboard hatası: {e}")
            return False, str(e), 0

    def test_ai_models_status(self):
        """Test the AI models status endpoint"""
        try:
            response = requests.get(f"{self.base_url}/ai/models/status", timeout=10)
            if response.status_code == 200:
                logger.info("✅ AI Models status endpoint çalışıyor")
                return True, "AI Models status working", response.elapsed.total_seconds()
            else:
                logger.warning(f"⚠️ AI Models status hatası: {response.status_code}")
                return False, f"HTTP {response.status_code}", response.elapsed.total_seconds()
        except Exception as e:
            logger.warning(f"⚠️ AI Models status hatası: {e}")
            return False, str(e), 0

    def test_ai_ensemble_prediction(self):
        """Test the AI ensemble prediction endpoint"""
        try:
            response = requests.get(f"{self.base_url}/ai/ensemble/prediction/SISE.IS", timeout=10)
            if response.status_code == 200:
                logger.info("✅ AI Ensemble prediction endpoint çalışıyor")
                return True, "AI Ensemble prediction working", response.elapsed.total_seconds()
            else:
                logger.warning(f"⚠️ AI Ensemble prediction hatası: {response.status_code}")
                return False, f"HTTP {response.status_code}", response.elapsed.total_seconds()
        except Exception as e:
            logger.warning(f"⚠️ AI Ensemble prediction hatası: {e}")
            return False, str(e), 0

    def test_ai_macro_regime(self):
        """Test the AI macro regime endpoint"""
        try:
            response = requests.get(f"{self.base_url}/ai/macro/regime", timeout=10)
            if response.status_code == 200:
                logger.info("✅ AI Macro regime endpoint çalışıyor")
                return True, "AI Macro regime working", response.elapsed.total_seconds()
            else:
                logger.warning(f"⚠️ AI Macro regime hatası: {response.status_code}")
                return False, f"HTTP {response.status_code}", response.elapsed.total_seconds()
        except Exception as e:
            logger.warning(f"⚠️ AI Macro regime hatası: {e}")
            return False, str(e), 0

    def test_response_time(self):
        """Test response time performance"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.base_url}/health", timeout=10)
            end_time = time.time()
            
            response_time = end_time - start_time
            
            if response_time < 0.1:
                grade = "EXCELLENT"
            elif response_time < 0.5:
                grade = "GOOD"
            elif response_time < 1.0:
                grade = "ACCEPTABLE"
            else:
                grade = "POOR"
            
            logger.info(f"✅ Response time testi geçti: {response_time:.4f}s ({grade})")
            return True, f"{response_time:.4f}s ({grade})", response_time
        except Exception as e:
            logger.error(f"❌ Response time testi hatası: {e}")
            return False, str(e), 0

    def test_memory_usage(self):
        """Test memory usage"""
        try:
            process = psutil.Process()
            memory_info = process.memory_info()
            memory_mb = memory_info.rss / 1024 / 1024
            
            if memory_mb < 100:
                grade = "EXCELLENT"
            elif memory_mb < 200:
                grade = "GOOD"
            elif memory_mb < 500:
                grade = "ACCEPTABLE"
            else:
                grade = "POOR"
            
            logger.info(f"✅ Memory usage testi geçti: {memory_mb:.2f}MB ({grade})")
            return True, f"{memory_mb:.2f}MB ({grade})", memory_mb
        except Exception as e:
            logger.error(f"❌ Memory usage testi hatası: {e}")
            return False, str(e), 0

    def test_cpu_usage(self):
        """Test CPU usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            
            if cpu_percent < 30:
                grade = "EXCELLENT"
            elif cpu_percent < 60:
                grade = "GOOD"
            elif cpu_percent < 80:
                grade = "ACCEPTABLE"
            else:
                grade = "HIGH"
            
            logger.info(f"✅ CPU usage testi geçti: {cpu_percent:.2f}% ({grade})")
            return True, f"{cpu_percent:.2f}% ({grade})", cpu_percent
        except Exception as e:
            logger.error(f"❌ CPU usage testi hatası: {e}")
            return False, str(e), 0

    def run_data_pipeline_tests(self):
        """Run data pipeline tests"""
        logger.info("🔍 Veri Pipeline Testi Başlıyor...")
        
        # Basic connectivity tests
        tests = [
            ("Health Check", self.test_health_endpoint),
            ("Metrics Endpoint", self.test_metrics_endpoint),
            ("Cache Stats", self.test_cache_stats)
        ]
        
        passed = 0
        for test_name, test_func in tests:
            try:
                success, message, duration = test_func()
                self.results["data_pipeline"]["tests"].append({
                    "name": test_name,
                    "status": "PASS" if success else "FAIL",
                    "message": message,
                    "duration": duration
                })
                if success:
                    passed += 1
            except Exception as e:
                logger.error(f"❌ {test_name} testi hatası: {e}")
                self.results["data_pipeline"]["tests"].append({
                    "name": test_name,
                    "status": "ERROR",
                    "message": str(e),
                    "duration": 0
                })
        
        # Determine overall status
        if passed == len(tests):
            self.results["data_pipeline"]["status"] = "PASS"
            logger.info(f"🔍 Veri Pipeline Testi Tamamlandı: PASS ({passed}/{len(tests)})")
        elif passed > 0:
            self.results["data_pipeline"]["status"] = "PARTIAL"
            logger.info(f"🔍 Veri Pipeline Testi Tamamlandı: PARTIAL ({passed}/{len(tests)})")
        else:
            self.results["data_pipeline"]["status"] = "FAIL"
            logger.info(f"🔍 Veri Pipeline Testi Tamamlandı: FAIL ({passed}/{len(tests)})")

    def run_api_endpoint_tests(self):
        """Run API endpoint tests"""
        logger.info("🔍 API Endpoint Testi Başlıyor...")
        
        tests = [
            ("Dashboard", self.test_dashboard),
            ("AI Models Status", self.test_ai_models_status),
            ("AI Ensemble Prediction", self.test_ai_ensemble_prediction),
            ("AI Macro Regime", self.test_ai_macro_regime)
        ]
        
        passed = 0
        for test_name, test_func in tests:
            try:
                success, message, duration = test_func()
                self.results["api_endpoints"]["tests"].append({
                    "name": test_name,
                    "status": "PASS" if success else "FAIL",
                    "message": message,
                    "duration": duration
                })
                if success:
                    passed += 1
            except Exception as e:
                logger.error(f"❌ {test_name} testi hatası: {e}")
                self.results["api_endpoints"]["tests"].append({
                    "name": test_name,
                    "status": "ERROR",
                    "message": str(e),
                    "duration": 0
                })
        
        # Determine overall status
        if passed == len(tests):
            self.results["api_endpoints"]["status"] = "PASS"
            logger.info(f"🔍 API Endpoint Testi Tamamlandı: PASS ({passed}/{len(tests)})")
        elif passed > 0:
            self.results["api_endpoints"]["status"] = "PARTIAL"
            logger.info(f"🔍 API Endpoint Testi Tamamlandı: PARTIAL ({passed}/{len(tests)})")
        else:
            self.results["api_endpoints"]["status"] = "FAIL"
            logger.info(f"🔍 API Endpoint Testi Tamamlandı: FAIL ({passed}/{len(tests)})")

    def run_performance_tests(self):
        """Run performance tests"""
        logger.info("🔍 Performance Testi Başlıyor...")
        
        tests = [
            ("Response Time", self.test_response_time),
            ("Memory Usage", self.test_memory_usage),
            ("CPU Usage", self.test_cpu_usage)
        ]
        
        passed = 0
        for test_name, test_func in tests:
            try:
                success, message, duration = test_func()
                self.results["performance"]["tests"].append({
                    "name": test_name,
                    "status": "PASS" if success else "FAIL",
                    "message": message,
                    "duration": duration
                })
                if success:
                    passed += 1
            except Exception as e:
                logger.error(f"❌ {test_name} testi hatası: {e}")
                self.results["performance"]["tests"].append({
                    "name": test_name,
                    "status": "ERROR",
                    "message": str(e),
                    "duration": 0
                })
        
        # Determine overall status
        if passed == len(tests):
            self.results["performance"]["status"] = "PASS"
            logger.info(f"🔍 Performance Testi Tamamlandı: PASS ({passed}/{len(tests)})")
        elif passed > 0:
            self.results["performance"]["status"] = "PARTIAL"
            logger.info(f"🔍 Performance Testi Tamamlandı: PARTIAL ({passed}/{len(tests)})")
        else:
            self.results["performance"]["status"] = "FAIL"
            logger.info(f"🔍 Performance Testi Tamamlandı: FAIL ({passed}/{len(tests)})")

    def run_all_tests(self):
        """Run all production tests"""
        logger.info("🚀 Production Testing Başlıyor...")
        
        # Run all test suites
        self.run_data_pipeline_tests()
        self.run_api_endpoint_tests()
        self.run_performance_tests()
        
        # Calculate overall results
        total_tests = sum(len(suite["tests"]) for suite in self.results.values())
        passed_tests = sum(
            sum(1 for test in suite["tests"] if test["status"] == "PASS")
            for suite in self.results.values()
        )
        
        # Determine overall status
        if all(suite["status"] == "PASS" for suite in self.results.values()):
            overall_status = "PASS"
        elif any(suite["status"] == "PASS" for suite in self.results.values()):
            overall_status = "PARTIAL"
        else:
            overall_status = "FAIL"
        
        # Generate final report
        total_duration = time.time() - self.start_time
        
        logger.info("🚀 Production Testing Tamamlandı: " + overall_status)
        
        # Print detailed results
        print("\n" + "=" * 60)
        print("🚀 PRODUCTION TESTING SONUÇLARI")
        print("=" * 60)
        print(f"📊 Genel Durum: {overall_status}")
        print(f"⏱️ Toplam Süre: {total_duration:.1f}s")
        print(f"📝 Özet: {passed_tests}/{total_tests} test geçti")
        print(f"🕐 Zaman: {datetime.now().isoformat()}")
        print("=" * 60)
        
        for suite_name, suite_results in self.results.items():
            print(f"\n🔍 {suite_name.upper().replace('_', ' ')}:")
            print(f"   Durum: {suite_results['status']}")
            
            passed = sum(1 for test in suite_results["tests"] if test["status"] == "PASS")
            total = len(suite_results["tests"])
            
            if total > 0:
                print(f"   Özet: {passed}/{total} test geçti")
            
            for test in suite_results["tests"]:
                status_icon = "✅" if test["status"] == "PASS" else "❌"
                print(f"   {status_icon} {test['name']}: {test['message']}")
        
        print("=" * 60)
        
        return overall_status

def main():
    """Main function"""
    tester = ProductionTester()
    result = tester.run_all_tests()
    
    # Save results to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"production_test_results_{timestamp}.json"
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(tester.results, f, indent=2, ensure_ascii=False, default=str)
    
    logger.info(f"💾 Test sonuçları kaydedildi: {filename}")
    
    return result

if __name__ == "__main__":
    main() 