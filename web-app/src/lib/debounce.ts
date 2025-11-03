/**
 * Debounce utility
 * Prevents function from being called too frequently
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Debounce hook for React components
 */
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  return React.useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      func(...args);
    }, wait);
  }, [func, wait]) as T;
}


