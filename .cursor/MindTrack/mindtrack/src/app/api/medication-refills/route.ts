import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Retrieve medication refills
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const medicationId = searchParams.get('medicationId');
    const refillStatus = searchParams.get('refillStatus');

    let query = supabase
      .from('medication_refills')
      .select(`
        *,
        medication:medications(name)
      `)
      .order('refill_date', { ascending: true });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (medicationId) {
      query = query.eq('medication_id', medicationId);
    }
    if (refillStatus) {
      query = query.eq('refill_status', refillStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch medication refills' }, { status: 500 });
  }
}

// POST - Create new medication refill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      client_id, 
      medication_id, 
      prescription_id,
      refill_number,
      original_quantity,
      remaining_quantity,
      refill_date,
      next_refill_date,
      refill_reminder_date,
      pharmacy_name,
      pharmacy_phone,
      notes 
    } = body;

    const { data, error } = await supabase
      .from('medication_refills')
      .insert({
        client_id,
        medication_id,
        prescription_id,
        refill_number,
        original_quantity,
        remaining_quantity,
        refill_date,
        next_refill_date,
        refill_reminder_date,
        pharmacy_name,
        pharmacy_phone,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create medication refill' }, { status: 500 });
  }
}

// PUT - Update medication refill status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, refill_status, refill_filled_date, refill_picked_date, notes } = body;

    const updateData: any = { refill_status };
    if (refill_filled_date) {
      updateData.refill_filled_date = refill_filled_date;
    }
    if (refill_picked_date) {
      updateData.refill_picked_date = refill_picked_date;
    }
    if (notes) {
      updateData.notes = notes;
    }

    const { data, error } = await supabase
      .from('medication_refills')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update medication refill' }, { status: 500 });
  }
}

// DELETE - Delete medication refill
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('medication_refills')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Medication refill deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete medication refill' }, { status: 500 });
  }
}
