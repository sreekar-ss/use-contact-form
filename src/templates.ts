import type { ContactFormData } from './types';

export type TemplateTheme = 'minimal' | 'branded' | 'dark';

export interface TemplateOptions {
  theme?: TemplateTheme;
  brandColor?: string; // hex or css color
  logoUrl?: string;
  footerText?: string;
}

export function renderTextTemplate(data: ContactFormData): string {
  const { name, email, message, subject, phone } = data as any;
  const lines: string[] = [];
  if (subject) lines.push(`Subject: ${subject}`);
  lines.push(`Name: ${name}`);
  lines.push(`Email: ${email}`);
  if (phone) lines.push(`Phone: ${phone}`);
  lines.push('');
  lines.push('Message:');
  lines.push(String(message ?? ''));
  lines.push('');
  lines.push('—');
  lines.push('Sent via use-contact-form');
  return lines.join('\n');
}

export function renderHtmlTemplate(
  data: ContactFormData,
  options: TemplateOptions = {}
): string {
  const { name, email, message, subject, phone } = data as any;
  const theme = options.theme ?? 'minimal';
  const brand = options.brandColor ?? '#4F46E5';
  const footerText = options.footerText ?? 'Sent via use-contact-form';
  const logo = options.logoUrl
    ? `<div style="text-align:center;margin-bottom:16px;"><img src="${options.logoUrl}" alt="Logo" style="max-height:40px"/></div>`
    : '';

  const baseStyles = {
    minimal: {
      bg: '#ffffff',
      text: '#111827',
      panel: '#f9fafb',
      border: '#e5e7eb',
    },
    branded: {
      bg: '#ffffff',
      text: '#111827',
      panel: '#ffffff',
      border: brand,
    },
    dark: {
      bg: '#0b0f17',
      text: '#e5e7eb',
      panel: '#111827',
      border: '#374151',
    },
  }[theme];

  const field = (label: string, value?: string) =>
    value
      ? `<p style="margin:8px 0;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`
      : '';

  const subjectBlock = subject
    ? `<h2 style="margin:0 0 8px 0;color:${brand};font-weight:600;">${escapeHtml(
        subject
      )}</h2>`
    : `<h2 style="margin:0 0 8px 0;color:${brand};font-weight:600;">New Contact Form Submission</h2>`;

  const messageBlock = `<div style="background:${baseStyles.panel};padding:16px;border-left:4px solid ${brand};white-space:pre-wrap;border-radius:4px;">${escapeHtml(
    String(message ?? '')
  )}</div>`;

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:${baseStyles.bg};color:${baseStyles.text};font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;">
    <div style="max-width:640px;margin:0 auto;">
      ${logo}
      ${subjectBlock}
      <div style="border:1px solid ${baseStyles.border};border-radius:8px;padding:16px;margin-top:12px;background:${theme==='branded'?'#ffffff':baseStyles.panel};">
        ${field('Name', name)}
        ${field('Email', email)}
        ${field('Phone', phone)}
        <div style="margin-top:16px;">
          <h3 style="margin:0 0 8px 0;">Message</h3>
          ${messageBlock}
        </div>
      </div>
      <p style="margin-top:24px;font-size:12px;color:${theme==='dark' ? '#9ca3af' : '#6b7280'};">${escapeHtml(
        footerText
      )}</p>
    </div>
  </body>
</html>`;
}

function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


