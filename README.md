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

