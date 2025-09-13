"use client";

import { useState, useCallback } from 'react';

interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  testCode: string;
  result: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  labName: string;
  orderedBy: string;
  orderedDate: string;
  resultDate: string;
  notes?: string;
  interpretation?: string;
  recommendations?: string[];
}

interface LabIntegration {
  id: string;
  name: string;
  type: 'hl7' | 'api' | 'file' | 'manual';
  endpoint?: string;
  credentials?: any;
  isActive: boolean;
  lastSync?: string;
  syncFrequency: number;
}

interface LabAnalytics {
  totalTests: number;
  abnormalResults: number;
  criticalResults: number;
  normalResults: number;
  abnormalRate: number;
  criticalRate: number;
  testTypes: Record<string, number>;
  averageProcessingTime: number;
}

interface QualityMetrics {
  totalResults: number;
  missingInterpretations: number;
  missingRecommendations: number;
  incompleteResults: number;
  qualityScore: number;
}

export const useLaboratoryIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = useCallback(async (url: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API call failed');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lab Integrations
  const getLabIntegrations = useCallback(async (): Promise<LabIntegration[]> => {
    const response = await handleApiCall('/api/laboratory-integration?action=get-integrations');
    return response.data;
  }, [handleApiCall]);

  const createLabIntegration = useCallback(async (integration: Omit<LabIntegration, 'id'>): Promise<LabIntegration> => {
    const response = await handleApiCall('/api/laboratory-integration', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create-integration',
        data: integration,
      }),
    });
    return response.data;
  }, [handleApiCall]);

  const updateLabIntegration = useCallback(async (id: string, updates: Partial<LabIntegration>): Promise<LabIntegration> => {
    const response = await handleApiCall('/api/laboratory-integration', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update-integration',
        data: { id, updates },
      }),
    });
    return response.data;
  }, [handleApiCall]);

  // Lab Results
  const getLabResults = useCallback(async (patientId?: string, dateRange?: { start: string; end: string }): Promise<LabResult[]> => {
    const params = new URLSearchParams();
    params.set('action', 'get-results');
    if (patientId) params.set('patientId', patientId);
    if (dateRange) {
      params.set('startDate', dateRange.start);
      params.set('endDate', dateRange.end);
    }

    const response = await handleApiCall(`/api/laboratory-integration?${params.toString()}`);
    return response.data;
  }, [handleApiCall]);

  const processLabResults = useCallback(async (results: LabResult[]): Promise<LabResult[]> => {
    const response = await handleApiCall('/api/laboratory-integration', {
      method: 'POST',
      body: JSON.stringify({
        action: 'process-results',
        data: { results },
      }),
    });
    return response.data;
  }, [handleApiCall]);

  const syncLabData = useCallback(async (integrationId: string): Promise<LabResult[]> => {
    const response = await handleApiCall('/api/laboratory-integration', {
      method: 'POST',
      body: JSON.stringify({
        action: 'sync-data',
        data: { integrationId },
      }),
    });
    return response.data;
  }, [handleApiCall]);

  // Analytics
  const getLabAnalytics = useCallback(async (dateRange?: { start: string; end: string }): Promise<LabAnalytics> => {
    const params = new URLSearchParams();
    params.set('action', 'get-analytics');
    if (dateRange) {
      params.set('startDate', dateRange.start);
      params.set('endDate', dateRange.end);
    }

    const response = await handleApiCall(`/api/laboratory-integration?${params.toString()}`);
    return response.data;
  }, [handleApiCall]);

  // Quality Control
  const performQualityControl = useCallback(async (): Promise<QualityMetrics> => {
    const response = await handleApiCall('/api/laboratory-integration?action=quality-control');
    return response.data;
  }, [handleApiCall]);

  // Alerts
  const createLabAlert = useCallback(async (patientId: string, resultId: string, alertType: 'critical' | 'abnormal' | 'followup'): Promise<void> => {
    await handleApiCall('/api/laboratory-integration', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create-alert',
        data: { patientId, resultId, alertType },
      }),
    });
  }, [handleApiCall]);

  // Utility functions
  const formatLabResult = useCallback((result: LabResult): string => {
    return `${result.result} ${result.unit} (${result.referenceRange})`;
  }, []);

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'normal':
        return 'text-green-600';
      case 'abnormal':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  const getStatusBadgeVariant = useCallback((status: string): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'normal':
        return 'default';
      case 'abnormal':
        return 'secondary';
      case 'critical':
        return 'destructive';
      default:
        return 'default';
    }
  }, []);

  return {
    loading,
    error,
    getLabIntegrations,
    createLabIntegration,
    updateLabIntegration,
    getLabResults,
    processLabResults,
    syncLabData,
    getLabAnalytics,
    performQualityControl,
    createLabAlert,
    formatLabResult,
    getStatusColor,
    getStatusBadgeVariant,
  };
};
