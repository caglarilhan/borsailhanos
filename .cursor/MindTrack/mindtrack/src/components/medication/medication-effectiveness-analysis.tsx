'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  Plus,
  Edit,
  Trash2,
  FileText,
  Users,
  Pill,
  Zap,
  Calendar,
  Clock,
  Star,
  Award,
  Brain,
  Heart,
  Shield,
  BookOpen,
  Search,
  Filter,
  Download,
  Upload
} from "lucide-react";

// Interfaces
interface MedicationEffectivenessAssessment {
  id: string;
  patient_id: string;
  medication_id: string;
  assessment_date: string;
  assessment_type: 'initial' | 'follow_up' | 'dose_adjustment' | 'discontinuation';
  assessment_method: 'clinical_interview' | 'rating_scale' | 'patient_report' | 'caregiver_report';
  primary_diagnosis: string;
  secondary_diagnoses?: string[];
  baseline_symptoms?: string;
  current_symptoms?: string;
  symptom_severity_score?: number;
  functional_impairment_score?: number;
  quality_of_life_score?: number;
  medication_adherence_score?: number;
  side_effects_present: boolean;
  side_effects_severity?: number;
  side_effects_description?: string;
  effectiveness_rating?: number;
  global_impression_score?: number;
  clinical_notes?: string;
  treatment_plan_changes?: string;
  next_assessment_date?: string;
  assessed_by?: string;
  medications?: {
    name: string;
    generic_name: string;
    drug_class: string;
  };
  clients?: {
    first_name: string;
    last_name: string;
  };
  assessor?: {
    first_name: string;
    last_name: string;
  };
}

interface RatingScaleAssessment {
  id: string;
  patient_id: string;
  medication_id: string;
  assessment_id?: string;
  scale_name: string;
  scale_version?: string;
  assessment_date: string;
  total_score: number;
  severity_level?: string;
  individual_items?: any;
  interpretation?: string;
  administered_by?: string;
  medications?: {
    name: string;
    generic_name: string;
  };
  clients?: {
    first_name: string;
    last_name: string;
  };
}

interface TreatmentResponseTracking {
  id: string;
  patient_id: string;
  medication_id: string;
  treatment_start_date: string;
  treatment_end_date?: string;
  is_active: boolean;
  response_category: 'remission' | 'response' | 'partial_response' | 'no_response' | 'worsening';
  response_criteria?: string;
  time_to_response_days?: number;
  time_to_remission_days?: number;
  relapse_events: number;
  last_relapse_date?: string;
  dose_optimization_attempts: number;
  medication_changes: number;
  discontinuation_reason?: string;
  discontinuation_date?: string;
  clinical_outcome?: string;
  functional_recovery_score?: number;
  quality_of_life_improvement?: number;
  medications?: {
    name: string;
    generic_name: string;
  };
  clients?: {
    first_name: string;
    last_name: string;
  };
}

interface MedicationEffectivenessAnalytics {
  id: string;
  medication_id: string;
  analysis_period_start: string;
  analysis_period_end: string;
  total_patients: number;
  total_assessments: number;
  average_effectiveness_rating?: number;
  response_rate?: number;
  remission_rate?: number;
  average_time_to_response_days?: number;
  average_time_to_remission_days?: number;
  relapse_rate?: number;
  discontinuation_rate?: number;
  side_effects_rate?: number;
  functional_recovery_rate?: number;
  medications?: {
    name: string;
    generic_name: string;
  };
}

