import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve data synchronization logs
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connection_id');
    const syncType = searchParams.get('sync_type');
    const syncDirection = searchParams.get('sync_direction');
    const syncStatus = searchParams.get('sync_status');
    const resourceType = searchParams.get('resource_type');

    let query = supabase
      .from('data_synchronization_logs')
      .select(`
        *,
        integration_connections (
          id,
          connection_name,
          source_system,
          target_system,
          connection_type
        )
      `)
      .order('sync_start_time', { ascending: false });

    if (connectionId) {
      query = query.eq('connection_id', connectionId);
    }
    if (syncType) {
      query = query.eq('sync_type', syncType);
    }
    if (syncDirection) {
      query = query.eq('sync_direction', syncDirection);
    }
    if (syncStatus) {
      query = query.eq('sync_status', syncStatus);
    }
    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data synchronization logs' }, { status: 500 });
  }
}

// POST - Create data synchronization log
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      log_id,
      connection_id,
      sync_type,
      sync_direction,
      resource_type,
      resource_count,
      success_count,
      error_count,
      sync_start_time,
      sync_end_time,
      sync_duration_seconds,
      sync_status,
      error_details,
      sync_summary
    } = body;

    // Validate required fields
    if (!log_id || !connection_id || !sync_type || !sync_direction) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('data_synchronization_logs')
      .insert({
        log_id,
        connection_id,
        sync_type,
        sync_direction,
        resource_type,
        resource_count: resource_count || 0,
        success_count: success_count || 0,
        error_count: error_count || 0,
        sync_start_time: sync_start_time || new Date().toISOString(),
        sync_end_time,
        sync_duration_seconds,
        sync_status: sync_status || 'running',
        error_details,
        sync_summary
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create data synchronization log' }, { status: 500 });
  }
}

// PUT - Update data synchronization log
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Data synchronization log ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('data_synchronization_logs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update data synchronization log' }, { status: 500 });
  }
}

// DELETE - Delete data synchronization log
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Data synchronization log ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('data_synchronization_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Data synchronization log deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete data synchronization log' }, { status: 500 });
  }
}

