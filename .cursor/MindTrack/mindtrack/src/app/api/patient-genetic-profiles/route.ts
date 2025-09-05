import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve patient genetic profiles
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const practitionerId = searchParams.get('practitioner_id');
    const testDate = searchParams.get('test_date');
    const clinicalRelevance = searchParams.get('clinical_relevance');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('patient_genetic_profiles')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        practitioners:users!practitioner_id (
          id,
          first_name,
          last_name,
          email
        ),
        interpreters:users!interpreted_by (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('test_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    if (testDate) {
      query = query.eq('test_date', testDate);
    }
    if (clinicalRelevance) {
      query = query.eq('clinical_relevance', clinicalRelevance);
    }
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient genetic profiles' }, { status: 500 });
  }
}

// POST - Create patient genetic profile
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      practitioner_id,
      test_order_id,
      test_date,
      test_lab,
      test_method,
      test_coverage,
      quality_score,
      interpretation_date,
      interpreted_by,
      interpretation_notes,
      clinical_relevance,
      is_active
    } = body;

    // Validate required fields
    if (!patient_id || !practitioner_id || !test_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_genetic_profiles')
      .insert({
        patient_id,
        practitioner_id,
        test_order_id,
        test_date,
        test_lab,
        test_method,
        test_coverage,
        quality_score,
        interpretation_date,
        interpreted_by,
        interpretation_notes,
        clinical_relevance,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create patient genetic profile' }, { status: 500 });
  }
}

// PUT - Update patient genetic profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Patient genetic profile ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_genetic_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient genetic profile' }, { status: 500 });
  }
}

// DELETE - Delete patient genetic profile
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Patient genetic profile ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('patient_genetic_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Patient genetic profile deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient genetic profile' }, { status: 500 });
  }
}
