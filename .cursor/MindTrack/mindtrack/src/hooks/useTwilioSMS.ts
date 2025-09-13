'use client';

import { useState, useCallback } from 'react';

export interface SMSMessage {
  messageId: string;
  status: string;
  to: string;
  from: string;
  body: string;
  price?: string;
  priceUnit?: string;
  dateCreated: Date;
  dateUpdated?: Date;
  dateSent?: Date;
  errorCode?: string;
  errorMessage?: string;
}

export interface AppointmentData {
  date: string;
  time: string;
  therapistName: string;
  location?: string;
  type?: string;
  confirmationCode?: string;
  reason?: string;
}

export interface MedicationData {
  medicationName: string;
  dosage: string;
  time: string;
  instructions?: string;
}

export interface PaymentData {
  amount: string;
  dueDate: string;
  invoiceNumber?: string;
  paymentLink?: string;
}

export function useTwilioSMS() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<SMSMessage[]>([]);

  // Send SMS
  const sendSMS = useCallback(async (
    to: string,
    message: string,
    options: {
      type?: string;
      appointmentData?: AppointmentData;
      medicationData?: MedicationData;
      paymentData?: PaymentData;
      from?: string;
      statusCallback?: string;
    } = {}
  ) => {
    setLoading(true);
    try {
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          message,
          type: options.type || 'custom',
          appointmentData: options.appointmentData,
          medicationData: options.medicationData,
          paymentData: options.paymentData,
          options: {
            from: options.from,
            statusCallback: options.statusCallback,
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.error || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send appointment reminder
  const sendAppointmentReminder = useCallback(async (
    patientPhone: string,
    appointmentData: AppointmentData
  ) => {
    return await sendSMS(patientPhone, '', {
      type: 'appointment_reminder',
      appointmentData,
    });
  }, [sendSMS]);

  // Send appointment confirmation
  const sendAppointmentConfirmation = useCallback(async (
    patientPhone: string,
    appointmentData: AppointmentData
  ) => {
    return await sendSMS(patientPhone, '', {
      type: 'appointment_confirmation',
      appointmentData,
    });
  }, [sendSMS]);

  // Send appointment cancellation
  const sendAppointmentCancellation = useCallback(async (
    patientPhone: string,
    appointmentData: AppointmentData
  ) => {
    return await sendSMS(patientPhone, '', {
      type: 'appointment_cancellation',
      appointmentData,
    });
  }, [sendSMS]);

  // Send medication reminder
  const sendMedicationReminder = useCallback(async (
    patientPhone: string,
    medicationData: MedicationData
  ) => {
    return await sendSMS(patientPhone, '', {
      type: 'medication_reminder',
      medicationData,
    });
  }, [sendSMS]);

  // Send payment reminder
  const sendPaymentReminder = useCallback(async (
    patientPhone: string,
    paymentData: PaymentData
  ) => {
    return await sendSMS(patientPhone, '', {
      type: 'payment_reminder',
      paymentData,
    });
  }, [sendSMS]);

  // Get message status
  const getMessageStatus = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(`/api/sms?messageId=${messageId}`);
      const data = await response.json();
      
      if (data.messageId) {
        return data;
      } else {
        throw new Error(data.error || 'Failed to get message status');
      }
    } catch (error) {
      console.error('Error getting message status:', error);
      throw error;
    }
  }, []);

  // List messages
  const listMessages = useCallback(async (options: {
    to?: string;
    from?: string;
    limit?: number;
  } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (options.to) params.append('to', options.to);
      if (options.from) params.append('from', options.from);
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await fetch(`/api/sms?${params}`);
      const data = await response.json();
      
      if (data.messages) {
        setMessages(data.messages);
        return data.messages;
      } else {
        throw new Error(data.error || 'Failed to list messages');
      }
    } catch (error) {
      console.error('Error listing messages:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate phone number
  const validatePhoneNumber = useCallback((phoneNumber: string): boolean => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }, []);

  // Format phone number
  const formatPhoneNumber = useCallback((phoneNumber: string): string => {
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    return cleaned;
  }, []);

  // Send bulk SMS
  const sendBulkSMS = useCallback(async (
    recipients: Array<{
      phone: string;
      message: string;
      type?: string;
      appointmentData?: AppointmentData;
      medicationData?: MedicationData;
      paymentData?: PaymentData;
    }>
  ) => {
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        recipients.map(recipient => 
          sendSMS(recipient.phone, recipient.message, {
            type: recipient.type,
            appointmentData: recipient.appointmentData,
            medicationData: recipient.medicationData,
            paymentData: recipient.paymentData,
          })
        )
      );

      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');

      return {
        successful: successful.length,
        failed: failed.length,
        results: results.map((result, index) => ({
          recipient: recipients[index],
          status: result.status,
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason : null,
        })),
      };
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sendSMS]);

  return {
    loading,
    messages,
    sendSMS,
    sendAppointmentReminder,
    sendAppointmentConfirmation,
    sendAppointmentCancellation,
    sendMedicationReminder,
    sendPaymentReminder,
    getMessageStatus,
    listMessages,
    validatePhoneNumber,
    formatPhoneNumber,
    sendBulkSMS,
  };
}
