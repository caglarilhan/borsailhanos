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
  TestTube, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Plus,
  Edit,
  Trash2,
  Bell,
  BellOff,
  Target,
  BarChart3,
  FileText,
  Users,
  Pill,
  Zap
} from "lucide-react";

// Interfaces
interface DrugLevelTest {
  id: string;
  patient_id: string;
  medication_id: string;
  test_date: string;
  test_type: 'trough' | 'peak' | 'random' | 'steady_state';
  collection_time: string;
  last_dose_time?: string;
  last_dose_amount?: number;
  dose_frequency?: string;
  test_result: number;
  unit: string;
  therapeutic_range_min?: number;
  therapeutic_range_max?: number;
  toxic_range_min?: number;
  toxic_range_max?: number;
  is_therapeutic: boolean;
  is_subtherapeutic: boolean;
  is_toxic: boolean;
  interpretation?: string;
  clinical_action?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  lab_name?: string;
  lab_reference?: string;
  notes?: string;
  medications?: {
    name: string;
    generic_name: string;
    drug_class: string;
  };
  clients?: {
    first_name: string;
    last_name: string;
  };
}

interface DrugLevelSchedule {
  id: string;
  patient_id: string;
  medication_id: string;
  schedule_type: 'routine' | 'dose_adjustment' | 'toxicity_monitoring' | 'efficacy_monitoring';
  frequency_days: number;
  next_test_date: string;
  is_active: boolean;
  monitoring_reason?: string;
  medications?: {
    name: string;
    generic_name: string;
  };
  clients?: {
    first_name: string;
    last_name: string;
  };
}

interface DrugLevelAlert {
  id: string;
  patient_id: string;
  medication_id: string;
  test_id?: string;
  alert_type: 'subtherapeutic' | 'toxic' | 'missing_test' | 'schedule_overdue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  alert_message: string;
  clinical_recommendation?: string;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved: boolean;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  medications?: {
    name: string;
    generic_name: string;
  };
  clients?: {
    first_name: string;
    last_name: string;
  };
  drug_level_tests?: {
    test_date: string;
    test_result: number;
    unit: string;
  };
}

interface DrugLevelAnalytics {
  id: string;
  patient_id: string;
  medication_id: string;
  analysis_date: string;
  time_period_days: number;
  total_tests: number;
  therapeutic_tests: number;
  subtherapeutic_tests: number;
  toxic_tests: number;
  average_level: number;
  min_level: number;
  max_level: number;
  level_variability: number;
  adherence_score: number;
  dose_adjustments: number;
  clinical_outcomes?: string;
  medications?: {
    name: string;
    generic_name: string;
  };
  clients?: {
    first_name: string;
    last_name: string;
  };
}

