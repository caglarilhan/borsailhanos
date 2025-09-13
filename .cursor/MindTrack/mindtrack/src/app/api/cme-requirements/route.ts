import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve CME requirements
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const practitionerId = searchParams.get('practitioner_id');
    const requirementYear = searchParams.get('requirement_year');
    const requirementType = searchParams.get('requirement_type');
    const requirementStatus = searchParams.get('requirement_status');

    let query = supabase
      .from('cme_requirements')
      .select(`
        *,
        practitioners:users!practitioner_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('requirement_year', { ascending: false });

    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    if (requirementYear) {
      query = query.eq('requirement_year', parseInt(requirementYear));
    }
    if (requirementType) {
      query = query.eq('requirement_type', requirementType);
    }
    if (requirementStatus) {
      query = query.eq('requirement_status', requirementStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CME requirements' }, { status: 500 });
  }
}

// POST - Create CME requirement
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      requirement_id,
      practitioner_id,
      requirement_year,
      requirement_type,
      total_credits_required,
      category_1_credits_required,
      category_2_credits_required,
      specialty_credits_required,
      ethics_credits_required,
      pain_management_credits_required,
      credits_earned,
      credits_pending,
      requirement_status,
      due_date,
      completion_date,
      deficiency_notice_sent,
      deficiency_notice_date,
      notes
    } = body;

    // Validate required fields
    if (!requirement_id || !practitioner_id || !requirement_year || !requirement_type || !total_credits_required) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cme_requirements')
      .insert({
        requirement_id,
        practitioner_id,
        requirement_year,
        requirement_type,
        total_credits_required,
        category_1_credits_required: category_1_credits_required || 0,
        category_2_credits_required: category_2_credits_required || 0,
        specialty_credits_required: specialty_credits_required || 0,
        ethics_credits_required: ethics_credits_required || 0,
        pain_management_credits_required: pain_management_credits_required || 0,
        credits_earned: credits_earned || 0,
        credits_pending: credits_pending || 0,
        requirement_status: requirement_status || 'in_progress',
        due_date,
        completion_date,
        deficiency_notice_sent: deficiency_notice_sent || false,
        deficiency_notice_date,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create CME requirement' }, { status: 500 });
  }
}

// PUT - Update CME requirement
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'CME requirement ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cme_requirements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update CME requirement' }, { status: 500 });
  }
}

// DELETE - Delete CME requirement
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'CME requirement ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('cme_requirements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'CME requirement deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete CME requirement' }, { status: 500 });
  }
}

