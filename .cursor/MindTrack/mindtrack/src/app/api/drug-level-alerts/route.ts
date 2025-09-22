import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve drug level alerts
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const medicationId = searchParams.get('medication_id');
    const alertType = searchParams.get('alert_type');
    const severity = searchParams.get('severity');
    const acknowledged = searchParams.get('acknowledged');
    const resolved = searchParams.get('resolved');

    let query = supabase
      .from('drug_level_alerts')
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
        ),
        drug_level_tests (
          id,
          test_date,
          test_result,
          unit
        ),
        acknowledged_user:users!acknowledged_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (medicationId) {
      query = query.eq('medication_id', medicationId);
    }
    if (alertType) {
      query = query.eq('alert_type', alertType);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }
    if (acknowledged !== null) {
      query = query.eq('is_acknowledged', acknowledged === 'true');
    }
    if (resolved !== null) {
      query = query.eq('resolved', resolved === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drug level alerts' }, { status: 500 });
  }
}

// POST - Create new drug level alert
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      medication_id,
      test_id,
      alert_type,
      severity,
      alert_message,
      clinical_recommendation
    } = body;

    // Validate required fields
    if (!patient_id || !medication_id || !alert_type || !alert_message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('drug_level_alerts')
      .insert({
        patient_id,
        medication_id,
        test_id,
        alert_type,
        severity: severity || 'medium',
        alert_message,
        clinical_recommendation
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create drug level alert' }, { status: 500 });
  }
}

// PUT - Update drug level alert (acknowledge/resolve)
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, is_acknowledged, acknowledged_by, resolved, resolution_notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (is_acknowledged !== undefined) {
      updateData.is_acknowledged = is_acknowledged;
      if (is_acknowledged && acknowledged_by) {
        updateData.acknowledged_by = acknowledged_by;
        updateData.acknowledged_at = new Date().toISOString();
      }
    }
    if (resolved !== undefined) {
      updateData.resolved = resolved;
      if (resolved) {
        updateData.resolved_at = new Date().toISOString();
        if (resolution_notes) {
          updateData.resolution_notes = resolution_notes;
        }
      }
    }

    const { data, error } = await supabase
      .from('drug_level_alerts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update drug level alert' }, { status: 500 });
  }
}

// DELETE - Delete drug level alert
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('drug_level_alerts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Drug level alert deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete drug level alert' }, { status: 500 });
  }
}




