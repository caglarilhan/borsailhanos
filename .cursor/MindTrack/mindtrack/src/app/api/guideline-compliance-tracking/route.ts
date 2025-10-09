import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve guideline compliance tracking
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const guidelineId = searchParams.get('guideline_id');
    const recommendationId = searchParams.get('recommendation_id');
    const complianceStatus = searchParams.get('compliance_status');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('guideline_compliance_tracking')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        clinical_guidelines!guideline_id (
          id,
          guideline_name,
          guideline_code,
          category,
          issuing_organization
        ),
        guideline_recommendations!recommendation_id (
          id,
          recommendation_number,
          recommendation_title,
          recommendation_text
        ),
        assessor:users!assessed_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('tracking_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (guidelineId) {
      query = query.eq('guideline_id', guidelineId);
    }
    if (recommendationId) {
      query = query.eq('recommendation_id', recommendationId);
    }
    if (complianceStatus) {
      query = query.eq('compliance_status', complianceStatus);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('tracking_date', startDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch guideline compliance tracking' }, { status: 500 });
  }
}

// POST - Track guideline compliance
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      guideline_id,
      recommendation_id,
      compliance_status,
      compliance_score,
      compliance_notes,
      barriers_to_compliance,
      interventions_applied,
      outcome_achieved,
      outcome_description,
      quality_measure_value,
      quality_measure_unit,
      next_assessment_date,
      assessed_by
    } = body;

    // Validate required fields
    if (!patient_id || !guideline_id || !recommendation_id || !compliance_status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the database function to track compliance
    const { data: trackingId, error: trackError } = await supabase.rpc(
      'track_guideline_compliance',
      {
        p_patient_id: patient_id,
        p_guideline_id: guideline_id,
        p_recommendation_id: recommendation_id,
        p_compliance_status: compliance_status,
        p_compliance_score: compliance_score,
        p_compliance_notes: compliance_notes,
        p_barriers_to_compliance: barriers_to_compliance,
        p_interventions_applied: interventions_applied,
        p_outcome_achieved: outcome_achieved,
        p_outcome_description: outcome_description,
        p_quality_measure_value: quality_measure_value,
        p_quality_measure_unit: quality_measure_unit,
        p_next_assessment_date: next_assessment_date,
        p_assessed_by: assessed_by
      }
    );

    if (trackError) throw trackError;

    // Get the created tracking record
    const { data: trackingRecord, error: fetchError } = await supabase
      .from('guideline_compliance_tracking')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        clinical_guidelines!guideline_id (
          id,
          guideline_name,
          guideline_code,
          category,
          issuing_organization
        ),
        guideline_recommendations!recommendation_id (
          id,
          recommendation_number,
          recommendation_title,
          recommendation_text
        )
      `)
      .eq('id', trackingId)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(trackingRecord, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track guideline compliance' }, { status: 500 });
  }
}

// PUT - Update guideline compliance tracking
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Tracking ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('guideline_compliance_tracking')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update guideline compliance tracking' }, { status: 500 });
  }
}

// DELETE - Delete guideline compliance tracking
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Tracking ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('guideline_compliance_tracking')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Guideline compliance tracking deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete guideline compliance tracking' }, { status: 500 });
  }
}











