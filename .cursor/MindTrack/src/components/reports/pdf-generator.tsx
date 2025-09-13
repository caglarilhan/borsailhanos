"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { generatePDFFromHTML, generateMedicalReportPDF, generateLabResultsPDF, generatePrescriptionPDF } from "@/lib/pdf-generator";

interface PDFReportGeneratorProps {
  userId: string;
  patientData?: any;
}

const REPORT_TYPES = [
  {
    id: 'medical_report',
    name: 'Medical Report',
    description: 'Comprehensive medical report with diagnosis and treatment',
    icon: '🏥'
  },
  {
    id: 'lab_results',
    name: 'Lab Results',
    description: 'Laboratory test results and analysis',
    icon: '🧪'
  },
  {
    id: 'prescription',
    name: 'Prescription',
    description: 'Medication prescription with dosage instructions',
    icon: '💊'
  },
  {
    id: 'appointment_summary',
    name: 'Appointment Summary',
    description: 'Summary of appointment details and notes',
    icon: '📅'
  },
  {
    id: 'patient_summary',
    name: 'Patient Summary',
    description: 'Complete patient medical summary',
    icon: '👤'
  }
];

export default function PDFReportGenerator({ userId, patientData }: PDFReportGeneratorProps) {
  const [selectedReportType, setSelectedReportType] = React.useState<string>('');
  const [generating, setGenerating] = React.useState(false);
  const [lastGenerated, setLastGenerated] = React.useState<any>(null);
  const [error, setError] = React.useState<string>('');

  // Mock data for demonstration
  const mockData = {
    patient: patientData || {
      name: 'John Doe',
      dateOfBirth: '1985-03-15',
      medicalRecordNumber: 'MR-2024-001',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@example.com'
    },
    medicalReport: {
      diagnosis: 'Type 2 Diabetes Mellitus',
      treatment: 'Metformin 500mg twice daily, lifestyle modifications',
      notes: 'Patient shows good compliance with medication. Continue current treatment plan.'
    },
    labResults: [
      {
        testName: 'Complete Blood Count',
        date: '2024-09-01',
        status: 'completed',
        results: 'Normal'
      },
      {
        testName: 'Lipid Panel',
        date: '2024-09-01',
        status: 'completed',
        results: 'Cholesterol slightly elevated'
      },
      {
        testName: 'HbA1c',
        date: '2024-09-01',
        status: 'completed',
        results: '7.2% (elevated)'
      }
    ],
    prescription: {
      doctorName: 'Sarah Johnson',
      licenseNumber: 'MD123456',
      medications: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          instructions: 'Take with food'
        },
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          instructions: 'Take in the morning'
        }
      ]
    },
    appointment: {
      date: '2024-09-20',
      time: '10:00 AM',
      doctor: 'Dr. Sarah Johnson',
      type: 'Follow-up',
      status: 'completed',
      notes: 'Regular checkup completed successfully'
    }
  };

  const handleGeneratePDF = async () => {
    if (!selectedReportType) {
      setError('Please select a report type');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      let result;

      switch (selectedReportType) {
        case 'medical_report':
          result = await generateMedicalReportPDF(
            mockData.patient,
            mockData.medicalReport,
            `medical-report-${Date.now()}`
          );
          break;

        case 'lab_results':
          result = await generateLabResultsPDF(
            mockData.patient,
            mockData.labResults,
            `lab-results-${Date.now()}`
          );
          break;

        case 'prescription':
          result = await generatePrescriptionPDF(
            mockData.patient,
            mockData.prescription,
            `prescription-${Date.now()}`
          );
          break;

        case 'appointment_summary':
          result = await generatePDFFromHTML(
            'appointment-summary-content',
            `appointment-summary-${Date.now()}`
          );
          break;

        case 'patient_summary':
          result = await generatePDFFromHTML(
            'patient-summary-content',
            `patient-summary-${Date.now()}`
          );
          break;

        default:
          throw new Error('Invalid report type');
      }

      if (result.success) {
        setLastGenerated({
          type: selectedReportType,
          timestamp: new Date(),
          filename: `${selectedReportType}-${Date.now()}.pdf`
        });
      } else {
        setError(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleServerSideGeneration = async () => {
    if (!selectedReportType) {
      setError('Please select a report type');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedReportType,
          data: mockData,
          filename: `${selectedReportType}-${Date.now()}`
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReportType}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setLastGenerated({
          type: selectedReportType,
          timestamp: new Date(),
          filename: `${selectedReportType}-${Date.now()}.pdf`
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('Server-side PDF generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Report Generator
          </CardTitle>
          <CardDescription>
            Generate professional medical reports in PDF format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={selectedReportType} onValueChange={setSelectedReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a report type" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleGeneratePDF}
              disabled={generating || !selectedReportType}
              className="flex-1"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate (Client-side)
                </>
              )}
            </Button>
            
            <Button
              onClick={handleServerSideGeneration}
              disabled={generating || !selectedReportType}
              variant="outline"
              className="flex-1"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate (Server-side)
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {lastGenerated && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <div className="text-sm">
                <div className="font-medium">PDF Generated Successfully!</div>
                <div className="text-xs">
                  {lastGenerated.filename} • {lastGenerated.timestamp.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden content for HTML-to-PDF conversion */}
      <div id="appointment-summary-content" className="hidden">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">Appointment Summary</h1>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Patient Information</h2>
              <p>Name: {mockData.patient.name}</p>
              <p>Medical Record: {mockData.patient.medicalRecordNumber}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Appointment Details</h2>
              <p>Date: {mockData.appointment.date}</p>
              <p>Time: {mockData.appointment.time}</p>
              <p>Doctor: {mockData.appointment.doctor}</p>
              <p>Type: {mockData.appointment.type}</p>
              <p>Status: {mockData.appointment.status}</p>
              <p>Notes: {mockData.appointment.notes}</p>
            </div>
          </div>
        </div>
      </div>

      <div id="patient-summary-content" className="hidden">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">Patient Summary</h1>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Patient Information</h2>
              <p>Name: {mockData.patient.name}</p>
              <p>Date of Birth: {mockData.patient.dateOfBirth}</p>
              <p>Medical Record: {mockData.patient.medicalRecordNumber}</p>
              <p>Phone: {mockData.patient.phone}</p>
              <p>Email: {mockData.patient.email}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Current Medications</h2>
              {mockData.prescription.medications.map((med: any, index: number) => (
                <p key={index}>{med.name} - {med.dosage} ({med.frequency})</p>
              ))}
            </div>
            <div>
              <h2 className="text-lg font-semibold">Recent Lab Results</h2>
              {mockData.labResults.map((result: any, index: number) => (
                <p key={index}>{result.testName}: {result.results}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
