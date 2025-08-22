import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta
import yfinance as yf
# TA-Lib yerine ta kütüphanesi kullan
import ta
import warnings
warnings.filterwarnings('ignore')

# Türkçe font desteği
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['axes.unicode_minus'] = False

class VisualAnalyzer:
    """
    Görsel Analiz Paneli - Candlestick, Teknik İndikatörler, Formasyon Tespiti
    """
    
    def __init__(self):
        self.colors = {
            'bullish': '#26A69A',  # Yeşil
            'bearish': '#EF5350',  # Kırmızı
            'neutral': '#42A5F5',  # Mavi
            'volume': '#FF9800',   # Turuncu
            'ema_20': '#FF5722',   # Koyu Turuncu
            'ema_50': '#9C27B0',   # Mor
            'ema_200': '#607D8B',  # Gri
            'rsi': '#E91E63',      # Pembe
            'macd': '#795548',     # Kahverengi
            'bollinger': '#4CAF50' # Açık Yeşil
        }
        
    def get_stock_data(self, symbol: str, period: str = "6mo", interval: str = "1d") -> pd.DataFrame:
        """
        Hisse verilerini çeker ve MultiIndex düzeltir
        """
        try:
            data = yf.download(symbol, period=period, interval=interval)
            if data.empty:
                raise ValueError(f"{symbol} için veri bulunamadı")
            
            # MultiIndex column'ları düzelt
            if isinstance(data.columns, pd.MultiIndex):
                data.columns = data.columns.get_level_values(0)
            
            return data
            
        except Exception as e:
            print(f"Veri çekme hatası: {e}")
            return pd.DataFrame()
    
    def add_technical_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Teknik indikatörleri ekler
        """
        try:
            df = data.copy()
            
            # EMA'lar
            df['EMA_20'] = ta.trend.ema_indicator(df['Close'].values, window=20)
            df['EMA_50'] = ta.trend.ema_indicator(df['Close'].values, window=50)
            df['EMA_200'] = ta.trend.ema_indicator(df['Close'].values, window=200)
            
            # RSI
            df['RSI'] = ta.momentum.rsi(df['Close'].values, window=14)
            
            # MACD
            df['MACD'], df['MACD_Signal'], df['MACD_Hist'] = ta.trend.macd(df['Close'].values)
            
            # Bollinger Bands
            df['BB_Upper'], df['BB_Middle'], df['BB_Lower'] = ta.volatility.bollinger_bands(df['Close'].values)
            
            # ATR
            df['ATR'] = ta.volatility.average_true_range(df['High'].values, df['Low'].values, df['Close'].values, window=14)
            
            # Volume MA
            df['Volume_MA_20'] = df['Volume'].rolling(window=20).mean()
            
            return df
            
        except Exception as e:
            print(f"Teknik indikatör ekleme hatası: {e}")
            return data
    
    def create_candlestick_chart(self, data: pd.DataFrame, symbol: str, 
                                show_patterns: bool = True, save_path: str = None) -> None:
        """
        Candlestick grafiği oluşturur
        """
        try:
            # Teknik indikatörleri ekle
            df = self.add_technical_indicators(data)
            
            # Grafik boyutu
            fig, (ax1, ax2, ax3, ax4) = plt.subplots(4, 1, figsize=(16, 12), 
                                                      gridspec_kw={'height_ratios': [3, 1, 1, 1]})
            
            # Ana candlestick grafiği
            self._plot_candlesticks(ax1, df, symbol)
            self._plot_technical_indicators(ax1, df)
            
            # Hacim grafiği
            self._plot_volume(ax2, df)
            
            # RSI grafiği
            self._plot_rsi(ax3, df)
            
            # MACD grafiği
            self._plot_macd(ax4, df)
            
            # Formasyon tespiti
            if show_patterns:
                self._detect_and_plot_patterns(ax1, df)
            
            # Grafik düzeni
            plt.tight_layout()
            
            # Kaydet
            if save_path:
                plt.savefig(save_path, dpi=300, bbox_inches='tight')
                print(f"📊 Grafik kaydedildi: {save_path}")
            
            plt.show()
            
        except Exception as e:
            print(f"Candlestick grafik hatası: {e}")
    
    def _plot_candlesticks(self, ax, df: pd.DataFrame, symbol: str) -> None:
        """
        Candlestick çubuklarını çizer
        """
        try:
            # Tarih formatı
            df.index = pd.to_datetime(df.index)
            
            # Bullish/Bearish mumları ayır
            bullish = df[df['Close'] >= df['Open']]
            bearish = df[df['Close'] < df['Open']]
            
            # Bullish mumlar (yeşil)
            if not bullish.empty:
                ax.vlines(bullish.index, bullish['Low'], bullish['High'], 
                         color=self.colors['bullish'], linewidth=1)
                ax.vlines(bullish.index, bullish['Open'], bullish['Close'], 
                         color=self.colors['bullish'], linewidth=3)
            
            # Bearish mumlar (kırmızı)
            if not bearish.empty:
                ax.vlines(bearish.index, bearish['Low'], bearish['High'], 
                         color=self.colors['bearish'], linewidth=1)
                ax.vlines(bearish.index, bearish['Open'], bearish['Close'], 
                         color=self.colors['bearish'], linewidth=3)
            
            # Grafik başlığı ve etiketler
            ax.set_title(f'{symbol} - Candlestick Grafiği', fontsize=16, fontweight='bold')
            ax.set_ylabel('Fiyat (TL)', fontsize=12)
            ax.grid(True, alpha=0.3)
            
            # Tarih formatı
            ax.xaxis.set_major_formatter(mdates.DateFormatter('%d/%m'))
            ax.xaxis.set_major_locator(mdates.WeekdayLocator(interval=1))
            plt.setp(ax.xaxis.get_majorticklabels(), rotation=45)
            
        except Exception as e:
            print(f"Candlestick çizim hatası: {e}")
    
    def _plot_technical_indicators(self, ax, df: pd.DataFrame) -> None:
        """
        Teknik indikatörleri çizer
        """
        try:
            # EMA'lar
            ax.plot(df.index, df['EMA_20'], color=self.colors['ema_20'], 
                   linewidth=2, label='EMA 20', alpha=0.8)
            ax.plot(df.index, df['EMA_50'], color=self.colors['ema_50'], 
                   linewidth=2, label='EMA 50', alpha=0.8)
            ax.plot(df.index, df['EMA_200'], color=self.colors['ema_200'], 
                   linewidth=2, label='EMA 200', alpha=0.8)
            
            # Bollinger Bands
            ax.fill_between(df.index, df['BB_Upper'], df['BB_Lower'], 
                           color=self.colors['bollinger'], alpha=0.1, label='Bollinger Bands')
            ax.plot(df.index, df['BB_Upper'], color=self.colors['bollinger'], 
                   linewidth=1, alpha=0.5)
            ax.plot(df.index, df['BB_Lower'], color=self.colors['bollinger'], 
                   linewidth=1, alpha=0.5)
            
            # Legend
            ax.legend(loc='upper left', fontsize=10)
            
        except Exception as e:
            print(f"Teknik indikatör çizim hatası: {e}")
    
    def _plot_volume(self, ax, df: pd.DataFrame) -> None:
        """
        Hacim grafiğini çizer
        """
        try:
            # Hacim renkleri (bullish/bearish)
            colors = np.where(df['Close'] >= df['Open'], self.colors['bullish'], self.colors['bearish'])
            
            ax.bar(df.index, df['Volume'], color=colors, alpha=0.7, label='Hacim')
            ax.plot(df.index, df['Volume_MA_20'], color=self.colors['volume'], 
                   linewidth=2, label='Hacim MA 20')
            
            ax.set_ylabel('Hacim', fontsize=12)
            ax.legend(loc='upper left', fontsize=10)
            ax.grid(True, alpha=0.3)
            
        except Exception as e:
            print(f"Hacim çizim hatası: {e}")
    
    def _plot_rsi(self, ax, df: pd.DataFrame) -> None:
        """
        RSI grafiğini çizer
        """
        try:
            ax.plot(df.index, df['RSI'], color=self.colors['rsi'], linewidth=2, label='RSI')
            
            # RSI seviyeleri
            ax.axhline(y=70, color='red', linestyle='--', alpha=0.7, label='Aşırı Alım (70)')
            ax.axhline(y=30, color='green', linestyle='--', alpha=0.7, label='Aşırı Satım (30)')
            ax.axhline(y=50, color='gray', linestyle='-', alpha=0.5, label='Nötr (50)')
            
            ax.set_ylabel('RSI', fontsize=12)
            ax.set_ylim(0, 100)
            ax.legend(loc='upper left', fontsize=10)
            ax.grid(True, alpha=0.3)
            
        except Exception as e:
            print(f"RSI çizim hatası: {e}")
    
    def _plot_macd(self, ax, df: pd.DataFrame) -> None:
        """
        MACD grafiğini çizer
        """
        try:
            ax.plot(df.index, df['MACD'], color=self.colors['macd'], linewidth=2, label='MACD')
            ax.plot(df.index, df['MACD_Signal'], color='orange', linewidth=2, label='MACD Signal')
            
            # MACD histogram
            colors = np.where(df['MACD_Hist'] >= 0, self.colors['bullish'], self.colors['bearish'])
            ax.bar(df.index, df['MACD_Hist'], color=colors, alpha=0.7, label='MACD Histogram')
            
            ax.set_ylabel('MACD', fontsize=12)
            ax.legend(loc='upper left', fontsize=10)
            ax.grid(True, alpha=0.3)
            
        except Exception as e:
            print(f"MACD çizim hatası: {e}")
    
    def _detect_and_plot_patterns(self, ax, df: pd.DataFrame) -> None:
        """
        Candlestick formasyonlarını tespit eder ve çizer
        """
        try:
            patterns = []
            
            # Bullish Engulfing
            bullish_engulfing = ta.candlestick.CDLENGULFING(df['Open'].values, df['High'].values, 
                                                  df['Low'].values, df['Close'].values)
            
            # Morning Star
            morning_star = ta.candlestick.CDLMORNINGSTAR(df['Open'].values, df['High'].values, 
                                               df['Low'].values, df['Close'].values)
            
            # Hammer
            hammer = ta.candlestick.CDLHAMMER(df['Open'].values, df['High'].values, 
                                   df['Low'].values, df['Close'].values)
            
            # Doji
            doji = ta.candlestick.CDLDOJI(df['Open'].values, df['High'].values, 
                                df['Low'].values, df['Close'].values)
            
            # Pattern tespiti ve işaretleme
            for i in range(len(df)):
                if bullish_engulfing[i] > 0:
                    ax.annotate('🟢', xy=(df.index[i], df['Low'].iloc[i]), 
                               xytext=(0, -20), textcoords='offset points',
                               ha='center', fontsize=16, color='green')
                    patterns.append(f"Bullish Engulfing - {df.index[i].strftime('%d/%m')}")
                
                elif morning_star[i] > 0:
                    ax.annotate('⭐', xy=(df.index[i], df['Low'].iloc[i]), 
                               xytext=(0, -20), textcoords='offset points',
                               ha='center', fontsize=16, color='orange')
                    patterns.append(f"Morning Star - {df.index[i].strftime('%d/%m')}")
                
                elif hammer[i] > 0:
                    ax.annotate('🔨', xy=(df.index[i], df['Low'].iloc[i]), 
                               xytext=(0, -20), textcoords='offset points',
                               ha='center', fontsize=16, color='blue')
                    patterns.append(f"Hammer - {df.index[i].strftime('%d/%m')}")
                
                elif doji[i] != 0:
                    ax.annotate('➕', xy=(df.index[i], df['Low'].iloc[i]), 
                               xytext=(0, -20), textcoords='offset points',
                               ha='center', fontsize=16, color='purple')
                    patterns.append(f"Doji - {df.index[i].strftime('%d/%m')}")
            
            # Pattern listesi
            if patterns:
                pattern_text = '\n'.join(patterns[:5])  # İlk 5 pattern
                ax.text(0.02, 0.98, f"Tespit Edilen Formasyonlar:\n{pattern_text}", 
                       transform=ax.transAxes, fontsize=10, verticalalignment='top',
                       bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
            
        except Exception as e:
            print(f"Formasyon tespit hatası: {e}")
    
    def create_support_resistance_chart(self, data: pd.DataFrame, symbol: str, 
                                      save_path: str = None) -> None:
        """
        Support/Resistance seviyeleri grafiği
        """
        try:
            df = data.copy()
            
            # Grafik
            fig, ax = plt.subplots(figsize=(16, 8))
            
            # Fiyat grafiği
            ax.plot(df.index, df['Close'], color='blue', linewidth=2, label='Kapanış Fiyatı')
            
            # Support/Resistance seviyeleri
            support_levels = self._find_support_levels(df)
            resistance_levels = self._find_resistance_levels(df)
            
            # Support seviyeleri
            for level in support_levels:
                ax.axhline(y=level, color='green', linestyle='--', alpha=0.7, 
                          label=f'Support: {level:.2f}')
            
            # Resistance seviyeleri
            for level in resistance_levels:
                ax.axhline(y=level, color='red', linestyle='--', alpha=0.7, 
                          label=f'Resistance: {level:.2f}')
            
            # Grafik düzeni
            ax.set_title(f'{symbol} - Support/Resistance Seviyeleri', fontsize=16, fontweight='bold')
            ax.set_ylabel('Fiyat (TL)', fontsize=12)
            ax.legend(loc='upper left', fontsize=10)
            ax.grid(True, alpha=0.3)
            
            # Tarih formatı
            ax.xaxis.set_major_formatter(mdates.DateFormatter('%d/%m'))
            ax.xaxis.set_major_locator(mdates.WeekdayLocator(interval=1))
            plt.setp(ax.xaxis.get_majorticklabels(), rotation=45)
            
            plt.tight_layout()
            
            # Kaydet
            if save_path:
                plt.savefig(save_path, dpi=300, bbox_inches='tight')
                print(f"📊 Support/Resistance grafiği kaydedildi: {save_path}")
            
            plt.show()
            
        except Exception as e:
            print(f"Support/Resistance grafik hatası: {e}")
    
    def _find_support_levels(self, df: pd.DataFrame, window: int = 20) -> list:
        """
        Support seviyelerini bulur
        """
        try:
            support_levels = []
            
            for i in range(window, len(df) - window):
                if (df['Low'].iloc[i] == df['Low'].iloc[i-window:i+window+1].min() and
                    df['Low'].iloc[i] < df['Low'].iloc[i-1] and 
                    df['Low'].iloc[i] < df['Low'].iloc[i+1]):
                    support_levels.append(df['Low'].iloc[i])
            
            # Benzersiz seviyeler
            return sorted(list(set(support_levels)))
            
        except Exception as e:
            return []
    
    def _find_resistance_levels(self, df: pd.DataFrame, window: int = 20) -> list:
        """
        Resistance seviyelerini bulur
        """
        try:
            resistance_levels = []
            
            for i in range(window, len(df) - window):
                if (df['High'].iloc[i] == df['High'].iloc[i-window:i+window+1].max() and
                    df['High'].iloc[i] > df['High'].iloc[i-1] and 
                    df['High'].iloc[i] > df['High'].iloc[i+1]):
                    resistance_levels.append(df['High'].iloc[i])
            
            # Benzersiz seviyeler
            return sorted(list(set(resistance_levels)))
            
        except Exception as e:
            return []
    
    def create_comprehensive_analysis(self, symbol: str, period: str = "6mo", 
                                    save_dir: str = "charts") -> None:
        """
        Kapsamlı analiz - tüm grafikleri oluşturur
        """
        try:
            print(f"🔍 {symbol} için kapsamlı analiz başlatılıyor...")
            
            # Veri çek
            data = self.get_stock_data(symbol, period)
            if data.empty:
                print(f"❌ {symbol} için veri bulunamadı")
                return
            
            print(f"✅ Veri çekildi: {len(data)} gün")
            
            # Klasör oluştur
            import os
            if not os.path.exists(save_dir):
                os.makedirs(save_dir)
            
            # 1. Candlestick grafiği
            print("📊 Candlestick grafiği oluşturuluyor...")
            candlestick_path = f"{save_dir}/{symbol}_candlestick.png"
            self.create_candlestick_chart(data, symbol, save_path=candlestick_path)
            
            # 2. Support/Resistance grafiği
            print("📈 Support/Resistance grafiği oluşturuluyor...")
            sr_path = f"{save_dir}/{symbol}_support_resistance.png"
            self.create_support_resistance_chart(data, symbol, save_path=sr_path)
            
            print(f"✅ {symbol} analizi tamamlandı!")
            print(f"📁 Grafikler kaydedildi: {save_dir}/")
            
        except Exception as e:
            print(f"Kapsamlı analiz hatası: {e}")

# Test fonksiyonu
if __name__ == "__main__":
    # Visual analyzer'ı başlat
    analyzer = VisualAnalyzer()
    
    print("🎨 Görsel Analiz Paneli Testi:")
    print("=" * 50)
    
    # Test hissesi
    symbol = "SISE.IS"
    
    # Kapsamlı analiz
    analyzer.create_comprehensive_analysis(symbol, period="3mo")
