import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching patient:', error);
      return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
    }

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Error in patient API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { firstName, lastName, email, phone, dateOfBirth, address, emergencyContact, insuranceInfo, medicalHistory, allergies, medications } = body;

    const { data: patient, error } = await supabase
      .from('patients')
      .update({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        date_of_birth: dateOfBirth,
        address,
        emergency_contact: emergencyContact,
        insurance_info: insuranceInfo,
        medical_history: medicalHistory,
        allergies,
        medications,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating patient:', error);
      return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
    }

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Error in patient update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
