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

    // Fetch EDI 835 ERAs
    const { data: eras, error } = await supabase
      .from('edi835_eras')
      .select(`
        *,
        edi837_claims!edi835_eras_claim_id_fkey(claim_number),
        insurance_providers!edi835_eras_payer_id_fkey(name)
      `)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data
    const transformedERAs = eras?.map(era => ({
      id: era.id,
      claimId: era.claim_id,
      payerId: era.payer_id,
      checkNumber: era.check_number,
      checkAmount: era.check_amount,
      paymentDate: era.payment_date,
      status: era.status,
      errorMessage: era.error_message,
      edi835Data: era.edi835_data,
      createdAt: era.created_at,
      processedAt: era.processed_at
    })) || [];

    return NextResponse.json({ success: true, eras: transformedERAs });
  } catch (e: any) {
    console.error('Error fetching EDI 835 ERAs:', e);
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

    const { edi835Data } = await request.json();

    if (!edi835Data) {
      return NextResponse.json({ error: 'EDI 835 data is required' }, { status: 400 });
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

    // Parse EDI 835 data
    const parsedData = parseEDI835(edi835Data);

    // Create EDI 835 ERA record
    const { data: era, error } = await supabase
      .from('edi835_eras')
      .insert({
        clinic_id: clinicId,
        claim_id: parsedData.claimId,
        payer_id: parsedData.payerId,
        check_number: parsedData.checkNumber,
        check_amount: parsedData.checkAmount,
        payment_date: parsedData.paymentDate,
        status: 'received',
        edi835_data: edi835Data,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, era });
  } catch (e: any) {
    console.error('Error creating EDI 835 ERA:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Parse EDI 835 data
function parseEDI835(edi835Data: string): any {
  // This is a simplified EDI 835 parser
  // In production, you would use a proper EDI library
  
  const lines = edi835Data.split('~');
  let claimId = '';
  let payerId = '';
  let checkNumber = '';
  let checkAmount = 0;
  let paymentDate = '';

  for (const line of lines) {
    const segments = line.split('*');
    const segmentId = segments[0];

    switch (segmentId) {
      case 'CLP':
        // Claim Payment Information
        claimId = segments[1] || '';
        checkAmount = parseFloat(segments[3] || '0');
        break;
      case 'CAS':
        // Claim Adjustment
        break;
      case 'REF':
        // Reference Information
        if (segments[1] === 'EV') {
          checkNumber = segments[2] || '';
        }
        break;
      case 'DTM':
        // Date/Time Reference
        if (segments[1] === '405') {
          paymentDate = segments[2] || '';
        }
        break;
    }
  }

  return {
    claimId,
    payerId,
    checkNumber,
    checkAmount,
    paymentDate
  };
}
