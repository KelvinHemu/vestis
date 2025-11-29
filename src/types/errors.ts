export const AuthErrorCode = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  USER_EXISTS: 'user_exists',
  INVALID_EMAIL: 'invalid_email',
  WEAK_PASSWORD: 'weak_password',
  NETWORK_ERROR: 'network_error',
  SERVER_ERROR: 'server_error',
  TOKEN_EXPIRED: 'token_expired',
  INVALID_TOKEN: 'invalid_token',
  UNAUTHORIZED: 'unauthorized',
  UNKNOWN_ERROR: 'unknown_error',
} as const;

export type AuthErrorCode = typeof AuthErrorCode[keyof typeof AuthErrorCode];

export interface ApiError {
  code: AuthErrorCode;
  message: string;
  field?: string;
}

export class AuthError extends Error {
  code: AuthErrorCode;
  field?: string;

  constructor(code: AuthErrorCode, message: string, field?: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.field = field;
  }
}

/**
 * Custom error for insufficient credits scenarios
 */
export class InsufficientCreditsError extends Error {
  public readonly creditsAvailable: number;
  public readonly creditsRequired: number;

  constructor(creditsAvailable: number = 0, creditsRequired: number = 1, message?: string) {
    super(message || `Insufficient credits. You have ${creditsAvailable} credits but need ${creditsRequired} credits.`);
    this.name = 'InsufficientCreditsError';
    this.creditsAvailable = creditsAvailable;
    this.creditsRequired = creditsRequired;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    // Use a safe cast to avoid TypeScript complaining about captureStackTrace not existing on ErrorConstructor
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, InsufficientCreditsError);
    }
  }
}
