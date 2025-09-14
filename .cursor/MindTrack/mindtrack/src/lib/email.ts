// Email utility functions using SendGrid
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface InvitationEmailData {
  email: string;
  clinicName: string;
  inviterName: string;
  role: string;
  invitationLink: string;
}

export function getSendGridClient() {
  return sgMail;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key not configured, logging email instead:', options);
      return { success: true };
    }

    const msg = {
      to: options.to,
      from: options.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@mindtrack.app',
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html: options.html,
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${options.to}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function sendInvitationEmail(data: InvitationEmailData): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Clinic Invitation - MindTrack</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        .role-badge { background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 MindTrack Clinic Invitation</h1>
        </div>
        <div class="content">
          <h2>You've been invited to join ${data.clinicName}</h2>
          <p>Hello!</p>
          <p><strong>${data.inviterName}</strong> has invited you to join their clinic on MindTrack as a <span class="role-badge">${data.role}</span>.</p>
          
          <p>MindTrack is a comprehensive practice management system designed for mental health professionals, offering:</p>
          <ul>
            <li>📅 Appointment scheduling and calendar management</li>
            <li>📝 Secure clinical notes and documentation</li>
            <li>💰 Billing and insurance integration</li>
            <li>📊 Analytics and reporting</li>
            <li>🔒 HIPAA-compliant security</li>
          </ul>
          
          <p>Click the button below to accept your invitation and get started:</p>
          <a href="${data.invitationLink}" class="button">Accept Invitation</a>
          
          <p><strong>Important:</strong> This invitation will expire in 7 days. If you have any questions, please contact ${data.inviterName} directly.</p>
        </div>
        <div class="footer">
          <p>This email was sent by MindTrack Practice Management System</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    MindTrack Clinic Invitation
    
    Hello!
    
    ${data.inviterName} has invited you to join ${data.clinicName} on MindTrack as a ${data.role}.
    
    MindTrack is a comprehensive practice management system for mental health professionals.
    
    To accept your invitation, visit: ${data.invitationLink}
    
    This invitation will expire in 7 days.
    
    If you have any questions, please contact ${data.inviterName} directly.
    
    ---
    This email was sent by MindTrack Practice Management System
  `;

  return await sendEmail({
    to: data.email,
    subject: `Invitation to join ${data.clinicName} on MindTrack`,
    html,
    text
  });
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - MindTrack</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Reset Your MindTrack Password</h2>
          <p>Hello!</p>
          <p>We received a request to reset your password for your MindTrack account.</p>
          
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">${resetLink}</p>
        </div>
        <div class="footer">
          <p>This email was sent by MindTrack Practice Management System</p>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Password Reset Request - MindTrack',
    html
  });
}


