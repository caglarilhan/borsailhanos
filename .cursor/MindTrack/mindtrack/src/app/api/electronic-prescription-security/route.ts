import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve electronic prescription security records
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get('prescription_id');
    const securityLevel = searchParams.get('security_level');
    const encryptionMethod = searchParams.get('encryption_method');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('electronic_prescription_security')
      .select(`
        *,
        prescriptions (
          id,
          medication_name,
          patient_id,
          prescriber_id
        )
      `)
      .order('timestamp_signature', { ascending: false });

    if (prescriptionId) {
      query = query.eq('prescription_id', prescriptionId);
    }
    if (securityLevel) {
      query = query.eq('security_level', securityLevel);
    }
    if (encryptionMethod) {
      query = query.eq('encryption_method', encryptionMethod);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('timestamp_signature', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch electronic prescription security records' }, { status: 500 });
  }
}

// POST - Create new electronic prescription security record
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      prescription_id,
      security_level,
      encryption_method,
      digital_signature,
      signature_algorithm,
      certificate_serial,
      certificate_issuer,
      certificate_expiry,
      timestamp_signature,
      hash_value,
      hash_algorithm,
      tamper_detection,
      tamper_evidence,
      access_control_rules,
      audit_trail_id
    } = body;

    // Validate required fields
    if (!prescription_id || !security_level || !encryption_method || !digital_signature || !signature_algorithm || !certificate_serial || !certificate_issuer || !certificate_expiry || !timestamp_signature || !hash_value || !hash_algorithm) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('electronic_prescription_security')
      .insert({
        prescription_id,
        security_level,
        encryption_method,
        digital_signature,
        signature_algorithm,
        certificate_serial,
        certificate_issuer,
        certificate_expiry,
        timestamp_signature,
        hash_value,
        hash_algorithm,
        tamper_detection: tamper_detection !== undefined ? tamper_detection : true,
        tamper_evidence,
        access_control_rules,
        audit_trail_id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create electronic prescription security record' }, { status: 500 });
  }
}

// PUT - Update electronic prescription security record
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Security record ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('electronic_prescription_security')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update electronic prescription security record' }, { status: 500 });
  }
}

// DELETE - Delete electronic prescription security record
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Security record ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('electronic_prescription_security')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Electronic prescription security record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete electronic prescription security record' }, { status: 500 });
  }
}



