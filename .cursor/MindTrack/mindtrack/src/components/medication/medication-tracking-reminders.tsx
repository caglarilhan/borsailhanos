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
  Bell, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
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
  AlertCircle,
  Shield,
  Target,
  Gauge,
  Scale,
  Baby,
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
  Activity,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Send,
  PhoneCall,
  Mail as MailIcon,
  MessageCircle,
  Smartphone as Mobile
} from "lucide-react";

interface MedicationAdherence {
  medicationName: string;
  prescribedDose: number;
  frequency: string;
  totalDoses: number;
  dosesTaken: number;
  dosesMissed: number;
  adherenceRate: number;
  status: 'active' | 'completed' | 'discontinued';
}

interface MedicationRefill {
  medicationName: string;
  refillDate: string;
  remainingQuantity: number;
  pharmacyName: string;
  pharmacyPhone: string;
  refillStatus: 'pending' | 'requested' | 'filled' | 'picked_up';
}

interface MedicationReminder {
  medicationName: string;
  reminderType: 'dose_reminder' | 'refill_reminder' | 'appointment_reminder' | 'lab_reminder';
  reminderMessage: string;
  reminderTime: string;
  frequency: string;
  method: 'sms' | 'email' | 'push_notification' | 'phone_call';
  status: 'active' | 'sent' | 'acknowledged' | 'cancelled';
  nextSendAt: string;
}

interface MedicationDoseLog {
  medicationName: string;
  doseDate: string;
  doseTime: string;
  doseTaken: boolean;
  doseSkipped: boolean;
  actualDose: number;
  notes: string;
}

interface MedicationSideEffect {
  medicationName: string;
  sideEffectName: string;
  severity: 'mild' | 'moderate' | 'severe';
  onsetDate: string;
  durationDays: number;
  resolvedDate: string | null;
  actionTaken: string;
  reportedToFDA: boolean;
}

interface MedicationEffectiveness {
  medicationName: string;
  assessmentDate: string;
  effectivenessRating: number;
  symptomImprovement: string;
  sideEffectsRating: number;
  overallSatisfaction: number;
  continueMedication: boolean;
}

