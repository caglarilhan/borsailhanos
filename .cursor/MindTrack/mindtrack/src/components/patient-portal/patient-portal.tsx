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
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CreditCard, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Clock3, 
  Users, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Shield, 
  Bell, 
  Settings, 
  LogOut,
  Home,
  History,
  CreditCard as Payment,
  FileImage,
  Video,
  Mic,
  Share2
} from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  insuranceInfo: any;
  medicalHistory: string[];
  allergies: string[];
  medications: string[];
}

interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'followup' | 'therapy' | 'assessment';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string;
  location: 'in_person' | 'telehealth';
  meetingLink?: string;
}

interface Document {
  id: string;
  patientId: string;
  name: string;
  type: 'insurance_card' | 'id' | 'medical_record' | 'form' | 'other';
  fileUrl: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

interface Payment {
  id: string;
  patientId: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'insurance';
  transactionId?: string;
  createdAt: string;
  dueDate?: string;
}

interface PatientPortalProps {
  patientId: string;
}

export default function PatientPortal({ patientId }: PatientPortalProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'documents' | 'payments' | 'profile'>('dashboard');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadPatientData();
    loadAppointments();
    loadDocuments();
    loadPayments();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setPatient(data.patient);
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}/appointments`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadPayments = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}/payments`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const scheduleAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        await loadAppointments();
        return true;
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
    }
    return false;
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
      });

      if (response.ok) {
        await loadAppointments();
        return true;
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
    return false;
  };

  const uploadDocument = async (file: File, type: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`/api/patients/${patientId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await loadDocuments();
        return true;
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsUploading(false);
    }
    return false;
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadDocuments();
        return true;
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
    return false;
  };

  const processPayment = async (paymentId: string, paymentMethod: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/payments/${paymentId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: paymentMethod }),
      });

      if (response.ok) {
        await loadPayments();
        return true;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
    return false;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <Users className="h-4 w-4" />;
      case 'followup': return <Clock3 className="h-4 w-4" />;
      case 'therapy': return <MessageSquare className="h-4 w-4" />;
      case 'assessment': return <FileText className="h-4 w-4" />;
      case 'insurance_card': return <Shield className="h-4 w-4" />;
      case 'id': return <User className="h-4 w-4" />;
      case 'medical_record': return <FileText className="h-4 w-4" />;
      case 'form': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderAppointment = (appointment: Appointment) => (
    <Card key={appointment.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTypeIcon(appointment.type)}
            <div>
              <CardTitle className="text-lg">{appointment.providerName}</CardTitle>
              <CardDescription>
                {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status.replace('_', ' ')}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedAppointment(appointment)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{appointment.duration} minutes</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm capitalize">{appointment.location.replace('_', ' ')}</span>
            </div>
          </div>
          {appointment.notes && (
            <div>
              <Label className="text-sm font-medium">Notes</Label>
              <div className="text-sm text-muted-foreground">{appointment.notes}</div>
            </div>
          )}
          {appointment.meetingLink && appointment.status === 'confirmed' && (
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={() => window.open(appointment.meetingLink, '_blank')}>
                <Video className="h-4 w-4 mr-2" />
                Join Meeting
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderDocument = (document: Document) => (
    <Card key={document.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTypeIcon(document.type)}
            <div>
              <CardTitle className="text-lg">{document.name}</CardTitle>
              <CardDescription>
                Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(document.status)}>
              {document.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(document.fileUrl, '_blank')}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDocument(document)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <Label className="text-sm font-medium">Type</Label>
            <div className="text-sm text-muted-foreground capitalize">
              {document.type.replace('_', ' ')}
            </div>
          </div>
          {document.notes && (
            <div>
              <Label className="text-sm font-medium">Notes</Label>
              <div className="text-sm text-muted-foreground">{document.notes}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderPayment = (payment: Payment) => (
    <Card key={payment.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <div>
              <CardTitle className="text-lg">${payment.amount.toFixed(2)}</CardTitle>
              <CardDescription>{payment.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(payment.status)}>
              {payment.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPayment(payment)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <div>
              <Label className="text-sm font-medium">Method</Label>
              <div className="text-sm text-muted-foreground capitalize">
                {payment.method.replace('_', ' ')}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Created</Label>
              <div className="text-sm text-muted-foreground">
                {new Date(payment.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          {payment.dueDate && (
            <div>
              <Label className="text-sm font-medium">Due Date</Label>
              <div className="text-sm text-muted-foreground">
                {new Date(payment.dueDate).toLocaleDateString()}
              </div>
            </div>
          )}
          {payment.status === 'pending' && (
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={() => processPayment(payment.id, 'credit_card')}>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading patient portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Patient Portal</h1>
              <Badge variant="outline">Welcome, {patient.firstName}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('dashboard')}
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === 'appointments' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('appointments')}
            className="flex-1"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Appointments
          </Button>
          <Button
            variant={activeTab === 'documents' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('documents')}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </Button>
          <Button
            variant={activeTab === 'payments' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('payments')}
            className="flex-1"
          >
            <Payment className="h-4 w-4 mr-2" />
            Payments
          </Button>
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('profile')}
            className="flex-1"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{appointments.length}</p>
                      <p className="text-sm text-muted-foreground">Appointments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{documents.length}</p>
                      <p className="text-sm text-muted-foreground">Documents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Payment className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{payments.length}</p>
                      <p className="text-sm text-muted-foreground">Payments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {appointments.filter(a => a.status === 'completed').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No upcoming appointments</p>
                  ) : (
                    <div className="space-y-2">
                      {appointments
                        .filter(a => a.status === 'scheduled' || a.status === 'confirmed')
                        .slice(0, 3)
                        .map(renderAppointment)}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No documents uploaded</p>
                  ) : (
                    <div className="space-y-2">
                      {documents.slice(0, 3).map(renderDocument)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Appointments</h2>
              <Button onClick={() => setSelectedAppointment({} as Appointment)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>

            {appointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Appointments</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Schedule your first appointment to get started
                  </p>
                  <Button onClick={() => setSelectedAppointment({} as Appointment)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map(renderAppointment)}
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Documents</h2>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="document-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      uploadDocument(file, 'other');
                    }
                  }}
                />
                <Button
                  onClick={() => document.getElementById('document-upload')?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </div>
            </div>

            {documents.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Documents</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Upload your documents to keep them organized
                  </p>
                  <Button
                    onClick={() => document.getElementById('document-upload')?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload First Document'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {documents.map(renderDocument)}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Payments</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  Total: ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </Badge>
                <Badge variant="outline">
                  Pending: ${payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </Badge>
              </div>
            </div>

            {payments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Payment className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Payments</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Payment history will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {payments.map(renderPayment)}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Profile</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <div className="text-sm text-muted-foreground">
                      {patient.firstName} {patient.lastName}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <div className="text-sm text-muted-foreground">{patient.email}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <div className="text-sm text-muted-foreground">{patient.phone}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <div className="text-sm text-muted-foreground">
                      {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <div className="text-sm text-muted-foreground">{patient.address}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Allergies</Label>
                    <div className="text-sm text-muted-foreground">
                      {patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Medications</Label>
                    <div className="text-sm text-muted-foreground">
                      {patient.medications.length > 0 ? patient.medications.join(', ') : 'None'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Emergency Contact</Label>
                    <div className="text-sm text-muted-foreground">{patient.emergencyContact}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {selectedAppointment.id ? 'Appointment Details' : 'Schedule Appointment'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedAppointment.id ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Provider</Label>
                          <div className="text-sm text-muted-foreground">
                            {selectedAppointment.providerName}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Date & Time</Label>
                          <div className="text-sm text-muted-foreground">
                            {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Duration</Label>
                          <div className="text-sm text-muted-foreground">
                            {selectedAppointment.duration} minutes
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Location</Label>
                          <div className="text-sm text-muted-foreground capitalize">
                            {selectedAppointment.location.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      {selectedAppointment.notes && (
                        <div>
                          <Label className="text-sm font-medium">Notes</Label>
                          <div className="text-sm text-muted-foreground">
                            {selectedAppointment.notes}
                          </div>
                        </div>
                      )}
                      {selectedAppointment.status === 'scheduled' && (
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => cancelAppointment(selectedAppointment.id)}
                          >
                            Cancel Appointment
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="appointment-type">Appointment Type</Label>
                        <select
                          id="appointment-type"
                          className="w-full p-2 border rounded"
                          value={selectedAppointment.type || 'consultation'}
                          onChange={(e) => setSelectedAppointment({
                            ...selectedAppointment,
                            type: e.target.value as any
                          })}
                        >
                          <option value="consultation">Consultation</option>
                          <option value="followup">Follow-up</option>
                          <option value="therapy">Therapy</option>
                          <option value="assessment">Assessment</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="appointment-date">Date</Label>
                        <Input
                          id="appointment-date"
                          type="date"
                          value={selectedAppointment.date || ''}
                          onChange={(e) => setSelectedAppointment({
                            ...selectedAppointment,
                            date: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="appointment-time">Time</Label>
                        <Input
                          id="appointment-time"
                          type="time"
                          value={selectedAppointment.time || ''}
                          onChange={(e) => setSelectedAppointment({
                            ...selectedAppointment,
                            time: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="appointment-notes">Notes</Label>
                        <Textarea
                          id="appointment-notes"
                          value={selectedAppointment.notes || ''}
                          onChange={(e) => setSelectedAppointment({
                            ...selectedAppointment,
                            notes: e.target.value
                          })}
                          placeholder="Any additional notes..."
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedAppointment(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={async () => {
                            await scheduleAppointment(selectedAppointment);
                            setSelectedAppointment(null);
                          }}
                        >
                          Schedule Appointment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Document Details Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <div className="text-sm text-muted-foreground">{selectedDocument.name}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <div className="text-sm text-muted-foreground capitalize">
                      {selectedDocument.type.replace('_', ' ')}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedDocument.status)}>
                        {selectedDocument.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Uploaded</Label>
                    <div className="text-sm text-muted-foreground">
                      {new Date(selectedDocument.uploadedAt).toLocaleString()}
                    </div>
                  </div>
                  {selectedDocument.notes && (
                    <div>
                      <Label className="text-sm font-medium">Notes</Label>
                      <div className="text-sm text-muted-foreground">
                        {selectedDocument.notes}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedDocument.fileUrl, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDocument(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Details Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Amount</Label>
                    <div className="text-sm text-muted-foreground">
                      ${selectedPayment.amount.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <div className="text-sm text-muted-foreground">
                      {selectedPayment.description}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedPayment.status)}>
                        {selectedPayment.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <div className="text-sm text-muted-foreground capitalize">
                      {selectedPayment.method.replace('_', ' ')}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <div className="text-sm text-muted-foreground">
                      {new Date(selectedPayment.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {selectedPayment.dueDate && (
                    <div>
                      <Label className="text-sm font-medium">Due Date</Label>
                      <div className="text-sm text-muted-foreground">
                        {new Date(selectedPayment.dueDate).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {selectedPayment.transactionId && (
                    <div>
                      <Label className="text-sm font-medium">Transaction ID</Label>
                      <div className="text-sm text-muted-foreground font-mono">
                        {selectedPayment.transactionId}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPayment(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
