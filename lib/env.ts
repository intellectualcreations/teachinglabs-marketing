/**
 * Environment variable validation and typed access.
 * FLU-215: Production hardening
 *
 * Import this module at app startup to validate required env vars.
 */

const required = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL'] as const;

const optional = [
  'DATABASE_URL',
  'NEXTAUTH_PROVIDER_GOOGLE_ID',
  'NEXTAUTH_PROVIDER_GOOGLE_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
] as const;

type RequiredKey = (typeof required)[number];
type OptionalKey = (typeof optional)[number];

type Env = {
  NODE_ENV: string;
} & Record<RequiredKey, string> &
  Partial<Record<OptionalKey, string>>;

function validateEnv(): Env {
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  } else if (missing.length > 0) {
    console.warn(
      `⚠️  Missing required env vars (non-production): ${missing.join(', ')}`
    );
  }

  const missingOptional: string[] = [];
  for (const key of optional) {
    if (!process.env[key]) {
      missingOptional.push(key);
    }
  }
  if (missingOptional.length > 0) {
    console.warn(
      `ℹ️  Optional env vars not set: ${missingOptional.join(', ')}`
    );
  }

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    ...Object.fromEntries(
      required.map((key) => [key, process.env[key] || ''])
    ),
    ...Object.fromEntries(
      optional.filter((key) => process.env[key]).map((key) => [key, process.env[key]])
    ),
  } as Env;
}

export const env = validateEnv();
