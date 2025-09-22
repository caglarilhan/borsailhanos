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
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  Plus,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Clock,
  Star,
  Award,
  BarChart3,
  PieChart,
  LineChart,
  Gauge,
  ArrowUp,
  ArrowDown,
  Minus,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Settings,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Square
} from "lucide-react";

// Interfaces
interface AIRecommendationRequest {
  id: string;
  patient_id: string;
  request_type: 'medication_selection' | 'dosage_optimization' | 'drug_interaction_check' | 'adverse_event_prediction' | 'treatment_response';
  clinical_context: any;
  input_features: any;
  model_id?: string;
  request_timestamp: string;
  processing_time_ms?: number;
  confidence_score?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  error_message?: string;
  created_by?: string;
  clients?: {
    first_name: string;
    last_name: string;
  };
  ai_recommendation_models?: {
    model_name: string;
    model_version: string;
    model_type: string;
    algorithm: string;
  };
}

interface AIMedicationRecommendation {
  id: string;
  request_id: string;
  medication_name: string;
  medication_class?: string;
  recommended_dosage?: string;
  dosage_form?: string;
  frequency?: string;
  duration_days?: number;
  confidence_score: number;
  recommendation_rank: number;
  reasoning_explanation?: string;
  expected_efficacy?: number;
  expected_tolerability?: number;
  risk_score?: number;
  contraindications?: string[];
  drug_interactions?: string[];
  monitoring_requirements?: string[];
  alternative_medications?: string[];
  pharmacogenomic_factors?: any;
  clinical_evidence?: any;
  cost_considerations?: any;
  is_accepted?: boolean;
  acceptance_reason?: string;
  rejection_reason?: string;
  accepted_by?: string;
  accepted_at?: string;
  ai_recommendation_requests?: {
    clients?: {
      first_name: string;
      last_name: string;
    };
  };
  ai_recommendation_feedback?: any[];
}

interface AIRecommendationFeedback {
  id: string;
  recommendation_id: string;
  feedback_type: 'acceptance' | 'rejection' | 'modification' | 'outcome' | 'side_effect';
  feedback_score?: number;
  feedback_text?: string;
  clinical_outcome?: 'effective' | 'ineffective' | 'adverse_event' | 'no_change' | 'worsened';
  side_effects_experienced?: string[];
  adherence_level?: number;
  patient_satisfaction?: number;
  provider_satisfaction?: number;
  follow_up_notes?: string;
  feedback_date: string;
  provided_by?: string;
  ai_medication_recommendations?: {
    medication_name: string;
    confidence_score: number;
  };
}

interface AIRecommendationAnalytics {
  id: string;
  analysis_date: string;
  analysis_period_months: number;
  total_requests: number;
  total_recommendations: number;
  average_confidence_score?: number;
  average_processing_time_ms?: number;
  most_recommended_medications?: any;
  most_effective_medications?: any;
  most_rejected_medications?: any;
  recommendation_acceptance_rate?: number;
  clinical_outcome_distribution?: any;
  side_effect_frequency?: any;
  provider_satisfaction_distribution?: any;
  patient_satisfaction_distribution?: any;
  cost_effectiveness_metrics?: any;
  pharmacogenomic_impact_metrics?: any;
  model_performance_summary?: any;
}

// Mock data
const mockRequests: AIRecommendationRequest[] = [
  {
    id: '1',
    patient_id: 'patient-1',
    request_type: 'medication_selection',
    clinical_context: {
      primary_diagnosis: 'Major Depressive Disorder',
      age: 35,
      gender: 'female',
      symptoms: ['depressed mood', 'anhedonia', 'sleep disturbance'],
      previous_medications: ['fluoxetine'],
      comorbidities: ['anxiety']
    },
    input_features: {},
    request_timestamp: '2024-01-15T10:30:00Z',
    processing_time_ms: 150,
    confidence_score: 0.85,
    status: 'completed',
    clients: {
      first_name: 'Sarah',
      last_name: 'Johnson'
    },
    ai_recommendation_models: {
      model_name: 'Depression Treatment AI',
      model_version: '2.1.0',
      model_type: 'deep_learning',
      algorithm: 'transformer'
    }
  }
];

