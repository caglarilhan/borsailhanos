/**
 * P5.2: Dynamic Timestamp Hook
 * Tarih/saat alanlarını dinamik güncellemek için hook
 */

import { useState, useEffect } from 'react';

export function useDynamicTimestamp(initialTimestamp?: Date | null, updateInterval: number = 60000) {
  const [currentTime, setCurrentTime] = useState<Date>(initialTimestamp || new Date());
  const [displayTime, setDisplayTime] = useState<string>('');

  useEffect(() => {
    // Set initial time
    if (initialTimestamp) {
      setCurrentTime(initialTimestamp);
    }

    // Update every minute (or specified interval)
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setDisplayTime(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, updateInterval);

    // Initial update
    setDisplayTime(currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    return () => clearInterval(interval);
  }, [initialTimestamp, updateInterval]);

  return {
    currentTime,
    displayTime,
    formattedDate: currentTime.toLocaleDateString('tr-TR'),
    formattedDateTime: currentTime.toLocaleString('tr-TR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }),
    formattedTime: displayTime,
  };
}


