'use client';

// Merkezi API katmanı – tüm fetch çağrılarını buradan yönetin

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:18085';
const API_CANDIDATES = Array.from(new Set([
  API_BASE_URL,
  'http://127.0.0.1:18100',
  'http://127.0.0.1:18085',
  'http://localhost:18100',
  'http://localhost:18085',
]));

async function fetchSmart(input: string, init?: RequestInit): Promise<any> {
  const url = input;
  const candidates: string[] = [];
  const isAbsolute = /^https?:\/\//i.test(url);
  const pathOnly = isAbsolute ? url.replace(/^https?:\/\/[^/]+/, '') : '/' + url.replace(/^\//, '');
  const origin = (typeof window !== 'undefined' ? window.location.origin : '');
  if (isAbsolute) {
    for (const base of API_CANDIDATES) {
      const baseHost = (API_BASE_URL || '').replace(/\/$/, '');
      candidates.push(url.replace(baseHost, base.replace(/\/$/, '')));
    }
  } else {
    for (const base of API_CANDIDATES) {
      candidates.push(base.replace(/\/$/, '') + '/' + url.replace(/^\//, ''));
    }
  }
  if (origin) candidates.push(origin.replace(/\/$/, '') + pathOnly);

  let lastErr: any = null;
  for (const c of candidates) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(c, { cache: 'no-store', ...(init||{}), signal: controller.signal as any });
      clearTimeout(t);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) return await res.json();
      return await res.text();
    } catch (e) {
      lastErr = e;
      continue;
    }
  }
  throw lastErr || new Error('All API candidates failed');
}

// AI Predictions (BIST30/100/300)
export async function getBistPredictions(universe: 'BIST30'|'BIST100'|'BIST300', horizons: string, all: boolean = true) {
  const base = universe==='BIST30' ? 'bist30_predictions' : (universe==='BIST100' ? 'bist100_predictions' : 'bist300_predictions');
  return await fetchSmart(`${API_BASE_URL}/api/ai/${base}?horizons=${horizons}&all=${all?1:0}`);
}

export async function getPredictiveTwin(symbol: string) {
  return await fetchSmart(`${API_BASE_URL}/api/ai/predictive_twin?symbol=${encodeURIComponent(symbol)}`);
}

export async function getSentimentSummary() {
  return await fetchSmart(`${API_BASE_URL}/api/sentiment/summary`);
}

export async function getBist30Overview() {
  return await fetchSmart(`${API_BASE_URL}/api/ai/bist30_overview`);
}

export async function getBist30News() {
  return await fetchSmart(`${API_BASE_URL}/api/news/bist30`);
}

export async function getAlertsGenerate(deltaPct = 5, minConf = 70, source = 'AI v4.6 model BIST30 dataset') {
  return await fetchSmart(`${API_BASE_URL}/api/alerts/generate?delta=${deltaPct}&min_conf=${minConf}&source=${encodeURIComponent(source)}`);
}

export async function getBacktestReport(horizon: '3m'|'6m'|'12m' = '6m', benchmark = 'BIST30') {
  return await fetchSmart(`${API_BASE_URL}/api/backtest/report?horizon=${horizon}&benchmark=${encodeURIComponent(benchmark)}`);
}

export async function getDailySummary() {
  return await fetchSmart(`${API_BASE_URL}/api/daily_summary`);
}

