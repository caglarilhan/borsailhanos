"use client";

import { useState, useCallback } from 'react';

interface GeneticVariant {
  id: string;
  gene: string;
  variant: string;
  rsId: string;
  chromosome: string;
  position: number;
  genotype: string;
  phenotype: string;
  clinicalSignificance: 'benign' | 'likely_benign' | 'uncertain' | 'likely_pathogenic' | 'pathogenic';
  alleleFrequency: number;
  population: string;
}

interface DrugGeneInteraction {
  id: string;
  drugName: string;
  gene: string;
  variant: string;
  interactionType: 'metabolizer' | 'transporter' | 'target' | 'enzyme';
  phenotype: string;
  recommendation: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  clinicalAction: string;
  alternativeDrugs?: string[];
  dosageAdjustment?: string;
  patientGenotype?: string;
  patientPhenotype?: string;
  personalizedRecommendation?: string;
}

interface PharmacogenomicTest {
  id: string;
  patientId: string;
  testName: string;
  testType: 'panel' | 'single_gene' | 'whole_genome';
  genes: string[];
  variants: GeneticVariant[];
  testDate: string;
  labName: string;
  status: 'ordered' | 'processing' | 'completed' | 'failed';
  results?: any;
  interpretation?: string;
  recommendations?: string[];
}

interface PersonalizedTreatment {
  id: string;
  patientId: string;
  medication: string;
  gene: string;
  variant: string;
  phenotype: string;
  recommendedDosage: string;
  alternativeMedications: string[];
  contraindications: string[];
  monitoringRequirements: string[];
  riskFactors: string[];
  createdDate: string;
}

interface PharmacogenomicAnalytics {
  totalTests: number;
  completedTests: number;
  pendingTests: number;
  testTypes: Record<string, number>;
  genesTested: Record<string, number>;
  averageProcessingTime: number;
}

