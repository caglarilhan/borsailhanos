'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Zap, 
  Heart, 
  Brain, 
  Stethoscope, 
  FileText, 
  Download, 
  Upload, 
  Eye, 
  Settings, 
  Bell, 
  AlertCircle, 
  Info, 
  Warning, 
  Check, 
  X
} from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'discontinued' | 'completed';
  sideEffects: string[];
  interactions: DrugInteraction[];
  labMonitoring: LabTest[];
  patientId: string;
  prescribedBy: string;
  lastModified: string;
}

interface DrugInteraction {
  id: string;
  medication1: string;
  medication2: string;
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  description: string;
  recommendation: string;
  clinicalSignificance: string;
}

interface LabTest {
  id: string;
  name: string;
  frequency: string;
  lastTest?: string;
  nextDue?: string;
  results?: LabResult[];
  isRequired: boolean;
}

interface LabResult {
  id: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  date: string;
  labName: string;
}

interface Prescription {
  id: string;
  patientId: string;
  medications: Medication[];
  diagnosis: string;
  instructions: string;
  validUntil: string;
  isElectronic: boolean;
  digitalSignature?: string;
  pharmacyId?: string;
  status: 'draft' | 'signed' | 'sent' | 'filled' | 'expired';
  createdAt: string;
}

interface MedicationManagementProps {
  patientId: string;
  providerId: string;
  providerType: 'psychiatrist' | 'psychologist';
}

