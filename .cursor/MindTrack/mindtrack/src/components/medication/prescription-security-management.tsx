'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Lock, 
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
  Eye,
  Key,
  Database,
  AlertTriangle
} from 'lucide-react';

// Interfaces
interface ElectronicPrescriptionSecurity {
  id: string;
  prescription_id: string;
  security_level: string;
  encryption_method: string;
  digital_signature: string;
  signature_algorithm: string;
  certificate_serial: string;
  certificate_expiry: string;
  timestamp_signature: string;
  hash_value: string;
  tamper_detection: boolean;
}

interface PDMPIntegration {
  id: string;
  patient_id: string;
  prescription_id: string;
  pdmp_query_date: string;
  risk_score: number;
  risk_factors: string[];
  alerts_generated: string[];
  query_status: string;
  prescriber_verification: boolean;
}

interface PrescriptionFraudDetection {
  id: string;
  prescription_id: string;
  fraud_score: number;
  fraud_indicators: string[];
  fraud_category: string;
  fraud_probability: number;
  confidence_level: number;
  investigation_required: boolean;
  investigation_status: string;
}

interface DEAComplianceTracking {
  id: string;
  prescription_id: string;
  dea_number: string;
  controlled_substance_schedule: string;
  prescription_date: string;
  patient_id: string;
  medication_name: string;
  quantity_prescribed: number;
  compliance_status: string;
}

