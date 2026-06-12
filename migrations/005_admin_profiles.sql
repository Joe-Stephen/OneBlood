-- ============================================================
-- Migration 005: Admin Profiles
-- Description: Admin-specific profile linked to users
-- ============================================================

CREATE TABLE admin_profiles (
  id          UUID        NOT NULL DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL,
  admin_role  admin_role  NOT NULL DEFAULT 'SUPPORT_ADMIN',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_admin_profiles      PRIMARY KEY (id),
  CONSTRAINT uq_admin_profiles_user UNIQUE (user_id),
  CONSTRAINT fk_admin_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_admin_profiles_user_id ON admin_profiles(user_id);

COMMENT ON TABLE admin_profiles IS 'Extended data for users with role = ADMIN';
