#!/usr/bin/env python3
"""
Gerçek zamanlı veri akışı servisi
Finnhub WebSocket + yfinance fallback
"""

import asyncio
import websockets
import json
import yfinance as yf
import pandas as pd
from datetime import datetime
from typing import Dict, List, Optional, Callable
import logging

# BIST hisseleri
BIST_STOCKS = [
    "SISE.IS", "EREGL.IS", "TUPRS.IS", "AKBNK.IS", "GARAN.IS",
    "ISCTR.IS", "THYAO.IS", "KCHOL.IS", "SAHOL.IS", "HALKB.IS",
    "YKBNK.IS", "VAKBN.IS", "TSKB.IS", "ALARK.IS", "ARCLK.IS",
    "PETKM.IS", "PGSUS.IS", "KOZAL.IS", "KOZAA.IS", "BIMAS.IS"
]

# US hisseleri
US_STOCKS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA",
    "META", "NVDA", "NFLX", "AMD", "INTC"
]

class RealtimeDataService:
    def __init__(self, finnhub_token: Optional[str] = None):
        self.finnhub_token = finnhub_token
        self.websocket = None
        self.subscribers: Dict[str, List[Callable]] = {}
        self.last_prices: Dict[str, float] = {}
        self.is_running = False
        
    async def start(self):
        """WebSocket bağlantısını başlat"""
        if self.finnhub_token:
            await self._start_finnhub_websocket()
        else:
            await self._start_fallback_polling()
    
    async def _start_finnhub_websocket(self):
        """Finnhub WebSocket bağlantısı"""
        try:
            uri = f"wss://ws.finnhub.io?token={self.finnhub_token}"
            async with websockets.connect(uri) as websocket:
                self.websocket = websocket
                self.is_running = True
                
                # BIST hisselerini subscribe et
                for symbol in BIST_STOCKS[:10]:  # İlk 10 hisse
                    await websocket.send(json.dumps({
                        "type": "subscribe",
                        "symbol": symbol
                    }))
                
                # US hisselerini subscribe et
                for symbol in US_STOCKS[:10]:  # İlk 10 hisse
                    await websocket.send(json.dumps({
                        "type": "subscribe", 
                        "symbol": symbol
                    }))
                
                # Mesajları dinle
                async for message in websocket:
                    data = json.loads(message)
                    await self._process_websocket_message(data)
                    
        except Exception as e:
            logging.error(f"WebSocket hatası: {e}")
            await self._start_fallback_polling()
    
    async def _start_fallback_polling(self):
        """Fallback: yfinance ile periyodik polling"""
        self.is_running = True
        logging.info("Fallback polling başlatıldı")
        
        while self.is_running:
            try:
                await self._poll_all_stocks()
                await asyncio.sleep(5)  # 5 saniyede bir güncelle
            except Exception as e:
                logging.error(f"Polling hatası: {e}")
                await asyncio.sleep(10)
    
    async def _poll_all_stocks(self):
        """Tüm hisseleri yfinance ile çek"""
        all_stocks = BIST_STOCKS + US_STOCKS
        
        for symbol in all_stocks:
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="1d", interval="1m")
                
                if not hist.empty:
                    current_price = float(hist['Close'].iloc[-1])
                    prev_price = self.last_prices.get(symbol, current_price)
                    
                    # Fiyat değiştiyse bildir
                    if abs(current_price - prev_price) > 0.01:
                        self.last_prices[symbol] = current_price
                        await self._notify_subscribers(symbol, {
                            "symbol": symbol,
                            "price": current_price,
                            "change": current_price - prev_price,
                            "change_percent": ((current_price - prev_price) / prev_price) * 100,
                            "timestamp": datetime.now().isoformat(),
                            "volume": int(hist['Volume'].iloc[-1]) if not hist['Volume'].empty else 0
                        })
                        
            except Exception as e:
                logging.error(f"{symbol} için veri çekme hatası: {e}")
    
    async def _process_websocket_message(self, data: Dict):
        """WebSocket mesajını işle"""
        if data.get("type") == "trade":
            trade_data = data.get("data", [])
            for trade in trade_data:
                symbol = trade.get("s")
                price = trade.get("p")
                volume = trade.get("v")
                
                if symbol and price:
                    await self._notify_subscribers(symbol, {
                        "symbol": symbol,
                        "price": price,
                        "volume": volume,
                        "timestamp": datetime.now().isoformat(),
                        "source": "websocket"
                    })
    
    async def _notify_subscribers(self, symbol: str, data: Dict):
        """Aboneleri bilgilendir"""
        if symbol in self.subscribers:
            for callback in self.subscribers[symbol]:
                try:
                    await callback(data)
                except Exception as e:
                    logging.error(f"Subscriber callback hatası: {e}")
    
    def subscribe(self, symbol: str, callback: Callable):
        """Sembol için abone ol"""
        if symbol not in self.subscribers:
            self.subscribers[symbol] = []
        self.subscribers[symbol].append(callback)
    
    def unsubscribe(self, symbol: str, callback: Callable):
        """Abonelikten çık"""
        if symbol in self.subscribers:
            if callback in self.subscribers[symbol]:
                self.subscribers[symbol].remove(callback)
    
    async def stop(self):
        """Servisi durdur"""
        self.is_running = False
        if self.websocket:
            await self.websocket.close()

# Global instance
realtime_service = RealtimeDataService()

async def get_realtime_price(symbol: str) -> Optional[Dict]:
    """Gerçek zamanlı fiyat al"""
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="1d", interval="1m")
        
        if not hist.empty:
            return {
                "symbol": symbol,
                "price": float(hist['Close'].iloc[-1]),
                "volume": int(hist['Volume'].iloc[-1]) if not hist['Volume'].empty else 0,
                "timestamp": datetime.now().isoformat(),
                "source": "yfinance"
            }
    except Exception as e:
        logging.error(f"Gerçek zamanlı fiyat hatası: {e}")
    
    return None

async def get_multiple_prices(symbols: List[str]) -> Dict[str, Dict]:
    """Birden fazla sembolün fiyatını al"""
    results = {}
    
    for symbol in symbols:
        price_data = await get_realtime_price(symbol)
        if price_data:
            results[symbol] = price_data
    
    return results

if __name__ == "__main__":
    # Test
    async def test_callback(data):
        print(f"📊 {data['symbol']}: {data['price']}")
    
    async def main():
        # Test aboneliği
        realtime_service.subscribe("AAPL", test_callback)
        realtime_service.subscribe("SISE.IS", test_callback)
        
        # Servisi başlat
        await realtime_service.start()
    
    asyncio.run(main())
