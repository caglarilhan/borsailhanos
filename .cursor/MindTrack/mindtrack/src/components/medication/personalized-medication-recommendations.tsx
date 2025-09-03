"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Calendar,
  DollarSign,
  Shield,
  Users,
  Activity,
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  Edit,
  Trash2,
  Microscope,
  Database,
  Gauge,
  Scale,
  FileWarning,
  AlertCircle,
  AlertOctagon,
  Info,
  ActivitySquare,
  TrendingDown,
  Settings,
  Phone,
  Mail,
  MessageSquare,
  Smartphone,
  Tablet,
  Monitor,
  Zap,
  Heart,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Send,
  PhoneCall,
  Mail as MailIcon,
  MessageCircle,
  Smartphone as Mobile,
  Brain as BrainIcon,
  Target as TargetIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
  Shield as ShieldIcon,
  Users as UsersIcon,
  Activity as ActivityIcon,
  BarChart3 as BarChart3Icon,
  ActivitySquare as ActivitySquareIcon,
  AlertOctagon as AlertOctagonIcon,
  Gauge as GaugeIcon,
  Scale as ScaleIcon
} from "lucide-react";

interface PatientMedicationProfile {
  id: string;
  patientId: string;
  diagnosis: string[];
  currentMedications: any;
  medicationHistory: any;
  geneticProfile: any;
  labResults: any;
  vitalSigns: any;
  allergies: string[];
  contraindications: string[];
  drugInteractions: any;
  sideEffectsHistory: any;
  treatmentResponseHistory: any;
  comorbidities: string[];
  age: number;
  gender: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  renalFunction: number;
  hepaticFunction: string;
  pregnancyStatus: string;
  breastfeeding: boolean;
  smokingStatus: string;
  alcoholUse: string;
}

interface MedicationAlgorithm {
  id: string;
  algorithmName: string;
  algorithmVersion: string;
  algorithmType: string;
  description: string;
  clinicalIndications: string[];
  inputParameters: any;
  outputParameters: any;
  accuracyScore: number;
  validationStudies: string[];
  fdaApprovalStatus: string;
  clinicalGuidelines: string[];
  evidenceLevel: string;
}

interface PersonalizedRecommendation {
  id: string;
  patientId: string;
  algorithmId: string;
  recommendationDate: string;
  primaryDiagnosis: string;
  recommendedMedications: any;
  alternativeMedications: any;
  contraindicatedMedications: any;
  dosageRecommendations: any;
  titrationSchedule: any;
  monitoringParameters: any;
  expectedOutcomes: any;
  riskAssessment: any;
  confidenceScore: number;
  evidenceSummary: string;
  clinicalRationale: string;
  patientPreferences: any;
  costConsiderations: any;
  insuranceCoverage: any;
  followUpPlan: string;
  reviewDate: string;
  status: 'active' | 'accepted' | 'rejected' | 'expired';
}

interface TreatmentResponseTracking {
  id: string;
  patientId: string;
  recommendationId: string;
  medicationName: string;
  startDate: string;
  endDate: string;
  dosageSchedule: any;
  adherenceRate: number;
  effectivenessScore: number;
  sideEffectsSeverity: number;
  symptomImprovement: any;
  functionalImprovement: any;
  qualityOfLifeScore: number;
  patientSatisfaction: number;
  clinicianAssessment: any;
  labMonitoringResults: any;
  doseAdjustments: any;
  discontinuationReason: string;
}

interface ClinicalDecisionRule {
  id: string;
  ruleName: string;
  ruleCategory: string;
  ruleDescription: string;
  clinicalCondition: string;
  patientCriteria: any;
  medicationCriteria: any;
  recommendationLogic: any;
  evidenceLevel: string;
  strengthOfRecommendation: string;
  contraindications: string[];
  warnings: string[];
  monitoringRequirements: string[];
}

interface PatientPreferenceProfile {
  id: string;
  patientId: string;
  medicationFormPreference: string[];
  dosingFrequencyPreference: string[];
  costSensitivity: string;
  sideEffectTolerance: string;
  treatmentGoals: string[];
  lifestyleFactors: any;
  culturalPreferences: any;
  religiousConsiderations: string[];
  accessibilityNeeds: string[];
  communicationPreferences: any;
}

