/**
 * Lazy Load Hook
 * Performance optimization with lazy loading
 */

import { useEffect, useState, useRef, useCallback } from 'react';

export interface LazyLoadOptions {
  threshold?: number; // Intersection observer threshold (0-1)
  rootMargin?: string; // Intersection observer root margin
  enabled?: boolean; // Enable/disable lazy loading
}

/**
 * Lazy load component with Intersection Observer
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: LazyLoadOptions = {}
): [React.RefObject<T>, boolean] {
  const { threshold = 0.1, rootMargin = '50px', enabled = true } = options;
  const [isVisible, setIsVisible] = useState(!enabled);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (!enabled || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
      observer.disconnect();
    };
  }, [enabled, isVisible, threshold, rootMargin]);

  return [elementRef, isVisible];
}

/**
 * Lazy load data (debounced)
 */
export function useLazyData<T>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = [],
  enabled: boolean = true
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Debounce fetch
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFn();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);

  return { data, loading, error };
}

/**
 * Memoized heavy calculation
 */
export function useMemoized<T>(
  computeFn: () => T,
  deps: React.DependencyList
): T {
  const [value, setValue] = useState<T>(computeFn);

  useEffect(() => {
    setValue(computeFn());
  }, deps);

  return value;
}



