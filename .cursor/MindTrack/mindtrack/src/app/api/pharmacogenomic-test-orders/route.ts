import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve pharmacogenomic test orders
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const practitionerId = searchParams.get('practitioner_id');
    const testType = searchParams.get('test_type');
    const orderStatus = searchParams.get('order_status');
    const orderDate = searchParams.get('order_date');

    let query = supabase
      .from('pharmacogenomic_test_orders')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          date_of_birth
        ),
        practitioners:users!practitioner_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('order_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }
    if (testType) {
      query = query.eq('test_type', testType);
    }
    if (orderStatus) {
      query = query.eq('order_status', orderStatus);
    }
    if (orderDate) {
      query = query.eq('order_date', orderDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pharmacogenomic test orders' }, { status: 500 });
  }
}

// POST - Create pharmacogenomic test order
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      order_id,
      patient_id,
      practitioner_id,
      test_type,
      test_panel,
      indication,
      test_lab,
      lab_order_number,
      order_date,
      expected_result_date,
      actual_result_date,
      order_status,
      result_status,
      cost,
      insurance_coverage,
      prior_authorization_required,
      prior_authorization_obtained,
      consent_obtained,
      consent_date,
      notes
    } = body;

    // Validate required fields
    if (!order_id || !patient_id || !practitioner_id || !test_type || !indication || !order_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pharmacogenomic_test_orders')
      .insert({
        order_id,
        patient_id,
        practitioner_id,
        test_type,
        test_panel,
        indication,
        test_lab,
        lab_order_number,
        order_date,
        expected_result_date,
        actual_result_date,
        order_status: order_status || 'ordered',
        result_status,
        cost,
        insurance_coverage,
        prior_authorization_required,
        prior_authorization_obtained,
        consent_obtained,
        consent_date,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create pharmacogenomic test order' }, { status: 500 });
  }
}

// PUT - Update pharmacogenomic test order
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Pharmacogenomic test order ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pharmacogenomic_test_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update pharmacogenomic test order' }, { status: 500 });
  }
}

// DELETE - Delete pharmacogenomic test order
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Pharmacogenomic test order ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('pharmacogenomic_test_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Pharmacogenomic test order deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete pharmacogenomic test order' }, { status: 500 });
  }
}




