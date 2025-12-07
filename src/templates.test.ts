import { renderHtmlTemplate, renderTextTemplate } from './templates';

describe('templates', () => {
  const data = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'Hello there!',
    subject: 'Support request',
  };

  it('renders text template with fields', () => {
    const out = renderTextTemplate(data as any);
    expect(out).toContain('Jane Doe');
    expect(out).toContain('jane@example.com');
    expect(out).toContain('Support request');
    expect(out).toContain('Hello there!');
  });

  it('renders minimal html template by default', () => {
    const html = renderHtmlTemplate(data as any);
    expect(html).toContain('<html>');
    expect(html).toContain('Support request');
    expect(html).toContain('Jane Doe');
  });

  it('renders dark theme with different colors', () => {
    const html = renderHtmlTemplate(data as any, { theme: 'dark' });
    expect(html).toContain('#0b0f17'); // background
  });

  it('renders branded theme using custom brand color', () => {
    const html = renderHtmlTemplate(data as any, { theme: 'branded', brandColor: '#FF5733' });
    expect(html).toContain('#FF5733');
  });

  it('falls back to default subject when not provided', () => {
    const html = renderHtmlTemplate({
      name: 'No Subject',
      email: 'ns@example.com',
      message: 'Hi',
    } as any);
    expect(html).toContain('New Contact Form Submission');
  });

  it('includes logo and custom footer when provided', () => {
    const html = renderHtmlTemplate(data as any, {
      logoUrl: 'https://cdn.test/logo.svg',
      footerText: 'Custom footer',
    });
    expect(html).toContain('logo.svg');
    expect(html).toContain('Custom footer');
  });

  it('conditionally includes phone field only when present', () => {
    const withPhone = renderHtmlTemplate({
      ...data,
      phone: '+1 999 888 7777',
    } as any);
    const withoutPhone = renderHtmlTemplate(data as any);
    expect(withPhone).toContain('+1 999 888 7777');
    expect(withoutPhone).not.toContain('+1 999 888 7777');
  });
  it('escapes HTML in user fields', () => {
    const html = renderHtmlTemplate({
      name: '<b>Alice</b>' as any,
      email: 'a@example.com',
      message: '<script>alert(1)</script>' as any,
    } as any);
    expect(html).toContain('&lt;b&gt;Alice&lt;/b&gt;');
    expect(html).not.toContain('<script>');
  });
});