const PersonalizedMedicationRecommendations: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for patient medication profiles
  const mockPatientProfiles: PatientMedicationProfile[] = [
    {
      id: "1",
      patientId: "patient-1",
      diagnosis: ["Major Depressive Disorder", "Generalized Anxiety Disorder"],
      currentMedications: {
        "sertraline": { "dose": "50mg", "frequency": "daily", "start_date": "2024-01-01" },
        "buspirone": { "dose": "10mg", "frequency": "twice daily", "start_date": "2024-01-15" }
      },
      medicationHistory: {
        "fluoxetine": { "dose": "20mg", "duration": "6 months", "discontinued": "2023-12-01", "reason": "ineffective" },
        "escitalopram": { "dose": "10mg", "duration": "3 months", "discontinued": "2023-11-01", "reason": "side effects" }
      },
      geneticProfile: {
        "CYP2D6": "intermediate_metabolizer",
        "CYP2C19": "normal_metabolizer",
        "SLC6A4": "heterozygous"
      },
      labResults: {
        "lithium_level": "0.8 mEq/L",
        "creatinine": "0.9 mg/dL",
        "liver_function": "normal"
      },
      vitalSigns: {
        "blood_pressure": "120/80",
        "heart_rate": "72",
        "weight": "70 kg"
      },
      allergies: ["penicillin", "sulfa drugs"],
      contraindications: ["MAO inhibitors"],
      drugInteractions: {
        "warfarin": "moderate",
        "aspirin": "minor"
      },
      sideEffectsHistory: {
        "sertraline": ["nausea", "insomnia"],
        "escitalopram": ["sexual dysfunction", "weight gain"]
      },
      treatmentResponseHistory: {
        "fluoxetine": { "effectiveness": "poor", "duration": "6 months" },
        "escitalopram": { "effectiveness": "moderate", "duration": "3 months" }
      },
      comorbidities: ["hypertension", "diabetes"],
      age: 45,
      gender: "female",
      weightKg: 70,
      heightCm: 165,
      bmi: 25.7,
      renalFunction: 85,
      hepaticFunction: "normal",
      pregnancyStatus: "not_pregnant",
      breastfeeding: false,
      smokingStatus: "former_smoker",
      alcoholUse: "moderate"
    }
  ];

  // Mock data for medication algorithms
  const mockAlgorithms: MedicationAlgorithm[] = [
    {
      id: "1",
      algorithmName: "AI-Powered Depression Treatment",
      algorithmVersion: "2.1",
      algorithmType: "machine_learning",
      description: "Advanced algorithm for personalized depression treatment recommendations",
      clinicalIndications: ["Major Depressive Disorder", "Treatment-resistant depression"],
      inputParameters: {
        "symptoms": "required",
        "genetic_profile": "optional",
        "treatment_history": "required",
        "comorbidities": "required"
      },
      outputParameters: {
        "recommended_medications": "list",
        "confidence_score": "percentage",
        "expected_outcomes": "text"
      },
      accuracyScore: 0.87,
      validationStudies: ["STAR*D Study", "Sequenced Treatment Alternatives"],
      fdaApprovalStatus: "cleared",
      clinicalGuidelines: ["APA Guidelines", "NICE Guidelines"],
      evidenceLevel: "Strong"
    }
  ];

  // Mock data for personalized recommendations
  const mockRecommendations: PersonalizedRecommendation[] = [
    {
      id: "1",
      patientId: "patient-1",
      algorithmId: "1",
      recommendationDate: "2024-01-20",
      primaryDiagnosis: "Major Depressive Disorder",
      recommendedMedications: {
        "venlafaxine": {
          "dose": "37.5mg",
          "frequency": "daily",
          "rationale": "SNRI with good efficacy for treatment-resistant depression",
          "confidence": 0.85
        },
        "bupropion": {
          "dose": "150mg",
          "frequency": "daily",
          "rationale": "Alternative option with minimal sexual side effects",
          "confidence": 0.78
        }
      },
      alternativeMedications: {
        "mirtazapine": {
          "dose": "15mg",
          "frequency": "daily",
          "rationale": "Good for sleep and appetite",
          "confidence": 0.72
        }
      },
      contraindicatedMedications: {
        "MAO inhibitors": "Contraindicated due to drug interactions",
        "high_dose_SSRIs": "Risk of serotonin syndrome"
      },
      dosageRecommendations: {
        "venlafaxine": "Start with 37.5mg daily, titrate to 75mg after 1 week",
        "bupropion": "Start with 150mg daily, increase to 300mg after 1 week"
      },
      titrationSchedule: {
        "week_1": "37.5mg daily",
        "week_2": "75mg daily",
        "week_4": "150mg daily if needed"
      },
      monitoringParameters: {
        "blood_pressure": "weekly",
        "mood_assessment": "weekly",
        "side_effects": "daily"
      },
      expectedOutcomes: {
        "symptom_improvement": "50% reduction in depression symptoms within 4-6 weeks",
        "functional_improvement": "Improved daily functioning and quality of life"
      },
      riskAssessment: {
        "overall_risk": "low",
        "specific_risks": ["hypertension", "sexual side effects"],
        "monitoring_required": true
      },
      confidenceScore: 0.85,
      evidenceSummary: "Based on patient's treatment history and genetic profile",
      clinicalRationale: "SNRI recommended due to previous SSRI failures",
      patientPreferences: {
        "cost_sensitivity": "moderate",
        "side_effect_tolerance": "low",
        "dosing_frequency": "prefer_once_daily"
      },
      costConsiderations: {
        "venlafaxine": "$15/month",
        "bupropion": "$20/month",
        "insurance_coverage": "80%"
      },
      insuranceCoverage: {
        "venlafaxine": "covered",
        "bupropion": "covered",
        "copay": "$10"
      },
      followUpPlan: "Schedule follow-up in 2 weeks to assess response",
      reviewDate: "2024-02-03",
      status: "active"
    }
  ];

  // Mock data for treatment response tracking
  const mockTreatmentResponses: TreatmentResponseTracking[] = [
    {
      id: "1",
      patientId: "patient-1",
      recommendationId: "1",
      medicationName: "venlafaxine",
      startDate: "2024-01-21",
      endDate: "",
      dosageSchedule: {
        "week_1": "37.5mg daily",
        "week_2": "75mg daily"
      },
      adherenceRate: 0.95,
      effectivenessScore: 0.75,
      sideEffectsSeverity: 0.3,
      symptomImprovement: {
        "depression_score": "improved",
        "anxiety_score": "improved",
        "sleep_quality": "improved"
      },
      functionalImprovement: {
        "daily_functioning": "improved",
        "social_functioning": "improved",
        "work_functioning": "improved"
      },
      qualityOfLifeScore: 0.8,
      patientSatisfaction: 0.85,
      clinicianAssessment: {
        "response": "good",
        "side_effects": "minimal",
        "recommendation": "continue_current_dose"
      },
      labMonitoringResults: {
        "blood_pressure": "125/82",
        "liver_function": "normal"
      },
      doseAdjustments: {
        "week_2": "increased_to_75mg",
        "reason": "good_tolerance_and_response"
      },
      discontinuationReason: ""
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const totalRecommendations = mockRecommendations.length;
  const acceptedRecommendations = mockRecommendations.filter(rec => rec.status === 'accepted').length;
  const activeRecommendations = mockRecommendations.filter(rec => rec.status === 'active').length;
  const averageConfidence = mockRecommendations.reduce((sum, rec) => sum + rec.confidenceScore, 0) / mockRecommendations.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personalized Medication Recommendations</h1>
          <p className="text-muted-foreground">
            AI-powered medication recommendations based on patient data and clinical guidelines
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generate Recommendation
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecommendations}</div>
            <p className="text-xs text-muted-foreground">
              AI-generated recommendations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted Recommendations</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedRecommendations}</div>
            <p className="text-xs text-muted-foreground">
              Implemented by providers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Recommendations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRecommendations}</div>
            <p className="text-xs text-muted-foreground">
              Currently being reviewed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(averageConfidence * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Algorithm confidence score
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profiles">Patient Profiles</TabsTrigger>
          <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="responses">Treatment Responses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Recent Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockRecommendations.slice(0, 3).map((recommendation) => (
                    <div key={recommendation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        <span className="text-sm font-medium">{recommendation.primaryDiagnosis}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(recommendation.status)}>
                          {recommendation.status}
                        </Badge>
                        <Badge className={getConfidenceColor(recommendation.confidenceScore)}>
                          {(recommendation.confidenceScore * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivitySquare className="h-5 w-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-green-500" />
                      <span className="text-sm">New recommendation generated</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Recommendation accepted</span>
                    </div>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Treatment response positive</span>
                    </div>
                    <span className="text-xs text-muted-foreground">3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Medication Profiles</CardTitle>
              <CardDescription>
                Comprehensive patient data for personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPatientProfiles.map((profile) => (
                  <div key={profile.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">Patient #{profile.patientId}</span>
                      </div>
                      <Badge variant="outline">{profile.age} years, {profile.gender}</Badge>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Diagnosis:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {profile.diagnosis.map((diag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {diag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Comorbidities:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {profile.comorbidities.map((comorbidity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {comorbidity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Allergies:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {profile.allergies.map((allergy, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Vital Signs:</span> BP: {profile.vitalSigns.blood_pressure}, HR: {profile.vitalSigns.heart_rate}
                      </div>
                      <div>
                        <span className="font-medium">BMI:</span> {profile.bmi}
                      </div>
                      <div>
                        <span className="font-medium">Renal Function:</span> {profile.renalFunction}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="algorithms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medication Algorithms</CardTitle>
              <CardDescription>
                AI algorithms used for generating personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAlgorithms.map((algorithm) => (
                  <div key={algorithm.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        <span className="font-medium">{algorithm.algorithmName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{algorithm.algorithmType}</Badge>
                        <Badge className={algorithm.fdaApprovalStatus === 'cleared' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                          {algorithm.fdaApprovalStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Version:</span> {algorithm.algorithmVersion}
                      </div>
                      <div>
                        <span className="font-medium">Accuracy Score:</span> {(algorithm.accuracyScore * 100).toFixed(0)}%
                      </div>
                      <div>
                        <span className="font-medium">Evidence Level:</span> {algorithm.evidenceLevel}
                      </div>
                      <div>
                        <span className="font-medium">Description:</span> {algorithm.description}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Clinical Indications:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {algorithm.clinicalIndications.map((indication, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {indication}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                AI-generated medication recommendations for patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecommendations.map((recommendation) => (
                  <div key={recommendation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span className="font-medium">{recommendation.primaryDiagnosis}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(recommendation.status)}>
                          {recommendation.status}
                        </Badge>
                        <Badge className={getConfidenceColor(recommendation.confidenceScore)}>
                          {(recommendation.confidenceScore * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Recommendation Date:</span> {recommendation.recommendationDate}
                      </div>
                      <div>
                        <span className="font-medium">Review Date:</span> {recommendation.reviewDate}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Recommended Medications:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(recommendation.recommendedMedications).map(([med, details]: [string, any]) => (
                          <div key={med} className="text-sm">
                            <span className="font-medium">{med}:</span> {details.dose}, {details.frequency} - {details.rationale}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Clinical Rationale:</span> {recommendation.clinicalRationale}
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Expected Outcomes:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(recommendation.expectedOutcomes).map(([outcome, description]: [string, any]) => (
                          <div key={outcome} className="text-sm">
                            <span className="font-medium">{outcome}:</span> {description}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Response Tracking</CardTitle>
              <CardDescription>
                Monitor patient response to recommended treatments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTreatmentResponses.map((response) => (
                  <div key={response.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">{response.medicationName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={response.effectivenessScore >= 0.7 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                          {(response.effectivenessScore * 100).toFixed(0)}% effective
                        </Badge>
                        <Badge variant="outline">{(response.adherenceRate * 100).toFixed(0)}% adherent</Badge>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Start Date:</span> {response.startDate}
                      </div>
                      <div>
                        <span className="font-medium">Quality of Life Score:</span> {(response.qualityOfLifeScore * 100).toFixed(0)}%
                      </div>
                      <div>
                        <span className="font-medium">Patient Satisfaction:</span> {(response.patientSatisfaction * 100).toFixed(0)}%
                      </div>
                      <div>
                        <span className="font-medium">Side Effects Severity:</span> {(response.sideEffectsSeverity * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Symptom Improvement:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(response.symptomImprovement).map(([symptom, status]: [string, any]) => (
                          <div key={symptom} className="text-sm">
                            <span className="font-medium">{symptom}:</span> {status}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommendation Analytics</CardTitle>
              <CardDescription>
                Performance metrics and outcomes analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Algorithm Performance</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Accuracy Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={87} className="h-2 w-20" />
                        <span className="text-sm">87%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Acceptance Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="h-2 w-20" />
                        <span className="text-sm">75%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Effectiveness Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={82} className="h-2 w-20" />
                        <span className="text-sm">82%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Patient Outcomes</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Symptom Improvement</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Functional Improvement</span>
                      <span className="text-sm font-medium">72%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Quality of Life</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Patient Satisfaction</span>
                      <span className="text-sm font-medium">81%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Adherence Rate</span>
                      <span className="text-sm font-medium">89%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalizedMedicationRecommendations;
