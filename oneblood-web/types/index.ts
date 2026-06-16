export interface User {
  id: string;
  email: string;
  name: string;
  role: 'DONOR' | 'REQUESTER' | 'ADMIN';
  googleId: string;
  isProfileComplete: boolean;
  phone?: string;
}

export interface BloodRequest {
  id: string;
  bloodType: BloodType;
  urgencyLevel: UrgencyLevel;
  status: RequestStatus;
  hospitalName: string;
  unitsRequired: number;
  unitsFulfilled: number;
  contactName: string;
  contactPhone: string;
  notes?: string;
  expiresAt: string;
  createdAt: string;
  distanceKm?: number;
}

export interface DonorProfile {
  id: string;
  userId: string;
  bloodType: BloodType;
  weightKg: number;
  dateOfBirth: string;
  city: string;
  state: string;
  availabilityStatus: 'ACTIVE' | 'INACTIVE';
  nextEligibleDate: string | null;
  isEligible: boolean;
  createdAt: string;
}

export interface Donation {
  id: string;
  donorId: string;
  requestId?: string;
  hospitalId?: string;
  donationType: DonationType;
  unitsDonated: number;
  donatedAt: string;
  nextEligibleDate: string;
  notes?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  body: string;
  requestId?: string;
  status: 'SENT' | 'READ';
  readAt: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Enums / Union Types
export type BloodType = 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'AB_POS' | 'AB_NEG' | 'O_POS' | 'O_NEG';
export type UrgencyLevel = 'NORMAL' | 'URGENT' | 'SOS';
export type RequestStatus = 'OPEN' | 'PARTIALLY_MATCHED' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED';
export type DonationType = 'WHOLE_BLOOD' | 'PLATELETS' | 'PLASMA' | 'DOUBLE_RED_CELLS';
export type NotificationType =
  | 'BLOOD_REQUEST_MATCH'
  | 'SOS_ALERT'
  | 'DONOR_ACCEPTED'
  | 'DONOR_DECLINED'
  | 'REQUEST_FULFILLED'
  | 'REQUEST_EXPIRED'
  | 'COOLDOWN_ENDED'
  | 'SYSTEM';
