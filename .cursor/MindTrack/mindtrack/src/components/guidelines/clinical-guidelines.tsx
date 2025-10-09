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
  BookOpen, 
  Target, 
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
  Square,
  Users,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown
} from "lucide-react";

// Interfaces
interface ClinicalGuideline {
  id: string;
  guideline_name: string;
  guideline_code: string;
  guideline_version: string;
  guideline_type: 'diagnosis' | 'treatment' | 'monitoring' | 'screening' | 'prevention';
  category: string;
  subcategory?: string;
  issuing_organization: string;
  publication_date: string;
  effective_date: string;
  expiration_date?: string;
  status: 'active' | 'superseded' | 'withdrawn' | 'draft';
  evidence_level: 'A' | 'B' | 'C' | 'D';
  recommendation_strength: 'strong' | 'moderate' | 'weak' | 'insufficient';
  target_population?: string;
  exclusion_criteria?: string;
  guideline_summary: string;
  full_guideline_text?: string;
  key_recommendations?: string[];
  clinical_algorithms?: any;
  quality_measures?: any;
  references?: string[];
  implementation_notes?: string;
  cost_considerations?: string;
  insurance_coverage?: any;
  regulatory_compliance?: any;
  created_by?: string;
}

interface GuidelineRecommendation {
  id: string;
  guideline_id: string;
  recommendation_number: string;
  recommendation_title: string;
  recommendation_text: string;
  recommendation_type: 'intervention' | 'assessment' | 'monitoring' | 'referral' | 'education';
  priority_level: 'high' | 'medium' | 'low';
  evidence_level: 'A' | 'B' | 'C' | 'D';
  recommendation_strength: 'strong' | 'moderate' | 'weak' | 'insufficient';
  target_condition?: string;
  patient_population?: string;
  contraindications?: string[];
  prerequisites?: string[];
  expected_outcomes?: string[];
  implementation_steps?: string[];
  monitoring_requirements?: string[];
  follow_up_requirements?: string[];
  cost_effectiveness_data?: any;
  quality_metrics?: any;
  clinical_guidelines?: {
    guideline_name: string;
    guideline_code: string;
    category: string;
    issuing_organization: string;
  };
}

interface PatientGuidelineApplication {
  id: string;
  patient_id: string;
  guideline_id: string;
  application_date: string;
  application_type: 'diagnosis' | 'treatment' | 'monitoring' | 'screening';
  patient_condition: string;
  patient_symptoms?: string[];
  patient_demographics?: any;
  guideline_applicability_score?: number;
  applicable_recommendations?: string[];
  non_applicable_recommendations?: string[];
  application_notes?: string;
  implementation_status: 'pending' | 'implemented' | 'partial' | 'not_applicable';
  implementation_date?: string;
  implementation_notes?: string;
  outcome_assessment?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  quality_measures_applied?: any;
  compliance_score?: number;
  applied_by?: string;
  clients?: {
    first_name: string;
    last_name: string;
  };
  clinical_guidelines?: {
    guideline_name: string;
    guideline_code: string;
    category: string;
    issuing_organization: string;
  };
}

interface GuidelineComplianceTracking {
  id: string;
  patient_id: string;
  guideline_id: string;
  recommendation_id: string;
  tracking_date: string;
  compliance_status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  compliance_score?: number;
  compliance_notes?: string;
  barriers_to_compliance?: string[];
  interventions_applied?: string[];
  outcome_achieved?: boolean;
  outcome_description?: string;
  quality_measure_value?: number;
  quality_measure_unit?: string;
  next_assessment_date?: string;
  assessed_by?: string;
  clients?: {
    first_name: string;
    last_name: string;
  };
  clinical_guidelines?: {
    guideline_name: string;
    guideline_code: string;
    category: string;
    issuing_organization: string;
  };
  guideline_recommendations?: {
    recommendation_number: string;
    recommendation_title: string;
    recommendation_text: string;
  };
}

