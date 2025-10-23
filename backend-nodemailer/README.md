# Contact Form Backend - Nodemailer

This is a complete Next.js backend for handling contact form submissions using **Nodemailer** (free, no API limits!).

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript support
- ✅ **Nodemailer** - Completely FREE
- ✅ Works with Gmail, Outlook, or any SMTP server
- ✅ Form validation
- ✅ Beautiful UI with Tailwind CSS
- ✅ No rate limits (except Gmail's 500/day)
- ✅ Error handling
- ✅ API endpoint at `/api/contact`
- ✅ Contact form page at `/contact`

## Why Nodemailer?

✅ **Completely Free** - No paid API keys needed  
✅ **No Rate Limits** - Only limited by your SMTP provider  
✅ **Privacy** - Emails don't go through third-party services  
✅ **Flexibility** - Works with any SMTP server  
✅ **No Vendor Lock-in** - You control everything  

⚠️ **Trade-offs:**
- Gmail limit: 500 emails/day (2,000 with Google Workspace)
- Slightly lower deliverability than paid services
- Requires Gmail App Password setup

## Quick Setup (Gmail - 5 minutes)

### Step 1: Enable Gmail App Passwords

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Factor Authentication** (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Create new app password, name it "Contact Form"
5. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop    # Your 16-char app password

EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Contact Form
EMAIL_TO=your-email@gmail.com
```

### Step 4: Run the Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

🎉 **Done!** Visit [http://localhost:3001/contact](http://localhost:3001/contact) to test the form.

## Alternative SMTP Providers

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

### Google Workspace (Higher Limits)

Same as Gmail setup, but you get **2,000 emails/day** instead of 500.

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
    "messageId": "<unique-message-id>"
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

### GET `/api/contact`

Get API information and check if SMTP is configured.

## Testing

### Test the API with curl:

```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Test message from curl"
  }'
```

### Using the React Hook:

```tsx
import { useContactForm } from 'use-contact-form';

function MyContactForm() {
  const { sendEmail, loading, error, success } = useContactForm({
    endpoint: 'http://localhost:3001/api/contact',
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
backend-nodemailer/
├── app/
│   ├── api/
│   │   └── contact/
│   │       └── route.ts          # API with Nodemailer
│   ├── contact/
│   │   └── page.tsx              # Contact form page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Homepage with setup guide
├── .env                          # Your config (create this)
├── .env.example                  # Example configuration
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Troubleshooting

### "Email authentication failed"

- **Problem:** Wrong Gmail password or app password not created
- **Solution:** 
  1. Enable 2FA in Google Account
  2. Create App Password at https://myaccount.google.com/apppasswords
  3. Use the 16-character app password (not your regular password)

### "Could not connect to email server"

- **Problem:** Wrong SMTP host or port
- **Solution:** 
  - Gmail: `smtp.gmail.com:587`
  - Outlook: `smtp-mail.outlook.com:587`
  - Check your provider's SMTP settings

### Emails going to spam

- **Problem:** Gmail/personal email has lower sender reputation
- **Solution:**
  - Use a custom domain with proper SPF/DKIM records
  - Or switch to Resend/SendGrid for better deliverability

### Gmail says "Less secure app access"

- **Problem:** You're trying to use regular password
- **Solution:** Use App Passwords instead (requires 2FA)

## Gmail Limits

| Account Type | Daily Limit |
|--------------|-------------|
| Personal Gmail | 500 emails/day |
| Google Workspace | 2,000 emails/day |

**Tip:** For high-volume needs (>500/day), consider upgrading to Google Workspace or using a paid service like Resend.

## Deployment

### Vercel

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `EMAIL_FROM`
   - `EMAIL_FROM_NAME`
   - `EMAIL_TO`
4. Deploy!

### Other Platforms

Works on any platform that supports Next.js:
- Vercel (recommended)
- Netlify
- AWS (Amplify, EC2)
- DigitalOcean
- Railway
- Render

## Security Best Practices

1. ✅ **Never commit `.env`** - It's in `.gitignore`
2. ✅ **Use App Passwords** - Never regular Gmail password
3. ✅ **Enable 2FA** - Required for app passwords
4. ✅ **Validate inputs** - Already implemented
5. ⚠️ **Add rate limiting** - Prevent abuse in production
6. ⚠️ **Add CAPTCHA** - For public forms (reCAPTCHA)

## Comparison: Nodemailer vs Resend

| Feature | Nodemailer | Resend |
|---------|-----------|--------|
| Cost | **FREE** | 3,000 free/month |
| Setup Time | 5-10 min | 2 min |
| Deliverability | Good ⭐⭐⭐ | Excellent ⭐⭐⭐⭐⭐ |
| Gmail Limit | 500/day | N/A |
| Analytics | ❌ | ✅ |
| Spam Risk | Medium | Low |
| Privacy | Excellent | Good |
| Best For | Personal/low-volume | Production/business |

## Support

- **Nodemailer Docs:** https://nodemailer.com/
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **Next.js Docs:** https://nextjs.org/docs
- **use-contact-form:** https://github.com/yourusername/use-contact-form

## License

MIT

