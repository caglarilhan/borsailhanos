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
  Dna, 
  TestTube, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Calendar,
  DollarSign,
  Shield,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  Edit,
  Trash2,
  Microscope,
  Database,
  Target,
  Gauge,
  Scale,
  FileWarning,
  AlertCircle,
  AlertOctagon,
  Info,
  ActivitySquare,
  TrendingDown,
  CheckCircle as CheckCircleIcon,
  XCircle,
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
  AlertOctagon as AlertOctagonIcon2,
  Settings,
  Phone,
  Mail,
  MessageSquare,
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
  Smartphone as Mobile
} from "lucide-react";

interface GeneticTest {
  id: string;
  testName: string;
  testCategory: string;
  testDescription: string;
  clinicalIndications: string[];
  methodology: string;
  turnaroundTimeDays: number;
  costRange: string;
  insuranceCoverage: boolean;
  fdaApproved: boolean;
  clinicalUtilityScore: number;
  evidenceLevel: string;
}

interface PatientGeneticTest {
  id: string;
  patientId: string;
  testTypeId: string;
  orderDate: string;
  orderStatus: 'pending' | 'ordered' | 'collected' | 'processing' | 'completed' | 'cancelled';
  collectionDate?: string;
  labName: string;
  testCost: number;
  insuranceCovered: boolean;
  insuranceCoverageAmount: number;
  patientCost: number;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'denied';
  clinicalIndication: string;
  physicianNotes: string;
  informedConsentSigned: boolean;
  consentDate?: string;
}

interface GeneticTestResult {
  id: string;
  patientTestId: string;
  resultDate: string;
  resultStatus: 'pending' | 'positive' | 'negative' | 'inconclusive' | 'error';
  rawResults: any;
  interpretedResults: any;
  variantAnalysis: any;
  riskAssessment: any;
  clinicalRecommendations: string[];
  pharmacogeneticImplications: any;
  familyImplications: string;
  followUpRecommendations: string[];
  resultSummary: string;
  labReportUrl: string;
  reviewedBy: string;
  reviewDate: string;
}

interface PharmacogeneticVariant {
  id: string;
  geneName: string;
  variantName: string;
  rsId: string;
  chromosome: string;
  position: number;
  referenceAllele: string;
  alternateAllele: string;
  variantType: string;
  clinicalSignificance: string;
  drugImplications: any;
  dosageRecommendations: any;
  contraindications: string[];
  monitoringRecommendations: string[];
  evidenceLevel: string;
}

interface PatientGeneticVariant {
  id: string;
  patientId: string;
  variantId: string;
  genotype: string;
  alleleFrequency: number;
  zygosity: string;
  clinicalRelevance: string;
  drugImplications: any;
  dosageAdjustments: any;
  monitoringRequired: boolean;
  notes: string;
}

interface GeneticCounselingSession {
  id: string;
  patientId: string;
  counselorId: string;
  sessionDate: string;
  sessionType: string;
  sessionDurationMinutes: number;
  sessionNotes: string;
  patientConcerns: string[];
  familyHistoryReviewed: boolean;
  riskAssessmentDiscussed: boolean;
  testingOptionsDiscussed: boolean;
  informedConsentDiscussed: boolean;
  followUpPlan: string;
  nextSessionDate?: string;
}

interface GeneticTestAlert {
  id: string;
  patientId: string;
  alertType: string;
  alertMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  actionDescription: string;
  alertDate: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'escalated';
  acknowledgedBy?: string;
  acknowledgedDate?: string;
}

