export type DonationType = 'WHOLE_BLOOD' | 'PLATELETS' | 'PLASMA' | 'DOUBLE_RED_CELLS';

export const COOLDOWN_DAYS: Record<DonationType, number> = {
  WHOLE_BLOOD:      90,
  PLATELETS:        14,
  PLASMA:           28,
  DOUBLE_RED_CELLS: 112,
};
