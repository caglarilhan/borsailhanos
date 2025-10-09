import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: metrics, error } = await supabase
      .from('custom_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching custom metrics:', error);
      return NextResponse.json({ error: 'Failed to fetch custom metrics' }, { status: 500 });
    }

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error in custom metrics API:', error);
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
    const { name, description, formula, category, tags } = body;

    if (!name || !formula) {
      return NextResponse.json({ error: 'Name and formula are required' }, { status: 400 });
    }

    const { data: metric, error } = await supabase
      .from('custom_metrics')
      .insert({
        user_id: user.id,
        name,
        description: description || '',
        formula,
        category: category || 'General',
        tags: tags || [],
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating custom metric:', error);
      return NextResponse.json({ error: 'Failed to create custom metric' }, { status: 500 });
    }

    return NextResponse.json({ metric });
  } catch (error) {
    console.error('Error in custom metrics API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