const AdvancedGeneticTests: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for genetic tests
  const mockGeneticTests: GeneticTest[] = [
    {
      id: "1",
      testName: "CYP2D6 Genotyping",
      testCategory: "Pharmacogenetic",
      testDescription: "Analysis of CYP2D6 gene variants affecting drug metabolism",
      clinicalIndications: ["Antidepressant selection", "Dosage optimization", "Adverse drug reaction risk"],
      methodology: "Next-generation sequencing",
      turnaroundTimeDays: 7,
      costRange: "$200-400",
      insuranceCoverage: true,
      fdaApproved: true,
      clinicalUtilityScore: 8,
      evidenceLevel: "Strong"
    },
    {
      id: "2",
      testName: "CYP2C19 Genotyping",
      testCategory: "Pharmacogenetic",
      testDescription: "Analysis of CYP2C19 gene variants affecting SSRI metabolism",
      clinicalIndications: ["SSRI response prediction", "Dosage adjustment", "Treatment resistance"],
      methodology: "PCR-based genotyping",
      turnaroundTimeDays: 5,
      costRange: "$150-300",
      insuranceCoverage: true,
      fdaApproved: true,
      clinicalUtilityScore: 7,
      evidenceLevel: "Moderate"
    },
    {
      id: "3",
      testName: "SLC6A4 Polymorphism",
      testCategory: "Pharmacogenetic",
      testDescription: "Serotonin transporter gene variant analysis",
      clinicalIndications: ["SSRI response prediction", "Side effect risk assessment"],
      methodology: "Real-time PCR",
      turnaroundTimeDays: 3,
      costRange: "$100-200",
      insuranceCoverage: false,
      fdaApproved: false,
      clinicalUtilityScore: 6,
      evidenceLevel: "Limited"
    }
  ];

  // Mock data for patient genetic tests
  const mockPatientTests: PatientGeneticTest[] = [
    {
      id: "1",
      patientId: "patient-1",
      testTypeId: "1",
      orderDate: "2024-01-10",
      orderStatus: "completed",
      collectionDate: "2024-01-12",
      labName: "LabCorp Genetics",
      testCost: 350,
      insuranceCovered: true,
      insuranceCoverageAmount: 280,
      patientCost: 70,
      paymentStatus: "paid",
      clinicalIndication: "Poor response to sertraline",
      physicianNotes: "Patient has been on sertraline for 6 weeks with minimal improvement",
      informedConsentSigned: true,
      consentDate: "2024-01-10"
    },
    {
      id: "2",
      patientId: "patient-2",
      testTypeId: "2",
      orderDate: "2024-01-15",
      orderStatus: "processing",
      labName: "Quest Diagnostics",
      testCost: 250,
      insuranceCovered: true,
      insuranceCoverageAmount: 200,
      patientCost: 50,
      paymentStatus: "paid",
      clinicalIndication: "Escitalopram side effects",
      physicianNotes: "Patient experiencing significant side effects on escitalopram",
      informedConsentSigned: true,
      consentDate: "2024-01-15"
    }
  ];

  // Mock data for genetic test results
  const mockTestResults: GeneticTestResult[] = [
    {
      id: "1",
      patientTestId: "1",
      resultDate: "2024-01-17",
      resultStatus: "positive",
      rawResults: { "CYP2D6": "CYP2D6*2/*4" },
      interpretedResults: { "phenotype": "Intermediate metabolizer" },
      variantAnalysis: { "variants": ["CYP2D6*2", "CYP2D6*4"] },
      riskAssessment: { "risk_level": "moderate", "risk_factors": ["reduced_metabolism"] },
      clinicalRecommendations: [
        "Consider alternative antidepressant",
        "Monitor for side effects",
        "Start with lower dose if using CYP2D6 substrates"
      ],
      pharmacogeneticImplications: {
        "sertraline": "Reduced metabolism, consider alternative",
        "paroxetine": "Reduced metabolism, consider alternative",
        "fluoxetine": "Reduced metabolism, monitor closely"
      },
      familyImplications: "Family members may have similar genetic profile",
      followUpRecommendations: [
        "Switch to non-CYP2D6 substrate",
        "Monitor for side effects",
        "Consider family testing"
      ],
      resultSummary: "Patient is an intermediate metabolizer of CYP2D6 substrates",
      labReportUrl: "https://labcorp.com/reports/genetic-test-12345",
      reviewedBy: "Dr. Smith",
      reviewDate: "2024-01-18"
    }
  ];

  // Mock data for pharmacogenetic variants
  const mockVariants: PharmacogeneticVariant[] = [
    {
      id: "1",
      geneName: "CYP2D6",
      variantName: "CYP2D6*2",
      rsId: "rs16947",
      chromosome: "22",
      position: 42522613,
      referenceAllele: "G",
      alternateAllele: "A",
      variantType: "SNP",
      clinicalSignificance: "Reduced function",
      drugImplications: {
        "sertraline": "Reduced metabolism",
        "paroxetine": "Reduced metabolism",
        "fluoxetine": "Reduced metabolism"
      },
      dosageRecommendations: {
        "sertraline": "Consider alternative or lower dose",
        "paroxetine": "Consider alternative or lower dose",
        "fluoxetine": "Monitor closely, consider lower dose"
      },
      contraindications: ["High dose CYP2D6 substrates"],
      monitoringRecommendations: [
        "Monitor for side effects",
        "Check drug levels if available",
        "Monitor therapeutic response"
      ],
      evidenceLevel: "Strong"
    }
  ];

  // Mock data for patient genetic variants
  const mockPatientVariants: PatientGeneticVariant[] = [
    {
      id: "1",
      patientId: "patient-1",
      variantId: "1",
      genotype: "CYP2D6*2/*4",
      alleleFrequency: 0.15,
      zygosity: "heterozygous",
      clinicalRelevance: "intermediate_metabolizer",
      drugImplications: {
        "sertraline": "Reduced metabolism",
        "paroxetine": "Reduced metabolism"
      },
      dosageAdjustments: {
        "sertraline": "Consider 50% dose reduction",
        "paroxetine": "Consider alternative medication"
      },
      monitoringRequired: true,
      notes: "Patient shows intermediate metabolism of CYP2D6 substrates"
    }
  ];

  // Mock data for genetic counseling sessions
  const mockCounselingSessions: GeneticCounselingSession[] = [
    {
      id: "1",
      patientId: "patient-1",
      counselorId: "counselor-1",
      sessionDate: "2024-01-09",
      sessionType: "Pre-test counseling",
      sessionDurationMinutes: 45,
      sessionNotes: "Discussed genetic testing options and implications",
      patientConcerns: ["Privacy concerns", "Insurance coverage", "Family implications"],
      familyHistoryReviewed: true,
      riskAssessmentDiscussed: true,
      testingOptionsDiscussed: true,
      informedConsentDiscussed: true,
      followUpPlan: "Schedule post-test counseling session",
      nextSessionDate: "2024-01-20"
    }
  ];

  // Mock data for genetic test alerts
  const mockAlerts: GeneticTestAlert[] = [
    {
      id: "1",
      patientId: "patient-1",
      alertType: "test_result_available",
      alertMessage: "Genetic test results are available for review",
      severity: "medium",
      actionRequired: true,
      actionDescription: "Review and interpret genetic test results",
      alertDate: "2024-01-17T10:30:00Z",
      status: "active"
    },
    {
      id: "2",
      patientId: "patient-2",
      alertType: "high_risk_variant",
      alertMessage: "High-risk genetic variant detected",
      severity: "high",
      actionRequired: true,
      actionDescription: "Immediate clinical review required",
      alertDate: "2024-01-16T14:15:00Z",
      status: "active"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'positive':
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
      case 'negative':
      case 'denied':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'inconclusive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
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

  const totalTests = mockPatientTests.length;
  const completedTests = mockPatientTests.filter(test => test.orderStatus === 'completed').length;
  const pendingTests = mockPatientTests.filter(test => test.orderStatus === 'pending' || test.orderStatus === 'processing').length;
  const positiveResults = mockTestResults.filter(result => result.resultStatus === 'positive').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Genetic Tests</h1>
          <p className="text-muted-foreground">
            Comprehensive genetic testing management and pharmacogenetic analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Order Test
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-muted-foreground">
              Genetic tests ordered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTests}</div>
            <p className="text-xs text-muted-foreground">
              Results available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTests}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting results
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Results</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positiveResults}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="test-catalog">Test Catalog</TabsTrigger>
          <TabsTrigger value="patient-tests">Patient Tests</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="counseling">Counseling</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.severity)}
                        <span className="text-sm font-medium">{alert.alertType}</span>
                      </div>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
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
                      <span className="text-sm">New genetic test ordered</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Test results available</span>
                    </div>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileWarning className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">High-risk variant detected</span>
                    </div>
                    <span className="text-xs text-muted-foreground">3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test-catalog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genetic Test Catalog</CardTitle>
              <CardDescription>
                Available genetic tests and their clinical utility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockGeneticTests.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Dna className="h-4 w-4" />
                        <span className="font-medium">{test.testName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{test.testCategory}</Badge>
                        <Badge className={test.fdaApproved ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                          {test.fdaApproved ? 'FDA Approved' : 'Not FDA Approved'}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Description:</span> {test.testDescription}
                      </div>
                      <div>
                        <span className="font-medium">Methodology:</span> {test.methodology}
                      </div>
                      <div>
                        <span className="font-medium">Turnaround Time:</span> {test.turnaroundTimeDays} days
                      </div>
                      <div>
                        <span className="font-medium">Cost Range:</span> {test.costRange}
                      </div>
                      <div>
                        <span className="font-medium">Insurance Coverage:</span> {test.insuranceCoverage ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className="font-medium">Clinical Utility Score:</span> {test.clinicalUtilityScore}/10
                      </div>
                      <div>
                        <span className="font-medium">Evidence Level:</span> {test.evidenceLevel}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Clinical Indications:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {test.clinicalIndications.map((indication, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {indication}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patient-tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Genetic Tests</CardTitle>
              <CardDescription>
                Track genetic test orders and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPatientTests.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TestTube className="h-4 w-4" />
                        <span className="font-medium">Test #{test.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(test.orderStatus)}>
                          {test.orderStatus}
                        </Badge>
                        <Badge variant={test.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {test.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Lab:</span> {test.labName}
                      </div>
                      <div>
                        <span className="font-medium">Order Date:</span> {test.orderDate}
                      </div>
                      <div>
                        <span className="font-medium">Test Cost:</span> ${test.testCost}
                      </div>
                      <div>
                        <span className="font-medium">Patient Cost:</span> ${test.patientCost}
                      </div>
                      <div>
                        <span className="font-medium">Clinical Indication:</span> {test.clinicalIndication}
                      </div>
                      <div>
                        <span className="font-medium">Informed Consent:</span> {test.informedConsentSigned ? 'Signed' : 'Not Signed'}
                      </div>
                    </div>
                    {test.physicianNotes && (
                      <div className="mt-3">
                        <span className="font-medium">Physician Notes:</span> {test.physicianNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genetic Test Results</CardTitle>
              <CardDescription>
                Interpreted genetic test results and clinical implications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTestResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Result #{result.id}</span>
                      </div>
                      <Badge className={getStatusColor(result.resultStatus)}>
                        {result.resultStatus}
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Result Date:</span> {result.resultDate}
                      </div>
                      <div>
                        <span className="font-medium">Reviewed By:</span> {result.reviewedBy}
                      </div>
                      <div>
                        <span className="font-medium">Review Date:</span> {result.reviewDate}
                      </div>
                      <div>
                        <span className="font-medium">Risk Level:</span> {result.riskAssessment.risk_level}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Result Summary:</span> {result.resultSummary}
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Clinical Recommendations:</span>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        {result.clinicalRecommendations.map((rec, index) => (
                          <li key={index} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Pharmacogenetic Implications:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(result.pharmacogeneticImplications).map(([drug, implication]) => (
                          <div key={drug} className="text-sm">
                            <span className="font-medium">{drug}:</span> {implication}
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

        <TabsContent value="variants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pharmacogenetic Variants</CardTitle>
              <CardDescription>
                Patient-specific genetic variants and their clinical implications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPatientVariants.map((variant) => (
                  <div key={variant.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Dna className="h-4 w-4" />
                        <span className="font-medium">{variant.genotype}</span>
                      </div>
                      <Badge className={variant.monitoringRequired ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}>
                        {variant.monitoringRequired ? 'Monitoring Required' : 'No Monitoring'}
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Zygosity:</span> {variant.zygosity}
                      </div>
                      <div>
                        <span className="font-medium">Allele Frequency:</span> {(variant.alleleFrequency * 100).toFixed(1)}%
                      </div>
                      <div>
                        <span className="font-medium">Clinical Relevance:</span> {variant.clinicalRelevance}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Drug Implications:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(variant.drugImplications).map(([drug, implication]) => (
                          <div key={drug} className="text-sm">
                            <span className="font-medium">{drug}:</span> {implication}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Dosage Adjustments:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(variant.dosageAdjustments).map(([drug, adjustment]) => (
                          <div key={drug} className="text-sm">
                            <span className="font-medium">{drug}:</span> {adjustment}
                          </div>
                        ))}
                      </div>
                    </div>
                    {variant.notes && (
                      <div className="mt-3">
                        <span className="font-medium">Notes:</span> {variant.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="counseling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genetic Counseling Sessions</CardTitle>
              <CardDescription>
                Track genetic counseling sessions and patient education
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCounselingSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{session.sessionType}</span>
                      </div>
                      <Badge variant="outline">{session.sessionDurationMinutes} min</Badge>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Session Date:</span> {session.sessionDate}
                      </div>
                      <div>
                        <span className="font-medium">Next Session:</span> {session.nextSessionDate || 'Not scheduled'}
                      </div>
                      <div>
                        <span className="font-medium">Family History Reviewed:</span> {session.familyHistoryReviewed ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className="font-medium">Risk Assessment Discussed:</span> {session.riskAssessmentDiscussed ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className="font-medium">Testing Options Discussed:</span> {session.testingOptionsDiscussed ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className="font-medium">Informed Consent Discussed:</span> {session.informedConsentDiscussed ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Patient Concerns:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {session.patientConcerns.map((concern, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {concern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {session.sessionNotes && (
                      <div className="mt-3">
                        <span className="font-medium">Session Notes:</span> {session.sessionNotes}
                      </div>
                    )}
                    {session.followUpPlan && (
                      <div className="mt-3">
                        <span className="font-medium">Follow-up Plan:</span> {session.followUpPlan}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genetic Test Alerts</CardTitle>
              <CardDescription>
                Active alerts for genetic tests requiring attention
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
      </Tabs>
    </div>
  );
};

export default AdvancedGeneticTests;