// Mock data
const mockGuidelines: ClinicalGuideline[] = [
  {
    id: '1',
    guideline_name: 'Major Depressive Disorder Treatment Guidelines',
    guideline_code: 'APA-DEP-2023',
    guideline_version: '2.1',
    guideline_type: 'treatment',
    category: 'depression',
    subcategory: 'major_depressive_disorder',
    issuing_organization: 'APA',
    publication_date: '2023-01-15',
    effective_date: '2023-02-01',
    status: 'active',
    evidence_level: 'A',
    recommendation_strength: 'strong',
    target_population: 'Adults with major depressive disorder',
    guideline_summary: 'Evidence-based treatment guidelines for major depressive disorder including pharmacotherapy and psychotherapy recommendations.',
    key_recommendations: ['First-line SSRI treatment', 'Regular monitoring', 'Patient education'],
    references: ['APA Practice Guidelines', 'NICE Guidelines', 'FDA Recommendations']
  },
  {
    id: '2',
    guideline_name: 'Generalized Anxiety Disorder Management',
    guideline_code: 'APA-ANX-2023',
    guideline_version: '1.8',
    guideline_type: 'treatment',
    category: 'anxiety',
    subcategory: 'generalized_anxiety_disorder',
    issuing_organization: 'APA',
    publication_date: '2023-03-01',
    effective_date: '2023-03-15',
    status: 'active',
    evidence_level: 'A',
    recommendation_strength: 'strong',
    target_population: 'Adults with generalized anxiety disorder',
    guideline_summary: 'Comprehensive management guidelines for generalized anxiety disorder including pharmacological and psychological interventions.',
    key_recommendations: ['SSRI/SNRI first-line', 'CBT recommended', 'Regular assessment'],
    references: ['APA Practice Guidelines', 'Cochrane Reviews']
  }
];

const mockRecommendations: GuidelineRecommendation[] = [
  {
    id: '1',
    guideline_id: '1',
    recommendation_number: 'R1',
    recommendation_title: 'First-line SSRI Treatment',
    recommendation_text: 'Initiate treatment with a selective serotonin reuptake inhibitor (SSRI) as first-line pharmacotherapy for major depressive disorder.',
    recommendation_type: 'intervention',
    priority_level: 'high',
    evidence_level: 'A',
    recommendation_strength: 'strong',
    target_condition: 'Major Depressive Disorder',
    patient_population: 'Adults',
    contraindications: ['MAOI use', 'Pregnancy'],
    expected_outcomes: ['Symptom reduction', 'Functional improvement'],
    implementation_steps: ['Assess patient', 'Select appropriate SSRI', 'Start low dose', 'Monitor response'],
    monitoring_requirements: ['Suicidal ideation', 'Side effects', 'Response assessment'],
    clinical_guidelines: {
      guideline_name: 'Major Depressive Disorder Treatment Guidelines',
      guideline_code: 'APA-DEP-2023',
      category: 'depression',
      issuing_organization: 'APA'
    }
  },
  {
    id: '2',
    guideline_id: '1',
    recommendation_number: 'R2',
    recommendation_title: 'Regular Monitoring',
    recommendation_text: 'Monitor patients regularly for treatment response, side effects, and suicidal ideation.',
    recommendation_type: 'monitoring',
    priority_level: 'high',
    evidence_level: 'A',
    recommendation_strength: 'strong',
    target_condition: 'Major Depressive Disorder',
    patient_population: 'All patients',
    expected_outcomes: ['Early detection of issues', 'Improved outcomes'],
    implementation_steps: ['Schedule follow-up', 'Assess symptoms', 'Monitor side effects'],
    monitoring_requirements: ['PHQ-9 scores', 'Side effect checklist', 'Suicide risk assessment'],
    clinical_guidelines: {
      guideline_name: 'Major Depressive Disorder Treatment Guidelines',
      guideline_code: 'APA-DEP-2023',
      category: 'depression',
      issuing_organization: 'APA'
    }
  }
];

const mockApplications: PatientGuidelineApplication[] = [
  {
    id: '1',
    patient_id: 'patient-1',
    guideline_id: '1',
    application_date: '2024-01-15',
    application_type: 'treatment',
    patient_condition: 'Major Depressive Disorder',
    patient_symptoms: ['depressed mood', 'anhedonia', 'sleep disturbance'],
    patient_demographics: { age: 35, gender: 'female' },
    guideline_applicability_score: 0.85,
    applicable_recommendations: ['1', '2'],
    non_applicable_recommendations: [],
    application_notes: 'Patient meets criteria for MDD treatment guidelines',
    implementation_status: 'implemented',
    implementation_date: '2024-01-16',
    implementation_notes: 'Started on sertraline 50mg daily',
    outcome_assessment: 'Good initial response',
    follow_up_required: true,
    follow_up_date: '2024-01-29',
    compliance_score: 0.90,
    clients: {
      first_name: 'Sarah',
      last_name: 'Johnson'
    },
    clinical_guidelines: {
      guideline_name: 'Major Depressive Disorder Treatment Guidelines',
      guideline_code: 'APA-DEP-2023',
      category: 'depression',
      issuing_organization: 'APA'
    }
  }
];

