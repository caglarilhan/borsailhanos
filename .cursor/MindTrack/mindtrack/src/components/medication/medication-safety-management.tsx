'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  Activity, 
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';

// Interfaces
interface MedicationSafetyAlert {
  id: string;
  alert_name: string;
  alert_code: string;
  alert_type: string;
  severity_level: string;
  medication_name: string;
  alert_description: string;
  effective_date: string;
  is_active: boolean;
  black_box_warning: boolean;
  fda_alert_number?: string;
}

interface PatientSafetyAssessment {
  id: string;
  patient_id: string;
  assessment_date: string;
  assessment_type: string;
  safety_score: number;
  risk_level: string;
  safety_recommendations: string[];
  follow_up_required: boolean;
}

interface MedicationErrorReport {
  id: string;
  patient_id: string;
  error_date: string;
  error_type: string;
  severity_level: string;
  medication_name: string;
  error_description: string;
  patient_harm: boolean;
  harm_severity?: string;
}

interface AdverseEventReport {
  id: string;
  patient_id: string;
  event_date: string;
  event_type: string;
  severity_level: string;
  causality_assessment: string;
  medication_name: string;
  event_description: string;
  outcome: string;
}

export function MedicationSafetyManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState<MedicationSafetyAlert[]>([]);
  const [assessments, setAssessments] = useState<PatientSafetyAssessment[]>([]);
  const [errorReports, setErrorReports] = useState<MedicationErrorReport[]>([]);
  const [adverseEvents, setAdverseEvents] = useState<AdverseEventReport[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    setAlerts([
      {
        id: '1',
        alert_name: 'FDA Safety Alert - Sertraline',
        alert_code: 'FDA-ALERT-2024-001',
        alert_type: 'fda_safety',
        severity_level: 'high',
        medication_name: 'Sertraline',
        alert_description: 'Increased risk of suicidal thoughts in young adults',
        effective_date: '2024-01-15',
        is_active: true,
        black_box_warning: true,
        fda_alert_number: 'FDA-2024-001'
      },
      {
        id: '2',
        alert_name: 'Drug Recall - Lithium',
        alert_code: 'RECALL-2024-002',
        alert_type: 'drug_recall',
        severity_level: 'critical',
        medication_name: 'Lithium Carbonate',
        alert_description: 'Contamination detected in specific lot numbers',
        effective_date: '2024-01-20',
        is_active: true,
        black_box_warning: false
      }
    ]);

    setAssessments([
      {
        id: '1',
        patient_id: 'patient-1',
        assessment_date: '2024-01-25',
        assessment_type: 'follow_up',
        safety_score: 0.75,
        risk_level: 'medium',
        safety_recommendations: ['Monitor liver function', 'Check drug interactions'],
        follow_up_required: true
      }
    ]);

    setErrorReports([
      {
        id: '1',
        patient_id: 'patient-1',
        error_date: '2024-01-24',
        error_type: 'prescribing',
        severity_level: 'moderate',
        medication_name: 'Fluoxetine',
        error_description: 'Incorrect dosage prescribed',
        patient_harm: false
      }
    ]);

    setAdverseEvents([
      {
        id: '1',
        patient_id: 'patient-1',
        event_date: '2024-01-23',
        event_type: 'adverse_drug_reaction',
        severity_level: 'moderate',
        causality_assessment: 'probable',
        medication_name: 'Sertraline',
        event_description: 'Nausea and dizziness',
        outcome: 'recovered'
      }
    ]);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'moderate': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Medication Safety Management</h2>
          <p className="text-muted-foreground">
            Comprehensive medication safety monitoring and reporting system
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Safety Assessment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Safety Alerts</TabsTrigger>
          <TabsTrigger value="assessments">Patient Assessments</TabsTrigger>
          <TabsTrigger value="errors">Error Reports</TabsTrigger>
          <TabsTrigger value="adverse-events">Adverse Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.filter(a => a.is_active).length}</div>
                <p className="text-xs text-muted-foreground">
                  {alerts.filter(a => a.severity_level === 'critical').length} critical
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Safety Assessments</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assessments.length}</div>
                <p className="text-xs text-muted-foreground">
                  {assessments.filter(a => a.follow_up_required).length} need follow-up
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Reports</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{errorReports.length}</div>
                <p className="text-xs text-muted-foreground">
                  {errorReports.filter(e => e.patient_harm).length} with patient harm
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Adverse Events</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adverseEvents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {adverseEvents.filter(e => e.outcome === 'recovered').length} recovered
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Safety Alerts</CardTitle>
                <CardDescription>Latest medication safety alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{alert.medication_name}</p>
                      <p className="text-xs text-muted-foreground">{alert.alert_description}</p>
                    </div>
                    <Badge variant={getSeverityColor(alert.severity_level)}>
                      {alert.severity_level}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>High Risk Patients</CardTitle>
                <CardDescription>Patients requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessments.filter(a => a.risk_level === 'high' || a.risk_level === 'critical').map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Patient {assessment.patient_id}</p>
                      <p className="text-xs text-muted-foreground">
                        Safety Score: {(assessment.safety_score * 100).toFixed(0)}%
                      </p>
                    </div>
                    <Badge variant={getRiskLevelColor(assessment.risk_level)}>
                      {assessment.risk_level}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Medication Safety Alerts</h3>
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
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{alert.alert_name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getSeverityColor(alert.severity_level)}>
                        {alert.severity_level}
                      </Badge>
                      {alert.black_box_warning && (
                        <Badge variant="destructive">Black Box Warning</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {alert.medication_name} - {alert.alert_code}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{alert.alert_description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Effective: {alert.effective_date}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Patient Safety Assessments</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          </div>

          <div className="grid gap-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Patient {assessment.patient_id}</CardTitle>
                    <Badge variant={getRiskLevelColor(assessment.risk_level)}>
                      {assessment.risk_level} risk
                    </Badge>
                  </div>
                  <CardDescription>
                    {assessment.assessment_type} - {assessment.assessment_date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Safety Score</span>
                      <span className="text-sm">{(assessment.safety_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${assessment.safety_score * 100}%` }}
                      ></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Recommendations:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {assessment.safety_recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                    {assessment.follow_up_required && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Follow-up required for this patient
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Medication Error Reports</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Report Error
            </Button>
          </div>

          <div className="grid gap-4">
            {errorReports.map((error) => (
              <Card key={error.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{error.medication_name} Error</CardTitle>
                    <Badge variant={getSeverityColor(error.severity_level)}>
                      {error.severity_level}
                    </Badge>
                  </div>
                  <CardDescription>
                    Patient {error.patient_id} - {error.error_date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{error.error_description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Type: {error.error_type}
                    </span>
                    {error.patient_harm && (
                      <Badge variant="destructive">Patient Harm</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="adverse-events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Adverse Event Reports</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Report Event
            </Button>
          </div>

          <div className="grid gap-4">
            {adverseEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{event.medication_name} Event</CardTitle>
                    <Badge variant={getSeverityColor(event.severity_level)}>
                      {event.severity_level}
                    </Badge>
                  </div>
                  <CardDescription>
                    Patient {event.patient_id} - {event.event_date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{event.event_description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Causality: {event.causality_assessment}
                    </span>
                    <Badge variant="default">{event.outcome}</Badge>
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
                <CardTitle>Safety Trends</CardTitle>
                <CardDescription>Medication safety trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8" />
                  <span className="ml-2">Safety trends chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Analysis</CardTitle>
                <CardDescription>Medication error patterns and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Activity className="h-8 w-8" />
                  <span className="ml-2">Error analysis chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}