// Mock data
const mockDrugLevelTests: DrugLevelTest[] = [
  {
    id: '1',
    patient_id: 'patient-1',
    medication_id: 'med-1',
    test_date: '2024-01-15T10:30:00Z',
    test_type: 'trough',
    collection_time: '2024-01-15T08:00:00Z',
    last_dose_time: '2024-01-14T20:00:00Z',
    last_dose_amount: 100,
    dose_frequency: 'twice_daily',
    test_result: 45.2,
    unit: 'ng/mL',
    therapeutic_range_min: 20,
    therapeutic_range_max: 80,
    toxic_range_min: 100,
    toxic_range_max: 200,
    is_therapeutic: true,
    is_subtherapeutic: false,
    is_toxic: false,
    interpretation: 'Within therapeutic range',
    clinical_action: 'Continue current dose',
    follow_up_required: false,
    lab_name: 'LabCorp',
    lab_reference: 'LC-2024-001',
    medications: {
      name: 'Lithium Carbonate',
      generic_name: 'Lithium',
      drug_class: 'Mood Stabilizer'
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
    test_date: '2024-01-14T14:15:00Z',
    test_type: 'peak',
    collection_time: '2024-01-14T14:00:00Z',
    last_dose_time: '2024-01-14T12:00:00Z',
    last_dose_amount: 50,
    dose_frequency: 'twice_daily',
    test_result: 15.8,
    unit: 'ng/mL',
    therapeutic_range_min: 20,
    therapeutic_range_max: 80,
    toxic_range_min: 100,
    toxic_range_max: 200,
    is_therapeutic: false,
    is_subtherapeutic: true,
    is_toxic: false,
    interpretation: 'Subtherapeutic level',
    clinical_action: 'Consider dose increase',
    follow_up_required: true,
    follow_up_date: '2024-01-21',
    lab_name: 'Quest Diagnostics',
    lab_reference: 'QD-2024-002',
    medications: {
      name: 'Valproic Acid',
      generic_name: 'Valproate',
      drug_class: 'Mood Stabilizer'
    },
    clients: {
      first_name: 'Jane',
      last_name: 'Smith'
    }
  }
];

const mockDrugLevelSchedules: DrugLevelSchedule[] = [
  {
    id: '1',
    patient_id: 'patient-1',
    medication_id: 'med-1',
    schedule_type: 'routine',
    frequency_days: 7,
    next_test_date: '2024-01-22',
    is_active: true,
    monitoring_reason: 'Routine monitoring for lithium therapy',
    medications: {
      name: 'Lithium Carbonate',
      generic_name: 'Lithium'
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
    schedule_type: 'dose_adjustment',
    frequency_days: 14,
    next_test_date: '2024-01-28',
    is_active: true,
    monitoring_reason: 'Recent dose adjustment - monitoring response',
    medications: {
      name: 'Valproic Acid',
      generic_name: 'Valproate'
    },
    clients: {
      first_name: 'Jane',
      last_name: 'Smith'
    }
  }
];

const mockDrugLevelAlerts: DrugLevelAlert[] = [
  {
    id: '1',
    patient_id: 'patient-2',
    medication_id: 'med-2',
    test_id: '2',
    alert_type: 'subtherapeutic',
    severity: 'medium',
    alert_message: 'Subtherapeutic drug level detected: 15.8 ng/mL',
    clinical_recommendation: 'Consider dose increase',
    is_acknowledged: false,
    resolved: false,
    created_at: '2024-01-14T15:00:00Z',
    medications: {
      name: 'Valproic Acid',
      generic_name: 'Valproate'
    },
    clients: {
      first_name: 'Jane',
      last_name: 'Smith'
    },
    drug_level_tests: {
      test_date: '2024-01-14T14:15:00Z',
      test_result: 15.8,
      unit: 'ng/mL'
    }
  }
];

const mockDrugLevelAnalytics: DrugLevelAnalytics[] = [
  {
    id: '1',
    patient_id: 'patient-1',
    medication_id: 'med-1',
    analysis_date: '2024-01-15',
    time_period_days: 30,
    total_tests: 4,
    therapeutic_tests: 3,
    subtherapeutic_tests: 1,
    toxic_tests: 0,
    average_level: 42.5,
    min_level: 28.3,
    max_level: 58.7,
    level_variability: 15.2,
    adherence_score: 92.5,
    dose_adjustments: 1,
    clinical_outcomes: 'improved',
    medications: {
      name: 'Lithium Carbonate',
      generic_name: 'Lithium'
    },
    clients: {
      first_name: 'John',
      last_name: 'Doe'
    }
  }
];

// Helper functions
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'low': return CheckCircle;
    case 'medium': return AlertTriangle;
    case 'high': return AlertTriangle;
    case 'critical': return XCircle;
    default: return AlertTriangle;
  }
};

const getTestTypeIcon = (testType: string) => {
  switch (testType) {
    case 'trough': return Clock;
    case 'peak': return TrendingUp;
    case 'random': return Activity;
    case 'steady_state': return Target;
    default: return TestTube;
  }
};

const getScheduleTypeIcon = (scheduleType: string) => {
  switch (scheduleType) {
    case 'routine': return Calendar;
    case 'dose_adjustment': return Edit;
    case 'toxicity_monitoring': return AlertTriangle;
    case 'efficacy_monitoring': return Target;
    default: return Calendar;
  }
};

