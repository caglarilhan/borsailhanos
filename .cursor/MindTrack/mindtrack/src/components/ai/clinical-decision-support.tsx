"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  Activity, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  Users,
  User,
  UserCheck,
  UserX,
  MessageSquare,
  Send,
  FileText,
  FilePlus,
  FileCheck,
  FileX,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Star,
  Heart,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Lock,
  Unlock,
  Shield,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  BookOpen,
  Settings2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  LockKeyhole,
  UnlockKeyhole,
  EyeIcon,
  EyeOffIcon,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Link,
  Link2,
  LinkBreak,
  LinkBreak2,
  Network,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryHigh,
  BatteryEmpty,
  BatteryWarning,
  BatteryAlert,
  BatteryCheck,
  BatteryX,
  BatteryPlus,
  BatteryMinus,
  BatteryEdit,
  BatterySettings,
  BatteryRefresh,
  BatteryPlay,
  BatteryPause,
  BatteryStop,
  BatteryCopy,
  BatteryShare,
  BatteryDownload,
  BatteryUpload,
  BatteryFilter,
  BatterySearch,
  BatteryEye,
  BatteryEyeOff,
  BatteryLock,
  BatteryUnlock,
  BatteryShield,
  BatteryUser,
  BatteryUserCheck,
  BatteryUserX,
  BatteryPhone,
  BatteryMail,
  BatteryMessageSquare,
  BatteryBell,
  BatteryBellOff,
  BatteryBookOpen,
  BatteryFileText,
  BatteryFileCheck,
  BatteryFileX,
  BatteryFilePlus,
  BatteryFileMinus,
  BatteryFileEdit,
  BatteryFileAlertCircle
} from "lucide-react";

