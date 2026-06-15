import { z } from 'zod';

export const GoogleAuthSchema = z.object({
  body: z.object({
    code:        z.string().min(1),
    redirectUri: z.string().url(),
  }),
});

export const RefreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});
