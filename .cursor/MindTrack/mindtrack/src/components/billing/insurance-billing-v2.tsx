"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  DollarSign,
  Users,
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

interface EDI837Claim {
  id: string;
  claimNumber: string;
  patientId: string;
  providerId: string;
  diagnosisCodes: string[];
  procedureCodes: string[];
  billedAmount: number;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'paid' | 'denied';
  submittedAt?: string;
  acceptedAt?: string;
  paidAt?: string;
  deniedAt?: string;
  rejectionReason?: string;
  edi837Data: string;
  createdAt: string;
  updatedAt: string;
}

interface EDI835ERA {
  id: string;
  claimId: string;
  payerId: string;
  checkNumber: string;
  checkAmount: number;
  paymentDate: string;
  status: 'received' | 'processed' | 'posted' | 'error';
  errorMessage?: string;
  edi835Data: string;
  createdAt: string;
  processedAt?: string;
}

interface EligibilityCheck {
  id: string;
  patientId: string;
  insuranceId: string;
  status: 'pending' | 'verified' | 'failed';
  coverage: {
    active: boolean;
    effectiveDate: string;
    terminationDate?: string;
    copay: number;
    deductible: number;
    coinsurance: number;
    outOfPocketMax: number;
  };
  benefits: {
    mentalHealth: boolean;
    copay: number;
    deductible: number;
    coinsurance: number;
    priorAuthRequired: boolean;
  };
  checkedAt: string;
  expiresAt: string;
}

interface InsuranceProvider {
  id: string;
  name: string;
  payerId: string;
  type: 'commercial' | 'medicare' | 'medicaid' | 'self_pay';
  ediEnabled: boolean;
  eligibilityEnabled: boolean;
  eraEnabled: boolean;
  isActive: boolean;
}

