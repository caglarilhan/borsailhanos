import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// POST - Check drug interactions for a patient
export async function POST(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { patientId, medicationIds } = body;

    if (!patientId || !medicationIds || !Array.isArray(medicationIds)) {
      return NextResponse.json({ error: 'Patient ID and medication IDs array are required' }, { status: 400 });
    }

    // Call the PostgreSQL function to check interactions
    const { data: interactions, error: interactionsError } = await supabase
      .rpc('check_patient_drug_interactions', {
        patient_id: patientId,
        medication_ids: medicationIds
      });

    if (interactionsError) throw interactionsError;

    // Check for allergies
    const { data: allergies, error: allergiesError } = await supabase
      .rpc('check_patient_drug_allergies', {
        patient_id: patientId,
        medication_ids: medicationIds
      });

    if (allergiesError) throw allergiesError;

    // Check for contraindications
    const { data: contraindications, error: contraindicationsError } = await supabase
      .rpc('check_patient_contraindications', {
        patient_id: patientId,
        medication_ids: medicationIds
      });

    if (contraindicationsError) throw contraindicationsError;

    // Get active safety alerts
    const { data: safetyAlerts, error: safetyAlertsError } = await supabase
      .rpc('get_active_safety_alerts', {
        medication_ids: medicationIds
      });

    if (safetyAlertsError) throw safetyAlertsError;

    // Create patient alerts
    const { data: alertCount, error: alertError } = await supabase
      .rpc('create_patient_drug_alerts', {
        patient_id: patientId,
        medication_ids: medicationIds
      });

    if (alertError) throw alertError;

    const result = {
      interactions: interactions || [],
      allergies: allergies || [],
      contraindications: contraindications || [],
      safetyAlerts: safetyAlerts || [],
      alertCount: alertCount || 0,
      summary: {
        totalInteractions: interactions?.length || 0,
        totalAllergies: allergies?.length || 0,
        totalContraindications: contraindications?.length || 0,
        totalSafetyAlerts: safetyAlerts?.length || 0,
        totalAlerts: alertCount || 0
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Drug interaction check error:', error);
    return NextResponse.json({ error: 'Failed to check drug interactions' }, { status: 500 });
  }
}

// GET - Get interaction check history for a patient
export async function GET(request: NextRequest) {
    const supabase = getAdminClient();
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const limit = searchParams.get('limit') || '10';

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('interaction_check_history')
      .select('*')
      .eq('client_id', clientId)
      .order('check_date', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch interaction check history' }, { status: 500 });
  }
}
