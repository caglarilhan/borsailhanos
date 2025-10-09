import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const { data: medications, error } = await supabase
      .from('patient_medications')
      .select(`
        *,
        drug_interactions:medication_id (
          id,
          medication1,
          medication2,
          severity,
          description,
          recommendation
        ),
        lab_monitoring:medication_id (
          id,
          test_name,
          frequency,
          last_test,
          next_due,
          is_required
        )
      `)
      .eq('patient_id', patientId)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching medications:', error);
      return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 });
    }

    return NextResponse.json({ medications });
  } catch (error) {
    console.error('Error in medications API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      patientId, 
      name, 
      genericName, 
      brandName, 
      dosage, 
      frequency, 
      duration, 
      instructions, 
      startDate, 
      endDate 
    } = body;

    if (!patientId || !name || !dosage) {
      return NextResponse.json({ error: 'Patient ID, name, and dosage are required' }, { status: 400 });
    }

    const { data: medication, error } = await supabase
      .from('patient_medications')
      .insert({
        patient_id: patientId,
        name,
        generic_name: genericName,
        brand_name: brandName,
        dosage,
        frequency,
        duration,
        instructions,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        prescribed_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating medication:', error);
      return NextResponse.json({ error: 'Failed to create medication' }, { status: 500 });
    }

    return NextResponse.json({ medication });
  } catch (error) {
    console.error('Error in medication creation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
