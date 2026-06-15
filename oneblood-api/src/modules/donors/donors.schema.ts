import { z } from 'zod';

const BLOOD_TYPES = ['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG'] as const;

export const CreateDonorProfileSchema = z.object({
  body: z.object({
    bloodType:   z.enum(BLOOD_TYPES),
    weightKg:    z.number().int().min(45).max(300),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
    city:        z.string().min(2).max(100),
    state:       z.string().min(2).max(100),
    location: z.object({
      lat: z.number().min(-90).max(90),
      lon: z.number().min(-180).max(180),
    }),
  }),
});

export const UpdateDonorProfileSchema = z.object({
  body: z.object({
    weightKg:           z.number().int().min(45).max(300).optional(),
    city:               z.string().min(2).max(100).optional(),
    state:              z.string().min(2).max(100).optional(),
    availabilityStatus: z.enum(['ACTIVE','INACTIVE']).optional(),
    location: z.object({
      lat: z.number().min(-90).max(90),
      lon: z.number().min(-180).max(180),
    }).optional(),
  }),
});

export const NearbyDonorsQuerySchema = z.object({
  query: z.object({
    lat:       z.coerce.number().min(-90).max(90),
    lon:       z.coerce.number().min(-180).max(180),
    radiusKm:  z.coerce.number().min(1).max(200).default(10),
    bloodType: z.enum(BLOOD_TYPES).optional(),
    page:      z.coerce.number().int().min(1).default(1),
    limit:     z.coerce.number().int().min(1).max(100).default(20),
  }),
});
