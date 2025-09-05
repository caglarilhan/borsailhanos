'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Calendar, 
  Users, 
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  Bell,
  Shield,
  Star,
  Target,
  TrendingUp,
  FileText,
  PieChart,
  LineChart,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Stop,
  PlayCircle,
  BookMarked,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Globe,
  Video,
  Headphones,
  Monitor,
  Smartphone,
  Tablet,
  Laptop
} from 'lucide-react';

// Interfaces
interface CMEActivity {
  id: string;
  activity_id: string;
  provider_id: string;
  activity_title: string;
  activity_description?: string;
  activity_type: 'live_event' | 'enduring_material' | 'journal_based' | 'internet_live' | 'internet_enduring' | 'performance_improvement';
  activity_format: 'lecture' | 'workshop' | 'case_study' | 'simulation' | 'online_module' | 'journal_article' | 'podcast' | 'video';
  specialty?: string;
  target_audience?: string;
  learning_objectives?: string[];
  prerequisites?: string[];
  activity_date?: string;
  activity_end_date?: string;
  duration_hours: number;
  cme_credits: number;
  max_participants?: number;
  registration_fee: number;
  registration_deadline?: string;
  location?: string;
  virtual_meeting_url?: string;
  materials_url?: string;
  evaluation_url?: string;
  is_active: boolean;
  requires_attendance: boolean;
  requires_evaluation: boolean;
  requires_post_test: boolean;
  passing_score?: number;
  created_at: string;
  updated_at: string;
}

