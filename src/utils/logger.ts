import { isDevelopment } from '@/config/env';

/**
 * Centralized Logger Utility
 * 
 * Provides structured logging with environment-aware behavior.
 * Prevents debug logs from appearing in production.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  context?: string;
  data?: unknown;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString();
    const context = options?.context ? `[${options.context}]` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${context} ${message}`;
  }

  private logWithData(
    logFn: (...args: unknown[]) => void,
    level: LogLevel,
    message: string,
    options?: LogOptions
  ) {
    const formattedMessage = this.formatMessage(level, message, options);
    
    if (options?.data !== undefined) {
      logFn(formattedMessage, options.data);
    } else {
      logFn(formattedMessage);
    }
  }

  /**
   * Debug logging - only in development
   */
  debug(message: string, options?: LogOptions): void {
    if (isDevelopment) {
      this.logWithData(console.log, 'debug', message, options);
    }
  }

  /**
   * Info logging - only in development
   */
  info(message: string, options?: LogOptions): void {
    if (isDevelopment) {
      this.logWithData(console.info, 'info', message, options);
    }
  }

  /**
   * Warning logging - always enabled
   */
  warn(message: string, options?: LogOptions): void {
    this.logWithData(console.warn, 'warn', message, options);
  }

  /**
   * Error logging - always enabled
   */
  error(message: string, options?: LogOptions): void {
    this.logWithData(console.error, 'error', message, options);
  }

  /**
   * API request logging - only in development
   */
  apiRequest(endpoint: string, method: string, data?: unknown): void {
    if (isDevelopment) {
      this.debug(`API Request: ${method} ${endpoint}`, { 
        context: 'API',
        data 
      });
    }
  }

  /**
   * API response logging - only in development
   */
  apiResponse(endpoint: string, status: number, data?: unknown): void {
    if (isDevelopment) {
      this.debug(`API Response: ${status} ${endpoint}`, { 
        context: 'API',
        data 
      });
    }
  }

  /**
   * API error logging - always enabled
   */
  apiError(endpoint: string, error: unknown): void {
    this.error(`API Error: ${endpoint}`, { 
      context: 'API',
      data: error 
    });
  }
}

/**
 * Singleton logger instance
 * 
 * Usage:
 * ```typescript
 * import { logger } from '@/utils/logger';
 * 
 * logger.debug('Debug message', { context: 'MyComponent', data: { foo: 'bar' } });
 * logger.info('Info message');
 * logger.warn('Warning message');
 * logger.error('Error message', { data: error });
 * 
 * // API-specific logging
 * logger.apiRequest('/v1/auth/login', 'POST', { email: 'user@example.com' });
 * logger.apiResponse('/v1/auth/login', 200, { token: '...' });
 * logger.apiError('/v1/auth/login', error);
 * ```
 */
export const logger = new Logger();
