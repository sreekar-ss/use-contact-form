import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
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
        { status: 400, headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        {
          success: false,
          message: 'Email service is not configured',
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Prepare email content
    const emailSubject = subject || `Contact Form Submission from ${name}`;
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    const toEmail = process.env.EMAIL_TO || 'delivered@resend.dev';

    // Construct HTML email body
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
        </div>
        <div style="margin: 20px 0;">
          <h3 style="color: #333;">Message:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This email was sent from your contact form.
        </p>
      </div>
    `;

    // Send email using Resend
    const data = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: emailSubject,
      html: htmlBody,
    });

    console.log('Email sent successfully:', data);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Email sent successfully!',
        data: {
          id: data.id,
        }
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('Error sending email:', error);

    // Handle specific Resend errors
    if (error.statusCode === 403) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email service authentication failed',
        },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send email. Please try again later.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle GET requests to provide API information
export async function GET() {
  return NextResponse.json(
    {
      message: 'Contact Form API Endpoint',
      method: 'POST',
      endpoint: '/api/contact',
      requiredFields: ['name', 'email', 'message'],
      optionalFields: ['subject', 'phone'],
      example: {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, this is a test message!',
        subject: 'Test Subject',
        phone: '+1234567890'
      }
    },
    { status: 200, headers: corsHeaders }
  );
}