export const usePharmacogenomics = () => {
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

  // Genetic Variants
  const getGeneticVariants = useCallback(async (patientId?: string, gene?: string): Promise<GeneticVariant[]> => {
    const params = new URLSearchParams();
    params.set('action', 'get-variants');
    if (patientId) params.set('patientId', patientId);
    if (gene) params.set('gene', gene);

    const response = await handleApiCall(`/api/pharmacogenomics?${params.toString()}`);
    return response.data;
  }, [handleApiCall]);

  const createGeneticVariant = useCallback(async (variant: Omit<GeneticVariant, 'id'>): Promise<GeneticVariant> => {
    const response = await handleApiCall('/api/pharmacogenomics', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create-variant',
        data: variant,
      }),
    });
    return response.data;
  }, [handleApiCall]);

  // Pharmacogenomic Tests
  const getPharmacogenomicTests = useCallback(async (patientId?: string): Promise<PharmacogenomicTest[]> => {
    const params = new URLSearchParams();
    params.set('action', 'get-tests');
    if (patientId) params.set('patientId', patientId);

    const response = await handleApiCall(`/api/pharmacogenomics?${params.toString()}`);
    return response.data;
  }, [handleApiCall]);

  const createPharmacogenomicTest = useCallback(async (test: Omit<PharmacogenomicTest, 'id'>): Promise<PharmacogenomicTest> => {
    const response = await handleApiCall('/api/pharmacogenomics', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create-test',
        data: test,
      }),
    });
    return response.data;
  }, [handleApiCall]);

  const updateTestStatus = useCallback(async (testId: string, status: string, results?: any): Promise<PharmacogenomicTest> => {
    const response = await handleApiCall('/api/pharmacogenomics', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update-test-status',
        data: { testId, status, results },
      }),
    });
    return response.data;
  }, [handleApiCall]);

  // Drug-Gene Interactions
  const getDrugGeneInteractions = useCallback(async (drugName?: string, gene?: string): Promise<DrugGeneInteraction[]> => {
    const params = new URLSearchParams();
    params.set('action', 'get-interactions');
    if (drugName) params.set('drugName', drugName);
    if (gene) params.set('gene', gene);

    const response = await handleApiCall(`/api/pharmacogenomics?${params.toString()}`);
    return response.data;
  }, [handleApiCall]);

  const analyzeDrugGeneInteraction = useCallback(async (drugName: string, variants: GeneticVariant[]): Promise<DrugGeneInteraction[]> => {
    const response = await handleApiCall('/api/pharmacogenomics', {
      method: 'POST',
      body: JSON.stringify({
        action: 'analyze-interaction',
        data: { drugName, variants },
      }),
    });
    return response.data;
  }, [handleApiCall]);

  const createDrugGeneInteraction = useCallback(async (interaction: Omit<DrugGeneInteraction, 'id'>): Promise<DrugGeneInteraction> => {
    const response = await handleApiCall('/api/pharmacogenomics', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create-interaction',
        data: interaction,
      }),
    });
    return response.data;
  }, [handleApiCall]);

  // Personalized Treatment
  const generatePersonalizedTreatment = useCallback(async (patientId: string, medication: string): Promise<PersonalizedTreatment> => {
    const response = await handleApiCall('/api/pharmacogenomics', {
      method: 'POST',
      body: JSON.stringify({
        action: 'generate-treatment',
        data: { patientId, medication },
      }),
    });
    return response.data;
  }, [handleApiCall]);

  // Analytics
  const getPharmacogenomicAnalytics = useCallback(async (dateRange?: { start: string; end: string }): Promise<PharmacogenomicAnalytics> => {
    const params = new URLSearchParams();
    params.set('action', 'get-analytics');
    if (dateRange) {
      params.set('startDate', dateRange.start);
      params.set('endDate', dateRange.end);
    }

    const response = await handleApiCall(`/api/pharmacogenomics?${params.toString()}`);
    return response.data;
  }, [handleApiCall]);

  // Utility functions
  const getSignificanceColor = useCallback((significance: string): string => {
    switch (significance) {
      case 'pathogenic':
        return 'text-red-600';
      case 'likely_pathogenic':
        return 'text-orange-600';
      case 'uncertain':
        return 'text-yellow-600';
      case 'likely_benign':
        return 'text-blue-600';
      case 'benign':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  const getSignificanceBadgeVariant = useCallback((significance: string): 'default' | 'secondary' | 'destructive' => {
    switch (significance) {
      case 'pathogenic':
        return 'destructive';
      case 'likely_pathogenic':
        return 'destructive';
      case 'uncertain':
        return 'secondary';
      case 'likely_benign':
        return 'default';
      case 'benign':
        return 'default';
      default:
        return 'default';
    }
  }, []);

  const getEvidenceLevelColor = useCallback((level: string): string => {
    switch (level) {
      case 'A':
        return 'text-green-600';
      case 'B':
        return 'text-blue-600';
      case 'C':
        return 'text-yellow-600';
      case 'D':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  const getTestStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'ordered':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  const getTestStatusBadgeVariant = useCallback((status: string): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'ordered':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'default';
    }
  }, []);

  const formatGenotype = useCallback((genotype: string): string => {
    return genotype.replace(/\//g, '/');
  }, []);

  const formatPhenotype = useCallback((phenotype: string): string => {
    return phenotype.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  return {
    loading,
    error,
    getGeneticVariants,
    createGeneticVariant,
    getPharmacogenomicTests,
    createPharmacogenomicTest,
    updateTestStatus,
    getDrugGeneInteractions,
    analyzeDrugGeneInteraction,
    createDrugGeneInteraction,
    generatePersonalizedTreatment,
    getPharmacogenomicAnalytics,
    getSignificanceColor,
    getSignificanceBadgeVariant,
    getEvidenceLevelColor,
    getTestStatusColor,
    getTestStatusBadgeVariant,
    formatGenotype,
    formatPhenotype,
  };
};










