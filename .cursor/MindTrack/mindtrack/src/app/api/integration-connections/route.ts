import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve integration connections
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const sourceSystem = searchParams.get('source_system');
    const targetSystem = searchParams.get('target_system');
    const connectionType = searchParams.get('connection_type');
    const syncStatus = searchParams.get('sync_status');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('integration_connections')
      .select(`
        *,
        data_exchange_protocols (
          id,
          protocol_name,
          protocol_type,
          protocol_version
        ),
        api_standards (
          id,
          standard_name,
          standard_type,
          version
        ),
        fhir_endpoints (
          id,
          endpoint_name,
          endpoint_url,
          endpoint_type
        )
      `)
      .order('created_at', { ascending: false });

    if (sourceSystem) {
      query = query.eq('source_system', sourceSystem);
    }
    if (targetSystem) {
      query = query.eq('target_system', targetSystem);
    }
    if (connectionType) {
      query = query.eq('connection_type', connectionType);
    }
    if (syncStatus) {
      query = query.eq('sync_status', syncStatus);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch integration connections' }, { status: 500 });
  }
}

// POST - Create integration connection
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      connection_id,
      connection_name,
      source_system,
      target_system,
      connection_type,
      protocol_id,
      api_standard_id,
      endpoint_id,
      authentication_config,
      connection_config,
      sync_frequency,
      sync_status,
      is_active
    } = body;

    // Validate required fields
    if (!connection_id || !connection_name || !source_system || !target_system || !connection_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('integration_connections')
      .insert({
        connection_id,
        connection_name,
        source_system,
        target_system,
        connection_type,
        protocol_id,
        api_standard_id,
        endpoint_id,
        authentication_config,
        connection_config,
        sync_frequency,
        sync_status: sync_status || 'active',
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create integration connection' }, { status: 500 });
  }
}

// PUT - Update integration connection
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Integration connection ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('integration_connections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update integration connection' }, { status: 500 });
  }
}

// DELETE - Delete integration connection
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Integration connection ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('integration_connections')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Integration connection deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete integration connection' }, { status: 500 });
  }
}











