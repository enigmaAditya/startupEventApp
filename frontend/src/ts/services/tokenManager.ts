/* ============================================
   StartupEvents — Token Manager (TypeScript)
   Syllabus: FE Unit V — Generics, interfaces,
             closures + type safety
   ============================================ */

/**
 * JWT Payload interface
 * Demonstrates: interface for structured data
 */
interface JWTPayload {
  id: string;
  email: string;
  role: 'attendee' | 'organizer' | 'admin';
  iat: number;
  exp: number;
}

/**
 * Token Manager return type interface
 * Demonstrates: defining the shape of a factory-returned object
 */
interface ITokenManager {
  setTokens: (access: string, refresh: string) => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  isAuthenticated: () => boolean;
  isExpired: () => boolean;
  getTimeToExpiry: () => number;
  getUser: () => JWTPayload | null;
  clear: () => void;
  refresh: () => Promise<boolean>;
}

/**
 * Create a closure-based, type-safe token manager
 * 
 * Demonstrates: closures with TypeScript — the closure variables
 * are typed, and the return type is explicitly declared.
 * This is the same pattern as the JS version, but with full type safety.
 *
 * @returns {ITokenManager} Type-safe token manager
 */
const createTokenManager = (): ITokenManager => {
  // Private closure variables — typed
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  let tokenExpiry: number | null = null;

  /**
   * Parse JWT payload without a library
   * @param token - JWT string
   * @returns Decoded payload or null
   */
  const parseJWT = (token: string): JWTPayload | null => {
    try {
      const base64Payload: string = token.split('.')[1];
      const jsonPayload: string = atob(base64Payload);
      return JSON.parse(jsonPayload) as JWTPayload;
    } catch {
      return null;
    }
  };

  return {
    setTokens(access: string, refresh: string): void {
      accessToken = access;
      refreshToken = refresh;

      const payload = parseJWT(access);
      if (payload?.exp) {
        tokenExpiry = payload.exp * 1000;
      }
    },

    getAccessToken(): string | null {
      return accessToken;
    },

    getRefreshToken(): string | null {
      return refreshToken;
    },

    isAuthenticated(): boolean {
      return accessToken !== null;
    },

    isExpired(): boolean {
      if (!tokenExpiry) return true;
      return Date.now() >= tokenExpiry;
    },

    getTimeToExpiry(): number {
      if (!tokenExpiry) return 0;
      return Math.max(0, tokenExpiry - Date.now());
    },

    getUser(): JWTPayload | null {
      if (!accessToken) return null;
      return parseJWT(accessToken);
    },

    clear(): void {
      accessToken = null;
      refreshToken = null;
      tokenExpiry = null;
    },

    async refresh(): Promise<boolean> {
      if (!refreshToken) return false;

      try {
        const response = await fetch('http://localhost:5000/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include',
        });

        if (!response.ok) {
          accessToken = null;
          refreshToken = null;
          tokenExpiry = null;
          return false;
        }

        interface RefreshResponse {
          data: { accessToken: string };
        }

        const data: RefreshResponse = await response.json();
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

// Export singleton
export const tokenManager: ITokenManager = createTokenManager();
export type { ITokenManager, JWTPayload };
