import { useState, useEffect, useCallback } from 'react';

interface MobileAppState {
  isOffline: boolean;
  lastSync: string | null;
  pushToken: string | null;
  deviceId: string | null;
  appConfig: {
    offlineMode: boolean;
    pushNotifications: boolean;
    biometricAuth: boolean;
  };
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  offlineData: {
    patients: any[];
    appointments: any[];
    notes: any[];
    medications: any[];
  };
}

interface UseMobileAppReturn {
  // State
  isOffline: boolean;
  lastSync: string | null;
  pushToken: string | null;
  deviceId: string | null;
  appConfig: MobileAppState['appConfig'];
  syncStatus: MobileAppState['syncStatus'];
  offlineData: MobileAppState['offlineData'];
  
  // Actions
  initializeApp: () => Promise<void>;
  syncData: () => Promise<void>;
  saveOfflineData: (key: string, data: any) => Promise<void>;
  loadOfflineData: (key: string) => Promise<any>;
  scheduleNotification: (notification: any) => Promise<void>;
  updateAppConfig: (config: Partial<MobileAppState['appConfig']>) => Promise<void>;
  registerDevice: () => Promise<void>;
  toggleOfflineMode: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
}

export function useMobileApp(): UseMobileAppReturn {
  const [state, setState] = useState<MobileAppState>({
    isOffline: false,
    lastSync: null,
    pushToken: null,
    deviceId: null,
    appConfig: {
      offlineMode: false,
      pushNotifications: true,
      biometricAuth: false
    },
    syncStatus: 'idle',
    offlineData: {
      patients: [],
      appointments: [],
      notes: [],
      medications: []
    }
  });

  // Initialize mobile app
  const initializeApp = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, syncStatus: 'syncing' }));
      
      // Generate device ID if not exists
      let deviceId = state.deviceId;
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setState(prev => ({ ...prev, deviceId }));
      }

      // Register device with server
      await registerDevice();
      
      // Load saved configuration
      const savedConfig = localStorage.getItem('mobileAppConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setState(prev => ({ ...prev, appConfig: { ...prev.appConfig, ...config } }));
      }

      // Load offline data
      const savedData = localStorage.getItem('offlineData');
      if (savedData) {
        const data = JSON.parse(savedData);
        setState(prev => ({ ...prev, offlineData: { ...prev.offlineData, ...data } }));
      }

      // Load last sync time
      const lastSync = localStorage.getItem('lastSync');
      if (lastSync) {
        setState(prev => ({ ...prev, lastSync }));
      }

      setState(prev => ({ ...prev, syncStatus: 'success' }));
    } catch (error) {
      console.error('Failed to initialize mobile app:', error);
      setState(prev => ({ ...prev, syncStatus: 'error' }));
    }
  }, [state.deviceId]);

  // Sync data with server
  const syncData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, syncStatus: 'syncing' }));
      
      const response = await fetch('/api/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync-data',
          data: {
            userId: 'current-user', // In a real app, get from auth context
            lastSync: state.lastSync,
            data: state.offlineData
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const now = new Date().toISOString();
        setState(prev => ({ 
          ...prev, 
          lastSync: now,
          syncStatus: 'success',
          offlineData: { ...prev.offlineData, ...result.updates }
        }));
        
        localStorage.setItem('lastSync', now);
        localStorage.setItem('offlineData', JSON.stringify(state.offlineData));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to sync data:', error);
      setState(prev => ({ ...prev, syncStatus: 'error' }));
    }
  }, [state.lastSync, state.offlineData]);

  // Save data offline
  const saveOfflineData = useCallback(async (key: string, data: any) => {
    try {
      setState(prev => ({
        ...prev,
        offlineData: { ...prev.offlineData, [key]: data }
      }));
      
      localStorage.setItem('offlineData', JSON.stringify({
        ...state.offlineData,
        [key]: data
      }));
      
      // Also save to server for backup
      await fetch('/api/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'offline-data',
          data: {
            userId: 'current-user',
            key,
            data
          }
        })
      });
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }, [state.offlineData]);

  // Load data offline
  const loadOfflineData = useCallback(async (key: string) => {
    try {
      const data = localStorage.getItem('offlineData');
      if (data) {
        const parsedData = JSON.parse(data);
        return parsedData[key];
      }
      return null;
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return null;
    }
  }, []);

  // Schedule notification
  const scheduleNotification = useCallback(async (notification: any) => {
    try {
      await fetch('/api/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'notification-schedule',
          data: {
            userId: 'current-user',
            notifications: [notification]
          }
        })
      });
      
      // In a real React Native app, you would use the native notification API
      console.log('Notification scheduled:', notification);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }, []);

  // Update app configuration
  const updateAppConfig = useCallback(async (config: Partial<MobileAppState['appConfig']>) => {
    try {
      const newConfig = { ...state.appConfig, ...config };
      setState(prev => ({ ...prev, appConfig: newConfig }));
      
      localStorage.setItem('mobileAppConfig', JSON.stringify(newConfig));
      
      await fetch('/api/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'app-config',
          data: {
            userId: 'current-user',
            config: newConfig
          }
        })
      });
    } catch (error) {
      console.error('Failed to update app config:', error);
    }
  }, [state.appConfig]);

  // Register device
  const registerDevice = useCallback(async () => {
    try {
      const response = await fetch('/api/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register-device',
          data: {
            deviceId: state.deviceId,
            platform: 'web', // In a real RN app, this would be 'ios' or 'android'
            appVersion: '1.0.0',
            pushToken: state.pushToken
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('Device registered successfully');
      }
    } catch (error) {
      console.error('Failed to register device:', error);
    }
  }, [state.deviceId, state.pushToken]);

  // Toggle offline mode
  const toggleOfflineMode = useCallback(async () => {
    const newOfflineMode = !state.appConfig.offlineMode;
    await updateAppConfig({ offlineMode: newOfflineMode });
    setState(prev => ({ ...prev, isOffline: newOfflineMode }));
  }, [state.appConfig.offlineMode, updateAppConfig]);

  // Clear offline data
  const clearOfflineData = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        offlineData: {
          patients: [],
          appointments: [],
          notes: [],
          medications: []
        }
      }));
      
      localStorage.removeItem('offlineData');
      console.log('Offline data cleared');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }, []);

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return {
    // State
    isOffline: state.isOffline,
    lastSync: state.lastSync,
    pushToken: state.pushToken,
    deviceId: state.deviceId,
    appConfig: state.appConfig,
    syncStatus: state.syncStatus,
    offlineData: state.offlineData,
    
    // Actions
    initializeApp,
    syncData,
    saveOfflineData,
    loadOfflineData,
    scheduleNotification,
    updateAppConfig,
    registerDevice,
    toggleOfflineMode,
    clearOfflineData,
  };
}
