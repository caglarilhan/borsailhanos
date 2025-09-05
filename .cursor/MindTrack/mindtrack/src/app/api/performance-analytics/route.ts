import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve performance analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const practitionerId = searchParams.get('practitioner_id');
    const analysisDate = searchParams.get('analysis_date');
    const analysisPeriodMonths = searchParams.get('analysis_period_months');

    let query = supabase
      .from('performance_analytics')
      .select(`
        *,
        practitioners:users!practitioner_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('analysis_date', { ascending: false });

    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
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
    return NextResponse.json({ error: 'Failed to fetch performance analytics' }, { status: 500 });
  }
}

// POST - Create performance analytics
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      analysis_date,
      analysis_period_months,
      practitioner_id,
      total_patients,
      total_encounters,
      quality_measures_performance,
      hedis_performance,
      cms_performance,
      patient_satisfaction_score,
      readmission_rate,
      length_of_stay_avg,
      cost_per_patient,
      efficiency_score,
      outcome_measures,
      benchmark_comparison,
      trend_analysis
    } = body;

    // Validate required fields
    if (!analysis_date || !analysis_period_months) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('performance_analytics')
      .insert({
        analysis_date,
        analysis_period_months,
        practitioner_id,
        total_patients: total_patients || 0,
        total_encounters: total_encounters || 0,
        quality_measures_performance,
        hedis_performance,
        cms_performance,
        patient_satisfaction_score,
        readmission_rate,
        length_of_stay_avg,
        cost_per_patient,
        efficiency_score,
        outcome_measures,
        benchmark_comparison,
        trend_analysis
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create performance analytics' }, { status: 500 });
  }
}

// PUT - Update performance analytics
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Performance analytics ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('performance_analytics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update performance analytics' }, { status: 500 });
  }
}

// DELETE - Delete performance analytics
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Performance analytics ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('performance_analytics')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Performance analytics deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete performance analytics' }, { status: 500 });
  }
}
