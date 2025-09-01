"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Users,
  Settings,
  Plus,
  Download,
  Upload,
  RefreshCw,
  Save,
  Bell,
  BellOff,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Database,
  Server,
  Network,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  FileText,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Info,
  HelpCircle,
  ExternalLink,
  Link,
  LinkBreak,
  GitBranch,
  Layers,
  Filter,
  Search,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Home,
  Menu,
  MoreVertical,
  X,
  Check,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Tag,
  Archive,
  Folder,
  File,
  FilePlus,
  FileMinus,
  FileEdit,
  FileSearch,
  FileDownload,
  FileUpload,
  FileShare,
  FileLock,
  FileUnlock,
  FileHeart,
  FileStar,
  FileAward,
  FileCrown,
  FileZap,
  FileTarget,
  FileShield,
  FileSettings,
  FileInfo,
  FileAlert,
  FileCheckCircle,
  FileXCircle,
  FilePlusCircle,
  FileMinusCircle,
  FileEditCircle,
  FileSearchCircle,
  FileDownloadCircle,
  FileUploadCircle,
  FileShareCircle,
  FileLockCircle,
  FileUnlockCircle,
  FileHeartCircle,
  FileStarCircle,
  FileAwardCircle,
  FileCrownCircle,
  FileZapCircle,
  FileTargetCircle,
  FileShieldCircle,
  FileSettingsCircle,
  FileInfoCircle,
  FileAlertCircle,
  Zap,
  Globe,
  Cpu,
  Memory,
  HardDrive,
  Wifi,
  Cloud,
  BarChart,
  PieChart,
  LineChart,
  ScatterChart,
  AreaChart,
  Table,
  List,
  Grid,
  Columns,
  Rows,
  SortAsc,
  SortDesc
} from "lucide-react";

