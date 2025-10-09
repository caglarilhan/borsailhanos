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
    const { name, description, cohortType, timeRange, metrics, results } = body;

    const { data: cohort, error } = await supabase
      .from('cohort_analyses')
      .update({
        name,
        description,
        cohort_type: cohortType,
        time_range: timeRange,
        metrics,
        results,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating cohort analysis:', error);
      return NextResponse.json({ error: 'Failed to update cohort analysis' }, { status: 500 });
    }

    if (!cohort) {
      return NextResponse.json({ error: 'Cohort analysis not found' }, { status: 404 });
    }

    return NextResponse.json({ cohort });
  } catch (error) {
    console.error('Error in cohort analysis update API:', error);
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
      .from('cohort_analyses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting cohort analysis:', error);
      return NextResponse.json({ error: 'Failed to delete cohort analysis' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in cohort analysis delete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
