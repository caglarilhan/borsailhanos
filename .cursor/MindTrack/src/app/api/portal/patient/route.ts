import { NextRequest, NextResponse } from 'next/server';

// Mock patient data - in real app, this would come from database
const mockPatients = [
  {
    id: 'patient-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-03-15',
    medicalRecordNumber: 'MR-2024-001',
    lastVisit: '2024-09-01',
    nextAppointment: '2024-09-20',
    status: 'active'
  },
  {
    id: 'patient-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 987-6543',
    dateOfBirth: '1990-07-22',
    medicalRecordNumber: 'MR-2024-002',
    lastVisit: '2024-08-15',
    nextAppointment: null,
    status: 'active'
  }
];

const mockAppointments = [
  {
    id: '1',
    patientId: 'patient-1',
    date: '2024-09-20',
    time: '10:00 AM',
    doctor: 'Dr. Sarah Johnson',
    type: 'Follow-up',
    status: 'scheduled',
    notes: 'Regular checkup'
  },
  {
    id: '2',
    patientId: 'patient-1',
    date: '2024-09-01',
    time: '2:00 PM',
    doctor: 'Dr. Sarah Johnson',
    type: 'Consultation',
    status: 'completed',
    notes: 'Initial consultation completed'
  }
];

const mockMedications = [
  {
    id: '1',
    patientId: 'patient-1',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    startDate: '2024-08-15',
    status: 'active',
    instructions: 'Take with food'
  },
  {
    id: '2',
    patientId: 'patient-1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    startDate: '2024-08-15',
    status: 'active',
    instructions: 'Take in the morning'
  }
];

const mockLabResults = [
  {
    id: '1',
    patientId: 'patient-1',
    testName: 'Complete Blood Count',
    date: '2024-09-01',
    status: 'completed',
    results: 'Normal',
    doctor: 'Dr. Sarah Johnson'
  },
  {
    id: '2',
    patientId: 'patient-1',
    testName: 'Lipid Panel',
    date: '2024-09-01',
    status: 'completed',
    results: 'Cholesterol slightly elevated',
    doctor: 'Dr. Sarah Johnson'
  },
  {
    id: '3',
    patientId: 'patient-1',
    testName: 'HbA1c',
    date: '2024-09-15',
    status: 'pending',
    doctor: 'Dr. Sarah Johnson'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const dataType = searchParams.get('type');

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Find patient
    const patient = mockPatients.find(p => p.id === patientId);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    switch (dataType) {
      case 'patient':
        return NextResponse.json({
          success: true,
          data: patient
        });

      case 'appointments':
        const appointments = mockAppointments.filter(apt => apt.patientId === patientId);
        return NextResponse.json({
          success: true,
          data: appointments
        });

      case 'medications':
        const medications = mockMedications.filter(med => med.patientId === patientId);
        return NextResponse.json({
          success: true,
          data: medications
        });

      case 'lab-results':
        const labResults = mockLabResults.filter(lab => lab.patientId === patientId);
        return NextResponse.json({
          success: true,
          data: labResults
        });

      case 'all':
        const allData = {
          patient,
          appointments: mockAppointments.filter(apt => apt.patientId === patientId),
          medications: mockMedications.filter(med => med.patientId === patientId),
          labResults: mockLabResults.filter(lab => lab.patientId === patientId)
        };
        return NextResponse.json({
          success: true,
          data: allData
        });

      default:
        return NextResponse.json(
          { error: 'Invalid data type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Client portal API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, patientId, data } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'update-profile':
        // In real app, update patient profile in database
        return NextResponse.json({
          success: true,
          message: 'Profile updated successfully'
        });

      case 'request-appointment':
        // In real app, create appointment request
        return NextResponse.json({
          success: true,
          message: 'Appointment request submitted',
          data: {
            id: 'new-appointment-id',
            status: 'pending'
          }
        });

      case 'update-medication-adherence':
        // In real app, update medication adherence tracking
        return NextResponse.json({
          success: true,
          message: 'Medication adherence updated'
        });

      case 'download-document':
        // In real app, generate secure download link
        return NextResponse.json({
          success: true,
          downloadUrl: `/api/documents/download/${data.documentId}`,
          expiresIn: 3600
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Client portal POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


