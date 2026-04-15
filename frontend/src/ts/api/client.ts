/* ============================================
   StartupEvents — Generic TypeScript API Client
   Syllabus: FE Unit V — Generics, async/await,
             type narrowing, discriminated unions
   ============================================ */

import type {
  ApiResponse,
  PaginatedResponse,
  HttpMethod,
  RequestConfig,
  IEvent,
  IEventFilters,
  IUser,
  IAuthResponse,
  RegisterPayload,
  LoginPayload,
  UpdateProfilePayload,
  CreateEventPayload,
  UpdateEventPayload,
  IRSVP,
} from '../types';

const BASE_URL = 'http://localhost:5000/api/v1';

/**
 * Custom HTTP Error with typed data
 * Demonstrates: generic class, extends Error
 */
class HttpError<T = unknown> extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly data: T
  ) {
    super(`${status} ${statusText}`);
    this.name = 'HttpError';
  }
}

/**
 * Generic fetch wrapper with full type safety
 * Demonstrates: generics — caller specifies the return type,
 *               and TypeScript enforces it through the chain
 *
 * @template TResponse - Expected response data type
 * @template TBody - Request body type (defaults to unknown)
 */
async function request<TResponse, TBody = unknown>(
  endpoint: string,
  config: RequestConfig<TBody> = { method: 'GET' }
): Promise<ApiResponse<TResponse>> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  // Retrieve token if available
  const tokenManager = (window as any).__tokenManager;
  if (tokenManager) {
    const token: string | null = tokenManager.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const fetchOptions: RequestInit = {
      method: config.method,
      headers,
      credentials: 'include',
    };

    // Add body for non-GET requests
    if (config.body && config.method !== 'GET') {
      fetchOptions.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new HttpError(response.status, response.statusText, data);
    }

    return data as ApiResponse<TResponse>;
  } catch (error) {
    if (error instanceof HttpError) throw error;

    throw new HttpError(0, 'Network Error', {
      message: (error as Error).message || 'Unable to reach the server',
    });
  }
}

// ============ TYPED HTTP METHOD HELPERS ============

/**
 * Type-safe GET request
 * 
 * @template T - Response data type
 * @example
 *   const events = await get<IEvent[]>('/events'); // TS knows this is ApiResponse<IEvent[]>
 */
function get<T>(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<ApiResponse<T>> {
  const queryString = Object.keys(params).length
    ? '?' + new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString()
    : '';

  return request<T>(endpoint + queryString, { method: 'GET' });
}

/**
 * Type-safe POST request
 * 
 * @template TResponse - Response data type
 * @template TBody - Request body type
 */
function post<TResponse, TBody = unknown>(
  endpoint: string,
  body: TBody
): Promise<ApiResponse<TResponse>> {
  return request<TResponse, TBody>(endpoint, { method: 'POST', body });
}

/**
 * Type-safe PUT request
 */
function put<TResponse, TBody = unknown>(
  endpoint: string,
  body: TBody
): Promise<ApiResponse<TResponse>> {
  return request<TResponse, TBody>(endpoint, { method: 'PUT', body });
}

/**
 * Type-safe DELETE request
 */
function del<TResponse = void>(
  endpoint: string
): Promise<ApiResponse<TResponse>> {
  return request<TResponse>(endpoint, { method: 'DELETE' });
}

// ============ TYPED API SERVICES ============

/**
 * Events API — fully typed
 * 
 * Demonstrates: generic type parameters flow from the API methods
 * to the response, giving end-to-end type safety
 */
export const eventsAPI = {
  getAll: (filters?: IEventFilters) =>
    get<IEvent[]>('/events', filters as Record<string, string | number>),

  getById: (id: string) =>
    get<IEvent>(`/events/${id}`),

  create: (data: CreateEventPayload) =>
    post<IEvent, CreateEventPayload>('/events', data),

  update: (id: string, data: UpdateEventPayload) =>
    put<IEvent, UpdateEventPayload>(`/events/${id}`, data),

  delete: (id: string) =>
    del<void>(`/events/${id}`),

  rsvp: (id: string, data: Partial<IRSVP>) =>
    post<IRSVP, Partial<IRSVP>>(`/events/${id}/rsvp`, data),

  search: (query: string) =>
    get<IEvent[]>('/events', { search: query }),
};

/**
 * Auth API — fully typed
 */
export const authAPI = {
  register: (data: RegisterPayload) =>
    post<IAuthResponse, RegisterPayload>('/auth/register', data),

  login: (data: LoginPayload) =>
    post<IAuthResponse, LoginPayload>('/auth/login', data),

  logout: () =>
    post<void, Record<string, never>>('/auth/logout', {}),
};

/**
 * Users API — fully typed
 */
export const usersAPI = {
  getMe: () => get<IUser>('/users/me'),

  updateMe: (data: UpdateProfilePayload) =>
    put<IUser, UpdateProfilePayload>('/users/me', data),
};

// ============ TYPE NARROWING EXAMPLE ============
/**
 * Example of using discriminated union with type narrowing
 * 
 * Demonstrates: the `success` field is the discriminant —
 * TypeScript can narrow the type based on its value
 */
export async function fetchEventsTypeSafe(): Promise<IEvent[]> {
  const result = await eventsAPI.getAll();

  // Type narrowing via discriminated union
  if (result.success) {
    // TS knows: result is ApiSuccessResponse<IEvent[]>
    // result.data is IEvent[]
    return result.data;
  } else {
    // TS knows: result is ApiErrorResponse
    // result.error.message exists
    console.error('Failed to fetch events:', result.error.message);
    return [];
  }
}

// Export for global use
export { HttpError, request, get, post, put, del };
