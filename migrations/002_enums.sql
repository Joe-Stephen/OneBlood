-- ============================================================
-- Migration 002: Enums
-- Description: All application-level enum types
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'DONOR',
  'REQUESTER',
  'ADMIN'
);

CREATE TYPE blood_type AS ENUM (
  'A_POS', 'A_NEG',
  'B_POS', 'B_NEG',
  'AB_POS', 'AB_NEG',
  'O_POS', 'O_NEG'
);

CREATE TYPE availability_status AS ENUM (
  'ACTIVE',       -- eligible and ready to donate
  'INACTIVE',     -- voluntarily opted out
  'ON_COOLDOWN',  -- within mandatory rest period
  'SUSPENDED'     -- disabled by admin
);

CREATE TYPE urgency_level AS ENUM (
  'NORMAL',   -- standard request, 24h expiry
  'URGENT',   -- time-sensitive,   6h expiry
  'SOS'       -- emergency,        2h expiry, radius 50km+
);

CREATE TYPE request_status AS ENUM (
  'OPEN',
  'PARTIALLY_MATCHED',
  'FULFILLED',
  'EXPIRED',
  'CANCELLED'
);

CREATE TYPE donor_action AS ENUM (
  'ACCEPTED',
  'DECLINED',
  'IGNORED'
);

CREATE TYPE donation_type AS ENUM (
  'WHOLE_BLOOD',       -- 90-day cooldown
  'PLATELETS',         -- 14-day cooldown
  'PLASMA',            -- 28-day cooldown
  'DOUBLE_RED_CELLS'   -- 112-day cooldown
);

CREATE TYPE notification_type AS ENUM (
  'BLOOD_REQUEST_MATCH',
  'SOS_ALERT',
  'DONOR_ACCEPTED',
  'REQUEST_FULFILLED',
  'COOLDOWN_ENDED',
  'ACCOUNT_VERIFIED',
  'SYSTEM'
);

CREATE TYPE notification_channel AS ENUM (
  'PUSH',
  'SMS',
  'WEBSOCKET',
  'EMAIL'
);

CREATE TYPE notification_status AS ENUM (
  'PENDING',
  'SENT',
  'DELIVERED',
  'FAILED',
  'READ'
);

CREATE TYPE verification_status AS ENUM (
  'PENDING',
  'VERIFIED',
  'REJECTED'
);

CREATE TYPE admin_role AS ENUM (
  'SUPER_ADMIN',
  'OPS_ADMIN',
  'SUPPORT_ADMIN'
);