export default function DrugLevelMonitoring() {
  const [activeTab, setActiveTab] = useState('overview');
  const [drugLevelTests] = useState<DrugLevelTest[]>(mockDrugLevelTests);
  const [drugLevelSchedules] = useState<DrugLevelSchedule[]>(mockDrugLevelSchedules);
  const [drugLevelAlerts] = useState<DrugLevelAlert[]>(mockDrugLevelAlerts);
  const [drugLevelAnalytics] = useState<DrugLevelAnalytics[]>(mockDrugLevelAnalytics);

  const totalTests = drugLevelTests.length;
  const therapeuticTests = drugLevelTests.filter(test => test.is_therapeutic).length;
  const subtherapeuticTests = drugLevelTests.filter(test => test.is_subtherapeutic).length;
  const toxicTests = drugLevelTests.filter(test => test.is_toxic).length;
  const activeSchedules = drugLevelSchedules.filter(schedule => schedule.is_active).length;
  const unacknowledgedAlerts = drugLevelAlerts.filter(alert => !alert.is_acknowledged).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Drug Level Monitoring</h2>
          <p className="text-muted-foreground">
            Comprehensive monitoring of psychiatric medication levels and therapeutic ranges
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Test
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Therapeutic Levels</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{therapeuticTests}</div>
            <p className="text-xs text-muted-foreground">
              {totalTests > 0 ? Math.round((therapeuticTests / totalTests) * 100) : 0}% of tests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSchedules}</div>
            <p className="text-xs text-muted-foreground">
              Monitoring schedules
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unacknowledgedAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="schedules">Monitoring Schedules</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Test Results</CardTitle>
                <CardDescription>Latest drug level test results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drugLevelTests.slice(0, 3).map((test) => {
                    const TestIcon = getTestTypeIcon(test.test_type);
                    return (
                      <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <TestIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {test.medications?.name} - {test.clients?.first_name} {test.clients?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {test.test_result} {test.unit} • {new Date(test.test_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {test.is_therapeutic && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Therapeutic
                            </Badge>
                          )}
                          {test.is_subtherapeutic && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Subtherapeutic
                            </Badge>
                          )}
                          {test.is_toxic && (
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              Toxic
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tests</CardTitle>
                <CardDescription>Scheduled drug level tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drugLevelSchedules.slice(0, 3).map((schedule) => {
                    const ScheduleIcon = getScheduleTypeIcon(schedule.schedule_type);
                    return (
                      <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <ScheduleIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {schedule.medications?.name} - {schedule.clients?.first_name} {schedule.clients?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(schedule.next_test_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {schedule.schedule_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Level Distribution</CardTitle>
              <CardDescription>Distribution of test results by therapeutic range</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{therapeuticTests}</div>
                  <p className="text-sm text-muted-foreground">Therapeutic</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${totalTests > 0 ? (therapeuticTests / totalTests) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{subtherapeuticTests}</div>
                  <p className="text-sm text-muted-foreground">Subtherapeutic</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: `${totalTests > 0 ? (subtherapeuticTests / totalTests) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{toxicTests}</div>
                  <p className="text-sm text-muted-foreground">Toxic</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${totalTests > 0 ? (toxicTests / totalTests) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drug Level Test Results</CardTitle>
              <CardDescription>Comprehensive view of all drug level test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drugLevelTests.map((test) => {
                  const TestIcon = getTestTypeIcon(test.test_type);
                  return (
                    <div key={test.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <TestIcon className="h-5 w-5 text-muted-foreground mt-1" />
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">
                                {test.medications?.name} - {test.clients?.first_name} {test.clients?.last_name}
                              </h3>
                              <Badge variant="outline">{test.test_type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Test Date: {new Date(test.test_date).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Collection Time: {new Date(test.collection_time).toLocaleString()}
                            </p>
                            {test.last_dose_time && (
                              <p className="text-sm text-muted-foreground">
                                Last Dose: {new Date(test.last_dose_time).toLocaleString()} ({test.last_dose_amount}mg)
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold">
                            {test.test_result} {test.unit}
                          </div>
                          <div className="flex items-center space-x-2">
                            {test.is_therapeutic && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Therapeutic
                              </Badge>
                            )}
                            {test.is_subtherapeutic && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Subtherapeutic
                              </Badge>
                            )}
                            {test.is_toxic && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                Toxic
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {test.therapeutic_range_min && test.therapeutic_range_max && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span>Therapeutic Range:</span>
                            <span>{test.therapeutic_range_min} - {test.therapeutic_range_max} {test.unit}</span>
                          </div>
                          {test.toxic_range_min && test.toxic_range_max && (
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span>Toxic Range:</span>
                              <span>&gt; {test.toxic_range_max} {test.unit}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {test.interpretation && (
                        <div className="mt-3">
                          <p className="text-sm font-medium">Interpretation:</p>
                          <p className="text-sm text-muted-foreground">{test.interpretation}</p>
                        </div>
                      )}

                      {test.clinical_action && (
                        <div className="mt-3">
                          <p className="text-sm font-medium">Clinical Action:</p>
                          <p className="text-sm text-muted-foreground">{test.clinical_action}</p>
                        </div>
                      )}

                      {test.follow_up_required && (
                        <Alert className="mt-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Follow-up required by {test.follow_up_date}
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
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Schedules</CardTitle>
              <CardDescription>Drug level monitoring schedules and reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drugLevelSchedules.map((schedule) => {
                  const ScheduleIcon = getScheduleTypeIcon(schedule.schedule_type);
                  return (
                    <div key={schedule.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <ScheduleIcon className="h-5 w-5 text-muted-foreground mt-1" />
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">
                                {schedule.medications?.name} - {schedule.clients?.first_name} {schedule.clients?.last_name}
                              </h3>
                              <Badge variant="outline">{schedule.schedule_type.replace('_', ' ')}</Badge>
                              {schedule.is_active ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Frequency: Every {schedule.frequency_days} days
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Next Test: {new Date(schedule.next_test_date).toLocaleDateString()}
                            </p>
                            {schedule.monitoring_reason && (
                              <p className="text-sm text-muted-foreground">
                                Reason: {schedule.monitoring_reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drug Level Alerts</CardTitle>
              <CardDescription>Active alerts requiring clinical attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drugLevelAlerts.map((alert) => {
                  const SeverityIcon = getSeverityIcon(alert.severity);
                  return (
                    <div key={alert.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <SeverityIcon className="h-5 w-5 text-muted-foreground mt-1" />
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">
                                {alert.medications?.name} - {alert.clients?.first_name} {alert.clients?.last_name}
                              </h3>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline">{alert.alert_type.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {alert.alert_message}
                            </p>
                            {alert.drug_level_tests && (
                              <p className="text-sm text-muted-foreground">
                                Test Result: {alert.drug_level_tests.test_result} {alert.drug_level_tests.unit} 
                                ({new Date(alert.drug_level_tests.test_date).toLocaleDateString()})
                              </p>
                            )}
                            {alert.clinical_recommendation && (
                              <p className="text-sm font-medium text-blue-600">
                                Recommendation: {alert.clinical_recommendation}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Created: {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!alert.is_acknowledged && (
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Acknowledge
                            </Button>
                          )}
                          {!alert.resolved && (
                            <Button variant="outline" size="sm">
                              <XCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drug Level Analytics</CardTitle>
              <CardDescription>Comprehensive analytics and trends for drug level monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drugLevelAnalytics.map((analytics) => (
                  <div key={analytics.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">
                          {analytics.medications?.name} - {analytics.clients?.first_name} {analytics.clients?.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Analysis Period: {analytics.time_period_days} days ending {new Date(analytics.analysis_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {analytics.clinical_outcomes || 'stable'}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{analytics.total_tests}</div>
                        <p className="text-sm text-muted-foreground">Total Tests</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{analytics.therapeutic_tests}</div>
                        <p className="text-sm text-muted-foreground">Therapeutic</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{analytics.average_level.toFixed(1)}</div>
                        <p className="text-sm text-muted-foreground">Average Level</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{analytics.adherence_score.toFixed(1)}%</div>
                        <p className="text-sm text-muted-foreground">Adherence</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="flex justify-between text-sm">
                          <span>Min Level:</span>
                          <span>{analytics.min_level.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Max Level:</span>
                          <span>{analytics.max_level.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Variability:</span>
                          <span>{analytics.level_variability.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Dose Adjustments:</span>
                          <span>{analytics.dose_adjustments}</span>
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











