import { z } from 'zod';

const BLOOD_TYPES = ['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG'] as const;

export const CreateRequestSchema = z.object({
  body: z.object({
    bloodType:     z.enum(BLOOD_TYPES),
    unitsRequired: z.number().int().min(1).max(20),
    hospitalName:  z.string().min(2).max(255),
    hospitalId:    z.string().uuid().optional(),
    location: z.object({
      lat: z.number().min(-90).max(90),
      lon: z.number().min(-180).max(180),
    }),
    urgencyLevel:  z.enum(['NORMAL','URGENT','SOS']).default('NORMAL'),
    contactName:   z.string().min(2).max(255),
    contactPhone:  z.string().regex(/^\+?[0-9]{10,15}$/),
    notes:         z.string().max(500).optional(),
  }),
});

export const UpdateRequestSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.enum(['CANCELLED']).optional(),
    notes:  z.string().max(500).optional(),
  }),
});

export const RespondSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    action: z.enum(['ACCEPTED','DECLINED']),
  }),
});

export const ListRequestsSchema = z.object({
  query: z.object({
    status:       z.enum(['OPEN','PARTIALLY_MATCHED','FULFILLED','EXPIRED','CANCELLED']).optional(),
    bloodType:    z.enum(BLOOD_TYPES).optional(),
    urgencyLevel: z.enum(['NORMAL','URGENT','SOS']).optional(),
    page:         z.coerce.number().int().min(1).default(1),
    limit:        z.coerce.number().int().min(1).max(100).default(20),
  }),
});
