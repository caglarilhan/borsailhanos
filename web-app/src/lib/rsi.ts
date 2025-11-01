/**
 * RSI State Mapping Utilities
 * Maps RSI values (0-100) to overbought/oversold/neutral states
 */

export type RSIState = 'overbought' | 'oversold' | 'neutral';

/**
 * Map RSI value to state
 * @param rsi - RSI value (0-100)
 * @returns RSI state: overbought (>70), oversold (<30), neutral (30-70)
 */
export function mapRSIToState(rsi: number): RSIState {
  if (rsi > 70) return 'overbought';
  if (rsi < 30) return 'oversold';
  return 'neutral';
}

/**
 * Get RSI state label in Turkish
 */
export function getRSIStateLabel(rsi: number): string {
  const state = mapRSIToState(rsi);
  switch (state) {
    case 'overbought':
      return 'aşırı alım';
    case 'oversold':
      return 'aşırı satım';
    default:
      return 'nötr';
  }
}

/**
 * Get RSI state color for UI
 */
export function getRSIStateColor(rsi: number): string {
  const state = mapRSIToState(rsi);
  switch (state) {
    case 'overbought':
      return 'text-red-600'; // Red for overbought (sell signal)
    case 'oversold':
      return 'text-green-600'; // Green for oversold (buy signal)
    default:
      return 'text-slate-600'; // Gray for neutral
  }
}

