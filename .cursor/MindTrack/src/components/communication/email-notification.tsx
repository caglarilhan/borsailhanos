"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface EmailNotificationProps {
  userId: string;
  onEmailSent?: (result: any) => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'date' | 'time';
    required: boolean;
  }>;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'appointmentReminder',
    name: 'Appointment Reminder',
    description: 'Send appointment reminders to patients',
    fields: [
      { name: 'patientName', label: 'Patient Name', type: 'text', required: true },
      { name: 'appointmentDate', label: 'Appointment Date', type: 'date', required: true },
      { name: 'appointmentTime', label: 'Appointment Time', type: 'time', required: true },
      { name: 'doctorName', label: 'Doctor Name', type: 'text', required: true }
    ]
  },
  {
    id: 'medicationReminder',
    name: 'Medication Reminder',
    description: 'Send medication reminders to patients',
    fields: [
      { name: 'patientName', label: 'Patient Name', type: 'text', required: true },
      { name: 'medicationName', label: 'Medication Name', type: 'text', required: true },
      { name: 'dosage', label: 'Dosage', type: 'text', required: true },
      { name: 'time', label: 'Time', type: 'time', required: true }
    ]
  },
  {
    id: 'testResults',
    name: 'Test Results',
    description: 'Notify patients when test results are available',
    fields: [
      { name: 'patientName', label: 'Patient Name', type: 'text', required: true },
      { name: 'testName', label: 'Test Name', type: 'text', required: true },
      { name: 'resultDate', label: 'Result Date', type: 'date', required: true },
      { name: 'doctorName', label: 'Doctor Name', type: 'text', required: true }
    ]
  },
  {
    id: 'prescriptionReady',
    name: 'Prescription Ready',
    description: 'Notify patients when prescriptions are ready for pickup',
    fields: [
      { name: 'patientName', label: 'Patient Name', type: 'text', required: true },
      { name: 'prescriptionName', label: 'Prescription Name', type: 'text', required: true },
      { name: 'pharmacyName', label: 'Pharmacy Name', type: 'text', required: true },
      { name: 'pickupDate', label: 'Pickup Date', type: 'date', required: true }
    ]
  }
];

export default function EmailNotification({ userId, onEmailSent }: EmailNotificationProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('');
  const [recipientEmail, setRecipientEmail] = React.useState<string>('');
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<any>(null);
  const [configStatus, setConfigStatus] = React.useState<'checking' | 'valid' | 'invalid'>('checking');

  // Check email configuration on mount
  React.useEffect(() => {
    checkEmailConfig();
  }, []);

  const checkEmailConfig = async () => {
    try {
      const response = await fetch('/api/email/send');
      const result = await response.json();
      setConfigStatus(result.success ? 'valid' : 'invalid');
    } catch (error) {
      console.error('Failed to check email config:', error);
      setConfigStatus('invalid');
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setFormData({});
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSendEmail = async () => {
    if (!selectedTemplate || !recipientEmail) {
      alert('Please select a template and enter recipient email');
      return;
    }

    const template = EMAIL_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Validate required fields
    const missingFields = template.fields
      .filter(field => field.required && !formData[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipientEmail,
          template: selectedTemplate,
          data: formData
        }),
      });

      const result = await response.json();
      setLastResult(result);

      if (result.success) {
        alert('Email sent successfully!');
        if (onEmailSent) {
          onEmailSent(result);
        }
        // Reset form
        setRecipientEmail('');
        setFormData({});
      } else {
        alert(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error('Email sending error:', error);
      alert('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplateData = EMAIL_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Send automated email notifications to patients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Configuration Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Email Configuration:</span>
            {configStatus === 'checking' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking...
              </Badge>
            )}
            {configStatus === 'valid' && (
              <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                <CheckCircle className="h-3 w-3" />
                Valid
              </Badge>
            )}
            {configStatus === 'invalid' && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Invalid
              </Badge>
            )}
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Email Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an email template" />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">{template.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="patient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>

          {/* Dynamic Form Fields */}
          {selectedTemplateData && (
            <div className="space-y-4">
              <h4 className="font-medium">Template Data</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTemplateData.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === 'text' && (
                      <Input
                        id={field.name}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      />
                    )}
                    {field.type === 'email' && (
                      <Input
                        id={field.name}
                        type="email"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      />
                    )}
                    {field.type === 'date' && (
                      <Input
                        id={field.name}
                        type="date"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      />
                    )}
                    {field.type === 'time' && (
                      <Input
                        id={field.name}
                        type="time"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={handleSendEmail}
            disabled={loading || configStatus !== 'valid'}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>

          {/* Last Result */}
          {lastResult && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50">
              <h5 className="font-medium mb-2">Last Result:</h5>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(lastResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}