export default function InsuranceBillingV2() {
  const { toast } = useToast();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  
  const [claims, setClaims] = React.useState<EDI837Claim[]>([]);
  const [eras, setERAs] = React.useState<EDI835ERA[]>([]);
  const [eligibilityChecks, setEligibilityChecks] = React.useState<EligibilityCheck[]>([]);
  const [providers, setProviders] = React.useState<InsuranceProvider[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedClaim, setSelectedClaim] = React.useState<EDI837Claim | null>(null);
  const [showCreateClaim, setShowCreateClaim] = React.useState(false);
  const [showEligibilityCheck, setShowEligibilityCheck] = React.useState(false);

  const fetchClaims = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/edi837');
      if (!res.ok) throw new Error('Failed to fetch claims');
      const data = await res.json();
      setClaims(data.claims || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load claims: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchERAs = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/edi835');
      if (!res.ok) throw new Error('Failed to fetch ERAs');
      const data = await res.json();
      setERAs(data.eras || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load ERAs: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchEligibilityChecks = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/eligibility');
      if (!res.ok) throw new Error('Failed to fetch eligibility checks');
      const data = await res.json();
      setEligibilityChecks(data.checks || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load eligibility checks: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchProviders = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/providers');
      if (!res.ok) throw new Error('Failed to fetch providers');
      const data = await res.json();
      setProviders(data.providers || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load providers: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchClaims();
    fetchERAs();
    fetchEligibilityChecks();
    fetchProviders();
  }, [fetchClaims, fetchERAs, fetchEligibilityChecks, fetchProviders]);

  const handleSubmitClaim = async (claimId: string) => {
    try {
      const res = await fetch('/api/billing/edi837/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId })
      });
      
      if (!res.ok) throw new Error('Failed to submit claim');
      
      toast({
        title: "Success",
        description: "Claim submitted successfully!",
      });
      
      fetchClaims();
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to submit claim: ${e.message}`,
        variant: "destructive",
      });
    }
  };

  const handleCheckEligibility = async (patientId: string, insuranceId: string) => {
    try {
      const res = await fetch('/api/billing/eligibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, insuranceId })
      });
      
      if (!res.ok) throw new Error('Failed to check eligibility');
      
      toast({
        title: "Success",
        description: "Eligibility check completed!",
      });
      
      fetchEligibilityChecks();
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to check eligibility: ${e.message}`,
        variant: "destructive",
      });
    }
  };

  const handleProcessERA = async (eraId: string) => {
    try {
      const res = await fetch('/api/billing/edi835/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eraId })
      });
      
      if (!res.ok) throw new Error('Failed to process ERA');
      
      toast({
        title: "Success",
        description: "ERA processed successfully!",
      });
      
      fetchERAs();
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to process ERA: ${e.message}`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Send className="h-4 w-4 text-blue-500" />;
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paid': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'denied': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Insurance Billing V2</h2>
          <p className="text-gray-600">EDI 837/835, Eligibility Checks, ERA Auto-posting</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowCreateClaim(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Claim
          </Button>
          <Button variant="outline" onClick={() => setShowEligibilityCheck(true)}>
            <Shield className="h-4 w-4 mr-2" />
            Check Eligibility
          </Button>
          <Button variant="outline" onClick={fetchClaims}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.length}</div>
            <p className="text-xs text-muted-foreground">
              {claims.filter(c => c.status === 'submitted').length} submitted
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending ERAs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eras.filter(e => e.status === 'received').length}</div>
            <p className="text-xs text-muted-foreground">
              {eras.filter(e => e.status === 'processed').length} processed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligibility Checks</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eligibilityChecks.length}</div>
            <p className="text-xs text-muted-foreground">
              {eligibilityChecks.filter(e => e.status === 'verified').length} verified
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providers.filter(p => p.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              {providers.filter(p => p.ediEnabled).length} EDI enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="claims" className="space-y-4">
        <TabsList>
          <TabsTrigger value="claims">EDI 837 Claims ({claims.length})</TabsTrigger>
          <TabsTrigger value="eras">EDI 835 ERAs ({eras.length})</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility Checks ({eligibilityChecks.length})</TabsTrigger>
          <TabsTrigger value="providers">Insurance Providers ({providers.length})</TabsTrigger>
        </TabsList>

        {/* EDI 837 Claims */}
        <TabsContent value="claims" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input placeholder="Search claims..." className="w-64" />
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Claims
            </Button>
          </div>

          <div className="space-y-2">
            {claims.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No claims found</p>
            ) : (
              claims.map((claim) => (
                <Card key={claim.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">Claim #{claim.claimNumber}</div>
                          {getStatusIcon(claim.status)}
                          <Badge className={getStatusColor(claim.status)}>
                            {claim.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Patient: {claim.patientId} | Provider: {claim.providerId}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Amount: ${claim.billedAmount.toLocaleString()} | 
                          Created: {new Date(claim.createdAt).toLocaleDateString()}
                        </div>
                        {claim.rejectionReason && (
                          <div className="text-sm text-red-600 mt-1">
                            Rejection: {claim.rejectionReason}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClaim(claim)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {claim.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleSubmitClaim(claim.id)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Submit
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* EDI 835 ERAs */}
        <TabsContent value="eras" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input placeholder="Search ERAs..." className="w-64" />
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import ERA
            </Button>
          </div>

          <div className="space-y-2">
            {eras.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No ERAs found</p>
            ) : (
              eras.map((era) => (
                <Card key={era.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">ERA #{era.id.slice(0, 8)}</div>
                          <Badge variant={era.status === 'processed' ? 'default' : 'secondary'}>
                            {era.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Claim: {era.claimId} | Payer: {era.payerId}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Check: {era.checkNumber} | Amount: ${era.checkAmount.toLocaleString()} | 
                          Date: {new Date(era.paymentDate).toLocaleDateString()}
                        </div>
                        {era.errorMessage && (
                          <div className="text-sm text-red-600 mt-1">
                            Error: {era.errorMessage}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClaim(era as any)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {era.status === 'received' && (
                          <Button
                            size="sm"
                            onClick={() => handleProcessERA(era.id)}
                          >
                            <Activity className="h-4 w-4 mr-1" />
                            Process
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Eligibility Checks */}
        <TabsContent value="eligibility" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input placeholder="Search eligibility..." className="w-64" />
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => setShowEligibilityCheck(true)}>
              <Shield className="h-4 w-4 mr-2" />
              New Check
            </Button>
          </div>

          <div className="space-y-2">
            {eligibilityChecks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No eligibility checks found</p>
            ) : (
              eligibilityChecks.map((check) => (
                <Card key={check.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">Eligibility Check #{check.id.slice(0, 8)}</div>
                          <Badge variant={check.status === 'verified' ? 'default' : 'secondary'}>
                            {check.status}
                          </Badge>
                          {check.coverage.active && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Active Coverage
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Patient: {check.patientId} | Insurance: {check.insuranceId}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Checked: {new Date(check.checkedAt).toLocaleString()} | 
                          Expires: {new Date(check.expiresAt).toLocaleDateString()}
                        </div>
                        {check.coverage.active && (
                          <div className="text-sm text-gray-500 mt-1">
                            Copay: ${check.coverage.copay} | 
                            Deductible: ${check.coverage.deductible} | 
                            Coinsurance: {check.coverage.coinsurance}%
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClaim(check as any)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCheckEligibility(check.patientId, check.insuranceId)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Recheck
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Insurance Providers */}
        <TabsContent value="providers" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input placeholder="Search providers..." className="w-64" />
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="medicare">Medicare</SelectItem>
                  <SelectItem value="medicaid">Medicaid</SelectItem>
                  <SelectItem value="self_pay">Self Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </div>

          <div className="space-y-2">
            {providers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No providers found</p>
            ) : (
              providers.map((provider) => (
                <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">{provider.name}</div>
                          <Badge variant="outline">{provider.type}</Badge>
                          {provider.isActive && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Payer ID: {provider.payerId}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className={provider.ediEnabled ? 'text-green-600' : 'text-gray-400'}>
                            EDI: {provider.ediEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <span className={provider.eligibilityEnabled ? 'text-green-600' : 'text-gray-400'}>
                            Eligibility: {provider.eligibilityEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <span className={provider.eraEnabled ? 'text-green-600' : 'text-gray-400'}>
                            ERA: {provider.eraEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Item Details */}
      {selectedClaim && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Details</span>
              <Button variant="outline" onClick={() => setSelectedClaim(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID</Label>
                  <div className="text-sm text-gray-600">{selectedClaim.id}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="text-sm text-gray-600">{selectedClaim.status}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <div className="text-sm text-gray-600">
                    {new Date(selectedClaim.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated</Label>
                  <div className="text-sm text-gray-600">
                    {new Date(selectedClaim.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Raw Data</Label>
                <Textarea
                  value={selectedClaim.edi837Data || selectedClaim.edi835Data || ''}
                  readOnly
                  rows={10}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
