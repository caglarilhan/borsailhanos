import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/pharmacogenomic-tests - Get pharmacogenomic tests
export async function GET(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const clinicId = searchParams.get('clinicId');
    const status = searchParams.get('status');

    // If analysis requested via action, route to helper
    const action = searchParams.get('action');
    if (action === 'analysis') {
      return getPharmacogenomicAnalysis(request);
    }

    let query = supabase
      .from('pharmacogenomic_tests')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
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

    const { data, error } = await query.order('test_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tests: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/pharmacogenomic-tests - Create a new pharmacogenomic test
export async function POST(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const body = await request.json();
    const {
      clientId,
      clinicId,
      testName,
      testDate,
      labName,
      testResults,
      interpretation,
      recommendations,
      status
    } = body;

    // Validate required fields
    if (!clientId || !testName || !testResults) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pharmacogenomic_tests')
      .insert({
        client_id: clientId,
        clinic_id: clinicId,
        test_name: testName,
        test_date: testDate || new Date().toISOString().split('T')[0],
        lab_name: labName,
        test_results: testResults,
        interpretation,
        recommendations: recommendations || [],
        status: status || 'completed'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ test: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/pharmacogenomic-tests/[id] - Update a pharmacogenomic test
export async function PUT(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pharmacogenomic_tests')
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

// DELETE /api/pharmacogenomic-tests/[id] - Delete a pharmacogenomic test
export async function DELETE(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('pharmacogenomic_tests')
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

// Helper: pharmacogenomic analysis
async function getPharmacogenomicAnalysis(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json(
      { error: 'Client ID is required' },
      { status: 400 }
    );
  }

  // Get genetic markers for the client
  const { data: geneticMarkers, error: markersError } = await supabase
    .from('genetic_markers')
    .select('*')
    .eq('client_id', clientId);

  if (markersError) {
    return NextResponse.json({ error: markersError.message }, { status: 500 });
  }

  // Get pharmacogenomic tests for the client
  const { data: tests, error: testsError } = await supabase
    .from('pharmacogenomic_tests')
    .select('*')
    .eq('client_id', clientId);

  if (testsError) {
    return NextResponse.json({ error: testsError.message }, { status: 500 });
  }

  // Generate medication recommendations based on genetic profile
  const recommendations = generateMedicationRecommendations(geneticMarkers, tests);

  return NextResponse.json({ geneticMarkers, tests, recommendations });
}

// Helper function to generate medication recommendations
function generateMedicationRecommendations(geneticMarkers: any[], tests: any[]) {
  const recommendations: any[] = [];

  const cyp2d6Test = tests.find(test => test.test_name.includes('CYP2D6'));
  if (cyp2d6Test) {
    const cyp2d6Status = cyp2d6Test.test_results.cyp2d6_status;
    if (cyp2d6Status === 'poor_metabolizer') {
      recommendations.push({
        gene: 'CYP2D6',
        status: 'Poor Metabolizer',
        medications: [
          'Avoid or reduce dose of CYP2D6 substrates',
          'Consider alternative medications',
          'Monitor for increased side effects'
        ],
        priority: 'high'
      });
    } else if (cyp2d6Status === 'intermediate_metabolizer') {
      recommendations.push({
        gene: 'CYP2D6',
        status: 'Intermediate Metabolizer',
        medications: [
          'Consider lower starting dose',
          'Monitor for side effects',
          'May need dose adjustment'
        ],
        priority: 'medium'
      });
    }
  }

  const cyp2c19Test = tests.find(test => test.test_name.includes('CYP2C19'));
  if (cyp2c19Test) {
    const cyp2c19Status = cyp2c19Test.test_results.cyp2c19_status;
    if (cyp2c19Status === 'poor_metabolizer') {
      recommendations.push({
        gene: 'CYP2C19',
        status: 'Poor Metabolizer',
        medications: [
          'Avoid clopidogrel',
          'Consider alternative antiplatelet therapy',
          'Monitor for reduced efficacy'
        ],
        priority: 'high'
      });
    }
  }

  return recommendations;
}
