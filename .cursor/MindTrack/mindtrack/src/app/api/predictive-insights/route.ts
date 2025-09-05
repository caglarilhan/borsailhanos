import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve predictive insights
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('model_id');
    const insightType = searchParams.get('insight_type');
    const insightCategory = searchParams.get('insight_category');
    const urgencyLevel = searchParams.get('urgency_level');
    const insightStatus = searchParams.get('insight_status');

    let query = supabase
      .from('predictive_insights')
      .select(`
        *,
        predictive_models (
          id,
          model_name,
          model_type,
          model_version
        ),
        acknowledged_by_user:users!acknowledged_by (
          id,
          first_name,
          last_name,
          email
        ),
        implemented_by_user:users!implemented_by (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (modelId) {
      query = query.eq('model_id', modelId);
    }
    if (insightType) {
      query = query.eq('insight_type', insightType);
    }
    if (insightCategory) {
      query = query.eq('insight_category', insightCategory);
    }
    if (urgencyLevel) {
      query = query.eq('urgency_level', urgencyLevel);
    }
    if (insightStatus) {
      query = query.eq('insight_status', insightStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch predictive insights' }, { status: 500 });
  }
}

// POST - Create predictive insight
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      insight_id,
      model_id,
      insight_type,
      insight_title,
      insight_description,
      insight_category,
      confidence_score,
      impact_score,
      urgency_level,
      insight_data,
      actionable_recommendations,
      expected_outcome,
      risk_factors,
      mitigation_strategies,
      target_audience,
      insight_status
    } = body;

    // Validate required fields
    if (!insight_id || !model_id || !insight_type || !insight_title || !insight_description || !insight_category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('predictive_insights')
      .insert({
        insight_id,
        model_id,
        insight_type,
        insight_title,
        insight_description,
        insight_category,
        confidence_score: confidence_score || 0,
        impact_score: impact_score || 0,
        urgency_level: urgency_level || 'medium',
        insight_data: insight_data || {},
        actionable_recommendations,
        expected_outcome,
        risk_factors,
        mitigation_strategies,
        target_audience,
        insight_status: insight_status || 'active'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create predictive insight' }, { status: 500 });
  }
}

// PUT - Update predictive insight
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Predictive insight ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('predictive_insights')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update predictive insight' }, { status: 500 });
  }
}

// DELETE - Delete predictive insight
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Predictive insight ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('predictive_insights')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Predictive insight deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete predictive insight' }, { status: 500 });
  }
}
