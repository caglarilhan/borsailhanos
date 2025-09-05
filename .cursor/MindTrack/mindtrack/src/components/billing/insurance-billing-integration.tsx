'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Shield, 
  FileText, 
  DollarSign, 
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
  Activity,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Globe,
  Building,
  Receipt,
  Wallet
} from 'lucide-react';

// Interfaces
interface InsuranceProvider {
  id: string;
  provider_name: string;
  provider_code: string;
  provider_type: string;
  plan_name?: string;
  plan_type?: string;
  coverage_area: string;
  mental_health_coverage: boolean;
  substance_abuse_coverage: boolean;
  telehealth_coverage: boolean;
  prior_auth_required: boolean;
  session_limit_per_year?: number;
  copay_amount?: number;
  coinsurance_percentage?: number;
  is_active: boolean;
}

interface PatientInsuranceCoverage {
  id: string;
  patient_id: string;
  insurance_provider_id: string;
  policy_number: string;
  group_number?: string;
  subscriber_name?: string;
  subscriber_relationship?: string;
  effective_date: string;
  expiration_date?: string;
  is_primary: boolean;
  is_active: boolean;
  verification_status: string;
  copay_amount?: number;
  deductible_remaining?: number;
  session_count_used: number;
  session_limit?: number;
  eligibility_status: string;
}

interface PriorAuthorizationRequest {
  id: string;
  patient_id: string;
  insurance_provider_id: string;
  provider_id: string;
  request_type: string;
  service_type: string;
  diagnosis_codes: string[];
  procedure_codes: string[];
  requested_sessions: number;
  clinical_justification: string;
  request_status: string;
  submission_date: string;
  decision_date?: string;
  approved_sessions?: number;
  denial_reason?: string;
  appeal_submitted: boolean;
  external_reference_id?: string;
}

interface InsuranceClaim {
  id: string;
  patient_id: string;
  insurance_provider_id: string;
  provider_id: string;
  claim_number: string;
  claim_type: string;
  service_date: string;
  diagnosis_codes: string[];
  procedure_codes: string[];
  billed_amount: number;
  allowed_amount?: number;
  copay_amount?: number;
  deductible_amount?: number;
  coinsurance_amount?: number;
  patient_responsibility?: number;
  insurance_payment?: number;
  claim_status: string;
  submission_date: string;
  payment_date?: string;
  denial_reason?: string;
  external_claim_id?: string;
}

interface CopayCollection {
  id: string;
  patient_id: string;
  session_id?: string;
  claim_id?: string;
  copay_amount: number;
  collection_method?: string;
  collection_date?: string;
  collection_status: string;
  payment_reference?: string;
  waived_reason?: string;
  written_off_reason?: string;
}

interface ClaimDenial {
  id: string;
  claim_id: string;
  denial_code: string;
  denial_reason: string;
  denial_category?: string;
  denial_date: string;
  appeal_eligible: boolean;
  appeal_deadline?: string;
  appeal_submitted: boolean;
  appeal_status?: string;
  corrective_action_taken?: string;
}

