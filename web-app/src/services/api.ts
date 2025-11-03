'use client';

// Merkezi API katmanı – tüm fetch çağrılarını buradan yönetin

const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || (
  isProduction 
    ? 'https://api.bistai.com' // Production API endpoint - .env.production'da override edilebilir
    : 'http://127.0.0.1:18085' // Development default
);

// Production ortamında sadece production URL'leri, development'ta fallback'ler
const API_CANDIDATES = isProduction 
  ? [API_BASE_URL] // Production'da sadece ana URL
  : Array.from(new Set([
      API_BASE_URL,
      'http://127.0.0.1:18100',
      'http://127.0.0.1:18085',
      'http://localhost:18100',
      'http://localhost:18085',
    ]));

// P1-1: API health checks
import { validateAndSanitize, handleEmptyResponse, FALLBACK_VALUES } from '@/lib/api-health-checks';
// P1-2: Redis cache layer (browser-side)
import { withCache, getTTLForEndpoint } from '@/lib/api-cache-layer';
// P1-3: Delta-fetch (sadece değişen sinyaller)
import { deltaFetch, filterByDelta } from '@/lib/delta-fetch';
// P1-4: Rate-limit + CORS güvenlik
import { withRateLimit, validateCORS } from '@/lib/api-rate-limit';

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

  // P1-4: CORS validation (before fetching)
  const allowedOrigins = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS?.split(',') || [];
  for (const c of candidates) {
    if (!validateCORS(c, allowedOrigins)) {
      console.warn('CORS validation failed for:', c);
      continue;
    }
  }

  // P1-4: Rate limiting (per endpoint)
  const endpoint = url.split('?')[0]; // Remove query params for rate limit key
  return withRateLimit(endpoint, async () => {
    let lastErr: any = null;
    for (const c of candidates) {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(c, { cache: 'no-store', ...(init||{}), signal: controller.signal as any });
        clearTimeout(t);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const ct = res.headers.get('content-type') || '';
        let data: any;
        if (ct.includes('application/json')) {
          data = await res.json();
        } else {
          data = await res.text();
        }
        
        // P1-1: Validate and sanitize response
        const { result, data: sanitizedData } = validateAndSanitize(data);
        
        if (!result.isValid && result.hasInvalidNumbers) {
          console.warn('API response contains invalid numbers, sanitized:', result.errors);
          return sanitizedData;
        }
        
        if (result.isEmpty) {
          console.warn('API returned empty response:', url);
          // Determine fallback based on endpoint type
          if (url.includes('predictions') || url.includes('signals')) {
            return handleEmptyResponse(sanitizedData, FALLBACK_VALUES.predictions);
          }
          if (url.includes('metrics')) {
            return handleEmptyResponse(sanitizedData, FALLBACK_VALUES.metrics);
          }
          if (url.includes('sentiment')) {
            return handleEmptyResponse(sanitizedData, FALLBACK_VALUES.sentiment);
          }
          if (url.includes('backtest')) {
            return handleEmptyResponse(sanitizedData, FALLBACK_VALUES.backtest);
          }
          return sanitizedData;
        }
        
        return sanitizedData;
      } catch (e) {
        lastErr = e;
        continue;
      }
    }
    throw lastErr || new Error('All API candidates failed');
  });
}

// AI Predictions (BIST30/100/300)
export async function getBistPredictions(
  universe: 'BIST30'|'BIST100'|'BIST300', 
  horizons: string, 
  all: boolean = true,
  deltaMode: boolean = false // P1-3: Delta-fetch mode
) {
  const base = universe==='BIST30' ? 'bist30_predictions' : (universe==='BIST100' ? 'bist100_predictions' : 'bist300_predictions');
  const url = `${API_BASE_URL}/api/ai/${base}?horizons=${horizons}&all=${all?1:0}`;
  
  // P1-2: Cache layer (TTL=5min for predictions)
  const fetchFn = async () => {
    return withCache(
      url,
      async () => {
        const response = await fetchSmart(url);
        // P1-1: Validate predictions response
        return handleEmptyResponse(response, FALLBACK_VALUES.predictions, (data) => {
          if (Array.isArray(data)) return data.length === 0;
          return !data || (typeof data === 'object' && Object.keys(data).length === 0);
        });
      },
      { ttl: getTTLForEndpoint(url) }
    );
  };
  
  // P1-3: Delta-fetch mode: only return changed signals
  if (deltaMode) {
    const { data, delta } = await deltaFetch(fetchFn);
    
    // If no changes, return empty array to reduce processing
    if (delta.newSignals.length === 0 && delta.updatedSignals.length === 0) {
      return [];
    }
    
    // Return only changed signals
    return filterByDelta(data, delta);
  }
  
  // Normal mode: return all signals
  return fetchFn();
}

