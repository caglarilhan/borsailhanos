import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve mobile health analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const practitionerId = searchParams.get('practitioner_id');
    const analysisDate = searchParams.get('analysis_date');
    const analysisPeriodMonths = searchParams.get('analysis_period_months');

    let query = supabase
      .from('mobile_health_analytics')
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
    return NextResponse.json({ error: 'Failed to fetch mobile health analytics' }, { status: 500 });
  }
}

// POST - Create mobile health analytics
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      analysis_date,
      analysis_period_months,
      practitioner_id,
      total_patients_monitored,
      total_devices_active,
      total_data_points_collected,
      average_data_quality_score,
      patient_engagement_rate,
      medication_adherence_rate,
      symptom_tracking_completion_rate,
      alert_response_time_avg_hours,
      false_positive_rate,
      patient_satisfaction_score,
      cost_per_patient_monitored,
      roi_percentage,
      clinical_outcomes,
      device_usage_statistics,
      engagement_trends,
      cost_effectiveness
    } = body;

    // Validate required fields
    if (!analysis_date || !analysis_period_months) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('mobile_health_analytics')
      .insert({
        analysis_date,
        analysis_period_months,
        practitioner_id,
        total_patients_monitored: total_patients_monitored || 0,
        total_devices_active: total_devices_active || 0,
        total_data_points_collected: total_data_points_collected || 0,
        average_data_quality_score,
        patient_engagement_rate,
        medication_adherence_rate,
        symptom_tracking_completion_rate,
        alert_response_time_avg_hours,
        false_positive_rate,
        patient_satisfaction_score,
        cost_per_patient_monitored,
        roi_percentage,
        clinical_outcomes,
        device_usage_statistics,
        engagement_trends,
        cost_effectiveness
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create mobile health analytics' }, { status: 500 });
  }
}

// PUT - Update mobile health analytics
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Mobile health analytics ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('mobile_health_analytics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update mobile health analytics' }, { status: 500 });
  }
}

// DELETE - Delete mobile health analytics
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Mobile health analytics ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('mobile_health_analytics')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Mobile health analytics deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete mobile health analytics' }, { status: 500 });
  }
}
