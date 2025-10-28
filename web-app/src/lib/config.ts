// BIST AI Smart Trader - Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
export const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL || "ws://localhost:8081";

// Environment configuration
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// API endpoints
export const API_ENDPOINTS = {
  SIGNALS: `${API_BASE_URL}/api/signals`,
  PRICES: `${API_BASE_URL}/api/prices`,
  MARKET_OVERVIEW: `${API_BASE_URL}/api/market/overview`,
  HEALTH: `${API_BASE_URL}/api/health`,
  PREDICTIONS: `${API_BASE_URL}/api/predictions`,
  WATCHLIST: `${API_BASE_URL}/api/watchlist`,
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
} as const;

// WebSocket configuration
export const WS_CONFIG = {
  URL: REALTIME_URL,
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 5,
  HEARTBEAT_INTERVAL: 30000,
} as const;

// Application configuration
export const APP_CONFIG = {
  NAME: "BIST AI Smart Trader",
  VERSION: "3.5.0",
  DESCRIPTION: "Yapay zeka destekli BIST hisse senedi analiz ve tahmin platformu",
  AUTHOR: "Çağlar İlhan",
  REPOSITORY: "https://github.com/caglarilhan/borsailhanos",
} as const;

// Feature flags
export const FEATURES = {
  REALTIME_DATA: true,
  AI_PREDICTIONS: true,
  WEB_SOCKET: true,
  NOTIFICATIONS: true,
  WATCHLIST: true,
  RISK_MANAGEMENT: true,
  TECHNICAL_ANALYSIS: true,
  SENTIMENT_ANALYSIS: true,
  PATTERN_DETECTION: true,
  BACKTESTING: true,
} as const;

// Default values
export const DEFAULTS = {
  REFRESH_INTERVAL: 5000,
  CHART_HEIGHT: 400,
  MAX_SIGNALS: 50,
  MAX_WATCHLIST_ITEMS: 20,
  TIMEOUT: 10000,
} as const;