import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve security incidents
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const incidentType = searchParams.get('incident_type');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assigned_to');
    const detectionDateFrom = searchParams.get('detection_date_from');
    const detectionDateTo = searchParams.get('detection_date_to');

    let query = supabase
      .from('security_incidents')
      .select(`
        *,
        assigned_user:users!assigned_to (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('detection_timestamp', { ascending: false });

    if (incidentType) {
      query = query.eq('incident_type', incidentType);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }
    if (detectionDateFrom) {
      query = query.gte('detection_timestamp', detectionDateFrom);
    }
    if (detectionDateTo) {
      query = query.lte('detection_timestamp', detectionDateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch security incidents' }, { status: 500 });
  }
}

// POST - Create security incident
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      incident_type,
      severity,
      status,
      title,
      description,
      affected_users,
      affected_patients,
      data_compromised,
      detection_method,
      detection_timestamp,
      assigned_to,
      investigation_notes,
      remediation_actions,
      lessons_learned,
      prevention_measures,
      regulatory_notification_required
    } = body;

    // Validate required fields
    if (!incident_type || !severity || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate incident ID
    const incidentId = 'INC-' + Date.now().toString();

    const { data, error } = await supabase
      .from('security_incidents')
      .insert({
        incident_id: incidentId,
        incident_type,
        severity,
        status: status || 'open',
        title,
        description,
        affected_users: affected_users || 0,
        affected_patients: affected_patients || 0,
        data_compromised,
        detection_method,
        detection_timestamp: detection_timestamp || new Date().toISOString(),
        assigned_to,
        investigation_notes,
        remediation_actions,
        lessons_learned,
        prevention_measures,
        regulatory_notification_required: regulatory_notification_required || false
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create security incident' }, { status: 500 });
  }
}

// PUT - Update security incident
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Incident ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('security_incidents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update security incident' }, { status: 500 });
  }
}

// DELETE - Delete security incident
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Incident ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('security_incidents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Security incident deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete security incident' }, { status: 500 });
  }
}
