import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eraId } = await request.json();

    if (!eraId) {
      return NextResponse.json({ error: 'ERA ID is required' }, { status: 400 });
    }

    // Get the ERA
    const { data: era, error: eraError } = await supabase
      .from('edi835_eras')
      .select('*')
      .eq('id', eraId)
      .single();

    if (eraError) throw eraError;

    if (!era) {
      return NextResponse.json({ error: 'ERA not found' }, { status: 404 });
    }

    if (era.status !== 'received') {
      return NextResponse.json({ error: 'ERA is not in received status' }, { status: 400 });
    }

    // Process the ERA
    const processingResult = await processERA(era);

    // Update ERA status
    const { error: updateError } = await supabase
      .from('edi835_eras')
      .update({
        status: processingResult.success ? 'processed' : 'error',
        processed_at: new Date().toISOString(),
        error_message: processingResult.error,
        updated_at: new Date().toISOString()
      })
      .eq('id', eraId);

    if (updateError) throw updateError;

    // If successful, update the corresponding claim
    if (processingResult.success) {
      const { error: claimUpdateError } = await supabase
        .from('edi837_claims')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', era.claim_id);

      if (claimUpdateError) {
        console.error('Failed to update claim status:', claimUpdateError);
      }
    }

    return NextResponse.json({ 
      success: processingResult.success, 
      message: processingResult.success ? 'ERA processed successfully' : processingResult.error
    });
  } catch (e: any) {
    console.error('Error processing EDI 835 ERA:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Process ERA data
async function processERA(era: any): Promise<{ success: boolean; error?: string }> {
  try {
    // Parse EDI 835 data to extract payment information
    const paymentData = parseERAForPayment(era.edi835_data);
    
    // Validate payment data
    if (!paymentData.claimId || !paymentData.checkNumber || !paymentData.checkAmount) {
      return { success: false, error: 'Invalid payment data in ERA' };
    }

    // Create payment record
    const supabase = await createSupabaseServerClient();
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        claim_id: era.claim_id,
        era_id: era.id,
        check_number: paymentData.checkNumber,
        check_amount: paymentData.checkAmount,
        payment_date: paymentData.paymentDate,
        payer_id: era.payer_id,
        status: 'posted',
        created_by: era.created_by
      });

    if (paymentError) {
      return { success: false, error: 'Failed to create payment record' };
    }

    // Log the processing
    await supabase
      .from('era_processing_logs')
      .insert({
        era_id: era.id,
        claim_id: era.claim_id,
        status: 'processed',
        processed_at: new Date().toISOString(),
        processed_by: era.created_by
      });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Processing failed' };
  }
}

// Parse ERA for payment information
function parseERAForPayment(edi835Data: string): any {
  // This is a simplified ERA parser
  // In production, you would use a proper EDI library
  
  const lines = edi835Data.split('~');
  let claimId = '';
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
    checkNumber,
    checkAmount,
    paymentDate
  };
}
