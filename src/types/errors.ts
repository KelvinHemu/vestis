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
