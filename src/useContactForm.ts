import { useState, useRef, useCallback } from 'react';
import {
  UseContactFormOptions,
  UseContactFormReturn,
  ContactFormState,
  ContactFormError,
} from './types';
import {
  createTimeoutPromise,
  sleep,
  parseErrorResponse,
  createNetworkError,
  getExponentialBackoff,
} from './utils';

/**
 * React hook for handling contact form submissions
 * 
 * @template TData - The type of data being sent
 * @template TResponse - The type of response expected from the backend
 * 
 * @example
 * ```tsx
 * const { sendEmail, loading, error, success } = useContactForm({
 *   endpoint: '/api/contact',
 *   onSuccess: () => console.log('Email sent!'),
 * });
 * 
 * await sendEmail({ name: 'John', email: 'john@example.com', message: 'Hello!' });
 * ```
 */
export function useContactForm<TData = any, TResponse = any>(
  options: UseContactFormOptions<TData, TResponse>
): UseContactFormReturn<TData, TResponse> {
  const {
    endpoint,
    method = 'POST',
    headers = {},
    timeout = 10000,
    retries = 0,
    retryDelay = 1000,
    onSuccess,
    onError,
    transformData,
    validate,
  } = options;

  const [state, setState] = useState<ContactFormState<TResponse>>({
    loading: false,
    error: null,
    data: null,
    success: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Reset the form state
   */
  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      data: null,
      success: false,
    });
  }, []);

  /**
   * Cancel the current request
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Make the API request with retry logic
   */
  const makeRequest = useCallback(
    async (data: any, attempt: number = 0): Promise<TResponse> => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await Promise.race([
          fetch(endpoint, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            body: JSON.stringify(data),
            signal: controller.signal,
          }),
          createTimeoutPromise(timeout),
        ]) as Response;

        if (!response.ok) {
          const error = await parseErrorResponse(response);
          
          // Retry on 5xx errors if retries are configured
          if (response.status >= 500 && attempt < retries) {
            const delay = getExponentialBackoff(attempt, retryDelay);
            await sleep(delay);
            return makeRequest(data, attempt + 1);
          }
          
          throw error;
        }

        const contentType = response.headers.get('content-type');
        let responseData: TResponse;

        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = (await response.text()) as any;
        }

        return responseData;
      } catch (error: any) {
        // Don't retry if request was aborted
        if (error.name === 'AbortError') {
          throw createNetworkError(new Error('Request cancelled'));
        }

        // Retry on network errors if retries are configured
        if (attempt < retries && !error.status) {
          const delay = getExponentialBackoff(attempt, retryDelay);
          await sleep(delay);
          return makeRequest(data, attempt + 1);
        }

        // If it's already a ContactFormError, throw it
        if (error.message && typeof error === 'object') {
          throw error;
        }

        throw createNetworkError(error);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [endpoint, method, headers, timeout, retries, retryDelay]
  );

  /**
   * Send the contact form data
   */
  const sendEmail = useCallback(
    async (data: TData): Promise<TResponse> => {
      // Validate if validator is provided
      if (validate) {
        const validationResult = validate(data);
        if (!validationResult.valid) {
          const error: ContactFormError = {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            errors: validationResult.errors,
          };
          setState({
            loading: false,
            error,
            data: null,
            success: false,
          });
          onError?.(error);
          throw error;
        }
      }

      // Transform data if transformer is provided
      const transformedData = transformData ? transformData(data) : data;

      setState({
        loading: true,
        error: null,
        data: null,
        success: false,
      });

      try {
        const responseData = await makeRequest(transformedData);

        setState({
          loading: false,
          error: null,
          data: responseData,
          success: true,
        });

        onSuccess?.(responseData);
        return responseData;
      } catch (error: any) {
        const formError = error as ContactFormError;
        
        setState({
          loading: false,
          error: formError,
          data: null,
          success: false,
        });

        onError?.(formError);
        throw formError;
      }
    },
    [makeRequest, validate, transformData, onSuccess, onError]
  );

  return {
    sendEmail,
    loading: state.loading,
    error: state.error,
    data: state.data,
    success: state.success,
    reset,
    cancel,
  };
}

