from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import asyncio
import logging
import json
from datetime import datetime
import uvicorn

# Mevcut modüllerimizi import ediyoruz
from trading_robot_core import TradingRobot, TradingMode
from broker_integration import BrokerManager, BrokerType, OrderRequest
from lightgbm_pipeline import LightGBMPipeline
from prophet_model import ProphetModel
from timegpt_mock import TimeGPTMock
from ensemble_combiner import EnsembleCombiner

# Logging ayarları
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app oluştur
app = FastAPI(
    title="BIST AI Smart Trader API",
    description="3 Modlu Trading Robot API - Agresif, Normal, Güvenli",
    version="2.0.0"
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global değişkenler
trading_robots: Dict[str, TradingRobot] = {}
broker_manager = BrokerManager()
active_mode = "normal"

# Pydantic modelleri
class SignalRequest(BaseModel):
    symbol: str
    mode: Optional[str] = "normal"

class SignalResponse(BaseModel):
    symbol: str
    action: str  # "BUY", "SELL", "HOLD"
    confidence: float
    reason: str
    timestamp: str
    components: Dict[str, Any]

class TradeRequest(BaseModel):
    symbol: str
    action: str  # "BUY", "SELL"
    quantity: int
    price: float
    mode: Optional[str] = "normal"

class TradeResponse(BaseModel):
    order_id: str
    status: str
    symbol: str
    action: str
    quantity: int
    price: float
    commission: float
    timestamp: str

class RobotStatus(BaseModel):
    mode: str
    initial_capital: float
    current_capital: float
    total_return: float
    open_positions: int
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    max_drawdown: float

class PositionInfo(BaseModel):
    symbol: str
    quantity: int
    entry_price: float
    current_price: float
    unrealized_pnl: float
    realized_pnl: float

# Başlangıç ayarları
@app.on_event("startup")
async def startup_event():
    """Uygulama başlangıcında çalışır"""
    try:
        logger.info("🚀 BIST AI Smart Trader API başlatılıyor...")
        
        # Broker manager'ı başlat
        await broker_manager.add_broker("paper", BrokerType.PAPER)
        await broker_manager.add_broker("mock", BrokerType.MOCK)
        
        # Trading robotları oluştur
        for mode in ["aggressive", "normal", "safe"]:
            trading_mode = TradingMode(mode)
            robot = TradingRobot(trading_mode, initial_capital=100000)
            trading_robots[mode] = robot
            logger.info(f"🤖 {mode} mod robotu oluşturuldu")
        
        logger.info("✅ API başlatıldı!")
        
    except Exception as e:
        logger.error(f"❌ API başlatma hatası: {e}")

# Health check endpoint
@app.get("/")
async def root():
    """Ana endpoint - health check"""
    return {
        "message": "BIST AI Smart Trader API v2.0",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "active_mode": active_mode,
        "available_modes": list(trading_robots.keys())
    }

# Sinyal analizi endpoint'i
@app.post("/signals", response_model=SignalResponse)
async def analyze_signal(request: SignalRequest):
    """AI ensemble ile sinyal analizi"""
    try:
        mode = request.mode or active_mode
        if mode not in trading_robots:
            raise HTTPException(status_code=400, detail=f"Geçersiz mod: {mode}")
        
        robot = trading_robots[mode]
        signal = await robot.analyze_signal(request.symbol)
        
        return SignalResponse(
            symbol=request.symbol,
            action=signal['action'],
            confidence=signal['confidence'],
            reason=signal['reason'],
            timestamp=datetime.now().isoformat(),
            components=signal.get('components', {})
        )
        
    except Exception as e:
        logger.error(f"❌ Sinyal analizi hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# İşlem yapma endpoint'i
@app.post("/trade", response_model=TradeResponse)
async def execute_trade(request: TradeRequest):
    """Trading işlemi gerçekleştir"""
    try:
        mode = request.mode or active_mode
        if mode not in trading_robots:
            raise HTTPException(status_code=400, detail=f"Geçersiz mod: {mode}")
        
        # Order request oluştur
        order_request = OrderRequest(
            symbol=request.symbol,
            side=request.action,
            quantity=request.quantity,
            price=request.price,
            order_type="MARKET"
        )
        
        # Broker üzerinden işlem yap
        order_response = await broker_manager.place_order(order_request)
        
        if order_response.status == "FILLED":
            # Robot pozisyonunu güncelle
            robot = trading_robots[mode]
            await robot.execute_trade(request.symbol, request.action, request.quantity, request.price)
        
        return TradeResponse(
            order_id=order_response.order_id,
            status=order_response.status,
            symbol=request.symbol,
            action=request.action,
            quantity=order_response.filled_quantity,
            price=order_response.filled_price,
            commission=order_response.commission,
            timestamp=order_response.timestamp.isoformat()
        )
        
    except Exception as e:
        logger.error(f"❌ İşlem hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Robot durumu endpoint'i
@app.get("/status/{mode}", response_model=RobotStatus)
async def get_robot_status(mode: str):
    """Robot durumunu al"""
    try:
        if mode not in trading_robots:
            raise HTTPException(status_code=400, detail=f"Geçersiz mod: {mode}")
        
        robot = trading_robots[mode]
        status = robot.get_status()
        
        return RobotStatus(
            mode=status['mode'],
            initial_capital=status['initial_capital'],
            current_capital=status['current_capital'],
            total_return=status['total_return'],
            open_positions=status['open_positions'],
            total_trades=status['performance_metrics']['total_trades'],
            winning_trades=status['performance_metrics']['winning_trades'],
            losing_trades=status['performance_metrics']['losing_trades'],
            win_rate=status['performance_metrics'].get('win_rate', 0),
            max_drawdown=status['performance_metrics']['max_drawdown']
        )
        
    except Exception as e:
        logger.error(f"❌ Durum alma hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Pozisyonlar endpoint'i
@app.get("/positions/{mode}", response_model=List[PositionInfo])
async def get_positions(mode: str):
    """Açık pozisyonları al"""
    try:
        if mode not in trading_robots:
            raise HTTPException(status_code=400, detail=f"Geçersiz mod: {mode}")
        
        robot = trading_robots[mode]
        positions = []
        
        for symbol, pos in robot.positions.items():
            # Güncel fiyat al
            market_data = await robot.get_market_data(symbol)
            current_price = market_data['price'].iloc[0] if not market_data.empty else pos.entry_price
            
            positions.append(PositionInfo(
                symbol=symbol,
                quantity=pos.quantity,
                entry_price=pos.entry_price,
                current_price=current_price,
                unrealized_pnl=(current_price - pos.entry_price) * pos.quantity,
                realized_pnl=0.0  # TODO: realized PnL hesapla
            ))
        
        return positions
        
    except Exception as e:
        logger.error(f"❌ Pozisyon alma hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Mod değiştirme endpoint'i
@app.post("/mode/{new_mode}")
async def change_mode(new_mode: str):
    """Aktif modu değiştir"""
    try:
        if new_mode not in trading_robots:
            raise HTTPException(status_code=400, detail=f"Geçersiz mod: {new_mode}")
        
        global active_mode
        active_mode = new_mode
        
        logger.info(f"🔄 Aktif mod değiştirildi: {new_mode}")
        
        return {
            "message": f"Mod değiştirildi: {new_mode}",
            "active_mode": active_mode,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Mod değiştirme hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Otomatik trading endpoint'i
@app.post("/auto-trade/{mode}")
async def start_auto_trading(mode: str, background_tasks: BackgroundTasks):
    """Otomatik trading başlat"""
    try:
        if mode not in trading_robots:
            raise HTTPException(status_code=400, detail=f"Geçersiz mod: {mode}")
        
        # Background task olarak trading döngüsünü başlat
        background_tasks.add_task(run_trading_cycle, mode)
        
        return {
            "message": f"Otomatik trading başlatıldı: {mode}",
            "mode": mode,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Otomatik trading hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Broker bilgileri endpoint'i
@app.get("/broker/info")
async def get_broker_info():
    """Broker bilgilerini al"""
    try:
        account_info = await broker_manager.get_account_info()
        active_broker = broker_manager.get_active_broker_name()
        broker_list = broker_manager.get_broker_list()
        
        return {
            "active_broker": active_broker,
            "available_brokers": broker_list,
            "account_info": account_info,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Broker bilgisi alma hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Broker değiştirme endpoint'i
@app.post("/broker/{broker_name}")
async def change_broker(broker_name: str):
    """Aktif broker'ı değiştir"""
    try:
        success = broker_manager.set_active_broker(broker_name)
        
        if success:
            return {
                "message": f"Broker değiştirildi: {broker_name}",
                "active_broker": broker_name,
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=400, detail=f"Broker bulunamadı: {broker_name}")
        
    except Exception as e:
        logger.error(f"❌ Broker değiştirme hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Performans raporu endpoint'i
@app.get("/performance/{mode}")
async def get_performance_report(mode: str):
    """Performans raporu al"""
    try:
        if mode not in trading_robots:
            raise HTTPException(status_code=400, detail=f"Geçersiz mod: {mode}")
        
        robot = trading_robots[mode]
        status = robot.get_status()
        
        # Detaylı performans analizi
        performance = {
            "mode": mode,
            "capital": {
                "initial": status['initial_capital'],
                "current": status['current_capital'],
                "total_return": status['total_return']
            },
            "trades": {
                "total": status['performance_metrics']['total_trades'],
                "winning": status['performance_metrics']['winning_trades'],
                "losing": status['performance_metrics']['losing_trades'],
                "win_rate": status['performance_metrics'].get('win_rate', 0)
            },
            "risk": {
                "max_drawdown": status['performance_metrics']['max_drawdown'],
                "open_positions": status['open_positions']
            },
            "risk_params": status['risk_params'],
            "timestamp": datetime.now().isoformat()
        }
        
        return performance
        
    except Exception as e:
        logger.error(f"❌ Performans raporu hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Background task fonksiyonu
async def run_trading_cycle(mode: str):
    """Trading döngüsünü çalıştır (background task)"""
    try:
        robot = trading_robots[mode]
        symbols = ["SISE.IS", "EREGL.IS", "TUPRS.IS", "KCHOL.IS", "GARAN.IS"]
        
        logger.info(f"🔄 Trading döngüsü başlatıldı: {mode}")
        
        # Trading döngüsü çalıştır
        result = await robot.run_trading_cycle(symbols)
        
        logger.info(f"✅ Trading döngüsü tamamlandı: {mode} - {len(result['actions_taken'])} işlem")
        
    except Exception as e:
        logger.error(f"❌ Trading döngüsü hatası: {e}")

# API dokümantasyonu için ek endpoint'ler
@app.get("/docs")
async def get_api_docs():
    """API dokümantasyonu"""
    return {
        "title": "BIST AI Smart Trader API v2.0",
        "description": "3 Modlu Trading Robot API",
        "endpoints": {
            "GET /": "Health check",
            "POST /signals": "Sinyal analizi",
            "POST /trade": "İşlem yapma",
            "GET /status/{mode}": "Robot durumu",
            "GET /positions/{mode}": "Açık pozisyonlar",
            "POST /mode/{new_mode}": "Mod değiştirme",
            "POST /auto-trade/{mode}": "Otomatik trading",
            "GET /broker/info": "Broker bilgileri",
            "POST /broker/{broker_name}": "Broker değiştirme",
            "GET /performance/{mode}": "Performans raporu"
        },
        "modes": ["aggressive", "normal", "safe"],
        "brokers": ["paper", "mock"]
    }

if __name__ == "__main__":
    # Development server başlat
    uvicorn.run(
        "fastapi_app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

