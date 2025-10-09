import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve AI medication recommendations
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('request_id');
    const patientId = searchParams.get('patient_id');
    const medicationName = searchParams.get('medication_name');
    const minConfidence = searchParams.get('min_confidence');

    let query = supabase
      .from('ai_medication_recommendations')
      .select(`
        *,
        ai_recommendation_requests!request_id (
          id,
          patient_id,
          request_type,
          clinical_context,
          request_timestamp,
          clients (
            id,
            first_name,
            last_name,
            date_of_birth
          )
        ),
        accepter:users!accepted_by (
          id,
          first_name,
          last_name
        ),
        ai_recommendation_feedback (
          *
        )
      `)
      .order('recommendation_rank', { ascending: true });

    if (requestId) {
      query = query.eq('request_id', requestId);
    }
    if (patientId) {
      query = query.eq('ai_recommendation_requests.patient_id', patientId);
    }
    if (medicationName) {
      query = query.eq('medication_name', medicationName);
    }
    if (minConfidence) {
      query = query.gte('confidence_score', parseFloat(minConfidence));
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch AI medication recommendations' }, { status: 500 });
  }
}

// POST - Create new AI medication recommendation
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      request_id,
      medication_name,
      medication_class,
      recommended_dosage,
      dosage_form,
      frequency,
      duration_days,
      confidence_score,
      recommendation_rank,
      reasoning_explanation,
      expected_efficacy,
      expected_tolerability,
      risk_score,
      contraindications,
      drug_interactions,
      monitoring_requirements,
      alternative_medications,
      pharmacogenomic_factors,
      clinical_evidence,
      cost_considerations
    } = body;

    // Validate required fields
    if (!request_id || !medication_name || !confidence_score || !recommendation_rank) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('ai_medication_recommendations')
      .insert({
        request_id,
        medication_name,
        medication_class,
        recommended_dosage,
        dosage_form,
        frequency,
        duration_days,
        confidence_score,
        recommendation_rank,
        reasoning_explanation,
        expected_efficacy,
        expected_tolerability,
        risk_score,
        contraindications,
        drug_interactions,
        monitoring_requirements,
        alternative_medications,
        pharmacogenomic_factors,
        clinical_evidence,
        cost_considerations
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create AI medication recommendation' }, { status: 500 });
  }
}

// PUT - Update AI medication recommendation
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
      .from('ai_medication_recommendations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update AI medication recommendation' }, { status: 500 });
  }
}

// PATCH - Accept or reject recommendation
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, is_accepted, acceptance_reason, rejection_reason, accepted_by } = body;

    if (!id || is_accepted === undefined) {
      return NextResponse.json(
        { error: 'Recommendation ID and acceptance status are required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      is_accepted,
      accepted_at: new Date().toISOString()
    };

    if (is_accepted) {
      updateData.acceptance_reason = acceptance_reason;
      updateData.accepted_by = accepted_by;
    } else {
      updateData.rejection_reason = rejection_reason;
    }

    const { data, error } = await supabase
      .from('ai_medication_recommendations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update recommendation status' }, { status: 500 });
  }
}

// DELETE - Delete AI medication recommendation
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
      .from('ai_medication_recommendations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'AI medication recommendation deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete AI medication recommendation' }, { status: 500 });
  }
}











