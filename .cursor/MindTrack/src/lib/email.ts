import nodemailer from 'nodemailer';

// Email configuration with fallback dummy values
export const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'dummy@gmail.com',
    pass: process.env.EMAIL_PASS || 'dummy-password'
  }
};

// Create transporter
export const createEmailTransporter = () => {
  return nodemailer.createTransporter(EMAIL_CONFIG);
};

// Email templates
export const EMAIL_TEMPLATES = {
  appointmentReminder: {
    subject: 'Appointment Reminder - MindTrack',
    html: (data: { patientName: string; appointmentDate: string; appointmentTime: string; doctorName: string }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Reminder</h2>
        <p>Dear ${data.patientName},</p>
        <p>This is a reminder for your upcoming appointment:</p>
        <ul>
          <li><strong>Date:</strong> ${data.appointmentDate}</li>
          <li><strong>Time:</strong> ${data.appointmentTime}</li>
          <li><strong>Doctor:</strong> ${data.doctorName}</li>
        </ul>
        <p>Please arrive 15 minutes early for your appointment.</p>
        <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
        <br>
        <p>Best regards,<br>MindTrack Team</p>
      </div>
    `
  },
  medicationReminder: {
    subject: 'Medication Reminder - MindTrack',
    html: (data: { patientName: string; medicationName: string; dosage: string; time: string }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Medication Reminder</h2>
        <p>Dear ${data.patientName},</p>
        <p>This is a reminder to take your medication:</p>
        <ul>
          <li><strong>Medication:</strong> ${data.medicationName}</li>
          <li><strong>Dosage:</strong> ${data.dosage}</li>
          <li><strong>Time:</strong> ${data.time}</li>
        </ul>
        <p>Please take your medication as prescribed by your doctor.</p>
        <br>
        <p>Best regards,<br>MindTrack Team</p>
      </div>
    `
  },
  testResults: {
    subject: 'Test Results Available - MindTrack',
    html: (data: { patientName: string; testName: string; resultDate: string; doctorName: string }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Test Results Available</h2>
        <p>Dear ${data.patientName},</p>
        <p>Your test results are now available:</p>
        <ul>
          <li><strong>Test:</strong> ${data.testName}</li>
          <li><strong>Result Date:</strong> ${data.resultDate}</li>
          <li><strong>Doctor:</strong> ${data.doctorName}</li>
        </ul>
        <p>Please log in to your MindTrack account to view your results.</p>
        <p>If you have any questions, please contact your doctor.</p>
        <br>
        <p>Best regards,<br>MindTrack Team</p>
      </div>
    `
  },
  prescriptionReady: {
    subject: 'Prescription Ready - MindTrack',
    html: (data: { patientName: string; prescriptionName: string; pharmacyName: string; pickupDate: string }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Prescription Ready for Pickup</h2>
        <p>Dear ${data.patientName},</p>
        <p>Your prescription is ready for pickup:</p>
        <ul>
          <li><strong>Prescription:</strong> ${data.prescriptionName}</li>
          <li><strong>Pharmacy:</strong> ${data.pharmacyName}</li>
          <li><strong>Pickup Date:</strong> ${data.pickupDate}</li>
        </ul>
        <p>Please bring a valid ID when picking up your prescription.</p>
        <br>
        <p>Best regards,<br>MindTrack Team</p>
      </div>
    `
  }
};

// Send email function
export const sendEmail = async (
  to: string,
  template: keyof typeof EMAIL_TEMPLATES,
  data: any
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const transporter = createEmailTransporter();
    const emailTemplate = EMAIL_TEMPLATES[template];
    
    const mailOptions = {
      from: EMAIL_CONFIG.auth.user,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html(data)
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Send bulk emails
export const sendBulkEmails = async (
  recipients: Array<{ email: string; data: any }>,
  template: keyof typeof EMAIL_TEMPLATES
): Promise<{ success: boolean; results: Array<{ email: string; success: boolean; error?: string }> }> => {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendEmail(recipient.email, template, recipient.data);
    results.push({
      email: recipient.email,
      success: result.success,
      error: result.error
    });
  }
  
  const allSuccessful = results.every(r => r.success);
  
  return {
    success: allSuccessful,
    results
  };
};

// Verify email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email config verification failed:', error);
    return false;
  }
};
