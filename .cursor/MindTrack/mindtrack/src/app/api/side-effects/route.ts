import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const medicationName = searchParams.get('medication_name');
    const sideEffectName = searchParams.get('side_effect_name');
    const severity = searchParams.get('severity');

    let query = supabase
      .from('side_effects_database')
      .select('*');

    if (medicationName) {
      query = query.ilike('medication_name', `%${medicationName}%`);
    }
    if (sideEffectName) {
      query = query.ilike('side_effect_name', `%${sideEffectName}%`);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      medication_name,
      side_effect_name,
      severity,
      frequency,
      onset_timing,
      duration,
      risk_factors,
      contraindications,
      management_strategies,
      monitoring_parameters,
      fda_warnings,
      clinical_evidence,
      source_references
    } = body;

    const { data, error } = await supabase
      .from('side_effects_database')
      .insert({
        medication_name,
        side_effect_name,
        severity,
        frequency,
        onset_timing,
        duration,
        risk_factors,
        contraindications,
        management_strategies,
        monitoring_parameters,
        fda_warnings,
        clinical_evidence,
        source_references
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
      .from('side_effects_database')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('side_effects_database')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Side effect deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