export function PrescriptionSecurityManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [securityRecords, setSecurityRecords] = useState<ElectronicPrescriptionSecurity[]>([]);
  const [pdmpRecords, setPdmpRecords] = useState<PDMPIntegration[]>([]);
  const [fraudDetections, setFraudDetections] = useState<PrescriptionFraudDetection[]>([]);
  const [deaCompliance, setDeaCompliance] = useState<DEAComplianceTracking[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    setSecurityRecords([
      {
        id: '1',
        prescription_id: 'prescription-1',
        security_level: 'maximum',
        encryption_method: 'AES-256',
        digital_signature: 'a1b2c3d4e5f6...',
        signature_algorithm: 'RSA-SHA256',
        certificate_serial: 'CERT-2024-001',
        certificate_expiry: '2025-12-31',
        timestamp_signature: '2024-01-25T10:30:00Z',
        hash_value: 'sha256:abc123...',
        tamper_detection: true
      }
    ]);

    setPdmpRecords([
      {
        id: '1',
        patient_id: 'patient-1',
        prescription_id: 'prescription-1',
        pdmp_query_date: '2024-01-25T09:00:00Z',
        risk_score: 0.3,
        risk_factors: ['Recent prescription history'],
        alerts_generated: ['Multiple prescribers detected'],
        query_status: 'completed',
        prescriber_verification: true
      }
    ]);

    setFraudDetections([
      {
        id: '1',
        prescription_id: 'prescription-1',
        fraud_score: 0.2,
        fraud_indicators: ['Normal prescription pattern'],
        fraud_category: 'none',
        fraud_probability: 0.1,
        confidence_level: 0.8,
        investigation_required: false,
        investigation_status: 'completed'
      }
    ]);

    setDeaCompliance([
      {
        id: '1',
        prescription_id: 'prescription-1',
        dea_number: 'DEA1234567',
        controlled_substance_schedule: 'II',
        prescription_date: '2024-01-25',
        patient_id: 'patient-1',
        medication_name: 'Oxycodone',
        quantity_prescribed: 30,
        compliance_status: 'compliant'
      }
    ]);
  }, []);

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'maximum': return 'destructive';
      case 'enhanced': return 'secondary';
      case 'standard': return 'default';
      default: return 'default';
    }
  };

  const getFraudScoreColor = (score: number) => {
    if (score >= 0.7) return 'destructive';
    if (score >= 0.4) return 'secondary';
    return 'default';
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'default';
      case 'non_compliant': return 'destructive';
      case 'pending_review': return 'secondary';
      default: return 'default';
    }
  };

  const getQueryStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Prescription Security Management</h2>
          <p className="text-muted-foreground">
            Comprehensive prescription security, PDMP integration, and fraud detection
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Security Assessment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">eRx Security</TabsTrigger>
          <TabsTrigger value="pdmp">PDMP Integration</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="dea">DEA Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Secure Prescriptions</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityRecords.length}</div>
                <p className="text-xs text-muted-foreground">
                  {securityRecords.filter(s => s.security_level === 'maximum').length} maximum security
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PDMP Queries</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pdmpRecords.length}</div>
                <p className="text-xs text-muted-foreground">
                  {pdmpRecords.filter(p => p.query_status === 'completed').length} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fraud Detections</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fraudDetections.length}</div>
                <p className="text-xs text-muted-foreground">
                  {fraudDetections.filter(f => f.investigation_required).length} need investigation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">DEA Compliance</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deaCompliance.length}</div>
                <p className="text-xs text-muted-foreground">
                  {deaCompliance.filter(d => d.compliance_status === 'compliant').length} compliant
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Alerts</CardTitle>
                <CardDescription>Latest prescription security alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Prescription {record.prescription_id}</p>
                      <p className="text-xs text-muted-foreground">{record.encryption_method}</p>
                    </div>
                    <Badge variant={getSecurityLevelColor(record.security_level)}>
                      {record.security_level}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>High Risk Prescriptions</CardTitle>
                <CardDescription>Prescriptions requiring investigation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fraudDetections.filter(f => f.investigation_required).map((detection) => (
                  <div key={detection.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Prescription {detection.prescription_id}</p>
                      <p className="text-xs text-muted-foreground">
                        Fraud Score: {(detection.fraud_score * 100).toFixed(0)}%
                      </p>
                    </div>
                    <Badge variant={getFraudScoreColor(detection.fraud_score)}>
                      {detection.fraud_category}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Electronic Prescription Security</h3>
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
            {securityRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Prescription {record.prescription_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getSecurityLevelColor(record.security_level)}>
                        {record.security_level}
                      </Badge>
                      {record.tamper_detection && (
                        <Badge variant="destructive">Tamper Detection</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {record.encryption_method} - {record.signature_algorithm}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Certificate Serial</p>
                      <p className="text-sm text-muted-foreground">{record.certificate_serial}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Certificate Expiry</p>
                      <p className="text-sm text-muted-foreground">{record.certificate_expiry}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Hash Value</p>
                      <p className="text-sm text-muted-foreground font-mono">{record.hash_value}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Signature Time</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.timestamp_signature).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Digital Signature: {record.digital_signature.substring(0, 20)}...
                    </span>
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

        <TabsContent value="pdmp" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">PDMP Integration</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New PDMP Query
            </Button>
          </div>

          <div className="grid gap-4">
            {pdmpRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Patient {record.patient_id}</CardTitle>
                    <Badge variant={getQueryStatusColor(record.query_status)}>
                      {record.query_status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Prescription {record.prescription_id} - {new Date(record.pdmp_query_date).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Risk Score</span>
                      <span className="text-sm">{(record.risk_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${record.risk_score * 100}%` }}
                      ></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Risk Factors:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {record.risk_factors.map((factor, index) => (
                          <li key={index}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Alerts Generated:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {record.alerts_generated.map((alert, index) => (
                          <li key={index}>• {alert}</li>
                        ))}
                      </ul>
                    </div>
                    {record.prescriber_verification && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Prescriber verification completed
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Fraud Detection</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Run Fraud Check
            </Button>
          </div>

          <div className="grid gap-4">
            {fraudDetections.map((detection) => (
              <Card key={detection.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Prescription {detection.prescription_id}</CardTitle>
                    <Badge variant={getFraudScoreColor(detection.fraud_score)}>
                      {detection.fraud_category}
                    </Badge>
                  </div>
                  <CardDescription>
                    Fraud Score: {(detection.fraud_score * 100).toFixed(0)}% - Confidence: {(detection.confidence_level * 100).toFixed(0)}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Fraud Probability</span>
                      <span className="text-sm">{(detection.fraud_probability * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${detection.fraud_score * 100}%` }}
                      ></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Fraud Indicators:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {detection.fraud_indicators.map((indicator, index) => (
                          <li key={index}>• {indicator}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Investigation Status: {detection.investigation_status}
                      </span>
                      {detection.investigation_required && (
                        <Badge variant="destructive">Investigation Required</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dea" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">DEA Compliance Tracking</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Compliance Check
            </Button>
          </div>

          <div className="grid gap-4">
            {deaCompliance.map((compliance) => (
              <Card key={compliance.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{compliance.medication_name}</CardTitle>
                    <Badge variant={getComplianceStatusColor(compliance.compliance_status)}>
                      {compliance.compliance_status}
                    </Badge>
                  </div>
                  <CardDescription>
                    DEA {compliance.dea_number} - Schedule {compliance.controlled_substance_schedule}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Patient ID</p>
                      <p className="text-sm text-muted-foreground">{compliance.patient_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Quantity Prescribed</p>
                      <p className="text-sm text-muted-foreground">{compliance.quantity_prescribed}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Prescription Date</p>
                      <p className="text-sm text-muted-foreground">{compliance.prescription_date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Schedule</p>
                      <p className="text-sm text-muted-foreground">Schedule {compliance.controlled_substance_schedule}</p>
                    </div>
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
                <CardTitle>Security Trends</CardTitle>
                <CardDescription>Prescription security trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8" />
                  <span className="ml-2">Security trends chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fraud Analysis</CardTitle>
                <CardDescription>Prescription fraud patterns and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Activity className="h-8 w-8" />
                  <span className="ml-2">Fraud analysis chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


