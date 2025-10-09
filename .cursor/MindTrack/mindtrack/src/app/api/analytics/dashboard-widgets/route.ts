import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: widgets, error } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dashboard widgets:', error);
      return NextResponse.json({ error: 'Failed to fetch dashboard widgets' }, { status: 500 });
    }

    return NextResponse.json({ widgets });
  } catch (error) {
    console.error('Error in dashboard widgets API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, type, config, position, refreshInterval } = body;

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }

    const { data: widget, error } = await supabase
      .from('dashboard_widgets')
      .insert({
        user_id: user.id,
        title,
        type,
        config: config || {},
        position: position || { x: 0, y: 0, width: 4, height: 3 },
        refresh_interval: refreshInterval,
        is_visible: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dashboard widget:', error);
      return NextResponse.json({ error: 'Failed to create dashboard widget' }, { status: 500 });
    }

    return NextResponse.json({ widget });
  } catch (error) {
    console.error('Error in dashboard widgets API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
