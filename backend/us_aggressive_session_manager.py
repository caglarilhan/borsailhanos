"""
US Aggressive Profile - Canlı Seans Zamanlayıcı ve Devre Kesici Sistemi
$100 -> $1000 hedefi için özel optimizasyon
"""

import asyncio
import logging
import os
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json
import threading
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class SessionState(Enum):
    PRE_MARKET = "pre_market"
    MARKET_OPEN = "market_open"
    MARKET_CLOSE = "market_close"
    AFTER_HOURS = "after_hours"
    CLOSED = "closed"

class CircuitBreakerState(Enum):
    CLOSED = "closed"  # Normal işlem
    OPEN = "open"      # Devre kesici açık, işlem durduruldu
    HALF_OPEN = "half_open"  # Test modu

@dataclass
class SessionConfig:
    """Seans konfigürasyonu"""
    pre_market_start: str = "04:00"  # EST
    market_open: str = "09:30"       # EST
    market_close: str = "16:00"      # EST
    after_hours_end: str = "20:00"   # EST
    timezone: str = "US/Eastern"
    
    # Agresif profil parametreleri
    target_daily_return: float = 0.15  # %15 günlük hedef
    max_daily_loss: float = 0.05        # %5 maksimum günlük kayıp
    position_size_pct: float = 0.25    # %25 pozisyon büyüklüğü
    max_positions: int = 5              # Maksimum 5 pozisyon
    
    # Devre kesici parametreleri
    loss_threshold_pct: float = 0.03    # %3 kayıp sonrası devre kesici
    consecutive_losses: int = 3          # 3 ardışık kayıp sonrası durdur
    volatility_threshold: float = 0.05  # %5 volatilite üzeri risk

@dataclass
class TradingSession:
    """Aktif trading seansı"""
    session_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    initial_capital: float = 100.0
    current_capital: float = 100.0
    target_capital: float = 1000.0
    daily_pnl: float = 0.0
    total_trades: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    max_drawdown: float = 0.0
    circuit_breaker_state: CircuitBreakerState = CircuitBreakerState.CLOSED
    active_positions: List[str] = None
    
    def __post_init__(self):
        if self.active_positions is None:
            self.active_positions = []

