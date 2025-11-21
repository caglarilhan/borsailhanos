import { useEffect, useRef } from 'react';

/**
 * useAutoRefresh
 * Callback'i verilen intervalde tetikler, pencere görünürlüğünü dikkate alır.
 */
export function useAutoRefresh(
  callback?: () => void,
  interval = 15000,
  options: { runOnInit?: boolean } = { runOnInit: false }
) {
  const savedCallback = useRef<(() => void) | undefined>();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const shouldRun = options.runOnInit ?? false;
    if (shouldRun) {
      savedCallback.current?.();
    }
  }, [options.runOnInit]);

  useEffect(() => {
    function clearTimer() {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    function setupTimer() {
      clearTimer();
      if (!savedCallback.current || interval <= 0) return;
      timerRef.current = setInterval(() => {
        if (document.hidden) return;
        savedCallback.current?.();
      }, interval);
    }

    setupTimer();
    document.addEventListener('visibilitychange', setupTimer);

    return () => {
      document.removeEventListener('visibilitychange', setupTimer);
      clearTimer();
    };
  }, [interval]);
}

export default useAutoRefresh;

