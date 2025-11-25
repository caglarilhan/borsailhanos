"""
Alpaca Paper Trading API client wrapper.
Gerçek Alpaca API'ye bağlanır ve paper trading işlemlerini yönetir.
"""
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

# backend modüllerine erişmek için path ayarı
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.append(str(BACKEND_ROOT))

from config.secret_vault import get_secret  # noqa: E402

try:
    import alpaca_trade_api as tradeapi
except ImportError:
    tradeapi = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("alpaca")

ALPACA_API_KEY_ID = get_secret("ALPACA_API_KEY_ID")
ALPACA_API_SECRET = get_secret("ALPACA_API_SECRET")
ALPACA_BASE_URL = os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets")


def get_alpaca_client() -> Optional[Any]:
    """
    Alpaca API client'ı döndürür. Credentials yoksa None döner.
    """
    if not tradeapi:
        logger.warning("alpaca-trade-api kurulu değil")
        return None
    if not ALPACA_API_KEY_ID or not ALPACA_API_SECRET:
        logger.warning("Alpaca credentials eksik")
        return None
    try:
        return tradeapi.REST(
            key_id=ALPACA_API_KEY_ID,
            secret_key=ALPACA_API_SECRET,
            base_url=ALPACA_BASE_URL,
            api_version="v2",
        )
    except Exception as exc:
        logger.error("Alpaca client oluşturulamadı: %s", exc)
        return None


def get_account() -> Optional[Dict[str, Any]]:
    """
    Alpaca hesap bilgilerini döndürür.
    """
    client = get_alpaca_client()
    if not client:
        return None
    try:
        account = client.get_account()
        return {
            "account_number": account.account_number,
            "status": account.status,
            "currency": account.currency,
            "buying_power": float(account.buying_power),
            "cash": float(account.cash),
            "portfolio_value": float(account.portfolio_value),
            "equity": float(account.equity),
            "last_equity": float(account.last_equity),
            "multiplier": float(account.multiplier),
            "pattern_day_trader": account.pattern_day_trader,
        }
    except Exception as exc:
        logger.error("Hesap bilgisi alınamadı: %s", exc)
        return None


def get_positions() -> List[Dict[str, Any]]:
    """
    Açık pozisyonları döndürür.
    """
    client = get_alpaca_client()
    if not client:
        return []
    try:
        positions = client.list_positions()
        return [
            {
                "symbol": pos.symbol,
                "qty": float(pos.qty),
                "side": pos.side,
                "market_value": float(pos.market_value),
                "cost_basis": float(pos.cost_basis),
                "unrealized_pl": float(pos.unrealized_pl),
                "unrealized_plpc": float(pos.unrealized_plpc),
                "current_price": float(pos.current_price),
                "avg_entry_price": float(pos.avg_entry_price),
            }
            for pos in positions
        ]
    except Exception as exc:
        logger.error("Pozisyonlar alınamadı: %s", exc)
        return []


def place_order(
    symbol: str,
    qty: float,
    side: str,  # 'buy' or 'sell'
    order_type: str = "market",  # 'market', 'limit', 'stop', 'stop_limit'
    time_in_force: str = "day",  # 'day', 'gtc', 'opg', 'cls', 'ioc', 'fok'
    limit_price: Optional[float] = None,
    stop_price: Optional[float] = None,
) -> Optional[Dict[str, Any]]:
    """
    Alpaca'da emir gönderir.
    """
    client = get_alpaca_client()
    if not client:
        return None
    try:
        order_params = {
            "symbol": symbol.upper(),
            "qty": qty,
            "side": side.lower(),
            "type": order_type.lower(),
            "time_in_force": time_in_force.upper(),
        }
        if limit_price:
            order_params["limit_price"] = limit_price
        if stop_price:
            order_params["stop_price"] = stop_price

        order = client.submit_order(**order_params)
        return {
            "id": order.id,
            "client_order_id": order.client_order_id,
            "symbol": order.symbol,
            "asset_class": order.asset_class,
            "qty": float(order.qty),
            "side": order.side,
            "type": order.type,
            "time_in_force": order.time_in_force,
            "status": order.status,
            "filled_qty": float(order.filled_qty) if order.filled_qty else 0.0,
            "filled_avg_price": float(order.filled_avg_price) if order.filled_avg_price else None,
            "submitted_at": order.submitted_at.isoformat() if order.submitted_at else None,
        }
    except Exception as exc:
        logger.error("Emir gönderilemedi: %s", exc)
        raise


def cancel_order(order_id: str) -> bool:
    """
    Emri iptal eder.
    """
    client = get_alpaca_client()
    if not client:
        return False
    try:
        client.cancel_order(order_id)
        return True
    except Exception as exc:
        logger.error("Emir iptal edilemedi: %s", exc)
        return False


def get_orders(
    status: Optional[str] = None,
    limit: int = 50,
    nested: bool = True,
) -> List[Dict[str, Any]]:
    """
    Emir geçmişini döndürür.
    """
    client = get_alpaca_client()
    if not client:
        return []
    try:
        orders = client.list_orders(status=status, limit=limit, nested=nested)
        return [
            {
                "id": order.id,
                "client_order_id": order.client_order_id,
                "symbol": order.symbol,
                "qty": float(order.qty),
                "side": order.side,
                "type": order.type,
                "time_in_force": order.time_in_force,
                "status": order.status,
                "filled_qty": float(order.filled_qty) if order.filled_qty else 0.0,
                "filled_avg_price": float(order.filled_avg_price) if order.filled_avg_price else None,
                "submitted_at": order.submitted_at.isoformat() if order.submitted_at else None,
                "updated_at": order.updated_at.isoformat() if order.updated_at else None,
            }
            for order in orders
        ]
    except Exception as exc:
        logger.error("Emirler alınamadı: %s", exc)
        return []


if __name__ == "__main__":
    # Test
    print("Alpaca Client Test")
    account = get_account()
    if account:
        print(f"✅ Hesap: {account.get('status')} | Equity: ${account.get('equity', 0):.2f}")
    else:
        print("❌ Hesap bilgisi alınamadı")
    positions = get_positions()
    print(f"📊 Açık pozisyonlar: {len(positions)}")
    for pos in positions[:3]:
        print(f"  - {pos['symbol']}: {pos['qty']} @ ${pos['current_price']:.2f}")