class USAggressiveSessionManager:
    """US Agresif Profil Seans Yöneticisi"""
    
    def __init__(self, config: Optional[SessionConfig] = None):
        self.config = config or SessionConfig()
        self.current_session: Optional[TradingSession] = None
        self.session_history: List[TradingSession] = []
        self.circuit_breaker_state = CircuitBreakerState.CLOSED
        self.circuit_breaker_trigger_time: Optional[datetime] = None
        self.consecutive_losses = 0
        self.last_loss_time: Optional[datetime] = None
        
        # Threading
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.running = False
        self.session_thread: Optional[threading.Thread] = None
        
        # Callbacks
        self.on_session_start = None
        self.on_session_end = None
        self.on_circuit_breaker_trigger = None
        self.on_target_reached = None
        
        logger.info("🚀 US Aggressive Session Manager başlatıldı")
    
    def start_session_monitoring(self):
        """Seans izleme başlat"""
        if self.running:
            logger.warning("⚠️ Seans izleme zaten çalışıyor")
            return
        
        self.running = True
        self.session_thread = threading.Thread(target=self._session_monitor_loop, daemon=True)
        self.session_thread.start()
        logger.info("✅ Seans izleme başlatıldı")
    
    def stop_session_monitoring(self):
        """Seans izleme durdur"""
        self.running = False
        if self.session_thread:
            self.session_thread.join(timeout=5)
        logger.info("⏹️ Seans izleme durduruldu")
    
    def _session_monitor_loop(self):
        """Ana seans izleme döngüsü"""
        while self.running:
            try:
                current_time = datetime.now()
                session_state = self._get_current_session_state(current_time)
                
                # Seans durumu değişikliklerini kontrol et
                self._handle_session_state_change(session_state, current_time)
                
                # Devre kesici durumunu kontrol et
                self._check_circuit_breaker()
                
                # Aktif seans varsa performansı kontrol et
                if self.current_session:
                    self._monitor_session_performance()
                
                time.sleep(30)  # 30 saniyede bir kontrol
                
            except Exception as e:
                logger.error(f"❌ Seans izleme hatası: {e}")
                time.sleep(60)  # Hata durumunda 1 dakika bekle
    
    def _get_current_session_state(self, current_time: datetime) -> SessionState:
        """Mevcut seans durumunu belirle"""
        # Basitleştirilmiş zaman kontrolü (EST yerine UTC kullanıyoruz)
        hour = current_time.hour
        
        if 4 <= hour < 9:  # Pre-market
            return SessionState.PRE_MARKET
        elif 9 <= hour < 16:  # Market hours
            return SessionState.MARKET_OPEN
        elif 16 <= hour < 20:  # After hours
            return SessionState.AFTER_HOURS
        else:  # Closed
            return SessionState.CLOSED
    
    def _handle_session_state_change(self, new_state: SessionState, current_time: datetime):
        """Seans durumu değişikliklerini yönet"""
        if new_state == SessionState.MARKET_OPEN and not self.current_session:
            self._start_trading_session(current_time)
        elif new_state in [SessionState.MARKET_CLOSE, SessionState.CLOSED] and self.current_session:
            self._end_trading_session(current_time)
    
    def _start_trading_session(self, start_time: datetime):
        """Yeni trading seansı başlat"""
        session_id = f"us_aggressive_{start_time.strftime('%Y%m%d_%H%M%S')}"
        
        self.current_session = TradingSession(
            session_id=session_id,
            start_time=start_time,
            initial_capital=100.0,
            current_capital=100.0,
            target_capital=1000.0
        )
        
        logger.info(f"🚀 Yeni US Aggressive seansı başlatıldı: {session_id}")
        logger.info(f"💰 Hedef: ${self.current_session.initial_capital} -> ${self.current_session.target_capital}")
        
        if self.on_session_start:
            self.on_session_start(self.current_session)
    
    def _end_trading_session(self, end_time: datetime):
        """Trading seansını sonlandır"""
        if not self.current_session:
            return
        
        self.current_session.end_time = end_time
        session_duration = end_time - self.current_session.start_time
        
        # Performans hesapla
        total_return = (self.current_session.current_capital - self.current_session.initial_capital) / self.current_session.initial_capital
        win_rate = (self.current_session.winning_trades / max(1, self.current_session.total_trades)) * 100
        
        logger.info(f"📊 Seans sonlandırıldı: {self.current_session.session_id}")
        logger.info(f"⏱️ Süre: {session_duration}")
        logger.info(f"💰 Sermaye: ${self.current_session.initial_capital:.2f} -> ${self.current_session.current_capital:.2f}")
        logger.info(f"📈 Getiri: {total_return:.2%}")
        logger.info(f"🎯 Kazanma Oranı: {win_rate:.1f}%")
        logger.info(f"📉 Max DD: {self.current_session.max_drawdown:.2%}")
        
        # Hedef kontrolü
        if self.current_session.current_capital >= self.current_session.target_capital:
            logger.info("🎉 HEDEF ULAŞILDI! $100 -> $1000+")
            if self.on_target_reached:
                self.on_target_reached(self.current_session)
        
        # Seans geçmişine ekle
        self.session_history.append(self.current_session)
        
        if self.on_session_end:
            self.on_session_end(self.current_session)
        
        self.current_session = None
    
    def _monitor_session_performance(self):
        """Seans performansını izle"""
        if not self.current_session:
            return
        
        # Günlük P&L kontrolü
        daily_return = (self.current_session.current_capital - self.current_session.initial_capital) / self.current_session.initial_capital
        
        # Maksimum kayıp kontrolü
        if daily_return < -self.config.max_daily_loss:
            logger.warning(f"⚠️ Günlük kayıp limiti aşıldı: {daily_return:.2%}")
            self._trigger_circuit_breaker("daily_loss_limit")
        
        # Drawdown kontrolü
        peak_capital = max(self.current_session.current_capital, self.current_session.initial_capital)
        current_drawdown = (peak_capital - self.current_session.current_capital) / peak_capital
        self.current_session.max_drawdown = max(self.current_session.max_drawdown, current_drawdown)
        
        if current_drawdown > self.config.loss_threshold_pct:
            logger.warning(f"⚠️ Drawdown limiti aşıldı: {current_drawdown:.2%}")
            self._trigger_circuit_breaker("drawdown_limit")
    
    def _check_circuit_breaker(self):
        """Devre kesici durumunu kontrol et"""
        if self.circuit_breaker_state == CircuitBreakerState.OPEN:
            # 30 dakika sonra half-open'a geç
            if self.circuit_breaker_trigger_time and \
               datetime.now() - self.circuit_breaker_trigger_time > timedelta(minutes=30):
                self.circuit_breaker_state = CircuitBreakerState.HALF_OPEN
                logger.info("🔄 Devre kesici Half-Open moduna geçti")
        
        elif self.circuit_breaker_state == CircuitBreakerState.HALF_OPEN:
            # Test işlemi başarılıysa closed'a geç
            if self.consecutive_losses == 0:
                self.circuit_breaker_state = CircuitBreakerState.CLOSED
                logger.info("✅ Devre kesici Closed moduna geçti")
    
    def _trigger_circuit_breaker(self, reason: str):
        """Devre kesiciyi tetikle"""
        if self.circuit_breaker_state == CircuitBreakerState.CLOSED:
            self.circuit_breaker_state = CircuitBreakerState.OPEN
            self.circuit_breaker_trigger_time = datetime.now()
            self.consecutive_losses += 1
            
            logger.error(f"🚨 DEVRE KESİCİ TETİKLENDİ: {reason}")
            logger.error(f"🔢 Ardışık kayıp sayısı: {self.consecutive_losses}")
            
            if self.on_circuit_breaker_trigger:
                self.on_circuit_breaker_trigger(reason, self.consecutive_losses)
    
    def record_trade(self, symbol: str, side: str, quantity: float, price: float, pnl: float):
        """İşlem kaydı"""
        if not self.current_session:
            logger.warning("⚠️ Aktif seans yok, işlem kaydedilemedi")
            return
        
        self.current_session.total_trades += 1
        self.current_session.current_capital += pnl
        self.current_session.daily_pnl += pnl
        
        if pnl > 0:
            self.current_session.winning_trades += 1
            self.consecutive_losses = 0  # Kazanç sonrası sıfırla
        else:
            self.current_session.losing_trades += 1
            self.last_loss_time = datetime.now()
        
        logger.info(f"📝 İşlem kaydedildi: {symbol} {side} {quantity}@{price:.2f} PnL: ${pnl:.2f}")
    
    def can_trade(self) -> Tuple[bool, str]:
        """İşlem yapılabilir mi kontrol et"""
        if not self.current_session:
            return False, "Aktif seans yok"
        
        if self.circuit_breaker_state == CircuitBreakerState.OPEN:
            return False, "Devre kesici açık"
        
        if len(self.current_session.active_positions) >= self.config.max_positions:
            return False, "Maksimum pozisyon sayısı aşıldı"
        
        return True, "İşlem yapılabilir"
    
    def get_session_status(self) -> Dict:
        """Seans durumu bilgisi"""
        status = {
            "running": self.running,
            "circuit_breaker_state": self.circuit_breaker_state.value,
            "consecutive_losses": self.consecutive_losses,
            "current_session": None,
            "session_history_count": len(self.session_history)
        }
        
        if self.current_session:
            status["current_session"] = {
                "session_id": self.current_session.session_id,
                "start_time": self.current_session.start_time.isoformat(),
                "current_capital": self.current_session.current_capital,
                "target_capital": self.current_session.target_capital,
                "daily_pnl": self.current_session.daily_pnl,
                "total_trades": self.current_session.total_trades,
                "winning_trades": self.current_session.winning_trades,
                "losing_trades": self.current_session.losing_trades,
                "max_drawdown": self.current_session.max_drawdown,
                "active_positions": self.current_session.active_positions
            }
        
        return status
    
    def reset_circuit_breaker(self):
        """Devre kesiciyi sıfırla"""
        self.circuit_breaker_state = CircuitBreakerState.CLOSED
        self.consecutive_losses = 0
        self.circuit_breaker_trigger_time = None
        logger.info("🔄 Devre kesici sıfırlandı")

