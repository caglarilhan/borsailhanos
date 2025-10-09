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

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        providers:provider_id (
          id,
          first_name,
          last_name
        )
      `)
      .eq('patient_id', id)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }

    // Transform the data to include provider name
    const transformedAppointments = appointments?.map(appointment => ({
      ...appointment,
      providerName: appointment.providers ? 
        `${appointment.providers.first_name} ${appointment.providers.last_name}` : 
        'Unknown Provider'
    })) || [];

    return NextResponse.json({ appointments: transformedAppointments });
  } catch (error) {
    console.error('Error in patient appointments API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
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
    const { providerId, date, time, duration, type, notes, location } = body;

    if (!providerId || !date || !time) {
      return NextResponse.json({ error: 'Provider, date, and time are required' }, { status: 400 });
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: id,
        provider_id: providerId,
        date,
        time,
        duration: duration || 60,
        type: type || 'consultation',
        notes: notes || '',
        location: location || 'in_person',
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Error in patient appointment creation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
