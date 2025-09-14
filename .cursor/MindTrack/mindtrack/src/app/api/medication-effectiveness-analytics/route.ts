import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve medication effectiveness analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const medicationId = searchParams.get('medication_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('medication_effectiveness_analytics')
      .select(`
        *,
        medications (
          id,
          name,
          generic_name,
          drug_class
        )
      `)
      .order('analysis_period_end', { ascending: false });

    if (medicationId) {
      query = query.eq('medication_id', medicationId);
    }
    if (startDate) {
      query = query.gte('analysis_period_start', startDate);
    }
    if (endDate) {
      query = query.lte('analysis_period_end', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch effectiveness analytics' }, { status: 500 });
  }
}

// POST - Calculate medication effectiveness metrics
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { medication_id, start_date, end_date } = body;

    if (!medication_id) {
      return NextResponse.json(
        { error: 'Medication ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('calculate_medication_effectiveness_metrics', {
      p_medication_id: medication_id,
      p_start_date: start_date,
      p_end_date: end_date
    });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate effectiveness metrics' }, { status: 500 });
  }
}

// PUT - Generate effectiveness report
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { medication_id, start_date, end_date } = body;

    if (!medication_id) {
      return NextResponse.json(
        { error: 'Medication ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('generate_effectiveness_report', {
      p_medication_id: medication_id,
      p_start_date: start_date,
      p_end_date: end_date
    });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate effectiveness report' }, { status: 500 });
  }
}

// PATCH - Update effectiveness analytics
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { medication_id, analysis_period_start, analysis_period_end } = body;

    if (!medication_id) {
      return NextResponse.json(
        { error: 'Medication ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase.rpc('update_medication_effectiveness_analytics', {
      p_medication_id: medication_id,
      p_analysis_period_start: analysis_period_start,
      p_analysis_period_end: analysis_period_end
    });

    if (error) throw error;

    return NextResponse.json({ message: 'Effectiveness analytics updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update effectiveness analytics' }, { status: 500 });
  }
}


