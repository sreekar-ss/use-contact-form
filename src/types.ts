/**
 * Configuration options for the useContactForm hook
 */
export interface UseContactFormOptions<TData = any, TResponse = any> {
  /**
   * The API endpoint to send the form data to
   */
  endpoint: string;

  /**
   * HTTP method to use (default: 'POST')
   */
  method?: 'POST' | 'PUT' | 'PATCH';

  /**
   * Custom headers to include in the request
   */
  headers?: Record<string, string>;

  /**
   * Timeout in milliseconds (default: 10000)
   */
  timeout?: number;

  /**
   * Number of retry attempts on failure (default: 0)
   */
  retries?: number;

  /**
   * Delay between retries in milliseconds (default: 1000)
   */
  retryDelay?: number;

  /**
   * Callback function called on successful submission
   */
  onSuccess?: (data: TResponse) => void;

  /**
   * Callback function called on error
   */
  onError?: (error: ContactFormError) => void;

  /**
   * Transform the form data before sending
   */
  transformData?: (data: TData) => any;

  /**
   * Validate the form data before sending
   */
  validate?: (data: TData) => ValidationResult;
}

/**
 * Return type of the useContactForm hook
 */
export interface UseContactFormReturn<TData = any, TResponse = any> {
  /**
   * Send the contact form data
   */
  sendEmail: (data: TData) => Promise<TResponse>;

  /**
   * Whether the form is currently being submitted
   */
  loading: boolean;

  /**
   * Error object if submission failed
   */
  error: ContactFormError | null;

  /**
   * Response data from successful submission
   */
  data: TResponse | null;

  /**
   * Whether the form was successfully submitted
   */
  success: boolean;

  /**
   * Reset the form state (error, data, success)
   */
  reset: () => void;

  /**
   * Cancel the current request
   */
  cancel: () => void;
}

/**
 * Standard contact form data structure
 */
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  phone?: string;
  subject?: string;
  [key: string]: any;
}

/**
 * Standard response from the backend
 */
export interface ContactFormResponse {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Error object for contact form submissions
 */
export interface ContactFormError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: Record<string, string[]>;
}

/**
 * Internal state for the hook
 */
export interface ContactFormState<TResponse = any> {
  loading: boolean;
  error: ContactFormError | null;
  data: TResponse | null;
  success: boolean;
}

