import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve FHIR encounters
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const practitionerId = searchParams.get('practitioner_id');
    const encounterStatus = searchParams.get('encounter_status');
    const encounterType = searchParams.get('encounter_type');
    const encounterClass = searchParams.get('encounter_class');
    const startDateFrom = searchParams.get('start_date_from');
    const startDateTo = searchParams.get('start_date_to');

    let query = supabase
      .from('fhir_encounters')
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
      .order('start_time', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    if (encounterStatus) {
      query = query.eq('status', encounterStatus);
    }
    if (encounterType) {
      query = query.eq('encounter_type', encounterType);
    }
    if (encounterClass) {
      query = query.eq('encounter_class', encounterClass);
    }
    if (startDateFrom) {
      query = query.gte('start_time', startDateFrom);
    }
    if (startDateTo) {
      query = query.lte('start_time', startDateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch FHIR encounters' }, { status: 500 });
  }
}

// POST - Create FHIR encounter
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      practitioner_id,
      encounter_class,
      encounter_type,
      status,
      priority,
      start_time,
      end_time,
      duration_minutes,
      location,
      service_type,
      diagnosis_codes,
      procedure_codes,
      chief_complaint,
      history_of_present_illness,
      mental_status_exam,
      assessment_and_plan,
      treatment_goals,
      follow_up_instructions,
      fhir_data
    } = body;

    // Validate required fields
    if (!patient_id || !practitioner_id || !encounter_class || !encounter_type || !start_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('fhir_encounters')
      .insert({
        patient_id,
        practitioner_id,
        encounter_class,
        encounter_type,
        status: status || 'planned',
        priority,
        start_time,
        end_time,
        duration_minutes,
        location,
        service_type,
        diagnosis_codes,
        procedure_codes,
        chief_complaint,
        history_of_present_illness,
        mental_status_exam,
        assessment_and_plan,
        treatment_goals,
        follow_up_instructions,
        fhir_data
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create FHIR encounter' }, { status: 500 });
  }
}

// PUT - Update FHIR encounter
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Encounter ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('fhir_encounters')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update FHIR encounter' }, { status: 500 });
  }
}

// DELETE - Delete FHIR encounter
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Encounter ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('fhir_encounters')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'FHIR encounter deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete FHIR encounter' }, { status: 500 });
  }
}



