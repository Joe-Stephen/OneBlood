-- ============================================================
-- Migration 007: Blood Requests
-- Description: Blood requests raised by users or hospitals
-- ============================================================

CREATE TABLE blood_requests (
  id               UUID           NOT NULL DEFAULT uuid_generate_v4(),
  requester_id     UUID           NOT NULL,
  hospital_id      UUID,
  blood_type       blood_type     NOT NULL,
  units_required   SMALLINT       NOT NULL,
  units_fulfilled  SMALLINT       NOT NULL DEFAULT 0,
  location_point   GEOGRAPHY(POINT, 4326) NOT NULL,
  urgency_level    urgency_level  NOT NULL DEFAULT 'NORMAL',
  status           request_status NOT NULL DEFAULT 'OPEN',
  contact_name     VARCHAR(255)   NOT NULL,
  contact_phone    VARCHAR(15)    NOT NULL,
  notes            TEXT,
  expires_at       TIMESTAMPTZ    NOT NULL,
  fulfilled_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_blood_requests          PRIMARY KEY (id),
  CONSTRAINT fk_blood_requests_requester
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_blood_requests_hospital
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
  CONSTRAINT chk_units_required         CHECK (units_required >= 1 AND units_required <= 20),
  CONSTRAINT chk_units_fulfilled        CHECK (
    units_fulfilled >= 0 AND units_fulfilled <= units_required
  ),
  CONSTRAINT chk_expires_after_created  CHECK (expires_at > created_at),
  CONSTRAINT chk_contact_phone          CHECK (contact_phone ~ '^\+?[0-9]{10,15}$'),
  CONSTRAINT chk_fulfilled_at           CHECK (
    (status = 'FULFILLED' AND fulfilled_at IS NOT NULL)
    OR status != 'FULFILLED'
  )
);

-- Spatial index — used by matching engine ST_DWithin
CREATE INDEX idx_blood_requests_location
  ON blood_requests USING GIST(location_point);

-- Partial index — only OPEN requests queried by matching + public listing
CREATE INDEX idx_blood_requests_open
  ON blood_requests(blood_type, urgency_level, created_at DESC)
  WHERE status = 'OPEN';

-- Expiry job index — find requests that should be closed
CREATE INDEX idx_blood_requests_expiry
  ON blood_requests(expires_at, status)
  WHERE status = 'OPEN';

-- Requester's own requests
CREATE INDEX idx_blood_requests_requester
  ON blood_requests(requester_id, created_at DESC);

-- Hospital's requests
CREATE INDEX idx_blood_requests_hospital
  ON blood_requests(hospital_id, created_at DESC)
  WHERE hospital_id IS NOT NULL;

CREATE TRIGGER trg_blood_requests_updated_at
  BEFORE UPDATE ON blood_requests
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

COMMENT ON TABLE blood_requests IS 'Blood donation requests. status transitions: OPEN → PARTIALLY_MATCHED → FULFILLED | EXPIRED | CANCELLED';
COMMENT ON COLUMN blood_requests.location_point IS 'Hospital or patient location. Used for PostGIS radius search.';
COMMENT ON COLUMN blood_requests.units_fulfilled IS 'Incremented by trigger on donations insert.';