const mockRecommendations: AIMedicationRecommendation[] = [
  {
    id: '1',
    request_id: '1',
    medication_name: 'Sertraline',
    medication_class: 'SSRI',
    recommended_dosage: '50mg',
    dosage_form: 'tablet',
    frequency: 'daily',
    duration_days: 90,
    confidence_score: 0.85,
    recommendation_rank: 1,
    reasoning_explanation: 'First-line SSRI with good efficacy and tolerability profile for depression',
    expected_efficacy: 0.78,
    expected_tolerability: 0.82,
    risk_score: 0.15,
    contraindications: ['MAOI use'],
    drug_interactions: ['warfarin'],
    monitoring_requirements: ['suicidal ideation', 'serotonin syndrome'],
    alternative_medications: ['escitalopram', 'fluoxetine'],
    is_accepted: true,
    acceptance_reason: 'Good match for patient profile',
    accepted_at: '2024-01-15T11:00:00Z',
    ai_recommendation_requests: {
      clients: {
        first_name: 'Sarah',
        last_name: 'Johnson'
      }
    }
  },
  {
    id: '2',
    request_id: '1',
    medication_name: 'Escitalopram',
    medication_class: 'SSRI',
    recommended_dosage: '10mg',
    dosage_form: 'tablet',
    frequency: 'daily',
    duration_days: 90,
    confidence_score: 0.82,
    recommendation_rank: 2,
    reasoning_explanation: 'Alternative SSRI with excellent tolerability and good efficacy',
    expected_efficacy: 0.75,
    expected_tolerability: 0.88,
    risk_score: 0.12,
    contraindications: ['MAOI use'],
    drug_interactions: ['warfarin'],
    monitoring_requirements: ['suicidal ideation', 'serotonin syndrome'],
    alternative_medications: ['sertraline', 'fluoxetine'],
    is_accepted: false,
    rejection_reason: 'Patient prefers sertraline',
    ai_recommendation_requests: {
      clients: {
        first_name: 'Sarah',
        last_name: 'Johnson'
      }
    }
  }
];

const mockFeedback: AIRecommendationFeedback[] = [
  {
    id: '1',
    recommendation_id: '1',
    feedback_type: 'outcome',
    feedback_score: 4,
    feedback_text: 'Patient responded well to sertraline with minimal side effects',
    clinical_outcome: 'effective',
    side_effects_experienced: ['mild nausea'],
    adherence_level: 0.95,
    patient_satisfaction: 4,
    provider_satisfaction: 5,
    follow_up_notes: 'Continue current dose, monitor for improvement',
    feedback_date: '2024-01-22T14:30:00Z',
    ai_medication_recommendations: {
      medication_name: 'Sertraline',
      confidence_score: 0.85
    }
  }
];

const mockAnalytics: AIRecommendationAnalytics[] = [
  {
    id: '1',
    analysis_date: '2024-01-15',
    analysis_period_months: 1,
    total_requests: 45,
    total_recommendations: 135,
    average_confidence_score: 0.82,
    average_processing_time_ms: 180,
    recommendation_acceptance_rate: 0.78,
    clinical_outcome_distribution: {
      effective: 0.72,
      ineffective: 0.15,
      adverse_event: 0.08,
      no_change: 0.05
    },
    provider_satisfaction_distribution: {
      '5': 0.45,
      '4': 0.35,
      '3': 0.15,
      '2': 0.04,
      '1': 0.01
    }
  }
];

