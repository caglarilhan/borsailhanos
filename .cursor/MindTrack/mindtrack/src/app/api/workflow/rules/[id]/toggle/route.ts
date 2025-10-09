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
    const { isActive } = body;

    const { data: rule, error } = await supabase
      .from('workflow_rules')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling workflow rule:', error);
      return NextResponse.json({ error: 'Failed to toggle workflow rule' }, { status: 500 });
    }

    if (!rule) {
      return NextResponse.json({ error: 'Workflow rule not found' }, { status: 404 });
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('Error in workflow rule toggle API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
