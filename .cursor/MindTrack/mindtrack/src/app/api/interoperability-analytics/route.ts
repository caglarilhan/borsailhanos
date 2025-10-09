import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve interoperability analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const analysisDate = searchParams.get('analysis_date');
    const analysisPeriodMonths = searchParams.get('analysis_period_months');

    let query = supabase
      .from('interoperability_analytics')
      .select('*')
      .order('analysis_date', { ascending: false });

    if (analysisDate) {
      query = query.eq('analysis_date', analysisDate);
    }
    if (analysisPeriodMonths) {
      query = query.eq('analysis_period_months', parseInt(analysisPeriodMonths));
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch interoperability analytics' }, { status: 500 });
  }
}

// POST - Create interoperability analytics
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      analysis_date,
      analysis_period_months,
      total_connections,
      active_connections,
      total_syncs,
      successful_syncs,
      failed_syncs,
      average_sync_time_seconds,
      total_records_exchanged,
      data_quality_score,
      system_uptime_percentage,
      error_rate_percentage,
      performance_metrics,
      compliance_metrics,
      cost_analysis
    } = body;

    // Validate required fields
    if (!analysis_date || !analysis_period_months) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('interoperability_analytics')
      .insert({
        analysis_date,
        analysis_period_months,
        total_connections: total_connections || 0,
        active_connections: active_connections || 0,
        total_syncs: total_syncs || 0,
        successful_syncs: successful_syncs || 0,
        failed_syncs: failed_syncs || 0,
        average_sync_time_seconds,
        total_records_exchanged: total_records_exchanged || 0,
        data_quality_score,
        system_uptime_percentage,
        error_rate_percentage,
        performance_metrics,
        compliance_metrics,
        cost_analysis
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create interoperability analytics' }, { status: 500 });
  }
}

// PUT - Update interoperability analytics
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Interoperability analytics ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('interoperability_analytics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update interoperability analytics' }, { status: 500 });
  }
}

// DELETE - Delete interoperability analytics
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Interoperability analytics ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('interoperability_analytics')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Interoperability analytics deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete interoperability analytics' }, { status: 500 });
  }
}











