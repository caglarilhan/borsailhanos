import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve rating scale assessments
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const medicationId = searchParams.get('medication_id');
    const scaleName = searchParams.get('scale_name');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('rating_scale_assessments')
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
        administrator:users!administered_by (
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
    if (scaleName) {
      query = query.eq('scale_name', scaleName);
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
    return NextResponse.json({ error: 'Failed to fetch rating scale assessments' }, { status: 500 });
  }
}

// POST - Create new rating scale assessment
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      medication_id,
      assessment_id,
      scale_name,
      scale_version,
      assessment_date,
      total_score,
      severity_level,
      individual_items,
      interpretation,
      administered_by
    } = body;

    // Validate required fields
    if (!patient_id || !medication_id || !scale_name || !total_score) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('rating_scale_assessments')
      .insert({
        patient_id,
        medication_id,
        assessment_id,
        scale_name,
        scale_version,
        assessment_date: assessment_date || new Date().toISOString(),
        total_score,
        severity_level,
        individual_items,
        interpretation,
        administered_by
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create rating scale assessment' }, { status: 500 });
  }
}

// PUT - Update rating scale assessment
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
      .from('rating_scale_assessments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update rating scale assessment' }, { status: 500 });
  }
}

// DELETE - Delete rating scale assessment
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
      .from('rating_scale_assessments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Rating scale assessment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete rating scale assessment' }, { status: 500 });
  }
}


