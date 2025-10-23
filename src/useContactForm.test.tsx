/**
 * Tests for useContactForm hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useContactForm } from './useContactForm';
import type { ContactFormData } from './types';

// Mock fetch globally
global.fetch = jest.fn();

describe('useContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
        })
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.success).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeNull();
      expect(typeof result.current.sendEmail).toBe('function');
      expect(typeof result.current.reset).toBe('function');
      expect(typeof result.current.cancel).toBe('function');
    });

    it('should accept custom configuration', () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          timeout: 5000,
          retries: 5,
          retryDelay: 2000,
          onSuccess,
          onError,
        })
      );

      expect(result.current.loading).toBe(false);
    });
  });

  describe('sendEmail - successful submission', () => {
    it('should successfully submit form data', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ 
          success: true, 
          message: 'Email sent!' 
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
        })
      );

      const formData: ContactFormData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello!',
      };

      let submitPromise: Promise<any>;
      act(() => {
        submitPromise = result.current.sendEmail(formData);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await submitPromise!;

      expect(result.current.success).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual({
        success: true,
        message: 'Email sent!',
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should call onSuccess callback', async () => {
      const onSuccess = jest.fn();
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ success: true }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          onSuccess,
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        await result.current.sendEmail(formData);
      });

      expect(onSuccess).toHaveBeenCalledWith({ success: true });
    });

    it('should include subject in submission', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ success: true }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
        subject: 'Test Subject',
      };

      await act(async () => {
        await result.current.sendEmail(formData);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/contact',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      );
    });
  });

  describe('sendEmail - validation', () => {
    it('should reject invalid form data when validator is provided', async () => {
      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          validate: (data: any) => ({
            valid: false,
            errors: { name: ['Name is required'], email: ['Email is invalid'] },
          }),
        })
      );

      const invalidData: ContactFormData = {
        name: '',
        email: 'invalid-email',
        message: 'Test',
      };

      await act(async () => {
        try {
          await result.current.sendEmail(invalidData);
        } catch (error: any) {
          expect(error.code).toBe('VALIDATION_ERROR');
          expect(error.errors).toBeDefined();
          expect(error.errors.name).toEqual(['Name is required']);
          expect(error.errors.email).toEqual(['Email is invalid']);
        }
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.code).toBe('VALIDATION_ERROR');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should call onError callback for validation errors', async () => {
      const onError = jest.fn();

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          onError,
          validate: () => ({
            valid: false,
            errors: { name: ['Required'] },
          }),
        })
      );

      const invalidData: ContactFormData = {
        name: '',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        try {
          await result.current.sendEmail(invalidData);
        } catch (error) {
          // Expected
        }
      });

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0].code).toBe('VALIDATION_ERROR');
    });
  });

  describe('sendEmail - error handling', () => {
    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ 
          message: 'Invalid request' 
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          retries: 0, // No retries for this test
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        try {
          await result.current.sendEmail(formData);
        } catch (error: any) {
          expect(error.message).toBe('Invalid request');
          expect(error.status).toBe(400);
        }
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.success).toBe(false);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          retries: 0,
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        try {
          await result.current.sendEmail(formData);
        } catch (error: any) {
          expect(error.message).toBe('Network error');
          // Error may or may not have code depending on how it's caught
        }
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe('Network error');
    });

    it('should call onError callback for API errors', async () => {
      const onError = jest.fn();
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Server Error',
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ message: 'Server error' }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          retries: 0,
          onError,
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        try {
          await result.current.sendEmail(formData);
        } catch (error) {
          // Expected
        }
      });

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0].status).toBe(500);
    });
  });

  describe('sendEmail - response formats', () => {
    it('should handle text/plain responses', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('text/plain'),
        },
        text: jest.fn().mockResolvedValue('Email sent successfully'),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        const response = await result.current.sendEmail(formData);
        expect(response).toBe('Email sent successfully');
      });

      expect(result.current.success).toBe(true);
      expect(result.current.data).toBe('Email sent successfully');
    });

    it('should handle responses with no content-type', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
        text: jest.fn().mockResolvedValue('OK'),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        await result.current.sendEmail(formData);
      });

      expect(result.current.success).toBe(true);
    });
  });

  describe('sendEmail - retry logic', () => {
    it('should retry on network errors', async () => {
      const mockSuccessResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ success: true }),
      };

      // Fail twice with network errors, then succeed
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network failure'))
        .mockRejectedValueOnce(new Error('Network failure'))
        .mockResolvedValueOnce(mockSuccessResponse);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          retries: 3,
          retryDelay: 10,
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        await result.current.sendEmail(formData);
      });

      // Should have tried 3 times (1 initial + 2 retries)
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(result.current.success).toBe(true);
    });

    it('should retry on 5xx errors', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
        statusText: 'Server Error',
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ message: 'Server error' }),
      };

      const mockSuccessResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ success: true }),
      };

      // Fail twice, then succeed
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          retries: 3,
          retryDelay: 10, // Short delay for testing
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        await result.current.sendEmail(formData);
      });

      // Should have tried 3 times total (1 initial + 2 retries)
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(result.current.success).toBe(true);
    });

    it('should fail after exhausting retries', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Server Error',
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ message: 'Server error' }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          retries: 2,
          retryDelay: 10,
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        try {
          await result.current.sendEmail(formData);
        } catch (error) {
          // Expected
        }
      });

      // Should have tried 3 times (1 initial + 2 retries)
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(result.current.success).toBe(false);
      expect(result.current.error).not.toBeNull();
    });

    it('should not retry on validation errors', async () => {
      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          retries: 3,
          validate: () => ({ valid: false, errors: { name: ['Required'] } }),
        })
      );

      const invalidData: ContactFormData = {
        name: '',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        try {
          await result.current.sendEmail(invalidData);
        } catch (error) {
          // Expected
        }
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should not retry on 4xx client errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ message: 'Invalid' }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          retries: 3,
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        try {
          await result.current.sendEmail(formData);
        } catch (error) {
          // Expected
        }
      });

      // Should only try once (no retries for 4xx)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendEmail - timeout', () => {
    it('should timeout after specified duration', async () => {
      // Mock a fetch that never resolves
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          timeout: 100, // 100ms timeout
          retries: 0,
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        try {
          await result.current.sendEmail(formData);
        } catch (error: any) {
          expect(error.message).toBe('Request timeout');
        }
      });

      expect(result.current.error).not.toBeNull();
    });
  });

  describe('sendEmail - cancellation', () => {
    it('should handle AbortError when request is cancelled', async () => {
      // Create a real AbortController to simulate abort behavior
      const abortError = new Error('The operation was aborted') as any;
      abortError.name = 'AbortError';

      (global.fetch as jest.Mock).mockRejectedValue(abortError);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          retries: 0,
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        try {
          await result.current.sendEmail(formData);
        } catch (error: any) {
          expect(error.message).toBe('Request cancelled');
          expect(error.code).toBe('NETWORK_ERROR');
        }
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe('Request cancelled');
    });

    it('should cancel ongoing request', async () => {
      // Mock a slow fetch
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      let submitPromise: Promise<any>;
      act(() => {
        submitPromise = result.current.sendEmail(formData);
      });

      // Cancel immediately
      act(() => {
        result.current.cancel();
      });

      try {
        await submitPromise!;
      } catch (error) {
        // Expected to throw
      }

      // Wait for state to settle
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should not throw if cancel is called when not loading', () => {
      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
        })
      );

      expect(() => {
        act(() => {
          result.current.cancel();
        });
      }).not.toThrow();
    });
  });

  describe('reset', () => {
    it('should reset state to initial values', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ success: true }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      // Submit form
      await act(async () => {
        await result.current.sendEmail(formData);
      });

      expect(result.current.success).toBe(true);
      expect(result.current.data).not.toBeNull();

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.success).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle non-Error objects thrown from fetch', async () => {
      // Simulate throwing a non-Error object
      (global.fetch as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          retries: 0,
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        try {
          await result.current.sendEmail(formData);
        } catch (error: any) {
          expect(error.code).toBe('NETWORK_ERROR');
        }
      });

      expect(result.current.error).not.toBeNull();
    });

    it('should handle Error objects without message', async () => {
      const emptyError = new Error('');

      (global.fetch as jest.Mock).mockRejectedValue(emptyError);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
          retries: 0,
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      await act(async () => {
        try {
          await result.current.sendEmail(formData);
        } catch (error: any) {
          expect(error.code).toBe('NETWORK_ERROR');
        }
      });

      expect(result.current.error).not.toBeNull();
    });

    it('should handle multiple concurrent submissions', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ success: true }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useContactForm({
          endpoint: 'https://api.example.com/contact',
        })
      );

      const formData: ContactFormData = {
        name: 'John',
        email: 'john@example.com',
        message: 'Hi',
      };

      // Start two submissions
      const promise1 = act(() => result.current.sendEmail(formData));
      const promise2 = act(() => result.current.sendEmail(formData));

      await Promise.all([promise1, promise2]);

      // Should have made 2 API calls
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
