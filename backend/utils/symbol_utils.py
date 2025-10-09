import logging
from typing import Optional

import yfinance as yf

logger = logging.getLogger(__name__)


def get_yfinance_symbol(symbol: str) -> str:
    """
    Verilen sembol için uygun Yahoo Finance sembolünü döndürür.
    BIST hisseleri için '.IS' ekini ekler.
    """
    if not symbol:
        return symbol
    normalized = symbol.strip().upper()
    if not normalized.endswith(".IS") and not normalized.endswith(".AS") and not normalized.endswith(".US"):
        return f"{normalized}.IS"
    return normalized


def get_stock_data(symbol: str, period: str = "1y", interval: str = "1d") -> yf.DataFrame:
    """
    Yahoo Finance'dan hisse senedi verilerini alır.
    Veri alınamazsa alternatif sembollerle dener.
    """
    yf_symbol = get_yfinance_symbol(symbol)
    data = yf.Ticker(yf_symbol).history(period=period, interval=interval)

    if data is not None and not data.empty:
        return data

    logger.warning(f"⚠️ {yf_symbol} için veri bulunamadı. Alternatif semboller deneniyor...")

    # Try without suffix
    base_symbol = symbol.strip().upper()
    try_symbols = []
    if yf_symbol.endswith(".IS"):
        try_symbols.append(base_symbol)
    # Try with .AS
    if not base_symbol.endswith(".AS"):
        try_symbols.append(f"{base_symbol}.AS")
    # Try with .US for US listings
    if not base_symbol.endswith(".US"):
        try_symbols.append(f"{base_symbol}.US")

    for alt in try_symbols:
        data = yf.Ticker(alt).history(period=period, interval=interval)
        if data is not None and not data.empty:
            logger.info(f"✅ {alt} ile veri alındı.")
            return data

    logger.error(f"❌ {symbol} için hiçbir sembolle veri alınamadı.")
    return data



