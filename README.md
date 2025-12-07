# use-contact-form

A lightweight, TypeScript-first React hook for handling contact form submissions with your own backend server.

**💡 You control the backend, we handle the frontend complexity.**

[![npm version](https://badge.fury.io/js/use-contact-form.svg)](https://www.npmjs.com/package/use-contact-form)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🚀 **[Live Demo](https://use-contact-form.vercel.app)** | 📚 **[Full Documentation](https://github.com/sreekar-ss/use-contact-form)**

## Why use-contact-form?

This hook doesn't send emails directly. Instead, it provides a robust interface for **submitting to YOUR backend**, where YOU control the email service (Resend, SendGrid, Nodemailer, etc.), keep API keys secure, and add spam protection.

Think of it as **React Query for contact forms** - it handles states, retries, errors, and cancellation while you focus on your API.

## Features

✅ **TypeScript Support** - Fully typed with generics for your data structures  
✅ **Service Agnostic** - Works with any backend (Next.js, Express, serverless)  
✅ **Retry Logic** - Configurable retry with exponential backoff  
✅ **Request Cancellation** - Cancel pending requests with AbortController  
✅ **Built-in Validation** - Optional client-side validation helpers  
✅ **Loading States** - Track loading, error, success states  
✅ **Lightweight** - Zero dependencies (except React)  
✅ **Flexible** - Customizable headers, timeout, transformers

## Installation

```bash
# npm
npm install use-contact-form

# yarn
yarn add use-contact-form

# pnpm
pnpm add use-contact-form
```

## Quick Start

> **Note:** You need a backend endpoint to send emails. See [Backend Examples](#backend-examples) below.

### Frontend (React)

```tsx
import { useContactForm } from 'use-contact-form';

function ContactForm() {
  const { sendEmail, loading, error, success } = useContactForm({
    endpoint: '/api/contact',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendEmail({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello!',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
      {error && <p>Error: {error.message}</p>}
      {success && <p>Message sent successfully!</p>}
    </form>
  );
}
```

### Backend (Next.js Example)

```typescript
// app/api/contact/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { name, email, message } = await req.json();
  
  // Your validation, spam protection, etc.
  
  // Send email using your preferred service
  // (Resend, SendGrid, Nodemailer, etc.)
  
  return NextResponse.json({ success: true });
}
```

## API Reference

### `useContactForm(options)`

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `endpoint` | `string` | **required** | API endpoint to send data to |
| `method` | `'POST' \| 'PUT' \| 'PATCH'` | `'POST'` | HTTP method |
| `headers` | `Record<string, string>` | `{}` | Custom headers |
| `timeout` | `number` | `10000` | Request timeout in milliseconds |
| `retries` | `number` | `0` | Number of retry attempts |
| `retryDelay` | `number` | `1000` | Base delay between retries (ms) |
| `onSuccess` | `(data) => void` | `undefined` | Success callback |
| `onError` | `(error) => void` | `undefined` | Error callback |
| `transformData` | `(data) => any` | `undefined` | Transform data before sending |
| `validate` | `(data) => ValidationResult` | `undefined` | Client-side validation |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `sendEmail` | `(data) => Promise<TResponse>` | Function to send form data |
| `loading` | `boolean` | Whether request is in progress |
| `error` | `ContactFormError \| null` | Error object if failed |
| `data` | `TResponse \| null` | Response data from server |
| `success` | `boolean` | Whether submission succeeded |
| `reset` | `() => void` | Reset state (error, data, success) |
| `cancel` | `() => void` | Cancel current request |

## Advanced Usage

### Email Templates (HTML/Text)

You can use built-in email templates to render consistent emails on your backend.

```ts
import { renderHtmlTemplate, renderTextTemplate } from 'use-contact-form';

// Inside your backend route/handler
const html = renderHtmlTemplate({
  name: 'John',
  email: 'john@example.com',
  message: 'Hello there!',
  subject: 'Contact from website',
});

const text = renderTextTemplate({
  name: 'John',
  email: 'john@example.com',
  message: 'Hello there!',
});

// Send via your email service
// e.g. Resend/Nodemailer body: { html, text }
```

Options:

```ts
const html = renderHtmlTemplate(data, {
  theme: 'minimal' | 'branded' | 'dark',
  brandColor: '#4F46E5',
  logoUrl: 'https://your.cdn/logo.svg',
  footerText: 'Sent from my website',
});
```

All user content is HTML-escaped by default.

### With TypeScript

```typescript
import { useContactForm, ContactFormData, ContactFormResponse } from 'use-contact-form';

interface MyFormData extends ContactFormData {
  phone?: string;
  company?: string;
}

interface MyResponse extends ContactFormResponse {
  ticketId: string;
}

const { sendEmail, loading } = useContactForm<MyFormData, MyResponse>({
  endpoint: '/api/contact',
  onSuccess: (data) => {
    console.log('Ticket created:', data.ticketId);
  },
});
```

### With Validation

```typescript
import { useContactForm, validateContactForm } from 'use-contact-form';

const { sendEmail } = useContactForm({
  endpoint: '/api/contact',
  validate: validateContactForm, // Built-in validator
  // Or use custom validation:
  validate: (data) => {
    const errors: Record<string, string[]> = {};
    if (data.name.length < 2) {
      errors.name = ['Name must be at least 2 characters'];
    }
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },
});
```

### With Retry Logic

```typescript
const { sendEmail } = useContactForm({
  endpoint: '/api/contact',
  retries: 3, // Retry 3 times
  retryDelay: 1000, // Start with 1s delay (exponential backoff)
  timeout: 15000, // 15 second timeout
});
```

### With Custom Headers

```typescript
const { sendEmail } = useContactForm({
  endpoint: 'https://api.example.com/contact',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-API-Key': 'your-api-key',
  },
});
```

### With Data Transformation

```typescript
const { sendEmail } = useContactForm({
  endpoint: '/api/contact',
  transformData: (data) => ({
    ...data,
    timestamp: new Date().toISOString(),
    source: 'website',
  }),
});
```

### With Request Cancellation

```typescript
const { sendEmail, cancel, loading } = useContactForm({
  endpoint: '/api/contact',
});

// Cancel if user navigates away
useEffect(() => {
  return () => {
    if (loading) cancel();
  };
}, [loading, cancel]);
```

## Backend Setup (Step-by-step)

### Option A: Next.js + Resend (recommended)

1) Install dependencies

```bash
npm install resend
```

2) Create API route `app/api/contact/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// CORS (allow all; restrict in production if needed)
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: cors });
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, subject } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400, headers: cors }
      );
    }

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Contact Form <onboarding@resend.dev>',
      to: process.env.EMAIL_TO || 'delivered@resend.dev',
      reply_to: email,
      subject: subject || `Contact from ${name}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`
    });

    return NextResponse.json({ success: true, data }, { headers: cors });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500, headers: cors });
  }
}
```

3) Set environment variables

