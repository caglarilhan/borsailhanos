'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Activity, 
  Stethoscope, 
  ClipboardList, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Users,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Globe,
  Building,
  Receipt,
  Wallet,
  Shield,
  Database,
  Code,
  Settings,
  BookOpen,
  Award,
  Star,
  Lightbulb,
  Bell,
  AlertTriangle,
  Info
} from 'lucide-react';

// Interfaces
interface FHIREncounter {
  id: string;
  encounter_id: string;
  patient_id: string;
  practitioner_id: string;
  encounter_class: string;
  encounter_type: string;
  status: string;
  priority?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  location?: string;
  service_type?: string;
  diagnosis_codes?: string[];
  procedure_codes?: string[];
  chief_complaint?: string;
  history_of_present_illness?: string;
  mental_status_exam?: string;
  assessment_and_plan?: string;
  treatment_goals?: string;
  follow_up_instructions?: string;
}

interface ClinicalObservation {
  id: string;
  observation_id: string;
  patient_id: string;
  practitioner_id: string;
  encounter_id?: string;
  observation_type: string;
  observation_category: string;
  observation_code: string;
  observation_value: string;
  observation_unit?: string;
  reference_range?: string;
  interpretation?: string;
  effective_date: string;
  status: string;
}

interface DiagnosticReport {
  id: string;
  report_id: string;
  patient_id: string;
  practitioner_id: string;
  encounter_id?: string;
  report_type: string;
  report_category: string;
  report_status: string;
  report_date: string;
  effective_date?: string;
  conclusion?: string;
  interpretation?: string;
  findings?: string;
  recommendations?: string;
  diagnosis_codes?: string[];
  procedure_codes?: string[];
}

interface QualityMeasure {
  id: string;
  measure_id: string;
  measure_name: string;
  measure_description?: string;
  measure_category: string;
  measure_type: string;
  measure_domain?: string;
  numerator_description?: string;
  denominator_description?: string;
  exclusion_description?: string;
  measure_version?: string;
  reporting_year: number;
  is_active: boolean;
}

interface ClinicalDecisionSupportAlert {
  id: string;
  alert_id: string;
  patient_id: string;
  practitioner_id: string;
  encounter_id?: string;
  rule_id: string;
  alert_type: string;
  alert_severity: string;
  alert_title: string;
  alert_message: string;
  alert_recommendation?: string;
  alert_status: string;
  alert_acknowledged_by?: string;
  alert_acknowledged_at?: string;
  alert_dismissed_by?: string;
  alert_dismissed_at?: string;
  alert_dismissal_reason?: string;
  alert_context?: any;
}

