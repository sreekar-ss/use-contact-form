# Contact Form Backend - Next.js

This is a complete Next.js backend for handling contact form submissions using the `use-contact-form` npm package.

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript support
- ✅ Resend email integration
- ✅ Form validation
- ✅ Beautiful UI with Tailwind CSS
- ✅ Error handling
- ✅ API endpoint at `/api/contact`
- ✅ Contact form page at `/contact`

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and add your configuration:

```env
RESEND_API_KEY=re_your_actual_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_TO=your-email@example.com
```

### 3. Get Resend API Key

1. Sign up at [https://resend.com](https://resend.com)
2. Go to [API Keys](https://resend.com/api-keys)
3. Create a new API key
4. Add it to your `.env` file

### 4. Configure Email Addresses

- **EMAIL_FROM**: Must be a verified domain in Resend (or use `onboarding@resend.dev` for testing)
- **EMAIL_TO**: Where you want to receive the contact form submissions

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the homepage.

- Contact form: [http://localhost:3000/contact](http://localhost:3000/contact)
- API endpoint info: [http://localhost:3000/api/contact](http://localhost:3000/api/contact)

## API Endpoint

### POST `/api/contact`

Send a contact form submission.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, this is a test message!",
  "subject": "Test Subject (optional)",
  "phone": "+1234567890 (optional)"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Email sent successfully!",
  "data": {
    "id": "email_id_from_resend"
  }
}
```

**Error Response (400/500):**

```json
{
  "success": false,
  "message": "Error message here",
  "errors": {
    "field": ["Error details"]
  }
}
```

## Testing the API

### Using curl:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Test message",
    "subject": "Test Subject"
  }'
```

### Using the React Hook:

```tsx
import { useContactForm } from 'use-contact-form';

function MyContactForm() {
  const { sendEmail, loading, error, success } = useContactForm({
    endpoint: 'http://localhost:3000/api/contact',
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
      {success && <p>Success!</p>}
    </form>
  );
}
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── contact/
│   │       └── route.ts          # API endpoint handler
│   ├── contact/
│   │   └── page.tsx              # Contact form page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── .env                          # Environment variables (create this)
├── .env.example                  # Example env file
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.js             # PostCSS config
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import to Vercel: [https://vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

This Next.js app can be deployed to:
- Vercel
- Netlify
- AWS (Amplify, EC2, etc.)
- DigitalOcean
- Any Node.js hosting

Make sure to set the environment variables on your hosting platform.

## Security Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Validate all inputs** - Already implemented in the API route
3. **Add rate limiting** - Consider adding rate limiting for production
4. **Add CAPTCHA** - For production, add reCAPTCHA or similar
5. **Use CORS** - Configure CORS if your frontend is on a different domain

## Email Service Alternatives

Don't want to use Resend? You can easily swap it out:

### SendGrid

```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
await sgMail.send({ ... });
```

### Nodemailer

```typescript
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({ ... });
await transporter.sendMail({ ... });
```

### AWS SES

```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
const ses = new SESClient({ region: 'us-east-1' });
await ses.send(new SendEmailCommand({ ... }));
```

## Support

For issues with:
- **use-contact-form package**: [GitHub Issues](https://github.com/yourusername/use-contact-form/issues)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)
- **Resend**: [Resend Documentation](https://resend.com/docs)

## License

MIT