const MedicationTrackingReminders: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for medication adherence
  const mockMedicationAdherence: MedicationAdherence[] = [
    {
      medicationName: "Sertraline",
      prescribedDose: 50,
      frequency: "daily",
      totalDoses: 30,
      dosesTaken: 28,
      dosesMissed: 2,
      adherenceRate: 93.3,
      status: 'active'
    },
    {
      medicationName: "Bupropion",
      prescribedDose: 150,
      frequency: "twice daily",
      totalDoses: 60,
      dosesTaken: 52,
      dosesMissed: 8,
      adherenceRate: 86.7,
      status: 'active'
    },
    {
      medicationName: "Lithium",
      prescribedDose: 600,
      frequency: "twice daily",
      totalDoses: 60,
      dosesTaken: 58,
      dosesMissed: 2,
      adherenceRate: 96.7,
      status: 'active'
    }
  ];

  // Mock data for medication refills
  const mockMedicationRefills: MedicationRefill[] = [
    {
      medicationName: "Sertraline",
      refillDate: "2024-01-25",
      remainingQuantity: 5,
      pharmacyName: "CVS Pharmacy",
      pharmacyPhone: "(555) 123-4567",
      refillStatus: 'pending'
    },
    {
      medicationName: "Bupropion",
      refillDate: "2024-01-28",
      remainingQuantity: 12,
      pharmacyName: "Walgreens",
      pharmacyPhone: "(555) 987-6543",
      refillStatus: 'requested'
    }
  ];

  // Mock data for medication reminders
  const mockMedicationReminders: MedicationReminder[] = [
    {
      medicationName: "Sertraline",
      reminderType: "dose_reminder",
      reminderMessage: "Time to take your Sertraline 50mg",
      reminderTime: "09:00",
      frequency: "daily",
      method: "sms",
      status: 'active',
      nextSendAt: "2024-01-16T09:00:00Z"
    },
    {
      medicationName: "Bupropion",
      reminderType: "dose_reminder",
      reminderMessage: "Time to take your Bupropion 150mg",
      reminderTime: "08:00",
      frequency: "twice daily",
      method: "email",
      status: 'active',
      nextSendAt: "2024-01-16T08:00:00Z"
    }
  ];

  // Mock data for dose logs
  const mockDoseLogs: MedicationDoseLog[] = [
    {
      medicationName: "Sertraline",
      doseDate: "2024-01-15",
      doseTime: "09:15",
      doseTaken: true,
      doseSkipped: false,
      actualDose: 50,
      notes: "Taken with breakfast"
    },
    {
      medicationName: "Sertraline",
      doseDate: "2024-01-14",
      doseTime: "09:30",
      doseTaken: false,
      doseSkipped: true,
      actualDose: 0,
      notes: "Forgot to take"
    }
  ];

  // Mock data for side effects
  const mockSideEffects: MedicationSideEffect[] = [
    {
      medicationName: "Sertraline",
      sideEffectName: "Nausea",
      severity: "mild",
      onsetDate: "2024-01-10",
      durationDays: 3,
      resolvedDate: "2024-01-13",
      actionTaken: "none",
      reportedToFDA: false
    },
    {
      medicationName: "Bupropion",
      sideEffectName: "Insomnia",
      severity: "moderate",
      onsetDate: "2024-01-08",
      durationDays: 7,
      resolvedDate: null,
      actionTaken: "dose_reduced",
      reportedToFDA: false
    }
  ];

  // Mock data for effectiveness
  const mockEffectiveness: MedicationEffectiveness[] = [
    {
      medicationName: "Sertraline",
      assessmentDate: "2024-01-10",
      effectivenessRating: 8,
      symptomImprovement: "significant",
      sideEffectsRating: 7,
      overallSatisfaction: 8,
      continueMedication: true
    }
  ];

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getAdherenceBadgeVariant = (rate: number) => {
    if (rate >= 90) return "default";
    if (rate >= 80) return "secondary";
    return "destructive";
  };

  const getReminderIcon = (method: string) => {
    switch (method) {
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'push_notification':
        return <Bell className="h-4 w-4" />;
      case 'phone_call':
        return <Phone className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getRefillStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'requested':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'filled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'picked_up':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const averageAdherenceRate = mockMedicationAdherence.reduce((sum, med) => sum + med.adherenceRate, 0) / mockMedicationAdherence.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medication Tracking & Reminders</h1>
          <p className="text-muted-foreground">
            Comprehensive medication adherence tracking, refill management, and patient communication
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Adherence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAdherenceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all medications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMedicationReminders.length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled notifications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Refills</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMedicationRefills.length}</div>
            <p className="text-xs text-muted-foreground">
              Due this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missed Doses</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Past 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="adherence">Adherence</TabsTrigger>
          <TabsTrigger value="refills">Refills</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="side-effects">Side Effects</TabsTrigger>
          <TabsTrigger value="effectiveness">Effectiveness</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Adherence Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMedicationAdherence.map((medication, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        <span className="font-medium">{medication.medicationName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getAdherenceColor(medication.adherenceRate)}`}>
                          {medication.adherenceRate}%
                        </span>
                        <Badge variant={getAdherenceBadgeVariant(medication.adherenceRate)}>
                          {medication.adherenceRate >= 90 ? "Excellent" : 
                           medication.adherenceRate >= 80 ? "Good" : "Needs Attention"}
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
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Sertraline taken</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Bupropion missed</span>
                    </div>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Refill reminder sent</span>
                    </div>
                    <span className="text-xs text-muted-foreground">3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="adherence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medication Adherence Tracking</CardTitle>
              <CardDescription>
                Detailed tracking of medication adherence rates and missed doses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMedicationAdherence.map((medication, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        <span className="font-medium">{medication.medicationName}</span>
                      </div>
                      <Badge variant={getAdherenceBadgeVariant(medication.adherenceRate)}>
                        {medication.adherenceRate}% Adherence
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Prescribed:</span> {medication.prescribedDose}mg {medication.frequency}
                      </div>
                      <div>
                        <span className="font-medium">Total Doses:</span> {medication.totalDoses}
                      </div>
                      <div>
                        <span className="font-medium">Doses Taken:</span> {medication.dosesTaken}
                      </div>
                      <div>
                        <span className="font-medium">Doses Missed:</span> {medication.dosesMissed}
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={medication.adherenceRate} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medication Refill Management</CardTitle>
              <CardDescription>
                Track medication refills and pharmacy information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMedicationRefills.map((refill, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        <span className="font-medium">{refill.medicationName}</span>
                      </div>
                      <Badge className={getRefillStatusColor(refill.refillStatus)}>
                        {refill.refillStatus}
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Refill Date:</span> {refill.refillDate}
                      </div>
                      <div>
                        <span className="font-medium">Remaining:</span> {refill.remainingQuantity} doses
                      </div>
                      <div>
                        <span className="font-medium">Pharmacy:</span> {refill.pharmacyName}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {refill.pharmacyPhone}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Pharmacy
                      </Button>
                      <Button size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Request Refill
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medication Reminders</CardTitle>
              <CardDescription>
                Manage patient medication reminders and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMedicationReminders.map((reminder, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getReminderIcon(reminder.method)}
                        <span className="font-medium">{reminder.medicationName}</span>
                      </div>
                      <Badge variant={reminder.status === 'active' ? 'default' : 'secondary'}>
                        {reminder.status}
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Type:</span> {reminder.reminderType}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {reminder.reminderTime}
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span> {reminder.frequency}
                      </div>
                      <div>
                        <span className="font-medium">Method:</span> {reminder.method}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">{reminder.reminderMessage}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send className="h-4 w-4 mr-2" />
                        Send Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="side-effects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Side Effect Tracking</CardTitle>
              <CardDescription>
                Monitor and track medication side effects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSideEffects.map((sideEffect, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">{sideEffect.sideEffectName}</span>
                      </div>
                      <Badge className={
                        sideEffect.severity === 'severe' ? 'bg-red-100 text-red-800 border-red-200' :
                        sideEffect.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-blue-100 text-blue-800 border-blue-200'
                      }>
                        {sideEffect.severity}
                      </Badge>
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
                        <span className="font-medium">Action:</span> {sideEffect.actionTaken}
                      </div>
                      {sideEffect.resolvedDate && (
                        <div>
                          <span className="font-medium">Resolved:</span> {sideEffect.resolvedDate}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effectiveness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medication Effectiveness</CardTitle>
              <CardDescription>
                Track medication effectiveness and patient satisfaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEffectiveness.map((assessment, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span className="font-medium">{assessment.medicationName}</span>
                      </div>
                      <Badge variant={assessment.continueMedication ? 'default' : 'destructive'}>
                        {assessment.continueMedication ? 'Continue' : 'Discontinue'}
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Assessment Date:</span> {assessment.assessmentDate}
                      </div>
                      <div>
                        <span className="font-medium">Effectiveness:</span> {assessment.effectivenessRating}/10
                      </div>
                      <div>
                        <span className="font-medium">Symptom Improvement:</span> {assessment.symptomImprovement}
                      </div>
                      <div>
                        <span className="font-medium">Side Effects:</span> {assessment.sideEffectsRating}/10
                      </div>
                      <div>
                        <span className="font-medium">Overall Satisfaction:</span> {assessment.overallSatisfaction}/10
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Effective</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Well Tolerated</span>
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
};

export default MedicationTrackingReminders;
