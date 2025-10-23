import React, { useState } from 'react';
import { useContactForm, ContactFormData, validateContactForm } from 'use-contact-form';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });

  const { sendEmail, loading, error, success, reset } = useContactForm<
    ContactFormData,
    { success: boolean; message: string }
  >({
    endpoint: 'https://your-backend.com/api/contact',
    validate: validateContactForm, // Built-in validation
    timeout: 15000, // 15 seconds
    retries: 2, // Retry twice on failure
    retryDelay: 1000, // 1 second between retries
    onSuccess: (data) => {
      console.log('Success:', data);
      // Reset form
      setFormData({ name: '', email: '', message: '' });
      // Clear success message after 5 seconds
      setTimeout(reset, 5000);
    },
    onError: (error) => {
      console.error('Error:', error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await sendEmail(formData);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Contact Us</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="message" style={{ display: 'block', marginBottom: '5px' }}>
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            disabled={loading}
            rows={5}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
            }}
          >
            <p style={{ margin: 0, color: '#c00' }}>{error.message}</p>
            {error.errors && (
              <ul style={{ margin: '5px 0 0 20px', color: '#c00' }}>
                {Object.entries(error.errors).map(([field, messages]) => (
                  <li key={field}>
                    {field}: {messages.join(', ')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#efe',
              border: '1px solid #cfc',
              borderRadius: '4px',
            }}
          >
            <p style={{ margin: 0, color: '#060' }}>
              Thank you! Your message has been sent successfully.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;

