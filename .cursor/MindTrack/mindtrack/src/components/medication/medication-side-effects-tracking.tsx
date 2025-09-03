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
  AlertTriangle, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  Edit,
  Trash2,
  Pill,
  TestTube,
  Stethoscope,
  Microscope,
  Database,
  BarChart3,
  TrendingUp,
  Shield,
  Target,
  Gauge,
  Scale,
  Users,
  FileText,
  ActivitySquare,
  TrendingDown,
  AlertOctagon,
  Smartphone,
  Tablet,
  Monitor,
  Zap,
  Heart,
  Brain,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Send,
  PhoneCall,
  Mail as MailIcon,
  MessageCircle,
  Smartphone as Mobile,
  FileWarning,
  ShieldAlert,
  Activity as ActivityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  FileText as FileTextIcon,
  BarChart3 as BarChart3Icon,
  ActivitySquare as ActivitySquareIcon,
  AlertOctagon as AlertOctagonIcon,
  Shield as ShieldIcon,
  Target as TargetIcon,
  Gauge as GaugeIcon,
  Scale as ScaleIcon,
  Baby as BabyIcon,
  Users as UsersIcon2,
  Calendar as CalendarIcon2,
  FileText as FileTextIcon2,
  ActivitySquare as ActivitySquareIcon2,
  TrendingDown as TrendingDownIcon2,
  AlertOctagon as AlertOctagonIcon2
} from "lucide-react";

interface SideEffect {
  id: string;
  medicationName: string;
  sideEffectName: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  onsetDate: string;
  durationDays: number;
  frequency: string;
  intensityScale: number;
  impactOnDailyLife: string;
  currentStatus: 'active' | 'resolved' | 'improving' | 'worsening';
  actionTaken: string;
  outcome: string;
  notes: string;
}

interface SideEffectAssessment {
  id: string;
  medicationName: string;
  assessmentDate: string;
  assessmentType: string;
  assessmentTool: string;
  sideEffectsAssessed: string[];
  severityScores: Record<string, number>;
  functionalImpactScore: number;
  qualityOfLifeScore: number;
  overallSeverity: string;
  interventionRequired: boolean;
  interventionType: string;
}

interface FDAReport {
  id: string;
  medicationName: string;
  sideEffectName: string;
  reportDate: string;
  reportType: string;
  seriousness: string;
  outcome: string;
  causalityAssessment: string;
  fdaCaseNumber: string;
  reportStatus: string;
}

interface SideEffectAlert {
  id: string;
  alertType: string;
  medicationName: string;
  sideEffectName: string;
  alertMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  actionDescription: string;
  alertDate: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'escalated';
}

const MedicationSideEffectsTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for side effects
  const mockSideEffects: SideEffect[] = [
    {
      id: "1",
      medicationName: "Sertraline",
      sideEffectName: "Nausea",
      severity: "mild",
      onsetDate: "2024-01-10",
      durationDays: 3,
      frequency: "intermittent",
      intensityScale: 3,
      impactOnDailyLife: "minimal",
      currentStatus: "resolved",
      actionTaken: "none",
      outcome: "resolved",
      notes: "Resolved spontaneously after 3 days"
    },
    {
      id: "2",
      medicationName: "Bupropion",
      sideEffectName: "Insomnia",
      severity: "moderate",
      onsetDate: "2024-01-08",
      durationDays: 7,
      frequency: "constant",
      intensityScale: 6,
      impactOnDailyLife: "moderate",
      currentStatus: "active",
      actionTaken: "dose_reduced",
      outcome: "improved",
      notes: "Reduced dose from 300mg to 150mg"
    },
    {
      id: "3",
      medicationName: "Lithium",
      sideEffectName: "Tremor",
      severity: "mild",
      onsetDate: "2024-01-05",
      durationDays: 5,
      frequency: "intermittent",
      intensityScale: 4,
      impactOnDailyLife: "minimal",
      currentStatus: "active",
      actionTaken: "none",
      outcome: "unchanged",
      notes: "Mild hand tremor, not interfering with daily activities"
    }
  ];

  // Mock data for assessments
  const mockAssessments: SideEffectAssessment[] = [
    {
      id: "1",
      medicationName: "Sertraline",
      assessmentDate: "2024-01-15",
      assessmentType: "clinical_interview",
      assessmentTool: "NCI_CTCAE",
      sideEffectsAssessed: ["nausea", "headache", "fatigue"],
      severityScores: { "nausea": 1, "headache": 2, "fatigue": 1 },
      functionalImpactScore: 3,
      qualityOfLifeScore: 7,
      overallSeverity: "mild",
      interventionRequired: false,
      interventionType: "none"
    }
  ];

  // Mock data for FDA reports
  const mockFDAReports: FDAReport[] = [
    {
      id: "1",
      medicationName: "Sertraline",
      sideEffectName: "Serotonin Syndrome",
      reportDate: "2024-01-12",
      reportType: "serious",
      seriousness: "serious",
      outcome: "recovered",
      causalityAssessment: "probable",
      fdaCaseNumber: "FDA-2024-001234",
      reportStatus: "submitted"
    }
  ];

  // Mock data for alerts
  const mockAlerts: SideEffectAlert[] = [
    {
      id: "1",
      alertType: "new_side_effect",
      medicationName: "Bupropion",
      sideEffectName: "Insomnia",
      alertMessage: "New side effect reported: Insomnia with moderate severity",
      severity: "medium",
      actionRequired: true,
      actionDescription: "Review medication dose and consider dose reduction",
      alertDate: "2024-01-16T10:30:00Z",
      status: "active"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'life_threatening':
      case 'critical':
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
      case 'high':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'mild':
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'improving':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'worsening':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4" />;
      case 'low':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const totalSideEffects = mockSideEffects.length;
  const activeSideEffects = mockSideEffects.filter(se => se.currentStatus === 'active').length;
  const severeSideEffects = mockSideEffects.filter(se => se.severity === 'severe' || se.severity === 'life_threatening').length;
  const resolvedSideEffects = mockSideEffects.filter(se => se.currentStatus === 'resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medication Side Effects Tracking</h1>
          <p className="text-muted-foreground">
            Comprehensive monitoring, reporting, and analysis of medication side effects
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Report Side Effect
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Side Effects</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSideEffects}</div>
            <p className="text-xs text-muted-foreground">
              Across all medications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Side Effects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSideEffects}</div>
            <p className="text-xs text-muted-foreground">
              Currently being monitored
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Severe Side Effects</CardTitle>
            <AlertOctagon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{severeSideEffects}</div>
            <p className="text-xs text-muted-foreground">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Side Effects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedSideEffects}</div>
            <p className="text-xs text-muted-foreground">
              Successfully managed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="side-effects">Side Effects</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="fda-reports">FDA Reports</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Active Side Effects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockSideEffects.filter(se => se.currentStatus === 'active').map((sideEffect) => (
                    <div key={sideEffect.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        <span className="text-sm font-medium">{sideEffect.sideEffectName}</span>
                      </div>
                      <Badge className={getSeverityColor(sideEffect.severity)}>
                        {sideEffect.severity}
                      </Badge>
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
                      <span className="text-sm">New side effect reported</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Side effect resolved</span>
                    </div>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileWarning className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">FDA report submitted</span>
                    </div>
                    <span className="text-xs text-muted-foreground">3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="side-effects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Side Effects</CardTitle>
              <CardDescription>
                Track and manage medication side effects for patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSideEffects.map((sideEffect) => (
                  <div key={sideEffect.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        <span className="font-medium">{sideEffect.sideEffectName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(sideEffect.severity)}>
                          {sideEffect.severity}
                        </Badge>
                        <Badge className={getStatusColor(sideEffect.currentStatus)}>
                          {sideEffect.currentStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Medication:</span> {sideEffect.medicationName}
                      </div>
                      <div>
                        <span className="font-medium">Onset:</span> {sideEffect.onsetDate}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {sideEffect.durationDays} days
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span> {sideEffect.frequency}
                      </div>
                      <div>
                        <span className="font-medium">Intensity:</span> {sideEffect.intensityScale}/10
                      </div>
                      <div>
                        <span className="font-medium">Impact:</span> {sideEffect.impactOnDailyLife}
                      </div>
                      <div>
                        <span className="font-medium">Action Taken:</span> {sideEffect.actionTaken}
                      </div>
                      <div>
                        <span className="font-medium">Outcome:</span> {sideEffect.outcome}
                      </div>
                    </div>
                    {sideEffect.notes && (
                      <div className="mt-3">
                        <span className="font-medium">Notes:</span> {sideEffect.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Side Effects Assessments</CardTitle>
              <CardDescription>
                Structured assessments of side effects severity and impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAssessments.map((assessment) => (
                  <div key={assessment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        <span className="font-medium">{assessment.medicationName}</span>
                      </div>
                      <Badge className={getSeverityColor(assessment.overallSeverity)}>
                        {assessment.overallSeverity}
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Assessment Date:</span> {assessment.assessmentDate}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {assessment.assessmentType}
                      </div>
                      <div>
                        <span className="font-medium">Tool:</span> {assessment.assessmentTool}
                      </div>
                      <div>
                        <span className="font-medium">Functional Impact:</span> {assessment.functionalImpactScore}/10
                      </div>
                      <div>
                        <span className="font-medium">Quality of Life:</span> {assessment.qualityOfLifeScore}/10
                      </div>
                      <div>
                        <span className="font-medium">Intervention Required:</span> {assessment.interventionRequired ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Severity Scores:</span>
                      <div className="mt-2 space-y-1">
                        {Object.entries(assessment.severityScores).map(([effect, score]) => (
                          <div key={effect} className="flex items-center gap-2">
                            <span className="text-sm">{effect}:</span>
                            <Progress value={score * 10} className="h-2 w-20" />
                            <span className="text-sm">{score}</span>
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

        <TabsContent value="fda-reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FDA Adverse Event Reports</CardTitle>
              <CardDescription>
                Track FDA adverse event reporting and responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockFDAReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileWarning className="h-4 w-4" />
                        <span className="font-medium">{report.sideEffectName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(report.seriousness)}>
                          {report.seriousness}
                        </Badge>
                        <Badge variant={report.reportStatus === 'submitted' ? 'default' : 'secondary'}>
                          {report.reportStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Medication:</span> {report.medicationName}
                      </div>
                      <div>
                        <span className="font-medium">Report Date:</span> {report.reportDate}
                      </div>
                      <div>
                        <span className="font-medium">Report Type:</span> {report.reportType}
                      </div>
                      <div>
                        <span className="font-medium">Outcome:</span> {report.outcome}
                      </div>
                      <div>
                        <span className="font-medium">Causality:</span> {report.causalityAssessment}
                      </div>
                      <div>
                        <span className="font-medium">FDA Case #:</span> {report.fdaCaseNumber}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Side Effects Alerts</CardTitle>
              <CardDescription>
                Active alerts for side effects requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.severity)}
                        <span className="font-medium">{alert.alertType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge variant={alert.status === 'active' ? 'default' : 'secondary'}>
                          {alert.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div>
                        <span className="font-medium">Medication:</span> {alert.medicationName}
                      </div>
                      <div>
                        <span className="font-medium">Side Effect:</span> {alert.sideEffectName}
                      </div>
                      <div>
                        <span className="font-medium">Message:</span> {alert.alertMessage}
                      </div>
                      {alert.actionRequired && (
                        <div>
                          <span className="font-medium">Action Required:</span> {alert.actionDescription}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Acknowledge
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
              <CardTitle>Side Effects Analytics</CardTitle>
              <CardDescription>
                Trends and patterns in side effects reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Side Effects by Severity</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mild</span>
                      <div className="flex items-center gap-2">
                        <Progress value={60} className="h-2 w-20" />
                        <span className="text-sm">60%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Moderate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={30} className="h-2 w-20" />
                        <span className="text-sm">30%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Severe</span>
                      <div className="flex items-center gap-2">
                        <Progress value={10} className="h-2 w-20" />
                        <span className="text-sm">10%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Most Common Side Effects</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Nausea</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Headache</span>
                      <span className="text-sm font-medium">18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Fatigue</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Insomnia</span>
                      <span className="text-sm font-medium">12%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dizziness</span>
                      <span className="text-sm font-medium">10%</span>
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

export default MedicationSideEffectsTracking;
