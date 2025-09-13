import { NextRequest, NextResponse } from 'next/server';
import { 
  sendSMS, 
  sendAppointmentReminder, 
  sendAppointmentConfirmation, 
  sendAppointmentCancellation,
  sendMedicationReminder,
  sendPaymentReminder,
  sendCustomSMS,
  getMessageStatus,
  listMessages,
  validatePhoneNumber,
  formatPhoneNumber 
} from '@/lib/twilio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

// Send SMS
export async function POST(request: NextRequest) {
  try {
    const { 
      to, 
      message, 
      type, 
      appointmentData, 
      medicationData, 
      paymentData,
      options = {} 
    } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Validate phone number
    const formattedPhone = formatPhoneNumber(to);
    if (!validatePhoneNumber(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    let result;

    // Send different types of SMS based on type
    switch (type) {
      case 'appointment_reminder':
        if (!appointmentData) {
          return NextResponse.json(
            { error: 'Appointment data is required for reminder' },
            { status: 400 }
          );
        }
        result = await sendAppointmentReminder(formattedPhone, appointmentData);
        break;
      
      case 'appointment_confirmation':
        if (!appointmentData) {
          return NextResponse.json(
            { error: 'Appointment data is required for confirmation' },
            { status: 400 }
          );
        }
        result = await sendAppointmentConfirmation(formattedPhone, appointmentData);
        break;
      
      case 'appointment_cancellation':
        if (!appointmentData) {
          return NextResponse.json(
            { error: 'Appointment data is required for cancellation' },
            { status: 400 }
          );
        }
        result = await sendAppointmentCancellation(formattedPhone, appointmentData);
        break;
      
      case 'medication_reminder':
        if (!medicationData) {
          return NextResponse.json(
            { error: 'Medication data is required for reminder' },
            { status: 400 }
          );
        }
        result = await sendMedicationReminder(formattedPhone, medicationData);
        break;
      
      case 'payment_reminder':
        if (!paymentData) {
          return NextResponse.json(
            { error: 'Payment data is required for reminder' },
            { status: 400 }
          );
        }
        result = await sendPaymentReminder(formattedPhone, paymentData);
        break;
      
      case 'custom':
      default:
        result = await sendCustomSMS(formattedPhone, message, options);
        break;
    }

    // Log SMS to database
    await supabase
      .from('sms_logs')
      .insert({
        message_id: result.messageId,
        to: result.to,
        from: result.from,
        body: result.body,
        status: result.status,
        type: type || 'custom',
        price: result.price,
        price_unit: result.priceUnit,
        created_at: new Date().toISOString(),
      });

    return NextResponse.json(result);
  } catch (error) {
    console.error('SMS send error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}

// Get message status or list messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    const to = searchParams.get('to');
    const from = searchParams.get('from');
    const limit = searchParams.get('limit');

    if (messageId) {
      // Get specific message status
      const result = await getMessageStatus(messageId);
      return NextResponse.json(result);
    } else {
      // List messages
      const result = await listMessages({
        to: to || undefined,
        from: from || undefined,
        limit: limit ? parseInt(limit) : undefined,
      });
      return NextResponse.json({ messages: result });
    }
  } catch (error) {
    console.error('SMS get error:', error);
    return NextResponse.json(
      { error: 'Failed to get SMS data' },
      { status: 500 }
    );
  }
}