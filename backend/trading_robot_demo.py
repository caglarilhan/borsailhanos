import asyncio
import logging
import json
from datetime import datetime
from typing import Dict

from trading_robot_core import TradingRobot, TradingMode

# Logging ayarları
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TradingRobotDemo:
    """
    Trading Robot Hızlı Demo
    3 modun kısa testi
    """
    
    def __init__(self):
        self.test_symbols = ["SISE.IS", "EREGL.IS", "TUPRS.IS"]
        self.demo_cycles = 5  # Kısa demo için
        
        logger.info("🎮 Trading Robot Demo başlatıldı")
    
    async def run_single_mode_demo(self, mode: TradingMode, initial_capital: float = 50000) -> Dict:
        """Tek mod demo çalıştır"""
        try:
            logger.info(f"🚀 {mode.value.upper()} MOD DEMO")
            logger.info("=" * 50)
            
            # Robot oluştur
            robot = TradingRobot(mode, initial_capital)
            
            # Başlangıç durumu
            initial_status = robot.get_status()
            logger.info(f"💰 Başlangıç Sermayesi: {initial_status['current_capital']:,.2f} ₺")
            logger.info(f"📊 Risk Parametreleri:")
            logger.info(f"   Maksimum Pozisyon: %{initial_status['risk_params']['max_position_size']*100:.0f}")
            logger.info(f"   Stop-Loss: %{initial_status['risk_params']['stop_loss']*100:.0f}")
            logger.info(f"   Take-Profit: %{initial_status['risk_params']['take_profit']*100:.0f}")
            logger.info(f"   Maksimum Pozisyon Sayısı: {initial_status['risk_params']['max_positions']}")
            logger.info(f"   Minimum Güven: %{initial_status['risk_params']['min_confidence']*100:.0f}")
            logger.info()
            
            # Demo döngüleri
            for cycle in range(self.demo_cycles):
                logger.info(f"🔄 Demo Döngü {cycle + 1}/{self.demo_cycles}")
                
                # Trading döngüsü çalıştır
                result = await robot.run_trading_cycle(self.test_symbols)
                
                # İşlem sonuçlarını göster
                if result['actions_taken']:
                    logger.info(f"   📈 {len(result['actions_taken'])} işlem gerçekleşti:")
                    for action in result['actions_taken']:
                        if action['action'] == 'BUY':
                            logger.info(f"      🟢 BUY {action['symbol']} @ {action['price']:.2f} ₺")
                        elif action['action'] == 'SELL':
                            logger.info(f"      🔴 SELL {action['symbol']} @ {action['price']:.2f} ₺")
                else:
                    logger.info("   ⏸️ İşlem yapılmadı")
                
                # Hata varsa göster
                if result['errors']:
                    logger.warning(f"   ⚠️ {len(result['errors'])} hata:")
                    for error in result['errors']:
                        logger.warning(f"      {error}")
                
                logger.info()
            
            # Final durum
            final_status = robot.get_status()
            logger.info("📊 DEMO SONUÇLARI:")
            logger.info(f"   💰 Final Sermaye: {final_status['current_capital']:,.2f} ₺")
            logger.info(f"   📈 Toplam Getiri: {final_status['total_return']:.2f}%")
            logger.info(f"   📊 Toplam İşlem: {final_status['performance_metrics']['total_trades']}")
            logger.info(f"   ✅ Kazanan İşlem: {final_status['performance_metrics']['winning_trades']}")
            logger.info(f"   ❌ Kaybeden İşlem: {final_status['performance_metrics']['losing_trades']}")
            
            if final_status['performance_metrics']['total_trades'] > 0:
                win_rate = final_status['performance_metrics']['winning_trades'] / final_status['performance_metrics']['total_trades']
                logger.info(f"   🎯 Kazanma Oranı: {win_rate:.2%}")
            
            logger.info(f"   📉 Maksimum Drawdown: {final_status['performance_metrics']['max_drawdown']:.2%}")
            logger.info(f"   🔓 Açık Pozisyonlar: {final_status['open_positions']}")
            logger.info()
            
            return {
                'mode': mode.value,
                'initial_capital': initial_capital,
                'final_capital': final_status['current_capital'],
                'total_return': final_status['total_return'],
                'total_trades': final_status['performance_metrics']['total_trades'],
                'winning_trades': final_status['performance_metrics']['winning_trades'],
                'losing_trades': final_status['performance_metrics']['losing_trades'],
                'win_rate': final_status['performance_metrics'].get('win_rate', 0),
                'max_drawdown': final_status['performance_metrics']['max_drawdown'],
                'open_positions': final_status['open_positions']
            }
            
        except Exception as e:
            logger.error(f"❌ {mode.value} mod demo hatası: {e}")
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
                'max_drawdown': 0.0,
                'open_positions': 0
            }
    
    async def run_all_modes_demo(self) -> Dict:
        """Tüm modları demo et"""
        try:
            logger.info("🎯 3 MODLU TRADING ROBOT DEMO")
            logger.info("=" * 60)
            logger.info()
            
            # Her mod için demo çalıştır
            modes = [TradingMode.AGGRESSIVE, TradingMode.NORMAL, TradingMode.SAFE]
            results = {}
            
            for mode in modes:
                result = await self.run_single_mode_demo(mode)
                results[mode.value] = result
                
                logger.info("=" * 60)
                logger.info()
                
                # Modlar arası kısa bekleme
                await asyncio.sleep(0.5)
            
            # Karşılaştırmalı özet
            self._print_comparison_summary(results)
            
            # Sonuçları kaydet
            self._save_demo_results(results)
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Demo hatası: {e}")
            return {'error': str(e)}
    
    def _print_comparison_summary(self, results: Dict):
        """Karşılaştırmalı özet yazdır"""
        try:
            print("\n" + "🎯 DEMO KARŞILAŞTIRMA ÖZETİ")
            print("=" * 60)
            print(f"{'Mod':<12} {'Getiri':<10} {'İşlem':<8} {'Kazanma':<10} {'Drawdown':<10}")
            print("-" * 60)
            
            for mode, result in results.items():
                if 'error' in result:
                    print(f"{mode:<12} {'HATA':<10} {'-':<8} {'-':<10} {'-':<10}")
                else:
                    win_rate = result['winning_trades'] / max(result['total_trades'], 1)
                    print(f"{mode:<12} {result['total_return']:>8.2f}% {result['total_trades']:>6} {win_rate:>8.1%} {result['max_drawdown']:>8.1%}")
            
            print("-" * 60)
            
            # En iyi performans
            best_return = -float('inf')
            best_mode = None
            
            for mode, result in results.items():
                if 'error' not in result and result['total_return'] > best_return:
                    best_return = result['total_return']
                    best_mode = mode
            
            if best_mode:
                print(f"🏆 En İyi Performans: {best_mode.upper()} ({best_return:.2f}%)")
            
            print("=" * 60)
            
        except Exception as e:
            logger.error(f"❌ Özet yazdırma hatası: {e}")
    
    def _save_demo_results(self, results: Dict):
        """Demo sonuçlarını kaydet"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"trading_robot_demo_{timestamp}.json"
            
            demo_report = {
                'demo_date': datetime.now().isoformat(),
                'demo_cycles': self.demo_cycles,
                'test_symbols': self.test_symbols,
                'results': results
            }
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(demo_report, f, indent=2, ensure_ascii=False)
            
            logger.info(f"💾 Demo sonuçları kaydedildi: {filename}")
            
        except Exception as e:
            logger.error(f"❌ Demo kaydetme hatası: {e}")

async def main():
    """Ana demo fonksiyonu"""
    try:
        logger.info("🎮 Trading Robot Demo başlatılıyor...")
        
        # Demo sistemi oluştur
        demo = TradingRobotDemo()
        
        # Tüm modları demo et
        results = await demo.run_all_modes_demo()
        
        if 'error' not in results:
            logger.info("✅ Demo başarıyla tamamlandı!")
            return results
        else:
            logger.error(f"❌ Demo hatası: {results['error']}")
            return None
            
    except Exception as e:
        logger.error(f"❌ Ana demo fonksiyonu hatası: {e}")
        return None

if __name__ == "__main__":
    # Demo çalıştır
    asyncio.run(main())
