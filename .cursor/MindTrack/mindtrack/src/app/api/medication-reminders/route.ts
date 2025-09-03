import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Retrieve medication reminders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const medicationId = searchParams.get('medicationId');
    const reminderStatus = searchParams.get('reminderStatus');
    const reminderType = searchParams.get('reminderType');

    let query = supabase
      .from('medication_reminders')
      .select(`
        *,
        medication:medications(name)
      `)
      .order('next_send_at', { ascending: true });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (medicationId) {
      query = query.eq('medication_id', medicationId);
    }
    if (reminderStatus) {
      query = query.eq('reminder_status', reminderStatus);
    }
    if (reminderType) {
      query = query.eq('reminder_type', reminderType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch medication reminders' }, { status: 500 });
  }
}

// POST - Create new medication reminder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      client_id, 
      medication_id, 
      reminder_type,
      reminder_message,
      reminder_time,
      reminder_frequency,
      reminder_days,
      reminder_method,
      next_send_at
    } = body;

    const { data, error } = await supabase
      .from('medication_reminders')
      .insert({
        client_id,
        medication_id,
        reminder_type,
        reminder_message,
        reminder_time,
        reminder_frequency,
        reminder_days,
        reminder_method,
        next_send_at
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create medication reminder' }, { status: 500 });
  }
}

// PUT - Update medication reminder
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      reminder_status, 
      last_sent_at, 
      next_send_at, 
      acknowledged_at, 
      acknowledged_by 
    } = body;

    const updateData: any = {};
    if (reminder_status) updateData.reminder_status = reminder_status;
    if (last_sent_at) updateData.last_sent_at = last_sent_at;
    if (next_send_at) updateData.next_send_at = next_send_at;
    if (acknowledged_at) updateData.acknowledged_at = acknowledged_at;
    if (acknowledged_by) updateData.acknowledged_by = acknowledged_by;

    const { data, error } = await supabase
      .from('medication_reminders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update medication reminder' }, { status: 500 });
  }
}

// DELETE - Delete medication reminder
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('medication_reminders')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Medication reminder deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete medication reminder' }, { status: 500 });
  }
}
