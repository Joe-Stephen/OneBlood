-- ============================================================
-- Migration 006: Hospitals
-- Description: Partner hospitals and blood banks
-- ============================================================

CREATE TABLE hospitals (
  id                    UUID                  NOT NULL DEFAULT uuid_generate_v4(),
  name                  VARCHAR(255)          NOT NULL,
  registration_number   VARCHAR(100)          NOT NULL,
  contact_email         VARCHAR(320)          NOT NULL,
  contact_phone         VARCHAR(15)           NOT NULL,
  location_point        GEOGRAPHY(POINT, 4326) NOT NULL,
  address               TEXT                  NOT NULL,
  city                  VARCHAR(100)          NOT NULL,
  state                 VARCHAR(100)          NOT NULL,
  pincode               VARCHAR(10)           NOT NULL,
  verification_status   verification_status   NOT NULL DEFAULT 'PENDING',
  verified_by           UUID,
  verified_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ           NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_hospitals                   PRIMARY KEY (id),
  CONSTRAINT uq_hospitals_registration      UNIQUE (registration_number),
  CONSTRAINT fk_hospitals_verified_by
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_hospitals_pincode          CHECK (pincode ~ '^[0-9]{6}$'),
  CONSTRAINT chk_hospitals_phone            CHECK (contact_phone ~ '^\+?[0-9]{10,15}$'),
  CONSTRAINT chk_hospitals_verified_at      CHECK (
    (verification_status = 'VERIFIED' AND verified_at IS NOT NULL)
    OR (verification_status != 'VERIFIED')
  )
);

-- Spatial index for proximity queries
CREATE INDEX idx_hospitals_location
  ON hospitals USING GIST(location_point);

-- Partial index — only verified hospitals used in active matching
CREATE INDEX idx_hospitals_verified
  ON hospitals(city, state)
  WHERE verification_status = 'VERIFIED';

-- Trigram index for name search (admin panel)
CREATE INDEX idx_hospitals_name_trgm
  ON hospitals USING GIN(name gin_trgm_ops);

CREATE TRIGGER trg_hospitals_updated_at
  BEFORE UPDATE ON hospitals
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

COMMENT ON TABLE hospitals IS 'Verified partner hospitals and blood banks';
COMMENT ON COLUMN hospitals.verified_by IS 'Admin user who approved the hospital registration';
