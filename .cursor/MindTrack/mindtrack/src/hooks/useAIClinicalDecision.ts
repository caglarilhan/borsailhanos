import { useState, useCallback } from 'react';
import { 
  PatientProfile, 
  DiagnosticSuggestion, 
  TreatmentRecommendation, 
  RiskAssessment 
} from '@/lib/ai-clinical-decision';

interface UseAIClinicalDecisionReturn {
  diagnosticSuggestions: DiagnosticSuggestion[];
  treatmentRecommendations: TreatmentRecommendation[];
  riskAssessments: RiskAssessment[];
  sessionAnalysis: {
    sentiment: 'positive' | 'neutral' | 'negative';
    riskIndicators: string[];
    recommendations: string[];
  } | null;
  medicationInteractions: string[];
  loading: boolean;
  error: string | null;
  
  // Actions
  getDiagnosticSuggestions: (patient: PatientProfile) => Promise<void>;
  getTreatmentRecommendations: (diagnosis: string, patient: PatientProfile) => Promise<void>;
  getRiskAssessment: (patient: PatientProfile) => Promise<void>;
  analyzeSessionNotes: (notes: string) => Promise<void>;
  checkMedicationInteractions: (medications: string[]) => Promise<void>;
  clearResults: () => void;
}

export function useAIClinicalDecision(): UseAIClinicalDecisionReturn {
  const [diagnosticSuggestions, setDiagnosticSuggestions] = useState<DiagnosticSuggestion[]>([]);
  const [treatmentRecommendations, setTreatmentRecommendations] = useState<TreatmentRecommendation[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [sessionAnalysis, setSessionAnalysis] = useState<{
    sentiment: 'positive' | 'neutral' | 'negative';
    riskIndicators: string[];
    recommendations: string[];
  } | null>(null);
  const [medicationInteractions, setMedicationInteractions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(async (action: string, data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/clinical-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...data }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Request failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDiagnosticSuggestions = useCallback(async (patient: PatientProfile) => {
    try {
      const result = await makeRequest('diagnostic-suggestions', { patientData: patient });
      setDiagnosticSuggestions(result.suggestions);
    } catch (err) {
      console.error('Error getting diagnostic suggestions:', err);
    }
  }, [makeRequest]);

  const getTreatmentRecommendations = useCallback(async (diagnosis: string, patient: PatientProfile) => {
    try {
      const result = await makeRequest('treatment-recommendations', { 
        diagnosis, 
        patientData: patient 
      });
      setTreatmentRecommendations(result.recommendations);
    } catch (err) {
      console.error('Error getting treatment recommendations:', err);
    }
  }, [makeRequest]);

  const getRiskAssessment = useCallback(async (patient: PatientProfile) => {
    try {
      const result = await makeRequest('risk-assessment', { patientData: patient });
      setRiskAssessments(result.assessments);
    } catch (err) {
      console.error('Error getting risk assessment:', err);
    }
  }, [makeRequest]);

  const analyzeSessionNotes = useCallback(async (notes: string) => {
    try {
      const result = await makeRequest('analyze-notes', { notes });
      setSessionAnalysis(result.analysis);
    } catch (err) {
      console.error('Error analyzing session notes:', err);
    }
  }, [makeRequest]);

  const checkMedicationInteractions = useCallback(async (medications: string[]) => {
    try {
      const result = await makeRequest('medication-interactions', { 
        patientData: { currentMedications: medications } 
      });
      setMedicationInteractions(result.interactions);
    } catch (err) {
      console.error('Error checking medication interactions:', err);
    }
  }, [makeRequest]);

  const clearResults = useCallback(() => {
    setDiagnosticSuggestions([]);
    setTreatmentRecommendations([]);
    setRiskAssessments([]);
    setSessionAnalysis(null);
    setMedicationInteractions([]);
    setError(null);
  }, []);

  return {
    diagnosticSuggestions,
    treatmentRecommendations,
    riskAssessments,
    sessionAnalysis,
    medicationInteractions,
    loading,
    error,
    getDiagnosticSuggestions,
    getTreatmentRecommendations,
    getRiskAssessment,
    analyzeSessionNotes,
    checkMedicationInteractions,
    clearResults,
  };
}

