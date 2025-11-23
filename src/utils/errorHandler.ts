import { AuthError, AuthErrorCode } from '../types/errors';

/**
 * Parse API error response and convert to AuthError
 */
export function parseAuthError(error: any): AuthError {
  // Network error
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return new AuthError(
      AuthErrorCode.NETWORK_ERROR,
      'Unable to connect to the server. Please check your internet connection.'
    );
  }

  // Already an AuthError
  if (error instanceof AuthError) {
    return error;
  }

  // Error from API response
  if (error.message) {
    const message = error.message.toLowerCase();

    // Invalid credentials
    if (
      message.includes('invalid authentication credentials') ||
      message.includes('invalid credentials') ||
      message.includes('incorrect password') ||
      message.includes('wrong password')
    ) {
      return new AuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        'The email or password you entered is incorrect. Please try again.'
      );
    }

    // User already exists
    if (
      message.includes('user already exists') ||
      message.includes('email already registered') ||
      message.includes('email is already in use')
    ) {
      return new AuthError(
        AuthErrorCode.USER_EXISTS,
        'An account with this email already exists. Please login instead.',
        'email'
      );
    }

    // Invalid email
    if (
      message.includes('invalid email') ||
      message.includes('email is not valid')
    ) {
      return new AuthError(
        AuthErrorCode.INVALID_EMAIL,
        'Please enter a valid email address.',
        'email'
      );
    }

    // Weak password
    if (
      message.includes('password is too weak') ||
      message.includes('password must be') ||
      message.includes('password should be')
    ) {
      return new AuthError(
        AuthErrorCode.WEAK_PASSWORD,
        'Password must be at least 8 characters long and include letters and numbers.',
        'password'
      );
    }

    // Token expired
    if (
      message.includes('token expired') ||
      message.includes('session expired')
    ) {
      return new AuthError(
        AuthErrorCode.TOKEN_EXPIRED,
        'Your session has expired. Please login again.'
      );
    }

    // Invalid token
    if (
      message.includes('invalid token') ||
      message.includes('token is invalid')
    ) {
      return new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        'Invalid authentication. Please login again.'
      );
    }

    // Unauthorized
    if (
      message.includes('unauthorized') ||
      message.includes('not authorized')
    ) {
      return new AuthError(
        AuthErrorCode.UNAUTHORIZED,
        'You are not authorized to perform this action.'
      );
    }

    // Server error
    if (
      message.includes('server error') ||
      message.includes('internal error')
    ) {
      return new AuthError(
        AuthErrorCode.SERVER_ERROR,
        'Something went wrong on our end. Please try again later.'
      );
    }

    // Return the original message if no pattern matches
    return new AuthError(AuthErrorCode.UNKNOWN_ERROR, error.message);
  }

  // Unknown error
  return new AuthError(
    AuthErrorCode.UNKNOWN_ERROR,
    'An unexpected error occurred. Please try again.'
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  const authError = parseAuthError(error);
  return authError.message;
}

/**
 * Check if error is a specific type
 */
export function isErrorCode(error: any, code: AuthErrorCode): boolean {
  const authError = parseAuthError(error);
  return authError.code === code;
}
