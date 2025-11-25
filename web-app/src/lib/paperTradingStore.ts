import path from 'path';
import { promises as fs } from 'fs';

export interface PaperPosition {
  quantity: number;
  avgPrice: number;
  costBasis: number;
  currentValue: number;
  unrealizedPnl: number;
}

export interface PaperPortfolio {
  userId: string;
  cash: number;
  totalValue: number;
  positions: Record<string, PaperPosition>;
  createdAt: string;
  lastUpdate: string;
  totalReturn: number;
  totalTrades: number;
}

export interface PaperOrder {
  id: string;
  userId: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalCost: number;
  status: 'filled';
  createdAt: string;
}

export interface PaperTradingState {
  portfolios: Record<string, PaperPortfolio>;
  orders: PaperOrder[];
}

const rootDir = process.cwd();
const statePath = path.join(rootDir, 'data', 'paper_trading_state.json');
const tradeLogPath = path.join(rootDir, 'logs', 'paper_trades.jsonl');
let stateLock: Promise<void> = Promise.resolve();

async function readState(): Promise<PaperTradingState> {
  try {
    const raw = await fs.readFile(statePath, 'utf8');
    return JSON.parse(raw) as PaperTradingState;
  } catch (error) {
    return { portfolios: {}, orders: [] };
  }
}

async function writeState(state: PaperTradingState) {
async function runExclusive<T>(task: () => Promise<T>): Promise<T> {
  const run = stateLock.then(task, task);
  stateLock = run.then(() => undefined, () => undefined);
  return run;
}
  const dir = path.dirname(statePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(statePath, JSON.stringify(state, null, 2), 'utf8');
}

function nowISO() {
  return new Date().toISOString();
}

export async function ensurePortfolio(userId: string, initialCash = 100000) {
  return runExclusive(async () => {
    const state = await readState();
    if (!state.portfolios[userId]) {
      state.portfolios[userId] = {
        userId,
        cash: initialCash,
        totalValue: initialCash,
        positions: {},
        createdAt: nowISO(),
        lastUpdate: nowISO(),
        totalReturn: 0,
        totalTrades: 0,
      };
      await writeState(state);
    }
    return state.portfolios[userId];
  });
}

function updatePortfolioValue(portfolio: PaperPortfolio) {
  let totalValue = portfolio.cash;
  Object.values(portfolio.positions).forEach((pos) => {
    const drift = 1 + (Math.random() - 0.5) * 0.01;
    pos.currentValue = pos.currentValue * drift;
    pos.unrealizedPnl = pos.currentValue - pos.costBasis;
    totalValue += pos.currentValue;
  });
  portfolio.totalValue = totalValue;
  portfolio.totalReturn = (totalValue - 100000) / 100000;
  portfolio.lastUpdate = nowISO();
}

export async function getPortfolio(userId: string) {
  const state = await readState();
  const portfolio = state.portfolios[userId];
  if (!portfolio) return null;
  updatePortfolioValue(portfolio);
  return portfolio;
}

export async function placePaperOrder(params: {
  userId: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}) {
  return runExclusive(async () => {
    const state = await readState();
    const portfolio = state.portfolios[params.userId];
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }
    const totalCost = params.quantity * params.price;
    if (params.action === 'BUY' && portfolio.cash < totalCost) {
      throw new Error('Yetersiz nakit');
    }
    if (params.action === 'SELL') {
      const existing = portfolio.positions[params.symbol];
      if (!existing || existing.quantity < params.quantity) {
        throw new Error('Yetersiz pozisyon');
      }
    }
    const order: PaperOrder = {
      id: 'PAPER-' + Date.now(),
      userId: params.userId,
      symbol: params.symbol,
      action: params.action,
      quantity: params.quantity,
      price: params.price,
      totalCost,
      status: 'filled',
      createdAt: nowISO(),
    };
    if (params.action === 'BUY') {
      portfolio.cash -= totalCost;
      const existing = portfolio.positions[params.symbol];
      if (existing) {
        const newQty = existing.quantity + params.quantity;
        const newCost = existing.costBasis + totalCost;
        existing.quantity = newQty;
        existing.costBasis = newCost;
        existing.avgPrice = newCost / newQty;
        existing.currentValue = newQty * params.price;
        existing.unrealizedPnl = existing.currentValue - existing.costBasis;
      } else {
        portfolio.positions[params.symbol] = {
          quantity: params.quantity,
          avgPrice: params.price,
          costBasis: totalCost,
          currentValue: totalCost,
          unrealizedPnl: 0,
        };
      }
    } else {
      const existing = portfolio.positions[params.symbol]!;
      existing.quantity -= params.quantity;
      existing.costBasis -= params.quantity * existing.avgPrice;
      existing.currentValue = existing.quantity * params.price;
      existing.unrealizedPnl = existing.currentValue - existing.costBasis;
      portfolio.cash += totalCost;
      if (existing.quantity <= 0) {
        delete portfolio.positions[params.symbol];
      }
    }
    portfolio.totalTrades += 1;
    updatePortfolioValue(portfolio);
    state.orders.push(order);
    await fs.mkdir(path.dirname(tradeLogPath), { recursive: true });
    await fs.appendFile(tradeLogPath, JSON.stringify(order) + '\n', 'utf8');
    await writeState(state);
    return { order, portfolio };
  });
}

export async function listOrders(userId: string, limit = 20) {
  const state = await readState();
  return state.orders
    .filter((order) => order.userId === userId)
    .slice(-limit)
    .reverse();
}
