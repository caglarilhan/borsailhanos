import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve patient outcome analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('patient_outcome_analytics')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        )
      `)
      .order('analysis_period_end', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
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
    return NextResponse.json({ error: 'Failed to fetch patient outcome analytics' }, { status: 500 });
  }
}

// POST - Calculate patient outcome metrics
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { patient_id, start_date, end_date } = body;

    if (!patient_id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('calculate_patient_outcome_metrics', {
      p_patient_id: patient_id,
      p_start_date: start_date,
      p_end_date: end_date
    });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate patient outcome metrics' }, { status: 500 });
  }
}

// PUT - Generate patient outcome report
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { patient_id, start_date, end_date } = body;

    if (!patient_id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('generate_patient_outcome_report', {
      p_patient_id: patient_id,
      p_start_date: start_date,
      p_end_date: end_date
    });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate patient outcome report' }, { status: 500 });
  }
}

// PATCH - Update patient outcome analytics
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { patient_id, analysis_period_start, analysis_period_end } = body;

    if (!patient_id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase.rpc('update_patient_outcome_analytics', {
      p_patient_id: patient_id,
      p_analysis_period_start: analysis_period_start,
      p_analysis_period_end: analysis_period_end
    });

    if (error) throw error;

    return NextResponse.json({ message: 'Patient outcome analytics updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient outcome analytics' }, { status: 500 });
  }
}

