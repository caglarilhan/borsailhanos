"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Pill, Activity, User, Settings, Bell, Download, Eye } from "lucide-react";

interface ClientPortalProps {
  patientId: string;
}

interface PatientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  medicalRecordNumber: string;
  lastVisit: string;
  nextAppointment?: string;
  status: 'active' | 'inactive' | 'pending';
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'discontinued';
  instructions: string;
}

interface LabResult {
  id: string;
  testName: string;
  date: string;
  status: 'pending' | 'completed' | 'abnormal';
  results?: string;
  doctor: string;
}

export default function ClientPortal({ patientId }: ClientPortalProps) {
  const [patientData, setPatientData] = React.useState<PatientData | null>(null);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [labResults, setLabResults] = React.useState<LabResult[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Mock data - in real app, this would come from API
  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPatientData({
        id: patientId,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        dateOfBirth: "1985-03-15",
        medicalRecordNumber: "MR-2024-001",
        lastVisit: "2024-09-01",
        nextAppointment: "2024-09-20",
        status: 'active'
      });

      setAppointments([
        {
          id: "1",
          date: "2024-09-20",
          time: "10:00 AM",
          doctor: "Dr. Sarah Johnson",
          type: "Follow-up",
          status: 'scheduled',
          notes: "Regular checkup"
        },
        {
          id: "2",
          date: "2024-09-01",
          time: "2:00 PM",
          doctor: "Dr. Sarah Johnson",
          type: "Consultation",
          status: 'completed',
          notes: "Initial consultation completed"
        }
      ]);

      setMedications([
        {
          id: "1",
          name: "Metformin",
          dosage: "500mg",
          frequency: "Twice daily",
          startDate: "2024-08-15",
          status: 'active',
          instructions: "Take with food"
        },
        {
          id: "2",
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          startDate: "2024-08-15",
          status: 'active',
          instructions: "Take in the morning"
        }
      ]);

      setLabResults([
        {
          id: "1",
          testName: "Complete Blood Count",
          date: "2024-09-01",
          status: 'completed',
          results: "Normal",
          doctor: "Dr. Sarah Johnson"
        },
        {
          id: "2",
          testName: "Lipid Panel",
          date: "2024-09-01",
          status: 'completed',
          results: "Cholesterol slightly elevated",
          doctor: "Dr. Sarah Johnson"
        },
        {
          id: "3",
          testName: "HbA1c",
          date: "2024-09-15",
          status: 'pending',
          doctor: "Dr. Sarah Johnson"
        }
      ]);

      setLoading(false);
    }, 1000);
  }, [patientId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'discontinued':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'abnormal':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{patientData.name}</CardTitle>
                <CardDescription>
                  Medical Record: {patientData.medicalRecordNumber}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(patientData.status)}>
              {patientData.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Email:</span> {patientData.email}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {patientData.phone}
            </div>
            <div>
              <span className="font-medium">Date of Birth:</span> {patientData.dateOfBirth}
            </div>
            <div>
              <span className="font-medium">Last Visit:</span> {patientData.lastVisit}
            </div>
            <div>
              <span className="font-medium">Next Appointment:</span> {patientData.nextAppointment || 'Not scheduled'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Upcoming Appointments</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {appointments.filter(apt => apt.status === 'scheduled').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Active Medications</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {medications.filter(med => med.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Pending Lab Results</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {labResults.filter(lab => lab.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Documents</span>
                </div>
                <div className="text-2xl font-bold mt-2">12</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Lab results updated</div>
                    <div className="text-sm text-gray-500">Complete Blood Count - Normal</div>
                  </div>
                  <div className="text-sm text-gray-500">2 days ago</div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Appointment completed</div>
                    <div className="text-sm text-gray-500">Follow-up with Dr. Sarah Johnson</div>
                  </div>
                  <div className="text-sm text-gray-500">1 week ago</div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Pill className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Medication prescribed</div>
                    <div className="text-sm text-gray-500">Metformin 500mg</div>
                  </div>
                  <div className="text-sm text-gray-500">2 weeks ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>Your upcoming and past appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{appointment.type}</div>
                        <div className="text-sm text-gray-500">
                          {appointment.date} at {appointment.time}
                        </div>
                        <div className="text-sm text-gray-500">Dr. {appointment.doctor}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      {appointment.status === 'scheduled' && (
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
              <CardDescription>Your current and past medications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.map((medication) => (
                  <div key={medication.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Pill className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{medication.name}</div>
                        <div className="text-sm text-gray-500">
                          {medication.dosage} - {medication.frequency}
                        </div>
                        <div className="text-sm text-gray-500">{medication.instructions}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(medication.status)}>
                        {medication.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Results Tab */}
        <TabsContent value="lab-results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lab Results</CardTitle>
              <CardDescription>Your laboratory test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {labResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{result.testName}</div>
                        <div className="text-sm text-gray-500">
                          {result.date} - Dr. {result.doctor}
                        </div>
                        {result.results && (
                          <div className="text-sm text-gray-600">{result.results}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                      {result.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Your medical documents and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Medical Report - September 2024</div>
                      <div className="text-sm text-gray-500">PDF • 2.3 MB</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Prescription - August 2024</div>
                      <div className="text-sm text-gray-500">PDF • 1.1 MB</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

