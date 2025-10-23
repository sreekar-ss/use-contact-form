/**
 * Tests for utility functions
 */

import {
  createTimeoutPromise,
  sleep,
  parseErrorResponse,
  createNetworkError,
  isValidEmail,
  validateContactForm,
  getExponentialBackoff,
} from './utils';

describe('createTimeoutPromise', () => {
  it('should reject after specified timeout', async () => {
    const timeoutMs = 100;
    const timeoutPromise = createTimeoutPromise(timeoutMs);

    await expect(timeoutPromise).rejects.toThrow('Request timeout');
  });

  it('should create Error object', async () => {
    const timeoutMs = 50;
    
    try {
      await createTimeoutPromise(timeoutMs);
    } catch (error) {
      const err = error as Error;
      expect(err.message).toBe('Request timeout');
      expect(err instanceof Error).toBe(true);
    }
  });
});

describe('sleep', () => {
  it('should resolve after specified time', async () => {
    const start = Date.now();
    await sleep(100);
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThanOrEqual(90); // Allow small variance
    expect(duration).toBeLessThan(150);
  });

  it('should work with 0ms', async () => {
    await expect(sleep(0)).resolves.toBeUndefined();
  });
});

describe('parseErrorResponse', () => {
  it('should parse Response object with JSON error', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({ message: 'Invalid data', code: 'INVALID' }),
    } as any;

    const error = await parseErrorResponse(mockResponse);

    expect(error.message).toBe('Invalid data');
    expect(error.status).toBe(400);
    expect(error.code).toBe('INVALID');
  });

  it('should parse Response with text content', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Server Error',
      headers: {
        get: jest.fn().mockReturnValue('text/plain'),
      },
      text: jest.fn().mockResolvedValue('Internal error'),
    } as any;

    const error = await parseErrorResponse(mockResponse);

    expect(error.message).toBe('Internal error');
    expect(error.status).toBe(500);
  });

  it('should fallback on JSON parse error', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Server Error',
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as any;

    const error = await parseErrorResponse(mockResponse);

    expect(error.message).toBe('An error occurred');
    expect(error.status).toBe(500);
  });

  it('should include error code and additional errors', async () => {
    const mockResponse = {
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({ 
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: { name: ['Required'], email: ['Invalid'] }
      }),
    } as any;

    const error = await parseErrorResponse(mockResponse);

    expect(error.message).toBe('Validation failed');
    expect(error.status).toBe(422);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.errors).toEqual({ name: ['Required'], email: ['Invalid'] });
  });

  it('should use status in message when no message provided', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({}),
    } as any;

    const error = await parseErrorResponse(mockResponse);

    expect(error.message).toBe('Request failed with status 404');
    expect(error.status).toBe(404);
  });
});

describe('createNetworkError', () => {
  it('should create network error from Error object', () => {
    const originalError = new Error('Connection refused');
    const error = createNetworkError(originalError);

    expect(error.message).toBe('Connection refused');
    expect(error.code).toBe('NETWORK_ERROR');
  });

  it('should handle Error with empty message', () => {
    const originalError = new Error('');
    const error = createNetworkError(originalError);

    expect(error.message).toBe('Network error occurred');
    expect(error.code).toBe('NETWORK_ERROR');
  });
});

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@example.com')).toBe(true);
    expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
    expect(isValidEmail('user_name@example-site.org')).toBe(true);
    expect(isValidEmail('test123@test123.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user @example.com')).toBe(false);
    expect(isValidEmail('user@example')).toBe(false);
    expect(isValidEmail('user@.com')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('test@localhost')).toBe(false); // No TLD
  });
});

describe('validateContactForm', () => {
  const validData = {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello!',
  };

  it('should validate correct form data', () => {
    const result = validateContactForm(validData);

    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('should validate with optional subject', () => {
    const result = validateContactForm({
      ...validData,
      subject: 'Test Subject',
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('should require name field', () => {
    const result = validateContactForm({
      ...validData,
      name: '',
    });

    expect(result.valid).toBe(false);
    expect(result.errors?.name).toEqual(['Name is required']);
  });

  it('should reject name that is only whitespace', () => {
    const result = validateContactForm({
      ...validData,
      name: '   ',
    });

    expect(result.valid).toBe(false);
    expect(result.errors?.name).toEqual(['Name is required']);
  });

  it('should require email field', () => {
    const result = validateContactForm({
      ...validData,
      email: '',
    });

    expect(result.valid).toBe(false);
    expect(result.errors?.email).toEqual(['Email is required']);
  });

  it('should validate email format', () => {
    const result = validateContactForm({
      ...validData,
      email: 'invalid-email',
    });

    expect(result.valid).toBe(false);
    expect(result.errors?.email).toEqual(['Email is invalid']);
  });

  it('should require message field', () => {
    const result = validateContactForm({
      ...validData,
      message: '',
    });

    expect(result.valid).toBe(false);
    expect(result.errors?.message).toEqual(['Message is required']);
  });

  it('should reject message that is only whitespace', () => {
    const result = validateContactForm({
      ...validData,
      message: '   ',
    });

    expect(result.valid).toBe(false);
    expect(result.errors?.message).toEqual(['Message is required']);
  });

  it('should validate multiple errors at once', () => {
    const result = validateContactForm({
      name: '',
      email: 'bad-email',
      message: '',
    });

    expect(result.valid).toBe(false);
    expect(result.errors?.name).toEqual(['Name is required']);
    expect(result.errors?.email).toEqual(['Email is invalid']);
    expect(result.errors?.message).toEqual(['Message is required']);
  });

  it('should handle whitespace in validation', () => {
    // Whitespace in email makes it invalid per the regex
    const result = validateContactForm({
      name: '  John Doe  ',
      email: '  john@example.com  ', // Has whitespace - invalid
      message: '  Hello!  ',
    });

    expect(result.valid).toBe(false);
    expect(result.errors?.email).toEqual(['Email is invalid']);
  });
});

describe('getExponentialBackoff', () => {
  it('should calculate exponential backoff correctly', () => {
    expect(getExponentialBackoff(0, 1000)).toBe(1000); // 2^0 * 1000 = 1000
    expect(getExponentialBackoff(1, 1000)).toBe(2000); // 2^1 * 1000 = 2000
    expect(getExponentialBackoff(2, 1000)).toBe(4000); // 2^2 * 1000 = 4000
    expect(getExponentialBackoff(3, 1000)).toBe(8000); // 2^3 * 1000 = 8000
  });

  it('should work with different base delays', () => {
    expect(getExponentialBackoff(0, 500)).toBe(500);
    expect(getExponentialBackoff(1, 500)).toBe(1000);
    expect(getExponentialBackoff(2, 500)).toBe(2000);
    expect(getExponentialBackoff(0, 2000)).toBe(2000);
    expect(getExponentialBackoff(1, 2000)).toBe(4000);
  });

  it('should handle negative attempt numbers', () => {
    expect(getExponentialBackoff(-1, 1000)).toBe(500); // 2^-1 * 1000 = 500
  });

  it('should handle large attempt numbers', () => {
    expect(getExponentialBackoff(10, 1000)).toBe(1024000); // 2^10 * 1000
  });
});
