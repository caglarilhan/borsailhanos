import twilio from 'twilio';

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    throw new Error('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN');
  }
  
  return twilio(accountSid, authToken);
}

export async function sendSMSReminder(to: string, message: string) {
  const client = getTwilioClient();
  const from = process.env.TWILIO_PHONE_NUMBER;
  
  if (!from) {
    throw new Error('Missing TWILIO_PHONE_NUMBER');
  }
  
  try {
    const result = await client.messages.create({
      body: message,
      from: from,
      to: to
    });
    
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
}

export function formatAppointmentReminder(clientName: string, date: string, time: string, teleLink?: string): string {
  let message = `Hi ${clientName}, reminder for your appointment on ${date} at ${time}.`;
  
  if (teleLink) {
    message += ` Join here: ${teleLink}`;
  }
  
  return message;
}
