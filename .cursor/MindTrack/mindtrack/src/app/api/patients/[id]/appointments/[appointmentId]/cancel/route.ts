import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; appointmentId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, appointmentId } = params;

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .eq('patient_id', id)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling appointment:', error);
      return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 });
    }

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Error in appointment cancellation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
