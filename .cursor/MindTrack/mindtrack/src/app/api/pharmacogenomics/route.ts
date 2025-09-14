import { NextResponse } from 'next/server';
import PharmacogenomicsIntegration from '@/lib/pharmacogenomics-integration';
import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const patientId = searchParams.get('patientId');
    const drugName = searchParams.get('drugName');
    const gene = searchParams.get('gene');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const pharmacogenomics = new PharmacogenomicsIntegration();

    switch (action) {
      case 'get-variants':
        const variants = await pharmacogenomics.getGeneticVariants(patientId || undefined, gene || undefined);
        return NextResponse.json({ success: true, data: variants });

      case 'get-tests':
        const tests = await pharmacogenomics.getPharmacogenomicTests(patientId || undefined);
        return NextResponse.json({ success: true, data: tests });

      case 'get-interactions':
        const interactions = await pharmacogenomics.getDrugGeneInteractions(drugName || undefined, gene || undefined);
        return NextResponse.json({ success: true, data: interactions });

      case 'get-analytics':
        const analyticsDateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;
        const analytics = await pharmacogenomics.getPharmacogenomicAnalytics(analyticsDateRange);
        return NextResponse.json({ success: true, data: analytics });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Pharmacogenomics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, data } = body;

    const pharmacogenomics = new PharmacogenomicsIntegration();

    switch (action) {
      case 'create-variant':
        const newVariant = await pharmacogenomics.createGeneticVariant(data);
        return NextResponse.json({ success: true, data: newVariant });

      case 'create-test':
        const newTest = await pharmacogenomics.createPharmacogenomicTest(data);
        return NextResponse.json({ success: true, data: newTest });

      case 'update-test-status':
        const updatedTest = await pharmacogenomics.updateTestStatus(data.testId, data.status, data.results);
        return NextResponse.json({ success: true, data: updatedTest });

      case 'analyze-interaction':
        const interactionAnalysis = await pharmacogenomics.analyzeDrugGeneInteraction(data.drugName, data.variants);
        return NextResponse.json({ success: true, data: interactionAnalysis });

      case 'generate-treatment':
        const personalizedTreatment = await pharmacogenomics.generatePersonalizedTreatment(data.patientId, data.medication);
        return NextResponse.json({ success: true, data: personalizedTreatment });

      case 'create-interaction':
        const newInteraction = await pharmacogenomics.createDrugGeneInteraction(data);
        return NextResponse.json({ success: true, data: newInteraction });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Pharmacogenomics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