export function InsuranceBillingIntegration() {
  const [activeTab, setActiveTab] = useState('overview');
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([]);
  const [patientCoverage, setPatientCoverage] = useState<PatientInsuranceCoverage[]>([]);
  const [priorAuthRequests, setPriorAuthRequests] = useState<PriorAuthorizationRequest[]>([]);
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>([]);
  const [copayCollections, setCopayCollections] = useState<CopayCollection[]>([]);
  const [claimDenials, setClaimDenials] = useState<ClaimDenial[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    setInsuranceProviders([
      {
        id: '1',
        provider_name: 'Blue Cross Blue Shield',
        provider_code: 'BCBS',
        provider_type: 'private',
        plan_name: 'PPO Plan',
        plan_type: 'PPO',
        coverage_area: 'national',
        mental_health_coverage: true,
        substance_abuse_coverage: true,
        telehealth_coverage: true,
        prior_auth_required: true,
        session_limit_per_year: 20,
        copay_amount: 25.00,
        coinsurance_percentage: 20.00,
        is_active: true
      },
      {
        id: '2',
        provider_name: 'Medicare',
        provider_code: 'MEDICARE',
        provider_type: 'medicare',
        plan_name: 'Medicare Part B',
        plan_type: 'FFS',
        coverage_area: 'national',
        mental_health_coverage: true,
        substance_abuse_coverage: true,
        telehealth_coverage: true,
        prior_auth_required: false,
        session_limit_per_year: 12,
        copay_amount: 20.00,
        coinsurance_percentage: 20.00,
        is_active: true
      }
    ]);

    setPatientCoverage([
      {
        id: '1',
        patient_id: 'patient-1',
        insurance_provider_id: '1',
        policy_number: 'BCBS123456789',
        group_number: 'GRP001',
        subscriber_name: 'John Doe',
        subscriber_relationship: 'self',
        effective_date: '2024-01-01',
        expiration_date: '2024-12-31',
        is_primary: true,
        is_active: true,
        verification_status: 'verified',
        copay_amount: 25.00,
        deductible_remaining: 500.00,
        session_count_used: 5,
        session_limit: 20,
        eligibility_status: 'active'
      }
    ]);

    setPriorAuthRequests([
      {
        id: '1',
        patient_id: 'patient-1',
        insurance_provider_id: '1',
        provider_id: 'provider-1',
        request_type: 'initial',
        service_type: 'psychiatric_evaluation',
        diagnosis_codes: ['F32.9'],
        procedure_codes: ['99213'],
        requested_sessions: 12,
        clinical_justification: 'Patient presents with major depressive disorder requiring ongoing psychiatric care',
        request_status: 'approved',
        submission_date: '2024-01-15T10:00:00Z',
        decision_date: '2024-01-18T14:30:00Z',
        approved_sessions: 12,
        appeal_submitted: false,
        external_reference_id: 'PA-20240115-001'
      }
    ]);

    setInsuranceClaims([
      {
        id: '1',
        patient_id: 'patient-1',
        insurance_provider_id: '1',
        provider_id: 'provider-1',
        claim_number: 'CLM-20240125-001',
        claim_type: 'professional',
        service_date: '2024-01-25',
        diagnosis_codes: ['F32.9'],
        procedure_codes: ['99213'],
        billed_amount: 150.00,
        allowed_amount: 120.00,
        copay_amount: 25.00,
        deductible_amount: 0.00,
        coinsurance_amount: 19.00,
        patient_responsibility: 44.00,
        insurance_payment: 76.00,
        claim_status: 'paid',
        submission_date: '2024-01-25T16:00:00Z',
        payment_date: '2024-02-05T10:00:00Z',
        external_claim_id: 'BCBS-20240125-001'
      }
    ]);

    setCopayCollections([
      {
        id: '1',
        patient_id: 'patient-1',
        session_id: 'session-1',
        claim_id: '1',
        copay_amount: 25.00,
        collection_method: 'credit_card',
        collection_date: '2024-01-25T16:30:00Z',
        collection_status: 'collected',
        payment_reference: 'TXN-CC-001'
      }
    ]);

    setClaimDenials([
      {
        id: '1',
        claim_id: '1',
        denial_code: 'CO-50',
        denial_reason: 'Service not covered under current plan',
        denial_category: 'medical_necessity',
        denial_date: '2024-01-30T09:00:00Z',
        appeal_eligible: true,
        appeal_deadline: '2024-02-29',
        appeal_submitted: false
      }
    ]);
  }, []);

  const getProviderTypeColor = (type: string) => {
    switch (type) {
      case 'medicare': return 'default';
      case 'medicaid': return 'secondary';
      case 'private': return 'default';
      case 'commercial': return 'default';
      case 'self_pay': return 'destructive';
      default: return 'default';
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'expired': return 'destructive';
      default: return 'default';
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'submitted': return 'secondary';
      case 'under_review': return 'secondary';
      case 'denied': return 'destructive';
      case 'partial_approval': return 'secondary';
      default: return 'default';
    }
  };

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'submitted': return 'secondary';
      case 'processing': return 'secondary';
      case 'pending': return 'secondary';
      case 'denied': return 'destructive';
      case 'appealed': return 'secondary';
      default: return 'default';
    }
  };

  const getCollectionStatusColor = (status: string) => {
    switch (status) {
      case 'collected': return 'default';
      case 'pending': return 'secondary';
      case 'waived': return 'secondary';
      case 'written_off': return 'destructive';
      default: return 'default';
    }
  };

  const getDenialCategoryColor = (category: string) => {
    switch (category) {
      case 'medical_necessity': return 'destructive';
      case 'coding': return 'secondary';
      case 'authorization': return 'secondary';
      case 'eligibility': return 'destructive';
      case 'timely_filing': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Insurance & Billing Integration</h2>
          <p className="text-muted-foreground">
            Comprehensive insurance management, billing, and revenue cycle optimization
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Provider
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Insurance Providers</TabsTrigger>
          <TabsTrigger value="coverage">Patient Coverage</TabsTrigger>
          <TabsTrigger value="prior-auth">Prior Authorization</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="copay">Copay Collection</TabsTrigger>
          <TabsTrigger value="denials">Denial Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Insurance Providers</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insuranceProviders.length}</div>
                <p className="text-xs text-muted-foreground">
                  {insuranceProviders.filter(p => p.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patient Coverage</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patientCoverage.length}</div>
                <p className="text-xs text-muted-foreground">
                  {patientCoverage.filter(c => c.verification_status === 'verified').length} verified
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insuranceClaims.length}</div>
                <p className="text-xs text-muted-foreground">
                  {insuranceClaims.filter(c => c.claim_status === 'paid').length} paid
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insuranceClaims.length > 0 ? Math.round((insuranceClaims.filter(c => c.claim_status === 'paid').length / insuranceClaims.length) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Success rate
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Claims</CardTitle>
                <CardDescription>Latest insurance claims</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insuranceClaims.slice(0, 3).map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{claim.claim_number}</p>
                      <p className="text-xs text-muted-foreground">
                        ${claim.billed_amount} - {claim.service_date}
                      </p>
                    </div>
                    <Badge variant={getClaimStatusColor(claim.claim_status)}>
                      {claim.claim_status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Provider Performance</CardTitle>
                <CardDescription>Insurance provider metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insuranceProviders.slice(0, 3).map((provider) => {
                  const providerClaims = insuranceClaims.filter(c => c.insurance_provider_id === provider.id);
                  const paidClaims = providerClaims.filter(c => c.claim_status === 'paid');
                  const successRate = providerClaims.length > 0 ? Math.round((paidClaims.length / providerClaims.length) * 100) : 0;
                  
                  return (
                    <div key={provider.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{provider.provider_name}</p>
                        <p className="text-xs text-muted-foreground">{providerClaims.length} claims</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{successRate}%</p>
                        <p className="text-xs text-muted-foreground">Success</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Insurance Providers</h3>
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
            {insuranceProviders.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{provider.provider_name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getProviderTypeColor(provider.provider_type)}>
                        {provider.provider_type}
                      </Badge>
                      <Badge variant={provider.is_active ? 'default' : 'secondary'}>
                        {provider.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {provider.provider_code} - {provider.plan_name} ({provider.plan_type})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Coverage Area</p>
                        <p className="text-sm text-muted-foreground">{provider.coverage_area}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Session Limit</p>
                        <p className="text-sm text-muted-foreground">
                          {provider.session_limit_per_year ? `${provider.session_limit_per_year}/year` : 'Unlimited'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Copay</p>
                        <p className="text-sm text-muted-foreground">
                          {provider.copay_amount ? `$${provider.copay_amount}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Coinsurance</p>
                        <p className="text-sm text-muted-foreground">
                          {provider.coinsurance_percentage ? `${provider.coinsurance_percentage}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Coverage:</p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          {provider.mental_health_coverage ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">Mental Health</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {provider.substance_abuse_coverage ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">Substance Abuse</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {provider.telehealth_coverage ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">Telehealth</span>
                        </div>
                      </div>
                    </div>
                    {provider.prior_auth_required && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Prior authorization required after {provider.prior_auth_threshold || 0} sessions
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Patient Insurance Coverage</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Coverage
            </Button>
          </div>

          <div className="grid gap-4">
            {patientCoverage.map((coverage) => (
              <Card key={coverage.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Patient {coverage.patient_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getVerificationStatusColor(coverage.verification_status)}>
                        {coverage.verification_status}
                      </Badge>
                      <Badge variant={coverage.is_primary ? 'default' : 'secondary'}>
                        {coverage.is_primary ? 'Primary' : 'Secondary'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Policy: {coverage.policy_number} - {coverage.effective_date} to {coverage.expiration_date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Subscriber</p>
                        <p className="text-sm text-muted-foreground">
                          {coverage.subscriber_name} ({coverage.subscriber_relationship})
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Group Number</p>
                        <p className="text-sm text-muted-foreground">{coverage.group_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Copay</p>
                        <p className="text-sm text-muted-foreground">
                          {coverage.copay_amount ? `$${coverage.copay_amount}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Deductible Remaining</p>
                        <p className="text-sm text-muted-foreground">
                          {coverage.deductible_remaining ? `$${coverage.deductible_remaining}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Sessions Used</p>
                        <p className="text-sm text-muted-foreground">
                          {coverage.session_count_used}/{coverage.session_limit || 'Unlimited'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Eligibility Status</p>
                        <p className="text-sm text-muted-foreground">{coverage.eligibility_status}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prior-auth" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Prior Authorization Requests</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>

          <div className="grid gap-4">
            {priorAuthRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Patient {request.patient_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getRequestStatusColor(request.request_status)}>
                        {request.request_status}
                      </Badge>
                      <Badge variant="outline">{request.request_type}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {request.service_type} - {request.requested_sessions} sessions requested
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Diagnosis Codes</p>
                        <p className="text-sm text-muted-foreground">{request.diagnosis_codes.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Procedure Codes</p>
                        <p className="text-sm text-muted-foreground">{request.procedure_codes.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Submission Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.submission_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Decision Date</p>
                        <p className="text-sm text-muted-foreground">
                          {request.decision_date ? new Date(request.decision_date).toLocaleDateString() : 'Pending'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Clinical Justification</p>
                      <p className="text-sm text-muted-foreground">{request.clinical_justification}</p>
                    </div>
                    {request.approved_sessions && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          Approved for {request.approved_sessions} sessions
                        </span>
                      </div>
                    )}
                    {request.denial_reason && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Denial Reason: {request.denial_reason}
                        </AlertDescription>
                      </Alert>
                    )}
                    {request.appeal_submitted && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Appeal submitted</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Insurance Claims</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Submit Claim
            </Button>
          </div>

          <div className="grid gap-4">
            {insuranceClaims.map((claim) => (
              <Card key={claim.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{claim.claim_number}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getClaimStatusColor(claim.claim_status)}>
                        {claim.claim_status}
                      </Badge>
                      <Badge variant="outline">{claim.claim_type}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Patient {claim.patient_id} - {claim.service_date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Billed Amount</p>
                        <p className="text-sm text-muted-foreground">${claim.billed_amount}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Allowed Amount</p>
                        <p className="text-sm text-muted-foreground">
                          {claim.allowed_amount ? `$${claim.allowed_amount}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Patient Responsibility</p>
                        <p className="text-sm text-muted-foreground">
                          {claim.patient_responsibility ? `$${claim.patient_responsibility}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Insurance Payment</p>
                        <p className="text-sm text-muted-foreground">
                          {claim.insurance_payment ? `$${claim.insurance_payment}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Submission Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(claim.submission_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Payment Date</p>
                        <p className="text-sm text-muted-foreground">
                          {claim.payment_date ? new Date(claim.payment_date).toLocaleDateString() : 'Pending'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Diagnosis Codes</p>
                      <p className="text-sm text-muted-foreground">{claim.diagnosis_codes.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Procedure Codes</p>
                      <p className="text-sm text-muted-foreground">{claim.procedure_codes.join(', ')}</p>
                    </div>
                    {claim.denial_reason && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Denial Reason: {claim.denial_reason}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="copay" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Copay Collection</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </div>

          <div className="grid gap-4">
            {copayCollections.map((copay) => (
              <Card key={copay.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Patient {copay.patient_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getCollectionStatusColor(copay.collection_status)}>
                        {copay.collection_status}
                      </Badge>
                      <Badge variant="outline">${copay.copay_amount}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {copay.collection_method && `Payment Method: ${copay.collection_method}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Collection Date</p>
                        <p className="text-sm text-muted-foreground">
                          {copay.collection_date ? new Date(copay.collection_date).toLocaleDateString() : 'Pending'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Payment Reference</p>
                        <p className="text-sm text-muted-foreground">
                          {copay.payment_reference || 'N/A'}
                        </p>
                      </div>
                    </div>
                    {copay.waived_reason && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Waived: {copay.waived_reason}
                        </AlertDescription>
                      </Alert>
                    )}
                    {copay.written_off_reason && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Written Off: {copay.written_off_reason}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="denials" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Claim Denials</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Submit Appeal
            </Button>
          </div>

          <div className="grid gap-4">
            {claimDenials.map((denial) => (
              <Card key={denial.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Claim {denial.claim_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getDenialCategoryColor(denial.denial_category || '')}>
                        {denial.denial_category || 'Unknown'}
                      </Badge>
                      <Badge variant={denial.appeal_eligible ? 'default' : 'secondary'}>
                        {denial.appeal_eligible ? 'Appeal Eligible' : 'No Appeal'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Denial Code: {denial.denial_code} - {denial.denial_date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Denial Reason</p>
                      <p className="text-sm text-muted-foreground">{denial.denial_reason}</p>
                    </div>
                    {denial.appeal_deadline && (
                      <div>
                        <p className="text-sm font-medium">Appeal Deadline</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(denial.appeal_deadline).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {denial.corrective_action_taken && (
                      <div>
                        <p className="text-sm font-medium">Corrective Action</p>
                        <p className="text-sm text-muted-foreground">{denial.corrective_action_taken}</p>
                      </div>
                    )}
                    {denial.prevention_measures && (
                      <div>
                        <p className="text-sm font-medium">Prevention Measures</p>
                        <p className="text-sm text-muted-foreground">{denial.prevention_measures}</p>
                      </div>
                    )}
                    {denial.appeal_submitted && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Appeal submitted</span>
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
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Billing performance and revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8" />
                  <span className="ml-2">Revenue analytics chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Denial Analysis</CardTitle>
                <CardDescription>Claim denial patterns and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <PieChart className="h-8 w-8" />
                  <span className="ml-2">Denial analysis chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}