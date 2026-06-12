-- ============================================================
-- Migration 009: Donations
-- Description: Completed donation records + cooldown triggers
-- ============================================================

CREATE TABLE donations (
  id                  UUID           NOT NULL DEFAULT uuid_generate_v4(),
  donor_id            UUID           NOT NULL,  -- donor_profiles.id
  request_id          UUID,                     -- NULL for walk-in donations
  hospital_id         UUID,
  donation_type       donation_type  NOT NULL DEFAULT 'WHOLE_BLOOD',
  units_donated       SMALLINT       NOT NULL DEFAULT 1,
  donated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  next_eligible_date  DATE           NOT NULL,
  notes               TEXT,
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_donations           PRIMARY KEY (id),
  CONSTRAINT fk_donations_donor
    FOREIGN KEY (donor_id) REFERENCES donor_profiles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_donations_request
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE SET NULL,
  CONSTRAINT fk_donations_hospital
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
  CONSTRAINT chk_units_donated      CHECK (units_donated >= 1 AND units_donated <= 10),
  CONSTRAINT chk_donated_not_future CHECK (donated_at <= NOW() + INTERVAL '1 hour'),
  CONSTRAINT chk_next_eligible      CHECK (next_eligible_date > donated_at::DATE)
);

-- Most recent donation per donor (used in eligibility checks)
CREATE INDEX idx_donations_donor_date
  ON donations(donor_id, donated_at DESC);

-- Request-level donation lookup
CREATE INDEX idx_donations_request
  ON donations(request_id)
  WHERE request_id IS NOT NULL;

-- ============================================================
-- Trigger 1: Apply cooldown to donor after donation
-- ============================================================
CREATE OR REPLACE FUNCTION fn_apply_donation_cooldown()
RETURNS TRIGGER AS $$
DECLARE
  v_cooldown_days INT;
BEGIN
  v_cooldown_days := CASE NEW.donation_type
    WHEN 'WHOLE_BLOOD'       THEN 90
    WHEN 'PLATELETS'         THEN 14
    WHEN 'PLASMA'            THEN 28
    WHEN 'DOUBLE_RED_CELLS'  THEN 112
    ELSE 90
  END;

  UPDATE donor_profiles
  SET
    availability_status      = 'ON_COOLDOWN',
    next_eligible_date       = (NEW.donated_at::DATE + v_cooldown_days),
    is_eligible              = FALSE,
    updated_at               = NOW()
  WHERE id = NEW.donor_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_apply_donation_cooldown
  AFTER INSERT ON donations
  FOR EACH ROW
  EXECUTE FUNCTION fn_apply_donation_cooldown();

-- ============================================================
-- Trigger 2: Update blood_request fulfillment on donation
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_request_fulfillment()
RETURNS TRIGGER AS $$
DECLARE
  v_new_fulfilled SMALLINT;
  v_required      SMALLINT;
BEGIN
  IF NEW.request_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT units_required, units_fulfilled + NEW.units_donated
  INTO v_required, v_new_fulfilled
  FROM blood_requests
  WHERE id = NEW.request_id;

  UPDATE blood_requests
  SET
    units_fulfilled = v_new_fulfilled,
    status = CASE
      WHEN v_new_fulfilled >= v_required THEN 'FULFILLED'::request_status
      WHEN v_new_fulfilled > 0           THEN 'PARTIALLY_MATCHED'::request_status
      ELSE status
    END,
    fulfilled_at = CASE
      WHEN v_new_fulfilled >= v_required THEN NOW()
      ELSE fulfilled_at
    END,
    updated_at = NOW()
  WHERE id = NEW.request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_request_fulfillment
  AFTER INSERT ON donations
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_request_fulfillment();

COMMENT ON TABLE donations IS 'Completed donation records. INSERT triggers cooldown on donor_profiles and updates blood_requests.units_fulfilled.';
COMMENT ON COLUMN donations.request_id IS 'NULL for walk-in / externally logged donations.';
COMMENT ON COLUMN donations.next_eligible_date IS 'Pre-computed by application before INSERT; verified by trigger.';
