import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve remote patient monitoring
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const practitionerId = searchParams.get('practitioner_id');
    const monitoringType = searchParams.get('monitoring_type');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('remote_patient_monitoring')
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
      .order('monitoring_start_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    if (monitoringType) {
      query = query.eq('monitoring_type', monitoringType);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch remote patient monitoring' }, { status: 500 });
  }
}

// POST - Create remote patient monitoring
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      monitoring_id,
      patient_id,
      practitioner_id,
      monitoring_type,
      monitoring_frequency,
      monitored_metrics,
      alert_thresholds,
      monitoring_start_date,
      monitoring_end_date,
      is_active,
      patient_consent,
      consent_date,
      data_sharing_level,
      monitoring_notes
    } = body;

    // Validate required fields
    if (!monitoring_id || !patient_id || !practitioner_id || !monitoring_type || !monitored_metrics || !monitoring_start_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('remote_patient_monitoring')
      .insert({
        monitoring_id,
        patient_id,
        practitioner_id,
        monitoring_type,
        monitoring_frequency,
        monitored_metrics,
        alert_thresholds,
        monitoring_start_date,
        monitoring_end_date,
        is_active: is_active !== undefined ? is_active : true,
        patient_consent: patient_consent || false,
        consent_date,
        data_sharing_level: data_sharing_level || 'practitioner',
        monitoring_notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create remote patient monitoring' }, { status: 500 });
  }
}

// PUT - Update remote patient monitoring
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Remote patient monitoring ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('remote_patient_monitoring')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update remote patient monitoring' }, { status: 500 });
  }
}

// DELETE - Delete remote patient monitoring
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Remote patient monitoring ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('remote_patient_monitoring')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Remote patient monitoring deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete remote patient monitoring' }, { status: 500 });
  }
}



