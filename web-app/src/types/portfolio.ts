/**
 * Portföy Types
 * Önerilen, Simülatör ve Mevcut portföy için type tanımları
 */

export type PortfolioType = 'suggested' | 'simulator' | 'current';

export interface PortfolioPosition {
  symbol: string;
  weight: number; // Percentage (0-100)
  quantity?: number; // Number of shares
  price: number; // Current price
  value: number; // Total value (quantity * price)
  changePct: number; // Price change percentage
}

export interface Portfolio {
  type: PortfolioType;
  positions: PortfolioPosition[];
  totalValue: number;
  totalChange: number; // Absolute change
  totalChangePct: number; // Percentage change
  timestamp: number; // Unix timestamp in ms
  label: string; // Display label
  description?: string; // Optional description
}

export interface PortfolioContextValue {
  suggested: Portfolio | null;
  simulator: Portfolio | null;
  current: Portfolio | null;
  getPortfolio: (type: PortfolioType) => Portfolio | null;
  updateSimulator: (positions: PortfolioPosition[], initialValue: number) => void;
  resetSimulator: () => void;
}

