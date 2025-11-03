/**
 * Hidden Liquidity Scanner Component
 * v6.0 Profit Intelligence Suite
 */

'use client';

import React, { useMemo } from 'react';
import { scanHiddenLiquidity, type OrderBookData, type HiddenLiquidityInput } from '@/lib/hidden-liquidity-scanner';
import { Skeleton } from '@/components/UI/Skeleton';

interface HiddenLiquidityScannerProps {
  symbol: string;
  orderBook?: OrderBookData;
  currentPrice?: number;
  isLoading?: boolean;
}

export function HiddenLiquidityScanner({
  symbol,
  orderBook,
  currentPrice = 100,
  isLoading,
}: HiddenLiquidityScannerProps) {
  const scanResult = useMemo(() => {
    if (!orderBook || orderBook.bids.length === 0 || orderBook.asks.length === 0) return null;

    const input: HiddenLiquidityInput = {
      symbol,
      orderBook,
      currentPrice,
    };

    return scanHiddenLiquidity(input);
  }, [symbol, orderBook, currentPrice]);

  if (isLoading || !scanResult) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-semibold text-gray-900 mb-2">🔍 Hidden Liquidity Scanner</div>
        <Skeleton className="h-24 w-full rounded" />
      </div>
    );
  }

  const isBuyPressure = scanResult.imbalance > 20;
  const isSellPressure = scanResult.imbalance < -20;

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">🔍 Hidden Liquidity Scanner</div>
        {scanResult.hasHiddenLiquidity && (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            isBuyPressure ? 'bg-green-100 text-green-700 border border-green-300' :
            isSellPressure ? 'bg-red-100 text-red-700 border border-red-300' :
            'bg-slate-100 text-slate-700 border border-slate-300'
          }`}>
            {isBuyPressure ? 'BUY PRESSURE' : isSellPressure ? 'SELL PRESSURE' : 'NEUTRAL'}
          </span>
        )}
      </div>

      {scanResult.hasHiddenLiquidity ? (
        <>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <div className="text-[10px] text-green-600 mb-1">Gizli Alım</div>
              <div className="text-sm font-bold text-green-700">
                {scanResult.hiddenBuyVolume.toLocaleString()}
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <div className="text-[10px] text-red-600 mb-1">Gizli Satım</div>
              <div className="text-sm font-bold text-red-700">
                {scanResult.hiddenSellVolume.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-blue-700">Dengesizlik:</span>
              <span className={`text-sm font-bold ${
                isBuyPressure ? 'text-green-700' : isSellPressure ? 'text-red-700' : 'text-slate-700'
              }`}>
                %{scanResult.imbalance.toFixed(1)}
              </span>
            </div>
            <div className="text-[10px] text-blue-600">
              Güven: %{(scanResult.confidence * 100).toFixed(0)}
            </div>
          </div>

          <div className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
            {scanResult.explanation}
          </div>
        </>
      ) : (
        <div className="text-xs text-slate-600 italic">
          {scanResult.explanation}
        </div>
      )}
    </div>
  );
}



