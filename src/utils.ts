import { ContactFormError, ValidationResult } from './types';

/**
 * Create a timeout promise for fetch requests
 */
export function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timeout'));
    }, ms);
  });
}

/**
 * Sleep utility for retry delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse error response and create ContactFormError
 */
export async function parseErrorResponse(
  response: Response
): Promise<ContactFormError> {
  let errorData: any;

  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      errorData = await response.json();
    } else {
      errorData = { message: await response.text() };
    }
  } catch {
    errorData = { message: 'An error occurred' };
  }

  return {
    message: errorData.message || `Request failed with status ${response.status}`,
    code: errorData.code,
    status: response.status,
    errors: errorData.errors,
  };
}

/**
 * Handle network or other errors
 */
export function createNetworkError(error: Error): ContactFormError {
  return {
    message: error.message || 'Network error occurred',
    code: 'NETWORK_ERROR',
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Basic validation for common contact form fields
 */
export function validateContactForm(data: {
  name?: string;
  email?: string;
  message?: string;
  [key: string]: any;
}): ValidationResult {
  const errors: Record<string, string[]> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = ['Name is required'];
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.email = ['Email is required'];
  } else if (!isValidEmail(data.email)) {
    errors.email = ['Email is invalid'];
  }

  if (!data.message || data.message.trim().length === 0) {
    errors.message = ['Message is required'];
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

/**
 * Calculate exponential backoff delay
 */
export function getExponentialBackoff(attempt: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, attempt);
}

