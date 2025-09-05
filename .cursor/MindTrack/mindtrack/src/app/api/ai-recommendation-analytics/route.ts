import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve AI recommendation analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const analysisDate = searchParams.get('analysis_date');
    const analysisPeriodMonths = searchParams.get('analysis_period_months');

    let query = supabase
      .from('ai_recommendation_analytics')
      .select('*')
      .order('analysis_date', { ascending: false });

    if (analysisDate) {
      query = query.eq('analysis_date', analysisDate);
    }
    if (analysisPeriodMonths) {
      query = query.eq('analysis_period_months', parseInt(analysisPeriodMonths));
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch AI recommendation analytics' }, { status: 500 });
  }
}

// POST - Generate AI recommendation analytics
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { analysis_date, analysis_period_months } = body;

    const { data, error } = await supabase.rpc('generate_ai_recommendation_analytics', {
      p_analysis_date: analysis_date || new Date().toISOString().split('T')[0],
      p_analysis_period_months: analysis_period_months || 1
    });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate AI recommendation analytics' }, { status: 500 });
  }
}

// PUT - Update AI recommendation analytics
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Analytics ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('ai_recommendation_analytics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update AI recommendation analytics' }, { status: 500 });
  }
}

// DELETE - Delete AI recommendation analytics
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Analytics ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('ai_recommendation_analytics')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'AI recommendation analytics deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete AI recommendation analytics' }, { status: 500 });
  }
}
