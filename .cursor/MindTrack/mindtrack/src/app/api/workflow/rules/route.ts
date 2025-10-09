import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: rules, error } = await supabase
      .from('workflow_rules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflow rules:', error);
      return NextResponse.json({ error: 'Failed to fetch workflow rules' }, { status: 500 });
    }

    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Error in workflow rules API:', error);
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
    const { name, description, triggerType, triggerConditions, actions } = body;

    if (!name || !triggerType) {
      return NextResponse.json({ error: 'Name and trigger type are required' }, { status: 400 });
    }

    const { data: rule, error } = await supabase
      .from('workflow_rules')
      .insert({
        user_id: user.id,
        name,
        description: description || '',
        trigger_type: triggerType,
        trigger_conditions: triggerConditions || {},
        actions: actions || [],
        is_active: true,
        execution_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow rule:', error);
      return NextResponse.json({ error: 'Failed to create workflow rule' }, { status: 500 });
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('Error in workflow rules API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
