import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve mobile apps
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const appType = searchParams.get('app_type');
    const platform = searchParams.get('platform');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('mobile_apps')
      .select('*')
      .order('app_name', { ascending: true });

    if (appType) {
      query = query.eq('app_type', appType);
    }
    if (platform) {
      query = query.eq('platform', platform);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch mobile apps' }, { status: 500 });
  }
}

// POST - Create mobile app
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      app_id,
      app_name,
      app_description,
      app_type,
      platform,
      version,
      app_store_url,
      play_store_url,
      api_endpoint,
      authentication_method,
      features,
      permissions,
      privacy_policy_url,
      terms_of_service_url,
      is_active
    } = body;

    // Validate required fields
    if (!app_id || !app_name || !app_type || !platform || !version) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('mobile_apps')
      .insert({
        app_id,
        app_name,
        app_description,
        app_type,
        platform,
        version,
        app_store_url,
        play_store_url,
        api_endpoint,
        authentication_method,
        features,
        permissions,
        privacy_policy_url,
        terms_of_service_url,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create mobile app' }, { status: 500 });
  }
}

// PUT - Update mobile app
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Mobile app ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('mobile_apps')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update mobile app' }, { status: 500 });
  }
}

// DELETE - Delete mobile app
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Mobile app ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('mobile_apps')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Mobile app deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete mobile app' }, { status: 500 });
  }
}


