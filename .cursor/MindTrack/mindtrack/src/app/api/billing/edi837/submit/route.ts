import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { claimId } = await request.json();

    if (!claimId) {
      return NextResponse.json({ error: 'Claim ID is required' }, { status: 400 });
    }

    // Get the claim
    const { data: claim, error: claimError } = await supabase
      .from('edi837_claims')
      .select('*')
      .eq('id', claimId)
      .single();

    if (claimError) throw claimError;

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    if (claim.status !== 'draft') {
      return NextResponse.json({ error: 'Claim is not in draft status' }, { status: 400 });
    }

    // Generate EDI 837 data if not provided
    let edi837Data = claim.edi837_data;
    if (!edi837Data) {
      edi837Data = generateEDI837(claim);
    }

    // Submit to clearinghouse (simulated)
    const submissionResult = await submitToClearinghouse(edi837Data);

    // Update claim status
    const { error: updateError } = await supabase
      .from('edi837_claims')
      .update({
        status: submissionResult.success ? 'submitted' : 'rejected',
        submitted_at: new Date().toISOString(),
        edi837_data: edi837Data,
        rejection_reason: submissionResult.error,
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: submissionResult.success, 
      message: submissionResult.success ? 'Claim submitted successfully' : submissionResult.error
    });
  } catch (e: any) {
    console.error('Error submitting EDI 837 claim:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Generate EDI 837 data
function generateEDI837(claim: any): string {
  // This is a simplified EDI 837 generation
  // In production, you would use a proper EDI library
  const edi837 = `
ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *${new Date().toISOString().slice(0, 8).replace(/-/g, '')}*${new Date().toISOString().slice(8, 14).replace(/:/g, '').replace(/\./g, '')}*^*00501*000000001*0*P*:~
GS*HC*SENDER*RECEIVER*${new Date().toISOString().slice(0, 8).replace(/-/g, '')}*${new Date().toISOString().slice(8, 14).replace(/:/g, '').replace(/\./g, '')}*1*X*005010X222A1~
ST*837*0001*005010X222A1~
BHT*0019*00*${claim.claim_number}*${new Date().toISOString().slice(0, 8).replace(/-/g, '')}*${new Date().toISOString().slice(8, 14).replace(/:/g, '').replace(/\./g, '')}*CH~
NM1*41*2*CLEARINGHOUSE*****46*1234567890~
PER*IC*CONTACT*TE*5551234567~
NM1*40*2*RECEIVER*****46*9876543210~
HL*1**20*1~
PRV*BI*PXC*207Q00000X~
NM1*85*2*PROVIDER*****XX*${claim.provider_id}~
N3*123 MAIN ST~
N4*CITY*ST*12345~
REF*EI*123456789~
HL*2*1*22*0~
SBR*P*18*GROUP123*ACME INSURANCE*****CI~
NM1*IL*1*PATIENT*JOHN*DOE****MI*${claim.patient_id}~
N3*456 PATIENT ST~
N4*PATIENT CITY*ST*54321~
DMG*D8*19900101*M~
NM1*PR*2*ACME INSURANCE*****PI*123456789~
CLM*${claim.claim_number}*${claim.billed_amount}***11:B:1*Y*A*Y*I~
DTP*431*D8*${new Date().toISOString().slice(0, 10).replace(/-/g, '')}~
CL1*1*1*01~
HI*BK:${claim.diagnosis_codes.join('*BK:')}~
LX*1~
SV2*0450*HC:${claim.procedure_codes.join('*HC:')}*${claim.billed_amount}*UN*1~
DTP*472*D8*${new Date().toISOString().slice(0, 10).replace(/-/g, '')}~
SE*25*0001~
GE*1*1~
IEA*1*000000001~
  `.trim();

  return edi837;
}

// Submit to clearinghouse (simulated)
async function submitToClearinghouse(edi837Data: string): Promise<{ success: boolean; error?: string }> {
  // Simulate clearinghouse submission
  // In production, you would integrate with a real clearinghouse like Change Healthcare, Availity, etc.
  
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success/failure based on data validity
    const hasRequiredData = edi837Data.includes('ISA') && edi837Data.includes('CLM');
    
    if (hasRequiredData) {
      return { success: true };
    } else {
      return { success: false, error: 'Invalid EDI 837 format' };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}
