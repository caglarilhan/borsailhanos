"use client";

import React from 'react';
import { MarketScope, ConnectionStatus } from '@/lib/guards';

/**
 * Market scope guard component
 * Only renders children if current market matches the guard
 */
interface MarketGuardProps {
  market: MarketScope;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function MarketGuard({ market, children, fallback = null }: MarketGuardProps) {
  // TODO: Connect to actual market context from state
  // const currentMarket = useMarketContext(); // Replace with actual state
  const currentMarket = 'BIST'; // Placeholder
  
  if (currentMarket !== market) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Connection status guard
 * Only renders children when connection is healthy
 */
interface OnlineGuardProps {
  children: React.ReactNode;
  connectionStatus: ConnectionStatus;
  fallback?: React.ReactNode;
}

export function OnlineGuard({ children, connectionStatus, fallback }: OnlineGuardProps) {
  const isHealthy = connectionStatus === 'online';
  
  if (!isHealthy && fallback) {
    return <>{fallback}</>;
  }
  
  if (!isHealthy) {
    return (
      <div style={{ 
        padding: '16px', 
        background: '#fef3c7', 
        borderRadius: '8px',
        textAlign: 'center',
        color: '#92400e'
      }}>
        ⚠️ Bağlantı kesildi. Lütfen bekleyin...
      </div>
    );
  }
  
  return <>{children}</>;
}

/**
 * Accuracy threshold guard
 */
interface AccuracyGuardProps {
  accuracy: number;
  minAccuracy: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AccuracyGuard({ accuracy, minAccuracy, children, fallback = null }: AccuracyGuardProps) {
  if (accuracy < minAccuracy * 100) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

