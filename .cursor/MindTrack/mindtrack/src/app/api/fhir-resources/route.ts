import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve FHIR resources
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get('resource_type');
    const patientId = searchParams.get('patient_id');
    const practitionerId = searchParams.get('practitioner_id');
    const syncStatus = searchParams.get('sync_status');
    const fhirVersion = searchParams.get('fhir_version');

    let query = supabase
      .from('fhir_resources')
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
      .order('created_at', { ascending: false });

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    if (syncStatus) {
      query = query.eq('sync_status', syncStatus);
    }
    if (fhirVersion) {
      query = query.eq('fhir_version', fhirVersion);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch FHIR resources' }, { status: 500 });
  }
}

// POST - Create FHIR resource
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      resource_id,
      resource_type,
      fhir_version,
      resource_data,
      patient_id,
      practitioner_id,
      encounter_id,
      sync_status,
      sync_error,
      version_number,
      is_active
    } = body;

    // Validate required fields
    if (!resource_id || !resource_type || !fhir_version || !resource_data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('fhir_resources')
      .insert({
        resource_id,
        resource_type,
        fhir_version,
        resource_data,
        patient_id,
        practitioner_id,
        encounter_id,
        sync_status: sync_status || 'synced',
        sync_error,
        version_number: version_number || 1,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create FHIR resource' }, { status: 500 });
  }
}

// PUT - Update FHIR resource
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'FHIR resource ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('fhir_resources')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update FHIR resource' }, { status: 500 });
  }
}

// DELETE - Delete FHIR resource
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'FHIR resource ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('fhir_resources')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'FHIR resource deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete FHIR resource' }, { status: 500 });
  }
}











