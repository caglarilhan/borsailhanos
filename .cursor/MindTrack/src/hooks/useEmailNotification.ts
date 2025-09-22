"use client";

import * as React from "react";
import { useEmailNotification } from "@/hooks/useEmailNotification";

interface EmailNotificationHookProps {
  userId: string;
}

export function useEmailNotification({ userId }: EmailNotificationHookProps) {
  const [loading, setLoading] = React.useState(false);
  const [configStatus, setConfigStatus] = React.useState<'checking' | 'valid' | 'invalid'>('checking');

  // Check email configuration
  const checkEmailConfig = React.useCallback(async () => {
    try {
      const response = await fetch('/api/email/send');
      const result = await response.json();
      setConfigStatus(result.success ? 'valid' : 'invalid');
      return result.success;
    } catch (error) {
      console.error('Failed to check email config:', error);
      setConfigStatus('invalid');
      return false;
    }
  }, []);

  // Send email
  const sendEmail = React.useCallback(async (
    to: string,
    template: string,
    data: Record<string, any>
  ) => {
    setLoading(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          template,
          data
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: 'Failed to send email' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Send bulk emails
  const sendBulkEmails = React.useCallback(async (
    recipients: Array<{ email: string; data: Record<string, any> }>,
    template: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipients,
          template,
          bulk: true
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Bulk email sending error:', error);
      return { success: false, error: 'Failed to send bulk emails' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Check config on mount
  React.useEffect(() => {
    checkEmailConfig();
  }, [checkEmailConfig]);

  return {
    loading,
    configStatus,
    checkEmailConfig,
    sendEmail,
    sendBulkEmails
  };
}



