import { NextRequest, NextResponse } from 'next/server';

// Genetic Testing API Integration Service
class GeneticTestingIntegrationService {
  private apiKey: string;
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.apiKey = process.env.GENETIC_API_KEY || '';
    this.baseUrl = process.env.GENETIC_BASE_URL || 'https://api.geneticlab.com';
    this.clientId = process.env.GENETIC_CLIENT_ID || '';
    this.clientSecret = process.env.GENETIC_CLIENT_SECRET || '';
  }

  // Authenticate with Genetic Testing API
  private async authenticate(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Genetic API authentication error:', error);
      throw error;
    }
  }

  // Get available genetic tests
  async getAvailableTests(): Promise<any[]> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/v1/tests/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch available tests: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tests || [];
    } catch (error) {
      console.error('Error fetching available tests:', error);
      throw error;
    }
  }

  // Order a genetic test
  async orderGeneticTest(orderData: {
    patientId: string;
    testType: string;
    orderingProvider: string;
    clinicalIndication: string;
    consentSigned: boolean;
    sampleType: 'saliva' | 'blood' | 'buccal';
    priority?: 'routine' | 'urgent';
  }): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/v1/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: orderData.patientId,
          test_type: orderData.testType,
          ordering_provider: orderData.orderingProvider,
          clinical_indication: orderData.clinicalIndication,
          consent_signed: orderData.consentSigned,
          sample_type: orderData.sampleType,
          priority: orderData.priority || 'routine',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to order genetic test: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error ordering genetic test:', error);
      throw error;
    }
  }

  // Get genetic test results
  async getGeneticTestResults(orderId: string): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/v1/orders/${orderId}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch genetic test results: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching genetic test results:', error);
      throw error;
    }
  }

  // Get test status
  async getTestStatus(orderId: string): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/v1/orders/${orderId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch test status: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching test status:', error);
      throw error;
    }
  }

  // Get patient genetic profile
  async getPatientGeneticProfile(patientId: string): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/v1/patients/${patientId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patient genetic profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching patient genetic profile:', error);
      throw error;
    }
  }

  // Get medication recommendations based on genetic profile
  async getMedicationRecommendations(patientId: string, medicationList: string[]): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/v1/patients/${patientId}/medication-recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medications: medicationList,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get medication recommendations: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting medication recommendations:', error);
      throw error;
    }
  }

  // Get drug interaction analysis
  async getDrugInteractionAnalysis(patientId: string, medications: string[]): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/v1/patients/${patientId}/drug-interactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medications,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get drug interaction analysis: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting drug interaction analysis:', error);
      throw error;
    }
  }

  // Schedule sample collection
  async scheduleSampleCollection(appointmentData: {
    orderId: string;
    patientId: string;
    appointmentDate: string;
    appointmentTime: string;
    collectionType: 'home' | 'clinic' | 'mobile';
    address?: string;
  }): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/v1/appointments/collection`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error(`Failed to schedule sample collection: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error scheduling sample collection:', error);
      throw error;
    }
  }

  // Get genetic counseling resources
  async getGeneticCounselingResources(patientId: string): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/v1/patients/${patientId}/counseling-resources`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch counseling resources: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching counseling resources:', error);
      throw error;
    }
  }
}

// API Routes for Genetic Testing Integration
const geneticService = new GeneticTestingIntegrationService();

// GET /api/genetic-tests - Get genetic test data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    switch (endpoint) {
      case 'available-tests':
        const tests = await geneticService.getAvailableTests();
        return NextResponse.json({ tests });

      case 'patient-profile':
        const patientId = searchParams.get('patientId');
        
        if (!patientId) {
          return NextResponse.json(
            { error: 'Patient ID is required' },
            { status: 400 }
          );
        }
        
        const profile = await geneticService.getPatientGeneticProfile(patientId);
        return NextResponse.json({ profile });

      case 'test-status':
        const orderId = searchParams.get('orderId');
        
        if (!orderId) {
          return NextResponse.json(
            { error: 'Order ID is required' },
            { status: 400 }
          );
        }
        
        const status = await geneticService.getTestStatus(orderId);
        return NextResponse.json({ status });

      case 'test-results':
        const resultOrderId = searchParams.get('orderId');
        
        if (!resultOrderId) {
          return NextResponse.json(
            { error: 'Order ID is required' },
            { status: 400 }
          );
        }
        
        const results = await geneticService.getGeneticTestResults(resultOrderId);
        return NextResponse.json({ results });

      case 'counseling-resources':
        const resourcePatientId = searchParams.get('patientId');
        
        if (!resourcePatientId) {
          return NextResponse.json(
            { error: 'Patient ID is required' },
            { status: 400 }
          );
        }
        
        const resources = await geneticService.getGeneticCounselingResources(resourcePatientId);
        return NextResponse.json({ resources });

      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Genetic API error:', error);
    return NextResponse.json(
      { error: 'Genetic API error' },
      { status: 500 }
    );
  }
}

// POST /api/genetic-tests - Order genetic tests and get recommendations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'order-test':
        const orderResult = await geneticService.orderGeneticTest(data);
        return NextResponse.json({ order: orderResult }, { status: 201 });

      case 'medication-recommendations':
        const { patientId, medications } = data;
        if (!patientId || !medications) {
          return NextResponse.json(
            { error: 'Patient ID and medications are required' },
            { status: 400 }
          );
        }
        
        const recommendations = await geneticService.getMedicationRecommendations(patientId, medications);
        return NextResponse.json({ recommendations });

      case 'drug-interactions':
        const { patientId: interactionPatientId, medications: interactionMedications } = data;
        if (!interactionPatientId || !interactionMedications) {
          return NextResponse.json(
            { error: 'Patient ID and medications are required' },
            { status: 400 }
          );
        }
        
        const interactions = await geneticService.getDrugInteractionAnalysis(interactionPatientId, interactionMedications);
        return NextResponse.json({ interactions });

      case 'schedule-collection':
        const appointmentResult = await geneticService.scheduleSampleCollection(data);
        return NextResponse.json({ appointment: appointmentResult }, { status: 201 });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Genetic API error:', error);
    return NextResponse.json(
      { error: 'Genetic API error' },
      { status: 500 }
    );
  }
}
