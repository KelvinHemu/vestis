import { z } from 'zod';

/**
 * Environment Variable Schema
 * 
 * Validates environment variables at runtime to catch configuration issues early.
 * Add all required environment variables here for type safety and validation.
 */
const envSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z
    .string()
    .url('API URL must be a valid URL')
    .default('http://localhost:8080/api'),
  
  // Node Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Validated and typed environment variables
 * 
 * Usage:
 * ```typescript
 * import { env } from '@/config/env';
 * console.log(env.NEXT_PUBLIC_API_URL);
 * ```
 */
export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV,
});

/**
 * Environment helpers
 */
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

/**
 * Type-safe environment variable access
 */
export type Env = z.infer<typeof envSchema>;
