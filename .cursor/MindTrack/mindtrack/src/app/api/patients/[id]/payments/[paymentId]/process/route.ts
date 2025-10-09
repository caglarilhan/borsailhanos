import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; paymentId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, paymentId } = params;
    const body = await request.json();
    const { method } = body;

    // Get payment info first
    const { data: payment, error: fetchError } = await supabase
      .from('patient_payments')
      .select('*')
      .eq('id', paymentId)
      .eq('patient_id', id)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'pending') {
      return NextResponse.json({ error: 'Payment is not pending' }, { status: 400 });
    }

    // Simulate payment processing (in a real implementation, this would integrate with a payment processor)
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    // Simulate success/failure (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;

    const { data: updatedPayment, error: updateError } = await supabase
      .from('patient_payments')
      .update({
        status: isSuccess ? 'completed' : 'failed',
        method: method || 'credit_card',
        transaction_id: isSuccess ? transactionId : null,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .eq('patient_id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
    }

    return NextResponse.json({ 
      payment: updatedPayment,
      success: isSuccess,
      message: isSuccess ? 'Payment processed successfully' : 'Payment processing failed'
    });
  } catch (error) {
    console.error('Error in payment processing API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
