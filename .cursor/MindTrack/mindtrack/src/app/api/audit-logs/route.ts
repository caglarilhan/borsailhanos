import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve audit logs
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const actionType = searchParams.get('action_type');
    const resourceType = searchParams.get('resource_type');
    const riskLevel = searchParams.get('risk_level');
    const complianceCategory = searchParams.get('compliance_category');
    const success = searchParams.get('success');
    const timestampFrom = searchParams.get('timestamp_from');
    const timestampTo = searchParams.get('timestamp_to');

    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('timestamp', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (actionType) {
      query = query.eq('action_type', actionType);
    }
    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }
    if (riskLevel) {
      query = query.eq('risk_level', riskLevel);
    }
    if (complianceCategory) {
      query = query.eq('compliance_category', complianceCategory);
    }
    if (success) {
      query = query.eq('success', success === 'true');
    }
    if (timestampFrom) {
      query = query.gte('timestamp', timestampFrom);
    }
    if (timestampTo) {
      query = query.lte('timestamp', timestampTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

// POST - Create audit log entry
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      user_id,
      session_id,
      action_type,
      resource_type,
      resource_id,
      action_description,
      ip_address,
      user_agent,
      request_method,
      request_url,
      request_headers,
      request_body,
      response_status,
      response_body,
      success,
      error_message,
      risk_level,
      compliance_category,
      data_classification
    } = body;

    // Validate required fields
    if (!action_type || !resource_type || success === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id,
        session_id,
        action_type,
        resource_type,
        resource_id,
        action_description,
        ip_address,
        user_agent,
        request_method,
        request_url,
        request_headers,
        request_body,
        response_status,
        response_body,
        success,
        error_message,
        risk_level: risk_level || 'low',
        compliance_category,
        data_classification: data_classification || 'internal'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create audit log entry' }, { status: 500 });
  }
}

// PUT - Update audit log entry
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Audit log ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update audit log entry' }, { status: 500 });
  }
}

// DELETE - Delete audit log entry
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Audit log ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('audit_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Audit log entry deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete audit log entry' }, { status: 500 });
  }
}




