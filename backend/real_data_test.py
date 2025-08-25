"""
BIST AI Smart Trader v2.0 - Gerçek Veri Testi
Son 1 yıllık BIST verileri ile %100 accuracy sistemini test eder
"""

import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Import our modules
try:
    from quantum_ai_optimizer import QuantumAIOptimizer
    QUANTUM_AVAILABLE = True
except ImportError:
    QUANTUM_AVAILABLE = False

try:
    from multidimensional_causal_ai import MultiDimensionalCausalAI
    CAUSAL_AVAILABLE = True
except ImportError:
    CAUSAL_AVAILABLE = False

try:
    from final_100_accuracy_integrator import Final100AccuracyIntegrator
    INTEGRATOR_AVAILABLE = True
except ImportError:
    INTEGRATOR_AVAILABLE = False

class RealDataTester:
    def __init__(self):
        self.bist_symbols = [
            'SISE.IS', 'EREGL.IS', 'TUPRS.IS', 'AKBNK.IS', 'GARAN.IS',
            'THYAO.IS', 'ASELS.IS', 'KRDMD.IS', 'SAHOL.IS', 'BIMAS.IS'
        ]
        self.data = {}
        self.features = {}
        
        print("🚀 BIST AI Smart Trader - Gerçek Veri Testi Başlatıldı")
        print(f"📊 Test edilecek hisse sayısı: {len(self.bist_symbols)}")
    
    def fetch_bist_data(self, period="1y", interval="1d"):
        """BIST verilerini çek"""
        print(f"📥 BIST verileri çekiliyor... (Period: {period}, Interval: {interval})")
        
        start_date = datetime.now() - timedelta(days=365)
        end_date = datetime.now()
        
        for symbol in self.bist_symbols:
            try:
                print(f"  📈 {symbol} verisi çekiliyor...")
                ticker = yf.Ticker(symbol)
                
                # Historical data
                hist_data = ticker.history(
                    start=start_date,
                    end=end_date,
                    interval=interval
                )
                
                if len(hist_data) > 50:  # Minimum veri kontrolü
                    self.data[symbol] = hist_data
                    print(f"    ✅ {symbol}: {len(hist_data)} günlük veri")
                else:
                    print(f"    ⚠️ {symbol}: Yetersiz veri ({len(hist_data)} gün)")
                    
            except Exception as e:
                print(f"    ❌ {symbol} hatası: {str(e)}")
        
        print(f"📊 Toplam {len(self.data)} hisse için veri çekildi")
        return self.data
    
    def create_technical_features(self, data):
        """Teknik indikatörler oluştur"""
        print("🔧 Teknik indikatörler oluşturuluyor...")
        
        for symbol, hist_data in data.items():
            try:
                df = hist_data.copy()
                
                # Basic price features
                df['returns'] = df['Close'].pct_change()
                df['log_returns'] = np.log(df['Close'] / df['Close'].shift(1))
                df['price_change'] = df['Close'] - df['Close'].shift(1)
                
                # Moving averages
                df['sma_5'] = df['Close'].rolling(window=5).mean()
                df['sma_20'] = df['Close'].rolling(window=20).mean()
                df['ema_12'] = df['Close'].ewm(span=12).mean()
                df['ema_26'] = df['Close'].ewm(span=26).mean()
                
                # Volatility
                df['volatility_5'] = df['returns'].rolling(window=5).std()
                df['volatility_20'] = df['returns'].rolling(window=20).std()
                
                # Volume features
                df['volume_sma_5'] = df['Volume'].rolling(window=5).mean()
                df['volume_ratio'] = df['Volume'] / df['volume_sma_5']
                
                # Price ratios
                df['price_sma_ratio'] = df['Close'] / df['sma_20']
                df['ema_cross'] = (df['ema_12'] > df['ema_26']).astype(int)
                
                # Momentum
                df['momentum_5'] = df['Close'] / df['Close'].shift(5) - 1
                df['momentum_20'] = df['Close'] / df['Close'].shift(20) - 1
                
                # RSI (simplified)
                delta = df['Close'].diff()
                gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
                loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
                rs = gain / loss
                df['rsi'] = 100 - (100 / (1 + rs))
                
                # MACD (simplified)
                df['macd'] = df['ema_12'] - df['ema_26']
                df['macd_signal'] = df['macd'].ewm(span=9).mean()
                df['macd_histogram'] = df['macd'] - df['macd_signal']
                
                # Bollinger Bands
                df['bb_middle'] = df['sma_20']
                df['bb_upper'] = df['bb_middle'] + (df['volatility_20'] * 2)
                df['bb_lower'] = df['bb_middle'] - (df['volatility_20'] * 2)
                df['bb_position'] = (df['Close'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
                
                # Target: gelecek 5 günlük getiri
                df['target_5d'] = df['Close'].shift(-5) / df['Close'] - 1
                
                # NaN değerleri temizle
                df = df.dropna()
                
                if len(df) > 100:  # Minimum veri kontrolü
                    self.features[symbol] = df
                    print(f"    ✅ {symbol}: {len(df)} günlük feature")
                else:
                    print(f"    ⚠️ {symbol}: Yetersiz feature verisi ({len(df)} gün)")
                    
            except Exception as e:
                print(f"    ❌ {symbol} feature hatası: {str(e)}")
        
        print(f"🔧 Toplam {len(self.features)} hisse için feature oluşturuldu")
        return self.features
    
    def test_individual_stock(self, symbol, max_days=30):
        """Tek hisse için test"""
        print(f"\n🧪 {symbol} Test Ediliyor...")
        
        if symbol not in self.features:
            print(f"❌ {symbol} için feature bulunamadı")
            return None
        
        df = self.features[symbol]
        
        # Son max_days günü test et
        test_data = df.tail(max_days)
        
        if len(test_data) < 20:
            print(f"⚠️ {symbol} için yeterli test verisi yok")
            return None
        
        # Feature ve target ayır
        feature_cols = [col for col in test_data.columns if col not in 
                       ['target_5d', 'Open', 'High', 'Low', 'Close', 'Volume']]
        
        X = test_data[feature_cols].values
        y = test_data['target_5d'].values
        
        # NaN değerleri temizle
        mask = ~(np.isnan(X).any(axis=1) | np.isnan(y))
        X_clean = X[mask]
        y_clean = y[mask]
        
        if len(X_clean) < 10:
            print(f"⚠️ {symbol} için yeterli temiz veri yok")
            return None
        
        print(f"  📊 Test verisi: X={X_clean.shape}, y={y_clean.shape}")
        
        # Final Integrator test
        if INTEGRATOR_AVAILABLE:
            try:
                print(f"  🎯 Final Integrator test ediliyor...")
                integrator = Final100AccuracyIntegrator()
                results = integrator.final_accuracy_optimization(
                    pd.DataFrame(X_clean, columns=feature_cols), 
                    pd.Series(y_clean), 
                    max_iterations=1
                )
                
                if results:
                    print(f"    ✅ Final Accuracy: {results['final_accuracy']*100:.1f}%")
                    return results
                else:
                    print(f"    ❌ Final Integrator test başarısız")
                    
            except Exception as e:
                print(f"    ❌ Final Integrator hatası: {str(e)}")
        
        return None
    
    def run_comprehensive_test(self):
        """Kapsamlı test çalıştır"""
        print("\n🚀 Kapsamlı Gerçek Veri Testi Başlıyor...")
        
        # 1. Veri çek
        self.fetch_bist_data()
        
        # 2. Feature oluştur
        self.create_technical_features(self.data)
        
        # 3. Her hisse için test
        test_results = {}
        successful_tests = 0
        
        for symbol in self.bist_symbols:
            if symbol in self.features:
                result = self.test_individual_stock(symbol, max_days=60)
                test_results[symbol] = result
                
                if result:
                    successful_tests += 1
        
        # 4. Sonuçları özetle
        print(f"\n📊 Test Sonuçları:")
        print(f"  Toplam Hisse: {len(self.bist_symbols)}")
        print(f"  Başarılı Test: {successful_tests}")
        print(f"  Başarısız Test: {len(self.bist_symbols) - successful_tests}")
        print(f"  Başarı Oranı: {successful_tests/len(self.bist_symbols)*100:.1f}%")
        
        # 5. Detaylı sonuçlar
        print(f"\n📋 Detaylı Sonuçlar:")
        for symbol, result in test_results.items():
            if result:
                print(f"  ✅ {symbol}: {result['final_accuracy']*100:.1f}% accuracy")
            else:
                print(f"  ❌ {symbol}: Test başarısız")
        
        return test_results
    
    def get_performance_summary(self):
        """Performans özeti"""
        if not self.features:
            return "Henüz test çalıştırılmadı"
        
        summary = {
            'total_stocks': len(self.bist_symbols),
            'data_available': len(self.data),
            'features_available': len(self.features),
            'avg_data_length': np.mean([len(df) for df in self.features.values()]) if self.features else 0,
            'feature_columns': len(list(self.features.values())[0].columns) if self.features else 0
        }
        
        return summary

def main():
    """Ana test fonksiyonu"""
    print("🧪 BIST AI Smart Trader v2.0 - Gerçek Veri Testi")
    print("=" * 60)
    
    # Module availability check
    print("📋 Module Availability:")
    print(f"  Quantum AI: {'✅' if QUANTUM_AVAILABLE else '❌'}")
    print(f"  Causal AI: {'✅' if CAUSAL_AVAILABLE else '❌'}")
    print(f"  Final Integrator: {'✅' if INTEGRATOR_AVAILABLE else '❌'}")
    print()
    
    # Real data tester başlat
    tester = RealDataTester()
    
    # Kapsamlı test çalıştır
    results = tester.run_comprehensive_test()
    
    # Performans özeti
    summary = tester.get_performance_summary()
    print(f"\n📊 Performans Özeti:")
    for key, value in summary.items():
        if isinstance(value, float):
            print(f"  {key}: {value:.1f}")
        else:
            print(f"  {key}: {value}")
    
    print("\n🚀 Gerçek veri testi tamamlandı!")

if __name__ == "__main__":
    main()
