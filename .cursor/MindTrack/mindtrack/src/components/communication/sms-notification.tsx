'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTwilioSMS, AppointmentData, MedicationData, PaymentData } from '@/hooks/useTwilioSMS';
import { 
  MessageSquare, 
  Send, 
  Calendar, 
  Pill, 
  DollarSign, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  Clock,
  User
} from 'lucide-react';

interface SMSNotificationProps {
  patientPhone?: string;
  onSend?: (result: any) => void;
}

export default function SMSNotification({ patientPhone, onSend }: SMSNotificationProps) {
  const [selectedType, setSelectedType] = useState<string>('custom');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState(patientPhone || '');
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    date: '',
    time: '',
    therapistName: '',
    location: '',
    type: '',
  });
  const [medicationData, setMedicationData] = useState<MedicationData>({
    medicationName: '',
    dosage: '',
    time: '',
    instructions: '',
  });
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: '',
    dueDate: '',
    invoiceNumber: '',
    paymentLink: '',
  });

  const {
    loading,
    sendSMS,
    sendAppointmentReminder,
    sendAppointmentConfirmation,
    sendAppointmentCancellation,
    sendMedicationReminder,
    sendPaymentReminder,
    validatePhoneNumber,
    formatPhoneNumber,
  } = useTwilioSMS();

  const handleSend = async () => {
    try {
      const formattedPhone = formatPhoneNumber(phone);
      
      if (!validatePhoneNumber(formattedPhone)) {
        alert('Invalid phone number format');
        return;
      }

      let result;

      switch (selectedType) {
        case 'appointment_reminder':
          result = await sendAppointmentReminder(formattedPhone, appointmentData);
          break;
        case 'appointment_confirmation':
          result = await sendAppointmentConfirmation(formattedPhone, appointmentData);
          break;
        case 'appointment_cancellation':
          result = await sendAppointmentCancellation(formattedPhone, appointmentData);
          break;
        case 'medication_reminder':
          result = await sendMedicationReminder(formattedPhone, medicationData);
          break;
        case 'payment_reminder':
          result = await sendPaymentReminder(formattedPhone, paymentData);
          break;
        default:
          result = await sendSMS(formattedPhone, message);
          break;
      }

      if (onSend) {
        onSend(result);
      }

      // Reset form
      setMessage('');
      setPhone('');
      setAppointmentData({
        date: '',
        time: '',
        therapistName: '',
        location: '',
        type: '',
      });
      setMedicationData({
        medicationName: '',
        dosage: '',
        time: '',
        instructions: '',
      });
      setPaymentData({
        amount: '',
        dueDate: '',
        invoiceNumber: '',
        paymentLink: '',
      });

      alert('SMS sent successfully!');
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Failed to send SMS');
    }
  };

  const renderFormFields = () => {
    switch (selectedType) {
      case 'appointment_reminder':
      case 'appointment_confirmation':
      case 'appointment_cancellation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointment-date">Date</Label>
                <Input
                  id="appointment-date"
                  type="date"
                  value={appointmentData.date}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="appointment-time">Time</Label>
                <Input
                  id="appointment-time"
                  type="time"
                  value={appointmentData.time}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="therapist-name">Therapist Name</Label>
              <Input
                id="therapist-name"
                value={appointmentData.therapistName}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, therapistName: e.target.value }))}
                placeholder="Dr. John Doe"
              />
            </div>
            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={appointmentData.location || ''}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="123 Main St, City"
              />
            </div>
            {selectedType === 'appointment_confirmation' && (
              <div>
                <Label htmlFor="confirmation-code">Confirmation Code (Optional)</Label>
                <Input
                  id="confirmation-code"
                  value={appointmentData.confirmationCode || ''}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, confirmationCode: e.target.value }))}
                  placeholder="ABC123"
                />
              </div>
            )}
            {selectedType === 'appointment_cancellation' && (
              <div>
                <Label htmlFor="cancellation-reason">Reason (Optional)</Label>
                <Input
                  id="cancellation-reason"
                  value={appointmentData.reason || ''}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Emergency"
                />
              </div>
            )}
          </div>
        );

      case 'medication_reminder':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="medication-name">Medication Name</Label>
              <Input
                id="medication-name"
                value={medicationData.medicationName}
                onChange={(e) => setMedicationData(prev => ({ ...prev, medicationName: e.target.value }))}
                placeholder="Aspirin"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={medicationData.dosage}
                  onChange={(e) => setMedicationData(prev => ({ ...prev, dosage: e.target.value }))}
                  placeholder="100mg"
                />
              </div>
              <div>
                <Label htmlFor="medication-time">Time</Label>
                <Input
                  id="medication-time"
                  type="time"
                  value={medicationData.time}
                  onChange={(e) => setMedicationData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="instructions">Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                value={medicationData.instructions || ''}
                onChange={(e) => setMedicationData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Take with food"
              />
            </div>
          </div>
        );

      case 'payment_reminder':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="$150.00"
                />
              </div>
              <div>
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={paymentData.dueDate}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="invoice-number">Invoice Number (Optional)</Label>
              <Input
                id="invoice-number"
                value={paymentData.invoiceNumber || ''}
                onChange={(e) => setPaymentData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                placeholder="INV-2024-001"
              />
            </div>
            <div>
              <Label htmlFor="payment-link">Payment Link (Optional)</Label>
              <Input
                id="payment-link"
                value={paymentData.paymentLink || ''}
                onChange={(e) => setPaymentData(prev => ({ ...prev, paymentLink: e.target.value }))}
                placeholder="https://pay.example.com/invoice/123"
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              rows={4}
            />
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Send SMS Notification
        </CardTitle>
        <CardDescription>
          Send automated SMS notifications to patients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1234567890"
          />
        </div>

        <div>
          <Label htmlFor="sms-type">SMS Type</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Select SMS type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Custom Message
                </div>
              </SelectItem>
              <SelectItem value="appointment_reminder">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Appointment Reminder
                </div>
              </SelectItem>
              <SelectItem value="appointment_confirmation">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Appointment Confirmation
                </div>
              </SelectItem>
              <SelectItem value="appointment_cancellation">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Appointment Cancellation
                </div>
              </SelectItem>
              <SelectItem value="medication_reminder">
                <div className="flex items-center">
                  <Pill className="h-4 w-4 mr-2" />
                  Medication Reminder
                </div>
              </SelectItem>
              <SelectItem value="payment_reminder">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment Reminder
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderFormFields()}

        <Button
          onClick={handleSend}
          disabled={loading || !phone}
          className="w-full"
        >
          {loading ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send SMS
            </>
          )}
        </Button>

        <div className="text-sm text-gray-500">
          <p>• SMS messages are sent via Twilio</p>
          <p>• Standard SMS rates apply</p>
          <p>• Patients can reply STOP to opt out</p>
        </div>
      </CardContent>
    </Card>
  );
}

