import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve patient outcome sessions
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const sessionType = searchParams.get('session_type');
    const sessionOutcome = searchParams.get('session_outcome');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('patient_outcome_sessions')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        clinician:users!session_conducted_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('session_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (sessionType) {
      query = query.eq('session_type', sessionType);
    }
    if (sessionOutcome) {
      query = query.eq('session_outcome', sessionOutcome);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('session_date', startDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient outcome sessions' }, { status: 500 });
  }
}

// POST - Create new patient outcome session
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      session_date,
      session_type,
      session_duration_minutes,
      primary_diagnosis,
      secondary_diagnoses,
      session_objectives,
      interventions_provided,
      outcome_measures_collected,
      patient_engagement_level,
      therapeutic_alliance_rating,
      session_outcome,
      clinical_notes,
      treatment_plan_updates,
      next_session_date,
      follow_up_required,
      crisis_intervention_provided,
      medication_changes,
      referrals_made,
      session_conducted_by
    } = body;

    // Validate required fields
    if (!patient_id || !session_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_outcome_sessions')
      .insert({
        patient_id,
        session_date: session_date || new Date().toISOString().split('T')[0],
        session_type,
        session_duration_minutes,
        primary_diagnosis,
        secondary_diagnoses,
        session_objectives,
        interventions_provided,
        outcome_measures_collected,
        patient_engagement_level,
        therapeutic_alliance_rating,
        session_outcome,
        clinical_notes,
        treatment_plan_updates,
        next_session_date,
        follow_up_required: follow_up_required || false,
        crisis_intervention_provided: crisis_intervention_provided || false,
        medication_changes,
        referrals_made,
        session_conducted_by
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create patient outcome session' }, { status: 500 });
  }
}

// PUT - Update patient outcome session
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_outcome_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient outcome session' }, { status: 500 });
  }
}

// DELETE - Delete patient outcome session
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('patient_outcome_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Patient outcome session deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient outcome session' }, { status: 500 });
  }
}