export default function MedicationManagement({ patientId, providerId, providerType }: MedicationManagementProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'medications' | 'prescriptions' | 'labs' | 'interactions'>('medications');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  // Only show medication management for psychiatrists
  if (providerType !== 'psychiatrist') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Stethoscope className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Medication Management</h3>
          <p className="text-muted-foreground text-center mb-4">
            This feature is only available for psychiatrists. Psychologists focus on therapy and psychological interventions.
          </p>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    loadMedications();
    loadPrescriptions();
    loadLabResults();
  }, [patientId]);

  const loadMedications = async () => {
    try {
      const response = await fetch(`/api/psychiatry/medications?patientId=${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setMedications(data.medications || []);
      }
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

  const loadPrescriptions = async () => {
    try {
      const response = await fetch(`/api/psychiatry/prescriptions?patientId=${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data.prescriptions || []);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    }
  };

  const loadLabResults = async () => {
    try {
      const response = await fetch(`/api/psychiatry/lab-results?patientId=${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setLabResults(data.results || []);
      }
    } catch (error) {
      console.error('Error loading lab results:', error);
    }
  };

  const createPrescription = async (prescriptionData: Partial<Prescription>) => {
    try {
      const response = await fetch('/api/psychiatry/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...prescriptionData,
          patientId,
          prescribedBy: providerId
        }),
      });

      if (response.ok) {
        await loadPrescriptions();
        return true;
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
    }
    return false;
  };

  const checkDrugInteractions = async (medications: string[]) => {
    try {
      const response = await fetch('/api/psychiatry/drug-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.interactions || [];
      }
    } catch (error) {
      console.error('Error checking drug interactions:', error);
    }
    return [];
  };

  const calculateDosage = (medication: string, patientWeight: number, age: number, kidneyFunction?: number) => {
    // Dosage calculation logic based on medication, patient factors
    // This would integrate with a medical database
    return {
      recommendedDosage: '25mg',
      maxDosage: '100mg',
      adjustments: ['Reduce by 50% if kidney function < 30ml/min'],
      warnings: ['Monitor for QT prolongation']
    };
  };

  const getInteractionSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'major': return 'bg-red-100 text-red-800';
      case 'contraindicated': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLabStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'abnormal': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMedication = (medication: Medication) => (
    <Card key={medication.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{medication.name}</CardTitle>
              <CardDescription>
                {medication.dosage} - {medication.frequency}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={medication.status === 'active' ? 'default' : 'secondary'}>
              {medication.status}
            </Badge>
            {medication.interactions.length > 0 && (
              <Badge className="bg-red-100 text-red-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {medication.interactions.length} interactions
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMedication(medication)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Duration</Label>
              <div className="text-sm text-muted-foreground">{medication.duration}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Start Date</Label>
              <div className="text-sm text-muted-foreground">
                {new Date(medication.startDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          {medication.instructions && (
            <div>
              <Label className="text-sm font-medium">Instructions</Label>
              <div className="text-sm text-muted-foreground">{medication.instructions}</div>
            </div>
          )}
          {medication.sideEffects.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Side Effects</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {medication.sideEffects.map((effect, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {effect}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderPrescription = (prescription: Prescription) => (
    <Card key={prescription.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-600" />
            <div>
              <CardTitle className="text-lg">Prescription #{prescription.id.slice(-8)}</CardTitle>
              <CardDescription>
                Created {new Date(prescription.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={prescription.status === 'signed' ? 'default' : 'secondary'}>
              {prescription.status}
            </Badge>
            {prescription.isElectronic && (
              <Badge variant="outline">
                <Shield className="h-3 w-3 mr-1" />
                E-Signature
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPrescription(prescription)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <Label className="text-sm font-medium">Diagnosis</Label>
            <div className="text-sm text-muted-foreground">{prescription.diagnosis}</div>
          </div>
          <div>
            <Label className="text-sm font-medium">Medications ({prescription.medications.length})</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {prescription.medications.map((med, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {med.name}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Valid Until</Label>
            <div className="text-sm text-muted-foreground">
              {new Date(prescription.validUntil).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderLabResult = (result: LabResult) => (
    <Card key={result.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <div>
              <CardTitle className="text-lg">{result.testName}</CardTitle>
              <CardDescription>
                {new Date(result.date).toLocaleDateString()} - {result.labName}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getLabStatusColor(result.status)}>
              {result.status}
            </Badge>
            <div className="text-sm font-medium">
              {result.value} {result.unit}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <Label className="text-sm font-medium">Reference Range</Label>
            <div className="text-sm text-muted-foreground">{result.referenceRange}</div>
          </div>
          {result.status !== 'normal' && (
            <div className="p-2 bg-yellow-50 rounded">
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Abnormal result - Review required
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.genericName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !showOnlyActive || med.status === 'active';
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medication Management</h1>
          <p className="text-muted-foreground">
            Comprehensive medication management for psychiatric patients
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setSelectedPrescription({} as Prescription)}>
            <Plus className="h-4 w-4 mr-2" />
            New Prescription
          </Button>
        </div>
      </div>

      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'medications' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('medications')}
          className="flex-1"
        >
          <Pill className="h-4 w-4 mr-2" />
          Medications
        </Button>
        <Button
          variant={activeTab === 'prescriptions' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('prescriptions')}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          Prescriptions
        </Button>
        <Button
          variant={activeTab === 'labs' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('labs')}
          className="flex-1"
        >
          <Activity className="h-4 w-4 mr-2" />
          Lab Results
        </Button>
        <Button
          variant={activeTab === 'interactions' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('interactions')}
          className="flex-1"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Interactions
        </Button>
      </div>

      {activeTab === 'medications' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search medications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show-only-active"
                checked={showOnlyActive}
                onChange={(e) => setShowOnlyActive(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="show-only-active" className="text-sm">
                Show only active medications
              </Label>
            </div>
          </div>

          {filteredMedications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Medications</h3>
                <p className="text-muted-foreground text-center mb-4">
                  No medications found matching your criteria
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMedications.map(renderMedication)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Prescriptions</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first prescription to get started
                </p>
                <Button onClick={() => setSelectedPrescription({} as Prescription)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Prescription
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {prescriptions.map(renderPrescription)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'labs' && (
        <div className="space-y-4">
          {labResults.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Lab Results</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Lab results will appear here when available
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {labResults.map(renderLabResult)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'interactions' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drug Interaction Checker</CardTitle>
              <CardDescription>
                Check for potential drug interactions between current medications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medication1">Medication 1</Label>
                    <Input
                      id="medication1"
                      placeholder="Enter medication name..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="medication2">Medication 2</Label>
                    <Input
                      id="medication2"
                      placeholder="Enter medication name..."
                    />
                  </div>
                </div>
                <Button className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Check Interactions
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Medication Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.flatMap(med => med.interactions).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No interactions found for current medications
                  </p>
                ) : (
                  medications.flatMap(med => med.interactions).map((interaction, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getInteractionSeverityColor(interaction.severity)}>
                            {interaction.severity}
                          </Badge>
                          <span className="font-medium">
                            {interaction.medication1} + {interaction.medication2}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {interaction.description}
                      </p>
                      <p className="text-sm font-medium text-blue-600">
                        Recommendation: {interaction.recommendation}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prescription Creation Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {selectedPrescription.id ? 'Prescription Details' : 'Create New Prescription'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedPrescription.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Diagnosis</Label>
                        <div className="text-sm text-muted-foreground">
                          {selectedPrescription.diagnosis}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="mt-1">
                          <Badge variant={selectedPrescription.status === 'signed' ? 'default' : 'secondary'}>
                            {selectedPrescription.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Instructions</Label>
                      <div className="text-sm text-muted-foreground">
                        {selectedPrescription.instructions}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Medications</Label>
                      <div className="space-y-2 mt-2">
                        {selectedPrescription.medications.map((med, index) => (
                          <div key={index} className="p-2 border rounded">
                            <div className="font-medium">{med.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {med.dosage} - {med.frequency}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Input
                        id="diagnosis"
                        value={selectedPrescription.diagnosis || ''}
                        onChange={(e) => setSelectedPrescription({
                          ...selectedPrescription,
                          diagnosis: e.target.value
                        })}
                        placeholder="Enter diagnosis..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="instructions">Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={selectedPrescription.instructions || ''}
                        onChange={(e) => setSelectedPrescription({
                          ...selectedPrescription,
                          instructions: e.target.value
                        })}
                        placeholder="Enter prescription instructions..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Medications</Label>
                      <div className="space-y-2 mt-2">
                        <Button variant="outline" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Medication
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPrescription(null)}
                  >
                    Cancel
                  </Button>
                  {!selectedPrescription.id && (
                    <Button
                      onClick={async () => {
                        await createPrescription(selectedPrescription);
                        setSelectedPrescription(null);
                      }}
                    >
                      Create Prescription
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