```bash
# .env
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM="Contact Form <onboarding@resend.dev>"
EMAIL_TO=you@example.com
```

4) Test locally

```bash
curl -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"John","email":"john@example.com","message":"Hello"}'
```

5) Deploy to Vercel (detailed)

   1. Push your project to GitHub (or GitLab/Bitbucket)
   2. Go to Vercel and click "New Project" → import your repo
   3. Framework Preset: Next.js (auto-detected)
   4. Environment Variables (add exactly as in your .env):
      - `RESEND_API_KEY`
      - `EMAIL_FROM` (e.g. `Contact Form <onboarding@resend.dev>` or your verified domain)
      - `EMAIL_TO` (where you want to receive messages)
   5. Click "Deploy"
   6. After deploy, verify endpoint works:

   ```bash
   curl -X POST https://<your-vercel-app>.vercel.app/api/contact \
     -H 'Content-Type: application/json' \
     -d '{"name":"John","email":"john@example.com","message":"Hello"}'
   ```

   7. In your frontend, set the hook endpoint to the deployed API URL:

   ```tsx
   const { sendEmail } = useContactForm({
     endpoint: 'https://<your-vercel-app>.vercel.app/api/contact',
   });
   ```

   Notes for Resend:
   - Free testing may only allow sending to your account email until you verify a domain.
   - To send to arbitrary recipients, verify a domain at Resend and use a `from` address on that domain.

—

### Option B: Next.js + Nodemailer (SMTP/Gmail)

1) Install dependencies

```bash
npm install nodemailer
```

2) Create API route `app/api/contact/route.ts` (SMTP)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function OPTIONS() { return NextResponse.json({}, { headers: cors }); }

export async function POST(req: NextRequest) {
  const { name, email, message, subject } = await req.json();
  if (!name || !email || !message) return NextResponse.json({ success: false }, { status: 400, headers: cors });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: process.env.EMAIL_TO || process.env.SMTP_USER,
    replyTo: email,
    subject: subject || `Contact from ${name}`,
    text: message,
  });

  return NextResponse.json({ success: true, id: info.messageId }, { headers: cors });
}
```

3) Environment variables

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password   # Use Gmail App Passwords
EMAIL_FROM=your@gmail.com
EMAIL_TO=your@gmail.com
```

—

### Option C: Express + Nodemailer

```bash
npm install express nodemailer cors
```

