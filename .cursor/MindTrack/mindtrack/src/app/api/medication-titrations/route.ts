import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

  process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET /api/medication-titrations - Get medication titrations
export async function GET(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const medicationId = searchParams.get('medicationId');
    const clientId = searchParams.get('clientId');
    const clinicId = searchParams.get('clinicId');

    let query = supabase
      .from('medication_titrations')
      .select(`
        *,
        medications (
          id,
          medication_name,
          dosage,
          frequency
        )
      `);

    if (medicationId) {
      query = query.eq('medication_id', medicationId);
    }

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    const { data, error } = await query.order('titration_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ titrations: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/medication-titrations - Create a new titration
export async function POST(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const body = await request.json();
    const {
      medicationId,
      clientId,
      clinicId,
      titrationDate,
      oldDosage,
      newDosage,
      reason,
      effectivenessRating,
      sideEffectsRating,
      notes
    } = body;

    // Validate required fields
    if (!medicationId || !clientId || !newDosage || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('medication_titrations')
      .insert({
        medication_id: medicationId,
        client_id: clientId,
        clinic_id: clinicId,
        titration_date: titrationDate || new Date().toISOString().split('T')[0],
        old_dosage: oldDosage,
        new_dosage: newDosage,
        reason,
        effectiveness_rating: effectivenessRating,
        side_effects_rating: sideEffectsRating,
        notes
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update the medication with new dosage
    await supabase
      .from('medications')
      .update({ 
        dosage: newDosage,
        updated_at: new Date().toISOString()
      })
      .eq('id', medicationId);

    return NextResponse.json({ titration: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/medication-titrations/[id] - Update a titration
export async function PUT(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Titration ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('medication_titrations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ titration: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/medication-titrations/[id] - Delete a titration
export async function DELETE(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Titration ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('medication_titrations')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Titration deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
