import { z } from 'zod';

const schema = z.object({
  NODE_ENV:     z.enum(['development', 'test', 'production']).default('development'),
  PORT:         z.coerce.number().default(3000),
  JWT_SECRET:   z.string().min(32),
  JWT_EXPIRES_IN:        z.string().default('1h'),
  JWT_REFRESH_SECRET:    z.string().min(32),
  JWT_REFRESH_EXPIRES_IN:z.string().default('30d'),
  CORS_ORIGIN:  z.string().default('http://localhost:3001'),
  RATE_LIMIT_WINDOW_MS:      z.coerce.number().default(60_000),
  RATE_LIMIT_MAX_REQUESTS:   z.coerce.number().default(100),
  GOOGLE_CLIENT_ID:     z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  GOOGLE_REDIRECT_URI:  z.string().default('http://localhost:3001/api/auth/callback'),
  GOOGLE_MAPS_API_KEY:  z.string().default(''),
  TWILIO_ACCOUNT_SID:   z.string().default(''),
  TWILIO_AUTH_TOKEN:    z.string().default(''),
  TWILIO_PHONE_NUMBER:  z.string().default(''),
  FIREBASE_PROJECT_ID:  z.string().default(''),
  FIREBASE_PRIVATE_KEY: z.string().default(''),
  FIREBASE_CLIENT_EMAIL:z.string().default(''),
});

// Allow missing in test/dev by using safeParse fallback
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment config:', parsed.error.format());
  process.exit(1);
}

export const appConfig = parsed.data;