const mockComplianceTracking: GuidelineComplianceTracking[] = [
  {
    id: '1',
    patient_id: 'patient-1',
    guideline_id: '1',
    recommendation_id: '1',
    tracking_date: '2024-01-22',
    compliance_status: 'compliant',
    compliance_score: 0.95,
    compliance_notes: 'Patient taking medication as prescribed',
    barriers_to_compliance: [],
    interventions_applied: ['Medication education', 'Side effect management'],
    outcome_achieved: true,
    outcome_description: 'Significant improvement in mood and sleep',
    quality_measure_value: 8.5,
    quality_measure_unit: 'PHQ-9 score',
    next_assessment_date: '2024-01-29',
    clients: {
      first_name: 'Sarah',
      last_name: 'Johnson'
    },
    clinical_guidelines: {
      guideline_name: 'Major Depressive Disorder Treatment Guidelines',
      guideline_code: 'APA-DEP-2023',
      category: 'depression',
      issuing_organization: 'APA'
    },
    guideline_recommendations: {
      recommendation_number: 'R1',
      recommendation_title: 'First-line SSRI Treatment',
      recommendation_text: 'Initiate treatment with a selective serotonin reuptake inhibitor (SSRI) as first-line pharmacotherapy for major depressive disorder.'
    }
  }
];

