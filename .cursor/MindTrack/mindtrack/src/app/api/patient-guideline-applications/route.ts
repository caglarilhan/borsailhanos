import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve patient guideline applications
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const guidelineId = searchParams.get('guideline_id');
    const applicationType = searchParams.get('application_type');
    const implementationStatus = searchParams.get('implementation_status');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('patient_guideline_applications')
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
        applier:users!applied_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('application_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (guidelineId) {
      query = query.eq('guideline_id', guidelineId);
    }
    if (applicationType) {
      query = query.eq('application_type', applicationType);
    }
    if (implementationStatus) {
      query = query.eq('implementation_status', implementationStatus);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('application_date', startDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient guideline applications' }, { status: 500 });
  }
}

// POST - Apply clinical guidelines to a patient
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      guideline_id,
      application_type,
      patient_condition,
      patient_symptoms,
      patient_demographics,
      application_notes,
      applied_by
    } = body;

    // Validate required fields
    if (!patient_id || !guideline_id || !application_type || !patient_condition) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the database function to apply guidelines
    const { data: applicationResult, error: applyError } = await supabase.rpc(
      'apply_clinical_guidelines',
      {
        p_patient_id: patient_id,
        p_guideline_id: guideline_id,
        p_application_type: application_type,
        p_patient_condition: patient_condition,
        p_patient_symptoms: patient_symptoms,
        p_patient_demographics: patient_demographics
      }
    );

    if (applyError) throw applyError;

    // Update the application record with additional notes
    if (applicationResult && applicationResult.length > 0) {
      const applicationId = applicationResult[0].application_id;
      
      const { data: updatedApplication, error: updateError } = await supabase
        .from('patient_guideline_applications')
        .update({
          application_notes,
          applied_by
        })
        .eq('id', applicationId)
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
          )
        `)
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({
        application: updatedApplication,
        applicability_score: applicationResult[0].applicability_score,
        applicable_recommendations: applicationResult[0].applicable_recommendations,
        non_applicable_recommendations: applicationResult[0].non_applicable_recommendations
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Failed to apply guidelines' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to apply clinical guidelines' }, { status: 500 });
  }
}

// PUT - Update patient guideline application
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_guideline_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient guideline application' }, { status: 500 });
  }
}

// DELETE - Delete patient guideline application
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('patient_guideline_applications')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Patient guideline application deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient guideline application' }, { status: 500 });
  }
}




