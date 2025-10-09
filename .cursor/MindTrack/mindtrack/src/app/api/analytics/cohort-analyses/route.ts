import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: cohorts, error } = await supabase
      .from('cohort_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cohort analyses:', error);
      return NextResponse.json({ error: 'Failed to fetch cohort analyses' }, { status: 500 });
    }

    return NextResponse.json({ cohorts });
  } catch (error) {
    console.error('Error in cohort analyses API:', error);
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
    const { name, description, cohortType, timeRange, metrics } = body;

    if (!name || !cohortType) {
      return NextResponse.json({ error: 'Name and cohort type are required' }, { status: 400 });
    }

    const { data: cohort, error } = await supabase
      .from('cohort_analyses')
      .insert({
        user_id: user.id,
        name,
        description: description || '',
        cohort_type: cohortType,
        time_range: timeRange || '30 days',
        metrics: metrics || [],
        results: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating cohort analysis:', error);
      return NextResponse.json({ error: 'Failed to create cohort analysis' }, { status: 500 });
    }

    return NextResponse.json({ cohort });
  } catch (error) {
    console.error('Error in cohort analyses API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
