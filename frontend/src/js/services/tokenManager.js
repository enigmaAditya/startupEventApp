/* ============================================
   StartupEvents — Token Manager (Closure-Based)
   Syllabus: FE Unit III — Closures, scope chain,
             ES6+ features
   ============================================ */

/**
 * Create a closure-based token manager
 * 
 * This is a classic closure pattern:
 * - The outer function `createTokenManager` creates private variables
 *   (accessToken, refreshToken) in its scope.
 * - The returned object contains methods that "close over" these variables.
 * - The variables remain alive in memory as long as the returned object exists.
 * - No external code can directly access the tokens — only through the methods.
 *
 * Demonstrates: closures, scope chain, IIFE, private variables,
 *               factory function pattern
 *
 * @returns {Object} Token manager with getter/setter methods
 */
const createTokenManager = () => {
  // ---- Private variables (closed over) ----
  // These are NOT accessible from outside this function
  let accessToken = null;
  let refreshToken = null;
  let tokenExpiry = null;

  /**
   * Parse JWT payload without a library
   * Demonstrates: atob (base64 decode), JSON.parse, string split
   *
   * @param {string} token - JWT token string
   * @returns {Object|null} Decoded payload
   */
  const parseJWT = (token) => {
    try {
      // JWT structure: header.payload.signature
      const base64Payload = token.split('.')[1];
      // atob decodes base64 to string
      const jsonPayload = atob(base64Payload);
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  // ---- Return public interface (closure) ----
  return {
    /**
     * Store both tokens
     * @param {string} access - JWT access token
     * @param {string} refresh - JWT refresh token
     */
    setTokens: (access, refresh) => {
      accessToken = access;
      refreshToken = refresh;

      // Extract expiry from JWT payload
      const payload = parseJWT(access);
      if (payload?.exp) {
        tokenExpiry = payload.exp * 1000; // Convert to milliseconds
      }
    },

    /**
     * Get the access token
     * @returns {string|null}
     */
    getAccessToken: () => accessToken,

    /**
     * Get the refresh token
     * @returns {string|null}
     */
    getRefreshToken: () => refreshToken,

    /**
     * Check if a user is currently authenticated
     * @returns {boolean}
     */
    isAuthenticated: () => accessToken !== null,

    /**
     * Check if the access token has expired
     * Demonstrates: Date.now(), comparison operators
     * @returns {boolean}
     */
    isExpired: () => {
      if (!tokenExpiry) return true;
      return Date.now() >= tokenExpiry;
    },

    /**
     * Get time remaining until token expires (in ms)
     * @returns {number}
     */
    getTimeToExpiry: () => {
      if (!tokenExpiry) return 0;
      return Math.max(0, tokenExpiry - Date.now());
    },

    /**
     * Get decoded payload from access token
     * @returns {Object|null}
     */
    getUser: () => {
      if (!accessToken) return null;
      return parseJWT(accessToken);
    },

    /**
     * Clear all tokens (logout)
     */
    clear: () => {
      accessToken = null;
      refreshToken = null;
      tokenExpiry = null;
    },

    /**
     * Attempt to refresh the access token
     * Demonstrates: async/await with closures, fetch
     * @returns {Promise<boolean>} Whether refresh was successful
     */
    refresh: async () => {
      if (!refreshToken) return false;

      try {
        const response = await fetch('http://localhost:5000/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include',
        });

        if (!response.ok) {
          // Refresh failed — clear tokens
          accessToken = null;
          refreshToken = null;
          tokenExpiry = null;
          return false;
        }

        const data = await response.json();
        accessToken = data.data.accessToken;

        const payload = parseJWT(accessToken);
        if (payload?.exp) {
          tokenExpiry = payload.exp * 1000;
        }

        return true;
      } catch {
        return false;
      }
    },
  };
};

// Create singleton instance
// Demonstrates: singleton pattern via module scope
window.__tokenManager = createTokenManager();