// Helper functions
const getGuidelineTypeColor = (type: string) => {
  switch (type) {
    case 'diagnosis': return 'bg-blue-100 text-blue-800';
    case 'treatment': return 'bg-green-100 text-green-800';
    case 'monitoring': return 'bg-yellow-100 text-yellow-800';
    case 'screening': return 'bg-purple-100 text-purple-800';
    case 'prevention': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'superseded': return 'bg-yellow-100 text-yellow-800';
    case 'withdrawn': return 'bg-red-100 text-red-800';
    case 'draft': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getEvidenceLevelColor = (level: string) => {
  switch (level) {
    case 'A': return 'bg-green-100 text-green-800';
    case 'B': return 'bg-blue-100 text-blue-800';
    case 'C': return 'bg-yellow-100 text-yellow-800';
    case 'D': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getRecommendationTypeColor = (type: string) => {
  switch (type) {
    case 'intervention': return 'bg-green-100 text-green-800';
    case 'assessment': return 'bg-blue-100 text-blue-800';
    case 'monitoring': return 'bg-yellow-100 text-yellow-800';
    case 'referral': return 'bg-purple-100 text-purple-800';
    case 'education': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityLevelColor = (level: string) => {
  switch (level) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getComplianceStatusColor = (status: string) => {
  switch (status) {
    case 'compliant': return 'bg-green-100 text-green-800';
    case 'non_compliant': return 'bg-red-100 text-red-800';
    case 'partial': return 'bg-yellow-100 text-yellow-800';
    case 'not_applicable': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getImplementationStatusColor = (status: string) => {
  switch (status) {
    case 'implemented': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'partial': return 'bg-orange-100 text-orange-800';
    case 'not_applicable': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function ClinicalGuidelines() {
  const [activeTab, setActiveTab] = useState('overview');
  const [guidelines] = useState<ClinicalGuideline[]>(mockGuidelines);
  const [recommendations] = useState<GuidelineRecommendation[]>(mockRecommendations);
  const [applications] = useState<PatientGuidelineApplication[]>(mockApplications);
  const [complianceTracking] = useState<GuidelineComplianceTracking[]>(mockComplianceTracking);

  const totalGuidelines = guidelines.length;
  const activeGuidelines = guidelines.filter(g => g.status === 'active').length;
  const totalApplications = applications.length;
  const implementedApplications = applications.filter(a => a.implementation_status === 'implemented').length;
  const compliantTracking = complianceTracking.filter(t => t.compliance_status === 'compliant').length;
  const totalTracking = complianceTracking.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clinical Guidelines</h2>
          <p className="text-muted-foreground">
            Evidence-based clinical guidelines and compliance tracking for American psychiatrists
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Guideline
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guidelines</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuidelines}</div>
            <p className="text-xs text-muted-foreground">
              {activeGuidelines} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {implementedApplications} implemented
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalTracking > 0 ? Math.round((compliantTracking / totalTracking) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {compliantTracking}/{totalTracking} compliant
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{recommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              Evidence-based recommendations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Guidelines</CardTitle>
                <CardDescription>Latest clinical guidelines and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guidelines.slice(0, 3).map((guideline) => (
                    <div key={guideline.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {guideline.guideline_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {guideline.issuing_organization} • v{guideline.guideline_version}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getGuidelineTypeColor(guideline.guideline_type)}>
                          {guideline.guideline_type}
                        </Badge>
                        <Badge className={getStatusColor(guideline.status)}>
                          {guideline.status}
                        </Badge>
                        <Badge className={getEvidenceLevelColor(guideline.evidence_level)}>
                          Level {guideline.evidence_level}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest patient guideline applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.slice(0, 3).map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {application.clients?.first_name} {application.clients?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {application.patient_condition} • {new Date(application.application_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getImplementationStatusColor(application.implementation_status)}>
                          {application.implementation_status}
                        </Badge>
                        {application.guideline_applicability_score && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {(application.guideline_applicability_score * 100).toFixed(0)}% Applicable
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
              <CardTitle>Guideline Categories</CardTitle>
              <CardDescription>Distribution of guidelines by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                {['depression', 'anxiety', 'bipolar', 'schizophrenia', 'substance_use'].map((category) => {
                  const count = guidelines.filter(g => g.category === category).length;
                  const percentage = totalGuidelines > 0 ? (count / totalGuidelines) * 100 : 0;
                  return (
                    <div key={category} className="text-center">
                      <div className="text-2xl font-bold">{count}</div>
                      <p className="text-sm text-muted-foreground capitalize">{category.replace('_', ' ')}</p>
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

        <TabsContent value="guidelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Guidelines</CardTitle>
              <CardDescription>Evidence-based clinical guidelines and best practices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {guidelines.map((guideline) => (
                  <div key={guideline.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <BookOpen className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {guideline.guideline_name}
                            </h3>
                            <Badge className={getGuidelineTypeColor(guideline.guideline_type)}>
                              {guideline.guideline_type}
                            </Badge>
                            <Badge className={getStatusColor(guideline.status)}>
                              {guideline.status}
                            </Badge>
                            <Badge className={getEvidenceLevelColor(guideline.evidence_level)}>
                              Level {guideline.evidence_level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {guideline.guideline_code} • v{guideline.guideline_version} • {guideline.issuing_organization}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Effective: {new Date(guideline.effective_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Category: {guideline.category} {guideline.subcategory && `• ${guideline.subcategory}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {guideline.recommendation_strength}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-medium">Summary:</p>
                      <p className="text-sm text-muted-foreground">{guideline.guideline_summary}</p>
                    </div>

                    {guideline.target_population && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Target Population:</p>
                        <p className="text-sm text-muted-foreground">{guideline.target_population}</p>
                      </div>
                    )}

                    {guideline.key_recommendations && guideline.key_recommendations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Key Recommendations:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {guideline.key_recommendations.map((recommendation, index) => (
                            <li key={index}>{recommendation}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {guideline.references && guideline.references.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">References:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {guideline.references.map((reference, index) => (
                            <li key={index}>{reference}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Target className="h-4 w-4 mr-1" />
                        Apply to Patient
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
              <CardTitle>Guideline Recommendations</CardTitle>
              <CardDescription>Specific recommendations from clinical guidelines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((recommendation) => (
                  <div key={recommendation.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Award className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {recommendation.recommendation_number}: {recommendation.recommendation_title}
                            </h3>
                            <Badge className={getRecommendationTypeColor(recommendation.recommendation_type)}>
                              {recommendation.recommendation_type}
                            </Badge>
                            <Badge className={getPriorityLevelColor(recommendation.priority_level)}>
                              {recommendation.priority_level}
                            </Badge>
                            <Badge className={getEvidenceLevelColor(recommendation.evidence_level)}>
                              Level {recommendation.evidence_level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {recommendation.clinical_guidelines?.guideline_name} • {recommendation.clinical_guidelines?.issuing_organization}
                          </p>
                          {recommendation.target_condition && (
                            <p className="text-sm text-muted-foreground">
                              Target: {recommendation.target_condition}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {recommendation.recommendation_strength}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-medium">Recommendation:</p>
                      <p className="text-sm text-muted-foreground">{recommendation.recommendation_text}</p>
                    </div>

                    {recommendation.expected_outcomes && recommendation.expected_outcomes.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Expected Outcomes:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {recommendation.expected_outcomes.map((outcome, index) => (
                            <li key={index}>{outcome}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {recommendation.implementation_steps && recommendation.implementation_steps.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Implementation Steps:</p>
                        <ol className="text-sm text-muted-foreground list-decimal list-inside">
                          {recommendation.implementation_steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
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

                    <div className="flex items-center justify-end space-x-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Guideline Applications</CardTitle>
              <CardDescription>Application of clinical guidelines to specific patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Target className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {application.clients?.first_name} {application.clients?.last_name}
                            </h3>
                            <Badge className={getImplementationStatusColor(application.implementation_status)}>
                              {application.implementation_status}
                            </Badge>
                            <Badge variant="outline">{application.application_type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {application.clinical_guidelines?.guideline_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Condition: {application.patient_condition}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Application Date: {new Date(application.application_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {application.guideline_applicability_score && (
                          <div className="text-sm">
                            <div className="font-semibold">{(application.guideline_applicability_score * 100).toFixed(0)}%</div>
                            <p className="text-xs text-muted-foreground">Applicable</p>
                          </div>
                        )}
                        {application.compliance_score && (
                          <div className="text-sm">
                            <div className="font-semibold">{(application.compliance_score * 100).toFixed(0)}%</div>
                            <p className="text-xs text-muted-foreground">Compliant</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {application.patient_symptoms && application.patient_symptoms.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Patient Symptoms:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {application.patient_symptoms.map((symptom, index) => (
                            <li key={index}>{symptom}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {application.application_notes && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Application Notes:</p>
                        <p className="text-sm text-muted-foreground">{application.application_notes}</p>
                      </div>
                    )}

                    {application.implementation_notes && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Implementation Notes:</p>
                        <p className="text-sm text-muted-foreground">{application.implementation_notes}</p>
                      </div>
                    )}

                    {application.outcome_assessment && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Outcome Assessment:</p>
                        <p className="text-sm text-muted-foreground">{application.outcome_assessment}</p>
                      </div>
                    )}

                    {application.follow_up_required && (
                      <Alert className="mt-3">
                        <Calendar className="h-4 w-4" />
                        <AlertDescription>
                          Follow-up required by {application.follow_up_date}
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
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Track Compliance
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guideline Compliance Tracking</CardTitle>
              <CardDescription>Tracking compliance with clinical guideline recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceTracking.map((tracking) => (
                  <div key={tracking.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {tracking.clients?.first_name} {tracking.clients?.last_name}
                            </h3>
                            <Badge className={getComplianceStatusColor(tracking.compliance_status)}>
                              {tracking.compliance_status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {tracking.guideline_recommendations?.recommendation_number}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {tracking.guideline_recommendations?.recommendation_title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Tracking Date: {new Date(tracking.tracking_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tracking.clinical_guidelines?.guideline_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {tracking.compliance_score && (
                          <div className="text-sm">
                            <div className="font-semibold">{(tracking.compliance_score * 100).toFixed(0)}%</div>
                            <p className="text-xs text-muted-foreground">Compliance</p>
                          </div>
                        )}
                        {tracking.outcome_achieved !== undefined && (
                          <div className="text-sm">
                            <div className="font-semibold">
                              {tracking.outcome_achieved ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">Outcome</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {tracking.compliance_notes && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Compliance Notes:</p>
                        <p className="text-sm text-muted-foreground">{tracking.compliance_notes}</p>
                      </div>
                    )}

                    {tracking.barriers_to_compliance && tracking.barriers_to_compliance.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Barriers to Compliance:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {tracking.barriers_to_compliance.map((barrier, index) => (
                            <li key={index}>{barrier}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {tracking.interventions_applied && tracking.interventions_applied.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Interventions Applied:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {tracking.interventions_applied.map((intervention, index) => (
                            <li key={index}>{intervention}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {tracking.outcome_description && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Outcome Description:</p>
                        <p className="text-sm text-muted-foreground">{tracking.outcome_description}</p>
                      </div>
                    )}

                    {tracking.quality_measure_value && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Quality Measure:</span>
                          <span>{tracking.quality_measure_value} {tracking.quality_measure_unit}</span>
                        </div>
                      </div>
                    )}

                    {tracking.next_assessment_date && (
                      <Alert className="mt-3">
                        <Calendar className="h-4 w-4" />
                        <AlertDescription>
                          Next assessment due: {new Date(tracking.next_assessment_date).toLocaleDateString()}
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
      </Tabs>
    </div>
  );
}











