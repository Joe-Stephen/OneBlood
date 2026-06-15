export const BLOOD_TYPES = [
  'A_POS', 'A_NEG',
  'B_POS', 'B_NEG',
  'AB_POS', 'AB_NEG',
  'O_POS', 'O_NEG',
] as const;

export type BloodType = typeof BLOOD_TYPES[number];

// For display purposes
export const BLOOD_TYPE_LABELS: Record<BloodType, string> = {
  A_POS:  'A+',
  A_NEG:  'A−',
  B_POS:  'B+',
  B_NEG:  'B−',
  AB_POS: 'AB+',
  AB_NEG: 'AB−',
  O_POS:  'O+',
  O_NEG:  'O−',
};

// Recipient blood type → compatible donor blood types
export const BLOOD_COMPATIBILITY: Record<BloodType, BloodType[]> = {
  O_NEG:  ['O_NEG'],
  O_POS:  ['O_NEG', 'O_POS'],
  A_NEG:  ['O_NEG', 'A_NEG'],
  A_POS:  ['O_NEG', 'O_POS', 'A_NEG', 'A_POS'],
  B_NEG:  ['O_NEG', 'B_NEG'],
  B_POS:  ['O_NEG', 'O_POS', 'B_NEG', 'B_POS'],
  AB_NEG: ['O_NEG', 'A_NEG', 'B_NEG', 'AB_NEG'],
  AB_POS: ['O_NEG', 'O_POS', 'A_NEG', 'A_POS', 'B_NEG', 'B_POS', 'AB_NEG', 'AB_POS'],
};
