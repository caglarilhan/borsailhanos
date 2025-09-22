import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendBulkEmails, verifyEmailConfig } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, template, data, bulk } = body;

    if (!to || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: to, template' },
        { status: 400 }
      );
    }

    // Verify email configuration first
    const configValid = await verifyEmailConfig();
    if (!configValid) {
      return NextResponse.json(
        { error: 'Email configuration is invalid' },
        { status: 500 }
      );
    }

    let result;

    if (bulk && Array.isArray(to)) {
      // Send bulk emails
      result = await sendBulkEmails(to, template);
    } else {
      // Send single email
      result = await sendEmail(to, template, data);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        results: result.results
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const configValid = await verifyEmailConfig();
    
    return NextResponse.json({
      success: configValid,
      message: configValid ? 'Email configuration is valid' : 'Email configuration is invalid'
    });
  } catch (error) {
    console.error('Email config check error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email configuration' },
      { status: 500 }
    );
  }
}



