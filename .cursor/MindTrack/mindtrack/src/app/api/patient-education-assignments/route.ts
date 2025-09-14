import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve patient education assignments
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const materialId = searchParams.get('material_id');
    const assignmentStatus = searchParams.get('assignment_status');
    const priorityLevel = searchParams.get('priority_level');
    const assignmentType = searchParams.get('assignment_type');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('patient_education_assignments')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        patient_education_materials (
          id,
          material_title,
          material_type,
          material_category,
          material_description,
          estimated_completion_time
        ),
        assigner:users!assigned_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('assignment_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (materialId) {
      query = query.eq('material_id', materialId);
    }
    if (assignmentStatus) {
      query = query.eq('assignment_status', assignmentStatus);
    }
    if (priorityLevel) {
      query = query.eq('priority_level', priorityLevel);
    }
    if (assignmentType) {
      query = query.eq('assignment_type', assignmentType);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('assignment_date', startDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient education assignments' }, { status: 500 });
  }
}

// POST - Create new patient education assignment
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      material_id,
      assigned_by,
      due_date,
      priority_level,
      assignment_type,
      assignment_notes,
      assignment_instructions,
      completion_requirements,
      assessment_required,
      assessment_type,
      assessment_questions,
      passing_score,
      retake_allowed,
      max_attempts,
      assignment_status,
      follow_up_required,
      follow_up_date,
      follow_up_notes
    } = body;

    // Validate required fields
    if (!patient_id || !material_id || !assigned_by || !assignment_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_education_assignments')
      .insert({
        patient_id,
        material_id,
        assigned_by,
        due_date,
        priority_level: priority_level || 'medium',
        assignment_type,
        assignment_notes,
        assignment_instructions,
        completion_requirements,
        assessment_required: assessment_required || false,
        assessment_type,
        assessment_questions,
        passing_score,
        retake_allowed: retake_allowed !== undefined ? retake_allowed : true,
        max_attempts: max_attempts || 3,
        assignment_status: assignment_status || 'assigned',
        follow_up_required: follow_up_required || false,
        follow_up_date,
        follow_up_notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create patient education assignment' }, { status: 500 });
  }
}

// PUT - Update patient education assignment
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_education_assignments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient education assignment' }, { status: 500 });
  }
}

// DELETE - Delete patient education assignment
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('patient_education_assignments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Patient education assignment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient education assignment' }, { status: 500 });
  }
}


