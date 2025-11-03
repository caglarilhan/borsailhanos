/**
 * P0-C7: Model Config Single Source of Truth (SSOT)
 * Model sürümü ve kaynak adı tek config'den gelir
 */

export interface ModelConfig {
  modelVersion: string; // e.g., 'v5.1'
  dataSource: string; // e.g., 'mock-v5.2', 'real-v6.0'
  environment: 'production' | 'development' | 'test';
  timestamp: string; // ISO timestamp
}

const defaultConfig: ModelConfig = {
  modelVersion: process.env.NEXT_PUBLIC_MODEL_VERSION || 'v5.1',
  dataSource: process.env.NEXT_PUBLIC_DATA_SOURCE || 'mock-v5.2',
  environment: (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'production' | 'development' | 'test',
  timestamp: new Date().toISOString(),
};

/**
 * SSOT: Model Config
 */
export function getModelConfig(): ModelConfig {
  // Client-side: localStorage'dan oku (user preference)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('modelConfig');
      if (stored) {
        const parsed = JSON.parse(stored) as ModelConfig;
        return { ...defaultConfig, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to read modelConfig from localStorage:', e);
    }
  }
  
  return defaultConfig;
}

/**
 * Set model config (user preference)
 */
export function setModelConfig(config: Partial<ModelConfig>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const current = getModelConfig();
    const updated = {
      ...current,
      ...config,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('modelConfig', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save modelConfig to localStorage:', e);
  }
}

/**
 * Get model display string
 */
export function getModelDisplay(): string {
  const config = getModelConfig();
  const envBadge = config.environment === 'production' 
    ? '✅ Canlı' 
    : config.environment === 'test' 
    ? '🧪 Test Modu' 
    : '🔄 Geliştirme';
  
  return `${config.modelVersion} • ${config.dataSource} • ${envBadge}`;
}

/**
 * Get model version badge
 */
export function getModelBadge(): { label: string; color: string } {
  const config = getModelConfig();
  
  if (config.environment === 'production') {
    return { label: '✅ Canlı', color: 'bg-green-500/20 text-green-400 border-green-400/30' };
  } else if (config.environment === 'test') {
    return { label: '🧪 Test Modu', color: 'bg-orange-500/20 text-orange-400 border-orange-400/30' };
  } else {
    return { label: '🔄 Geliştirme', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30' };
  }
}


