import { z } from 'zod';

export const UpdateUserSchema = z.object({
  body: z.object({
    name:  z.string().min(2).max(255).optional(),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number').optional(),
  }),
});