export function ElectronicHealthRecordsIntegration() {
  const [activeTab, setActiveTab] = useState('overview');
  const [encounters, setEncounters] = useState<FHIREncounter[]>([]);
  const [observations, setObservations] = useState<ClinicalObservation[]>([]);
  const [diagnosticReports, setDiagnosticReports] = useState<DiagnosticReport[]>([]);
  const [qualityMeasures, setQualityMeasures] = useState<QualityMeasure[]>([]);
  const [clinicalAlerts, setClinicalAlerts] = useState<ClinicalDecisionSupportAlert[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    setEncounters([
      {
        id: '1',
        encounter_id: 'ENC-20240125-001',
        patient_id: 'patient-1',
        practitioner_id: 'provider-1',
        encounter_class: 'AMB',
        encounter_type: 'psychiatric_evaluation',
        status: 'finished',
        priority: 'routine',
        start_time: '2024-01-25T14:00:00Z',
        end_time: '2024-01-25T15:00:00Z',
        duration_minutes: 60,
        location: 'Office',
        service_type: 'Outpatient',
        diagnosis_codes: ['F32.9'],
        procedure_codes: ['99213'],
        chief_complaint: 'Depressed mood and anxiety',
        history_of_present_illness: 'Patient reports 6-month history of depressed mood, anhedonia, and anxiety',
        mental_status_exam: 'Alert and oriented x3. Mood depressed, affect constricted. No suicidal ideation.',
        assessment_and_plan: 'Major depressive disorder, single episode, moderate. Start sertraline 50mg daily.',
        treatment_goals: 'Improve mood, reduce anxiety, increase energy',
        follow_up_instructions: 'Follow up in 2 weeks to assess medication response'
      }
    ]);

    setObservations([
      {
        id: '1',
        observation_id: 'OBS-20240125-001',
        patient_id: 'patient-1',
        practitioner_id: 'provider-1',
        encounter_id: '1',
        observation_type: 'mental_status',
        observation_category: 'survey',
        observation_code: '33747-0',
        observation_value: 'Depressed mood, constricted affect',
        observation_unit: 'text',
        interpretation: 'abnormal',
        effective_date: '2024-01-25T14:30:00Z',
        status: 'final'
      },
      {
        id: '2',
        observation_id: 'OBS-20240125-002',
        patient_id: 'patient-1',
        practitioner_id: 'provider-1',
        encounter_id: '1',
        observation_type: 'vital_signs',
        observation_category: 'vital-signs',
        observation_code: '8310-5',
        observation_value: '98.6',
        observation_unit: '°F',
        reference_range: '97.0-99.0°F',
        interpretation: 'normal',
        effective_date: '2024-01-25T14:00:00Z',
        status: 'final'
      }
    ]);

    setDiagnosticReports([
      {
        id: '1',
        report_id: 'RPT-20240125-001',
        patient_id: 'patient-1',
        practitioner_id: 'provider-1',
        encounter_id: '1',
        report_type: 'psychiatric_evaluation',
        report_category: 'diagnostic',
        report_status: 'final',
        report_date: '2024-01-25T15:00:00Z',
        effective_date: '2024-01-25T15:00:00Z',
        conclusion: 'Major depressive disorder, single episode, moderate severity',
        interpretation: 'Patient meets DSM-5 criteria for major depressive disorder',
        findings: 'Depressed mood, anhedonia, fatigue, concentration difficulties',
        recommendations: 'Start antidepressant medication, psychotherapy, lifestyle modifications',
        diagnosis_codes: ['F32.9'],
        procedure_codes: ['99213']
      }
    ]);

    setQualityMeasures([
      {
        id: '1',
        measure_id: 'CMS-134',
        measure_name: 'Diabetes: Medical Attention for Nephropathy',
        measure_description: 'Percentage of patients 18-75 years of age with diabetes who had a nephropathy screening test or evidence of nephropathy',
        measure_category: 'quality',
        measure_type: 'process',
        measure_domain: 'chronic_care',
        numerator_description: 'Patients with diabetes who had a nephropathy screening test or evidence of nephropathy',
        denominator_description: 'Patients 18-75 years of age with diabetes',
        exclusion_description: 'Patients with end-stage renal disease',
        measure_version: 'v8.0',
        reporting_year: 2024,
        is_active: true
      },
      {
        id: '2',
        measure_id: 'CMS-165',
        measure_name: 'Controlling Blood Pressure',
        measure_description: 'Percentage of patients 18-85 years of age who had a diagnosis of hypertension and whose blood pressure was adequately controlled',
        measure_category: 'quality',
        measure_type: 'outcome',
        measure_domain: 'chronic_care',
        numerator_description: 'Patients with hypertension whose blood pressure was adequately controlled',
        denominator_description: 'Patients 18-85 years of age with hypertension',
        exclusion_description: 'Patients with end-stage renal disease',
        measure_version: 'v8.0',
        reporting_year: 2024,
        is_active: true
      }
    ]);

    setClinicalAlerts([
      {
        id: '1',
        alert_id: 'ALERT-20240125-001',
        patient_id: 'patient-1',
        practitioner_id: 'provider-1',
        encounter_id: '1',
        rule_id: 'rule-1',
        alert_type: 'drug_interaction',
        alert_severity: 'high',
        alert_title: 'Drug Interaction Alert',
        alert_message: 'Sertraline may interact with warfarin, increasing bleeding risk',
        alert_recommendation: 'Monitor INR closely and consider dose adjustment',
        alert_status: 'active',
        alert_context: {
          medication1: 'Sertraline',
          medication2: 'Warfarin',
          interaction_type: 'pharmacokinetic'
        }
      },
      {
        id: '2',
        alert_id: 'ALERT-20240125-002',
        patient_id: 'patient-1',
        practitioner_id: 'provider-1',
        encounter_id: '1',
        rule_id: 'rule-2',
        alert_type: 'allergy',
        alert_severity: 'critical',
        alert_title: 'Allergy Alert',
        alert_message: 'Patient has documented allergy to penicillin',
        alert_recommendation: 'Avoid penicillin and related antibiotics',
        alert_status: 'acknowledged',
        alert_acknowledged_by: 'provider-1',
        alert_acknowledged_at: '2024-01-25T14:15:00Z'
      }
    ]);
  }, []);

  const getEncounterStatusColor = (status: string) => {
    switch (status) {
      case 'finished': return 'default';
      case 'in-progress': return 'secondary';
      case 'planned': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'onleave': return 'secondary';
      default: return 'default';
    }
  };

  const getEncounterClassColor = (encounterClass: string) => {
    switch (encounterClass) {
      case 'AMB': return 'default';
      case 'EMER': return 'destructive';
      case 'IMP': return 'secondary';
      case 'ACUTE': return 'destructive';
      case 'NONAC': return 'secondary';
      default: return 'default';
    }
  };

  const getObservationTypeColor = (type: string) => {
    switch (type) {
      case 'vital_signs': return 'default';
      case 'mental_status': return 'secondary';
      case 'mood': return 'secondary';
      case 'anxiety': return 'secondary';
      case 'sleep': return 'secondary';
      default: return 'default';
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'final': return 'default';
      case 'preliminary': return 'secondary';
      case 'amended': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'destructive';
      case 'acknowledged': return 'secondary';
      case 'dismissed': return 'default';
      case 'resolved': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Electronic Health Records (EHR) Integration</h2>
          <p className="text-muted-foreground">
            Comprehensive EHR management with HL7 FHIR integration and clinical decision support
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Encounter
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="encounters">FHIR Encounters</TabsTrigger>
          <TabsTrigger value="observations">Clinical Observations</TabsTrigger>
          <TabsTrigger value="reports">Diagnostic Reports</TabsTrigger>
          <TabsTrigger value="quality">Quality Measures</TabsTrigger>
          <TabsTrigger value="alerts">Clinical Alerts</TabsTrigger>
          <TabsTrigger value="interoperability">Interoperability</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">FHIR Encounters</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{encounters.length}</div>
                <p className="text-xs text-muted-foreground">
                  {encounters.filter(e => e.status === 'finished').length} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clinical Observations</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{observations.length}</div>
                <p className="text-xs text-muted-foreground">
                  {observations.filter(o => o.status === 'final').length} final
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Diagnostic Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{diagnosticReports.length}</div>
                <p className="text-xs text-muted-foreground">
                  {diagnosticReports.filter(r => r.report_status === 'final').length} final
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clinical Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clinicalAlerts.length}</div>
                <p className="text-xs text-muted-foreground">
                  {clinicalAlerts.filter(a => a.alert_status === 'active').length} active
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Encounters</CardTitle>
                <CardDescription>Latest FHIR encounters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {encounters.slice(0, 3).map((encounter) => (
                  <div key={encounter.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{encounter.encounter_id}</p>
                      <p className="text-xs text-muted-foreground">{encounter.encounter_type}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getEncounterClassColor(encounter.encounter_class)}>
                        {encounter.encounter_class}
                      </Badge>
                      <Badge variant={getEncounterStatusColor(encounter.status)}>
                        {encounter.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Measures Performance</CardTitle>
                <CardDescription>MIPS quality measures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {qualityMeasures.slice(0, 3).map((measure) => (
                  <div key={measure.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{measure.measure_id}</p>
                      <p className="text-xs text-muted-foreground">{measure.measure_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">85%</p>
                      <p className="text-xs text-muted-foreground">Performance</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="encounters" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">FHIR Encounters</h3>
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
            {encounters.map((encounter) => (
              <Card key={encounter.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{encounter.encounter_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getEncounterClassColor(encounter.encounter_class)}>
                        {encounter.encounter_class}
                      </Badge>
                      <Badge variant={getEncounterStatusColor(encounter.status)}>
                        {encounter.status}
                      </Badge>
                      {encounter.priority && (
                        <Badge variant="outline">{encounter.priority}</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Patient {encounter.patient_id} - {encounter.encounter_type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Start Time</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(encounter.start_time).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">
                          {encounter.duration_minutes ? `${encounter.duration_minutes} min` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{encounter.location || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Service Type</p>
                        <p className="text-sm text-muted-foreground">{encounter.service_type || 'N/A'}</p>
                      </div>
                    </div>
                    {encounter.chief_complaint && (
                      <div>
                        <p className="text-sm font-medium">Chief Complaint</p>
                        <p className="text-sm text-muted-foreground">{encounter.chief_complaint}</p>
                      </div>
                    )}
                    {encounter.diagnosis_codes && encounter.diagnosis_codes.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Diagnosis Codes</p>
                        <p className="text-sm text-muted-foreground">{encounter.diagnosis_codes.join(', ')}</p>
                      </div>
                    )}
                    {encounter.procedure_codes && encounter.procedure_codes.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Procedure Codes</p>
                        <p className="text-sm text-muted-foreground">{encounter.procedure_codes.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="observations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Clinical Observations</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Observation
            </Button>
          </div>

          <div className="grid gap-4">
            {observations.map((observation) => (
              <Card key={observation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{observation.observation_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getObservationTypeColor(observation.observation_type)}>
                        {observation.observation_type}
                      </Badge>
                      <Badge variant="outline">{observation.observation_category}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Patient {observation.patient_id} - {observation.observation_code}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Observation Value</p>
                        <p className="text-sm text-muted-foreground">
                          {observation.observation_value} {observation.observation_unit || ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Interpretation</p>
                        <p className="text-sm text-muted-foreground">{observation.interpretation || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Reference Range</p>
                        <p className="text-sm text-muted-foreground">{observation.reference_range || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Effective Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(observation.effective_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Diagnostic Reports</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          </div>

          <div className="grid gap-4">
            {diagnosticReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{report.report_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getReportStatusColor(report.report_status)}>
                        {report.report_status}
                      </Badge>
                      <Badge variant="outline">{report.report_category}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {report.report_type} - {new Date(report.report_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.conclusion && (
                      <div>
                        <p className="text-sm font-medium">Conclusion</p>
                        <p className="text-sm text-muted-foreground">{report.conclusion}</p>
                      </div>
                    )}
                    {report.interpretation && (
                      <div>
                        <p className="text-sm font-medium">Interpretation</p>
                        <p className="text-sm text-muted-foreground">{report.interpretation}</p>
                      </div>
                    )}
                    {report.findings && (
                      <div>
                        <p className="text-sm font-medium">Findings</p>
                        <p className="text-sm text-muted-foreground">{report.findings}</p>
                      </div>
                    )}
                    {report.recommendations && (
                      <div>
                        <p className="text-sm font-medium">Recommendations</p>
                        <p className="text-sm text-muted-foreground">{report.recommendations}</p>
                      </div>
                    )}
                    {report.diagnosis_codes && report.diagnosis_codes.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Diagnosis Codes</p>
                        <p className="text-sm text-muted-foreground">{report.diagnosis_codes.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Quality Measures (MIPS)</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Measure
            </Button>
          </div>

          <div className="grid gap-4">
            {qualityMeasures.map((measure) => (
              <Card key={measure.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{measure.measure_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="default">{measure.measure_category}</Badge>
                      <Badge variant="outline">{measure.measure_type}</Badge>
                      <Badge variant={measure.is_active ? 'default' : 'secondary'}>
                        {measure.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {measure.measure_name} - {measure.reporting_year}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">{measure.measure_description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Domain</p>
                        <p className="text-sm text-muted-foreground">{measure.measure_domain || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Version</p>
                        <p className="text-sm text-muted-foreground">{measure.measure_version || 'N/A'}</p>
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Clinical Decision Support Alerts</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          </div>

          <div className="grid gap-4">
            {clinicalAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{alert.alert_title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getAlertSeverityColor(alert.alert_severity)}>
                        {alert.alert_severity}
                      </Badge>
                      <Badge variant={getAlertStatusColor(alert.alert_status)}>
                        {alert.alert_status}
                      </Badge>
                      <Badge variant="outline">{alert.alert_type}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Patient {alert.patient_id} - Rule {alert.rule_id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Alert Message</p>
                      <p className="text-sm text-muted-foreground">{alert.alert_message}</p>
                    </div>
                    {alert.alert_recommendation && (
                      <div>
                        <p className="text-sm font-medium">Recommendation</p>
                        <p className="text-sm text-muted-foreground">{alert.alert_recommendation}</p>
                      </div>
                    )}
                    {alert.alert_acknowledged_at && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          Acknowledged by {alert.alert_acknowledged_by} at {new Date(alert.alert_acknowledged_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {alert.alert_dismissed_at && (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          Dismissed by {alert.alert_dismissed_by} at {new Date(alert.alert_dismissed_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {alert.alert_dismissal_reason && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Dismissal Reason: {alert.alert_dismissal_reason}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interoperability" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>HL7 FHIR Compliance</CardTitle>
                <CardDescription>FHIR R4 compliance and interoperability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Database className="h-8 w-8" />
                  <span className="ml-2">FHIR compliance metrics will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interoperability Standards</CardTitle>
                <CardDescription>HL7, DICOM, IHE compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Globe className="h-8 w-8" />
                  <span className="ml-2">Interoperability standards will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>EHR Analytics</CardTitle>
                <CardDescription>Usage patterns and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8" />
                  <span className="ml-2">EHR analytics chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meaningful Use Metrics</CardTitle>
                <CardDescription>CMS Meaningful Use compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Award className="h-8 w-8" />
                  <span className="ml-2">Meaningful Use metrics will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}




