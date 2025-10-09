import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve prescription fraud detection records
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get('prescription_id');
    const fraudCategory = searchParams.get('fraud_category');
    const investigationRequired = searchParams.get('investigation_required');
    const minFraudScore = searchParams.get('min_fraud_score');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('prescription_fraud_detection')
      .select(`
        *,
        prescriptions (
          id,
          medication_name,
          patient_id,
          prescriber_id
        )
      `)
      .order('created_at', { ascending: false });

    if (prescriptionId) {
      query = query.eq('prescription_id', prescriptionId);
    }
    if (fraudCategory) {
      query = query.eq('fraud_category', fraudCategory);
    }
    if (investigationRequired) {
      query = query.eq('investigation_required', investigationRequired === 'true');
    }
    if (minFraudScore) {
      query = query.gte('fraud_score', parseFloat(minFraudScore));
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prescription fraud detection records' }, { status: 500 });
  }
}

// POST - Detect prescription fraud
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      prescription_id,
      patient_id,
      prescriber_id,
      medication_name,
      quantity_prescribed,
      days_supply,
      prescription_date
    } = body;

    // Validate required fields
    if (!prescription_id || !patient_id || !prescriber_id || !medication_name || !quantity_prescribed || !days_supply || !prescription_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the database function to detect fraud
    const { data: fraudResult, error: fraudError } = await supabase.rpc(
      'detect_prescription_fraud',
      {
        p_prescription_id: prescription_id,
        p_patient_id: patient_id,
        p_prescriber_id: prescriber_id,
        p_medication_name: medication_name,
        p_quantity_prescribed: quantity_prescribed,
        p_days_supply: days_supply,
        p_prescription_date: prescription_date
      }
    );

    if (fraudError) throw fraudError;

    // Create fraud detection record
    if (fraudResult && fraudResult.length > 0) {
      const fraudData = fraudResult[0];
      
      const { data: fraudRecord, error: insertError } = await supabase
        .from('prescription_fraud_detection')
        .insert({
          prescription_id,
          fraud_score: fraudData.fraud_score,
          fraud_indicators: fraudData.fraud_indicators,
          risk_factors: fraudData.risk_factors,
          fraud_probability: fraudData.fraud_probability,
          fraud_category: fraudData.fraud_category,
          confidence_level: fraudData.confidence_level,
          investigation_required: fraudData.fraud_score > 0.7,
          detection_method: 'rule_based'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return NextResponse.json({
        fraud_detection: fraudRecord,
        fraud_score: fraudData.fraud_score,
        fraud_indicators: fraudData.fraud_indicators,
        risk_factors: fraudData.risk_factors,
        fraud_probability: fraudData.fraud_probability,
        fraud_category: fraudData.fraud_category,
        confidence_level: fraudData.confidence_level
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Failed to detect prescription fraud' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to detect prescription fraud' }, { status: 500 });
  }
}

// PUT - Update prescription fraud detection record
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Fraud detection record ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('prescription_fraud_detection')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update prescription fraud detection record' }, { status: 500 });
  }
}

// DELETE - Delete prescription fraud detection record
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Fraud detection record ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('prescription_fraud_detection')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Prescription fraud detection record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete prescription fraud detection record' }, { status: 500 });
  }
}











