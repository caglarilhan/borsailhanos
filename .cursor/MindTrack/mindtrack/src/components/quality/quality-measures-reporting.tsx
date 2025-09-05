'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Users,
  Activity,
  PieChart,
  Zap,
  Globe,
  Building,
  Receipt,
  Wallet,
  Database,
  Code,
  Settings,
  BookOpen,
  Star,
  Lightbulb,
  Bell,
  Info,
  Key,
  Fingerprint,
  Smartphone,
  Mail,
  Phone,
  Calendar,
  FileText,
  AlertCircle,
  UserCheck,
  UserX,
  LogIn,
  LogOut,
  RefreshCw,
  Monitor,
  Server,
  HardDrive,
  Network,
  Wifi,
  WifiOff,
  ClipboardList,
  ChartBar,
  TrendingDown,
  Minus,
  Clock,
  DollarSign,
  Percent,
  Calculator,
  LineChart,
  PieChart as PieChartIcon,
  BarChart,
  ScatterChart
} from 'lucide-react';

// Interfaces
interface QualityMeasure {
  id: string;
  measure_id: string;
  measure_name: string;
  measure_description?: string;
  measure_category_id: string;
  measure_type: string;
  measure_domain?: string;
  numerator_description?: string;
  denominator_description?: string;
  exclusion_description?: string;
  measure_version?: string;
  reporting_year: number;
  cpt_codes?: string[];
  icd10_codes?: string[];
  age_range_min?: number;
  age_range_max?: number;
  gender_restriction?: string;
  specialty_restriction?: string[];
  is_active: boolean;
}

interface PatientQualityMeasure {
  id: string;
  patient_id: string;
  measure_id: string;
  practitioner_id: string;
  measurement_period_start: string;
  measurement_period_end: string;
  numerator_value: number;
  denominator_value: number;
  exclusion_value: number;
  performance_rate?: number;
  meets_criteria: boolean;
  measurement_date: string;
  measurement_notes?: string;
  data_source?: string;
  validation_status: string;
}

interface QualityMeasureReporting {
  id: string;
  reporting_period_id: string;
  practitioner_id: string;
  reporting_year: number;
  reporting_period_start: string;
  reporting_period_end: string;
  reporting_status: string;
  submission_date?: string;
  acceptance_date?: string;
  rejection_reason?: string;
  total_measures: number;
  completed_measures: number;
  overall_score?: number;
  category_scores?: any;
  performance_improvement_score?: number;
  cost_score?: number;
  promoting_interoperability_score?: number;
  quality_score?: number;
  final_score?: number;
  payment_adjustment?: number;
}

interface OutcomeTracking {
  id: string;
  patient_id: string;
  practitioner_id: string;
  outcome_type: string;
  outcome_measure: string;
  baseline_value?: number;
  baseline_date?: string;
  target_value?: number;
  target_date?: string;
  current_value?: number;
  current_date?: string;
  improvement_percentage?: number;
  goal_achieved: boolean;
  measurement_frequency?: string;
  last_measurement_date?: string;
  next_measurement_date?: string;
  measurement_notes?: string;
}

interface PerformanceAnalytics {
  id: string;
  analysis_date: string;
  analysis_period_months: number;
  practitioner_id?: string;
  total_patients: number;
  total_encounters: number;
  quality_measures_performance?: any;
  hedis_performance?: any;
  cms_performance?: any;
  patient_satisfaction_score?: number;
  readmission_rate?: number;
  length_of_stay_avg?: number;
  cost_per_patient?: number;
  efficiency_score?: number;
  outcome_measures?: any;
  benchmark_comparison?: any;
  trend_analysis?: any;
}

