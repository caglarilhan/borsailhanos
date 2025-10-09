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
    const type = searchParams.get('type');

    if (!type || !['dashboard', 'metrics', 'cohorts'].includes(type)) {
      return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    let data = {};

    switch (type) {
      case 'dashboard':
        const { data: widgets } = await supabase
          .from('dashboard_widgets')
          .select('*')
          .eq('user_id', user.id);
        data = { widgets: widgets || [] };
        break;

      case 'metrics':
        const { data: metrics } = await supabase
          .from('custom_metrics')
          .select('*')
          .eq('user_id', user.id);
        data = { metrics: metrics || [] };
        break;

      case 'cohorts':
        const { data: cohorts } = await supabase
          .from('cohort_analyses')
          .select('*')
          .eq('user_id', user.id);
        data = { cohorts: cohorts || [] };
        break;
    }

    const filename = `analytics-${type}-${new Date().toISOString().split('T')[0]}.json`;
    
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error in analytics export API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
