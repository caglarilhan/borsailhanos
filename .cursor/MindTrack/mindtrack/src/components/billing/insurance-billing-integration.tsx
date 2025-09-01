"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  CreditCard, 
  Receipt, 
  FileText,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Users,
  Settings,
  Plus,
  Download,
  Upload,
  RefreshCw,
  Save,
  Bell,
  BellOff,
  Key,
  Database,
  Server,
  Network,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Info,
  HelpCircle,
  ExternalLink,
  Link,
  LinkBreak,
  GitBranch,
  Layers,
  Filter,
  Search,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Home,
  Menu,
  MoreVertical,
  X,
  Check,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Tag,
  Archive,
  Folder,
  File,
  FilePlus,
  FileMinus,
  FileEdit,
  FileSearch,
  FileDownload,
  FileUpload,
  FileShare,
  FileLock,
  FileUnlock,
  FileHeart,
  FileStar,
  FileAward,
  FileCrown,
  FileZap,
  FileTarget,
  FileShield,
  FileSettings,
  FileInfo,
  FileAlert,
  FileCheckCircle,
  FileXCircle,
  FilePlusCircle,
  FileMinusCircle,
  FileEditCircle,
  FileSearchCircle,
  FileDownloadCircle,
  FileUploadCircle,
  FileShareCircle,
  FileLockCircle,
  FileUnlockCircle,
  FileHeartCircle,
  FileStarCircle,
  FileAwardCircle,
  FileCrownCircle,
  FileZapCircle,
  FileTargetCircle,
  FileShieldCircle,
  FileSettingsCircle,
  FileInfoCircle,
  FileAlertCircle,
  Zap,
  Globe,
  Cpu,
  Memory,
  HardDrive,
  Wifi,
  Cloud,
  BarChart,
  PieChart,
  LineChart,
  ScatterChart,
  AreaChart,
  Table,
  List,
  Grid,
  Columns,
  Rows,
  SortAsc,
  SortDesc
} from "lucide-react";