// Mock data
const mockEffectivenessAssessments: MedicationEffectivenessAssessment[] = [
  {
    id: '1',
    patient_id: 'patient-1',
    medication_id: 'med-1',
    assessment_date: '2024-01-15T10:30:00Z',
    assessment_type: 'follow_up',
    assessment_method: 'clinical_interview',
    primary_diagnosis: 'Major Depressive Disorder',
    secondary_diagnoses: ['Generalized Anxiety Disorder'],
    baseline_symptoms: 'Severe depression, insomnia, anhedonia',
    current_symptoms: 'Mild depression, improved sleep, some interest in activities',
    symptom_severity_score: 3,
    functional_impairment_score: 4,
    quality_of_life_score: 6,
    medication_adherence_score: 95,
    side_effects_present: false,
    effectiveness_rating: 4,
    global_impression_score: 3,
    clinical_notes: 'Significant improvement in mood and sleep. Patient reports feeling more like themselves.',
    treatment_plan_changes: 'Continue current dose, monitor for side effects',
    next_assessment_date: '2024-02-15',
    medications: {
      name: 'Sertraline',
      generic_name: 'Sertraline',
      drug_class: 'SSRI'
    },
    clients: {
      first_name: 'John',
      last_name: 'Doe'
    }
  },
  {
    id: '2',
    patient_id: 'patient-2',
    medication_id: 'med-2',
    assessment_date: '2024-01-14T14:15:00Z',
    assessment_type: 'initial',
    assessment_method: 'rating_scale',
    primary_diagnosis: 'Bipolar I Disorder',
    baseline_symptoms: 'Manic episode, decreased need for sleep, racing thoughts',
    current_symptoms: 'Mild hypomania, some sleep disturbance',
    symptom_severity_score: 6,
    functional_impairment_score: 7,
    quality_of_life_score: 3,
    medication_adherence_score: 85,
    side_effects_present: true,
    side_effects_severity: 3,
    side_effects_description: 'Mild nausea, slight tremor',
    effectiveness_rating: 3,
    global_impression_score: 4,
    clinical_notes: 'Partial response to medication. Some improvement but still experiencing symptoms.',
    treatment_plan_changes: 'Consider dose adjustment',
    next_assessment_date: '2024-01-28',
    medications: {
      name: 'Lithium Carbonate',
      generic_name: 'Lithium',
      drug_class: 'Mood Stabilizer'
    },
    clients: {
      first_name: 'Jane',
      last_name: 'Smith'
    }
  }
];

const mockRatingScaleAssessments: RatingScaleAssessment[] = [
  {
    id: '1',
    patient_id: 'patient-1',
    medication_id: 'med-1',
    scale_name: 'PHQ-9',
    scale_version: '2.0',
    assessment_date: '2024-01-15T10:30:00Z',
    total_score: 8,
    severity_level: 'mild',
    interpretation: 'Mild depression symptoms',
    medications: {
      name: 'Sertraline',
      generic_name: 'Sertraline'
    },
    clients: {
      first_name: 'John',
      last_name: 'Doe'
    }
  },
  {
    id: '2',
    patient_id: 'patient-2',
    medication_id: 'med-2',
    scale_name: 'YMRS',
    scale_version: '1.0',
    assessment_date: '2024-01-14T14:15:00Z',
    total_score: 12,
    severity_level: 'moderate',
    interpretation: 'Moderate manic symptoms',
    medications: {
      name: 'Lithium Carbonate',
      generic_name: 'Lithium'
    },
    clients: {
      first_name: 'Jane',
      last_name: 'Smith'
    }
  }
];

const mockTreatmentResponseTracking: TreatmentResponseTracking[] = [
  {
    id: '1',
    patient_id: 'patient-1',
    medication_id: 'med-1',
    treatment_start_date: '2023-12-01',
    is_active: true,
    response_category: 'response',
    response_criteria: '50% reduction in PHQ-9 score',
    time_to_response_days: 28,
    relapse_events: 0,
    dose_optimization_attempts: 1,
    medication_changes: 0,
    functional_recovery_score: 75,
    quality_of_life_improvement: 40,
    medications: {
      name: 'Sertraline',
      generic_name: 'Sertraline'
    },
    clients: {
      first_name: 'John',
      last_name: 'Doe'
    }
  },
  {
    id: '2',
    patient_id: 'patient-2',
    medication_id: 'med-2',
    treatment_start_date: '2024-01-01',
    is_active: true,
    response_category: 'partial_response',
    response_criteria: '30% reduction in YMRS score',
    time_to_response_days: 14,
    relapse_events: 0,
    dose_optimization_attempts: 0,
    medication_changes: 0,
    functional_recovery_score: 60,
    quality_of_life_improvement: 20,
    medications: {
      name: 'Lithium Carbonate',
      generic_name: 'Lithium'
    },
    clients: {
      first_name: 'Jane',
      last_name: 'Smith'
    }
  }
];

