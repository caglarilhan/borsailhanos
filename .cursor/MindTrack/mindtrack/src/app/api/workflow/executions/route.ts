import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: executions, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching workflow executions:', error);
      return NextResponse.json({ error: 'Failed to fetch workflow executions' }, { status: 500 });
    }

    return NextResponse.json({ executions });
  } catch (error) {
    console.error('Error in workflow executions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
