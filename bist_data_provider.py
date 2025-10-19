"""
BIST AI Smart Trader - BIST Hisse Veri Sağlayıcısı
Gerçek BIST hisse verilerini yfinance ile çeker
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import asyncio
import json

class BISTDataProvider:
    def __init__(self):
        # BIST30 hisseleri
        self.bist30_symbols = [
            'AKBNK.IS', 'ARCLK.IS', 'ASELS.IS', 'BIMAS.IS', 'EKGYO.IS',
            'EREGL.IS', 'FROTO.IS', 'GARAN.IS', 'HALKB.IS', 'ISCTR.IS',
            'KCHOL.IS', 'KOZAL.IS', 'KOZAA.IS', 'PETKM.IS', 'PGSUS.IS',
            'SAHOL.IS', 'SASA.IS', 'SISE.IS', 'TAVHL.IS', 'THYAO.IS',
            'TKFEN.IS', 'TOASO.IS', 'TUPRS.IS', 'VAKBN.IS', 'YKBNK.IS',
            'ZOREN.IS', 'ADNAC.IS', 'BUCIM.IS', 'CCOLA.IS', 'DOHOL.IS'
        ]
        
        # BIST100 hisseleri (BIST30 dahil)
        self.bist100_symbols = self.bist30_symbols + [
            'AGHOL.IS', 'AKSEN.IS', 'ALARK.IS', 'ALBRK.IS', 'ANACM.IS',
            'ASUZU.IS', 'AYDEM.IS', 'BAGFS.IS', 'BASGZ.IS', 'BERA.IS',
            'BFREN.IS', 'BIOEN.IS', 'BRISA.IS', 'BRKO.IS', 'BRSAN.IS',
            'BUCIM.IS', 'CANTE.IS', 'CEMAS.IS', 'CEMTS.IS', 'CIMSA.IS',
            'CLEBI.IS', 'CRDFA.IS', 'DENGE.IS', 'DERIM.IS', 'DESPC.IS',
            'DGNMO.IS', 'DOKTA.IS', 'DYHOL.IS', 'ECILC.IS', 'ECYAT.IS',
            'EGEEN.IS', 'EGEPO.IS', 'EKIZ.IS', 'ENJSA.IS', 'ENKAI.IS',
            'ERBOS.IS', 'ERSU.IS', 'ESEN.IS', 'ETILR.IS', 'EUHOL.IS',
            'FMIZP.IS', 'FORTE.IS', 'FRIGO.IS', 'GEDIK.IS', 'GENIL.IS',
            'GENTS.IS', 'GESAN.IS', 'GLYHO.IS', 'GOODY.IS', 'GRNYO.IS',
            'GSRAY.IS', 'GWIND.IS', 'HATEK.IS', 'HEKTS.IS', 'HLGYO.IS',
            'HUNER.IS', 'IHEVA.IS', 'INDES.IS', 'INVEO.IS', 'ISDMR.IS',
            'ISGSY.IS', 'ISMEN.IS', 'IZMDC.IS', 'IZINV.IS', 'KAREL.IS',
            'KARSN.IS', 'KARTN.IS', 'KCAER.IS', 'KCHOL.IS', 'KENT.IS',
            'KGYO.IS', 'KLKIM.IS', 'KLMSN.IS', 'KLSER.IS', 'KONTR.IS',
            'KONYA.IS', 'KORDS.IS', 'KRONT.IS', 'KRSTL.IS', 'KRTEK.IS',
            'KTSKR.IS', 'KUYAS.IS', 'LIDFA.IS', 'LOGO.IS', 'MAALT.IS',
            'MAGEN.IS', 'MAVI.IS', 'MEGAP.IS', 'MERKO.IS', 'METRO.IS',
            'MGROS.IS', 'MIGRS.IS', 'MRSHL.IS', 'MRDIN.IS', 'NTHOL.IS',
            'NTGAZ.IS', 'ODAS.IS', 'ORCAY.IS', 'OYAKC.IS', 'OYLUM.IS',
            'OZRDN.IS', 'PAMEL.IS', 'PARSN.IS', 'PENGD.IS', 'PETUN.IS',
            'PNTAS.IS', 'POLTK.IS', 'PRKAB.IS', 'PRKME.IS', 'QUAGR.IS',
            'RAYSG.IS', 'REEDR.IS', 'REYAP.IS', 'RNPOL.IS', 'ROYAL.IS',
            'RTALB.IS', 'SALIX.IS', 'SANEL.IS', 'SARKY.IS', 'SEYKM.IS',
            'SILVR.IS', 'SMRTG.IS', 'SNKRN.IS', 'SNPAM.IS', 'SODA.IS',
            'SONME.IS', 'SUWEN.IS', 'TATGD.IS', 'TCELL.IS', 'TEKTU.IS',
            'TERA.IS', 'TETMT.IS', 'THYAO.IS', 'TMPOL.IS', 'TOASO.IS',
            'TRCAS.IS', 'TRGYO.IS', 'TSKB.IS', 'TTKOM.IS', 'TTRAK.IS',
            'TUCLK.IS', 'TUKAS.IS', 'ULKER.IS', 'ULUSE.IS', 'UNYEC.IS',
            'UZERB.IS', 'VAKKO.IS', 'VESBE.IS', 'VKING.IS', 'VKGYO.IS',
            'YAPRK.IS', 'YATAS.IS', 'YAZIC.IS', 'YESIL.IS', 'YGGYO.IS',
            'YKGYO.IS', 'YUNSA.IS', 'ZORLU.IS', 'ZOREN.IS'
        ]
        
        # Sembol isimleri
        self.symbol_names = {
            'AKBNK.IS': 'Akbank',
            'ARCLK.IS': 'Arçelik',
            'ASELS.IS': 'Aselsan',
            'BIMAS.IS': 'BİM',
            'EKGYO.IS': 'Emlak Konut GYO',
            'EREGL.IS': 'Ereğli Demir Çelik',
            'FROTO.IS': 'Ford Otosan',
            'GARAN.IS': 'Garanti BBVA',
            'HALKB.IS': 'Halkbank',
            'ISCTR.IS': 'İş Bankası',
            'KCHOL.IS': 'Koç Holding',
            'KOZAL.IS': 'Koza Altın',
            'KOZAA.IS': 'Koza Anadolu',
            'PETKM.IS': 'Petkim',
            'PGSUS.IS': 'Pegasus',
            'SAHOL.IS': 'Sabancı Holding',
            'SASA.IS': 'Sasa Polyester',
            'SISE.IS': 'Şişe Cam',
            'TAVHL.IS': 'TAV Havalimanları',
            'THYAO.IS': 'Türk Hava Yolları',
            'TKFEN.IS': 'Türk Telekom',
            'TOASO.IS': 'Tofaş',
            'TUPRS.IS': 'Tüpraş',
            'VAKBN.IS': 'VakıfBank',
            'YKBNK.IS': 'Yapı Kredi',
            'ZOREN.IS': 'Zorlu Enerji'
        }

    def get_bist_data(self, symbols=None, period='1d'):
        """BIST hisseleri için veri çek"""
        if symbols is None:
            symbols = self.bist30_symbols[:10]  # İlk 10 hisse
        
        try:
            # yfinance ile veri çek
            data = yf.download(symbols, period=period, interval='1m', group_by='ticker')
            
            results = []
            for symbol in symbols:
                try:
                    if len(symbols) == 1:
                        ticker_data = data
                    else:
                        ticker_data = data[symbol]
                    
                    if ticker_data.empty:
                        continue
                    
                    # Son fiyat bilgileri
                    last_price = ticker_data['Close'].iloc[-1]
                    prev_close = ticker_data['Close'].iloc[-2] if len(ticker_data) > 1 else last_price
                    change = ((last_price - prev_close) / prev_close) * 100
                    volume = ticker_data['Volume'].iloc[-1]
                    
                    # Teknik göstergeler
                    technical = self._calculate_technical_indicators(ticker_data)
                    
                    result = {
                        'symbol': symbol.replace('.IS', ''),
                        'name': self.symbol_names.get(symbol, symbol.replace('.IS', '')),
                        'price': float(last_price),
                        'change': float(change),
                        'volume': int(volume),
                        'timestamp': datetime.now().isoformat(),
                        'technical': technical
                    }
                    results.append(result)
                    
                except Exception as e:
                    print(f"⚠️ {symbol} veri hatası: {e}")
                    continue
            
            return results
            
        except Exception as e:
            print(f"❌ BIST veri çekme hatası: {e}")
            return []

    def _calculate_technical_indicators(self, data):
        """Teknik göstergeleri hesapla"""
        try:
            closes = data['Close']
            highs = data['High']
            lows = data['Low']
            volumes = data['Volume']
            
            # RSI hesaplama
            delta = closes.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            
            # MACD hesaplama
            ema12 = closes.ewm(span=12).mean()
            ema26 = closes.ewm(span=26).mean()
            macd = ema12 - ema26
            signal = macd.ewm(span=9).mean()
            
            # Bollinger Bands
            sma20 = closes.rolling(window=20).mean()
            std20 = closes.rolling(window=20).std()
            bb_upper = sma20 + (std20 * 2)
            bb_lower = sma20 - (std20 * 2)
            
            return {
                'rsi': float(rsi.iloc[-1]) if not rsi.empty and not pd.isna(rsi.iloc[-1]) else 50,
                'macd': float(macd.iloc[-1]) if not macd.empty and not pd.isna(macd.iloc[-1]) else 0,
                'signal': float(signal.iloc[-1]) if not signal.empty and not pd.isna(signal.iloc[-1]) else 0,
                'bb_upper': float(bb_upper.iloc[-1]) if not bb_upper.empty else 0,
                'bb_lower': float(bb_lower.iloc[-1]) if not bb_lower.empty else 0,
                'sma20': float(sma20.iloc[-1]) if not sma20.empty else 0,
                'volume_avg': float(volumes.rolling(window=20).mean().iloc[-1]) if not volumes.empty else 0
            }
            
        except Exception as e:
            print(f"⚠️ Teknik gösterge hatası: {e}")
            return {
                'rsi': 50,
                'macd': 0,
                'signal': 0,
                'bb_upper': 0,
                'bb_lower': 0,
                'sma20': 0,
                'volume_avg': 0
            }

    def get_bist_signals(self, symbols=None):
        """BIST hisseleri için AI sinyalleri üret"""
        data = self.get_bist_data(symbols)
        signals = []
        
        for stock in data:
            try:
                # Sinyal üretimi
                signal = self._generate_signal(stock)
                signals.append(signal)
            except Exception as e:
                print(f"⚠️ Sinyal üretme hatası {stock['symbol']}: {e}")
                continue
        
        return signals

    def _generate_signal(self, stock):
        """Hisse için sinyal üret"""
        technical = stock['technical']
        price = stock['price']
        change = stock['change']
        
        # Sinyal skorları
        rsi_score = 0
        macd_score = 0
        trend_score = 0
        
        # RSI analizi
        if technical['rsi'] < 30:
            rsi_score = 2  # Güçlü al
        elif technical['rsi'] < 40:
            rsi_score = 1  # Al
        elif technical['rsi'] > 70:
            rsi_score = -2  # Güçlü sat
        elif technical['rsi'] > 60:
            rsi_score = -1  # Sat
        
        # MACD analizi
        if technical['macd'] > technical['signal'] and technical['macd'] > 0:
            macd_score = 1
        elif technical['macd'] < technical['signal'] and technical['macd'] < 0:
            macd_score = -1
        
        # Trend analizi
        if change > 2:
            trend_score = 1
        elif change < -2:
            trend_score = -1
        
        # Toplam skor
        total_score = rsi_score + macd_score + trend_score
        
        # Sinyal belirleme
        if total_score >= 2:
            signal_type = 'BUY'
            confidence = min(0.9, 0.6 + (total_score * 0.1))
        elif total_score <= -2:
            signal_type = 'SELL'
            confidence = min(0.9, 0.6 + (abs(total_score) * 0.1))
        else:
            signal_type = 'HOLD'
            confidence = 0.5
        
        return {
            'symbol': stock['symbol'],
            'name': stock['name'],
            'signal': signal_type,
            'confidence': confidence,
            'price': price,
            'change': change,
            'volume': stock['volume'],
            'timestamp': stock['timestamp'],
            'technical': technical,
            'xai_explanation': f"RSI: {technical['rsi']:.1f}, MACD: {technical['macd']:.3f}, Değişim: {change:.1f}%",
            'expected_return': self._calculate_expected_return(signal_type, confidence),
            'stop_loss': price * (0.95 if signal_type == 'BUY' else 1.05),
            'take_profit': price * (1.05 if signal_type == 'BUY' else 0.95)
        }

    def _calculate_expected_return(self, signal_type, confidence):
        """Beklenen getiri hesapla"""
        base_return = 0.02 if signal_type == 'BUY' else -0.02
        return base_return * confidence

# Test fonksiyonu
if __name__ == "__main__":
    provider = BISTDataProvider()
    
    print("🚀 BIST AI Smart Trader - Veri Sağlayıcısı Test")
    print("=" * 50)
    
    # BIST30 test
    print("\n📊 BIST30 Hisse Verileri:")
    bist30_data = provider.get_bist_data(provider.bist30_symbols[:5])
    for stock in bist30_data:
        print(f"{stock['symbol']}: ₺{stock['price']:.2f} ({stock['change']:+.1f}%)")
    
    # Sinyal test
    print("\n🎯 AI Sinyalleri:")
    signals = provider.get_bist_signals(provider.bist30_symbols[:5])
    for signal in signals:
        print(f"{signal['symbol']}: {signal['signal']} (Güven: {signal['confidence']:.1%})")
