export type UrgencyLevel = 'NORMAL' | 'URGENT' | 'SOS';

export const SEARCH_RADIUS_METERS: Record<UrgencyLevel, { initial: number; max: number }> = {
  NORMAL: { initial: 10_000, max: 25_000 },
  URGENT: { initial: 25_000, max: 50_000 },
  SOS:    { initial: 50_000, max: 150_000 },
};

export const REQUEST_EXPIRY_HOURS: Record<UrgencyLevel, number> = {
  NORMAL: 48,
  URGENT: 12,
  SOS:    6,
};
