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
    const { name, description, formula, category, tags, isActive } = body;

    const { data: metric, error } = await supabase
      .from('custom_metrics')
      .update({
        name,
        description,
        formula,
        category,
        tags,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating custom metric:', error);
      return NextResponse.json({ error: 'Failed to update custom metric' }, { status: 500 });
    }

    if (!metric) {
      return NextResponse.json({ error: 'Custom metric not found' }, { status: 404 });
    }

    return NextResponse.json({ metric });
  } catch (error) {
    console.error('Error in custom metric update API:', error);
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
      .from('custom_metrics')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting custom metric:', error);
      return NextResponse.json({ error: 'Failed to delete custom metric' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in custom metric delete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
