import pandas as pd
import numpy as np
import yfinance as yf
# TA-Lib yerine ta kütüphanesi kullan
import ta
from datetime import datetime, timedelta
import logging
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BISTSmartIndicator:
    """
    BIST 100 + BIST 30 için Eşsiz Sağlam İndikatör Sistemi
    - Çok kasmasın ama kesin çalışan
    - Fundamental + Teknik + Momentum kombinasyonu
    """
    
    def __init__(self):
        # BIST 100 + BIST 30 hisseleri (çok kasmasın diye 10 tane)
        self.bist_stocks = [
            "SISE.IS", "EREGL.IS", "TUPRS.IS", "KCHOL.IS", "GARAN.IS",
            "AKBNK.IS", "YKBNK.IS", "THYAO.IS", "ASELS.IS", "BIMAS.IS"
        ]
        
        # İndikatör ağırlıkları
        self.weights = {
            "fundamental": 0.40,    # %40
            "technical": 0.35,      # %35
            "momentum": 0.25        # %25
        }
        
        # Sonuçlar
        self.analysis_results = {}
        self.top_picks = []
        
    def get_stock_data(self, symbol: str, period: str = "6mo") -> pd.DataFrame:
        """
        Hisse verisi çeker (optimize edilmiş)
        """
        try:
            data = yf.download(symbol, period=period, interval="1d", progress=False)
            
            if data.empty:
                return pd.DataFrame()
            
            # MultiIndex düzelt
            if isinstance(data.columns, pd.MultiIndex):
                data.columns = data.columns.get_level_values(0)
            
            # Gereksiz sütunları kaldır
            data = data[['Open', 'High', 'Low', 'Close', 'Volume']]
            
            # NaN değerleri temizle
            data = data.dropna()
            
            return data
            
        except Exception as e:
            logger.error(f"{symbol} veri çekme hatası: {e}")
            return pd.DataFrame()
    
    def calculate_fundamental_score(self, symbol: str) -> float:
        """
        Fundamental skor hesaplar (simüle edilmiş - gerçek API ile değiştirilebilir)
        """
        try:
            # Simüle edilmiş fundamental veriler (gerçek API ile değiştirilecek)
            fundamental_data = {
                "SISE.IS": {"roe": 0.18, "debt_ratio": 0.35, "profit_margin": 0.12},
                "EREGL.IS": {"roe": 0.22, "debt_ratio": 0.28, "profit_margin": 0.15},
                "TUPRS.IS": {"roe": 0.25, "debt_ratio": 0.42, "profit_margin": 0.18},
                "KCHOL.IS": {"roe": 0.20, "debt_ratio": 0.38, "profit_margin": 0.14},
                "GARAN.IS": {"roe": 0.16, "debt_ratio": 0.45, "profit_margin": 0.10},
                "AKBNK.IS": {"roe": 0.14, "debt_ratio": 0.48, "profit_margin": 0.08},
                "YKBNK.IS": {"roe": 0.12, "debt_ratio": 0.52, "profit_margin": 0.06},
                "THYAO.IS": {"roe": 0.08, "debt_ratio": 0.65, "profit_margin": 0.04},
                "ASELS.IS": {"roe": 0.15, "debt_ratio": 0.40, "profit_margin": 0.11},
                "BIMAS.IS": {"roe": 0.19, "debt_ratio": 0.32, "profit_margin": 0.13}
            }
            
            if symbol in fundamental_data:
                data = fundamental_data[symbol]
                
                # ROE skoru (0-40 puan)
                roe_score = min(40, data["roe"] * 200)
                
                # Borç oranı skoru (0-30 puan) - düşük borç = yüksek skor
                debt_score = max(0, 30 - (data["debt_ratio"] * 30))
                
                # Kâr marjı skoru (0-30 puan)
                profit_score = min(30, data["profit_margin"] * 200)
                
                total_score = roe_score + debt_score + profit_score
                return min(100, total_score)
            else:
                # Ortalama skor
                return 65.0
                
        except Exception as e:
            logger.error(f"Fundamental skor hesaplama hatası: {e}")
            return 50.0
    
    def calculate_technical_score(self, data: pd.DataFrame) -> float:
        """
        Teknik analiz skoru hesaplar
        """
        try:
            if data.empty or len(data) < 50:
                return 50.0
            
            # Numpy array'e çevir
            close = data['Close'].values.astype(float)
            high = data['High'].values.astype(float)
            low = data['Low'].values.astype(float)
            volume = data['Volume'].values.astype(float)
            
            # 1. EMA Cross Sinyali (0-25 puan)
                    ema20 = ta.trend.ema_indicator(close, window=20)
        ema50 = ta.trend.ema_indicator(close, window=50)
            
            # Son 5 günlük EMA cross analizi
            ema_cross_score = 0
            for i in range(-5, 0):
                if i < -len(ema20) or i < -len(ema50):
                    continue
                if ema20[i] > ema50[i] and ema20[i-1] <= ema50[i-1]:
                    ema_cross_score += 5  # Golden Cross
                elif ema20[i] < ema50[i] and ema20[i-1] >= ema50[i-1]:
                    ema_cross_score -= 3  # Death Cross
            
            ema_cross_score = max(0, min(25, ema_cross_score + 12.5))  # 0-25 arası
            
            # 2. RSI Sinyali (0-25 puan)
            rsi = ta.momentum.rsi(close, window=14)
            if len(rsi) > 0:
                last_rsi = rsi[-1]
                if last_rsi < 30:
                    rsi_score = 25  # Oversold
                elif last_rsi > 70:
                    rsi_score = 5   # Overbought
                elif 40 <= last_rsi <= 60:
                    rsi_score = 20  # Neutral
                else:
                    rsi_score = 15  # Normal
            else:
                rsi_score = 15
            
            # 3. MACD Sinyali (0-25 puan)
            macd, macd_signal, macd_hist = talib.MACD(close)
            if len(macd) > 0 and len(macd_signal) > 0:
                if macd[-1] > macd_signal[-1] and macd[-2] <= macd_signal[-2]:
                    macd_score = 25  # Bullish crossover
                elif macd[-1] < macd_signal[-1] and macd[-2] >= macd_signal[-2]:
                    macd_score = 5   # Bearish crossover
                elif macd[-1] > macd_signal[-1]:
                    macd_score = 20  # Bullish
                else:
                    macd_score = 10  # Bearish
            else:
                macd_score = 15
            
            # 4. Volume Analizi (0-25 puan)
            volume_ma = talib.SMA(volume, timeperiod=20)
            if len(volume_ma) > 0:
                current_volume = volume[-1]
                avg_volume = volume_ma[-1]
                
                if current_volume > avg_volume * 1.5:
                    volume_score = 25  # Yüksek hacim
                elif current_volume > avg_volume * 1.2:
                    volume_score = 20  # Orta hacim
                elif current_volume > avg_volume:
                    volume_score = 15  # Normal hacim
                else:
                    volume_score = 10  # Düşük hacim
            else:
                volume_score = 15
            
            # Toplam teknik skor
            total_technical = ema_cross_score + rsi_score + macd_score + volume_score
            return min(100, total_technical)
            
        except Exception as e:
            logger.error(f"Teknik skor hesaplama hatası: {e}")
            return 50.0
    
    def calculate_momentum_score(self, data: pd.DataFrame) -> float:
        """
        Momentum skoru hesaplar
        """
        try:
            if data.empty or len(data) < 20:
                return 50.0
            
            close = data['Close'].values
            volume = data['Volume'].values
            
            # 1. Fiyat Momentum (0-50 puan)
            # Son 20 günlük momentum
            if len(close) >= 20:
                momentum_20 = (close[-1] - close[-20]) / close[-20] * 100
                
                if momentum_20 > 10:
                    price_momentum = 50  # Güçlü yükseliş
                elif momentum_20 > 5:
                    price_momentum = 40  # Yükseliş
                elif momentum_20 > 0:
                    price_momentum = 30  # Hafif yükseliş
                elif momentum_20 > -5:
                    price_momentum = 20  # Hafif düşüş
                elif momentum_20 > -10:
                    price_momentum = 10  # Düşüş
                else:
                    price_momentum = 0   # Güçlü düşüş
            else:
                price_momentum = 25
            
            # 2. Hacim Momentum (0-50 puan)
            if len(volume) >= 20:
                volume_ma_20 = np.mean(volume[-20:])
                current_volume = volume[-1]
                
                volume_ratio = current_volume / volume_ma_20
                
                if volume_ratio > 2.0:
                    volume_momentum = 50  # Çok yüksek hacim
                elif volume_ratio > 1.5:
                    volume_momentum = 40  # Yüksek hacim
                elif volume_ratio > 1.2:
                    volume_momentum = 30  # Orta hacim
                elif volume_ratio > 1.0:
                    volume_momentum = 20  # Normal hacim
                else:
                    volume_momentum = 10  # Düşük hacim
            else:
                volume_momentum = 25
            
            # Toplam momentum skoru
            total_momentum = (price_momentum + volume_momentum) / 2
            return min(100, total_momentum)
            
        except Exception as e:
            logger.error(f"Momentum skor hesaplama hatası: {e}")
            return 50.0
    
    def calculate_composite_score(self, fundamental: float, technical: float, momentum: float) -> Dict:
        """
        Kompozit skor hesaplar
        """
        try:
            # Ağırlıklı ortalama
            composite_score = (
                fundamental * self.weights["fundamental"] +
                technical * self.weights["technical"] +
                momentum * self.weights["momentum"]
            )
            
            # Skor detayları
            score_breakdown = {
                "fundamental": round(fundamental, 2),
                "technical": round(technical, 2),
                "momentum": round(momentum, 2),
                "composite": round(composite_score, 2)
            }
            
            # Harf notu
            if composite_score >= 85:
                grade = "A+"
                recommendation = "STRONG BUY"
                signal_strength = "VERY STRONG"
            elif composite_score >= 75:
                grade = "A"
                recommendation = "BUY"
                signal_strength = "STRONG"
            elif composite_score >= 65:
                grade = "B+"
                recommendation = "BUY"
                signal_strength = "MODERATE"
            elif composite_score >= 55:
                grade = "B"
                recommendation = "HOLD"
                signal_strength = "WEAK"
            elif composite_score >= 45:
                grade = "C"
                recommendation = "HOLD"
                signal_strength = "WEAK"
            elif composite_score >= 35:
                grade = "D"
                recommendation = "SELL"
                signal_strength = "MODERATE"
            else:
                grade = "F"
                recommendation = "STRONG SELL"
                signal_strength = "STRONG"
            
            return {
                "score_breakdown": score_breakdown,
                "grade": grade,
                "recommendation": recommendation,
                "signal_strength": signal_strength,
                "risk_level": self._get_risk_level(composite_score)
            }
            
        except Exception as e:
            logger.error(f"Kompozit skor hesaplama hatası: {e}")
            return {"error": str(e)}
    
    def _get_risk_level(self, score: float) -> str:
        """Risk seviyesi belirler"""
        if score >= 80:
            return "LOW"
        elif score >= 60:
            return "MEDIUM-LOW"
        elif score >= 40:
            return "MEDIUM"
        elif score >= 20:
            return "MEDIUM-HIGH"
        else:
            return "HIGH"
    
    def analyze_single_stock(self, symbol: str, period: str = "6mo") -> Dict:
        """
        Tek hisse analizi yapar
        """
        try:
            logger.info(f"🎯 {symbol} analiz ediliyor...")
            
            # 1. Veri çek
            data = self.get_stock_data(symbol, period)
            if data.empty:
                return {"error": "Veri bulunamadı"}
            
            # 2. Skorları hesapla
            fundamental_score = self.calculate_fundamental_score(symbol)
            technical_score = self.calculate_technical_score(data)
            momentum_score = self.calculate_momentum_score(data)
            
            # 3. Kompozit skor
            composite_result = self.calculate_composite_score(
                fundamental_score, technical_score, momentum_score
            )
            
            if "error" in composite_result:
                return composite_result
            
            # 4. Sonuç
            result = {
                "symbol": symbol,
                "analysis_date": datetime.now().isoformat(),
                "data_period": period,
                "scores": {
                    "fundamental": fundamental_score,
                    "technical": technical_score,
                    "momentum": momentum_score,
                    "composite": composite_result["score_breakdown"]["composite"]
                },
                "grade": composite_result["grade"],
                "recommendation": composite_result["recommendation"],
                "signal_strength": composite_result["signal_strength"],
                "risk_level": composite_result["risk_level"],
                "data_points": len(data),
                "last_price": float(data['Close'].iloc[-1]),
                "price_change_20d": float((data['Close'].iloc[-1] - data['Close'].iloc[-20]) / data['Close'].iloc[-20] * 100) if len(data) >= 20 else 0
            }
            
            return result
            
        except Exception as e:
            logger.error(f"{symbol} analiz hatası: {e}")
            return {"error": str(e)}
    
    def analyze_all_stocks(self, period: str = "6mo") -> Dict:
        """
        Tüm BIST hisselerini analiz eder
        """
        try:
            logger.info(f"🚀 Tüm BIST hisseleri analiz ediliyor ({len(self.bist_stocks)} hisse)...")
            
            all_results = []
            successful_analyses = 0
            
            for symbol in self.bist_stocks:
                try:
                    result = self.analyze_single_stock(symbol, period)
                    
                    if "error" not in result:
                        all_results.append(result)
                        successful_analyses += 1
                        logger.info(f"✅ {symbol}: {result['grade']} - {result['recommendation']}")
                    else:
                        logger.warning(f"⚠️ {symbol}: {result['error']}")
                        
                except Exception as e:
                    logger.error(f"❌ {symbol} analiz hatası: {e}")
                    continue
            
            # Skora göre sırala
            all_results.sort(key=lambda x: x['scores']['composite'], reverse=True)
            
            # Top picks (en iyi 5)
            self.top_picks = all_results[:5]
            
            # Sonuç özeti
            summary = {
                "total_stocks": len(self.bist_stocks),
                "successful_analyses": successful_analyses,
                "analysis_date": datetime.now().isoformat(),
                "top_picks": self.top_picks,
                "all_results": all_results,
                "performance_stats": self._calculate_performance_stats(all_results)
            }
            
            self.analysis_results = summary
            return summary
            
        except Exception as e:
            logger.error(f"Toplu analiz hatası: {e}")
            return {"error": str(e)}
    
    def _calculate_performance_stats(self, results: List[Dict]) -> Dict:
        """
        Performans istatistikleri hesaplar
        """
        try:
            if not results:
                return {}
            
            scores = [r['scores']['composite'] for r in results]
            grades = [r['grade'] for r in results]
            recommendations = [r['recommendation'] for r in results]
            
            stats = {
                "average_score": round(np.mean(scores), 2),
                "median_score": round(np.median(scores), 2),
                "min_score": round(min(scores), 2),
                "max_score": round(max(scores), 2),
                "grade_distribution": pd.Series(grades).value_counts().to_dict(),
                "recommendation_distribution": pd.Series(recommendations).value_counts().to_dict(),
                "buy_signals": len([r for r in results if "BUY" in r['recommendation']]),
                "hold_signals": len([r for r in results if "HOLD" in r['recommendation']]),
                "sell_signals": len([r for r in results if "SELL" in r['recommendation']])
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Performans istatistik hesaplama hatası: {e}")
            return {}
    
    def get_portfolio_recommendations(self, max_stocks: int = 5) -> Dict:
        """
        Portföy önerileri üretir
        """
        try:
            if not self.top_picks:
                return {"error": "Önce analiz yapın"}
            
            # Risk seviyesine göre portföy dağılımı
            portfolio = {}
            total_weight = 0
            
            for i, stock in enumerate(self.top_picks[:max_stocks]):
                # Skor bazlı ağırlık
                base_weight = stock['scores']['composite']
                
                # Risk bazlı ayarlama
                risk_multiplier = {
                    "LOW": 1.2,
                    "MEDIUM-LOW": 1.0,
                    "MEDIUM": 0.8,
                    "MEDIUM-HIGH": 0.6,
                    "HIGH": 0.4
                }.get(stock['risk_level'], 1.0)
                
                final_weight = base_weight * risk_multiplier
                portfolio[stock['symbol']] = {
                    "weight": round(final_weight, 2),
                    "grade": stock['grade'],
                    "recommendation": stock['recommendation'],
                    "risk_level": stock['risk_level'],
                    "composite_score": stock['scores']['composite']
                }
                
                total_weight += final_weight
            
            # Normalize (toplam %100)
            for symbol in portfolio:
                portfolio[symbol]["weight"] = round(
                    (portfolio[symbol]["weight"] / total_weight) * 100, 2
                )
            
            return {
                "portfolio": portfolio,
                "total_weight": round(total_weight, 2),
                "recommendation_date": datetime.now().isoformat(),
                "strategy": "BIST Smart Indicator - Top Picks"
            }
            
        except Exception as e:
            logger.error(f"Portföy önerisi hatası: {e}")
            return {"error": str(e)}
    
    def print_analysis_summary(self):
        """
        Analiz özetini yazdırır
        """
        if not self.analysis_results:
            print("❌ Henüz analiz yapılmamış!")
            return
        
        results = self.analysis_results
        
        print("\n" + "="*80)
        print("🚀 BIST SMART INDICATOR - ANALİZ ÖZETİ")
        print("="*80)
        print(f"📊 Toplam Hisse: {results['total_stocks']}")
        print(f"✅ Başarılı Analiz: {results['successful_analyses']}")
        print(f"📅 Analiz Tarihi: {results['analysis_date']}")
        
        # Performans istatistikleri
        if 'performance_stats' in results:
            stats = results['performance_stats']
            print(f"\n📈 PERFORMANS İSTATİSTİKLERİ:")
            print(f"   Ortalama Skor: {stats.get('average_score', 0):.1f}")
            print(f"   Medyan Skor: {stats.get('median_score', 0):.1f}")
            print(f"   Min Skor: {stats.get('min_score', 0):.1f}")
            print(f"   Max Skor: {stats.get('max_score', 0):.1f}")
            
            print(f"\n🎯 SİNYAL DAĞILIMI:")
            print(f"   BUY: {stats.get('buy_signals', 0)}")
            print(f"   HOLD: {stats.get('hold_signals', 0)}")
            print(f"   SELL: {stats.get('sell_signals', 0)}")
        
        # Top picks
        print(f"\n🏆 TOP {len(results['top_picks'])} HİSSE:")
        print("-" * 80)
        for i, stock in enumerate(results['top_picks'], 1):
            print(f"{i:2d}. {stock['symbol']:<10} | {stock['grade']:>3} | {stock['recommendation']:<12} | "
                  f"Skor: {stock['scores']['composite']:>6.1f} | Risk: {stock['risk_level']:<12}")
        
        # Portföy önerileri
        portfolio = self.get_portfolio_recommendations()
        if "error" not in portfolio:
            print(f"\n💼 PORTFÖY ÖNERİLERİ:")
            print("-" * 80)
            for symbol, alloc in portfolio['portfolio'].items():
                print(f"   {symbol:<10} | %{alloc['weight']:>5.1f} | {alloc['recommendation']:<12} | Risk: {alloc['risk_level']:<12}")
        
        print("\n" + "="*80)

# Test fonksiyonu
if __name__ == "__main__":
    print("🚀 BIST SMART INDICATOR - TEST BAŞLATILIYOR...")
    print("="*60)
    
    # İndikatör sistemini başlat
    indicator = BISTSmartIndicator()
    
    # Tüm hisseleri analiz et
    print("📊 BIST hisseleri analiz ediliyor...")
    results = indicator.analyze_all_stocks(period="6mo")
    
    if "error" not in results:
        # Özet yazdır
        indicator.print_analysis_summary()
        
        # Detaylı analiz örneği
        print(f"\n🔍 DETAYLI ANALİZ ÖRNEĞİ ({results['top_picks'][0]['symbol']}):")
        print("-" * 60)
        
        top_stock = results['top_picks'][0]
        print(f"Symbol: {top_stock['symbol']}")
        print(f"Grade: {top_stock['grade']}")
        print(f"Recommendation: {top_stock['recommendation']}")
        print(f"Signal Strength: {top_stock['signal_strength']}")
        print(f"Risk Level: {top_stock['risk_level']}")
        print(f"Composite Score: {top_stock['scores']['composite']:.1f}")
        print(f"Fundamental: {top_stock['scores']['fundamental']:.1f}")
        print(f"Technical: {top_stock['scores']['technical']:.1f}")
        print(f"Momentum: {top_stock['scores']['momentum']:.1f}")
        print(f"Last Price: {top_stock['last_price']:.2f}")
        print(f"20G Change: {top_stock['price_change_20d']:.2f}%")
        
    else:
        print(f"❌ Analiz hatası: {results['error']}")
    
    print("\n✅ Test tamamlandı!")
