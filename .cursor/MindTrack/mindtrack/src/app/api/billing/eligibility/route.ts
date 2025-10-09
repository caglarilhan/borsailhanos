import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's clinic
    const { data: clinicMember } = await supabase
      .from('clinic_members')
      .select('clinic_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!clinicMember?.clinic_id) {
      return NextResponse.json({ error: 'No active clinic found' }, { status: 400 });
    }

    const clinicId = clinicMember.clinic_id as string;

    // Fetch eligibility checks
    const { data: checks, error } = await supabase
      .from('eligibility_checks')
      .select(`
        *,
        clients!eligibility_checks_patient_id_fkey(name),
        insurance_providers!eligibility_checks_insurance_id_fkey(name)
      `)
      .eq('clinic_id', clinicId)
      .order('checked_at', { ascending: false });

    if (error) throw error;

    // Transform the data
    const transformedChecks = checks?.map(check => ({
      id: check.id,
      patientId: check.patient_id,
      insuranceId: check.insurance_id,
      status: check.status,
      coverage: check.coverage,
      benefits: check.benefits,
      checkedAt: check.checked_at,
      expiresAt: check.expires_at
    })) || [];

    return NextResponse.json({ success: true, checks: transformedChecks });
  } catch (e: any) {
    console.error('Error fetching eligibility checks:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patientId, insuranceId } = await request.json();

    if (!patientId || !insuranceId) {
      return NextResponse.json({ error: 'Patient ID and Insurance ID are required' }, { status: 400 });
    }

    // Get user's clinic
    const { data: clinicMember } = await supabase
      .from('clinic_members')
      .select('clinic_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!clinicMember?.clinic_id) {
      return NextResponse.json({ error: 'No active clinic found' }, { status: 400 });
    }

    const clinicId = clinicMember.clinic_id as string;

    // Check eligibility with insurance provider
    const eligibilityResult = await checkEligibilityWithProvider(patientId, insuranceId);

    // Create eligibility check record
    const { data: check, error } = await supabase
      .from('eligibility_checks')
      .insert({
        clinic_id: clinicId,
        patient_id: patientId,
        insurance_id: insuranceId,
        status: eligibilityResult.success ? 'verified' : 'failed',
        coverage: eligibilityResult.coverage,
        benefits: eligibilityResult.benefits,
        checked_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, check });
  } catch (e: any) {
    console.error('Error creating eligibility check:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Check eligibility with insurance provider
async function checkEligibilityWithProvider(patientId: string, insuranceId: string): Promise<{
  success: boolean;
  coverage?: any;
  benefits?: any;
  error?: string;
}> {
  try {
    // Simulate eligibility check with insurance provider
    // In production, you would integrate with real eligibility APIs like:
    // - Change Healthcare Eligibility API
    // - Availity Eligibility API
    // - Office Ally Eligibility API
    // - etc.
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success/failure based on patient ID
    const isValidPatient = patientId.length > 0;
    
    if (isValidPatient) {
      return {
        success: true,
        coverage: {
          active: true,
          effectiveDate: '2024-01-01',
          terminationDate: null,
          copay: 25,
          deductible: 500,
          coinsurance: 20,
          outOfPocketMax: 5000
        },
        benefits: {
          mentalHealth: true,
          copay: 25,
          deductible: 500,
          coinsurance: 20,
          priorAuthRequired: false
        }
      };
    } else {
      return {
        success: false,
        error: 'Invalid patient ID'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Network error'
    };
  }
}
