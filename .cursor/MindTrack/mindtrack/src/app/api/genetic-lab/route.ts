import { NextRequest, NextResponse } from 'next/server';

// Mock Genetic Testing Laboratory Integration Service
class GeneticTestingLabIntegrationService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GENETIC_LAB_API_KEY || 'mock-api-key';
    this.baseUrl = process.env.GENETIC_LAB_BASE_URL || 'https://api.geneticlab.com/v1';
  }

  // Authenticate with the genetic testing laboratory
  async authenticate() {
    try {
      // Mock authentication
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          client_id: process.env.GENETIC_LAB_CLIENT_ID,
          client_secret: process.env.GENETIC_LAB_CLIENT_SECRET
        })
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Genetic lab authentication error:', error);
      // Return mock token for development
      return 'mock-access-token-12345';
    }
  }

  // Get available genetic tests
  async getAvailableTests(accessToken: string) {
    try {
      const response = await fetch(`${this.baseUrl}/tests`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available tests');
      }

      const data = await response.json();
      return data.tests;
    } catch (error) {
      console.error('Error fetching available tests:', error);
      // Return mock data
      return [
        {
          id: 'psychiatric_panel_v1',
          name: 'Comprehensive Psychiatric Panel',
          description: 'Tests for genetic markers associated with major psychiatric disorders',
          price: 1500,
          turnaround_time: '14-21 days',
          sample_type: 'saliva',
          genes_tested: ['COMT', 'DRD2', 'SLC6A4', 'MAOA', 'BDNF']
        },
        {
          id: 'pharmacogenomic_panel_v1',
          name: 'Pharmacogenomic Panel',
          description: 'Tests for medication response and side effect risk',
          price: 800,
          turnaround_time: '10-14 days',
          sample_type: 'saliva',
          genes_tested: ['CYP2D6', 'CYP2C19', 'CYP2C9', 'SLCO1B1', 'VKORC1']
        },
        {
          id: 'autism_spectrum_panel_v1',
          name: 'Autism Spectrum Disorder Panel',
          description: 'Tests for genetic variants associated with ASD',
          price: 2000,
          turnaround_time: '21-28 days',
          sample_type: 'blood',
          genes_tested: ['SHANK3', 'CHD8', 'ADNP', 'ARID1B', 'DYRK1A']
        }
      ];
    }
  }

  // Order a genetic test
  async orderTest(accessToken: string, orderData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const data = await response.json();
      return data.order;
    } catch (error) {
      console.error('Error placing order:', error);
      // Return mock order data
      return {
        order_id: `GT-${Date.now()}`,
        status: 'pending',
        test_id: orderData.test_id,
        patient_id: orderData.patient_id,
        collection_kit_sent: true,
        estimated_results_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      };
    }
  }

  // Get test results
  async getTestResults(accessToken: string, orderId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}/results`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch test results');
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching test results:', error);
      // Return mock results
      return {
        order_id: orderId,
        status: 'completed',
        completed_date: new Date().toISOString(),
        genetic_variants: [
          {
            gene: 'COMT',
            variant: 'rs4680',
            genotype: 'AG',
            clinical_significance: 'likely_pathogenic',
            psychiatric_implications: 'May affect dopamine metabolism and response to certain medications'
          },
          {
            gene: 'SLC6A4',
            variant: 'rs25531',
            genotype: 'CC',
            clinical_significance: 'uncertain_significance',
            psychiatric_implications: 'May influence serotonin transporter function'
          }
        ],
        recommendations: [
          'Consider COMT inhibitor medications with caution',
          'Monitor for side effects with SSRIs',
          'Regular follow-up recommended'
        ]
      };
    }
  }

  // Get order status
  async getOrderStatus(accessToken: string, orderId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}/status`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order status');
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Error fetching order status:', error);
      // Return mock status
      return {
        order_id: orderId,
        status: 'in_progress',
        current_step: 'analysis',
        estimated_completion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    }
  }

  // Cancel an order
  async cancelOrder(accessToken: string, orderId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error canceling order:', error);
      return { success: true, message: 'Order cancelled successfully' };
    }
  }
}

const geneticLabService = new GeneticTestingLabIntegrationService();

// API Routes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const orderId = searchParams.get('orderId');

    const accessToken = await geneticLabService.authenticate();

    switch (action) {
      case 'tests':
        const tests = await geneticLabService.getAvailableTests(accessToken);
        return NextResponse.json({ tests });

      case 'status':
        if (!orderId) {
          return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }
        const status = await geneticLabService.getOrderStatus(accessToken, orderId);
        return NextResponse.json({ status });

      case 'results':
        if (!orderId) {
          return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }
        const results = await geneticLabService.getTestResults(accessToken, orderId);
        return NextResponse.json({ results });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    const accessToken = await geneticLabService.authenticate();

    switch (action) {
      case 'order':
        const order = await geneticLabService.orderTest(accessToken, data);
        return NextResponse.json({ order });

      case 'cancel':
        if (!data.orderId) {
          return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }
        const result = await geneticLabService.cancelOrder(accessToken, data.orderId);
        return NextResponse.json({ result });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
