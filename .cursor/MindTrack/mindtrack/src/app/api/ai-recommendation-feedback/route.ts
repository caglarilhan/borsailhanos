import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve AI recommendation feedback
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const recommendationId = searchParams.get('recommendation_id');
    const feedbackType = searchParams.get('feedback_type');
    const clinicalOutcome = searchParams.get('clinical_outcome');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('ai_recommendation_feedback')
      .select(`
        *,
        ai_medication_recommendations!recommendation_id (
          id,
          medication_name,
          confidence_score,
          ai_recommendation_requests!request_id (
            id,
            patient_id,
            request_type,
            clients (
              id,
              first_name,
              last_name,
              date_of_birth
            )
          )
        ),
        provider:users!provided_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('feedback_date', { ascending: false });

    if (recommendationId) {
      query = query.eq('recommendation_id', recommendationId);
    }
    if (feedbackType) {
      query = query.eq('feedback_type', feedbackType);
    }
    if (clinicalOutcome) {
      query = query.eq('clinical_outcome', clinicalOutcome);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('feedback_date', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch AI recommendation feedback' }, { status: 500 });
  }
}

// POST - Create new AI recommendation feedback
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      recommendation_id,
      feedback_type,
      feedback_score,
      feedback_text,
      clinical_outcome,
      side_effects_experienced,
      adherence_level,
      patient_satisfaction,
      provider_satisfaction,
      follow_up_notes,
      provided_by
    } = body;

    // Validate required fields
    if (!recommendation_id || !feedback_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('ai_recommendation_feedback')
      .insert({
        recommendation_id,
        feedback_type,
        feedback_score,
        feedback_text,
        clinical_outcome,
        side_effects_experienced,
        adherence_level,
        patient_satisfaction,
        provider_satisfaction,
        follow_up_notes,
        provided_by
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create AI recommendation feedback' }, { status: 500 });
  }
}

// PUT - Update AI recommendation feedback
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('ai_recommendation_feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update AI recommendation feedback' }, { status: 500 });
  }
}

// DELETE - Delete AI recommendation feedback
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('ai_recommendation_feedback')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'AI recommendation feedback deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete AI recommendation feedback' }, { status: 500 });
  }
}
