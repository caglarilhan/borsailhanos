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

    // Fetch EDI 837 claims
    const { data: claims, error } = await supabase
      .from('edi837_claims')
      .select(`
        *,
        clients!edi837_claims_patient_id_fkey(name),
        user_profiles!edi837_claims_provider_id_fkey(name)
      `)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data
    const transformedClaims = claims?.map(claim => ({
      id: claim.id,
      claimNumber: claim.claim_number,
      patientId: claim.patient_id,
      providerId: claim.provider_id,
      diagnosisCodes: claim.diagnosis_codes || [],
      procedureCodes: claim.procedure_codes || [],
      billedAmount: claim.billed_amount,
      status: claim.status,
      submittedAt: claim.submitted_at,
      acceptedAt: claim.accepted_at,
      paidAt: claim.paid_at,
      deniedAt: claim.denied_at,
      rejectionReason: claim.rejection_reason,
      edi837Data: claim.edi837_data,
      createdAt: claim.created_at,
      updatedAt: claim.updated_at
    })) || [];

    return NextResponse.json({ success: true, claims: transformedClaims });
  } catch (e: any) {
    console.error('Error fetching EDI 837 claims:', e);
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

    const {
      patientId,
      providerId,
      diagnosisCodes,
      procedureCodes,
      billedAmount,
      edi837Data
    } = await request.json();

    if (!patientId || !providerId || !diagnosisCodes || !procedureCodes || !billedAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Generate claim number
    const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create EDI 837 claim
    const { data: claim, error } = await supabase
      .from('edi837_claims')
      .insert({
        clinic_id: clinicId,
        claim_number: claimNumber,
        patient_id: patientId,
        provider_id: providerId,
        diagnosis_codes: diagnosisCodes,
        procedure_codes: procedureCodes,
        billed_amount: billedAmount,
        status: 'draft',
        edi837_data: edi837Data || '',
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, claim });
  } catch (e: any) {
    console.error('Error creating EDI 837 claim:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
