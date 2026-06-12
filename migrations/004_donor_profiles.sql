-- ============================================================
-- Migration 004: Donor Profiles
-- Description: Donor-specific data including PostGIS location
-- ============================================================

CREATE TABLE donor_profiles (
  id                        UUID                NOT NULL DEFAULT uuid_generate_v4(),
  user_id                   UUID                NOT NULL,
  blood_type                blood_type          NOT NULL,
  weight_kg                 SMALLINT            NOT NULL,
  date_of_birth             DATE                NOT NULL,
  location_point            GEOGRAPHY(POINT, 4326),          -- WGS84 lat/lon
  city                      VARCHAR(100)        NOT NULL,
  state                     VARCHAR(100)        NOT NULL,
  availability_status       availability_status NOT NULL DEFAULT 'ACTIVE',
  next_eligible_date        DATE,
  is_eligible               BOOLEAN             NOT NULL DEFAULT TRUE,
  last_location_updated_at  TIMESTAMPTZ,
  created_at                TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

  -- Keys
  CONSTRAINT pk_donor_profiles     PRIMARY KEY (id),
  CONSTRAINT uq_donor_profiles_user UNIQUE (user_id),
  CONSTRAINT fk_donor_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  -- Business rules
  CONSTRAINT chk_weight CHECK (
    weight_kg >= 45 AND weight_kg <= 300
  ),
  CONSTRAINT chk_age CHECK (
    date_of_birth <= (CURRENT_DATE - INTERVAL '18 years')
    AND date_of_birth >= (CURRENT_DATE - INTERVAL '65 years')
  ),
  CONSTRAINT chk_next_eligible_date CHECK (
    next_eligible_date IS NULL OR next_eligible_date >= '2020-01-01'
  )
);

-- Spatial index (GiST) — critical for ST_DWithin performance
CREATE INDEX idx_donor_profiles_location
  ON donor_profiles USING GIST(location_point);

-- Partial composite index — only active eligible donors (used by matching engine)
CREATE INDEX idx_donor_profiles_active_eligible
  ON donor_profiles(blood_type, availability_status)
  WHERE availability_status = 'ACTIVE' AND is_eligible = TRUE;

-- User lookup
CREATE INDEX idx_donor_profiles_user_id ON donor_profiles(user_id);

-- City/state lookup for admin search
CREATE INDEX idx_donor_profiles_city_state ON donor_profiles(city, state);

-- Trigger
CREATE TRIGGER trg_donor_profiles_updated_at
  BEFORE UPDATE ON donor_profiles
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

COMMENT ON TABLE donor_profiles IS 'Extended profile for DONOR role users';
COMMENT ON COLUMN donor_profiles.location_point IS 'PostGIS GEOGRAPHY point, SRID 4326. Never exposed to clients — only distance shown.';
COMMENT ON COLUMN donor_profiles.next_eligible_date IS 'Set by trigger on donation insert. NULL = never donated.';
COMMENT ON COLUMN donor_profiles.is_eligible IS 'FALSE if health-disqualified by admin, else determined by cooldown.';
