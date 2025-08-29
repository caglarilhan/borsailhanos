import { NextRequest, NextResponse } from 'next/server';
import { sendSMSReminder, formatAppointmentReminder } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();
    if (!to || !message) {
      return NextResponse.json({ error: 'Missing to or message' }, { status: 400 });
    }

    const result = await sendSMSReminder(to, message);
    return NextResponse.json(result);
  } catch (error) {
    console.error('SMS API error:', error);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}
