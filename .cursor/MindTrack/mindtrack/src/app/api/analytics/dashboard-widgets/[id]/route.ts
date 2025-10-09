import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { title, type, config, position, refreshInterval, isVisible } = body;

    const { data: widget, error } = await supabase
      .from('dashboard_widgets')
      .update({
        title,
        type,
        config,
        position,
        refresh_interval: refreshInterval,
        is_visible: isVisible,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating dashboard widget:', error);
      return NextResponse.json({ error: 'Failed to update dashboard widget' }, { status: 500 });
    }

    if (!widget) {
      return NextResponse.json({ error: 'Dashboard widget not found' }, { status: 404 });
    }

    return NextResponse.json({ widget });
  } catch (error) {
    console.error('Error in dashboard widget update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const { error } = await supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting dashboard widget:', error);
      return NextResponse.json({ error: 'Failed to delete dashboard widget' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in dashboard widget delete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
