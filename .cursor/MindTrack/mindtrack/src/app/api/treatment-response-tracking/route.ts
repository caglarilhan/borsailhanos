import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve treatment response tracking
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const medicationId = searchParams.get('medication_id');
    const responseCategory = searchParams.get('response_category');
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = supabase
      .from('treatment_response_tracking')
      .select(`
        *,
        medications (
          id,
          name,
          generic_name,
          drug_class
        ),
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        )
      `)
      .order('treatment_start_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (medicationId) {
      query = query.eq('medication_id', medicationId);
    }
    if (responseCategory) {
      query = query.eq('response_category', responseCategory);
    }
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch treatment response tracking' }, { status: 500 });
  }
}

// POST - Create new treatment response tracking
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      medication_id,
      treatment_start_date,
      treatment_end_date,
      is_active,
      response_category,
      response_criteria,
      time_to_response_days,
      time_to_remission_days,
      relapse_events,
      last_relapse_date,
      dose_optimization_attempts,
      medication_changes,
      discontinuation_reason,
      discontinuation_date,
      clinical_outcome,
      functional_recovery_score,
      quality_of_life_improvement
    } = body;

    // Validate required fields
    if (!patient_id || !medication_id || !treatment_start_date || !response_category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('treatment_response_tracking')
      .insert({
        patient_id,
        medication_id,
        treatment_start_date,
        treatment_end_date,
        is_active: is_active !== undefined ? is_active : true,
        response_category,
        response_criteria,
        time_to_response_days,
        time_to_remission_days,
        relapse_events: relapse_events || 0,
        last_relapse_date,
        dose_optimization_attempts: dose_optimization_attempts || 0,
        medication_changes: medication_changes || 0,
        discontinuation_reason,
        discontinuation_date,
        clinical_outcome,
        functional_recovery_score,
        quality_of_life_improvement
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create treatment response tracking' }, { status: 500 });
  }
}

// PUT - Update treatment response tracking
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Tracking ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('treatment_response_tracking')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update treatment response tracking' }, { status: 500 });
  }
}

// DELETE - Delete treatment response tracking
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Tracking ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('treatment_response_tracking')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Treatment response tracking deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete treatment response tracking' }, { status: 500 });
  }
}




