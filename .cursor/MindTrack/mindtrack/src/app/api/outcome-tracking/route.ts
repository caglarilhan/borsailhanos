import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve outcome tracking
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const practitionerId = searchParams.get('practitioner_id');
    const outcomeType = searchParams.get('outcome_type');
    const outcomeMeasure = searchParams.get('outcome_measure');
    const goalAchieved = searchParams.get('goal_achieved');

    let query = supabase
      .from('outcome_tracking')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        practitioners:users!practitioner_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('current_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    if (outcomeType) {
      query = query.eq('outcome_type', outcomeType);
    }
    if (outcomeMeasure) {
      query = query.eq('outcome_measure', outcomeMeasure);
    }
    if (goalAchieved) {
      query = query.eq('goal_achieved', goalAchieved === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch outcome tracking' }, { status: 500 });
  }
}

// POST - Create outcome tracking
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      practitioner_id,
      outcome_type,
      outcome_measure,
      baseline_value,
      baseline_date,
      target_value,
      target_date,
      current_value,
      current_date,
      improvement_percentage,
      goal_achieved,
      measurement_frequency,
      last_measurement_date,
      next_measurement_date,
      measurement_notes
    } = body;

    // Validate required fields
    if (!patient_id || !practitioner_id || !outcome_type || !outcome_measure) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('outcome_tracking')
      .insert({
        patient_id,
        practitioner_id,
        outcome_type,
        outcome_measure,
        baseline_value,
        baseline_date,
        target_value,
        target_date,
        current_value,
        current_date,
        improvement_percentage,
        goal_achieved: goal_achieved || false,
        measurement_frequency,
        last_measurement_date,
        next_measurement_date,
        measurement_notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create outcome tracking' }, { status: 500 });
  }
}

// PUT - Update outcome tracking
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Outcome tracking ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('outcome_tracking')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update outcome tracking' }, { status: 500 });
  }
}

// DELETE - Delete outcome tracking
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Outcome tracking ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('outcome_tracking')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Outcome tracking deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete outcome tracking' }, { status: 500 });
  }
}



