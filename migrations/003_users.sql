-- ============================================================
-- Migration 003: Users
-- Description: Core user accounts (auth via Google OAuth)
-- ============================================================

CREATE TABLE users (
  id           UUID          NOT NULL DEFAULT uuid_generate_v4(),
  google_id    VARCHAR(255)  NOT NULL,
  name         VARCHAR(255)  NOT NULL,
  email        VARCHAR(320)  NOT NULL,
  phone        VARCHAR(15),
  role         user_role     NOT NULL DEFAULT 'DONOR',
  is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ,           -- soft delete

  CONSTRAINT pk_users            PRIMARY KEY (id),
  CONSTRAINT uq_users_google_id  UNIQUE (google_id),
  CONSTRAINT uq_users_email      UNIQUE (email),
  CONSTRAINT chk_email_format    CHECK (
    email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
  ),
  CONSTRAINT chk_phone_format    CHECK (
    phone IS NULL OR phone ~ '^\+?[0-9]{10,15}$'
  )
);

-- Indexes
CREATE INDEX idx_users_google_id  ON users(google_id);
CREATE INDEX idx_users_email      ON users(email);
CREATE INDEX idx_users_role       ON users(role);
CREATE INDEX idx_users_active     ON users(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_deleted    ON users(deleted_at) WHERE deleted_at IS NULL;

-- Auto-update updated_at trigger function (reused by all tables)
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

COMMENT ON TABLE users IS 'Core user accounts — authenticated via Google OAuth';
COMMENT ON COLUMN users.deleted_at IS 'NULL = active; set to NOW() for soft delete (DPDP compliance)';
COMMENT ON COLUMN users.google_id IS 'Google sub claim from ID token';
