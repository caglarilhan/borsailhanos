/**
 * Timestamp Utilities
 * Sprint 1: Veri Güncelliği - Timestamp normalizasyonu ve dinamik değerler
 * UTC+3 normalizasyonu ve relative time formatting
 */

import React from 'react';

/**
 * Get current time in UTC+3 (Istanbul timezone)
 */
export function getCurrentUTC3Time(): Date {
  const now = new Date();
  // Convert to UTC+3
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const istanbulTime = new Date(utcTime + (3 * 60 * 60 * 1000));
  return istanbulTime;
}

/**
 * Format timestamp with UTC+3 timezone
 * @param date - Date to format
 * @returns Formatted string: "YYYY-MM-DD HH:mm:ss UTC+3"
 */
export function formatTimestampUTC3(date: Date | string | null | undefined): string {
  if (!date) return '—';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  // Format with Istanbul timezone
  const formatted = d.toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  return `${formatted} UTC+3`;
}

/**
 * Format relative time with UTC+3 timestamp
 * @param date - Date to compare
 * @returns Formatted string: "5 dk önce (2025-01-15 04:35 UTC+3)"
 */
export function formatRelativeTimeWithUTC3(date: Date | string | null | undefined): string {
  if (!date) return '—';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  const now = getCurrentUTC3Time();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  const utc3Time = formatTimestampUTC3(d);
  
  if (diffMins < 1) return `Az önce (${utc3Time})`;
  if (diffMins < 60) return `${diffMins} dk önce (${utc3Time})`;
  if (diffHours < 24) return `${diffHours} sa önce (${utc3Time})`;
  if (diffDays < 7) return `${diffDays} gün önce (${utc3Time})`;
  
  return utc3Time;
}

/**
 * Get last update timestamp string
 * @returns Formatted string: "Son güncelleme: YYYY-MM-DD HH:mm:ss UTC+3"
 */
export function getLastUpdateTimestamp(): string {
  const now = getCurrentUTC3Time();
  return `Son güncelleme: ${formatTimestampUTC3(now)}`;
}

/**
 * Auto-refresh timestamp every interval
 * @param intervalMs - Refresh interval in milliseconds (default: 60000 = 1 minute)
 * @returns Current timestamp that updates at interval
 */
export function useAutoRefreshTimestamp(intervalMs: number = 60000): string {
  const [timestamp, setTimestamp] = React.useState(getLastUpdateTimestamp());
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(getLastUpdateTimestamp());
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [intervalMs]);
  
  return timestamp;
}

