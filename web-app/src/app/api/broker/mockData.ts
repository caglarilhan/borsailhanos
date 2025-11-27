export type BrokerStatusResponse = {
  brokers: Record<string, boolean>;
};

export interface BrokerAccount {
  account_id: string;
  account_type: string;
  currency: string;
  balance: number;
  available_balance: number;
  blocked_amount: number;
  equity: number;
  margin_used: number;
  margin_available: number;
  last_update: string;
}

export interface BrokerPosition {
  symbol: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  market_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: string;
  position_type: string;
  broker: string;
  last_update: string;
}

export type BrokerAccountsResponse = {
  accounts: Record<string, BrokerAccount>;
};

export type BrokerPositionsResponse = {
  positions: Record<string, BrokerPosition[]>;
};

export type BrokerPortfolioResponse = {
  total_value: number;
  cash: number;
  equity: number;
  pnl_24h: number;
  pnl_7d: number;
  risk_score: number;
  diversification: number;
  updated_at: number;
};

const BROKERS = ['MockTrade', 'FinBridge', 'AlgoX'];

const sampleSymbols = [
  'THYAO.IS',
  'AKBNK.IS',
  'GARAN.IS',
  'TUPRS.IS',
  'AAPL',
  'MSFT',
  'NVDA',
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function mockStatus(): BrokerStatusResponse {
  const brokers: Record<string, boolean> = {};
  BROKERS.forEach((name) => {
    brokers[name] = Math.random() > 0.05;
  });
  return { brokers };
}

export function mockAccounts(): BrokerAccountsResponse {
  const accounts: Record<string, BrokerAccount> = {};
  BROKERS.forEach((name) => {
    accounts[name] = {
      account_id: `${name}-001`,
      account_type: 'Margin',
      currency: 'USD',
      balance: Number(randomBetween(25000, 55000).toFixed(2)),
      available_balance: Number(randomBetween(20000, 45000).toFixed(2)),
      blocked_amount: Number(randomBetween(0, 5000).toFixed(2)),
      equity: Number(randomBetween(30000, 65000).toFixed(2)),
      margin_used: Number(randomBetween(2000, 9000).toFixed(2)),
      margin_available: Number(randomBetween(15000, 30000).toFixed(2)),
      last_update: new Date().toISOString(),
    };
  });
  return { accounts };
}

export function mockPositions(): BrokerPositionsResponse {
  const positions: Record<string, BrokerPosition[]> = {};
  BROKERS.forEach((name) => {
    positions[name] = sampleSymbols.slice(0, 3).map((symbol) => {
      const quantity = Math.round(randomBetween(50, 500));
      const avgPrice = randomBetween(20, 250);
      const currentPrice = avgPrice * randomBetween(0.95, 1.05);
      const marketValue = quantity * currentPrice;
      const unrealizedPnl = (currentPrice - avgPrice) * quantity;
      return {
        symbol,
        quantity,
        avg_price: Number(avgPrice.toFixed(2)),
        current_price: Number(currentPrice.toFixed(2)),
        market_value: Number(marketValue.toFixed(2)),
        unrealized_pnl: Number(unrealizedPnl.toFixed(2)),
        unrealized_pnl_percent: Number((unrealizedPnl / (avgPrice * quantity)) * 100).toFixed(2),
        position_type: 'LONG',
        broker: name,
        last_update: new Date().toISOString(),
      };
    });
  });
  return { positions };
}

export function mockPortfolio(): BrokerPortfolioResponse {
  return {
    total_value: Number(randomBetween(80000, 150000).toFixed(2)),
    cash: Number(randomBetween(20000, 40000).toFixed(2)),
    equity: Number(randomBetween(60000, 120000).toFixed(2)),
    pnl_24h: Number(randomBetween(-1500, 4500).toFixed(2)),
    pnl_7d: Number(randomBetween(-3000, 9000).toFixed(2)),
    risk_score: Number(randomBetween(2, 6).toFixed(1)),
    diversification: Number(randomBetween(0.5, 0.9).toFixed(2)),
    updated_at: Date.now(),
  };
}

