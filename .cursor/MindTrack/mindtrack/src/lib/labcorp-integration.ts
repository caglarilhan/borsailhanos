import { NextRequest, NextResponse } from 'next/server';

// LabCorp API Integration Service
class LabCorpIntegrationService {
  private apiKey: string;
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.apiKey = process.env.LABCORP_API_KEY || '';
    this.baseUrl = process.env.LABCORP_BASE_URL || 'https://api.labcorp.com';
    this.clientId = process.env.LABCORP_CLIENT_ID || '';
    this.clientSecret = process.env.LABCORP_CLIENT_SECRET || '';
  }

  // Authenticate with LabCorp API
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
      console.error('LabCorp authentication error:', error);
      throw error;
    }
  }

  // Get available test catalog
  async getTestCatalog(): Promise<any[]> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/v1/tests/catalog`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch test catalog: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tests || [];
    } catch (error) {
      console.error('Error fetching test catalog:', error);
      throw error;
    }
  }

  // Order a laboratory test
  async orderTest(orderData: {
    patientId: string;
    testCodes: string[];
    orderingProvider: string;
    clinicalIndication?: string;
    priority?: 'routine' | 'urgent' | 'stat';
    collectionDate?: string;
    collectionLocation?: string;
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
          test_codes: orderData.testCodes,
          ordering_provider: orderData.orderingProvider,
          clinical_indication: orderData.clinicalIndication,
          priority: orderData.priority || 'routine',
          collection_date: orderData.collectionDate,
          collection_location: orderData.collectionLocation,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to order test: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error ordering test:', error);
      throw error;
    }
  }

  // Get test results
  async getTestResults(orderId: string): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/v1/orders/${orderId}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch test results: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching test results:', error);
      throw error;
    }
  }

  // Get patient test history
  async getPatientTestHistory(patientId: string, daysBack: number = 365): Promise<any[]> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(
        `${this.baseUrl}/v1/patients/${patientId}/results?days_back=${daysBack}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch patient history: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching patient history:', error);
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

  // Cancel test order
  async cancelTestOrder(orderId: string, reason: string): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/v1/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel test order: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error canceling test order:', error);
      throw error;
    }
  }

  // Get collection locations
  async getCollectionLocations(zipCode: string, radius: number = 10): Promise<any[]> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(
        `${this.baseUrl}/v1/locations/collection?zip_code=${zipCode}&radius=${radius}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch collection locations: ${response.statusText}`);
      }

      const data = await response.json();
      return data.locations || [];
    } catch (error) {
      console.error('Error fetching collection locations:', error);
      throw error;
    }
  }

  // Schedule appointment
  async scheduleAppointment(appointmentData: {
    orderId: string;
    locationId: string;
    appointmentDate: string;
    appointmentTime: string;
    patientId: string;
  }): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/v1/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error(`Failed to schedule appointment: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      throw error;
    }
  }
}

// API Routes for LabCorp Integration
const labCorpService = new LabCorpIntegrationService();

// GET /api/labcorp/catalog - Get available tests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    switch (endpoint) {
      case 'catalog':
        const catalog = await labCorpService.getTestCatalog();
        return NextResponse.json({ catalog });

      case 'patient-history':
        const patientId = searchParams.get('patientId');
        const daysBack = parseInt(searchParams.get('daysBack') || '365');
        
        if (!patientId) {
          return NextResponse.json(
            { error: 'Patient ID is required' },
            { status: 400 }
          );
        }
        
        const history = await labCorpService.getPatientTestHistory(patientId, daysBack);
        return NextResponse.json({ history });

      case 'test-status':
        const orderId = searchParams.get('orderId');
        
        if (!orderId) {
          return NextResponse.json(
            { error: 'Order ID is required' },
            { status: 400 }
          );
        }
        
        const status = await labCorpService.getTestStatus(orderId);
        return NextResponse.json({ status });

      case 'test-results':
        const resultOrderId = searchParams.get('orderId');
        
        if (!resultOrderId) {
          return NextResponse.json(
            { error: 'Order ID is required' },
            { status: 400 }
          );
        }
        
        const results = await labCorpService.getTestResults(resultOrderId);
        return NextResponse.json({ results });

      case 'locations':
        const zipCode = searchParams.get('zipCode');
        const radius = parseInt(searchParams.get('radius') || '10');
        
        if (!zipCode) {
          return NextResponse.json(
            { error: 'Zip code is required' },
            { status: 400 }
          );
        }
        
        const locations = await labCorpService.getCollectionLocations(zipCode, radius);
        return NextResponse.json({ locations });

      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('LabCorp API error:', error);
    return NextResponse.json(
      { error: 'LabCorp API error' },
      { status: 500 }
    );
  }
}

// POST /api/labcorp/order - Order a test
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'order-test':
        const orderResult = await labCorpService.orderTest(data);
        return NextResponse.json({ order: orderResult }, { status: 201 });

      case 'schedule-appointment':
        const appointmentResult = await labCorpService.scheduleAppointment(data);
        return NextResponse.json({ appointment: appointmentResult }, { status: 201 });

      case 'cancel-order':
        const { orderId, reason } = data;
        if (!orderId || !reason) {
          return NextResponse.json(
            { error: 'Order ID and reason are required' },
            { status: 400 }
          );
        }
        
        const cancelResult = await labCorpService.cancelTestOrder(orderId, reason);
        return NextResponse.json({ cancel: cancelResult });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('LabCorp API error:', error);
    return NextResponse.json(
      { error: 'LabCorp API error' },
      { status: 500 }
    );
  }
}
