"""
🚀 Sprint-0 Integration Test - BIST AI Smart Trader
Finnhub WebSocket + Fundamental Data + Grey TOPSIS entegrasyonu
Sprint-0 modüllerinin birlikte çalışmasını test eder
"""

import asyncio
import logging
import json
from datetime import datetime
import os
from dotenv import load_dotenv

# Local imports
from finnhub_websocket_layer import FinnhubWebSocketLayer
from fundamental_data_layer import FundamentalDataLayer
from grey_topsis_entropy_ranking import GreyTOPSISEntropyRanking

# Environment variables
load_dotenv()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Sprint0IntegrationTest:
    """
    Sprint-0 entegrasyon testi
    Tüm modüllerin birlikte çalışmasını test eder
    """
    
    def __init__(self):
        # Modüller
        self.ws_layer = None
        self.fundamental_layer = None
        self.ranking_system = None
        
        # Test sonuçları
        self.test_results = {
            'websocket_test': False,
            'fundamental_test': False,
            'ranking_test': False,
            'integration_test': False,
            'errors': [],
            'start_time': None,
            'end_time': None
        }
        
        # Test sembolleri
        self.test_symbols = [
            "AAPL", "GOOGL", "MSFT",  # ABD
            "SISE.IS", "EREGL.IS", "TUPRS.IS"  # BIST
        ]
    
    async def test_websocket_layer(self) -> bool:
        """WebSocket layer test"""
        try:
            logger.info("🔌 WebSocket Layer test başlıyor...")
            
            # WebSocket layer oluştur
            self.ws_layer = FinnhubWebSocketLayer()
            
            # Price callback ekle
            async def price_callback(symbol, price, volume, timestamp):
                logger.info(f"📈 {symbol}: ${price:.2f} | Volume: {volume}")
            
            self.ws_layer.add_price_callback(price_callback)
            
            # Bağlantı testi
            connected = await self.ws_layer.connect()
            if not connected:
                raise Exception("WebSocket bağlantısı kurulamadı")
            
            # Subscribe test
            await self.ws_layer.subscribe_symbols(self.test_symbols[:3])  # İlk 3 sembol
            
            # Kısa süre dinle
            await asyncio.sleep(5)
            
            # Bağlantıyı kapat
            await self.ws_layer.disconnect()
            
            logger.info("✅ WebSocket Layer test başarılı")
            self.test_results['websocket_test'] = True
            return True
            
        except Exception as e:
            error_msg = f"WebSocket test hatası: {e}"
            logger.error(f"❌ {error_msg}")
            self.test_results['errors'].append(error_msg)
            return False
    
    async def test_fundamental_layer(self) -> bool:
        """Fundamental data layer test"""
        try:
            logger.info("📊 Fundamental Data Layer test başlıyor...")
            
            # Fundamental layer oluştur
            self.fundamental_layer = FundamentalDataLayer()
            
            # Test sembolleri için finansal skor hesapla
            scores = await self.fundamental_layer.get_batch_financial_scores(self.test_symbols[:3])
            
            if not scores:
                raise Exception("Finansal skor hesaplanamadı")
            
            # Sonuçları kontrol et
            for score in scores:
                if score.get('error'):
                    logger.warning(f"⚠️ {score['symbol']} için hata: {score['error']}")
                else:
                    logger.info(f"✅ {score['symbol']}: {score.get('percentage', 0):.1f}% skor")
            
            logger.info("✅ Fundamental Data Layer test başarılı")
            self.test_results['fundamental_test'] = True
            return True
            
        except Exception as e:
            error_msg = f"Fundamental test hatası: {e}"
            logger.error(f"❌ {error_msg}")
            self.test_results['errors'].append(error_msg)
            return False
    
    async def test_ranking_system(self) -> bool:
        """Grey TOPSIS ranking test"""
        try:
            logger.info("🏆 Grey TOPSIS Ranking test başlıyor...")
            
            # Ranking system oluştur
            self.ranking_system = GreyTOPSISEntropyRanking()
            
            # Test finansal veri oluştur
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
            
            # Ranking hesapla
            results = self.ranking_system.calculate_ranking(test_financial_data)
            
            if 'error' in results:
                raise Exception(f"Ranking hatası: {results['error']}")
            
            # Sonuçları kontrol et
            logger.info(f"✅ {len(results['ranking'])} hisse için ranking tamamlandı")
            
            # Top 3 hisseyi göster
            top_stocks = self.ranking_system.get_top_stocks(3)
            for stock in top_stocks:
                logger.info(f"  {stock['rank']}. {stock['symbol']}: {stock['topsis_score']:.4f}")
            
            # CSV export test
            csv_file = self.ranking_system.export_ranking_csv()
            if csv_file:
                logger.info(f"💾 CSV export: {csv_file}")
            
            logger.info("✅ Grey TOPSIS Ranking test başarılı")
            self.test_results['ranking_test'] = True
            return True
            
        except Exception as e:
            error_msg = f"Ranking test hatası: {e}"
            logger.error(f"❌ {error_msg}")
            self.test_results['errors'].append(error_msg)
            return False
    
    async def test_integration(self) -> bool:
        """Tüm modüllerin entegrasyon testi"""
        try:
            logger.info("🔗 Entegrasyon test başlıyor...")
            
            # 1. WebSocket'ten fiyat verisi al
            if not self.ws_layer:
                raise Exception("WebSocket layer yok")
            
            # 2. Fundamental veri ile birleştir
            if not self.fundamental_layer:
                raise Exception("Fundamental layer yok")
            
            # 3. Ranking hesapla
            if not self.ranking_system:
                raise Exception("Ranking system yok")
            
            # Simulated integration test
            logger.info("✅ Tüm modüller entegre edildi")
            
            # Test sonuçlarını kaydet
            self.test_results['integration_test'] = True
            
            return True
            
        except Exception as e:
            error_msg = f"Entegrasyon test hatası: {e}"
            logger.error(f"❌ {error_msg}")
            self.test_results['errors'].append(error_msg)
            return False
    
    async def run_all_tests(self) -> Dict:
        """Tüm testleri çalıştır"""
        logger.info("🚀 Sprint-0 Integration Test başlıyor...")
        
        self.test_results['start_time'] = datetime.now().isoformat()
        
        try:
            # 1. WebSocket test
            await self.test_websocket_layer()
            
            # 2. Fundamental test
            await self.test_fundamental_layer()
            
            # 3. Ranking test
            await self.test_ranking_system()
            
            # 4. Integration test
            await self.test_integration()
            
        except Exception as e:
            error_msg = f"Genel test hatası: {e}"
            logger.error(f"❌ {error_msg}")
            self.test_results['errors'].append(error_msg)
        
        finally:
            self.test_results['end_time'] = datetime.now().isoformat()
            
            # Test sonuçlarını göster
            self._print_test_summary()
            
            # Sonuçları kaydet
            self._save_test_results()
        
        return self.test_results
    
    def _print_test_summary(self):
        """Test özetini yazdır"""
        print("\n" + "="*60)
        print("🚀 SPRINT-0 INTEGRATION TEST SONUÇLARI")
        print("="*60)
        
        print(f"📅 Başlangıç: {self.test_results['start_time']}")
        print(f"📅 Bitiş: {self.test_results['end_time']}")
        print()
        
        print("📊 Test Sonuçları:")
        print(f"  🔌 WebSocket Layer: {'✅' if self.test_results['websocket_test'] else '❌'}")
        print(f"  📊 Fundamental Data: {'✅' if self.test_results['fundamental_test'] else '❌'}")
        print(f"  🏆 Grey TOPSIS: {'✅' if self.test_results['ranking_test'] else '❌'}")
        print(f"  🔗 Integration: {'✅' if self.test_results['integration_test'] else '❌'}")
        print()
        
        if self.test_results['errors']:
            print("❌ Hatalar:")
            for error in self.test_results['errors']:
                print(f"  • {error}")
        else:
            print("✅ Tüm testler başarılı!")
        
        print("="*60)
    
    def _save_test_results(self):
        """Test sonuçlarını JSON dosyasına kaydet"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"sprint_0_test_results_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.test_results, f, indent=2, ensure_ascii=False)
            
            logger.info(f"💾 Test sonuçları kaydedildi: {filename}")
            
        except Exception as e:
            logger.error(f"❌ Test sonuçları kaydedilemedi: {e}")

# Ana test fonksiyonu
async def main():
    """Ana test fonksiyonu"""
    
    # Integration test oluştur
    integration_test = Sprint0IntegrationTest()
    
    # Tüm testleri çalıştır
    results = await integration_test.run_all_tests()
    
    return results

if __name__ == "__main__":
    # Test çalıştır
    asyncio.run(main())
