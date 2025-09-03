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
  Shield, 
  Activity, 
  Clock, 
  Users, 
  FileText, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  Edit,
  Trash2,
  Zap,
  Heart,
  Brain,
  Pill,
  TestTube,
  Stethoscope,
  Microscope,
  Database,
  Bell,
  Settings,
  BarChart3,
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  FileWarning,
  ActivitySquare
} from "lucide-react";

interface DrugInteraction {
  id: string;
  drug1Name: string;
  drug2Name: string;
  interactionType: 'major' | 'moderate' | 'minor';
  severityLevel: 'high' | 'medium' | 'low';
  mechanism: string;
  clinicalSignificance: string;
  managementRecommendations: string;
  evidenceLevel: 'strong' | 'moderate' | 'weak';
}

interface DrugAllergy {
  id: string;
  drugName: string;
  allergyType: 'true_allergy' | 'intolerance' | 'sensitivity';
  reactionType: string;
  severity: 'mild' | 'moderate' | 'severe';
  onsetDate: string;
  notes: string;
  confirmedBy: string;
}

interface DrugContraindication {
  id: string;
  drugName: string;
  conditionType: 'disease' | 'age_group' | 'pregnancy' | 'organ_function';
  conditionName: string;
  contraindicationType: 'absolute' | 'relative';
  reason: string;
  alternatives: string;
}

interface SafetyAlert {
  id: string;
  drugName: string;
  alertType: 'black_box' | 'boxed_warning' | 'fda_alert' | 'recall';
  alertLevel: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  effectiveDate: string;
  source: string;
  actionRequired: boolean;
}

interface PatientDrugAlert {
  id: string;
  alertType: 'interaction' | 'allergy' | 'contraindication' | 'safety';
  alertMessage: string;
  severity: 'high' | 'medium' | 'low';
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
}

const DrugInteractionsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for drug interactions
  const mockDrugInteractions: DrugInteraction[] = [
    {
      id: "1",
      drug1Name: "Sertraline",
      drug2Name: "Warfarin",
      interactionType: "major",
      severityLevel: "high",
      mechanism: "Sertraline may increase the anticoagulant effect of warfarin by inhibiting platelet aggregation",
      clinicalSignificance: "Increased risk of bleeding, monitor INR closely",
      managementRecommendations: "Monitor INR more frequently, consider dose adjustment",
      evidenceLevel: "strong"
    },
    {
      id: "2",
      drug1Name: "Bupropion",
      drug2Name: "Ritonavir",
      interactionType: "moderate",
      severityLevel: "medium",
      mechanism: "Ritonavir increases bupropion levels by inhibiting CYP2B6",
      clinicalSignificance: "Increased risk of seizures and other adverse effects",
      managementRecommendations: "Consider reducing bupropion dose by 50%",
      evidenceLevel: "moderate"
    },
    {
      id: "3",
      drug1Name: "Escitalopram",
      drug2Name: "Aspirin",
      interactionType: "minor",
      severityLevel: "low",
      mechanism: "Increased risk of bleeding when combined",
      clinicalSignificance: "Monitor for signs of bleeding",
      managementRecommendations: "Monitor closely, consider alternative if significant bleeding risk",
      evidenceLevel: "weak"
    }
  ];

  const mockDrugAllergies: DrugAllergy[] = [
    {
      id: "1",
      drugName: "Citalopram",
      allergyType: "true_allergy",
      reactionType: "Rash and angioedema",
      severity: "moderate",
      onsetDate: "2023-01-15",
      notes: "Patient developed rash within 24 hours of starting citalopram",
      confirmedBy: "Dr. Smith"
    },
    {
      id: "2",
      drugName: "Venlafaxine",
      allergyType: "intolerance",
      reactionType: "Severe nausea and vomiting",
      severity: "mild",
      onsetDate: "2023-03-20",
      notes: "Patient unable to tolerate even low doses",
      confirmedBy: "Dr. Johnson"
    }
  ];

  const mockSafetyAlerts: SafetyAlert[] = [
    {
      id: "1",
      drugName: "Clozapine",
      alertType: "black_box",
      alertLevel: "critical",
      title: "Agranulocytosis Risk",
      description: "Clozapine can cause agranulocytosis, a potentially fatal condition",
      effectiveDate: "2023-01-01",
      source: "FDA",
      actionRequired: true
    },
    {
      id: "2",
      drugName: "Lithium",
      alertType: "boxed_warning",
      alertLevel: "warning",
      title: "Lithium Toxicity",
      description: "Monitor lithium levels closely to prevent toxicity",
      effectiveDate: "2023-02-01",
      source: "FDA",
      actionRequired: false
    }
  ];

  const mockPatientAlerts: PatientDrugAlert[] = [
    {
      id: "1",
      alertType: "interaction",
      alertMessage: "Drug interaction detected: Sertraline + Warfarin - Increased risk of bleeding",
      severity: "high",
      status: "active",
      createdAt: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      alertType: "allergy",
      alertMessage: "Drug allergy detected: Citalopram - Rash and angioedema",
      severity: "medium",
      status: "acknowledged",
      createdAt: "2024-01-14T14:20:00Z"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
      case 'moderate':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      case 'mild':
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'interaction':
        return <Zap className="h-4 w-4" />;
      case 'allergy':
        return <AlertTriangle className="h-4 w-4" />;
      case 'contraindication':
        return <XCircle className="h-4 w-4" />;
      case 'safety':
        return <Shield className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drug Interactions & Safety</h1>
          <p className="text-muted-foreground">
            Comprehensive drug interaction checking, allergy management, and safety monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Check Interactions
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drug Interactions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 high severity
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allergies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              Across all patients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              Excellent safety rating
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="safety-alerts">Safety Alerts</TabsTrigger>
          <TabsTrigger value="patient-alerts">Patient Alerts</TabsTrigger>
          <TabsTrigger value="history">Check History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertOctagon className="h-5 w-5 text-red-500" />
                  Critical Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPatientAlerts.filter(alert => alert.severity === 'high').map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.alertType)}
                        <span className="text-sm font-medium">{alert.alertMessage}</span>
                      </div>
                      <Badge variant="destructive">Critical</Badge>
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
                    <span className="text-sm">Interaction check completed</span>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New allergy recorded</span>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Safety alert acknowledged</span>
                    <span className="text-xs text-muted-foreground">3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drug Interactions Database</CardTitle>
              <CardDescription>
                Comprehensive database of drug-drug interactions with severity levels and management recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDrugInteractions.map((interaction) => (
                  <div key={interaction.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        <span className="font-medium">{interaction.drug1Name} + {interaction.drug2Name}</span>
                      </div>
                      <Badge className={getSeverityColor(interaction.severityLevel)}>
                        {interaction.severityLevel} severity
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div>
                        <span className="font-medium">Mechanism:</span> {interaction.mechanism}
                      </div>
                      <div>
                        <span className="font-medium">Clinical Significance:</span> {interaction.clinicalSignificance}
                      </div>
                      <div>
                        <span className="font-medium">Management:</span> {interaction.managementRecommendations}
                      </div>
                      <div>
                        <span className="font-medium">Evidence Level:</span> {interaction.evidenceLevel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allergies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Drug Allergies</CardTitle>
              <CardDescription>
                Track and manage patient drug allergies and intolerances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDrugAllergies.map((allergy) => (
                  <div key={allergy.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">{allergy.drugName}</span>
                      </div>
                      <Badge className={getSeverityColor(allergy.severity)}>
                        {allergy.severity}
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div>
                        <span className="font-medium">Reaction:</span> {allergy.reactionType}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {allergy.allergyType}
                      </div>
                      <div>
                        <span className="font-medium">Onset:</span> {allergy.onsetDate}
                      </div>
                      <div>
                        <span className="font-medium">Notes:</span> {allergy.notes}
                      </div>
                      <div>
                        <span className="font-medium">Confirmed by:</span> {allergy.confirmedBy}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety-alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drug Safety Alerts</CardTitle>
              <CardDescription>
                FDA alerts, black box warnings, and manufacturer safety notices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSafetyAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileWarning className="h-4 w-4" />
                        <span className="font-medium">{alert.drugName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.alertLevel)}>
                          {alert.alertLevel}
                        </Badge>
                        {alert.actionRequired && (
                          <Badge variant="destructive">Action Required</Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div>
                        <span className="font-medium">Title:</span> {alert.title}
                      </div>
                      <div>
                        <span className="font-medium">Description:</span> {alert.description}
                      </div>
                      <div>
                        <span className="font-medium">Source:</span> {alert.source}
                      </div>
                      <div>
                        <span className="font-medium">Effective Date:</span> {alert.effectiveDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patient-alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient-Specific Alerts</CardTitle>
              <CardDescription>
                Active alerts for current patients requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPatientAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.alertType)}
                        <span className="text-sm">{alert.alertMessage}</span>
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
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(alert.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interaction Check History</CardTitle>
              <CardDescription>
                Historical record of all drug interaction checks performed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Check Date: January 15, 2024</span>
                    </div>
                    <Badge>Completed</Badge>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div>Medications Checked: 5</div>
                    <div>Interactions Found: 2</div>
                    <div>Allergies Found: 1</div>
                    <div>Contraindications Found: 0</div>
                    <div>Safety Alerts Found: 1</div>
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

export default DrugInteractionsManagement;
