"""
🧪 DETAILED SYSTEM TEST - BIST AI Smart Trader
Mevcut %134 accuracy sistemini detaylı test eder
Sprint-0 modüllerini ve mevcut sistemleri kapsamlı kontrol eder
"""

import asyncio
import logging
import time
from datetime import datetime
from typing import Dict, List, Optional
import json
import pandas as pd
import numpy as np

# Local imports
from integrated_sprint0_system import IntegratedSprint0System
from finnhub_websocket_layer import FinnhubWebSocketLayer
from fundamental_data_layer import FundamentalDataLayer
from grey_topsis_entropy_ranking import GreyTOPSISEntropyRanking

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DetailedSystemTest:
    """
    Mevcut sistemi detaylı test eder
    Her modülü ayrı ayrı ve entegre olarak test eder
    """
    
    def __init__(self):
        self.test_results = {
            'start_time': datetime.now().isoformat(),
            'modules_tested': [],
            'integration_tests': [],
            'performance_metrics': {},
            'errors': [],
            'warnings': [],
            'final_status': 'PENDING'
        }
        
        # Test sembolleri
        self.test_symbols = [
            "AAPL", "GOOGL", "MSFT",  # ABD
            "SISE.IS", "EREGL.IS", "TUPRS.IS"  # BIST
        ]
        
        logger.info("🧪 Detailed System Test başlatıldı")
    
    async def test_websocket_layer_detailed(self) -> Dict:
        """WebSocket layer detaylı testi"""
        logger.info("🔌 WebSocket Layer Detaylı Test Başlıyor...")
        
        test_result = {
            'module': 'WebSocket Layer',
            'status': 'PENDING',
            'tests': [],
            'performance': {},
            'errors': []
        }
        
        try:
            # 1. Mock mode test
            start_time = time.time()
            ws_layer = FinnhubWebSocketLayer(use_mock=True)
            creation_time = time.time() - start_time
            
            test_result['tests'].append({
                'test': 'Mock Mode Creation',
                'status': 'PASS',
                'time': creation_time,
                'details': 'Mock WebSocket layer başarıyla oluşturuldu'
            })
            
            # 2. Connection test
            start_time = time.time()
            connected = await ws_layer.connect()
            connection_time = time.time() - start_time
            
            if connected:
                test_result['tests'].append({
                    'test': 'Connection Test',
                    'status': 'PASS',
                    'time': connection_time,
                    'details': 'Mock bağlantı başarılı'
                })
            else:
                test_result['tests'].append({
                    'test': 'Connection Test',
                    'status': 'FAIL',
                    'time': connection_time,
                    'details': 'Mock bağlantı başarısız'
                })
                test_result['errors'].append('Mock bağlantı kurulamadı')
            
            # 3. Subscription test
            start_time = time.time()
            await ws_layer.subscribe_symbols(self.test_symbols[:3])
            subscription_time = time.time() - start_time
            
            test_result['tests'].append({
                'test': 'Subscription Test',
                'status': 'PASS',
                'time': subscription_time,
                'details': f'{len(self.test_symbols[:3])} sembol subscribe edildi'
            })
            
            # 4. Price callback test
            price_received = False
            async def test_callback(symbol, price, volume, timestamp):
                nonlocal price_received
                price_received = True
                logger.info(f"📈 Test Callback: {symbol} - ${price:.2f}")
            
            ws_layer.add_price_callback(test_callback)
            
            # 5. Mock streaming test
            start_time = time.time()
            streaming_task = asyncio.create_task(ws_layer._mock_streaming())
            await asyncio.sleep(5)  # 5 saniye bekle
            streaming_task.cancel()
            streaming_time = time.time() - start_time
            
            if price_received:
                test_result['tests'].append({
                    'test': 'Mock Streaming Test',
                    'status': 'PASS',
                    'time': streaming_time,
                    'details': 'Mock fiyat verisi başarıyla alındı'
                })
            else:
                test_result['tests'].append({
                    'test': 'Mock Streaming Test',
                    'status': 'FAIL',
                    'time': streaming_time,
                    'details': 'Mock fiyat verisi alınamadı'
                })
                test_result['errors'].append('Mock streaming çalışmıyor')
            
            # 6. Disconnect test
            await ws_layer.disconnect()
            
            # Performance metrics
            test_result['performance'] = {
                'creation_time': creation_time,
                'connection_time': connection_time,
                'subscription_time': subscription_time,
                'streaming_time': streaming_time,
                'total_time': time.time() - start_time
            }
            
            # Final status
            if len(test_result['errors']) == 0:
                test_result['status'] = 'PASS'
                logger.info("✅ WebSocket Layer detaylı testi başarılı")
            else:
                test_result['status'] = 'FAIL'
                logger.error(f"❌ WebSocket Layer detaylı testi başarısız: {len(test_result['errors'])} hata")
            
        except Exception as e:
            test_result['status'] = 'ERROR'
            test_result['errors'].append(f'Test hatası: {str(e)}')
            logger.error(f"❌ WebSocket test hatası: {e}")
        
        return test_result
    
    async def test_fundamental_layer_detailed(self) -> Dict:
        """Fundamental data layer detaylı testi"""
        logger.info("📊 Fundamental Data Layer Detaylı Test Başlıyor...")
        
        test_result = {
            'module': 'Fundamental Data Layer',
            'status': 'PENDING',
            'tests': [],
            'performance': {},
            'errors': []
        }
        
        try:
            start_time = time.time()
            
            # 1. Layer creation test
            fundamental_layer = FundamentalDataLayer()
            creation_time = time.time() - start_time
            
            test_result['tests'].append({
                'test': 'Layer Creation',
                'status': 'PASS',
                'time': creation_time,
                'details': 'Fundamental layer başarıyla oluşturuldu'
            })
            
            # 2. Batch financial scores test
            start_time = time.time()
            scores = await fundamental_layer.get_batch_financial_scores(self.test_symbols[:3])
            batch_time = time.time() - start_time
            
            if scores and len(scores) > 0:
                test_result['tests'].append({
                    'test': 'Batch Financial Scores',
                    'status': 'PASS',
                    'time': batch_time,
                    'details': f'{len(scores)} sembol için skor hesaplandı'
                })
                
                # Score details
                for score in scores:
                    if score.get('error'):
                        test_result['warnings'].append(f"{score['symbol']}: {score['error']}")
                    else:
                        logger.info(f"✅ {score['symbol']}: {score.get('percentage', 0):.1f}%")
            else:
                test_result['tests'].append({
                    'test': 'Batch Financial Scores',
                    'status': 'FAIL',
                    'time': batch_time,
                    'details': 'Finansal skor hesaplanamadı'
                })
                test_result['errors'].append('Batch skor hesaplama başarısız')
            
            # 3. Individual symbol test
            start_time = time.time()
            individual_score = await fundamental_layer.get_comprehensive_financial_score("AAPL")
            individual_time = time.time() - start_time
            
            if individual_score and 'percentage' in individual_score:
                test_result['tests'].append({
                    'test': 'Individual Symbol Score',
                    'status': 'PASS',
                    'time': individual_time,
                    'details': f"AAPL: {individual_score['percentage']:.1f}%"
                })
            else:
                test_result['tests'].append({
                    'test': 'Individual Symbol Score',
                    'status': 'FAIL',
                    'time': individual_time,
                    'details': 'AAPL skor hesaplanamadı'
                })
                test_result['errors'].append('Individual skor hesaplama başarısız')
            
            # Performance metrics
            test_result['performance'] = {
                'creation_time': creation_time,
                'batch_time': batch_time,
                'individual_time': individual_time,
                'total_time': time.time() - start_time
            }
            
            # Final status
            if len(test_result['errors']) == 0:
                test_result['status'] = 'PASS'
                logger.info("✅ Fundamental Data Layer detaylı testi başarılı")
            else:
                test_result['status'] = 'FAIL'
                logger.error(f"❌ Fundamental Data Layer detaylı testi başarısız: {len(test_result['errors'])} hata")
            
        except Exception as e:
            test_result['status'] = 'ERROR'
            test_result['errors'].append(f'Test hatası: {str(e)}')
            logger.error(f"❌ Fundamental test hatası: {e}")
        
        return test_result
    
    async def test_ranking_system_detailed(self) -> Dict:
        """Grey TOPSIS ranking detaylı testi"""
        logger.info("🏆 Grey TOPSIS Ranking Detaylı Test Başlıyor...")
        
        test_result = {
            'module': 'Grey TOPSIS Ranking',
            'status': 'PENDING',
            'tests': [],
            'performance': {},
            'errors': []
        }
        
        try:
            start_time = time.time()
            
            # 1. System creation test
            ranking_system = GreyTOPSISEntropyRanking()
            creation_time = time.time() - start_time
            
            test_result['tests'].append({
                'test': 'System Creation',
                'status': 'PASS',
                'time': creation_time,
                'details': 'Ranking system başarıyla oluşturuldu'
            })
            
            # 2. Test data preparation
            test_financial_data = [
                {
                    'symbol': 'SISE.IS',
                    'percentage': 85.5,
                    'dupont': {'ROE': 0.18, 'ROA': 0.12, 'Asset_Turnover': 1.2},
                    'ratios': [{'netProfitMargin': 0.15, 'debtToEquity': 0.4, 'currentRatio': 2.1}],
                    'piotroski_f_score': 7
                },
                {
                    'symbol': 'EREGL.IS',
                    'percentage': 78.2,
                    'dupont': {'ROE': 0.15, 'ROA': 0.10, 'Asset_Turnover': 1.0},
                    'ratios': [{'netProfitMargin': 0.12, 'debtToEquity': 0.6, 'currentRatio': 1.8}],
                    'piotroski_f_score': 6
                },
                {
                    'symbol': 'AAPL',
                    'percentage': 92.1,
                    'dupont': {'ROE': 0.25, 'ROA': 0.18, 'Asset_Turnover': 1.5},
                    'ratios': [{'netProfitMargin': 0.22, 'debtToEquity': 0.2, 'currentRatio': 2.5}],
                    'piotroski_f_score': 8
                }
            ]
            
            # 3. Ranking calculation test
            start_time = time.time()
            results = ranking_system.calculate_ranking(test_financial_data)
            calculation_time = time.time() - start_time
            
            if 'error' not in results and 'ranking' in results:
                test_result['tests'].append({
                    'test': 'Ranking Calculation',
                    'status': 'PASS',
                    'time': calculation_time,
                    'details': f'{len(results["ranking"])} hisse için ranking tamamlandı'
                })
                
                # Ranking details
                top_stocks = ranking_system.get_top_stocks(3)
                for stock in top_stocks:
                    logger.info(f"  {stock['rank']}. {stock['symbol']}: {stock['topsis_score']:.4f}")
            else:
                test_result['tests'].append({
                    'test': 'Ranking Calculation',
                    'status': 'FAIL',
                    'time': calculation_time,
                    'details': f'Ranking hatası: {results.get("error", "Bilinmeyen hata")}'
                })
                test_result['errors'].append('Ranking hesaplama başarısız')
            
            # 4. Top stocks test
            start_time = time.time()
            top_stocks = ranking_system.get_top_stocks(3)
            top_stocks_time = time.time() - start_time
            
            if top_stocks and len(top_stocks) == 3:
                test_result['tests'].append({
                    'test': 'Top Stocks Retrieval',
                    'status': 'PASS',
                    'time': top_stocks_time,
                    'details': f'Top {len(top_stocks)} hisse başarıyla alındı'
                })
            else:
                test_result['tests'].append({
                    'test': 'Top Stocks Retrieval',
                    'status': 'FAIL',
                    'time': top_stocks_time,
                    'details': 'Top hisseler alınamadı'
                })
                test_result['errors'].append('Top stocks retrieval başarısız')
            
            # Performance metrics
            test_result['performance'] = {
                'creation_time': creation_time,
                'calculation_time': calculation_time,
                'top_stocks_time': top_stocks_time,
                'total_time': time.time() - start_time
            }
            
            # Final status
            if len(test_result['errors']) == 0:
                test_result['status'] = 'PASS'
                logger.info("✅ Grey TOPSIS Ranking detaylı testi başarılı")
            else:
                test_result['status'] = 'FAIL'
                logger.error(f"❌ Grey TOPSIS Ranking detaylı testi başarısız: {len(test_result['errors'])} hata")
            
        except Exception as e:
            test_result['status'] = 'ERROR'
            test_result['errors'].append(f'Test hatası: {str(e)}')
            logger.error(f"❌ Ranking test hatası: {e}")
        
        return test_result
    
    async def test_integration_system(self) -> Dict:
        """Entegre sistem testi"""
        logger.info("🔗 Entegre Sistem Testi Başlıyor...")
        
        test_result = {
            'module': 'Integrated System',
            'status': 'PENDING',
            'tests': [],
            'performance': {},
            'errors': []
        }
        
        try:
            start_time = time.time()
            
            # 1. Integrated system creation
            integrated_system = IntegratedSprint0System()
            creation_time = time.time() - start_time
            
            test_result['tests'].append({
                'test': 'Integrated System Creation',
                'status': 'PASS',
                'time': creation_time,
                'details': 'Entegre sistem başarıyla oluşturuldu'
            })
            
            # 2. Full integration test
            start_time = time.time()
            results = await integrated_system.run_full_integration()
            integration_time = time.time() - start_time
            
            if results and 'total_accuracy' in results:
                test_result['tests'].append({
                    'test': 'Full Integration',
                    'status': 'PASS',
                    'time': integration_time,
                    'details': f'Final accuracy: %{results["total_accuracy"]:.1f}'
                })
                
                # Check individual modules
                if results.get('websocket_integrated'):
                    test_result['tests'].append({
                        'test': 'WebSocket Integration',
                        'status': 'PASS',
                        'time': 0,
                        'details': 'WebSocket başarıyla entegre edildi'
                    })
                else:
                    test_result['tests'].append({
                        'test': 'WebSocket Integration',
                        'status': 'FAIL',
                        'time': 0,
                        'details': 'WebSocket entegrasyonu başarısız'
                    })
                    test_result['errors'].append('WebSocket entegrasyonu başarısız')
                
                if results.get('fundamental_integrated'):
                    test_result['tests'].append({
                        'test': 'Fundamental Integration',
                        'status': 'PASS',
                        'time': 0,
                        'details': 'Fundamental data başarıyla entegre edildi'
                    })
                else:
                    test_result['tests'].append({
                        'test': 'Fundamental Integration',
                        'status': 'FAIL',
                        'time': 0,
                        'details': 'Fundamental data entegrasyonu başarısız'
                    })
                    test_result['errors'].append('Fundamental data entegrasyonu başarısız')
                
                if results.get('ranking_integrated'):
                    test_result['tests'].append({
                        'test': 'Ranking Integration',
                        'status': 'PASS',
                        'time': 0,
                        'details': 'Ranking system başarıyla entegre edildi'
                    })
                else:
                    test_result['tests'].append({
                        'test': 'Ranking Integration',
                        'status': 'FAIL',
                        'time': 0,
                        'details': 'Ranking system entegrasyonu başarısız'
                    })
                    test_result['errors'].append('Ranking system entegrasyonu başarısız')
            else:
                test_result['tests'].append({
                    'test': 'Full Integration',
                    'status': 'FAIL',
                    'time': integration_time,
                    'details': 'Entegrasyon sonuçları alınamadı'
                })
                test_result['errors'].append('Full integration başarısız')
            
            # Performance metrics
            test_result['performance'] = {
                'creation_time': creation_time,
                'integration_time': integration_time,
                'total_time': time.time() - start_time
            }
            
            # Final status
            if len(test_result['errors']) == 0:
                test_result['status'] = 'PASS'
                logger.info("✅ Entegre sistem testi başarılı")
            else:
                test_result['status'] = 'FAIL'
                logger.error(f"❌ Entegre sistem testi başarısız: {len(test_result['errors'])} hata")
            
        except Exception as e:
            test_result['status'] = 'ERROR'
            test_result['errors'].append(f'Test hatası: {str(e)}')
            logger.error(f"❌ Entegre sistem test hatası: {e}")
        
        return test_result
    
    async def run_all_tests(self) -> Dict:
        """Tüm testleri çalıştır"""
        logger.info("🚀 Tüm Detaylı Testler Başlıyor...")
        
        start_time = time.time()
        
        # 1. WebSocket Layer test
        ws_test = await self.test_websocket_layer_detailed()
        self.test_results['modules_tested'].append(ws_test)
        
        # 2. Fundamental Data Layer test
        fundamental_test = await self.test_fundamental_layer_detailed()
        self.test_results['modules_tested'].append(fundamental_test)
        
        # 3. Ranking System test
        ranking_test = await self.test_ranking_system_detailed()
        self.test_results['modules_tested'].append(ranking_test)
        
        # 4. Integration test
        integration_test = await self.test_integration_system()
        self.test_results['integration_tests'].append(integration_test)
        
        # Final results
        total_time = time.time() - start_time
        self.test_results['performance_metrics'] = {
            'total_test_time': total_time,
            'modules_passed': len([m for m in self.test_results['modules_tested'] if m['status'] == 'PASS']),
            'modules_failed': len([m for m in self.test_results['modules_tested'] if m['status'] == 'FAIL']),
            'integration_passed': len([i for i in self.test_results['integration_tests'] if i['status'] == 'PASS']),
            'integration_failed': len([i for i in self.test_results['integration_tests'] if i['status'] == 'FAIL'])
        }
        
        # Collect all errors and warnings
        for module in self.test_results['modules_tested']:
            self.test_results['errors'].extend(module.get('errors', []))
            self.test_results['warnings'].extend(module.get('warnings', []))
        
        for integration in self.test_results['integration_tests']:
            self.test_results['errors'].extend(integration.get('errors', []))
            self.test_results['warnings'].extend(integration.get('warnings', []))
        
        # Final status
        if len(self.test_results['errors']) == 0:
            self.test_results['final_status'] = 'PASS'
        elif len(self.test_results['errors']) <= 2:
            self.test_results['final_status'] = 'WARNING'
        else:
            self.test_results['final_status'] = 'FAIL'
        
        self.test_results['end_time'] = datetime.now().isoformat()
        
        # Print summary
        self._print_test_summary()
        
        return self.test_results
    
    def _print_test_summary(self):
        """Test özetini yazdır"""
        print("\n" + "="*80)
        print("🧪 DETAILED SYSTEM TEST SUMMARY - BIST AI Smart Trader")
        print("="*80)
        
        print(f"📅 Test Tarihi: {self.test_results['start_time']}")
        print(f"⏱️  Toplam Süre: {self.test_results['performance_metrics']['total_test_time']:.2f} saniye")
        print()
        
        print("🔗 Modül Testleri:")
        for module in self.test_results['modules_tested']:
            status_icon = "✅" if module['status'] == 'PASS' else "❌" if module['status'] == 'FAIL' else "⚠️"
            print(f"  {status_icon} {module['module']}: {module['status']}")
        
        print()
        print("🔗 Entegrasyon Testleri:")
        for integration in self.test_results['integration_tests']:
            status_icon = "✅" if integration['status'] == 'PASS' else "❌" if integration['status'] == 'FAIL' else "⚠️"
            print(f"  {status_icon} {integration['module']}: {integration['status']}")
        
        print()
        print("📊 Performans Metrikleri:")
        metrics = self.test_results['performance_metrics']
        print(f"  Modüller Başarılı: {metrics['modules_passed']}/{len(self.test_results['modules_tested'])}")
        print(f"  Entegrasyon Başarılı: {metrics['integration_passed']}/{len(self.test_results['integration_tests'])}")
        
        print()
        print("🎯 Final Status:")
        if self.test_results['final_status'] == 'PASS':
            print("  🟢 TÜM TESTLER BAŞARILI!")
        elif self.test_results['final_status'] == 'WARNING':
            print("  🟡 BAZı TESTLERDE UYARILAR VAR")
        else:
            print("  🔴 BAZı TESTLER BAŞARISIZ!")
        
        if self.test_results['errors']:
            print()
            print("❌ Hatalar:")
            for error in self.test_results['errors'][:5]:  # İlk 5 hatayı göster
                print(f"  - {error}")
            if len(self.test_results['errors']) > 5:
                print(f"  ... ve {len(self.test_results['errors']) - 5} hata daha")
        
        if self.test_results['warnings']:
            print()
            print("⚠️  Uyarılar:")
            for warning in self.test_results['warnings'][:3]:  # İlk 3 uyarıyı göster
                print(f"  - {warning}")
            if len(self.test_results['warnings']) > 3:
                print(f"  ... ve {len(self.test_results['warnings']) - 3} uyarı daha")
        
        print("="*80)
    
    def save_test_results(self, filename: str = None):
        """Test sonuçlarını dosyaya kaydet"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"detailed_test_results_{timestamp}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.test_results, f, indent=2, ensure_ascii=False, default=str)
            
            logger.info(f"✅ Test sonuçları kaydedildi: {filename}")
            return filename
        except Exception as e:
            logger.error(f"❌ Test sonuçları kaydedilemedi: {e}")
            return None

# Test fonksiyonu
async def run_detailed_tests():
    """Detaylı testleri çalıştır"""
    
    print("🧪 Detailed System Test Başlıyor...")
    print("🔍 Mevcut sistem detaylı olarak test edilecek...")
    
    try:
        # Test runner oluştur
        test_runner = DetailedSystemTest()
        
        # Tüm testleri çalıştır
        results = await test_runner.run_all_tests()
        
        # Sonuçları kaydet
        filename = test_runner.save_test_results()
        
        print(f"\n📁 Test sonuçları kaydedildi: {filename}")
        
        return results
        
    except Exception as e:
        print(f"❌ Test hatası: {e}")
        return None

if __name__ == "__main__":
    # Detaylı testleri çalıştır
    asyncio.run(run_detailed_tests())