// AI-Powered Clinical Decision Support için gerekli interface'ler
interface TreatmentRecommendation {
  id: string;
  patientId: string;
  condition: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  recommendations: {
    id: string;
    type: 'medication' | 'therapy' | 'lifestyle' | 'referral' | 'monitoring';
    title: string;
    description: string;
    evidence: {
      level: 'A' | 'B' | 'C' | 'D';
      source: string;
      year: number;
      confidence: number; // 0-100
    };
    priority: 'high' | 'medium' | 'low';
    expectedOutcome: string;
    timeline: string;
    contraindications: string[];
    sideEffects: string[];
  }[];
  aiConfidence: number; // 0-100
  reasoning: string;
  alternatives: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface RiskAssessment {
  id: string;
  patientId: string;
  assessmentType: 'suicide' | 'violence' | 'self-harm' | 'substance-abuse' | 'depression' | 'anxiety';
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  score: number; // 0-100
  factors: {
    factor: string;
    weight: number;
    present: boolean;
    notes: string;
  }[];
  protectiveFactors: string[];
  riskFactors: string[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  nextAssessment: Date;
  assignedTo: string;
  status: 'active' | 'resolved' | 'escalated';
}

interface ClinicalGuideline {
  id: string;
  title: string;
  condition: string;
  category: 'diagnosis' | 'treatment' | 'prevention' | 'monitoring';
  version: string;
  lastUpdated: Date;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  recommendations: {
    id: string;
    statement: string;
    strength: 'strong' | 'moderate' | 'weak';
    evidence: string;
    implementation: string;
  }[];
  contraindications: string[];
  references: {
    title: string;
    authors: string;
    journal: string;
    year: number;
    doi: string;
  }[];
  aiIntegration: {
    enabled: boolean;
    accuracy: number;
    lastValidation: Date;
  };
}

interface PatientOutcomePrediction {
  id: string;
  patientId: string;
  predictionType: 'treatment_response' | 'relapse_risk' | 'recovery_time' | 'compliance';
  predictedOutcome: string;
  confidence: number; // 0-100
  timeframe: string;
  factors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }[];
  historicalData: {
    date: Date;
    value: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];
  recommendations: string[];
  monitoringPlan: {
    frequency: string;
    metrics: string[];
    alerts: string[];
  };
  lastUpdated: Date;
}

interface ClinicalDecision {
  id: string;
  patientId: string;
  decisionType: 'diagnosis' | 'treatment' | 'medication' | 'referral' | 'discharge';
  decision: string;
  confidence: number;
  alternatives: string[];
  reasoning: {
    clinical: string;
    evidence: string;
    patient_preferences: string;
    ai_insights: string;
  };
  aiSupport: {
    used: boolean;
    recommendations: string[];
    confidence: number;
    model: string;
    version: string;
  };
  outcome: {
    predicted: string;
    actual?: string;
    success: boolean;
    notes: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// AI-Powered Clinical Decision Support Component - AI destekli klinik karar destek sistemi
export function ClinicalDecisionSupport() {
  // State management - Uygulama durumunu yönetmek için
  const [treatmentRecommendations, setTreatmentRecommendations] = useState<TreatmentRecommendation[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [clinicalGuidelines, setClinicalGuidelines] = useState<ClinicalGuideline[]>([]);
  const [patientOutcomePredictions, setPatientOutcomePredictions] = useState<PatientOutcomePrediction[]>([]);
  const [clinicalDecisions, setClinicalDecisions] = useState<ClinicalDecision[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<TreatmentRecommendation | null>(null);
  const [selectedRiskAssessment, setSelectedRiskAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateAssessment, setShowCreateAssessment] = useState(false);
  const [showCreateGuideline, setShowCreateGuideline] = useState(false);
  const [aiModelStatus, setAiModelStatus] = useState('active');
  const [aiAccuracy, setAiAccuracy] = useState(94.2);

  // Mock data initialization - Test verilerini yüklemek için
  useEffect(() => {
    // Simulated data loading - Gerçek API'den veri çekme simülasyonu
    const mockTreatmentRecommendations: TreatmentRecommendation[] = [
      {
        id: '1',
        patientId: 'patient_001',
        condition: 'Major Depressive Disorder',
        severity: 'moderate',
        recommendations: [
          {
            id: 'rec_1',
            type: 'medication',
            title: 'SSRI Therapy - Sertraline',
            description: 'Start with 50mg daily, titrate to 100mg based on response',
            evidence: {
              level: 'A',
              source: 'APA Clinical Practice Guidelines',
              year: 2023,
              confidence: 92
            },
            priority: 'high',
            expectedOutcome: '50-70% response rate within 4-6 weeks',
            timeline: '4-6 weeks for initial response',
            contraindications: ['Bipolar disorder', 'MAOI use'],
            sideEffects: ['Nausea', 'Insomnia', 'Sexual dysfunction']
          },
          {
            id: 'rec_2',
            type: 'therapy',
            title: 'Cognitive Behavioral Therapy (CBT)',
            description: 'Weekly sessions focusing on cognitive restructuring',
            evidence: {
              level: 'A',
              source: 'Cochrane Review',
              year: 2022,
              confidence: 88
            },
            priority: 'high',
            expectedOutcome: 'Significant improvement in depressive symptoms',
            timeline: '12-16 weeks',
            contraindications: [],
            sideEffects: []
          }
        ],
        aiConfidence: 87,
        reasoning: 'Patient shows classic symptoms of MDD with moderate severity. SSRI + CBT combination shows highest efficacy.',
        alternatives: ['SNRI therapy', 'Psychodynamic therapy', 'Mindfulness-based therapy'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const mockRiskAssessments: RiskAssessment[] = [
      {
        id: '1',
        patientId: 'patient_001',
        assessmentType: 'suicide',
        riskLevel: 'moderate',
        score: 45,
        factors: [
          {
            factor: 'Previous suicide attempts',
            weight: 25,
            present: true,
            notes: 'One attempt 2 years ago'
          },
          {
            factor: 'Current depressive symptoms',
            weight: 20,
            present: true,
            notes: 'Moderate depression'
          },
          {
            factor: 'Social support',
            weight: 15,
            present: false,
            notes: 'Limited social network'
          }
        ],
        protectiveFactors: [
          'Access to mental health care',
          'No current substance abuse',
          'Family awareness of condition'
        ],
        riskFactors: [
          'Previous suicide attempt',
          'Current depression',
          'Social isolation'
        ],
        recommendations: {
          immediate: [
            'Increase monitoring frequency',
            'Develop safety plan',
            'Involve family in care'
          ],
          shortTerm: [
            'Weekly therapy sessions',
            'Medication management',
            'Crisis hotline information'
          ],
          longTerm: [
            'Build social support network',
            'Address underlying depression',
            'Regular risk reassessment'
          ]
        },
        nextAssessment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedTo: 'therapist_001',
        status: 'active'
      }
    ];

    const mockClinicalGuidelines: ClinicalGuideline[] = [
      {
        id: '1',
        title: 'Treatment of Major Depressive Disorder',
        condition: 'Major Depressive Disorder',
        category: 'treatment',
        version: '2.1',
        lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        evidenceLevel: 'A',
        recommendations: [
          {
            id: 'guideline_1',
            statement: 'SSRIs are first-line treatment for moderate to severe MDD',
            strength: 'strong',
            evidence: 'Multiple RCTs and meta-analyses',
            implementation: 'Start with low dose, titrate based on response and tolerability'
          },
          {
            id: 'guideline_2',
            statement: 'CBT should be offered as first-line psychotherapy',
            strength: 'strong',
            evidence: 'Systematic reviews and clinical trials',
            implementation: '12-16 weekly sessions with homework assignments'
          }
        ],
        contraindications: [
          'Bipolar disorder',
          'MAOI use within 14 days',
          'Severe liver disease'
        ],
        references: [
          {
            title: 'APA Clinical Practice Guidelines for Depression',
            authors: 'American Psychiatric Association',
            journal: 'American Journal of Psychiatry',
            year: 2023,
            doi: '10.1176/appi.ajp.2023.1'
          }
        ],
        aiIntegration: {
          enabled: true,
          accuracy: 94.2,
          lastValidation: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    ];

    const mockPatientOutcomePredictions: PatientOutcomePrediction[] = [
      {
        id: '1',
        patientId: 'patient_001',
        predictionType: 'treatment_response',
        predictedOutcome: 'Good response to SSRI therapy',
        confidence: 78,
        timeframe: '4-6 weeks',
        factors: [
          {
            factor: 'Age (35)',
            impact: 'positive',
            weight: 0.15
          },
          {
            factor: 'No previous treatment',
            impact: 'positive',
            weight: 0.20
          },
          {
            factor: 'Moderate severity',
            impact: 'positive',
            weight: 0.25
          }
        ],
        historicalData: [
          {
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            value: 65,
            trend: 'stable'
          },
          {
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            value: 58,
            trend: 'improving'
          }
        ],
        recommendations: [
          'Monitor for early response signs',
          'Adjust dosage if needed',
          'Maintain regular follow-up'
        ],
        monitoringPlan: {
          frequency: 'Weekly',
          metrics: ['PHQ-9 score', 'Side effects', 'Functional improvement'],
          alerts: ['Score increase >5 points', 'New side effects', 'Suicidal thoughts']
        },
        lastUpdated: new Date()
      }
    ];

    const mockClinicalDecisions: ClinicalDecision[] = [
      {
        id: '1',
        patientId: 'patient_001',
        decisionType: 'treatment',
        decision: 'Start Sertraline 50mg daily + CBT',
        confidence: 85,
        alternatives: [
          'Escitalopram + IPT',
          'Venlafaxine + CBT',
          'Bupropion + Supportive therapy'
        ],
        reasoning: {
          clinical: 'Patient meets criteria for MDD, moderate severity',
          evidence: 'SSRI + CBT shows highest efficacy in clinical trials',
          patient_preferences: 'Patient prefers medication + therapy approach',
          ai_insights: 'AI analysis suggests 78% likelihood of good response'
        },
        aiSupport: {
          used: true,
          recommendations: [
            'SSRI as first-line medication',
            'CBT as primary psychotherapy',
            'Weekly monitoring for first 4 weeks'
          ],
          confidence: 78,
          model: 'Clinical Decision Support v2.1',
          version: '2023.12'
        },
        outcome: {
          predicted: 'Good response within 4-6 weeks',
          success: true,
          notes: 'Patient showing early signs of improvement'
        },
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    setTreatmentRecommendations(mockTreatmentRecommendations);
    setRiskAssessments(mockRiskAssessments);
    setClinicalGuidelines(mockClinicalGuidelines);
    setPatientOutcomePredictions(mockPatientOutcomePredictions);
    setClinicalDecisions(mockClinicalDecisions);
  }, []);

  // Generate treatment recommendations - Tedavi önerileri oluşturma
  const generateTreatmentRecommendations = useCallback(async (
    patientId: string,
    condition: string,
    symptoms: string[],
    severity: TreatmentRecommendation['severity']
  ) => {
    setLoading(true);
    
    try {
      // Simulated AI analysis - AI analizi simülasyonu
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // AI-powered treatment recommendations - AI destekli tedavi önerileri
      const newRecommendation: TreatmentRecommendation = {
        id: `rec_${Date.now()}`,
        patientId,
        condition,
        severity,
        recommendations: [
          {
            id: `med_${Date.now()}`,
            type: 'medication',
            title: 'First-line medication recommendation',
            description: 'Based on AI analysis of patient profile and clinical guidelines',
            evidence: {
              level: 'A',
              source: 'Clinical Practice Guidelines',
              year: 2023,
              confidence: 89
            },
            priority: 'high',
            expectedOutcome: 'Expected improvement within 4-6 weeks',
            timeline: '4-6 weeks',
            contraindications: ['Known allergies', 'Drug interactions'],
            sideEffects: ['Common side effects may include...']
          }
        ],
        aiConfidence: Math.floor(Math.random() * 20) + 80, // 80-100
        reasoning: 'AI analysis based on patient symptoms, medical history, and evidence-based guidelines',
        alternatives: [
          'Alternative treatment approach 1',
          'Alternative treatment approach 2'
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setTreatmentRecommendations(prev => [...prev, newRecommendation]);
      
      return newRecommendation;
      
    } catch (error) {
      console.error('Treatment recommendation generation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Perform risk assessment - Risk değerlendirmesi yapma
  const performRiskAssessment = useCallback(async (
    patientId: string,
    assessmentType: RiskAssessment['assessmentType'],
    factors: RiskAssessment['factors']
  ) => {
    setLoading(true);
    
    try {
      // Simulated risk assessment - Risk değerlendirmesi simülasyonu
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Calculate risk score - Risk skoru hesaplama
      const totalScore = factors.reduce((sum, factor) => {
        return sum + (factor.present ? factor.weight : 0);
      }, 0);
      
      let riskLevel: RiskAssessment['riskLevel'];
      if (totalScore >= 70) riskLevel = 'critical';
      else if (totalScore >= 50) riskLevel = 'high';
      else if (totalScore >= 30) riskLevel = 'moderate';
      else riskLevel = 'low';
      
      const newAssessment: RiskAssessment = {
        id: `risk_${Date.now()}`,
        patientId,
        assessmentType,
        riskLevel,
        score: totalScore,
        factors,
        protectiveFactors: [
          'Access to mental health care',
          'Family support',
          'No current substance abuse'
        ],
        riskFactors: factors.filter(f => f.present).map(f => f.factor),
        recommendations: {
          immediate: [
            'Increase monitoring frequency',
            'Develop safety plan'
          ],
          shortTerm: [
            'Weekly therapy sessions',
            'Medication management'
          ],
          longTerm: [
            'Address underlying issues',
            'Build support network'
          ]
        },
        nextAssessment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedTo: 'therapist_001',
        status: 'active'
      };
      
      setRiskAssessments(prev => [...prev, newAssessment]);
      
      return newAssessment;
      
    } catch (error) {
      console.error('Risk assessment failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Predict patient outcomes - Hasta sonuçlarını tahmin etme
  const predictPatientOutcomes = useCallback(async (
    patientId: string,
    predictionType: PatientOutcomePrediction['predictionType']
  ) => {
    setLoading(true);
    
    try {
      // Simulated outcome prediction - Sonuç tahmini simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const newPrediction: PatientOutcomePrediction = {
        id: `pred_${Date.now()}`,
        patientId,
        predictionType,
        predictedOutcome: 'Good response to treatment expected',
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100
        timeframe: '4-6 weeks',
        factors: [
          {
            factor: 'Treatment adherence',
            impact: 'positive',
            weight: 0.25
          },
          {
            factor: 'Social support',
            impact: 'positive',
            weight: 0.20
          },
          {
            factor: 'Severity of condition',
            impact: 'neutral',
            weight: 0.15
          }
        ],
        historicalData: [
          {
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            value: 60,
            trend: 'stable'
          },
          {
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            value: 55,
            trend: 'improving'
          }
        ],
        recommendations: [
          'Monitor treatment response',
          'Maintain regular follow-up',
          'Address any barriers to treatment'
        ],
        monitoringPlan: {
          frequency: 'Weekly',
          metrics: ['Symptom severity', 'Functional improvement', 'Side effects'],
          alerts: ['Worsening symptoms', 'New side effects', 'Treatment non-adherence']
        },
        lastUpdated: new Date()
      };
      
      setPatientOutcomePredictions(prev => [...prev, newPrediction]);
      
      return newPrediction;
      
    } catch (error) {
      console.error('Outcome prediction failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Make clinical decision - Klinik karar verme
  const makeClinicalDecision = useCallback(async (
    patientId: string,
    decisionType: ClinicalDecision['decisionType'],
    decision: string,
    reasoning: ClinicalDecision['reasoning']
  ) => {
    setLoading(true);
    
    try {
      // Simulated clinical decision - Klinik karar simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDecision: ClinicalDecision = {
        id: `decision_${Date.now()}`,
        patientId,
        decisionType,
        decision,
        confidence: Math.floor(Math.random() * 20) + 80, // 80-100
        alternatives: [
          'Alternative approach 1',
          'Alternative approach 2',
          'Conservative approach'
        ],
        reasoning,
        aiSupport: {
          used: true,
          recommendations: [
            'AI-supported recommendation 1',
            'AI-supported recommendation 2'
          ],
          confidence: Math.floor(Math.random() * 20) + 75, // 75-95
          model: 'Clinical Decision Support v2.1',
          version: '2023.12'
        },
        outcome: {
          predicted: 'Expected positive outcome',
          success: true,
          notes: 'Decision based on evidence and AI analysis'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setClinicalDecisions(prev => [...prev, newDecision]);
      
      return newDecision;
      
    } catch (error) {
      console.error('Clinical decision failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate AI system metrics - AI sistem metriklerini hesaplama
  const calculateAIMetrics = useCallback(() => {
    const totalRecommendations = treatmentRecommendations.length;
    const highConfidenceRecommendations = treatmentRecommendations.filter(r => r.aiConfidence >= 80).length;
    const totalAssessments = riskAssessments.length;
    const criticalAssessments = riskAssessments.filter(a => a.riskLevel === 'critical').length;
    
    return {
      totalRecommendations,
      highConfidenceRecommendations,
      confidenceRate: totalRecommendations > 0 ? Math.round((highConfidenceRecommendations / totalRecommendations) * 100) : 0,
      totalAssessments,
      criticalAssessments,
      assessmentAccuracy: 94.2
    };
  }, [treatmentRecommendations, riskAssessments]);

  const aiMetrics = calculateAIMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🤖 AI-Powered Clinical Decision Support</h2>
          <p className="text-gray-600">Evidence-based treatment recommendations and clinical decision support</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Brain className="h-3 w-3 mr-1" />
            {aiMetrics.confidenceRate}% AI Confidence
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Activity className="h-3 w-3 mr-1" />
            {aiMetrics.assessmentAccuracy}% Accuracy
          </Badge>
        </div>
      </div>

      {/* AI System Overview - AI Sistem Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Recommendations</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiMetrics.totalRecommendations}</div>
            <p className="text-xs text-muted-foreground">
              {aiMetrics.highConfidenceRecommendations} high confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Assessments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiMetrics.totalAssessments}</div>
            <p className="text-xs text-muted-foreground">
              {aiMetrics.criticalAssessments} critical cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiMetrics.assessmentAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              Validated against clinical outcomes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              All AI models operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Recommendations - Tedavi Önerileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              AI Treatment Recommendations
            </div>
            <Button
              onClick={() => generateTreatmentRecommendations('patient_001', 'Depression', ['sadness', 'fatigue'], 'moderate')}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate Recommendations
            </Button>
          </CardTitle>
          <CardDescription>
            Evidence-based treatment recommendations powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {treatmentRecommendations.map((recommendation) => (
              <div key={recommendation.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{recommendation.condition}</div>
                    <div className="text-sm text-gray-600">
                      Severity: {recommendation.severity} • AI Confidence: {recommendation.aiConfidence}%
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={recommendation.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {recommendation.severity}
                    </Badge>
                    <Badge variant="outline">
                      {recommendation.recommendations.length} recommendations
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
                    <div className="space-y-2">
                      {recommendation.recommendations.map((rec) => (
                        <div key={rec.id} className="border-l-4 border-blue-500 pl-3">
                          <div className="font-medium text-sm">{rec.title}</div>
                          <div className="text-sm text-gray-600">{rec.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Evidence: Level {rec.evidence.level} • {rec.evidence.confidence}% confidence
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">AI Reasoning</h4>
                    <p className="text-sm text-gray-600 mb-3">{recommendation.reasoning}</p>
                    
                    <h5 className="font-semibold text-sm mb-2">Alternatives</h5>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {recommendation.alternatives.map((alt, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          {alt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
            
            {treatmentRecommendations.length === 0 && (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No treatment recommendations generated</p>
                <p className="text-sm text-gray-400">Generate AI-powered recommendations to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessments - Risk Değerlendirmeleri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Risk Assessments
            </div>
            <Button
              onClick={() => setShowCreateAssessment(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </CardTitle>
          <CardDescription>
            AI-powered risk assessment and safety planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskAssessments.map((assessment) => (
              <div key={assessment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{assessment.assessmentType.replace('-', ' ').toUpperCase()}</div>
                    <div className="text-sm text-gray-600">
                      Risk Level: {assessment.riskLevel} • Score: {assessment.score}/100
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={assessment.riskLevel === 'critical' ? 'destructive' : 'secondary'}>
                      {assessment.riskLevel}
                    </Badge>
                    <Badge variant="outline">
                      {assessment.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Risk Factors</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {assessment.riskFactors.slice(0, 3).map((factor, index) => (
                        <li key={index} className="flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Protective Factors</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {assessment.protectiveFactors.slice(0, 3).map((factor, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Immediate Actions</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {assessment.recommendations.immediate.slice(0, 3).map((action, index) => (
                        <li key={index} className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Next assessment: {assessment.nextAssessment.toLocaleDateString()}</span>
                    <span>Assigned to: {assessment.assignedTo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clinical Guidelines - Klinik Rehberler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Clinical Guidelines
          </CardTitle>
          <CardDescription>
            Evidence-based clinical guidelines with AI integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clinicalGuidelines.map((guideline) => (
              <div key={guideline.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{guideline.title}</div>
                    <div className="text-sm text-gray-600">
                      {guideline.category} • Evidence Level: {guideline.evidenceLevel}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      v{guideline.version}
                    </Badge>
                    <Badge variant={guideline.aiIntegration.enabled ? 'default' : 'secondary'}>
                      AI {guideline.aiIntegration.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Key Recommendations</h4>
                    <div className="space-y-2">
                      {guideline.recommendations.slice(0, 3).map((rec) => (
                        <div key={rec.id} className="text-sm">
                          <div className="font-medium">{rec.statement}</div>
                          <div className="text-gray-600">Strength: {rec.strength}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">AI Integration</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Accuracy: {guideline.aiIntegration.accuracy}%</div>
                      <div>Last validated: {guideline.aiIntegration.lastValidation.toLocaleDateString()}</div>
                      <div>Status: {guideline.aiIntegration.enabled ? 'Active' : 'Inactive'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patient Outcome Predictions - Hasta Sonuç Tahminleri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Outcome Predictions
            </div>
            <Button
              onClick={() => predictPatientOutcomes('patient_001', 'treatment_response')}
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              <Brain className="h-4 w-4 mr-2" />
              Predict Outcomes
            </Button>
          </CardTitle>
          <CardDescription>
            AI-powered patient outcome predictions and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patientOutcomePredictions.map((prediction) => (
              <div key={prediction.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{prediction.predictionType.replace('_', ' ').toUpperCase()}</div>
                    <div className="text-sm text-gray-600">
                      Confidence: {prediction.confidence}% • Timeframe: {prediction.timeframe}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {prediction.predictedOutcome}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Key Factors</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {prediction.factors.slice(0, 3).map((factor, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span>{factor.factor}</span>
                          <Badge variant={factor.impact === 'positive' ? 'default' : 'secondary'} className="text-xs">
                            {factor.impact}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Monitoring Plan</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Frequency: {prediction.monitoringPlan.frequency}</div>
                      <div>Metrics: {prediction.monitoringPlan.metrics.length} tracked</div>
                      <div>Alerts: {prediction.monitoringPlan.alerts.length} configured</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {prediction.recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
            
            {patientOutcomePredictions.length === 0 && (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No outcome predictions available</p>
                <p className="text-sm text-gray-400">Generate AI-powered predictions to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