```javascript
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message, subject } = req.body;
  if (!name || !email || !message) return res.status(400).json({ success: false });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    replyTo: email,
    subject: subject || `Contact from ${name}`,
    text: message,
  });

  res.json({ success: true });
});

app.listen(3000);
```

—

### CORS notes

- Local testing (file:// or different ports) requires CORS. The examples above include permissive `*` headers.
- For production, restrict origins to your domain(s).

—

### Vercel troubleshooting

- 400 "Missing required fields": ensure `name`, `email`, and `message` are in the POST body
- 500 with Resend: confirm `RESEND_API_KEY`, `EMAIL_FROM`, and `EMAIL_TO` are set in Vercel Project → Settings → Environment Variables
- Resend 403 "testing emails only": verify a domain in Resend and update `EMAIL_FROM` to use that domain
- CORS error from browser: confirm your route includes an `OPTIONS` handler and returns `Access-Control-Allow-*` headers on all responses
- Receiving but wrong inbox: check `EMAIL_TO` in Vercel env

—

## Backend Examples

### Next.js with Resend

```typescript
// app/api/contact/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  await resend.emails.send({
    from: 'Contact Form <onboarding@resend.dev>',
    to: 'your-email@example.com',
    replyTo: email,
    subject: `Contact from ${name}`,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
  });

  return Response.json({ success: true });
}
```

### Express with Nodemailer

```javascript
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    replyTo: email,
    subject: `Contact from ${name}`,
    text: message,
  });

  res.json({ success: true });
});

app.listen(3000);
```

### AWS Lambda with SES

```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: 'us-east-1' });

export const handler = async (event) => {
  const { name, email, message } = JSON.parse(event.body);

  await ses.send(new SendEmailCommand({
    Source: 'noreply@example.com',
    Destination: { ToAddresses: ['admin@example.com'] },
    Message: {
      Subject: { Data: `Contact from ${name}` },
      Body: { Text: { Data: message } },
    },
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};
```

## Security Best Practices

1. **Never expose API keys in frontend code** - Always use a backend server
2. **Validate on the server** - Client-side validation is for UX, not security
3. **Rate limit your API** - Prevent spam and abuse
4. **Use CAPTCHA** - For public forms, consider adding reCAPTCHA or similar
5. **Sanitize inputs** - Always sanitize before sending emails
6. **Use CORS properly** - Restrict which domains can call your API

## Error Handling

The hook returns detailed error information:

```typescript
interface ContactFormError {
  message: string;        // Human-readable error message
  code?: string;          // Error code (e.g., 'VALIDATION_ERROR')
  status?: number;        // HTTP status code
  errors?: Record<string, string[]>; // Field-specific errors
}
```

Example usage:

```tsx
{error && (
  <div>
    <p>{error.message}</p>
    {error.errors && Object.entries(error.errors).map(([field, messages]) => (
      <p key={field}>{field}: {messages.join(', ')}</p>
    ))}
  </div>
)}
```

## Testing

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useContactForm } from 'use-contact-form';

test('sends email successfully', async () => {
  const { result } = renderHook(() =>
    useContactForm({ endpoint: '/api/contact' })
  );

  await act(async () => {
    await result.current.sendEmail({
      name: 'Test',
      email: 'test@example.com',
      message: 'Hello',
    });
  });

  expect(result.current.success).toBe(true);
});
```

## Complete Examples

Check out the repository for full working examples:

- **[Next.js + Resend](https://github.com/sreekar-ss/use-contact-form/tree/main/backend)** - Modern Next.js 14 app with Resend (deployed at [use-contact-form.vercel.app](https://use-contact-form.vercel.app))
- **[Next.js + Nodemailer](https://github.com/sreekar-ss/use-contact-form/tree/main/backend-nodemailer)** - Next.js with Gmail/SMTP
- **[Express Example](https://github.com/sreekar-ss/use-contact-form/tree/main/examples/express-nodemailer)** - Traditional Express server

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## FAQ

**Q: Does this package send emails directly?**  
A: No. You implement your own backend API, which gives you full control over email services, API keys, and security.

**Q: Which email services are supported?**  
A: Any! Resend, SendGrid, Nodemailer, AWS SES, Mailgun - use whatever you prefer on your backend.

**Q: Can I use this with React Server Components?**  
A: This is a client-side hook (uses `useState`). For RSC, use Server Actions or API routes as your backend.

## License

MIT © Sreekar Siddula

## Support

- 📝 [Documentation](https://github.com/sreekar-ss/use-contact-form)
- 🐛 [Issue Tracker](https://github.com/sreekar-ss/use-contact-form/issues)
- 💬 [Discussions](https://github.com/sreekar-ss/use-contact-form/discussions)

---

**Made with ❤️ by [Sreekar Siddula](https://github.com/sreekar-ss)**