export function QualityMeasuresReporting() {
  const [activeTab, setActiveTab] = useState('overview');
  const [qualityMeasures, setQualityMeasures] = useState<QualityMeasure[]>([]);
  const [patientQualityMeasures, setPatientQualityMeasures] = useState<PatientQualityMeasure[]>([]);
  const [qualityMeasureReporting, setQualityMeasureReporting] = useState<QualityMeasureReporting[]>([]);
  const [outcomeTracking, setOutcomeTracking] = useState<OutcomeTracking[]>([]);
  const [performanceAnalytics, setPerformanceAnalytics] = useState<PerformanceAnalytics[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    setQualityMeasures([
      {
        id: '1',
        measure_id: 'MIPS-001',
        measure_name: 'Depression Screening and Follow-up',
        measure_description: 'Percentage of patients 12 years and older screened for depression',
        measure_category_id: 'cat-1',
        measure_type: 'process',
        measure_domain: 'mental_health',
        numerator_description: 'Patients screened for depression',
        denominator_description: 'All patients 12 years and older',
        exclusion_description: 'Patients with existing depression diagnosis',
        measure_version: 'v1.0',
        reporting_year: 2024,
        cpt_codes: ['99213', '99214', '99215'],
        icd10_codes: ['F32.9', 'F33.9'],
        age_range_min: 12,
        age_range_max: 120,
        gender_restriction: 'all',
        specialty_restriction: ['psychiatry', 'primary_care'],
        is_active: true
      },
      {
        id: '2',
        measure_id: 'MIPS-002',
        measure_name: 'Suicide Risk Assessment',
        measure_description: 'Percentage of patients with depression who received suicide risk assessment',
        measure_category_id: 'cat-1',
        measure_type: 'process',
        measure_domain: 'mental_health',
        numerator_description: 'Patients with depression who received suicide risk assessment',
        denominator_description: 'All patients with depression diagnosis',
        exclusion_description: 'Patients with documented contraindications',
        measure_version: 'v1.0',
        reporting_year: 2024,
        cpt_codes: ['99213', '99214', '99215'],
        icd10_codes: ['F32.9', 'F33.9'],
        age_range_min: 12,
        age_range_max: 120,
        gender_restriction: 'all',
        specialty_restriction: ['psychiatry'],
        is_active: true
      }
    ]);

    setPatientQualityMeasures([
      {
        id: '1',
        patient_id: 'patient-1',
        measure_id: 'measure-1',
        practitioner_id: 'practitioner-1',
        measurement_period_start: '2024-01-01',
        measurement_period_end: '2024-12-31',
        numerator_value: 85,
        denominator_value: 100,
        exclusion_value: 5,
        performance_rate: 85.0,
        meets_criteria: true,
        measurement_date: '2024-01-15',
        measurement_notes: 'Patient completed PHQ-9 screening',
        data_source: 'ehr',
        validation_status: 'validated'
      },
      {
        id: '2',
        patient_id: 'patient-2',
        measure_id: 'measure-2',
        practitioner_id: 'practitioner-1',
        measurement_period_start: '2024-01-01',
        measurement_period_end: '2024-12-31',
        numerator_value: 92,
        denominator_value: 100,
        exclusion_value: 3,
        performance_rate: 92.0,
        meets_criteria: true,
        measurement_date: '2024-01-20',
        measurement_notes: 'Suicide risk assessment completed',
        data_source: 'ehr',
        validation_status: 'validated'
      }
    ]);

    setQualityMeasureReporting([
      {
        id: '1',
        reporting_period_id: 'MIPS-2024-Q1',
        practitioner_id: 'practitioner-1',
        reporting_year: 2024,
        reporting_period_start: '2024-01-01',
        reporting_period_end: '2024-03-31',
        reporting_status: 'submitted',
        submission_date: '2024-04-15',
        acceptance_date: '2024-04-20',
        total_measures: 6,
        completed_measures: 6,
        overall_score: 88.5,
        category_scores: {
          'quality': 90.0,
          'cost': 85.0,
          'promoting_interoperability': 90.0,
          'improvement_activities': 88.0
        },
        performance_improvement_score: 88.0,
        cost_score: 85.0,
        promoting_interoperability_score: 90.0,
        quality_score: 90.0,
        final_score: 88.5,
        payment_adjustment: 2.5
      }
    ]);

    setOutcomeTracking([
      {
        id: '1',
        patient_id: 'patient-1',
        practitioner_id: 'practitioner-1',
        outcome_type: 'clinical',
        outcome_measure: 'PHQ-9',
        baseline_value: 15,
        baseline_date: '2024-01-01',
        target_value: 5,
        target_date: '2024-06-01',
        current_value: 8,
        current_date: '2024-03-15',
        improvement_percentage: 46.7,
        goal_achieved: false,
        measurement_frequency: 'monthly',
        last_measurement_date: '2024-03-15',
        next_measurement_date: '2024-04-15',
        measurement_notes: 'Significant improvement noted'
      },
      {
        id: '2',
        patient_id: 'patient-2',
        practitioner_id: 'practitioner-1',
        outcome_type: 'functional',
        outcome_measure: 'GAD-7',
        baseline_value: 12,
        baseline_date: '2024-01-01',
        target_value: 4,
        target_date: '2024-06-01',
        current_value: 3,
        current_date: '2024-03-20',
        improvement_percentage: 75.0,
        goal_achieved: true,
        measurement_frequency: 'monthly',
        last_measurement_date: '2024-03-20',
        next_measurement_date: '2024-04-20',
        measurement_notes: 'Goal achieved ahead of schedule'
      }
    ]);

    setPerformanceAnalytics([
      {
        id: '1',
        analysis_date: '2024-03-31',
        analysis_period_months: 12,
        practitioner_id: 'practitioner-1',
        total_patients: 150,
        total_encounters: 450,
        quality_measures_performance: {
          'depression_screening': 85.0,
          'suicide_risk_assessment': 92.0,
          'medication_adherence': 78.0
        },
        hedis_performance: {
          'mental_health_screening': 88.0,
          'follow_up_care': 82.0
        },
        cms_performance: {
          'mips_score': 88.5,
          'payment_adjustment': 2.5
        },
        patient_satisfaction_score: 4.2,
        readmission_rate: 8.5,
        length_of_stay_avg: 45.2,
        cost_per_patient: 2500.0,
        efficiency_score: 85.0,
        outcome_measures: {
          'phq9_improvement': 46.7,
          'gad7_improvement': 75.0
        },
        benchmark_comparison: {
          'national_average': 75.0,
          'state_average': 78.0,
          'peer_average': 82.0,
          'practice_performance': 88.5
        },
        trend_analysis: {
          'performance_trend': 'improving',
          'trend_percentage': 5.2,
          'monthly_variation': 2.1
        }
      }
    ]);
  }, []);

  const getMeasureTypeColor = (type: string) => {
    switch (type) {
      case 'process': return 'default';
      case 'outcome': return 'secondary';
      case 'structure': return 'outline';
      case 'patient_experience': return 'default';
      case 'efficiency': return 'secondary';
      default: return 'default';
    }
  };

  const getReportingStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'submitted': return 'default';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'under_review': return 'secondary';
      default: return 'default';
    }
  };

  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'validated': return 'default';
      case 'rejected': return 'destructive';
      case 'needs_review': return 'secondary';
      default: return 'default';
    }
  };

  const getOutcomeTypeColor = (type: string) => {
    switch (type) {
      case 'clinical': return 'default';
      case 'functional': return 'secondary';
      case 'quality_of_life': return 'outline';
      case 'satisfaction': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quality Measures & Reporting</h2>
          <p className="text-muted-foreground">
            Comprehensive quality reporting, MIPS, HEDIS, and performance analytics
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Quality Measure
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="measures">Quality Measures</TabsTrigger>
          <TabsTrigger value="patient-measures">Patient Measures</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
          <TabsTrigger value="outcomes">Outcome Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="hedis">HEDIS</TabsTrigger>
          <TabsTrigger value="cms">CMS Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Measures</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{qualityMeasures.length}</div>
                <p className="text-xs text-muted-foreground">
                  {qualityMeasures.filter(m => m.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patient Measures</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patientQualityMeasures.length}</div>
                <p className="text-xs text-muted-foreground">
                  {patientQualityMeasures.filter(m => m.meets_criteria).length} meeting criteria
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {qualityMeasureReporting.length > 0 ? qualityMeasureReporting[0].overall_score : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  MIPS performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outcome Goals</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {outcomeTracking.length > 0 ? Math.round((outcomeTracking.filter(o => o.goal_achieved).length / outcomeTracking.length) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Goal achievement rate
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Quality Measures</CardTitle>
                <CardDescription>Latest quality measure performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {qualityMeasures.slice(0, 3).map((measure) => (
                  <div key={measure.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{measure.measure_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {measure.measure_type} - {measure.measure_domain}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getMeasureTypeColor(measure.measure_type)}>
                        {measure.measure_type}
                      </Badge>
                      <Badge variant={measure.is_active ? 'default' : 'secondary'}>
                        {measure.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Quality performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <LineChart className="h-8 w-8" />
                  <span className="ml-2">Performance trends chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="measures" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Quality Measures</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Measure
            </Button>
          </div>

          <div className="grid gap-4">
            {qualityMeasures.map((measure) => (
              <Card key={measure.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{measure.measure_name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getMeasureTypeColor(measure.measure_type)}>
                        {measure.measure_type}
                      </Badge>
                      <Badge variant="outline">{measure.measure_id}</Badge>
                      <Badge variant={measure.is_active ? 'default' : 'secondary'}>
                        {measure.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{measure.measure_description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Domain</p>
                        <p className="text-sm text-muted-foreground">{measure.measure_domain}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Reporting Year</p>
                        <p className="text-sm text-muted-foreground">{measure.reporting_year}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Age Range</p>
                        <p className="text-sm text-muted-foreground">
                          {measure.age_range_min}-{measure.age_range_max} years
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Gender</p>
                        <p className="text-sm text-muted-foreground">{measure.gender_restriction}</p>
                      </div>
                    </div>
                    {measure.numerator_description && (
                      <div>
                        <p className="text-sm font-medium">Numerator</p>
                        <p className="text-sm text-muted-foreground">{measure.numerator_description}</p>
                      </div>
                    )}
                    {measure.denominator_description && (
                      <div>
                        <p className="text-sm font-medium">Denominator</p>
                        <p className="text-sm text-muted-foreground">{measure.denominator_description}</p>
                      </div>
                    )}
                    {measure.cpt_codes && measure.cpt_codes.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">CPT Codes</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {measure.cpt_codes.map((code, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {code}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patient-measures" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Patient Quality Measures</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {patientQualityMeasures.map((measure) => (
              <Card key={measure.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Patient {measure.patient_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getValidationStatusColor(measure.validation_status)}>
                        {measure.validation_status}
                      </Badge>
                      <Badge variant={measure.meets_criteria ? 'default' : 'secondary'}>
                        {measure.meets_criteria ? 'Meets Criteria' : 'Does Not Meet'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Measure {measure.measure_id} - {new Date(measure.measurement_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Numerator</p>
                        <p className="text-sm text-muted-foreground">{measure.numerator_value}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Denominator</p>
                        <p className="text-sm text-muted-foreground">{measure.denominator_value}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Exclusions</p>
                        <p className="text-sm text-muted-foreground">{measure.exclusion_value}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Performance Rate</p>
                        <p className="text-sm text-muted-foreground">{measure.performance_rate}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Data Source</p>
                        <p className="text-sm text-muted-foreground">{measure.data_source || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Period</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(measure.measurement_period_start).toLocaleDateString()} - {new Date(measure.measurement_period_end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {measure.measurement_notes && (
                      <div>
                        <p className="text-sm font-medium">Notes</p>
                        <p className="text-sm text-muted-foreground">{measure.measurement_notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Quality Measure Reporting</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </div>

          <div className="grid gap-4">
            {qualityMeasureReporting.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.reporting_period_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getReportingStatusColor(report.reporting_status)}>
                        {report.reporting_status}
                      </Badge>
                      <Badge variant="outline">{report.reporting_year}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {new Date(report.reporting_period_start).toLocaleDateString()} - {new Date(report.reporting_period_end).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Overall Score</p>
                        <p className="text-sm text-muted-foreground">{report.overall_score}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Payment Adjustment</p>
                        <p className="text-sm text-muted-foreground">{report.payment_adjustment}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Completed Measures</p>
                        <p className="text-sm text-muted-foreground">{report.completed_measures}/{report.total_measures}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Quality Score</p>
                        <p className="text-sm text-muted-foreground">{report.quality_score}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Cost Score</p>
                        <p className="text-sm text-muted-foreground">{report.cost_score}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">PI Score</p>
                        <p className="text-sm text-muted-foreground">{report.promoting_interoperability_score}%</p>
                      </div>
                    </div>
                    {report.submission_date && (
                      <div>
                        <p className="text-sm font-medium">Submission Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.submission_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {report.rejection_reason && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Rejection Reason: {report.rejection_reason}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Outcome Tracking</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Outcome
            </Button>
          </div>

          <div className="grid gap-4">
            {outcomeTracking.map((outcome) => (
              <Card key={outcome.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{outcome.outcome_measure}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getOutcomeTypeColor(outcome.outcome_type)}>
                        {outcome.outcome_type}
                      </Badge>
                      <Badge variant={outcome.goal_achieved ? 'default' : 'secondary'}>
                        {outcome.goal_achieved ? 'Goal Achieved' : 'In Progress'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Patient {outcome.patient_id} - {outcome.outcome_measure}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Baseline Value</p>
                        <p className="text-sm text-muted-foreground">{outcome.baseline_value || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Current Value</p>
                        <p className="text-sm text-muted-foreground">{outcome.current_value || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Target Value</p>
                        <p className="text-sm text-muted-foreground">{outcome.target_value || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Improvement</p>
                        <p className="text-sm text-muted-foreground">{outcome.improvement_percentage || 0}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Baseline Date</p>
                        <p className="text-sm text-muted-foreground">
                          {outcome.baseline_date ? new Date(outcome.baseline_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Current Date</p>
                        <p className="text-sm text-muted-foreground">
                          {outcome.current_date ? new Date(outcome.current_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {outcome.measurement_notes && (
                      <div>
                        <p className="text-sm font-medium">Notes</p>
                        <p className="text-sm text-muted-foreground">{outcome.measurement_notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Quality performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8" />
                  <span className="ml-2">Performance analytics chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benchmark Comparison</CardTitle>
                <CardDescription>Compare performance against benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8" />
                  <span className="ml-2">Benchmark comparison chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hedis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>HEDIS Measures</CardTitle>
                <CardDescription>Healthcare Effectiveness Data and Information Set</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <ClipboardList className="h-8 w-8" />
                  <span className="ml-2">HEDIS measures will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>HEDIS Reporting</CardTitle>
                <CardDescription>HEDIS performance reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <ChartBar className="h-8 w-8" />
                  <span className="ml-2">HEDIS reporting will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>CMS Quality Reporting</CardTitle>
                <CardDescription>Centers for Medicare & Medicaid Services reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Building className="h-8 w-8" />
                  <span className="ml-2">CMS reporting will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>MIPS Reporting</CardTitle>
                <CardDescription>Merit-based Incentive Payment System</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Award className="h-8 w-8" />
                  <span className="ml-2">MIPS reporting will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
