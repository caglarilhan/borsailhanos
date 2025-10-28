/**
 * Market Context - Centralized market selection state
 * Ensures all data fetching respects the active market
 */

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Market = 'BIST' | 'NYSE' | 'NASDAQ';

interface MarketContextType {
  market: Market;
  setMarket: (market: Market) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider = ({ children }: { children: ReactNode }) => {
  const [market, setMarket] = useState<Market>('BIST');

  return (
    <MarketContext.Provider value={{ market, setMarket }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within MarketProvider');
  }
  return context;
};

