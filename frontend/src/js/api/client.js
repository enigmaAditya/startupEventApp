/* ============================================
   StartupEvents — API Client (Fetch Wrapper)
   Syllabus: FE Unit III — Promises, async/await,
             fetch API, error handling, modules
   ============================================ */

/**
 * Base URL for the API
 * In production, this would be set by env vars via Vite
 */
const BASE_URL = '/api/v1';

/**
 * Custom HTTP Error class
 * Demonstrates: class inheritance, custom error types
 */
class HttpError extends Error {
  constructor(status, statusText, data) {
    super(`${status} ${statusText}`);
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * Core fetch wrapper with interceptors
 * Demonstrates: async/await, try/catch, fetch API,
 *               default params, object spread, template literals
 *
 * @param {string} endpoint - API endpoint (e.g., '/events')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Parsed JSON response
 */
const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  // Default headers with optional merge
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Get access token from tokenManager (if available)
  if (typeof window.__tokenManager !== 'undefined') {
    const token = window.__tokenManager.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Send cookies
  };

  try {
    const response = await fetch(url, config);

    // Parse JSON response
    const data = await response.json().catch(() => ({}));

    // Handle non-OK responses
    if (!response.ok) {
      throw new HttpError(response.status, response.statusText, data);
    }

    return data;
  } catch (error) {
    // Re-throw HttpErrors
    if (error instanceof HttpError) {
      throw error;
    }

    // Network errors (no internet, CORS, DNS failure, etc.)
    throw new HttpError(0, 'Network Error', {
      message: error.message || 'Unable to reach the server',
    });
  }
};

// ============ HTTP METHOD HELPERS ============
// Demonstrates: partial application pattern, rest/spread

/**
 * GET request
 * @param {string} endpoint
 * @param {Object} params - Query parameters object
 * @returns {Promise<Object>}
 */
const get = (endpoint, params = {}) => {
  // Build query string from params object
  // Demonstrates: URLSearchParams, Object.entries, ternary
  const queryString = Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';

  return request(`${endpoint}${queryString}`, { method: 'GET' });
};

/**
 * POST request
 * @param {string} endpoint
 * @param {Object} body - Request body
 * @returns {Promise<Object>}
 */
const post = (endpoint, body = {}) =>
  request(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

/**
 * PUT request
 * @param {string} endpoint
 * @param {Object} body - Request body
 * @returns {Promise<Object>}
 */
const put = (endpoint, body = {}) =>
  request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

/**
 * DELETE request
 * @param {string} endpoint
 * @returns {Promise<Object>}
 */
const del = (endpoint) =>
  request(endpoint, { method: 'DELETE' });

// ============ API SERVICES ============
// Grouped by resource — demonstrates module organization

/**
 * Events API service
 * Demonstrates: object with async methods, query parameter building
 */
const eventsAPI = {
  /** Get paginated events with optional filters */
  getAll: (params = {}) => get('/events', params),

  /** Get single event by ID */
  getById: (id) => get(`/events/${id}`),

  /** Create a new event */
  create: (eventData) => post('/events', eventData),

  /** Update an event */
  update: (id, eventData) => put(`/events/${id}`, eventData),

  /** Delete an event */
  delete: (id) => del(`/events/${id}`),

  /** RSVP to an event */
  rsvp: (id, rsvpData = {}) => post(`/events/${id}/rsvp`, rsvpData),

  /** Search events */
  search: (query, params = {}) => get('/events', { search: query, ...params }),
};

/**
 * Auth API service
 */
const authAPI = {
  /** Register new user */
  register: (userData) => post('/auth/register', userData),

  /** Login user */
  login: (credentials) => post('/auth/login', credentials),

  /** Logout user */
  logout: () => post('/auth/logout'),
};

/**
 * User API service
 */
const usersAPI = {
  /** Get current user profile */
  getMe: () => get('/users/me'),

  /** Update current user profile */
  updateMe: (updates) => put('/users/me', updates),
};

// Export for use by other modules
window.__api = { events: eventsAPI, auth: authAPI, users: usersAPI };
window.__HttpError = HttpError;