// AI-Powered Diagnostic Support için interface'ler
interface DiagnosticModel {
  id: string;
  name: string;
  type: 'depression' | 'anxiety' | 'bipolar' | 'schizophrenia' | 'ptsd' | 'adhd' | 'autism' | 'general';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  status: 'active' | 'training' | 'inactive' | 'error';
  lastTraining: Date;
  nextTraining: Date;
  version: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SymptomAnalysis {
  id: string;
  patientId: string;
  symptoms: {
    symptom: string;
    severity: 'mild' | 'moderate' | 'severe';
    duration: string;
    frequency: string;
  }[];
  aiAnalysis: {
    possibleDiagnoses: {
      diagnosis: string;
      confidence: number;
      icd10Code: string;
      description: string;
    }[];
    riskFactors: string[];
    recommendations: string[];
  };
  differentialDiagnosis: {
    primary: string;
    secondary: string[];
    ruledOut: string[];
  };
  status: 'pending' | 'analyzed' | 'reviewed' | 'confirmed';
  analyzedAt: Date;
  reviewedBy: string;
  reviewedAt: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TreatmentRecommendation {
  id: string;
  patientId: string;
  diagnosis: string;
  recommendations: {
    type: 'medication' | 'therapy' | 'lifestyle' | 'referral' | 'monitoring';
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    evidence: string;
    contraindications: string[];
  }[];
  aiConfidence: number;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  references: string[];
  status: 'draft' | 'reviewed' | 'approved' | 'implemented';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RiskAssessment {
  id: string;
  patientId: string;
  riskFactors: {
    factor: string;
    category: 'suicide' | 'violence' | 'self-harm' | 'substance' | 'medical';
    severity: 'low' | 'medium' | 'high' | 'critical';
    evidence: string;
  }[];
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  recommendations: string[];
  monitoringPlan: {
    frequency: string;
    methods: string[];
    duration: string;
  };
  status: 'active' | 'resolved' | 'escalated';
  assessedAt: Date;
  nextAssessment: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ClinicalDecision {
  id: string;
  patientId: string;
  decisionType: 'diagnosis' | 'treatment' | 'medication' | 'referral' | 'discharge';
  aiSuggestion: string;
  confidence: number;
  alternatives: string[];
  evidence: string[];
  clinicalGuidelines: string[];
  decision: 'accept' | 'modify' | 'reject' | 'pending';
  reasoning: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// AI-Powered Diagnostic Support Component
export function AIPoweredDiagnosticSupport() {
  const [diagnosticModels, setDiagnosticModels] = useState<DiagnosticModel[]>([]);
  const [symptomAnalyses, setSymptomAnalyses] = useState<SymptomAnalysis[]>([]);
  const [treatmentRecommendations, setTreatmentRecommendations] = useState<TreatmentRecommendation[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [clinicalDecisions, setClinicalDecisions] = useState<ClinicalDecision[]>([]);
  const [loading, setLoading] = useState(false);
  const [overallAIAccuracy, setOverallAIAccuracy] = useState(92.8);

  // Mock data initialization
  useEffect(() => {
    const mockDiagnosticModels: DiagnosticModel[] = [
      {
        id: '1',
        name: 'Depression Screening AI',
        type: 'depression',
        accuracy: 94.2,
        precision: 91.8,
        recall: 96.5,
        f1Score: 94.1,
        status: 'active',
        lastTraining: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextTraining: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        version: '2.1.0',
        description: 'AI model for depression screening and severity assessment',
        createdBy: 'ai-team@mindtrack.com',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockSymptomAnalyses: SymptomAnalysis[] = [
      {
        id: '1',
        patientId: 'patient_123',
        symptoms: [
          {
            symptom: 'Persistent sadness',
            severity: 'moderate',
            duration: '3 months',
            frequency: 'daily'
          },
          {
            symptom: 'Loss of interest',
            severity: 'severe',
            duration: '2 months',
            frequency: 'daily'
          }
        ],
        aiAnalysis: {
          possibleDiagnoses: [
            {
              diagnosis: 'Major Depressive Disorder',
              confidence: 89.5,
              icd10Code: 'F32.1',
              description: 'Moderate depression with significant functional impairment'
            }
          ],
          riskFactors: ['Family history', 'Recent life stress', 'Previous episodes'],
          recommendations: ['Comprehensive psychiatric evaluation', 'PHQ-9 assessment', 'Safety planning']
        },
        differentialDiagnosis: {
          primary: 'Major Depressive Disorder',
          secondary: ['Persistent Depressive Disorder', 'Adjustment Disorder'],
          ruledOut: ['Bipolar Disorder', 'Anxiety Disorder']
        },
        status: 'analyzed',
        analyzedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        reviewedBy: 'dr.smith@mindtrack.com',
        reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        createdBy: 'ai-system@mindtrack.com',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ];

    const mockTreatmentRecommendations: TreatmentRecommendation[] = [
      {
        id: '1',
        patientId: 'patient_123',
        diagnosis: 'Major Depressive Disorder',
        recommendations: [
          {
            type: 'medication',
            recommendation: 'Consider SSRI (Sertraline 50mg daily)',
            priority: 'high',
            evidence: 'Meta-analysis shows 60% response rate',
            contraindications: ['Bipolar disorder', 'Pregnancy']
          },
          {
            type: 'therapy',
            recommendation: 'Cognitive Behavioral Therapy (CBT)',
            priority: 'high',
            evidence: 'Combined with medication shows best outcomes',
            contraindications: []
          }
        ],
        aiConfidence: 87.3,
        evidenceLevel: 'A',
        references: ['APA Guidelines', 'NICE Guidelines', 'Meta-analysis 2023'],
        status: 'reviewed',
        createdBy: 'ai-system@mindtrack.com',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ];

    const mockRiskAssessments: RiskAssessment[] = [
      {
        id: '1',
        patientId: 'patient_123',
        riskFactors: [
          {
            factor: 'Suicidal ideation',
            category: 'suicide',
            severity: 'medium',
            evidence: 'Patient reports passive thoughts'
          }
        ],
        overallRisk: 'medium',
        riskScore: 65,
        recommendations: ['Weekly safety check-ins', 'Remove access to lethal means', 'Emergency contact established'],
        monitoringPlan: {
          frequency: 'Weekly',
          methods: ['Phone calls', 'In-person visits', 'Safety assessments'],
          duration: '3 months'
        },
        status: 'active',
        assessedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextAssessment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: 'ai-system@mindtrack.com',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockClinicalDecisions: ClinicalDecision[] = [
      {
        id: '1',
        patientId: 'patient_123',
        decisionType: 'treatment',
        aiSuggestion: 'Combined SSRI + CBT approach',
        confidence: 89.5,
        alternatives: ['SNRI monotherapy', 'Psychotherapy only'],
        evidence: ['Meta-analysis 2023', 'APA Guidelines 2024'],
        clinicalGuidelines: ['APA Depression Guidelines', 'NICE Guidelines'],
        decision: 'accept',
        reasoning: 'High confidence AI recommendation aligns with clinical guidelines',
        createdBy: 'dr.smith@mindtrack.com',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ];

    setDiagnosticModels(mockDiagnosticModels);
    setSymptomAnalyses(mockSymptomAnalyses);
    setTreatmentRecommendations(mockTreatmentRecommendations);
    setRiskAssessments(mockRiskAssessments);
    setClinicalDecisions(mockClinicalDecisions);
  }, []);

  // Calculate AI metrics
  const calculateAIMetrics = useCallback(() => {
    const totalModels = diagnosticModels.length;
    const activeModels = diagnosticModels.filter(model => model.status === 'active').length;
    const totalAnalyses = symptomAnalyses.length;
    const analyzedCases = symptomAnalyses.filter(analysis => analysis.status === 'analyzed').length;
    const totalRecommendations = treatmentRecommendations.length;
    const implementedRecommendations = treatmentRecommendations.filter(rec => rec.status === 'implemented').length;
    
    return {
      totalModels,
      activeModels,
      modelActivationRate: totalModels > 0 ? Math.round((activeModels / totalModels) * 100) : 0,
      totalAnalyses,
      analyzedCases,
      analysisRate: totalAnalyses > 0 ? Math.round((analyzedCases / totalAnalyses) * 100) : 0,
      totalRecommendations,
      implementedRecommendations,
      implementationRate: totalRecommendations > 0 ? Math.round((implementedRecommendations / totalRecommendations) * 100) : 0
    };
  }, [diagnosticModels, symptomAnalyses, treatmentRecommendations]);

  const metrics = calculateAIMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🤖 AI-Powered Diagnostic Support</h2>
          <p className="text-gray-600">Advanced AI-driven diagnostic assistance and clinical decision support</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            <Brain className="h-3 w-3 mr-1" />
            {metrics.activeModels} Active Models
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Target className="h-3 w-3 mr-1" />
            {overallAIAccuracy}% Accuracy
          </Badge>
        </div>
      </div>

      {/* AI Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">AI Models</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.activeModels}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalModels} total models
            </p>
            <Progress value={metrics.modelActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Symptom Analysis</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.analyzedCases}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalAnalyses} total analyses
            </p>
            <Progress value={metrics.analysisRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Treatment Recommendations</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.implementedRecommendations}</div>
            <p className="text-xs text-green-700">
              {metrics.totalRecommendations} total recommendations
            </p>
            <Progress value={metrics.implementationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Risk Assessments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{riskAssessments.length}</div>
            <p className="text-xs text-orange-700">
              active assessments
            </p>
            <Progress value={100} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Diagnostic Models */}
      <Card className="border-2 border-purple-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              <span className="text-purple-900">AI Diagnostic Models</span>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </CardTitle>
          <CardDescription className="text-purple-700">
            Machine learning models for psychiatric diagnosis and assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {diagnosticModels.map((model) => (
              <div key={model.id} className="border border-purple-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-purple-900">{model.name}</div>
                    <div className="text-sm text-purple-600">{model.type} • v{model.version}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={model.status === 'active' ? 'default' : 'secondary'} className="bg-purple-100 text-purple-800">
                      {model.status}
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {model.accuracy}% Accuracy
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Performance Metrics</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Accuracy: {model.accuracy}%</div>
                      <div>Precision: {model.precision}%</div>
                      <div>Recall: {model.recall}%</div>
                      <div>F1 Score: {model.f1Score}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Training Schedule</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Last Training: {model.lastTraining.toLocaleDateString()}</div>
                      <div>Next Training: {model.nextTraining.toLocaleDateString()}</div>
                      <div>Status: {model.status}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Model Details</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Type: {model.type}</div>
                      <div>Version: {model.version}</div>
                      <div>Created: {model.createdAt.toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

