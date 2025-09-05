import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET /api/laboratory-tests - Get laboratory tests
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const clinicId = searchParams.get('clinicId');
    const status = searchParams.get('status');
    const testCategory = searchParams.get('testCategory');

    let query = supabase
      .from('laboratory_tests')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        psychiatric_lab_tests (
          id,
          test_type,
          medication_related,
          medication_name,
          result_value,
          unit,
          is_abnormal,
          abnormality_type,
          clinical_action
        )
      `);

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (testCategory) {
      query = query.eq('test_category', testCategory);
    }

    const { data, error } = await query.order('test_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tests: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/laboratory-tests - Create a new laboratory test
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      clientId,
      clinicId,
      testName,
      testCategory,
      testDate,
      labName,
      orderingProvider,
      results,
      referenceRanges,
      interpretation,
      clinicalSignificance,
      followUpRequired,
      followUpDate,
      notes,
      psychiatricTestData
    } = body;

    // Validate required fields
    if (!clientId || !testName || !testCategory || !results) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert main laboratory test
    const { data: labTest, error: labError } = await supabase
      .from('laboratory_tests')
      .insert({
        client_id: clientId,
        clinic_id: clinicId,
        test_name: testName,
        test_category: testCategory,
        test_date: testDate || new Date().toISOString().split('T')[0],
        lab_name: labName,
        ordering_provider: orderingProvider,
        results,
        reference_ranges: referenceRanges,
        interpretation,
        clinical_significance: clinicalSignificance,
        follow_up_required: followUpRequired || false,
        follow_up_date: followUpDate,
        notes,
        status: 'completed'
      })
      .select()
      .single();

    if (labError) {
      return NextResponse.json({ error: labError.message }, { status: 500 });
    }

    // Insert psychiatric-specific test data if provided
    if (psychiatricTestData && labTest) {
      const { error: psychError } = await supabase
        .from('psychiatric_lab_tests')
        .insert({
          lab_test_id: labTest.id,
          client_id: clientId,
          test_type: psychiatricTestData.testType,
          medication_related: psychiatricTestData.medicationRelated || false,
          medication_name: psychiatricTestData.medicationName,
          therapeutic_range_min: psychiatricTestData.therapeuticRangeMin,
          therapeutic_range_max: psychiatricTestData.therapeuticRangeMax,
          toxic_range_min: psychiatricTestData.toxicRangeMin,
          toxic_range_max: psychiatricTestData.toxicRangeMax,
          result_value: psychiatricTestData.resultValue,
          unit: psychiatricTestData.unit,
          is_abnormal: psychiatricTestData.isAbnormal || false,
          abnormality_type: psychiatricTestData.abnormalityType,
          clinical_action: psychiatricTestData.clinicalAction
        });

      if (psychError) {
        console.error('Error inserting psychiatric test data:', psychError);
      }
    }

    return NextResponse.json({ test: labTest }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/laboratory-tests/[id] - Update a laboratory test
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('laboratory_tests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ test: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/laboratory-tests/[id] - Delete a laboratory test
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('laboratory_tests')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Test deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper: abnormal results
async function getAbnormalResults(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  const clinicId = searchParams.get('clinicId');
  const daysBack = parseInt(searchParams.get('daysBack') || '30');

  let query = supabase
    .from('laboratory_tests')
    .select(`
      *,
      psychiatric_lab_tests (
        id,
        test_type,
        medication_related,
        medication_name,
        result_value,
        unit,
        is_abnormal,
        abnormality_type,
        clinical_action
      )
    `)
    .gte('test_date', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  if (clientId) {
    query = query.eq('client_id', clientId);
  }
  if (clinicId) {
    query = query.eq('clinic_id', clinicId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const abnormalResults = data.filter(test => {
    if (test.status === 'abnormal') return true;
    if (test.psychiatric_lab_tests && test.psychiatric_lab_tests.length > 0) {
      return test.psychiatric_lab_tests.some((psychTest: any) => psychTest.is_abnormal);
    }
    return false;
  });

  return NextResponse.json({ abnormalResults });
}

// Helper: follow-up tests
async function getFollowUpTests(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  const clinicId = searchParams.get('clinicId');

  let query = supabase
    .from('laboratory_tests')
    .select('*')
    .eq('follow_up_required', true);

  if (clientId) {
    query = query.eq('client_id', clientId);
  }
  if (clinicId) {
    query = query.eq('clinic_id', clinicId);
  }

  const { data, error } = await query.order('follow_up_date', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ followUpTests: data });
}

// Route multiplexer based on path query (fallback for legacy routes)
export async function HEAD() {}
export async function OPTIONS() {}
