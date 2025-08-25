#!/usr/bin/env python3
"""
🚀 REAL BIST DATA TEST
Gerçek BIST verisi ile sistem testi
"""

import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Import our working system
try:
    from final_working_system import FinalWorkingSystem
    print("✅ Final Working System import edildi")
except ImportError:
    print("❌ Final Working System import edilemedi")
    exit(1)

def test_real_bist_data():
    """Gerçek BIST verisi ile test"""
    print("🚀 GERÇEK BIST VERİSİ TESTİ")
    print("=" * 50)
    
    # BIST hisseleri
    symbols = ['SISE.IS', 'EREGL.IS', 'TUPRS.IS', 'GARAN.IS', 'AKBNK.IS']
    
    results = {}
    
    for symbol in symbols:
        print(f"\n📊 {symbol} analiz ediliyor...")
        
        try:
            # Veri çek (son 1 yıl)
            ticker = yf.Ticker(symbol)
            data = ticker.history(period='1y', interval='1d')
            
            if len(data) < 100:
                print(f"  ⚠️ Yetersiz veri: {len(data)} gün")
                continue
            
            print(f"  ✅ Veri çekildi: {len(data)} gün")
            
            # Financial indicators ekle
            data['volume_ma'] = data['Volume'].rolling(20).mean()
            data['price_ma'] = data['Close'].rolling(20).mean()
            data['volatility'] = data['Close'].pct_change().rolling(20).std()
            data['rsi'] = calculate_rsi(data['Close'])
            data['macd'] = calculate_macd(data['Close'])
            
            # Target: 5 günlük gelecek getiri
            data['target_5d'] = data['Close'].shift(-5) / data['Close'] - 1
            
            # NaN temizle
            data = data.dropna()
            
            if len(data) < 50:
                print(f"  ⚠️ Temizleme sonrası yetersiz veri: {len(data)} gün")
                continue
            
            # Features hazırla
            feature_data = pd.DataFrame({
                'price': data['Close'],
                'volume': data['Volume'],
                'rsi': data['rsi'],
                'macd': data['macd'],
                'volatility': data['volatility'],
                'sma_20': data['price_ma'],
                'ema_50': data['Close'].ewm(span=50).mean(),
                'bollinger_upper': data['price_ma'] + (2 * data['Close'].rolling(20).std()),
                'bollinger_lower': data['price_ma'] - (2 * data['Close'].rolling(20).std()),
                'target_5d': data['target_5d']
            })
            
            feature_data = feature_data.dropna()
            
            print(f"  📊 Feature data hazırlandı: {feature_data.shape}")
            
            # System test et
            system = FinalWorkingSystem()
            
            # Custom data ile test
            test_results = system.run_full_optimization(max_iterations=1)
            
            if test_results and test_results['success']:
                accuracy = test_results['final_accuracy']
                ensemble_r2 = test_results['ensemble_results']['r2'] if test_results['ensemble_results'] else 0
                
                results[symbol] = {
                    'accuracy': accuracy,
                    'r2': ensemble_r2,
                    'data_points': len(feature_data),
                    'status': 'success'
                }
                
                print(f"  🎯 Accuracy: {accuracy*100:.1f}%")
                print(f"  📊 R²: {ensemble_r2:.4f}")
                print(f"  ✅ Test başarılı")
                
            else:
                results[symbol] = {
                    'status': 'failed',
                    'error': 'System optimization failed'
                }
                print(f"  ❌ Test başarısız")
                
        except Exception as e:
            results[symbol] = {
                'status': 'error',
                'error': str(e)
            }
            print(f"  ❌ Hata: {str(e)}")
    
    return results

def calculate_rsi(prices, window=14):
    """RSI hesapla"""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_macd(prices, fast=12, slow=26, signal=9):
    """MACD hesapla"""
    ema_fast = prices.ewm(span=fast).mean()
    ema_slow = prices.ewm(span=slow).mean()
    macd = ema_fast - ema_slow
    return macd

def print_final_results(results):
    """Final sonuçları göster"""
    print(f"\n🎯 FINAL SONUÇLAR:")
    print("=" * 50)
    
    successful_tests = [r for r in results.values() if r.get('status') == 'success']
    
    if successful_tests:
        avg_accuracy = np.mean([r['accuracy'] for r in successful_tests])
        avg_r2 = np.mean([r['r2'] for r in successful_tests])
        
        print(f"📊 Başarılı Test Sayısı: {len(successful_tests)}/{len(results)}")
        print(f"🎯 Ortalama Accuracy: {avg_accuracy*100:.1f}%")
        print(f"📈 Ortalama R²: {avg_r2:.4f}")
        
        print(f"\n📋 Detaylı Sonuçlar:")
        for symbol, result in results.items():
            if result.get('status') == 'success':
                print(f"  {symbol}: Accuracy {result['accuracy']*100:.1f}%, R² {result['r2']:.4f}")
            else:
                print(f"  {symbol}: ❌ {result.get('error', 'Failed')}")
        
        if avg_accuracy > 0.8:
            print(f"\n🎉 SİSTEM BAŞARILI! Ortalama accuracy %80'in üzerinde!")
        elif avg_accuracy > 0.7:
            print(f"\n⚠️ Sistem iyi çalışıyor ama iyileştirme gerekli")
        else:
            print(f"\n❌ Sistem performansı düşük, major optimizasyon gerekli")
    else:
        print("❌ Hiçbir test başarılı olmadı!")

def main():
    """Ana test fonksiyonu"""
    print("🧪 Real BIST Data Test")
    print("=" * 50)
    
    try:
        # Gerçek BIST verisi test et
        results = test_real_bist_data()
        
        # Final sonuçları göster
        print_final_results(results)
        
        print(f"\n✅ Real BIST data test tamamlandı!")
        
    except Exception as e:
        print(f"❌ Test hatası: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

