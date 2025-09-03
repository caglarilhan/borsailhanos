import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/medications - Get all medications for a clinic
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    let query = supabase
      .from('medications')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        )
      `);

    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ medications: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/medications - Create a new medication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientId,
      clinicId,
      medicationName,
      genericName,
      dosage,
      frequency,
      route,
      startDate,
      instructions,
      sideEffects,
      drugInteractions,
      allergies,
      priority,
      deaNumber
    } = body;

    // Validate required fields
    if (!clientId || !medicationName || !dosage || !frequency || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('medications')
      .insert({
        client_id: clientId,
        clinic_id: clinicId,
        medication_name: medicationName,
        generic_name: genericName,
        dosage,
        frequency,
        route: route || 'oral',
        start_date: startDate,
        instructions,
        side_effects: sideEffects || [],
        drug_interactions: drugInteractions || [],
        allergies: allergies || [],
        priority: priority || 'medium',
        dea_number: deaNumber,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ medication: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/medications/[id] - Update a medication
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Medication ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('medications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ medication: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/medications/[id] - Delete a medication
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Medication ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