interface CMERegistration {
  id: string;
  registration_id: string;
  practitioner_id: string;
  activity_id: string;
  registration_date: string;
  registration_status: 'registered' | 'confirmed' | 'cancelled' | 'waitlisted' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded' | 'waived';
  payment_amount?: number;
  payment_method?: string;
  payment_reference?: string;
  attendance_confirmed: boolean;
  attendance_date?: string;
  completion_date?: string;
  evaluation_completed: boolean;
  evaluation_score?: number;
  post_test_completed: boolean;
  post_test_score?: number;
  certificate_issued: boolean;
  certificate_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface CMECredit {
  id: string;
  credit_id: string;
  practitioner_id: string;
  activity_id: string;
  registration_id?: string;
  credit_type: 'AMA_PRA_Category_1' | 'AMA_PRA_Category_2' | 'MOC_Part_II' | 'MOC_Part_IV' | 'state_required' | 'specialty_board';
  credit_amount: number;
  credit_date: string;
  credit_year: number;
  credit_status: 'earned' | 'pending' | 'revoked' | 'transferred';
  verification_code?: string;
  verification_url?: string;
  is_transferable: boolean;
  transfer_date?: string;
  transfer_to_practitioner_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface CMERequirement {
  id: string;
  requirement_id: string;
  practitioner_id: string;
  requirement_year: number;
  requirement_type: 'annual' | 'biennial' | 'triennial' | 'specialty_board' | 'state_licensing';
  total_credits_required: number;
  category_1_credits_required: number;
  category_2_credits_required: number;
  specialty_credits_required: number;
  ethics_credits_required: number;
  pain_management_credits_required: number;
  credits_earned: number;
  credits_pending: number;
  requirement_status: 'in_progress' | 'completed' | 'deficient' | 'exempt';
  due_date?: string;
  completion_date?: string;
  deficiency_notice_sent: boolean;
  deficiency_notice_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface CMELearningAnalytics {
  id: string;
  practitioner_id?: string;
  analysis_date: string;
  analysis_period_months: number;
  total_activities_completed: number;
  total_credits_earned: number;
  average_evaluation_score?: number;
  average_post_test_score?: number;
  preferred_activity_types?: string[];
  preferred_activity_formats?: string[];
  preferred_specialties?: string[];
  learning_goals?: string[];
  areas_for_improvement?: string[];
  continuing_education_plan?: string;
  mentor_recommendations?: string;
  compliance_risk_score?: number;
  learning_effectiveness_score?: number;
  engagement_score?: number;
  cost_per_credit?: number;
  roi_analysis?: any;
  created_at: string;
  updated_at: string;
}

// Mock data
const mockCMEActivities: CMEActivity[] = [
  {
    id: '1',
    activity_id: 'CME-2024-001',
    provider_id: 'provider-1',
    activity_title: 'Advanced Psychopharmacology in Depression Treatment',
    activity_description: 'Comprehensive review of latest evidence-based treatments for depression',
    activity_type: 'live_event',
    activity_format: 'lecture',
    specialty: 'psychiatry',
    target_audience: 'psychiatrists',
    learning_objectives: ['Understand latest antidepressants', 'Learn about treatment-resistant depression', 'Review side effect management'],
    prerequisites: ['Basic psychopharmacology knowledge'],
    activity_date: '2024-02-15',
    duration_hours: 3.0,
    cme_credits: 3.0,
    max_participants: 50,
    registration_fee: 150.00,
    registration_deadline: '2024-02-10',
    location: 'Convention Center, New York',
    is_active: true,
    requires_attendance: true,
    requires_evaluation: true,
    requires_post_test: true,
    passing_score: 70.0,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    activity_id: 'CME-2024-002',
    provider_id: 'provider-2',
    activity_title: 'Telepsychiatry Best Practices',
    activity_description: 'Essential guidelines for effective telepsychiatry practice',
    activity_type: 'internet_enduring',
    activity_format: 'online_module',
    specialty: 'psychiatry',
    target_audience: 'psychiatrists',
    learning_objectives: ['Learn telepsychiatry regulations', 'Understand technology requirements', 'Review patient safety protocols'],
    activity_date: '2024-03-01',
    duration_hours: 2.0,
    cme_credits: 2.0,
    registration_fee: 75.00,
    virtual_meeting_url: 'https://cme.example.com/telepsychiatry',
    is_active: true,
    requires_attendance: false,
    requires_evaluation: true,
    requires_post_test: false,
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-20T09:00:00Z'
  }
];

const mockCMERegistrations: CMERegistration[] = [
  {
    id: '1',
    registration_id: 'REG-2024-001',
    practitioner_id: 'practitioner-1',
    activity_id: 'activity-1',
    registration_date: '2024-01-25T10:00:00Z',
    registration_status: 'confirmed',
    payment_status: 'paid',
    payment_amount: 150.00,
    payment_method: 'credit_card',
    payment_reference: 'PAY-123456',
    attendance_confirmed: true,
    attendance_date: '2024-02-15T09:00:00Z',
    completion_date: '2024-02-15T12:00:00Z',
    evaluation_completed: true,
    evaluation_score: 4.5,
    post_test_completed: true,
    post_test_score: 85.0,
    certificate_issued: true,
    certificate_url: 'https://certs.example.com/cert-123',
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-02-15T12:00:00Z'
  }
];

const mockCMECredits: CMECredit[] = [
  {
    id: '1',
    credit_id: 'CREDIT-2024-001',
    practitioner_id: 'practitioner-1',
    activity_id: 'activity-1',
    registration_id: 'registration-1',
    credit_type: 'AMA_PRA_Category_1',
    credit_amount: 3.0,
    credit_date: '2024-02-15',
    credit_year: 2024,
    credit_status: 'earned',
    verification_code: 'VER-123456',
    verification_url: 'https://verify.example.com/VER-123456',
    is_transferable: true,
    created_at: '2024-02-15T12:00:00Z',
    updated_at: '2024-02-15T12:00:00Z'
  }
];

const mockCMERequirements: CMERequirement[] = [
  {
    id: '1',
    requirement_id: 'REQ-2024-001',
    practitioner_id: 'practitioner-1',
    requirement_year: 2024,
    requirement_type: 'annual',
    total_credits_required: 50.0,
    category_1_credits_required: 30.0,
    category_2_credits_required: 20.0,
    specialty_credits_required: 10.0,
    ethics_credits_required: 2.0,
    pain_management_credits_required: 0.0,
    credits_earned: 15.0,
    credits_pending: 5.0,
    requirement_status: 'in_progress',
    due_date: '2024-12-31',
    deficiency_notice_sent: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-02-15T12:00:00Z'
  }
];

const mockCMELearningAnalytics: CMELearningAnalytics[] = [
  {
    id: '1',
    practitioner_id: 'practitioner-1',
    analysis_date: '2024-02-20',
    analysis_period_months: 12,
    total_activities_completed: 8,
    total_credits_earned: 25.0,
    average_evaluation_score: 4.3,
    average_post_test_score: 87.5,
    preferred_activity_types: ['live_event', 'internet_enduring'],
    preferred_activity_formats: ['lecture', 'online_module'],
    preferred_specialties: ['psychiatry', 'addiction_medicine'],
    learning_goals: ['Stay current with psychopharmacology', 'Improve telepsychiatry skills'],
    areas_for_improvement: ['Child psychiatry', 'Forensic psychiatry'],
    continuing_education_plan: 'Focus on specialty board requirements',
    mentor_recommendations: 'Consider advanced training in addiction medicine',
    compliance_risk_score: 15.0,
    learning_effectiveness_score: 86.0,
    engagement_score: 92.0,
    cost_per_credit: 45.0,
    roi_analysis: {
      total_investment: 1125.0,
      credits_earned: 25.0,
      cost_per_credit: 45.0,
      roi_percentage: 250.0
    },
    created_at: '2024-02-20T00:00:00Z',
    updated_at: '2024-02-20T00:00:00Z'
  }
];

// Helper functions
const getActivityTypeIcon = (type: string) => {
  switch (type) {
    case 'live_event': return <Users className="h-4 w-4" />;
    case 'enduring_material': return <BookOpen className="h-4 w-4" />;
    case 'journal_based': return <FileText className="h-4 w-4" />;
    case 'internet_live': return <Video className="h-4 w-4" />;
    case 'internet_enduring': return <Monitor className="h-4 w-4" />;
    case 'performance_improvement': return <Target className="h-4 w-4" />;
    default: return <GraduationCap className="h-4 w-4" />;
  }
};

const getActivityFormatIcon = (format: string) => {
  switch (format) {
    case 'lecture': return <Users className="h-4 w-4" />;
    case 'workshop': return <BookOpen className="h-4 w-4" />;
    case 'case_study': return <FileText className="h-4 w-4" />;
    case 'simulation': return <PlayCircle className="h-4 w-4" />;
    case 'online_module': return <Monitor className="h-4 w-4" />;
    case 'journal_article': return <FileText className="h-4 w-4" />;
    case 'podcast': return <Headphones className="h-4 w-4" />;
    case 'video': return <Video className="h-4 w-4" />;
    default: return <GraduationCap className="h-4 w-4" />;
  }
};

const getCreditTypeIcon = (type: string) => {
  switch (type) {
    case 'AMA_PRA_Category_1': return <Award className="h-4 w-4" />;
    case 'AMA_PRA_Category_2': return <Star className="h-4 w-4" />;
    case 'MOC_Part_II': return <Target className="h-4 w-4" />;
    case 'MOC_Part_IV': return <TrendingUp className="h-4 w-4" />;
    case 'state_required': return <Shield className="h-4 w-4" />;
    case 'specialty_board': return <Award className="h-4 w-4" />;
    default: return <Award className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'default';
    case 'in_progress': return 'secondary';
    case 'deficient': return 'destructive';
    case 'compliant': return 'default';
    case 'non_compliant': return 'destructive';
    case 'at_risk': return 'secondary';
    default: return 'outline';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export function ContinuingMedicalEducationManagement() {
  const [cmeActivities, setCmeActivities] = useState<CMEActivity[]>(mockCMEActivities);
  const [cmeRegistrations, setCmeRegistrations] = useState<CMERegistration[]>(mockCMERegistrations);
  const [cmeCredits, setCmeCredits] = useState<CMECredit[]>(mockCMECredits);
  const [cmeRequirements, setCmeRequirements] = useState<CMERequirement[]>(mockCMERequirements);
  const [cmeLearningAnalytics, setCmeLearningAnalytics] = useState<CMELearningAnalytics[]>(mockCMELearningAnalytics);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Overview stats
  const totalActivities = cmeActivities.length;
  const activeActivities = cmeActivities.filter(activity => activity.is_active).length;
  const totalRegistrations = cmeRegistrations.length;
  const completedRegistrations = cmeRegistrations.filter(reg => reg.registration_status === 'completed').length;
  const totalCreditsEarned = cmeCredits.reduce((sum, credit) => sum + credit.credit_amount, 0);
  const currentYearCredits = cmeCredits.filter(credit => credit.credit_year === 2024).reduce((sum, credit) => sum + credit.credit_amount, 0);
  const complianceStatus = cmeRequirements[0]?.requirement_status || 'in_progress';
  const creditsRemaining = cmeRequirements[0] ? cmeRequirements[0].total_credits_required - cmeRequirements[0].credits_earned : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Continuing Medical Education (CME)</h2>
          <p className="text-muted-foreground">
            Comprehensive CME credit tracking and educational content management for American psychiatrists
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Register for Activity
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CME Activities</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              {activeActivities} active activities
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              {completedRegistrations} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCreditsEarned}</div>
            <p className="text-xs text-muted-foreground">
              {currentYearCredits} in 2024
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditsRemaining}</div>
            <p className="text-xs text-muted-foreground">
              Credits remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent CME Activities</CardTitle>
                <CardDescription>Latest educational opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cmeActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getActivityTypeIcon(activity.activity_type)}
                      <div>
                        <p className="font-medium">{activity.activity_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.activity_format} • {activity.duration_hours}h • {activity.cme_credits} credits
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={activity.is_active ? "default" : "secondary"}>
                        {activity.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.activity_date && formatDate(activity.activity_date)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Current CME requirements and progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cmeRequirements.map((requirement) => (
                  <div key={requirement.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{requirement.requirement_year} Requirements</p>
                        <p className="text-sm text-muted-foreground">
                          {requirement.requirement_type.replace('_', ' ')} • Due {requirement.due_date && formatDate(requirement.due_date)}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(requirement.requirement_status)}>
                        {requirement.requirement_status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Credits Earned</span>
                        <span>{requirement.credits_earned} / {requirement.total_credits_required}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(requirement.credits_earned / requirement.total_credits_required) * 100}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Category 1</p>
                          <p className="font-semibold">{requirement.category_1_credits_required}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Category 2</p>
                          <p className="font-semibold">{requirement.category_2_credits_required}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Learning Analytics Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Analytics</CardTitle>
              <CardDescription>Performance metrics and learning insights</CardDescription>
            </CardHeader>
            <CardContent>
              {cmeLearningAnalytics.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {cmeLearningAnalytics[0].total_activities_completed}
                    </div>
                    <p className="text-sm text-muted-foreground">Activities Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPercentage(cmeLearningAnalytics[0].learning_effectiveness_score || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Learning Effectiveness</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatPercentage(cmeLearningAnalytics[0].engagement_score || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Engagement Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(cmeLearningAnalytics[0].cost_per_credit || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Cost per Credit</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CME Activities</CardTitle>
              <CardDescription>Available educational activities and programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cmeActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getActivityTypeIcon(activity.activity_type)}
                      <div>
                        <h3 className="font-semibold">{activity.activity_title}</h3>
                        <p className="text-sm text-muted-foreground">{activity.activity_description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{activity.activity_type.replace('_', ' ')}</Badge>
                          <Badge variant="outline">{activity.activity_format.replace('_', ' ')}</Badge>
                          <Badge variant="outline">{activity.duration_hours}h</Badge>
                          <Badge variant="outline">{activity.cme_credits} credits</Badge>
                          {activity.specialty && (
                            <Badge variant="outline">{activity.specialty}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(activity.registration_fee)}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.activity_date && formatDate(activity.activity_date)}
                        </p>
                      </div>
                      <Badge variant={activity.is_active ? "default" : "secondary"}>
                        {activity.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registrations Tab */}
        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CME Registrations</CardTitle>
              <CardDescription>Your registered activities and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cmeRegistrations.map((registration) => (
                  <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-4 w-4" />
                      <div>
                        <h3 className="font-semibold">{registration.registration_id}</h3>
                        <p className="text-sm text-muted-foreground">
                          Registered {formatDate(registration.registration_date)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={getStatusColor(registration.registration_status)}>
                            {registration.registration_status}
                          </Badge>
                          <Badge variant={getStatusColor(registration.payment_status)}>
                            {registration.payment_status}
                          </Badge>
                          {registration.certificate_issued && (
                            <Badge variant="default">
                              <Award className="h-3 w-3 mr-1" />
                              Certificate
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        {registration.payment_amount && (
                          <p className="font-semibold">{formatCurrency(registration.payment_amount)}</p>
                        )}
                        {registration.evaluation_score && (
                          <p className="text-sm text-muted-foreground">
                            Score: {registration.evaluation_score}/5.0
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CME Credits</CardTitle>
              <CardDescription>Earned credits and verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cmeCredits.map((credit) => (
                  <div key={credit.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getCreditTypeIcon(credit.credit_type)}
                      <div>
                        <h3 className="font-semibold">{credit.credit_id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {credit.credit_type.replace(/_/g, ' ')} • Earned {formatDate(credit.credit_date)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{credit.credit_year}</Badge>
                          <Badge variant={getStatusColor(credit.credit_status)}>
                            {credit.credit_status}
                          </Badge>
                          {credit.is_transferable && (
                            <Badge variant="outline">Transferable</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {credit.credit_amount} credits
                        </div>
                        {credit.verification_code && (
                          <p className="text-sm text-muted-foreground">
                            Code: {credit.verification_code}
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CME Requirements</CardTitle>
              <CardDescription>Annual requirements and compliance tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cmeRequirements.map((requirement) => (
                  <div key={requirement.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{requirement.requirement_year} Requirements</h3>
                        <p className="text-sm text-muted-foreground">
                          {requirement.requirement_type.replace('_', ' ')} • Due {requirement.due_date && formatDate(requirement.due_date)}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(requirement.requirement_status)}>
                        {requirement.requirement_status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Total Credits</span>
                        <span>{requirement.credits_earned} / {requirement.total_credits_required}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(requirement.credits_earned / requirement.total_credits_required) * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Category 1</span>
                            <span>{requirement.category_1_credits_required}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Category 2</span>
                            <span>{requirement.category_2_credits_required}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Specialty</span>
                            <span>{requirement.specialty_credits_required}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Ethics</span>
                            <span>{requirement.ethics_credits_required}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Analytics</CardTitle>
              <CardDescription>Performance metrics and learning insights</CardDescription>
            </CardHeader>
            <CardContent>
              {cmeLearningAnalytics.length > 0 && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {cmeLearningAnalytics[0].total_activities_completed}
                      </div>
                      <p className="text-sm text-muted-foreground">Activities Completed</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {cmeLearningAnalytics[0].total_credits_earned}
                      </div>
                      <p className="text-sm text-muted-foreground">Credits Earned</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatPercentage(cmeLearningAnalytics[0].learning_effectiveness_score || 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Learning Effectiveness</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatPercentage(cmeLearningAnalytics[0].engagement_score || 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Engagement Score</p>
                    </div>
                  </div>

                  {/* Learning Preferences */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Learning Preferences</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Preferred Activity Types</h4>
                        <div className="space-y-1">
                          {cmeLearningAnalytics[0].preferred_activity_types?.map((type, index) => (
                            <Badge key={index} variant="outline" className="mr-1">
                              {type.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Preferred Formats</h4>
                        <div className="space-y-1">
                          {cmeLearningAnalytics[0].preferred_activity_formats?.map((format, index) => (
                            <Badge key={index} variant="outline" className="mr-1">
                              {format.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Specialties</h4>
                        <div className="space-y-1">
                          {cmeLearningAnalytics[0].preferred_specialties?.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="mr-1">
                              {specialty.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ROI Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">ROI Analysis</h3>
                    <div className="p-4 border rounded-lg">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(cmeLearningAnalytics[0].roi_analysis?.total_investment || 0)}
                          </div>
                          <p className="text-sm text-muted-foreground">Total Investment</p>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {cmeLearningAnalytics[0].roi_analysis?.credits_earned || 0}
                          </div>
                          <p className="text-sm text-muted-foreground">Credits Earned</p>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600">
                            {formatCurrency(cmeLearningAnalytics[0].roi_analysis?.cost_per_credit || 0)}
                          </div>
                          <p className="text-sm text-muted-foreground">Cost per Credit</p>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-600">
                            {formatPercentage(cmeLearningAnalytics[0].roi_analysis?.roi_percentage || 0)}
                          </div>
                          <p className="text-sm text-muted-foreground">ROI</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
