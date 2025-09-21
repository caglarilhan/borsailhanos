import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve CME learning analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const practitionerId = searchParams.get('practitioner_id');
    const analysisDate = searchParams.get('analysis_date');
    const analysisPeriodMonths = searchParams.get('analysis_period_months');

    let query = supabase
      .from('cme_learning_analytics')
      .select(`
        *,
        practitioners:users!practitioner_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('analysis_date', { ascending: false });

    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
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
    return NextResponse.json({ error: 'Failed to fetch CME learning analytics' }, { status: 500 });
  }
}

// POST - Create CME learning analytics
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      practitioner_id,
      analysis_date,
      analysis_period_months,
      total_activities_completed,
      total_credits_earned,
      average_evaluation_score,
      average_post_test_score,
      preferred_activity_types,
      preferred_activity_formats,
      preferred_specialties,
      learning_goals,
      areas_for_improvement,
      continuing_education_plan,
      mentor_recommendations,
      compliance_risk_score,
      learning_effectiveness_score,
      engagement_score,
      cost_per_credit,
      roi_analysis
    } = body;

    // Validate required fields
    if (!analysis_date || !analysis_period_months) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cme_learning_analytics')
      .insert({
        practitioner_id,
        analysis_date,
        analysis_period_months,
        total_activities_completed: total_activities_completed || 0,
        total_credits_earned: total_credits_earned || 0,
        average_evaluation_score,
        average_post_test_score,
        preferred_activity_types,
        preferred_activity_formats,
        preferred_specialties,
        learning_goals,
        areas_for_improvement,
        continuing_education_plan,
        mentor_recommendations,
        compliance_risk_score,
        learning_effectiveness_score,
        engagement_score,
        cost_per_credit,
        roi_analysis
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create CME learning analytics' }, { status: 500 });
  }
}

// PUT - Update CME learning analytics
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'CME learning analytics ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cme_learning_analytics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update CME learning analytics' }, { status: 500 });
  }
}

// DELETE - Delete CME learning analytics
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'CME learning analytics ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('cme_learning_analytics')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'CME learning analytics deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete CME learning analytics' }, { status: 500 });
  }
}



