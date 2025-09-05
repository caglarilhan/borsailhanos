import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Retrieve patient drug alerts
export async function GET(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const alertType = searchParams.get('alertType');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');

    let query = supabase
      .from('patient_drug_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (alertType) {
      query = query.eq('alert_type', alertType);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient drug alerts' }, { status: 500 });
  }
}

// POST - Create new patient drug alert
export async function POST(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const body = await request.json();
    const { client_id, alert_type, drug_id, related_drug_id, alert_message, severity } = body;

    const { data, error } = await supabase
      .from('patient_drug_alerts')
      .insert({
        client_id,
        alert_type,
        drug_id,
        related_drug_id,
        alert_message,
        severity
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create patient drug alert' }, { status: 500 });
  }
}

// PUT - Update patient drug alert (acknowledge/resolve)
export async function PUT(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const body = await request.json();
    const { id, status, acknowledged_by } = body;

    const updateData: any = { status };
    if (acknowledged_by) {
      updateData.acknowledged_by = acknowledged_by;
      updateData.acknowledged_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('patient_drug_alerts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient drug alert' }, { status: 500 });
  }
}

// DELETE - Delete patient drug alert
export async function DELETE(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('patient_drug_alerts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Patient drug alert deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient drug alert' }, { status: 500 });
  }
}