export async function postFeedback(payload: any) {
  return await fetchSmart(`${API_BASE_URL}/api/feedback/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  });
}

export async function getWatchlist() {
  return await fetchSmart(`${API_BASE_URL}/api/watchlist/get`);
}

export async function updateWatchlist(symbols: string|string[], mode: 'add'|'remove'|'toggle'='toggle') {
  const list = Array.isArray(symbols) ? symbols.join(',') : symbols;
  return await fetchSmart(`${API_BASE_URL}/api/watchlist/update?symbols=${encodeURIComponent(list)}&mode=${mode}`);
}

export async function updateWatchlistPost(symbols: string|string[], mode: 'add'|'remove'|'toggle'='toggle') {
  const list = Array.isArray(symbols) ? symbols.join(',') : symbols;
  return await fetchSmart(`${API_BASE_URL}/api/watchlist/update?symbols=${encodeURIComponent(list)}&mode=${mode}` as any, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbols: list, mode }),
  });
}

export async function getNasdaqPredictions(horizons = '1d,4h') {
  return await fetchSmart(`${API_BASE_URL}/api/ai/nasdaq_predictions?horizons=${encodeURIComponent(horizons)}`);
}

export async function getNysePredictions(horizons = '1d,4h') {
  return await fetchSmart(`${API_BASE_URL}/api/ai/nyse_predictions?horizons=${encodeURIComponent(horizons)}`);
}

export async function getTop30Analysis() {
  return await fetchSmart(`${API_BASE_URL}/api/ai/top30_analysis`);
}

export async function getForecast(symbol: string, horizon: '1d'|'7d'|'30d'='1d') {
  return await fetchSmart(`${API_BASE_URL}/api/ai/forecast?symbol=${encodeURIComponent(symbol)}&horizon=${horizon}`);
}
    // AI core extras
    export async function getCalibration() {
      return await fetchSmart(`${API_BASE_URL}/api/ai/calibration`);
    }
    export async function getPredInterval(symbol: string, horizon: '1d'|'7d'|'30d'='1d') {
      return await fetchSmart(`${API_BASE_URL}/api/ai/pred_interval?symbol=${encodeURIComponent(symbol)}&horizon=${horizon}`);
    }
    export async function getRegime() {
      return await fetchSmart(`${API_BASE_URL}/api/ai/regime`);
    }
    export async function getFactors(symbol: string) {
      return await fetchSmart(`${API_BASE_URL}/api/ai/factors?symbol=${encodeURIComponent(symbol)}`);
    }
    export async function getRanker(universe: string='BIST30', topn: number=10) {
      return await fetchSmart(`${API_BASE_URL}/api/ai/ranker?universe=${encodeURIComponent(universe)}&topn=${topn}`);
    }

    // Quick backtest (transaction-cost aware)
    export async function getBacktestQuick(universe: string = 'BIST30', tcost_bps: number = 8, rebalance_days: number = 5) {
      return await fetchSmart(`${API_BASE_URL}/api/backtest/quick?universe=${encodeURIComponent(universe)}&tcost_bps=${tcost_bps}&rebalance_days=${rebalance_days}`);
    }

    // XAI Waterfall (mock)
    export async function getXaiWaterfall(symbol: string) {
      return await fetchSmart(`${API_BASE_URL}/api/xai/waterfall?symbol=${encodeURIComponent(symbol)}`);
    }

    // Analyst/Sector sentiment (mock)
    export async function getSentimentAnalyst(symbol: string) {
      return await fetchSmart(`${API_BASE_URL}/api/sentiment/analyst?symbol=${encodeURIComponent(symbol)}`);
    }

    // Telegram alert send (mock)
    export async function sendTelegramAlert(symbol: string, msg: string, chat: string = 'demo') {
      return await fetchSmart(`${API_BASE_URL}/api/alerts/telegram/send?symbol=${encodeURIComponent(symbol)}&msg=${encodeURIComponent(msg)}&chat=${encodeURIComponent(chat)}`);
    }

    // Strategy Lab (mock)
    export async function runStrategyLab(strategy: string, param: string) {
      return await fetchSmart(`${API_BASE_URL}/api/strategy/lab?strategy=${encodeURIComponent(strategy)}&param=${encodeURIComponent(param)}`);
    }

export const Api = {
  getBistPredictions,
  getPredictiveTwin,
  getSentimentSummary,
  getBist30Overview,
  getBist30News,
  getAlertsGenerate,
  getBacktestReport,
  getDailySummary,
  postFeedback,
  getWatchlist,
  updateWatchlist,
  updateWatchlistPost,
  getNasdaqPredictions,
  getNysePredictions,
  getTop30Analysis,
  getForecast,
      getBacktestQuick,
      getXaiWaterfall,
      getSentimentAnalyst,
      sendTelegramAlert,
      runStrategyLab,
      getCalibration,
      getPredInterval,
      getRegime,
      getFactors,
      getRanker,
};