const mockEffectivenessAnalytics: MedicationEffectivenessAnalytics[] = [
  {
    id: '1',
    medication_id: 'med-1',
    analysis_period_start: '2023-12-01',
    analysis_period_end: '2024-01-15',
    total_patients: 25,
    total_assessments: 75,
    average_effectiveness_rating: 3.8,
    response_rate: 72.0,
    remission_rate: 48.0,
    average_time_to_response_days: 21.5,
    average_time_to_remission_days: 45.2,
    relapse_rate: 8.0,
    discontinuation_rate: 12.0,
    side_effects_rate: 24.0,
    functional_recovery_rate: 68.0,
    medications: {
      name: 'Sertraline',
      generic_name: 'Sertraline'
    }
  }
];

// Helper functions
const getEffectivenessRatingColor = (rating?: number) => {
  if (!rating) return 'bg-gray-100 text-gray-800';
  if (rating >= 4) return 'bg-green-100 text-green-800';
  if (rating >= 3) return 'bg-yellow-100 text-yellow-800';
  if (rating >= 2) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getEffectivenessRatingText = (rating?: number) => {
  if (!rating) return 'Not Rated';
  if (rating >= 4) return 'Excellent';
  if (rating >= 3) return 'Good';
  if (rating >= 2) return 'Fair';
  return 'Poor';
};

const getResponseCategoryColor = (category: string) => {
  switch (category) {
    case 'remission': return 'bg-green-100 text-green-800';
    case 'response': return 'bg-blue-100 text-blue-800';
    case 'partial_response': return 'bg-yellow-100 text-yellow-800';
    case 'no_response': return 'bg-orange-100 text-orange-800';
    case 'worsening': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getSeverityLevelColor = (level?: string) => {
  switch (level) {
    case 'minimal': return 'bg-green-100 text-green-800';
    case 'mild': return 'bg-yellow-100 text-yellow-800';
    case 'moderate': return 'bg-orange-100 text-orange-800';
    case 'severe': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getAssessmentTypeIcon = (type: string) => {
  switch (type) {
    case 'initial': return Plus;
    case 'follow_up': return Calendar;
    case 'dose_adjustment': return Edit;
    case 'discontinuation': return XCircle;
    default: return Activity;
  }
};

export default function MedicationEffectivenessAnalysis() {
  const [activeTab, setActiveTab] = useState('overview');
  const [effectivenessAssessments] = useState<MedicationEffectivenessAssessment[]>(mockEffectivenessAssessments);
  const [ratingScaleAssessments] = useState<RatingScaleAssessment[]>(mockRatingScaleAssessments);
  const [treatmentResponseTracking] = useState<TreatmentResponseTracking[]>(mockTreatmentResponseTracking);
  const [effectivenessAnalytics] = useState<MedicationEffectivenessAnalytics[]>(mockEffectivenessAnalytics);

  const totalAssessments = effectivenessAssessments.length;
  const averageEffectivenessRating = effectivenessAssessments.reduce((sum, assessment) => 
    sum + (assessment.effectiveness_rating || 0), 0) / totalAssessments;
  const responseRate = treatmentResponseTracking.filter(tracking => 
    tracking.response_category === 'response' || tracking.response_category === 'remission').length / treatmentResponseTracking.length * 100;
  const activeTreatments = treatmentResponseTracking.filter(tracking => tracking.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Medication Effectiveness Analysis</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of medication effectiveness and treatment outcomes for American psychiatrists
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssessments}</div>
            <p className="text-xs text-muted-foreground">
              +5 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Effectiveness</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {averageEffectivenessRating.toFixed(1)}/5
            </div>
            <p className="text-xs text-muted-foreground">
              Overall rating
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{responseRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Treatment response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeTreatments}</div>
            <p className="text-xs text-muted-foreground">
              Ongoing treatments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Effectiveness Assessments</TabsTrigger>
          <TabsTrigger value="rating-scales">Rating Scales</TabsTrigger>
          <TabsTrigger value="treatment-responses">Treatment Responses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Effectiveness Assessments</CardTitle>
                <CardDescription>Latest medication effectiveness assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {effectivenessAssessments.slice(0, 3).map((assessment) => {
                    const AssessmentIcon = getAssessmentTypeIcon(assessment.assessment_type);
                    return (
                      <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AssessmentIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {assessment.medications?.name} - {assessment.clients?.first_name} {assessment.clients?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {assessment.primary_diagnosis} • {new Date(assessment.assessment_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getEffectivenessRatingColor(assessment.effectiveness_rating)}>
                            {getEffectivenessRatingText(assessment.effectiveness_rating)}
                          </Badge>
                          <Badge variant="outline">
                            {assessment.assessment_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Treatment Response Summary</CardTitle>
                <CardDescription>Current treatment response status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {treatmentResponseTracking.slice(0, 3).map((tracking) => (
                    <div key={tracking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {tracking.medications?.name} - {tracking.clients?.first_name} {tracking.clients?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Started: {new Date(tracking.treatment_start_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getResponseCategoryColor(tracking.response_category)}>
                          {tracking.response_category.replace('_', ' ')}
                        </Badge>
                        {tracking.is_active && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Effectiveness Distribution</CardTitle>
              <CardDescription>Distribution of effectiveness ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = effectivenessAssessments.filter(a => a.effectiveness_rating === rating).length;
                  const percentage = totalAssessments > 0 ? (count / totalAssessments) * 100 : 0;
                  return (
                    <div key={rating} className="text-center">
                      <div className="text-2xl font-bold">{count}</div>
                      <p className="text-sm text-muted-foreground">Rating {rating}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medication Effectiveness Assessments</CardTitle>
              <CardDescription>Comprehensive effectiveness assessments and clinical evaluations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {effectivenessAssessments.map((assessment) => {
                  const AssessmentIcon = getAssessmentTypeIcon(assessment.assessment_type);
                  return (
                    <div key={assessment.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <AssessmentIcon className="h-5 w-5 text-muted-foreground mt-1" />
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">
                                {assessment.medications?.name} - {assessment.clients?.first_name} {assessment.clients?.last_name}
                              </h3>
                              <Badge variant="outline">{assessment.assessment_type.replace('_', ' ')}</Badge>
                              <Badge variant="outline">{assessment.assessment_method.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Assessment Date: {new Date(assessment.assessment_date).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Primary Diagnosis: {assessment.primary_diagnosis}
                            </p>
                            {assessment.secondary_diagnoses && assessment.secondary_diagnoses.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                Secondary: {assessment.secondary_diagnoses.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold">
                            {assessment.effectiveness_rating}/5
                          </div>
                          <Badge className={getEffectivenessRatingColor(assessment.effectiveness_rating)}>
                            {getEffectivenessRatingText(assessment.effectiveness_rating)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {assessment.symptom_severity_score !== undefined && (
                          <div className="text-center">
                            <div className="text-lg font-semibold">{assessment.symptom_severity_score}/10</div>
                            <p className="text-sm text-muted-foreground">Symptom Severity</p>
                          </div>
                        )}
                        {assessment.functional_impairment_score !== undefined && (
                          <div className="text-center">
                            <div className="text-lg font-semibold">{assessment.functional_impairment_score}/10</div>
                            <p className="text-sm text-muted-foreground">Functional Impairment</p>
                          </div>
                        )}
                        {assessment.quality_of_life_score !== undefined && (
                          <div className="text-center">
                            <div className="text-lg font-semibold">{assessment.quality_of_life_score}/10</div>
                            <p className="text-sm text-muted-foreground">Quality of Life</p>
                          </div>
                        )}
                        {assessment.medication_adherence_score !== undefined && (
                          <div className="text-center">
                            <div className="text-lg font-semibold">{assessment.medication_adherence_score}%</div>
                            <p className="text-sm text-muted-foreground">Adherence</p>
                          </div>
                        )}
                      </div>

                      {assessment.side_effects_present && (
                        <Alert className="mt-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Side Effects Present: {assessment.side_effects_description} 
                            {assessment.side_effects_severity && ` (Severity: ${assessment.side_effects_severity}/10)`}
                          </AlertDescription>
                        </Alert>
                      )}

                      {assessment.clinical_notes && (
                        <div className="mt-3">
                          <p className="text-sm font-medium">Clinical Notes:</p>
                          <p className="text-sm text-muted-foreground">{assessment.clinical_notes}</p>
                        </div>
                      )}

                      {assessment.treatment_plan_changes && (
                        <div className="mt-3">
                          <p className="text-sm font-medium">Treatment Plan Changes:</p>
                          <p className="text-sm text-muted-foreground">{assessment.treatment_plan_changes}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-end space-x-2 mt-3">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Report
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rating-scales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rating Scale Assessments</CardTitle>
              <CardDescription>Standardized rating scales and clinical measures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ratingScaleAssessments.map((assessment) => (
                  <div key={assessment.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <BarChart3 className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {assessment.medications?.name} - {assessment.clients?.first_name} {assessment.clients?.last_name}
                            </h3>
                            <Badge variant="outline">{assessment.scale_name}</Badge>
                            {assessment.scale_version && (
                              <Badge variant="secondary">v{assessment.scale_version}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Assessment Date: {new Date(assessment.assessment_date).toLocaleString()}
                          </p>
                          {assessment.interpretation && (
                            <p className="text-sm text-muted-foreground">
                              Interpretation: {assessment.interpretation}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold">
                          {assessment.total_score}
                        </div>
                        {assessment.severity_level && (
                          <Badge className={getSeverityLevelColor(assessment.severity_level)}>
                            {assessment.severity_level}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment-responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Response Tracking</CardTitle>
              <CardDescription>Long-term treatment response and outcome tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {treatmentResponseTracking.map((tracking) => (
                  <div key={tracking.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Target className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {tracking.medications?.name} - {tracking.clients?.first_name} {tracking.clients?.last_name}
                            </h3>
                            <Badge className={getResponseCategoryColor(tracking.response_category)}>
                              {tracking.response_category.replace('_', ' ')}
                            </Badge>
                            {tracking.is_active ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Treatment Period: {new Date(tracking.treatment_start_date).toLocaleDateString()}
                            {tracking.treatment_end_date && ` - ${new Date(tracking.treatment_end_date).toLocaleDateString()}`}
                          </p>
                          {tracking.response_criteria && (
                            <p className="text-sm text-muted-foreground">
                              Response Criteria: {tracking.response_criteria}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {tracking.time_to_response_days && (
                          <div className="text-sm">
                            <div className="font-semibold">{tracking.time_to_response_days} days</div>
                            <p className="text-xs text-muted-foreground">Time to Response</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{tracking.relapse_events}</div>
                        <p className="text-sm text-muted-foreground">Relapse Events</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{tracking.dose_optimization_attempts}</div>
                        <p className="text-sm text-muted-foreground">Dose Optimizations</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{tracking.medication_changes}</div>
                        <p className="text-sm text-muted-foreground">Medication Changes</p>
                      </div>
                      {tracking.functional_recovery_score && (
                        <div className="text-center">
                          <div className="text-lg font-semibold">{tracking.functional_recovery_score}%</div>
                          <p className="text-sm text-muted-foreground">Functional Recovery</p>
                        </div>
                      )}
                    </div>

                    {tracking.discontinuation_reason && (
                      <Alert className="mt-3">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          Discontinued: {tracking.discontinuation_reason}
                          {tracking.discontinuation_date && ` (${new Date(tracking.discontinuation_date).toLocaleDateString()})`}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex items-center justify-end space-x-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Report
                      </Button>
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
              <CardTitle>Medication Effectiveness Analytics</CardTitle>
              <CardDescription>Comprehensive analytics and effectiveness metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {effectivenessAnalytics.map((analytics) => (
                  <div key={analytics.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">
                          {analytics.medications?.name} - {analytics.medications?.generic_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Analysis Period: {new Date(analytics.analysis_period_start).toLocaleDateString()} - {new Date(analytics.analysis_period_end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{analytics.total_patients}</div>
                        <p className="text-sm text-muted-foreground">Total Patients</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{analytics.total_assessments}</div>
                        <p className="text-sm text-muted-foreground">Total Assessments</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {analytics.response_rate?.toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Response Rate</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {analytics.remission_rate?.toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Remission Rate</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="flex justify-between text-sm">
                          <span>Average Effectiveness Rating:</span>
                          <span>{analytics.average_effectiveness_rating?.toFixed(1)}/5</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Time to Response:</span>
                          <span>{analytics.average_time_to_response_days?.toFixed(1)} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Time to Remission:</span>
                          <span>{analytics.average_time_to_remission_days?.toFixed(1)} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Relapse Rate:</span>
                          <span>{analytics.relapse_rate?.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Discontinuation Rate:</span>
                          <span>{analytics.discontinuation_rate?.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Side Effects Rate:</span>
                          <span>{analytics.side_effects_rate?.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Functional Recovery Rate:</span>
                          <span>{analytics.functional_recovery_rate?.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



