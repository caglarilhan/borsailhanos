import asyncio
import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List
import pandas as pd
import numpy as np

from trading_robot_core import TradingRobot, TradingMode

# Logging ayarları
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TradingRobotTest:
    """
    3 Modlu Trading Robot Test Sistemi
    Paper Trading Simülasyonu
    """
    
    def __init__(self):
        self.test_symbols = [
            "SISE.IS", "EREGL.IS", "TUPRS.IS", "KCHOL.IS", "GARAN.IS",
            "AKBNK.IS", "THYAO.IS", "ASELS.IS", "BIMAS.IS", "SAHOL.IS"
        ]
        self.test_duration_days = 30
        self.test_cycles_per_day = 8  # 3 saatte bir
        
        # Test sonuçları
        self.test_results = {
            'aggressive': {},
            'normal': {},
            'safe': {}
        }
        
        logger.info("🧪 Trading Robot Test Sistemi başlatıldı")
    
    async def run_single_mode_test(self, mode: TradingMode, initial_capital: float = 100000) -> Dict:
        """Tek mod testi çalıştır"""
        try:
            logger.info(f"🚀 {mode.value.upper()} mod testi başlıyor...")
            
            # Robot oluştur
            robot = TradingRobot(mode, initial_capital)
            
            # Test süresi boyunca trading döngüleri
            total_cycles = self.test_duration_days * self.test_cycles_per_day
            cycle_results = []
            
            for cycle in range(total_cycles):
                logger.info(f"🔄 Döngü {cycle + 1}/{total_cycles} - {mode.value}")
                
                # Trading döngüsü çalıştır
                result = await robot.run_trading_cycle(self.test_symbols)
                cycle_results.append(result)
                
                # Her 8 döngüde bir durum raporu
                if (cycle + 1) % 8 == 0:
                    status = robot.get_status()
                    logger.info(f"📊 Durum Raporu ({mode.value}):")
                    logger.info(f"   Sermaye: {status['current_capital']:,.2f} ₺")
                    logger.info(f"   Toplam Getiri: {status['total_return']:.2f}%")
                    logger.info(f"   Açık Pozisyonlar: {status['open_positions']}")
                    logger.info(f"   Toplam İşlem: {status['performance_metrics']['total_trades']}")
                
                # Simülasyon için bekleme (gerçekte olmayacak)
                await asyncio.sleep(0.1)
            
            # Final durum
            final_status = robot.get_status()
            
            # Sonuçları kaydet
            robot.save_results(f"test_results_{mode.value}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            
            # Test sonucu
            test_result = {
                'mode': mode.value,
                'initial_capital': initial_capital,
                'final_capital': final_status['current_capital'],
                'total_return': final_status['total_return'],
                'total_trades': final_status['performance_metrics']['total_trades'],
                'winning_trades': final_status['performance_metrics']['winning_trades'],
                'losing_trades': final_status['performance_metrics']['losing_trades'],
                'win_rate': final_status['performance_metrics'].get('win_rate', 0),
                'total_profit': final_status['performance_metrics']['total_profit'],
                'max_drawdown': final_status['performance_metrics']['max_drawdown'],
                'avg_profit_per_trade': final_status['performance_metrics'].get('avg_profit_per_trade', 0),
                'open_positions': final_status['open_positions'],
                'cycle_results': cycle_results
            }
            
            logger.info(f"✅ {mode.value.upper()} mod testi tamamlandı!")
            logger.info(f"   Toplam Getiri: {test_result['total_return']:.2f}%")
            logger.info(f"   Toplam İşlem: {test_result['total_trades']}")
            logger.info(f"   Kazanma Oranı: {test_result['win_rate']:.2%}")
            logger.info(f"   Maksimum Drawdown: {test_result['max_drawdown']:.2%}")
            
            return test_result
            
        except Exception as e:
            logger.error(f"❌ {mode.value} mod testi hatası: {e}")
            return {
                'mode': mode.value,
                'error': str(e),
                'initial_capital': initial_capital,
                'final_capital': initial_capital,
                'total_return': 0.0,
                'total_trades': 0,
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate': 0.0,
                'total_profit': 0.0,
                'max_drawdown': 0.0,
                'avg_profit_per_trade': 0.0,
                'open_positions': 0
            }
    
    async def run_all_modes_test(self) -> Dict:
        """Tüm modları test et"""
        try:
            logger.info("🎯 Tüm modların testi başlıyor...")
            
            # Her mod için test çalıştır
            modes = [TradingMode.AGGRESSIVE, TradingMode.NORMAL, TradingMode.SAFE]
            results = {}
            
            for mode in modes:
                result = await self.run_single_mode_test(mode)
                results[mode.value] = result
                
                # Modlar arası kısa bekleme
                await asyncio.sleep(1)
            
            # Karşılaştırmalı analiz
            comparison = self._compare_modes(results)
            
            # Final rapor
            final_report = {
                'test_date': datetime.now().isoformat(),
                'test_duration_days': self.test_duration_days,
                'test_cycles_per_day': self.test_cycles_per_day,
                'total_cycles': self.test_duration_days * self.test_cycles_per_day,
                'test_symbols': self.test_symbols,
                'results': results,
                'comparison': comparison
            }
            
            # Raporu kaydet
            self._save_test_report(final_report)
            
            return final_report
            
        except Exception as e:
            logger.error(f"❌ Tüm modlar testi hatası: {e}")
            return {'error': str(e)}
    
    def _compare_modes(self, results: Dict) -> Dict:
        """Modları karşılaştır"""
        try:
            comparison = {
                'best_performer': None,
                'safest_mode': None,
                'most_active': None,
                'summary_table': {}
            }
            
            best_return = -float('inf')
            lowest_drawdown = float('inf')
            most_trades = 0
            
            for mode, result in results.items():
                if 'error' in result:
                    continue
                
                # En iyi performans
                if result['total_return'] > best_return:
                    best_return = result['total_return']
                    comparison['best_performer'] = mode
                
                # En güvenli mod
                if result['max_drawdown'] < lowest_drawdown:
                    lowest_drawdown = result['max_drawdown']
                    comparison['safest_mode'] = mode
                
                # En aktif mod
                if result['total_trades'] > most_trades:
                    most_trades = result['total_trades']
                    comparison['most_active'] = mode
                
                # Özet tablo
                comparison['summary_table'][mode] = {
                    'total_return': f"{result['total_return']:.2f}%",
                    'total_trades': result['total_trades'],
                    'win_rate': f"{result['win_rate']:.2%}",
                    'max_drawdown': f"{result['max_drawdown']:.2%}",
                    'avg_profit_per_trade': f"{result['avg_profit_per_trade']:,.2f} ₺"
                }
            
            return comparison
            
        except Exception as e:
            logger.error(f"❌ Mod karşılaştırma hatası: {e}")
            return {'error': str(e)}
    
    def _save_test_report(self, report: Dict):
        """Test raporunu kaydet"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"trading_robot_comparison_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            
            logger.info(f"💾 Test raporu kaydedildi: {filename}")
            
            # Özet rapor yazdır
            self._print_summary_report(report)
            
        except Exception as e:
            logger.error(f"❌ Rapor kaydetme hatası: {e}")
    
    def _print_summary_report(self, report: Dict):
        """Özet raporu yazdır"""
        try:
            print("\n" + "="*80)
            print("🤖 TRADING ROBOT TEST RAPORU")
            print("="*80)
            print(f"📅 Test Tarihi: {report['test_date']}")
            print(f"⏱️ Test Süresi: {report['test_duration_days']} gün")
            print(f"🔄 Toplam Döngü: {report['total_cycles']}")
            print(f"📊 Test Sembolleri: {len(report['test_symbols'])} adet")
            print()
            
            # Mod karşılaştırması
            comparison = report['comparison']
            summary_table = comparison['summary_table']
            
            print("📈 MOD KARŞILAŞTIRMASI:")
            print("-" * 80)
            print(f"{'Mod':<12} {'Getiri':<10} {'İşlem':<8} {'Kazanma':<10} {'Drawdown':<10} {'Ort. Kar':<12}")
            print("-" * 80)
            
            for mode, data in summary_table.items():
                print(f"{mode:<12} {data['total_return']:<10} {data['total_trades']:<8} {data['win_rate']:<10} {data['max_drawdown']:<10} {data['avg_profit_per_trade']:<12}")
            
            print("-" * 80)
            print()
            
            # En iyi performans
            if comparison['best_performer']:
                print(f"🏆 En İyi Performans: {comparison['best_performer'].upper()}")
            if comparison['safest_mode']:
                print(f"🛡️ En Güvenli Mod: {comparison['safest_mode'].upper()}")
            if comparison['most_active']:
                print(f"⚡ En Aktif Mod: {comparison['most_active'].upper()}")
            
            print("\n" + "="*80)
            
        except Exception as e:
            logger.error(f"❌ Özet rapor yazdırma hatası: {e}")

async def main():
    """Ana test fonksiyonu"""
    try:
        logger.info("🚀 Trading Robot Test Sistemi başlatılıyor...")
        
        # Test sistemi oluştur
        test_system = TradingRobotTest()
        
        # Tüm modları test et
        results = await test_system.run_all_modes_test()
        
        if 'error' not in results:
            logger.info("✅ Tüm testler başarıyla tamamlandı!")
            return results
        else:
            logger.error(f"❌ Test hatası: {results['error']}")
            return None
            
    except Exception as e:
        logger.error(f"❌ Ana test fonksiyonu hatası: {e}")
        return None

if __name__ == "__main__":
    # Test çalıştır
    asyncio.run(main())
