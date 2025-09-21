import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

// Handle Twilio status callbacks
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const messageId = formData.get('MessageSid') as string;
    const status = formData.get('MessageStatus') as string;
    const to = formData.get('To') as string;
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const errorCode = formData.get('ErrorCode') as string;
    const errorMessage = formData.get('ErrorMessage') as string;
    const price = formData.get('Price') as string;
    const priceUnit = formData.get('PriceUnit') as string;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Update SMS log with status
    await supabase
      .from('sms_logs')
      .update({
        status: status,
        error_code: errorCode,
        error_message: errorMessage,
        price: price,
        price_unit: priceUnit,
        updated_at: new Date().toISOString(),
      })
      .eq('message_id', messageId);

    // Log status callback
    await supabase
      .from('sms_status_callbacks')
      .insert({
        message_id: messageId,
        status: status,
        to: to,
        from: from,
        body: body,
        error_code: errorCode,
        error_message: errorMessage,
        price: price,
        price_unit: priceUnit,
        callback_data: Object.fromEntries(formData.entries()),
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('SMS status callback error:', error);
    return NextResponse.json(
      { error: 'Failed to process status callback' },
      { status: 500 }
    );
  }
}


