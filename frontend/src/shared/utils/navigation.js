/**
 * Navigation Utility
 * Centralized navigation logic to avoid scattering window.location.href
 */

export const navigate = {
  /**
   * Redirect to login page
   * Used for unauthorized access (401 responses)
   */
  toLogin: () => {
    localStorage.clear();
    window.location.href = '/login';
  },

  /**
   * Redirect to home page
   */
  toHome: () => {
    window.location.href = '/';
  },

  /**
   * Redirect to dashboard
   */
  toDashboard: () => {
    window.location.href = '/dashboard';
  },

  /**
   * Redirect to any path
   * @param {string} path - The path to navigate to
   */
  to: (path) => {
    window.location.href = path;
  },

  /**
   * Reload current page
   */
  refresh: () => {
    window.location.reload();
  },

  /**
   * Go back to previous page
   */
  back: () => {
    window.history.back();
  },
};
