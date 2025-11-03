/**
 * P0-1: Veri Kaynağı Tutarlılığı
 * Mock/real/hybrid veri kaynağı yönetimi ve etiketleme
 */

export type DataSourceMode = 'mock' | 'real' | 'hybrid';

export interface DataSourceConfig {
  mode: DataSourceMode;
  label: string;
  badge: string;
  badgeColor: string;
  isTestMode: boolean;
}

/**
 * Environment'dan veri kaynağı modunu belirle
 */
export function getDataSourceMode(): DataSourceMode {
  if (typeof window === 'undefined') {
    // SSR: Environment variable kontrol et
    const envMode = process.env.NEXT_PUBLIC_DATA_SOURCE_MODE?.toLowerCase();
    if (envMode === 'real' || envMode === 'hybrid') {
      return envMode as DataSourceMode;
    }
    return 'mock'; // Default mock in development
  }

  // Client-side: localStorage'dan oku (user preference)
  try {
    const stored = localStorage.getItem('dataSourceMode');
    if (stored === 'real' || stored === 'hybrid') {
      return stored as DataSourceMode;
    }
  } catch (e) {
    console.warn('Failed to read dataSourceMode from localStorage:', e);
  }

  // Fallback: Environment variable
  const envMode = process.env.NEXT_PUBLIC_DATA_SOURCE_MODE?.toLowerCase();
  if (envMode === 'real' || envMode === 'hybrid') {
    return envMode as DataSourceMode;
  }

  // Production'da real, development'ta mock
  return process.env.NODE_ENV === 'production' ? 'real' : 'mock';
}

/**
 * Veri kaynağı konfigürasyonunu al
 */
export function getDataSourceConfig(): DataSourceConfig {
  const mode = getDataSourceMode();
  
  switch (mode) {
    case 'real':
      return {
        mode: 'real',
        label: 'Gerçek Veri',
        badge: '✅ Canlı',
        badgeColor: 'bg-green-500/20 text-green-400 border-green-400/30',
        isTestMode: false,
      };
    case 'hybrid':
      return {
        mode: 'hybrid',
        label: 'Karma (Gerçek + Mock)',
        badge: '🔄 Hybrid',
        badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
        isTestMode: true,
      };
    case 'mock':
    default:
      return {
        mode: 'mock',
        label: 'Test Modu',
        badge: '🧪 Test Modu',
        badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-400/30',
        isTestMode: true,
      };
  }
}

/**
 * Veri kaynağı badge bilgilerini al (render için)
 * Note: JSX component'i kullanmak için BistSignals.tsx içinde render edin
 */
export function getDataSourceBadgeInfo(className: string = '') {
  const config = getDataSourceConfig();
  
  return {
    badge: config.badge,
    badgeColor: config.badgeColor,
    className: `inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${config.badgeColor} ${className}`,
  };
}

/**
 * Veri kaynağı durumunu kontrol et (API response validation)
 */
export function validateDataSource(response: any, expectedMode?: DataSourceMode): boolean {
  if (!response) return false;
  
  const mode = expectedMode || getDataSourceMode();
  
  // Mock mode: response'un mock olduğunu kontrol et
  if (mode === 'mock') {
    // Mock veri genellikle belirli pattern'lere sahiptir
    return response._mock !== false; // _mock flag varsa mock
  }
  
  // Real mode: response'un gerçek olduğunu kontrol et
  if (mode === 'real') {
    // Real veri genellikle timestamp ve source bilgisi içerir
    return response.timestamp !== undefined || response.source !== undefined;
  }
  
  // Hybrid mode: her ikisi de olabilir
  return true;
}

/**
 * Veri kaynağı modunu değiştir (user preference)
 */
export function setDataSourceMode(mode: DataSourceMode): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('dataSourceMode', mode);
    localStorage.setItem('dataSourceModeUpdatedAt', new Date().toISOString());
  } catch (e) {
    console.error('Failed to set dataSourceMode in localStorage:', e);
  }
}