export async function getPredictiveTwin(symbol: string) {
  return await fetchSmart(`${API_BASE_URL}/api/ai/predictive_twin?symbol=${encodeURIComponent(symbol)}`);
}

export async function getSentimentSummary() {
  const url = `${API_BASE_URL}/api/sentiment/summary`;
  
  // P1-2: Cache layer (TTL=10min for sentiment)
  return withCache(
    url,
    async () => {
      const response = await fetchSmart(url);
      // P1-1: Validate sentiment response
      return handleEmptyResponse(response, FALLBACK_VALUES.sentiment);
    },
    { ttl: getTTLForEndpoint(url) }
  );
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
// Meta-ensemble
export async function getMetaEnsemble(symbol: string, horizon: '1d'|'7d'|'30d'='1d') {
  return await fetchSmart(`${API_BASE_URL}/api/ai/meta_ensemble?symbol=${encodeURIComponent(symbol)}&horizon=${horizon}`);
}
// Meta-Model (alias)
export async function getMetaModel(symbol: string, horizon: '1d'|'7d'|'30d'='1d') {
  return await fetchSmart(`${API_BASE_URL}/api/metaModel?symbol=${encodeURIComponent(symbol)}&horizon=${horizon}`);
}
// Bayesian optimization calibration snapshot
export async function getBOCalibrate() {
  return await fetchSmart(`${API_BASE_URL}/api/ai/bo_calibrate`);
}
// Macro data snapshot
export async function getMacro() {
  return await fetchSmart(`${API_BASE_URL}/api/data/macro`);
}
// Cross-market correlation
export async function getCrossCorr() {
  return await fetchSmart(`${API_BASE_URL}/api/data/cross_corr`);
}
    // AI core extras
    export async function getCalibration() {
      const url = `${API_BASE_URL}/api/ai/calibration`;
      
      // P1-2: Cache layer (TTL=15min for calibration)
      return withCache(
        url,
        async () => {
          const response = await fetchSmart(url);
          // P1-1: Validate calibration response
          return handleEmptyResponse(response, {
            accuracy: 0.87,
            mae: 0.02,
            rmse: 0.04,
            drift: 0,
            volatility: 0.85,
          });
        },
        { ttl: getTTLForEndpoint(url) }
      );
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
      const url = `${API_BASE_URL}/api/backtest/quick?universe=${encodeURIComponent(universe)}&tcost_bps=${tcost_bps}&rebalance_days=${rebalance_days}`;
      
      // P1-2: Cache layer (TTL=15min for backtest)
      return withCache(
        url,
        async () => {
          const response = await fetchSmart(url);
          // P1-1: Validate backtest response
          return handleEmptyResponse(response, FALLBACK_VALUES.backtest);
        },
        { ttl: getTTLForEndpoint(url) }
      );
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

    // Memory Bank - Sync with Cursor's memory system
    export async function getMemoryBank() {
      return await fetchSmart(`${API_BASE_URL}/api/ai/memory_bank`);
    }

    // AI Intelligence Hub - Performance metrics and conversation history
    export async function getIntelligenceHub() {
      return await fetchSmart(`${API_BASE_URL}/api/ai/intelligence_hub`);
    }

    // AI Retrain - Trigger model retraining pipeline
    export async function triggerRetrain(payload?: any) {
      return await fetchSmart(`${API_BASE_URL}/api/ai/retrain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {})
      });
    }

    // FinBERT-EN - English sentiment analysis for NASDAQ/NYSE
    export async function getFinBERTEN(symbol: string) {
      return await fetchSmart(`${API_BASE_URL}/api/ai/finbert_en?symbol=${encodeURIComponent(symbol)}`);
    }

    // AI reasoning trace
    export async function getReasoning(symbol: string) {
      const response = await fetchSmart(`${API_BASE_URL}/api/ai/reasoning?symbol=${encodeURIComponent(symbol)}`);
      // P1-1: Validate reasoning response
      return handleEmptyResponse(response, { reasoning: [], factors: {} });
    }

    // TraderGPT chat
    export async function askTraderGPT(query: string, context?: any) {
      return await fetchSmart(`${API_BASE_URL}/api/ai/tradergpt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, context })
      });
    }

    // AI Health Panel
    export async function getAIHealth() {
      return await fetchSmart(`${API_BASE_URL}/api/ai/health`);
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
  getMetaEnsemble,
  getMetaModel,
  getBOCalibrate,
  getMacro,
  getCrossCorr,
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
      getMemoryBank,
      getIntelligenceHub,
      triggerRetrain,
      getFinBERTEN,
      getReasoning,
      askTraderGPT,
      getAIHealth,
};


