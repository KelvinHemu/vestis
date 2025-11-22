/**
 * Authentication Debugging Utilities
 * Use these helpers to debug authentication issues
 */

import authService from '../services/authService';

export const debugAuth = () => {
  const token = authService.getToken();
  const user = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();

  console.group('🔐 Authentication Debug Info');
  console.log('Is Authenticated:', isAuthenticated);
  console.log('Has Token:', !!token);
  console.log('Token Preview:', token ? token.substring(0, 30) + '...' : 'No token');
  console.log('Token Length:', token?.length || 0);
  console.log('User:', user);
  console.log('LocalStorage Keys:', Object.keys(localStorage));
  console.log('Auth Token in Storage:', localStorage.getItem('auth_token') ? 'YES' : 'NO');
  console.groupEnd();

  return {
    isAuthenticated,
    hasToken: !!token,
    hasUser: !!user,
    tokenLength: token?.length || 0,
  };
};

// Add to window for easy access in console
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
}
