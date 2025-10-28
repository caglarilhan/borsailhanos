/**
 * BIST Sector Mapping
 * Maps stock symbols to their sectors
 */

export const BIST_SECTOR_MAP: Record<string, string> = {
  // Bankacılık
  'AKBNK': 'Bankacılık',
  'GARAN': 'Bankacılık',
  'ISCTR': 'Bankacılık',
  'YKBNK': 'Bankacılık',
  'HALKB': 'Bankacılık',
  
  // Enerji
  'TUPRS': 'Enerji',
  'PETKM': 'Enerji',
  'ASELS': 'Savunma',
  
  // Ulaştırma & Havacılık
  'THYAO': 'Ulaştırma',
  'PGSUS': 'Ulaştırma',
  
  // Sanayi
  'EREGL': 'Sanayi',
  'SISE': 'Sanayi',
  'KRDMD': 'Kimya',
  
  // Teknoloji
  'LOGO': 'Teknoloji',
  'MEGAP': 'Teknoloji',
  
  // Gıda
  'ULUSE': 'Gıda',
  'OYAKC': 'Gıda',
  
  // İnşaat
  'ENKAI': 'İnşaat',
  'YGYO': 'İnşaat',
  
  // Holding
  'SAHOL': 'Holding',
  'KOZAL': 'Holding',
};

/**
 * Get sector for a symbol
 */
export function getSectorForSymbol(symbol: string): string {
  return BIST_SECTOR_MAP[symbol] || 'Diğer';
}

/**
 * Get all symbols in a sector
 */
export function getSymbolsInSector(sector: string): string[] {
  return Object.entries(BIST_SECTOR_MAP)
    .filter(([_, s]) => s === sector)
    .map(([symbol, _]) => symbol);
}

/**
 * Check if symbol exists in map
 */
export function isBISTSymbol(symbol: string): boolean {
  return symbol in BIST_SECTOR_MAP;
}
