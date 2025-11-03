/**
 * Hidden Liquidity Scanner
 * v6.0 Profit Intelligence Suite
 * 
 * Emir defteri gizli davranış tespiti (order book analysis)
 * Fayda: Büyük emirlerin gizli varlığını gösterir
 */

export interface OrderBookData {
  bids: Array<{ price: number; volume: number }>; // Buy orders
  asks: Array<{ price: number; volume: number }>; // Sell orders
}

export interface HiddenLiquidityInput {
  symbol: string;
  orderBook: OrderBookData;
  currentPrice: number;
}

export interface HiddenLiquidity {
  symbol: string;
  hasHiddenLiquidity: boolean;
  hiddenBuyVolume: number; // Hidden buy volume
  hiddenSellVolume: number; // Hidden sell volume
  imbalance: number; // -100 to +100 (negative = sell pressure, positive = buy pressure)
  confidence: number; // 0-1
  explanation: string;
}

/**
 * Scan for hidden liquidity in order book
 * 
 * Indicators:
 * 1. Large orders at price levels slightly below/above market → hidden intent
 * 2. Order size patterns that don't match normal retail behavior → institutional
 * 3. Imbalance between bid and ask volumes → potential direction
 */
export function scanHiddenLiquidity(input: HiddenLiquidityInput): HiddenLiquidity {
  const { symbol, orderBook, currentPrice } = input;

  if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
    return {
      symbol,
      hasHiddenLiquidity: false,
      hiddenBuyVolume: 0,
      hiddenSellVolume: 0,
      imbalance: 0,
      confidence: 0,
      explanation: `${symbol}: Yetersiz emir defteri verisi`,
    };
  }

  // 1. Analyze bid side (buy orders)
  const bidVolume = orderBook.bids.reduce((sum, b) => sum + b.volume, 0);
  const avgBidVolume = bidVolume / orderBook.bids.length;
  const largeBids = orderBook.bids.filter(b => b.volume > avgBidVolume * 3); // 3x average = hidden intent
  const hiddenBuyVolume = largeBids.reduce((sum, b) => sum + b.volume, 0);

  // 2. Analyze ask side (sell orders)
  const askVolume = orderBook.asks.reduce((sum, a) => sum + a.volume, 0);
  const avgAskVolume = askVolume / orderBook.asks.length;
  const largeAsks = orderBook.asks.filter(a => a.volume > avgAskVolume * 3);
  const hiddenSellVolume = largeAsks.reduce((sum, a) => sum + a.volume, 0);

  // 3. Calculate imbalance
  const totalHidden = hiddenBuyVolume + hiddenSellVolume;
  const imbalance = totalHidden > 0
    ? ((hiddenBuyVolume - hiddenSellVolume) / totalHidden) * 100
    : 0;

  // 4. Detect if hidden liquidity exists
  const hasHiddenLiquidity = largeBids.length > 0 || largeAsks.length > 0;

  // 5. Calculate confidence based on volume ratio
  const totalVolume = bidVolume + askVolume;
  const hiddenRatio = totalVolume > 0 ? totalHidden / totalVolume : 0;
  const confidence = Math.min(1, 0.5 + hiddenRatio * 2);

  // 6. Generate explanation
  const explanation = hasHiddenLiquidity
    ? `${symbol}: Gizli likidite tespit edildi. Gizli alım hacmi: ${formatNumber(hiddenBuyVolume)}, gizli satım hacmi: ${formatNumber(hiddenSellVolume)}. Dengesizlik: %${imbalance.toFixed(1)} (${imbalance > 0 ? 'alım baskısı' : 'satım baskısı'}).`
    : `${symbol}: Gizli likidite tespit edilmedi. Normal emir defteri davranışı.`;

  return {
    symbol,
    hasHiddenLiquidity,
    hiddenBuyVolume: Math.round(hiddenBuyVolume * 100) / 100,
    hiddenSellVolume: Math.round(hiddenSellVolume * 100) / 100,
    imbalance: Math.round(imbalance * 10) / 10,
    confidence: Math.round(confidence * 100) / 100,
    explanation,
  };
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
  return value.toFixed(0);
}



