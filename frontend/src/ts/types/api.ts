/* ============================================
   StartupEvents — API Response Type Definitions
   Syllabus: FE Unit V — Generics, discriminated unions,
             type narrowing
   ============================================ */

/**
 * Generic API success response
 * Demonstrates: generics — T is the type of the data payload
 *
 * @template T - The type of the response data
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * API error response
 * Demonstrates: interface for error shape
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    stack?: string;
  };
}

/**
 * Discriminated union for API responses
 * Demonstrates: discriminated union — `success` is the discriminant
 *
 * Usage with type narrowing:
 * ```ts
 * const result: ApiResponse<IEvent[]> = await fetchEvents();
 * if (result.success) {
 *   // TypeScript knows result.data is IEvent[] here
 *   console.log(result.data.length);
 * } else {
 *   // TypeScript knows result.error exists here
 *   console.log(result.error.message);
 * }
 * ```
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Paginated response wrapper
 * Demonstrates: generic interface with nested generic
 *
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T> {
  success: true;
  count: number;
  pagination: IPagination;
  data: T[];
}

/**
 * Pagination metadata
 */
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Validation error from express-validator
 */
export interface IValidationError {
  success: false;
  errors: Array<{
    type: string;
    value: string;
    msg: string;
    path: string;
    location: string;
  }>;
}

/**
 * HTTP method type
 * Demonstrates: union of literal types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Request config for the API client
 * Demonstrates: generics in request config
 */
export interface RequestConfig<TBody = unknown> {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: TBody;
  params?: Record<string, string | number>;
  timeout?: number;
}
