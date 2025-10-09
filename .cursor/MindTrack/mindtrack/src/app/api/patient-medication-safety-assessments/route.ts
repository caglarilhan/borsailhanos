import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve patient medication safety assessments
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const assessmentType = searchParams.get('assessment_type');
    const riskLevel = searchParams.get('risk_level');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('patient_medication_safety_assessments')
      .select(`
        *,
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
    if (assessmentType) {
      query = query.eq('assessment_type', assessmentType);
    }
    if (riskLevel) {
      query = query.eq('risk_level', riskLevel);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('assessment_date', startDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient medication safety assessments' }, { status: 500 });
  }
}

// POST - Assess patient medication safety
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      current_medications,
      medication_allergies,
      assessment_type,
      assessment_notes,
      assessed_by
    } = body;

    // Validate required fields
    if (!patient_id || !current_medications) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the database function to assess medication safety
    const { data: assessmentResult, error: assessError } = await supabase.rpc(
      'assess_patient_medication_safety',
      {
        p_patient_id: patient_id,
        p_current_medications: current_medications,
        p_medication_allergies: medication_allergies,
        p_assessment_type: assessment_type || 'follow_up'
      }
    );

    if (assessError) throw assessError;

    // Update the assessment record with additional notes
    if (assessmentResult && assessmentResult.length > 0) {
      const assessmentId = assessmentResult[0].assessment_id;
      
      const { data: updatedAssessment, error: updateError } = await supabase
        .from('patient_medication_safety_assessments')
        .update({
          assessment_notes,
          assessed_by
        })
        .eq('id', assessmentId)
        .select(`
          *,
          clients (
            id,
            first_name,
            last_name,
            date_of_birth
          )
        `)
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({
        assessment: updatedAssessment,
        safety_score: assessmentResult[0].safety_score,
        risk_level: assessmentResult[0].risk_level,
        detected_interactions: assessmentResult[0].detected_interactions,
        detected_contraindications: assessmentResult[0].detected_contraindications,
        risk_factors: assessmentResult[0].risk_factors,
        safety_recommendations: assessmentResult[0].safety_recommendations
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Failed to assess medication safety' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assess patient medication safety' }, { status: 500 });
  }
}

// PUT - Update patient medication safety assessment
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
      .from('patient_medication_safety_assessments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient medication safety assessment' }, { status: 500 });
  }
}

// DELETE - Delete patient medication safety assessment
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
      .from('patient_medication_safety_assessments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Patient medication safety assessment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient medication safety assessment' }, { status: 500 });
  }
}