// Insurance & Billing Integration için interface'ler
interface InsuranceProvider {
  id: string;
  name: string;
  type: 'commercial' | 'medicare' | 'medicaid' | 'tricare' | 'private';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  coverageTypes: string[];
  networkStatus: 'in-network' | 'out-network' | 'both';
  claimProcessingTime: number;
  reimbursementRate: number;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InsuranceVerification {
  id: string;
  patientId: string;
  providerId: string;
  policyNumber: string;
  groupNumber: string;
  subscriberName: string;
  relationship: 'self' | 'spouse' | 'child' | 'dependent';
  effectiveDate: Date;
  expirationDate: Date;
  benefits: {
    deductible: number;
    copay: number;
    coinsurance: number;
    outOfPocketMax: number;
    mentalHealthCoverage: boolean;
    sessionLimit: number;
  };
  status: 'verified' | 'pending' | 'failed' | 'expired';
  verifiedAt: Date;
  verifiedBy: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Claim {
  id: string;
  patientId: string;
  providerId: string;
  insuranceId: string;
  serviceDate: Date;
  cptCode: string;
  icd10Code: string;
  diagnosis: string;
  procedure: string;
  amount: number;
  copay: number;
  deductible: number;
  coinsurance: number;
  totalBilled: number;
  totalPaid: number;
  status: 'submitted' | 'processing' | 'approved' | 'denied' | 'paid' | 'appealed';
  submittedAt: Date;
  processedAt: Date;
  paidAt: Date;
  denialReason: string;
  appealDeadline: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BillingCode {
  id: string;
  code: string;
  description: string;
  category: 'evaluation' | 'therapy' | 'medication' | 'testing' | 'consultation';
  typicalDuration: number;
  typicalFee: number;
  insuranceCoverage: {
    medicare: boolean;
    medicaid: boolean;
    commercial: boolean;
  };
  requirements: string[];
  documentation: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Payment {
  id: string;
  claimId: string;
  patientId: string;
  amount: number;
  method: 'insurance' | 'patient' | 'third-party';
  status: 'pending' | 'processed' | 'completed' | 'failed' | 'refunded';
  processedAt: Date;
  referenceNumber: string;
  notes: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Insurance & Billing Integration Component
export function InsuranceBillingIntegration() {
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([]);
  const [verifications, setVerifications] = useState<InsuranceVerification[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [billingCodes, setBillingCodes] = useState<BillingCode[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [overallBillingEfficiency, setOverallBillingEfficiency] = useState(94.2);

  // Mock data initialization
  useEffect(() => {
    const mockInsuranceProviders: InsuranceProvider[] = [
      {
        id: '1',
        name: 'Blue Cross Blue Shield',
        type: 'commercial',
        status: 'active',
        coverageTypes: ['Mental Health', 'Substance Abuse', 'Prescription Drugs'],
        networkStatus: 'in-network',
        claimProcessingTime: 14,
        reimbursementRate: 85,
        contactInfo: {
          phone: '1-800-555-0123',
          email: 'provider@bcbs.com',
          website: 'https://www.bcbs.com'
        },
        createdBy: 'billing-admin@mindtrack.com',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockVerifications: InsuranceVerification[] = [
      {
        id: '1',
        patientId: 'patient_123',
        providerId: '1',
        policyNumber: 'BCBS123456789',
        groupNumber: 'GRP001',
        subscriberName: 'John Smith',
        relationship: 'self',
        effectiveDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        benefits: {
          deductible: 1000,
          copay: 25,
          coinsurance: 20,
          outOfPocketMax: 5000,
          mentalHealthCoverage: true,
          sessionLimit: 20
        },
        status: 'verified',
        verifiedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        verifiedBy: 'billing-system@mindtrack.com',
        createdBy: 'dr.smith@mindtrack.com',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockClaims: Claim[] = [
      {
        id: '1',
        patientId: 'patient_123',
        providerId: '1',
        insuranceId: '1',
        serviceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        cptCode: '90837',
        icd10Code: 'F41.1',
        diagnosis: 'Generalized Anxiety Disorder',
        procedure: 'Psychotherapy, 60 minutes',
        amount: 200,
        copay: 25,
        deductible: 0,
        coinsurance: 35,
        totalBilled: 200,
        totalPaid: 140,
        status: 'paid',
        submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        processedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        denialReason: '',
        appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: 'dr.smith@mindtrack.com',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockBillingCodes: BillingCode[] = [
      {
        id: '1',
        code: '90837',
        description: 'Psychotherapy, 60 minutes',
        category: 'therapy',
        typicalDuration: 60,
        typicalFee: 200,
        insuranceCoverage: {
          medicare: true,
          medicaid: true,
          commercial: true
        },
        requirements: ['Documentation of session', 'Progress notes'],
        documentation: ['session_notes.pdf', 'progress_report.pdf'],
        createdBy: 'billing-admin@mindtrack.com',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockPayments: Payment[] = [
      {
        id: '1',
        claimId: '1',
        patientId: 'patient_123',
        amount: 140,
        method: 'insurance',
        status: 'completed',
        processedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        referenceNumber: 'PAY123456789',
        notes: 'Insurance payment for psychotherapy session',
        createdBy: 'billing-system@mindtrack.com',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    setInsuranceProviders(mockInsuranceProviders);
    setVerifications(mockVerifications);
    setClaims(mockClaims);
    setBillingCodes(mockBillingCodes);
    setPayments(mockPayments);
  }, []);

  // Calculate billing metrics
  const calculateBillingMetrics = useCallback(() => {
    const totalClaims = claims.length;
    const paidClaims = claims.filter(claim => claim.status === 'paid').length;
    const totalProviders = insuranceProviders.length;
    const activeProviders = insuranceProviders.filter(provider => provider.status === 'active').length;
    const totalVerifications = verifications.length;
    const verifiedInsurances = verifications.filter(verification => verification.status === 'verified').length;
    
    return {
      totalClaims,
      paidClaims,
      claimPaymentRate: totalClaims > 0 ? Math.round((paidClaims / totalClaims) * 100) : 0,
      totalProviders,
      activeProviders,
      providerActivationRate: totalProviders > 0 ? Math.round((activeProviders / totalProviders) * 100) : 0,
      totalVerifications,
      verifiedInsurances,
      verificationRate: totalVerifications > 0 ? Math.round((verifiedInsurances / totalVerifications) * 100) : 0
    };
  }, [claims, insuranceProviders, verifications]);

  const metrics = calculateBillingMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">💰 Insurance & Billing Integration</h2>
          <p className="text-gray-600">Comprehensive insurance verification and billing management for American psychiatrists</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <DollarSign className="h-3 w-3 mr-1" />
            {metrics.paidClaims} Paid Claims
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <ShieldCheck className="h-3 w-3 mr-1" />
            {overallBillingEfficiency}% Efficiency
          </Badge>
        </div>
      </div>

      {/* Billing Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Claims Processing</CardTitle>
            <Receipt className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.paidClaims}</div>
            <p className="text-xs text-green-700">
              {metrics.totalClaims} total claims
            </p>
            <Progress value={metrics.claimPaymentRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Insurance Providers</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.activeProviders}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalProviders} total providers
            </p>
            <Progress value={metrics.providerActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Insurance Verification</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.verifiedInsurances}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalVerifications} total verifications
            </p>
            <Progress value={metrics.verificationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Billing Codes</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{billingCodes.length}</div>
            <p className="text-xs text-orange-700">
              active codes
            </p>
            <Progress value={100} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Insurance Providers */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">Insurance Providers</span>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Commercial, Medicare, Medicaid, and Private Insurance Networks
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {insuranceProviders.map((provider) => (
              <div key={provider.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">{provider.name}</div>
                    <div className="text-sm text-blue-600">{provider.type} • {provider.networkStatus}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={provider.status === 'active' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {provider.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {provider.reimbursementRate}% Rate
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Coverage Details</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Type: {provider.type}</div>
                      <div>Network: {provider.networkStatus}</div>
                      <div>Processing Time: {provider.claimProcessingTime} days</div>
                      <div>Reimbursement: {provider.reimbursementRate}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Coverage Types</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      {provider.coverageTypes.map((type, index) => (
                        <div key={index}>• {type}</div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Contact Information</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Phone: {provider.contactInfo.phone}</div>
                      <div>Email: {provider.contactInfo.email}</div>
                      <div>Website: {provider.contactInfo.website}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

