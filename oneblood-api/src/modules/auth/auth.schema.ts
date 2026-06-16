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

export const SendOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name:  z.string().min(1).max(100).optional(),
  }),
});

export const VerifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    code:  z.string().length(6),
  }),
});
