import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve patient outcome goals
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const goalCategory = searchParams.get('goal_category');
    const goalType = searchParams.get('goal_type');
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = supabase
      .from('patient_outcome_goals')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        creator:users!created_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('target_date', { ascending: true });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (goalCategory) {
      query = query.eq('goal_category', goalCategory);
    }
    if (goalType) {
      query = query.eq('goal_type', goalType);
    }
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient outcome goals' }, { status: 500 });
  }
}

// POST - Create new patient outcome goal
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      goal_name,
      goal_description,
      goal_category,
      goal_type,
      target_date,
      baseline_value,
      target_value,
      measurement_frequency,
      success_criteria,
      progress_notes,
      is_active,
      created_by
    } = body;

    // Validate required fields
    if (!patient_id || !goal_name || !goal_category || !goal_type || !target_date || !target_value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_outcome_goals')
      .insert({
        patient_id,
        goal_name,
        goal_description,
        goal_category,
        goal_type,
        target_date,
        baseline_value,
        target_value,
        measurement_frequency,
        success_criteria,
        progress_notes,
        is_active: is_active !== undefined ? is_active : true,
        created_by
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create patient outcome goal' }, { status: 500 });
  }
}

// PUT - Update patient outcome goal
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_outcome_goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient outcome goal' }, { status: 500 });
  }
}

// DELETE - Delete patient outcome goal
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('patient_outcome_goals')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Patient outcome goal deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient outcome goal' }, { status: 500 });
  }
}
