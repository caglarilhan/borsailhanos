import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve medication effectiveness assessments
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const medicationId = searchParams.get('medication_id');
    const assessmentType = searchParams.get('assessment_type');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('medication_effectiveness_assessments')
      .select(`
        *,
        medications (
          id,
          name,
          generic_name,
          drug_class
        ),
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        assessor:users!assessed_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('assessment_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (medicationId) {
      query = query.eq('medication_id', medicationId);
    }
    if (assessmentType) {
      query = query.eq('assessment_type', assessmentType);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('assessment_date', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch effectiveness assessments' }, { status: 500 });
  }
}

// POST - Create new medication effectiveness assessment
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      medication_id,
      assessment_date,
      assessment_type,
      assessment_method,
      primary_diagnosis,
      secondary_diagnoses,
      baseline_symptoms,
      current_symptoms,
      symptom_severity_score,
      functional_impairment_score,
      quality_of_life_score,
      medication_adherence_score,
      side_effects_present,
      side_effects_severity,
      side_effects_description,
      effectiveness_rating,
      global_impression_score,
      clinical_notes,
      treatment_plan_changes,
      next_assessment_date,
      assessed_by
    } = body;

    // Validate required fields
    if (!patient_id || !medication_id || !assessment_type || !assessment_method || !primary_diagnosis) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('medication_effectiveness_assessments')
      .insert({
        patient_id,
        medication_id,
        assessment_date: assessment_date || new Date().toISOString(),
        assessment_type,
        assessment_method,
        primary_diagnosis,
        secondary_diagnoses,
        baseline_symptoms,
        current_symptoms,
        symptom_severity_score,
        functional_impairment_score,
        quality_of_life_score,
        medication_adherence_score,
        side_effects_present: side_effects_present || false,
        side_effects_severity,
        side_effects_description,
        effectiveness_rating,
        global_impression_score,
        clinical_notes,
        treatment_plan_changes,
        next_assessment_date,
        assessed_by
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create effectiveness assessment' }, { status: 500 });
  }
}

// PUT - Update medication effectiveness assessment
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('medication_effectiveness_assessments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update effectiveness assessment' }, { status: 500 });
  }
}

// DELETE - Delete medication effectiveness assessment
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('medication_effectiveness_assessments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Effectiveness assessment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete effectiveness assessment' }, { status: 500 });
  }
}


