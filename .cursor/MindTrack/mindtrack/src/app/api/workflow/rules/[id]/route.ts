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
    const { name, description, triggerType, triggerConditions, actions, isActive } = body;

    const { data: rule, error } = await supabase
      .from('workflow_rules')
      .update({
        name,
        description,
        trigger_type: triggerType,
        trigger_conditions: triggerConditions,
        actions,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating workflow rule:', error);
      return NextResponse.json({ error: 'Failed to update workflow rule' }, { status: 500 });
    }

    if (!rule) {
      return NextResponse.json({ error: 'Workflow rule not found' }, { status: 404 });
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('Error in workflow rule update API:', error);
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
      .from('workflow_rules')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting workflow rule:', error);
      return NextResponse.json({ error: 'Failed to delete workflow rule' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in workflow rule delete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
