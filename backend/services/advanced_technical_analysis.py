#!/usr/bin/env python3
"""
Gelişmiş Teknik Analiz Sistemi
TradingView benzeri 50+ teknik gösterge
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
import talib
from datetime import datetime, timedelta
import yfinance as yf

class AdvancedTechnicalAnalysis:
    def __init__(self):
        self.indicators = {
            # Trend Indicators
            "sma": self._calculate_sma,
            "ema": self._calculate_ema,
            "wma": self._calculate_wma,
            "dema": self._calculate_dema,
            "tema": self._calculate_tema,
            "trima": self._calculate_trima,
            "kama": self._calculate_kama,
            "mama": self._calculate_mama,
            "macd": self._calculate_macd,
            "macdext": self._calculate_macdext,
            "macdfix": self._calculate_macdfix,
            "apo": self._calculate_apo,
            "ppo": self._calculate_ppo,
            "aroon": self._calculate_aroon,
            "aroonosc": self._calculate_aroonosc,
            "cci": self._calculate_cci,
            "dx": self._calculate_dx,
            "minus_di": self._calculate_minus_di,
            "plus_di": self._calculate_plus_di,
            "minus_dm": self._calculate_minus_dm,
            "plus_dm": self._calculate_plus_dm,
            "willr": self._calculate_willr,
            "adx": self._calculate_adx,
            "adxr": self._calculate_adxr,
            "mfi": self._calculate_mfi,
            "sar": self._calculate_sar,
            "sarext": self._calculate_sarext,
            "trange": self._calculate_trange,
            "natr": self._calculate_natr,
            "atr": self._calculate_atr,
            
            # Momentum Indicators
            "rsi": self._calculate_rsi,
            "stoch": self._calculate_stoch,
            "stochf": self._calculate_stochf,
            "stochrsi": self._calculate_stochrsi,
            "ultosc": self._calculate_ultosc,
            "roc": self._calculate_roc,
            "rocp": self._calculate_rocp,
            "rocr": self._calculate_rocr,
            "mom": self._calculate_mom,
            "bop": self._calculate_bop,
            
            # Volume Indicators
            "ad": self._calculate_ad,
            "adosc": self._calculate_adosc,
            "obv": self._calculate_obv,
            
            # Volatility Indicators
            "bbands": self._calculate_bbands,
            "natr": self._calculate_natr,
            "trange": self._calculate_trange,
            "atr": self._calculate_atr,
            
            # Price Transform
            "avgprice": self._calculate_avgprice,
            "medprice": self._calculate_medprice,
            "typprice": self._calculate_typprice,
            "wclprice": self._calculate_wclprice,
            
            # Cycle Indicators
            "ht_dcperiod": self._calculate_ht_dcperiod,
            "ht_dcphase": self._calculate_ht_dcphase,
            "ht_phasor": self._calculate_ht_phasor,
            "ht_sine": self._calculate_ht_sine,
            "ht_trendmode": self._calculate_ht_trendmode,
            
            # Pattern Recognition
            "cdl2crows": self._calculate_cdl2crows,
            "cdl3blackcrows": self._calculate_cdl3blackcrows,
            "cdl3inside": self._calculate_cdl3inside,
            "cdl3linestrike": self._calculate_cdl3linestrike,
            "cdl3outside": self._calculate_cdl3outside,
            "cdl3starsinsouth": self._calculate_cdl3starsinsouth,
            "cdl3whitesoldiers": self._calculate_cdl3whitesoldiers,
            "cdlabandonedbaby": self._calculate_cdlabandonedbaby,
            "cdladvanceblock": self._calculate_cdladvanceblock,
            "cdlbelthold": self._calculate_cdlbelthold,
            "cdlbreakaway": self._calculate_cdlbreakaway,
            "cdlclosingmarubozu": self._calculate_cdlclosingmarubozu,
            "cdlconcealbabyswall": self._calculate_cdlconcealbabyswall,
            "cdlcounterattack": self._calculate_cdlcounterattack,
            "cdldarkcloudcover": self._calculate_cdldarkcloudcover,
            "cdldoji": self._calculate_cdldoji,
            "cdldojistar": self._calculate_cdldojistar,
            "cdldragonflydoji": self._calculate_cdldragonflydoji,
            "cdlengulfing": self._calculate_cdlengulfing,
            "cdleveningdojistar": self._calculate_cdleveningdojistar,
            "cdleveningstar": self._calculate_cdleveningstar,
            "cdlgapsidesidewhite": self._calculate_cdlgapsidesidewhite,
            "cdlgravestonedoji": self._calculate_cdlgravestonedoji,
            "cdlhammer": self._calculate_cdlhammer,
            "cdlhangingman": self._calculate_cdlhangingman,
            "cdlharami": self._calculate_cdlharami,
            "cdlharamicross": self._calculate_cdlharamicross,
            "cdlhighwave": self._calculate_cdlhighwave,
            "cdlhikkake": self._calculate_cdlhikkake,
            "cdlhikkakemod": self._calculate_cdlhikkakemod,
            "cdlhomingpigeon": self._calculate_cdlhomingpigeon,
            "cdlidentical3crows": self._calculate_cdlidentical3crows,
            "cdlinneck": self._calculate_cdlinneck,
            "cdlinvertedhammer": self._calculate_cdlinvertedhammer,
            "cdlkicking": self._calculate_cdlkicking,
            "cdlkickingbylength": self._calculate_cdlkickingbylength,
            "cdlladderbottom": self._calculate_cdlladderbottom,
            "cdllongleggeddoji": self._calculate_cdllongleggeddoji,
            "cdllongline": self._calculate_cdllongline,
            "cdlmarubozu": self._calculate_cdlmarubozu,
            "cdlmatchinglow": self._calculate_cdlmatchinglow,
            "cdlmathold": self._calculate_cdlmathold,
            "cdlmorningdojistar": self._calculate_cdlmorningdojistar,
            "cdlmorningstar": self._calculate_cdlmorningstar,
            "cdlonneck": self._calculate_cdlonneck,
            "cdlpiercing": self._calculate_cdlpiercing,
            "cdlrickshawman": self._calculate_cdlrickshawman,
            "cdlrisefall3methods": self._calculate_cdlrisefall3methods,
            "cdlseparatinglines": self._calculate_cdlseparatinglines,
            "cdlshootingstar": self._calculate_cdlshootingstar,
            "cdlshortline": self._calculate_cdlshortline,
            "cdlspinningtop": self._calculate_cdlspinningtop,
            "cdlstalledpattern": self._calculate_cdlstalledpattern,
            "cdlsticksandwich": self._calculate_cdlsticksandwich,
            "cdltakuri": self._calculate_cdltakuri,
            "cdltasukigap": self._calculate_cdltasukigap,
            "cdlthrusting": self._calculate_cdlthrusting,
            "cdltristar": self._calculate_cdltristar,
            "cdlunique3river": self._calculate_cdlunique3river,
            "cdlupsidegap2crows": self._calculate_cdlupsidegap2crows,
            "cdlxsidegap3methods": self._calculate_cdlxsidegap3methods,
        }
    
    def get_stock_data(self, symbol: str, period: str = "1y") -> pd.DataFrame:
        """Hisse verilerini getir"""
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period)
            return data
        except Exception as e:
            print(f"Veri çekme hatası {symbol}: {e}")
            return pd.DataFrame()
    
    def calculate_all_indicators(self, symbol: str, period: str = "1y") -> Dict:
        """Tüm teknik göstergeleri hesapla"""
        data = self.get_stock_data(symbol, period)
        if data.empty:
            return {"error": "Veri bulunamadı"}
        
        results = {}
        
        # OHLCV verilerini hazırla
        high = data['High'].values
        low = data['Low'].values
        close = data['Close'].values
        volume = data['Volume'].values
        open_price = data['Open'].values
        
        # Her göstergeyi hesapla
        for indicator_name, indicator_func in self.indicators.items():
            try:
                if indicator_name.startswith('cdl'):
                    # Candlestick pattern'lar için özel parametreler
                    result = indicator_func(open_price, high, low, close)
                else:
                    result = indicator_func(close, high, low, volume)
                
                if result is not None:
                    results[indicator_name] = result
            except Exception as e:
                print(f"Gösterge hesaplama hatası {indicator_name}: {e}")
                continue
        
        # Son değerleri al
        latest_values = {}
        for indicator, values in results.items():
            if isinstance(values, tuple):
                # Tuple dönen göstergeler için
                latest_values[indicator] = [v[-1] if len(v) > 0 else None for v in values]
            elif isinstance(values, np.ndarray):
                latest_values[indicator] = values[-1] if len(values) > 0 else None
            else:
                latest_values[indicator] = values
        
        return {
            "symbol": symbol,
            "period": period,
            "indicators": latest_values,
            "full_data": results,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_trading_signals(self, symbol: str) -> Dict:
        """Trading sinyalleri üret"""
        data = self.get_stock_data(symbol, "3mo")
        if data.empty:
            return {"error": "Veri bulunamadı"}
        
        close = data['Close'].values
        high = data['High'].values
        low = data['Low'].values
        volume = data['Volume'].values
        
        signals = {}
        
        # RSI sinyali
        rsi = talib.RSI(close, timeperiod=14)
        if len(rsi) > 0:
            current_rsi = rsi[-1]
            if current_rsi < 30:
                signals["rsi"] = {"signal": "BUY", "strength": "strong", "value": current_rsi}
            elif current_rsi > 70:
                signals["rsi"] = {"signal": "SELL", "strength": "strong", "value": current_rsi}
            else:
                signals["rsi"] = {"signal": "HOLD", "strength": "weak", "value": current_rsi}
        
        # MACD sinyali
        macd, macd_signal, macd_hist = talib.MACD(close)
        if len(macd) > 1:
            if macd[-1] > macd_signal[-1] and macd[-2] <= macd_signal[-2]:
                signals["macd"] = {"signal": "BUY", "strength": "medium", "value": macd[-1]}
            elif macd[-1] < macd_signal[-1] and macd[-2] >= macd_signal[-2]:
                signals["macd"] = {"signal": "SELL", "strength": "medium", "value": macd[-1]}
            else:
                signals["macd"] = {"signal": "HOLD", "strength": "weak", "value": macd[-1]}
        
        # Bollinger Bands sinyali
        bb_upper, bb_middle, bb_lower = talib.BBANDS(close)
        if len(bb_upper) > 0:
            current_price = close[-1]
            if current_price <= bb_lower[-1]:
                signals["bbands"] = {"signal": "BUY", "strength": "medium", "value": current_price}
            elif current_price >= bb_upper[-1]:
                signals["bbands"] = {"signal": "SELL", "strength": "medium", "value": current_price}
            else:
                signals["bbands"] = {"signal": "HOLD", "strength": "weak", "value": current_price}
        
        # Stochastic sinyali
        stoch_k, stoch_d = talib.STOCH(high, low, close)
        if len(stoch_k) > 0:
            if stoch_k[-1] < 20 and stoch_d[-1] < 20:
                signals["stoch"] = {"signal": "BUY", "strength": "medium", "value": stoch_k[-1]}
            elif stoch_k[-1] > 80 and stoch_d[-1] > 80:
                signals["stoch"] = {"signal": "SELL", "strength": "medium", "value": stoch_k[-1]}
            else:
                signals["stoch"] = {"signal": "HOLD", "strength": "weak", "value": stoch_k[-1]}
        
        # Genel sinyal skoru
        buy_signals = sum(1 for s in signals.values() if s["signal"] == "BUY")
        sell_signals = sum(1 for s in signals.values() if s["signal"] == "SELL")
        
        if buy_signals > sell_signals:
            overall_signal = "BUY"
            confidence = min(0.9, buy_signals / len(signals))
        elif sell_signals > buy_signals:
            overall_signal = "SELL"
            confidence = min(0.9, sell_signals / len(signals))
        else:
            overall_signal = "HOLD"
            confidence = 0.5
        
        return {
            "symbol": symbol,
            "overall_signal": overall_signal,
            "confidence": round(confidence, 2),
            "signals": signals,
            "timestamp": datetime.now().isoformat()
        }
    
    # Trend Indicators
    def _calculate_sma(self, close, high=None, low=None, volume=None, period=20):
        return talib.SMA(close, timeperiod=period)
    
    def _calculate_ema(self, close, high=None, low=None, volume=None, period=20):
        return talib.EMA(close, timeperiod=period)
    
    def _calculate_wma(self, close, high=None, low=None, volume=None, period=20):
        return talib.WMA(close, timeperiod=period)
    
    def _calculate_dema(self, close, high=None, low=None, volume=None, period=20):
        return talib.DEMA(close, timeperiod=period)
    
    def _calculate_tema(self, close, high=None, low=None, volume=None, period=20):
        return talib.TEMA(close, timeperiod=period)
    
    def _calculate_trima(self, close, high=None, low=None, volume=None, period=20):
        return talib.TRIMA(close, timeperiod=period)
    
    def _calculate_kama(self, close, high=None, low=None, volume=None, period=20):
        return talib.KAMA(close, timeperiod=period)
    
    def _calculate_mama(self, close, high=None, low=None, volume=None, period=20):
        return talib.MAMA(close)
    
    def _calculate_macd(self, close, high=None, low=None, volume=None):
        return talib.MACD(close)
    
    def _calculate_macdext(self, close, high=None, low=None, volume=None):
        return talib.MACDEXT(close)
    
    def _calculate_macdfix(self, close, high=None, low=None, volume=None):
        return talib.MACDFIX(close)
    
    def _calculate_apo(self, close, high=None, low=None, volume=None):
        return talib.APO(close)
    
    def _calculate_ppo(self, close, high=None, low=None, volume=None):
        return talib.PPO(close)
    
    def _calculate_aroon(self, close, high=None, low=None, volume=None):
        return talib.AROON(high, low)
    
    def _calculate_aroonosc(self, close, high=None, low=None, volume=None):
        return talib.AROONOSC(high, low)
    
    def _calculate_cci(self, close, high=None, low=None, volume=None):
        return talib.CCI(high, low, close)
    
    def _calculate_dx(self, close, high=None, low=None, volume=None):
        return talib.DX(high, low, close)
    
    def _calculate_minus_di(self, close, high=None, low=None, volume=None):
        return talib.MINUS_DI(high, low, close)
    
    def _calculate_plus_di(self, close, high=None, low=None, volume=None):
        return talib.PLUS_DI(high, low, close)
    
    def _calculate_minus_dm(self, close, high=None, low=None, volume=None):
        return talib.MINUS_DM(high, low)
    
    def _calculate_plus_dm(self, close, high=None, low=None, volume=None):
        return talib.PLUS_DM(high, low)
    
    def _calculate_willr(self, close, high=None, low=None, volume=None):
        return talib.WILLR(high, low, close)
    
    def _calculate_adx(self, close, high=None, low=None, volume=None):
        return talib.ADX(high, low, close)
    
    def _calculate_adxr(self, close, high=None, low=None, volume=None):
        return talib.ADXR(high, low, close)
    
    def _calculate_mfi(self, close, high=None, low=None, volume=None):
        return talib.MFI(high, low, close, volume)
    
    def _calculate_sar(self, close, high=None, low=None, volume=None):
        return talib.SAR(high, low)
    
    def _calculate_sarext(self, close, high=None, low=None, volume=None):
        return talib.SAREXT(high, low)
    
    def _calculate_trange(self, close, high=None, low=None, volume=None):
        return talib.TRANGE(high, low, close)
    
    def _calculate_natr(self, close, high=None, low=None, volume=None):
        return talib.NATR(high, low, close)
    
    def _calculate_atr(self, close, high=None, low=None, volume=None):
        return talib.ATR(high, low, close)
    
    # Momentum Indicators
    def _calculate_rsi(self, close, high=None, low=None, volume=None):
        return talib.RSI(close)
    
    def _calculate_stoch(self, close, high=None, low=None, volume=None):
        return talib.STOCH(high, low, close)
    
    def _calculate_stochf(self, close, high=None, low=None, volume=None):
        return talib.STOCHF(high, low, close)
    
    def _calculate_stochrsi(self, close, high=None, low=None, volume=None):
        return talib.STOCHRSI(close)
    
    def _calculate_ultosc(self, close, high=None, low=None, volume=None):
        return talib.ULTOSC(high, low, close)
    
    def _calculate_roc(self, close, high=None, low=None, volume=None):
        return talib.ROC(close)
    
    def _calculate_rocp(self, close, high=None, low=None, volume=None):
        return talib.ROCP(close)
    
    def _calculate_rocr(self, close, high=None, low=None, volume=None):
        return talib.ROCR(close)
    
    def _calculate_mom(self, close, high=None, low=None, volume=None):
        return talib.MOM(close)
    
    def _calculate_bop(self, close, high=None, low=None, volume=None):
        return talib.BOP(open_price, high, low, close)
    
    # Volume Indicators
    def _calculate_ad(self, close, high=None, low=None, volume=None):
        return talib.AD(high, low, close, volume)
    
    def _calculate_adosc(self, close, high=None, low=None, volume=None):
        return talib.ADOSC(high, low, close, volume)
    
    def _calculate_obv(self, close, high=None, low=None, volume=None):
        return talib.OBV(close, volume)
    
    # Volatility Indicators
    def _calculate_bbands(self, close, high=None, low=None, volume=None):
        return talib.BBANDS(close)
    
    # Price Transform
    def _calculate_avgprice(self, close, high=None, low=None, volume=None):
        return talib.AVGPRICE(open_price, high, low, close)
    
    def _calculate_medprice(self, close, high=None, low=None, volume=None):
        return talib.MEDPRICE(high, low)
    
    def _calculate_typprice(self, close, high=None, low=None, volume=None):
        return talib.TYPPRICE(high, low, close)
    
    def _calculate_wclprice(self, close, high=None, low=None, volume=None):
        return talib.WCLPRICE(high, low, close)
    
    # Cycle Indicators
    def _calculate_ht_dcperiod(self, close, high=None, low=None, volume=None):
        return talib.HT_DCPERIOD(close)
    
    def _calculate_ht_dcphase(self, close, high=None, low=None, volume=None):
        return talib.HT_DCPHASE(close)
    
    def _calculate_ht_phasor(self, close, high=None, low=None, volume=None):
        return talib.HT_PHASOR(close)
    
    def _calculate_ht_sine(self, close, high=None, low=None, volume=None):
        return talib.HT_SINE(close)
    
    def _calculate_ht_trendmode(self, close, high=None, low=None, volume=None):
        return talib.HT_TRENDMODE(close)
    
    # Pattern Recognition (Candlestick Patterns)
    def _calculate_cdl2crows(self, open_price, high, low, close):
        return talib.CDL2CROWS(open_price, high, low, close)
    
    def _calculate_cdl3blackcrows(self, open_price, high, low, close):
        return talib.CDL3BLACKCROWS(open_price, high, low, close)
    
    def _calculate_cdl3inside(self, open_price, high, low, close):
        return talib.CDL3INSIDE(open_price, high, low, close)
    
    def _calculate_cdl3linestrike(self, open_price, high, low, close):
        return talib.CDL3LINESTRIKE(open_price, high, low, close)
    
    def _calculate_cdl3outside(self, open_price, high, low, close):
        return talib.CDL3OUTSIDE(open_price, high, low, close)
    
    def _calculate_cdl3starsinsouth(self, open_price, high, low, close):
        return talib.CDL3STARSINSOUTH(open_price, high, low, close)
    
    def _calculate_cdl3whitesoldiers(self, open_price, high, low, close):
        return talib.CDL3WHITESOLDIERS(open_price, high, low, close)
    
    def _calculate_cdlabandonedbaby(self, open_price, high, low, close):
        return talib.CDLABANDONEDBABY(open_price, high, low, close)
    
    def _calculate_cdladvanceblock(self, open_price, high, low, close):
        return talib.CDLADVANCEBLOCK(open_price, high, low, close)
    
    def _calculate_cdlbelthold(self, open_price, high, low, close):
        return talib.CDLBELTHOLD(open_price, high, low, close)
    
    def _calculate_cdlbreakaway(self, open_price, high, low, close):
        return talib.CDLBREAKAWAY(open_price, high, low, close)
    
    def _calculate_cdlclosingmarubozu(self, open_price, high, low, close):
        return talib.CDLCLOSINGMARUBOZU(open_price, high, low, close)
    
    def _calculate_cdlconcealbabyswall(self, open_price, high, low, close):
        return talib.CDLCONCEALBABYSWALL(open_price, high, low, close)
    
    def _calculate_cdlcounterattack(self, open_price, high, low, close):
        return talib.CDLCOUNTERATTACK(open_price, high, low, close)
    
    def _calculate_cdldarkcloudcover(self, open_price, high, low, close):
        return talib.CDLDARKCLOUDCOVER(open_price, high, low, close)
    
    def _calculate_cdldoji(self, open_price, high, low, close):
        return talib.CDLDOJI(open_price, high, low, close)
    
    def _calculate_cdldojistar(self, open_price, high, low, close):
        return talib.CDLDOJISTAR(open_price, high, low, close)
    
    def _calculate_cdldragonflydoji(self, open_price, high, low, close):
        return talib.CDLDRAGONFLYDOJI(open_price, high, low, close)
    
    def _calculate_cdlengulfing(self, open_price, high, low, close):
        return talib.CDLENGULFING(open_price, high, low, close)
    
    def _calculate_cdleveningdojistar(self, open_price, high, low, close):
        return talib.CDLEVENINGDOJISTAR(open_price, high, low, close)
    
    def _calculate_cdleveningstar(self, open_price, high, low, close):
        return talib.CDLEVENINGSTAR(open_price, high, low, close)
    
    def _calculate_cdlgapsidesidewhite(self, open_price, high, low, close):
        return talib.CDLGAPSIDESIDEWHITE(open_price, high, low, close)
    
    def _calculate_cdlgravestonedoji(self, open_price, high, low, close):
        return talib.CDLGRAVESTONEDOJI(open_price, high, low, close)
    
    def _calculate_cdlhammer(self, open_price, high, low, close):
        return talib.CDLHAMMER(open_price, high, low, close)
    
    def _calculate_cdlhangingman(self, open_price, high, low, close):
        return talib.CDLHANGINGMAN(open_price, high, low, close)
    
    def _calculate_cdlharami(self, open_price, high, low, close):
        return talib.CDLHARAMI(open_price, high, low, close)
    
    def _calculate_cdlharamicross(self, open_price, high, low, close):
        return talib.CDLHARAMICROSS(open_price, high, low, close)
    
    def _calculate_cdlhighwave(self, open_price, high, low, close):
        return talib.CDLHIGHWAVE(open_price, high, low, close)
    
    def _calculate_cdlhikkake(self, open_price, high, low, close):
        return talib.CDLHIKKAKE(open_price, high, low, close)
    
    def _calculate_cdlhikkakemod(self, open_price, high, low, close):
        return talib.CDLHIKKAKEMOD(open_price, high, low, close)
    
    def _calculate_cdlhomingpigeon(self, open_price, high, low, close):
        return talib.CDLHOMINGPIGEON(open_price, high, low, close)
    
    def _calculate_cdlidentical3crows(self, open_price, high, low, close):
        return talib.CDLIDENTICAL3CROWS(open_price, high, low, close)
    
    def _calculate_cdlinneck(self, open_price, high, low, close):
        return talib.CDLINNECK(open_price, high, low, close)
    
    def _calculate_cdlinvertedhammer(self, open_price, high, low, close):
        return talib.CDLINVERTEDHAMMER(open_price, high, low, close)
    
    def _calculate_cdlkicking(self, open_price, high, low, close):
        return talib.CDLKICKING(open_price, high, low, close)
    
    def _calculate_cdlkickingbylength(self, open_price, high, low, close):
        return talib.CDLKICKINGBYLENGTH(open_price, high, low, close)
    
    def _calculate_cdlladderbottom(self, open_price, high, low, close):
        return talib.CDLLADDERBOTTOM(open_price, high, low, close)
    
    def _calculate_cdllongleggeddoji(self, open_price, high, low, close):
        return talib.CDLLONGLEGGEDDOJI(open_price, high, low, close)
    
    def _calculate_cdllongline(self, open_price, high, low, close):
        return talib.CDLLONGLINE(open_price, high, low, close)
    
    def _calculate_cdlmarubozu(self, open_price, high, low, close):
        return talib.CDLMARUBOZU(open_price, high, low, close)
    
    def _calculate_cdlmatchinglow(self, open_price, high, low, close):
        return talib.CDLMATCHINGLOW(open_price, high, low, close)
    
    def _calculate_cdlmathold(self, open_price, high, low, close):
        return talib.CDLMATHOLD(open_price, high, low, close)
    
    def _calculate_cdlmorningdojistar(self, open_price, high, low, close):
        return talib.CDLMORNINGDOJISTAR(open_price, high, low, close)
    
    def _calculate_cdlmorningstar(self, open_price, high, low, close):
        return talib.CDLMORNINGSTAR(open_price, high, low, close)
    
    def _calculate_cdlonneck(self, open_price, high, low, close):
        return talib.CDLONNECK(open_price, high, low, close)
    
    def _calculate_cdlpiercing(self, open_price, high, low, close):
        return talib.CDLPIERCING(open_price, high, low, close)
    
    def _calculate_cdlrickshawman(self, open_price, high, low, close):
        return talib.CDLRICKSHAWMAN(open_price, high, low, close)
    
    def _calculate_cdlrisefall3methods(self, open_price, high, low, close):
        return talib.CDLRISEFALL3METHODS(open_price, high, low, close)
    
    def _calculate_cdlseparatinglines(self, open_price, high, low, close):
        return talib.CDLSEPARATINGLINES(open_price, high, low, close)
    
    def _calculate_cdlshootingstar(self, open_price, high, low, close):
        return talib.CDLSHOOTINGSTAR(open_price, high, low, close)
    
    def _calculate_cdlshortline(self, open_price, high, low, close):
        return talib.CDLSHORTLINE(open_price, high, low, close)
    
    def _calculate_cdlspinningtop(self, open_price, high, low, close):
        return talib.CDLSPINNINGTOP(open_price, high, low, close)
    
    def _calculate_cdlstalledpattern(self, open_price, high, low, close):
        return talib.CDLSTALLEDPATTERN(open_price, high, low, close)
    
    def _calculate_cdlsticksandwich(self, open_price, high, low, close):
        return talib.CDLSTICKSANDWICH(open_price, high, low, close)
    
    def _calculate_cdltakuri(self, open_price, high, low, close):
        return talib.CDLTAKURI(open_price, high, low, close)
    
    def _calculate_cdltasukigap(self, open_price, high, low, close):
        return talib.CDLTASUKIGAP(open_price, high, low, close)
    
    def _calculate_cdlthrusting(self, open_price, high, low, close):
        return talib.CDLTHRUSTING(open_price, high, low, close)
    
    def _calculate_cdltristar(self, open_price, high, low, close):
        return talib.CDLTRISTAR(open_price, high, low, close)
    
    def _calculate_cdlunique3river(self, open_price, high, low, close):
        return talib.CDLUNIQUE3RIVER(open_price, high, low, close)
    
    def _calculate_cdlupsidegap2crows(self, open_price, high, low, close):
        return talib.CDLUPSIDEGAP2CROWS(open_price, high, low, close)
    
    def _calculate_cdlxsidegap3methods(self, open_price, high, low, close):
        return talib.CDLXSIDEGAP3METHODS(open_price, high, low, close)

# Global instance
advanced_technical_analysis = AdvancedTechnicalAnalysis()
