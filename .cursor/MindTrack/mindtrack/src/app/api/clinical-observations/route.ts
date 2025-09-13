import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve clinical observations
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const practitionerId = searchParams.get('practitioner_id');
    const encounterId = searchParams.get('encounter_id');
    const observationType = searchParams.get('observation_type');
    const observationCategory = searchParams.get('observation_category');
    const status = searchParams.get('status');
    const effectiveDateFrom = searchParams.get('effective_date_from');
    const effectiveDateTo = searchParams.get('effective_date_to');

    let query = supabase
      .from('clinical_observations')
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
        ),
        fhir_encounters (
          id,
          encounter_id,
          encounter_type,
          encounter_class
        )
      `)
      .order('effective_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    if (encounterId) {
      query = query.eq('encounter_id', encounterId);
    }
    if (observationType) {
      query = query.eq('observation_type', observationType);
    }
    if (observationCategory) {
      query = query.eq('observation_category', observationCategory);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (effectiveDateFrom) {
      query = query.gte('effective_date', effectiveDateFrom);
    }
    if (effectiveDateTo) {
      query = query.lte('effective_date', effectiveDateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clinical observations' }, { status: 500 });
  }
}

// POST - Create clinical observation
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      practitioner_id,
      encounter_id,
      observation_type,
      observation_category,
      observation_code,
      observation_value,
      observation_unit,
      reference_range,
      interpretation,
      effective_date,
      status,
      fhir_data
    } = body;

    // Validate required fields
    if (!patient_id || !practitioner_id || !observation_type || !observation_category || !observation_code || !observation_value || !effective_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('clinical_observations')
      .insert({
        patient_id,
        practitioner_id,
        encounter_id,
        observation_type,
        observation_category,
        observation_code,
        observation_value,
        observation_unit,
        reference_range,
        interpretation,
        effective_date,
        status: status || 'final',
        fhir_data
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create clinical observation' }, { status: 500 });
  }
}

// PUT - Update clinical observation
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Observation ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('clinical_observations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update clinical observation' }, { status: 500 });
  }
}

// DELETE - Delete clinical observation
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Observation ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('clinical_observations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Clinical observation deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete clinical observation' }, { status: 500 });
  }
}

