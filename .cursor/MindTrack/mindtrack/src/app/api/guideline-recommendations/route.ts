import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve guideline recommendations
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const guidelineId = searchParams.get('guideline_id');
    const recommendationType = searchParams.get('recommendation_type');
    const priorityLevel = searchParams.get('priority_level');
    const evidenceLevel = searchParams.get('evidence_level');

    let query = supabase
      .from('guideline_recommendations')
      .select(`
        *,
        clinical_guidelines!guideline_id (
          id,
          guideline_name,
          guideline_code,
          category,
          issuing_organization
        )
      `)
      .order('recommendation_number', { ascending: true });

    if (guidelineId) {
      query = query.eq('guideline_id', guidelineId);
    }
    if (recommendationType) {
      query = query.eq('recommendation_type', recommendationType);
    }
    if (priorityLevel) {
      query = query.eq('priority_level', priorityLevel);
    }
    if (evidenceLevel) {
      query = query.eq('evidence_level', evidenceLevel);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch guideline recommendations' }, { status: 500 });
  }
}

// POST - Create new guideline recommendation
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      guideline_id,
      recommendation_number,
      recommendation_title,
      recommendation_text,
      recommendation_type,
      priority_level,
      evidence_level,
      recommendation_strength,
      target_condition,
      patient_population,
      contraindications,
      prerequisites,
      expected_outcomes,
      implementation_steps,
      monitoring_requirements,
      follow_up_requirements,
      cost_effectiveness_data,
      quality_metrics
    } = body;

    // Validate required fields
    if (!guideline_id || !recommendation_number || !recommendation_title || !recommendation_text || !recommendation_type || !priority_level || !evidence_level || !recommendation_strength) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('guideline_recommendations')
      .insert({
        guideline_id,
        recommendation_number,
        recommendation_title,
        recommendation_text,
        recommendation_type,
        priority_level,
        evidence_level,
        recommendation_strength,
        target_condition,
        patient_population,
        contraindications,
        prerequisites,
        expected_outcomes,
        implementation_steps,
        monitoring_requirements,
        follow_up_requirements,
        cost_effectiveness_data,
        quality_metrics
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create guideline recommendation' }, { status: 500 });
  }
}

// PUT - Update guideline recommendation
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Recommendation ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('guideline_recommendations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update guideline recommendation' }, { status: 500 });
  }
}

// DELETE - Delete guideline recommendation
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Recommendation ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('guideline_recommendations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Guideline recommendation deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete guideline recommendation' }, { status: 500 });
  }
}



