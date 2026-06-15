import { z } from 'zod';

export const LogDonationSchema = z.object({
  body: z.object({
    requestId:    z.string().uuid().optional(),
    hospitalId:   z.string().uuid().optional(),
    donationType: z.enum(['WHOLE_BLOOD','PLATELETS','PLASMA','DOUBLE_RED_CELLS']),
    unitsDonated: z.number().int().min(1).max(10),
    donatedAt:    z.string().datetime({ offset: true }),
    notes:        z.string().max(500).optional(),
  }),
});
