import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve drug level analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const medicationId = searchParams.get('medication_id');
    const analysisDate = searchParams.get('analysis_date');
    const daysBack = searchParams.get('days_back') || '30';

    let query = supabase
      .from('drug_level_analytics')
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
        )
      `)
      .order('analysis_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (medicationId) {
      query = query.eq('medication_id', medicationId);
    }
    if (analysisDate) {
      query = query.eq('analysis_date', analysisDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drug level analytics' }, { status: 500 });
  }
}

// POST - Calculate drug level trends
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { patient_id, medication_id, days_back = 30 } = body;

    if (!patient_id || !medication_id) {
      return NextResponse.json(
        { error: 'Patient ID and Medication ID are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('calculate_drug_level_trends', {
      p_patient_id: patient_id,
      p_medication_id: medication_id,
      p_days_back: days_back
    });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate drug level trends' }, { status: 500 });
  }
}

// PUT - Update drug level analytics
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { patient_id, medication_id, analysis_date = new Date().toISOString().split('T')[0] } = body;

    if (!patient_id || !medication_id) {
      return NextResponse.json(
        { error: 'Patient ID and Medication ID are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase.rpc('update_drug_level_analytics', {
      p_patient_id: patient_id,
      p_medication_id: medication_id,
      p_analysis_date: analysis_date
    });

    if (error) throw error;

    return NextResponse.json({ message: 'Drug level analytics updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update drug level analytics' }, { status: 500 });
  }
}