// Helper functions
const getRequestTypeColor = (type: string) => {
  switch (type) {
    case 'medication_selection': return 'bg-blue-100 text-blue-800';
    case 'dosage_optimization': return 'bg-green-100 text-green-800';
    case 'drug_interaction_check': return 'bg-orange-100 text-orange-800';
    case 'adverse_event_prediction': return 'bg-red-100 text-red-800';
    case 'treatment_response': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'processing': return 'bg-yellow-100 text-yellow-800';
    case 'pending': return 'bg-blue-100 text-blue-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'cancelled': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getFeedbackTypeColor = (type: string) => {
  switch (type) {
    case 'acceptance': return 'bg-green-100 text-green-800';
    case 'rejection': return 'bg-red-100 text-red-800';
    case 'modification': return 'bg-yellow-100 text-yellow-800';
    case 'outcome': return 'bg-blue-100 text-blue-800';
    case 'side_effect': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getClinicalOutcomeColor = (outcome?: string) => {
  switch (outcome) {
    case 'effective': return 'bg-green-100 text-green-800';
    case 'ineffective': return 'bg-red-100 text-red-800';
    case 'adverse_event': return 'bg-orange-100 text-orange-800';
    case 'no_change': return 'bg-gray-100 text-gray-800';
    case 'worsened': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AIPoweredMedicationRecommendations() {
  const [activeTab, setActiveTab] = useState('overview');
  const [requests] = useState<AIRecommendationRequest[]>(mockRequests);
  const [recommendations] = useState<AIMedicationRecommendation[]>(mockRecommendations);
  const [feedback] = useState<AIRecommendationFeedback[]>(mockFeedback);
  const [analytics] = useState<AIRecommendationAnalytics[]>(mockAnalytics);

  const totalRequests = requests.length;
  const completedRequests = requests.filter(req => req.status === 'completed').length;
  const acceptedRecommendations = recommendations.filter(rec => rec.is_accepted).length;
  const totalRecommendations = recommendations.length;
  const averageConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence_score, 0) / totalRecommendations;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI-Powered Medication Recommendations</h2>
          <p className="text-muted-foreground">
            Advanced AI and ML-powered medication recommendations for American psychiatrists
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {completedRequests} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalRecommendations}</div>
            <p className="text-xs text-muted-foreground">
              {acceptedRecommendations} accepted
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Gauge className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(averageConfidence * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              AI confidence score
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">150ms</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Requests</CardTitle>
                <CardDescription>Latest AI-powered medication recommendation requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Brain className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {request.clients?.first_name} {request.clients?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {request.request_type.replace('_', ' ')} • {new Date(request.request_timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRequestTypeColor(request.request_type)}>
                          {request.request_type.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Recommendations</CardTitle>
                <CardDescription>Most confident AI medication recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.slice(0, 3).map((recommendation) => (
                    <div key={recommendation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {recommendation.medication_name} - {recommendation.ai_recommendation_requests?.clients?.first_name} {recommendation.ai_recommendation_requests?.clients?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {recommendation.recommended_dosage} • {recommendation.frequency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {(recommendation.confidence_score * 100).toFixed(0)}% Confidence
                        </Badge>
                        {recommendation.is_accepted ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accepted
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejected
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
              <CardTitle>AI Model Performance</CardTitle>
              <CardDescription>Performance metrics for AI recommendation models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">85.2%</div>
                  <p className="text-sm text-muted-foreground">Model Accuracy</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">78.5%</div>
                  <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">72.1%</div>
                  <p className="text-sm text-muted-foreground">Effectiveness Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendation Requests</CardTitle>
              <CardDescription>AI-powered medication recommendation requests and processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Brain className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {request.clients?.first_name} {request.clients?.last_name}
                            </h3>
                            <Badge className={getRequestTypeColor(request.request_type)}>
                              {request.request_type.replace('_', ' ')}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Request Time: {new Date(request.request_timestamp).toLocaleString()}
                          </p>
                          {request.processing_time_ms && (
                            <p className="text-sm text-muted-foreground">
                              Processing Time: {request.processing_time_ms}ms
                            </p>
                          )}
                          {request.ai_recommendation_models && (
                            <p className="text-sm text-muted-foreground">
                              Model: {request.ai_recommendation_models.model_name} v{request.ai_recommendation_models.model_version}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {request.confidence_score && (
                          <div className="text-sm">
                            <div className="font-semibold">{(request.confidence_score * 100).toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">Confidence</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">Clinical Context:</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        <p><strong>Primary Diagnosis:</strong> {request.clinical_context.primary_diagnosis}</p>
                        <p><strong>Age:</strong> {request.clinical_context.age} • <strong>Gender:</strong> {request.clinical_context.gender}</p>
                        {request.clinical_context.symptoms && (
                          <p><strong>Symptoms:</strong> {request.clinical_context.symptoms.join(', ')}</p>
                        )}
                        {request.clinical_context.previous_medications && (
                          <p><strong>Previous Medications:</strong> {request.clinical_context.previous_medications.join(', ')}</p>
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

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Medication Recommendations</CardTitle>
              <CardDescription>AI-generated medication recommendations with confidence scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((recommendation) => (
                  <div key={recommendation.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Target className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {recommendation.medication_name} - {recommendation.ai_recommendation_requests?.clients?.first_name} {recommendation.ai_recommendation_requests?.clients?.last_name}
                            </h3>
                            <Badge variant="outline">{recommendation.medication_class}</Badge>
                            <Badge variant="outline">Rank #{recommendation.recommendation_rank}</Badge>
                            {recommendation.is_accepted ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Accepted
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Dosage: {recommendation.recommended_dosage} • Form: {recommendation.dosage_form} • Frequency: {recommendation.frequency}
                          </p>
                          {recommendation.duration_days && (
                            <p className="text-sm text-muted-foreground">
                              Duration: {recommendation.duration_days} days
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold">
                          {(recommendation.confidence_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Confidence</div>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="grid gap-2 md:grid-cols-3">
                        {recommendation.expected_efficacy && (
                          <div className="flex justify-between text-sm">
                            <span>Expected Efficacy:</span>
                            <span>{(recommendation.expected_efficacy * 100).toFixed(0)}%</span>
                          </div>
                        )}
                        {recommendation.expected_tolerability && (
                          <div className="flex justify-between text-sm">
                            <span>Expected Tolerability:</span>
                            <span>{(recommendation.expected_tolerability * 100).toFixed(0)}%</span>
                          </div>
                        )}
                        {recommendation.risk_score && (
                          <div className="flex justify-between text-sm">
                            <span>Risk Score:</span>
                            <span>{(recommendation.risk_score * 100).toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {recommendation.reasoning_explanation && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">AI Reasoning:</p>
                        <p className="text-sm text-muted-foreground">{recommendation.reasoning_explanation}</p>
                      </div>
                    )}

                    {recommendation.contraindications && recommendation.contraindications.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Contraindications:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {recommendation.contraindications.map((contraindication, index) => (
                            <li key={index}>{contraindication}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {recommendation.drug_interactions && recommendation.drug_interactions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Drug Interactions:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {recommendation.drug_interactions.map((interaction, index) => (
                            <li key={index}>{interaction}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {recommendation.monitoring_requirements && recommendation.monitoring_requirements.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Monitoring Requirements:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {recommendation.monitoring_requirements.map((requirement, index) => (
                            <li key={index}>{requirement}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-2 mt-3">
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button variant="outline" size="sm">
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Modify
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendation Feedback</CardTitle>
              <CardDescription>Feedback on AI recommendations for continuous improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.map((fb) => (
                  <div key={fb.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <MessageSquare className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {fb.ai_medication_recommendations?.medication_name} - Feedback
                            </h3>
                            <Badge className={getFeedbackTypeColor(fb.feedback_type)}>
                              {fb.feedback_type.replace('_', ' ')}
                            </Badge>
                            {fb.clinical_outcome && (
                              <Badge className={getClinicalOutcomeColor(fb.clinical_outcome)}>
                                {fb.clinical_outcome.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Feedback Date: {new Date(fb.feedback_date).toLocaleString()}
                          </p>
                          {fb.feedback_score && (
                            <p className="text-sm text-muted-foreground">
                              Feedback Score: {fb.feedback_score}/5
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {fb.patient_satisfaction && (
                          <div className="text-sm">
                            <div className="font-semibold">{fb.patient_satisfaction}/5</div>
                            <p className="text-xs text-muted-foreground">Patient</p>
                          </div>
                        )}
                        {fb.provider_satisfaction && (
                          <div className="text-sm">
                            <div className="font-semibold">{fb.provider_satisfaction}/5</div>
                            <p className="text-xs text-muted-foreground">Provider</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {fb.feedback_text && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Feedback:</p>
                        <p className="text-sm text-muted-foreground">{fb.feedback_text}</p>
                      </div>
                    )}

                    {fb.side_effects_experienced && fb.side_effects_experienced.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Side Effects Experienced:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {fb.side_effects_experienced.map((sideEffect, index) => (
                            <li key={index}>{sideEffect}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {fb.adherence_level && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Adherence Level:</p>
                        <p className="text-sm text-muted-foreground">{(fb.adherence_level * 100).toFixed(0)}%</p>
                      </div>
                    )}

                    {fb.follow_up_notes && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Follow-up Notes:</p>
                        <p className="text-sm text-muted-foreground">{fb.follow_up_notes}</p>
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendation Analytics</CardTitle>
              <CardDescription>Comprehensive analytics and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.map((analytic) => (
                  <div key={analytic.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">
                          Analytics Report
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Analysis Period: {analytic.analysis_period_months} month(s) ending {new Date(analytic.analysis_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{analytic.total_requests}</div>
                        <p className="text-sm text-muted-foreground">Total Requests</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{analytic.total_recommendations}</div>
                        <p className="text-sm text-muted-foreground">Recommendations</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {analytic.average_confidence_score ? (analytic.average_confidence_score * 100).toFixed(1) : 'N/A'}%
                        </div>
                        <p className="text-sm text-muted-foreground">Avg Confidence</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {analytic.recommendation_acceptance_rate ? (analytic.recommendation_acceptance_rate * 100).toFixed(1) : 'N/A'}%
                        </div>
                        <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="flex justify-between text-sm">
                          <span>Average Processing Time:</span>
                          <span>{analytic.average_processing_time_ms || 'N/A'}ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Clinical Outcome Distribution:</span>
                          <span>
                            {analytic.clinical_outcome_distribution ? 
                              Object.entries(analytic.clinical_outcome_distribution)
                                .map(([key, value]) => `${key}: ${(value * 100).toFixed(0)}%`)
                                .join(', ') : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Provider Satisfaction:</span>
                          <span>
                            {analytic.provider_satisfaction_distribution ? 
                              Object.entries(analytic.provider_satisfaction_distribution)
                                .map(([key, value]) => `${key}★: ${(value * 100).toFixed(0)}%`)
                                .join(', ') : 'N/A'}
                          </span>
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




