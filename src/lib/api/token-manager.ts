/**
 * Token Manager Module
 * Manages JWT access token persistence and authentication lifecycle handlers.
 */

const ACCESS_TOKEN_KEY = 'rihla_access_token';

let memoryToken: string | null = null;
let logoutListener: (() => void) | null = null;

export const tokenManager = {
  /**
   * Retrieves the current access token from memory or client storage.
   */
  getAccessToken(): string | null {
    if (memoryToken) return memoryToken;
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Saves the access token to memory and client storage.
   */
  setAccessToken(token: string): void {
    memoryToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  /**
   * Removes all stored tokens from memory and client storage.
   */
  clearTokens(): void {
    memoryToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },

  /**
   * Registers a logout handler callback.
   */
  onLogout(listener: () => void): void {
    logoutListener = listener;
  },

  /**
   * Triggers the registered logout callback and clears tokens.
   */
  triggerLogout(): void {
    this.clearTokens();
    if (logoutListener) {
      logoutListener();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('rihla:logout'));
    }
  },
};
