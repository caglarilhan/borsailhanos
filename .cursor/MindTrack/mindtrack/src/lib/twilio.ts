import twilio from 'twilio';

// Twilio configuration
export const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || 'dummy_account_sid',
  authToken: process.env.TWILIO_AUTH_TOKEN || 'dummy_auth_token',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
  messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || 'dummy_service_sid',
};

// Initialize Twilio client
export function getTwilioClient() {
  return twilio(TWILIO_CONFIG.accountSid, TWILIO_CONFIG.authToken);
}

// Send SMS message
export async function sendSMS(
  to: string,
  message: string,
  options: {
    from?: string;
    messagingServiceSid?: string;
    statusCallback?: string;
    maxPrice?: string;
    provideFeedback?: boolean;
  } = {}
) {
  const client = getTwilioClient();
  
  try {
    const messageData: any = {
      body: message,
      to: to,
      from: options.from || TWILIO_CONFIG.phoneNumber,
    };

    // Use messaging service if available
    if (options.messagingServiceSid || TWILIO_CONFIG.messagingServiceSid) {
      messageData.messagingServiceSid = options.messagingServiceSid || TWILIO_CONFIG.messagingServiceSid;
      delete messageData.from; // Remove from when using messaging service
    }

    // Add optional parameters
    if (options.statusCallback) {
      messageData.statusCallback = options.statusCallback;
    }
    if (options.maxPrice) {
      messageData.maxPrice = options.maxPrice;
    }
    if (options.provideFeedback !== undefined) {
      messageData.provideFeedback = options.provideFeedback;
    }

    const result = await client.messages.create(messageData);
    
    return {
      success: true,
      messageId: result.sid,
      status: result.status,
      to: result.to,
      from: result.from,
      body: result.body,
      price: result.price,
      priceUnit: result.priceUnit,
      dateCreated: result.dateCreated,
    };
  } catch (error) {
    console.error('Twilio SMS error:', error);
    throw error;
  }
}

// Send appointment reminder SMS
export async function sendAppointmentReminder(
  patientPhone: string,
  appointmentData: {
    date: string;
    time: string;
    therapistName: string;
    location?: string;
    type?: string;
  }
) {
  const message = `Hi! This is a reminder for your appointment with ${appointmentData.therapistName} on ${appointmentData.date} at ${appointmentData.time}. ${appointmentData.location ? `Location: ${appointmentData.location}` : ''} Please reply STOP to opt out.`;
  
  return await sendSMS(patientPhone, message, {
    statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/sms/status-callback`,
  });
}

// Send appointment confirmation SMS
export async function sendAppointmentConfirmation(
  patientPhone: string,
  appointmentData: {
    date: string;
    time: string;
    therapistName: string;
    location?: string;
    confirmationCode?: string;
  }
) {
  const message = `Your appointment with ${appointmentData.therapistName} has been confirmed for ${appointmentData.date} at ${appointmentData.time}. ${appointmentData.location ? `Location: ${appointmentData.location}` : ''} ${appointmentData.confirmationCode ? `Confirmation code: ${appointmentData.confirmationCode}` : ''}`;
  
  return await sendSMS(patientPhone, message);
}

// Send appointment cancellation SMS
export async function sendAppointmentCancellation(
  patientPhone: string,
  appointmentData: {
    date: string;
    time: string;
    therapistName: string;
    reason?: string;
  }
) {
  const message = `Your appointment with ${appointmentData.therapistName} on ${appointmentData.date} at ${appointmentData.time} has been cancelled. ${appointmentData.reason ? `Reason: ${appointmentData.reason}` : ''} Please contact us to reschedule.`;
  
  return await sendSMS(patientPhone, message);
}

// Send medication reminder SMS
export async function sendMedicationReminder(
  patientPhone: string,
  medicationData: {
    medicationName: string;
    dosage: string;
    time: string;
    instructions?: string;
  }
) {
  const message = `Medication reminder: Take ${medicationData.dosage} of ${medicationData.medicationName} at ${medicationData.time}. ${medicationData.instructions ? `Instructions: ${medicationData.instructions}` : ''}`;
  
  return await sendSMS(patientPhone, message);
}

// Send payment reminder SMS
export async function sendPaymentReminder(
  patientPhone: string,
  paymentData: {
    amount: string;
    dueDate: string;
    invoiceNumber?: string;
    paymentLink?: string;
  }
) {
  const message = `Payment reminder: You have an outstanding balance of ${paymentData.amount} due on ${paymentData.dueDate}. ${paymentData.invoiceNumber ? `Invoice: ${paymentData.invoiceNumber}` : ''} ${paymentData.paymentLink ? `Pay online: ${paymentData.paymentLink}` : ''}`;
  
  return await sendSMS(patientPhone, message);
}

// Send custom SMS
export async function sendCustomSMS(
  patientPhone: string,
  message: string,
  options: {
    from?: string;
    statusCallback?: string;
  } = {}
) {
  return await sendSMS(patientPhone, message, options);
}

// Get message status
export async function getMessageStatus(messageId: string) {
  const client = getTwilioClient();
  
  try {
    const message = await client.messages(messageId).fetch();
    
    return {
      messageId: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body,
      price: message.price,
      priceUnit: message.priceUnit,
      dateCreated: message.dateCreated,
      dateUpdated: message.dateUpdated,
      dateSent: message.dateSent,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
    };
  } catch (error) {
    console.error('Twilio get message status error:', error);
    throw error;
  }
}

// List messages
export async function listMessages(options: {
  to?: string;
  from?: string;
  dateSent?: Date;
  limit?: number;
} = {}) {
  const client = getTwilioClient();
  
  try {
    const messages = await client.messages.list({
      to: options.to,
      from: options.from,
      dateSent: options.dateSent,
      limit: options.limit || 20,
    });
    
    return messages.map(message => ({
      messageId: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body,
      price: message.price,
      priceUnit: message.priceUnit,
      dateCreated: message.dateCreated,
      dateUpdated: message.dateUpdated,
      dateSent: message.dateSent,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
    }));
  } catch (error) {
    console.error('Twilio list messages error:', error);
    throw error;
  }
}

// Validate phone number
export function validatePhoneNumber(phoneNumber: string): boolean {
  // Basic phone number validation (E.164 format)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}

// Format phone number for Twilio
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Add + if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}



