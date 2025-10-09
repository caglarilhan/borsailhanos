import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve performance dashboards
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const dashboardType = searchParams.get('dashboard_type');
    const targetAudience = searchParams.get('target_audience');
    const isPublic = searchParams.get('is_public');

    let query = supabase
      .from('performance_dashboards')
      .select(`
        *,
        created_by_user:users!created_by (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (dashboardType) {
      query = query.eq('dashboard_type', dashboardType);
    }
    if (targetAudience) {
      query = query.eq('target_audience', targetAudience);
    }
    if (isPublic) {
      query = query.eq('is_public', isPublic === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch performance dashboards' }, { status: 500 });
  }
}

// POST - Create performance dashboard
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      dashboard_id,
      dashboard_name,
      dashboard_description,
      dashboard_type,
      target_audience,
      dashboard_config,
      widget_configs,
      refresh_frequency,
      auto_refresh,
      is_public,
      access_permissions,
      created_by
    } = body;

    // Validate required fields
    if (!dashboard_id || !dashboard_name || !dashboard_type || !target_audience || !dashboard_config || !widget_configs) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('performance_dashboards')
      .insert({
        dashboard_id,
        dashboard_name,
        dashboard_description,
        dashboard_type,
        target_audience,
        dashboard_config,
        widget_configs,
        refresh_frequency: refresh_frequency || 'daily',
        auto_refresh: auto_refresh !== undefined ? auto_refresh : true,
        is_public: is_public !== undefined ? is_public : false,
        access_permissions,
        created_by: created_by || 'system'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create performance dashboard' }, { status: 500 });
  }
}

// PUT - Update performance dashboard
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Performance dashboard ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('performance_dashboards')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update performance dashboard' }, { status: 500 });
  }
}

// DELETE - Delete performance dashboard
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Performance dashboard ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('performance_dashboards')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Performance dashboard deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete performance dashboard' }, { status: 500 });
  }
}











