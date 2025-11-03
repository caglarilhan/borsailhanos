/**
 * P0-C4: Distinct Top-N Lists
 * Top-N listelerde symbol bazlı distinct()
 */

export interface TopNItem {
  symbol: string;
  [key: string]: any; // Other fields
}

/**
 * Get distinct Top-N items by symbol
 * @param items - Array of items with symbol field
 * @param n - Number of items to return
 * @returns Distinct items (first occurrence of each symbol)
 */
export function getDistinctTopN<T extends TopNItem>(
  items: T[],
  n: number,
  sortBy?: (a: T, b: T) => number
): T[] {
  // If sortBy provided, sort first
  const sorted = sortBy ? [...items].sort(sortBy) : items;
  
  // Get distinct by symbol (first occurrence)
  const seen = new Set<string>();
  const distinct: T[] = [];
  
  for (const item of sorted) {
    if (!seen.has(item.symbol)) {
      seen.add(item.symbol);
      distinct.push(item);
      
      if (distinct.length >= n) {
        break;
      }
    }
  }
  
  return distinct;
}

/**
 * Get distinct Top-N items with custom key
 * @param items - Array of items
 * @param n - Number of items to return
 * @param keyFn - Function to extract unique key
 * @param sortBy - Optional sort function
 * @returns Distinct items (first occurrence of each key)
 */
export function getDistinctTopNByKey<T>(
  items: T[],
  n: number,
  keyFn: (item: T) => string,
  sortBy?: (a: T, b: T) => number
): T[] {
  // If sortBy provided, sort first
  const sorted = sortBy ? [...items].sort(sortBy) : items;
  
  // Get distinct by key (first occurrence)
  const seen = new Set<string>();
  const distinct: T[] = [];
  
  for (const item of sorted) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      distinct.push(item);
      
      if (distinct.length >= n) {
        break;
      }
    }
  }
  
  return distinct;
}


