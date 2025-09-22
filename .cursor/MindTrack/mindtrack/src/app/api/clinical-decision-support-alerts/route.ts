import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve clinical decision support alerts
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const practitionerId = searchParams.get('practitioner_id');
    const encounterId = searchParams.get('encounter_id');
    const alertType = searchParams.get('alert_type');
    const alertSeverity = searchParams.get('alert_severity');
    const alertStatus = searchParams.get('alert_status');
    const ruleId = searchParams.get('rule_id');

    let query = supabase
      .from('clinical_decision_support_alerts')
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
        ),
        clinical_decision_support_rules (
          id,
          rule_name,
          rule_description,
          rule_category,
          rule_type
        )
      `)
      .order('created_at', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    if (encounterId) {
      query = query.eq('encounter_id', encounterId);
    }
    if (alertType) {
      query = query.eq('alert_type', alertType);
    }
    if (alertSeverity) {
      query = query.eq('alert_severity', alertSeverity);
    }
    if (alertStatus) {
      query = query.eq('alert_status', alertStatus);
    }
    if (ruleId) {
      query = query.eq('rule_id', ruleId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clinical decision support alerts' }, { status: 500 });
  }
}

// POST - Create clinical decision support alert
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      practitioner_id,
      encounter_id,
      rule_id,
      alert_type,
      alert_severity,
      alert_title,
      alert_message,
      alert_recommendation,
      alert_status,
      alert_context
    } = body;

    // Validate required fields
    if (!patient_id || !practitioner_id || !rule_id || !alert_type || !alert_severity || !alert_title || !alert_message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('clinical_decision_support_alerts')
      .insert({
        patient_id,
        practitioner_id,
        encounter_id,
        rule_id,
        alert_type,
        alert_severity,
        alert_title,
        alert_message,
        alert_recommendation,
        alert_status: alert_status || 'active',
        alert_context
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create clinical decision support alert' }, { status: 500 });
  }
}

// PUT - Update clinical decision support alert
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('clinical_decision_support_alerts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update clinical decision support alert' }, { status: 500 });
  }
}

// DELETE - Delete clinical decision support alert
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
      .from('clinical_decision_support_alerts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Clinical decision support alert deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete clinical decision support alert' }, { status: 500 });
  }
}