# Global instance
us_aggressive_manager = USAggressiveSessionManager()

# Callback fonksiyonları
def on_session_start_callback(session: TradingSession):
    """Seans başlangıç callback'i"""
    logger.info(f"🎯 US Aggressive seansı başladı: {session.session_id}")

def on_session_end_callback(session: TradingSession):
    """Seans bitiş callback'i"""
    logger.info(f"🏁 US Aggressive seansı bitti: {session.session_id}")

def on_circuit_breaker_callback(reason: str, consecutive_losses: int):
    """Devre kesici callback'i"""
    logger.error(f"🚨 Devre kesici tetiklendi: {reason} (Ardışık kayıp: {consecutive_losses})")

def on_target_reached_callback(session: TradingSession):
    """Hedef ulaşılma callback'i"""
    logger.info(f"🎉 HEDEF ULAŞILDI! ${session.initial_capital} -> ${session.current_capital}")

# Callback'leri ayarla
us_aggressive_manager.on_session_start = on_session_start_callback
us_aggressive_manager.on_session_end = on_session_end_callback
us_aggressive_manager.on_circuit_breaker_trigger = on_circuit_breaker_callback
us_aggressive_manager.on_target_reached = on_target_reached_callback

if __name__ == "__main__":
    # Test
    logging.basicConfig(level=logging.INFO)
    
    manager = USAggressiveSessionManager()
    manager.start_session_monitoring()
    
    try:
        while True:
            status = manager.get_session_status()
            print(f"Status: {json.dumps(status, indent=2)}")
            time.sleep(10)
    except KeyboardInterrupt:
        manager.stop_session_monitoring()
        print("Test tamamlandı")
