'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type { AiModuleConfig, AiModuleConfigContextValue, AiModuleId } from '@/types/ai-module-config';
import { DEFAULT_AI_MODULE_CONFIG } from '@/types/ai-module-config';

const AiModuleConfigContext = createContext<AiModuleConfigContextValue | undefined>(undefined);

const STORAGE_KEY = 'ai_module_config';

function loadConfigFromStorage(): AiModuleConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_AI_MODULE_CONFIG;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AiModuleConfig>;
      // Merge with defaults to ensure all keys exist
      return { ...DEFAULT_AI_MODULE_CONFIG, ...parsed };
    }
  } catch (error) {
    console.error('[AI_MODULE_CONFIG] Failed to load from storage:', error);
  }

  return DEFAULT_AI_MODULE_CONFIG;
}

function saveConfigToStorage(config: AiModuleConfig): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('[AI_MODULE_CONFIG] Failed to save to storage:', error);
  }
}

export function AiModuleConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AiModuleConfig>(loadConfigFromStorage);

  // Load from storage on mount
  useEffect(() => {
    const loaded = loadConfigFromStorage();
    setConfig(loaded);
  }, []);

  // Save to storage whenever config changes
  useEffect(() => {
    saveConfigToStorage(config);
  }, [config]);

  const isEnabled = useCallback(
    (moduleId: AiModuleId): boolean => {
      return config[moduleId] === true;
    },
    [config],
  );

  const enable = useCallback((moduleId: AiModuleId) => {
    setConfig((prev) => ({ ...prev, [moduleId]: true }));
  }, []);

  const disable = useCallback((moduleId: AiModuleId) => {
    setConfig((prev) => ({ ...prev, [moduleId]: false }));
  }, []);

  const toggle = useCallback((moduleId: AiModuleId) => {
    setConfig((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  }, []);

  const enableAll = useCallback(() => {
    setConfig((prev) => {
      const allEnabled: AiModuleConfig = {} as AiModuleConfig;
      (Object.keys(prev) as AiModuleId[]).forEach((key) => {
        allEnabled[key] = true;
      });
      return allEnabled;
    });
  }, []);

  const disableAll = useCallback(() => {
    setConfig((prev) => {
      const allDisabled: AiModuleConfig = {} as AiModuleConfig;
      (Object.keys(prev) as AiModuleId[]).forEach((key) => {
        allDisabled[key] = false;
      });
      return allDisabled;
    });
  }, []);

  const reset = useCallback(() => {
    setConfig(DEFAULT_AI_MODULE_CONFIG);
  }, []);

  const value = useMemo<AiModuleConfigContextValue>(
    () => ({
      config,
      isEnabled,
      enable,
      disable,
      toggle,
      enableAll,
      disableAll,
      reset,
    }),
    [config, isEnabled, enable, disable, toggle, enableAll, disableAll, reset],
  );

  return <AiModuleConfigContext.Provider value={value}>{children}</AiModuleConfigContext.Provider>;
}

export function useAiModuleConfig() {
  const context = useContext(AiModuleConfigContext);
  if (!context) {
    throw new Error('useAiModuleConfig must be used within AiModuleConfigProvider');
  }
  return context;
}

