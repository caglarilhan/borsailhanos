/**
 * Alpaca Paper Trading API client helper.
 * FastAPI backend üzerinden Alpaca işlemlerini yönetir.
 */

const ALPACA_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface AlpacaAccount {
  account_number: string;
  status: string;
  currency: string;
  buying_power: number;
  cash: number;
  portfolio_value: number;
  equity: number;
  last_equity: number;
  multiplier: number;
  pattern_day_trader: boolean;
}

export interface AlpacaPosition {
  symbol: string;
  qty: number;
  side: string;
  market_value: number;
  cost_basis: number;
  unrealized_pl: number;
  unrealized_plpc: number;
  current_price: number;
  avg_entry_price: number;
}

export interface AlpacaOrder {
  id: string;
  client_order_id: string;
  symbol: string;
  qty: number;
  side: string;
  type: string;
  time_in_force: string;
  status: string;
  filled_qty: number;
  filled_avg_price: number | null;
  submitted_at: string | null;
  updated_at: string | null;
}

export interface AlpacaOrderRequest {
  symbol: string;
  qty: number;
  side: 'buy' | 'sell';
  order_type?: 'market' | 'limit' | 'stop' | 'stop_limit';
  time_in_force?: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: number;
  stop_price?: number;
}

export async function getAlpacaAccount(): Promise<AlpacaAccount | null> {
  try {
    const res = await fetch(`${ALPACA_API_BASE}/api/alpaca/account`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Alpaca account fetch error:', error);
    return null;
  }
}

export async function getAlpacaPositions(): Promise<AlpacaPosition[]> {
  try {
    const res = await fetch(`${ALPACA_API_BASE}/api/alpaca/positions`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.positions || [];
  } catch (error) {
    console.error('Alpaca positions fetch error:', error);
    return [];
  }
}

export async function placeAlpacaOrder(order: AlpacaOrderRequest): Promise<AlpacaOrder | null> {
  try {
    const res = await fetch(`${ALPACA_API_BASE}/api/alpaca/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Order failed');
    }
    return await res.json();
  } catch (error) {
    console.error('Alpaca order error:', error);
    throw error;
  }
}

export async function cancelAlpacaOrder(orderId: string): Promise<boolean> {
  try {
    const res = await fetch(`${ALPACA_API_BASE}/api/alpaca/orders/${orderId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error('Alpaca cancel order error:', error);
    return false;
  }
}

export async function getAlpacaOrders(status?: string, limit = 50): Promise<AlpacaOrder[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('limit', limit.toString());
    const res = await fetch(`${ALPACA_API_BASE}/api/alpaca/orders?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.orders || [];
  } catch (error) {
    console.error('Alpaca orders fetch error:', error);
    return [];
  }
}

