import { NextResponse } from 'next/server';
import AdvancedLaboratoryIntegration from '@/lib/laboratory-integration';
import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const patientId = searchParams.get('patientId');
    const integrationId = searchParams.get('integrationId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const labIntegration = new AdvancedLaboratoryIntegration();

    switch (action) {
      case 'get-integrations':
        const integrations = await labIntegration.getLabIntegrations();
        return NextResponse.json({ success: true, data: integrations });

      case 'get-results':
        const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;
        const results = await labIntegration.getLabResults(patientId || undefined, dateRange);
        return NextResponse.json({ success: true, data: results });

      case 'get-analytics':
        const analyticsDateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;
        const analytics = await labIntegration.getLabAnalytics(analyticsDateRange);
        return NextResponse.json({ success: true, data: analytics });

      case 'quality-control':
        const qualityMetrics = await labIntegration.performQualityControl();
        return NextResponse.json({ success: true, data: qualityMetrics });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Laboratory integration API error:', error);
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

    const labIntegration = new AdvancedLaboratoryIntegration();

    switch (action) {
      case 'create-integration':
        const newIntegration = await labIntegration.createLabIntegration(data);
        return NextResponse.json({ success: true, data: newIntegration });

      case 'update-integration':
        const updatedIntegration = await labIntegration.updateLabIntegration(data.id, data.updates);
        return NextResponse.json({ success: true, data: updatedIntegration });

      case 'process-results':
        const processedResults = await labIntegration.processLabResults(data.results);
        return NextResponse.json({ success: true, data: processedResults });

      case 'sync-data':
        const syncedResults = await labIntegration.syncLabData(data.integrationId);
        return NextResponse.json({ success: true, data: syncedResults });

      case 'create-alert':
        await labIntegration.createLabAlert(data.patientId, data.resultId, data.alertType);
        return NextResponse.json({ success: true, message: 'Alert created successfully' });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Laboratory integration API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


