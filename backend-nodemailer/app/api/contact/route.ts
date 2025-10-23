import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  // Check if environment variables are set
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('SMTP configuration is missing in environment variables');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('Nodemailer transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('Error creating nodemailer transporter:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { name, email, message, subject, phone } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          errors: {
            ...((!name && { name: ['Name is required'] })),
            ...((!email && { email: ['Email is required'] })),
            ...((!message && { message: ['Message is required'] })),
          }
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
          errors: {
            email: ['Please provide a valid email address']
          }
        },
        { status: 400 }
      );
    }

    // Get transporter
    const transport = getTransporter();
    if (!transport) {
      console.error('SMTP is not configured properly');
      return NextResponse.json(
        {
          success: false,
          message: 'Email service is not configured. Please check server logs.',
        },
        { status: 500 }
      );
    }

    // Prepare email content
    const emailSubject = subject || `Contact Form Submission from ${name}`;
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;
    const toEmail = process.env.EMAIL_TO || process.env.SMTP_USER;
    const fromName = process.env.EMAIL_FROM_NAME || 'Contact Form';

    // Construct HTML email body
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p style="margin: 10px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
          ${subject ? `<p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>` : ''}
        </div>
        <div style="margin: 20px 0;">
          <h3 style="color: #333;">Message:</h3>
          <div style="background-color: white; padding: 15px; border-left: 4px solid #4F46E5; white-space: pre-wrap;">
${message}
          </div>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This email was sent from your contact form via Nodemailer.
        </p>
      </div>
    `;

    // Plain text version
    const textBody = `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${subject ? `Subject: ${subject}` : ''}

Message:
${message}

---
This email was sent from your contact form via Nodemailer.
    `;

    // Send email
    const info = await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: emailSubject,
      text: textBody,
      html: htmlBody,
    });

    console.log('Email sent successfully:', info.messageId);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Email sent successfully!',
        data: {
          messageId: info.messageId,
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error sending email:', error);

    // Handle specific Nodemailer errors
    if (error.code === 'EAUTH') {
      return NextResponse.json(
        {
          success: false,
          message: 'Email authentication failed. Check your SMTP credentials.',
        },
        { status: 500 }
      );
    }

    if (error.code === 'ECONNECTION') {
      return NextResponse.json(
        {
          success: false,
          message: 'Could not connect to email server. Check your SMTP settings.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send email. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle GET requests to provide API information
export async function GET() {
  return NextResponse.json(
    {
      message: 'Contact Form API Endpoint (Nodemailer)',
      method: 'POST',
      endpoint: '/api/contact',
      emailService: 'Nodemailer + SMTP',
      requiredFields: ['name', 'email', 'message'],
      optionalFields: ['subject', 'phone'],
      example: {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, this is a test message!',
        subject: 'Test Subject',
        phone: '+1234567890'
      },
      smtpConfigured: !!(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
      ),
    },
    { status: 200 }
  );
}

