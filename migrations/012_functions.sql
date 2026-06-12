-- ============================================================
-- Migration 012: Stored Functions
-- Description: Reusable SQL functions for core business logic
-- ============================================================

-- ============================================================
-- Function 1: find_matching_donors
-- Returns eligible donors ordered by proximity for a given request
-- ============================================================
CREATE OR REPLACE FUNCTION find_matching_donors(
  p_request_id    UUID,
  p_radius_meters INT DEFAULT 10000
)
RETURNS TABLE (
  donor_profile_id          UUID,
  user_id                   UUID,
  donor_name                VARCHAR,
  donor_phone               VARCHAR,
  blood_type                blood_type,
  distance_meters           FLOAT,
  last_donated_at           TIMESTAMPTZ,
  historical_acceptance_rate FLOAT
) AS $$
DECLARE
  v_blood_type    blood_type;
  v_location      GEOGRAPHY;
  v_compatible    blood_type[];
BEGIN
  SELECT br.blood_type, br.location_point
  INTO   v_blood_type, v_location
  FROM   blood_requests br
  WHERE  br.id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Blood request % not found', p_request_id;
  END IF;

  v_compatible := CASE v_blood_type
    WHEN 'O_NEG'  THEN ARRAY['O_NEG']::blood_type[]
    WHEN 'O_POS'  THEN ARRAY['O_NEG','O_POS']::blood_type[]
    WHEN 'A_NEG'  THEN ARRAY['O_NEG','A_NEG']::blood_type[]
    WHEN 'A_POS'  THEN ARRAY['O_NEG','O_POS','A_NEG','A_POS']::blood_type[]
    WHEN 'B_NEG'  THEN ARRAY['O_NEG','B_NEG']::blood_type[]
    WHEN 'B_POS'  THEN ARRAY['O_NEG','O_POS','B_NEG','B_POS']::blood_type[]
    WHEN 'AB_NEG' THEN ARRAY['O_NEG','A_NEG','B_NEG','AB_NEG']::blood_type[]
    WHEN 'AB_POS' THEN ARRAY['O_NEG','O_POS','A_NEG','A_POS','B_NEG','B_POS','AB_NEG','AB_POS']::blood_type[]
  END;

  RETURN QUERY
  SELECT
    dp.id                                                              AS donor_profile_id,
    u.id                                                               AS user_id,
    u.name                                                             AS donor_name,
    u.phone                                                            AS donor_phone,
    dp.blood_type,
    ST_Distance(dp.location_point, v_location)                        AS distance_meters,
    (SELECT d.donated_at FROM donations d
     WHERE d.donor_id = dp.id ORDER BY d.donated_at DESC LIMIT 1)     AS last_donated_at,
    COALESCE(
      (SELECT
         COUNT(*) FILTER (WHERE dr2.action = 'ACCEPTED')::FLOAT /
         NULLIF(COUNT(*), 0)
       FROM donor_responses dr2
       WHERE dr2.donor_id = dp.id),
      0.5
    )                                                                  AS historical_acceptance_rate
  FROM donor_profiles dp
  JOIN users u ON u.id = dp.user_id
  WHERE
    dp.availability_status = 'ACTIVE'
    AND dp.is_eligible = TRUE
    AND u.is_active = TRUE
    AND u.deleted_at IS NULL
    AND dp.blood_type = ANY(v_compatible)
    AND ST_DWithin(dp.location_point, v_location, p_radius_meters)
    AND NOT EXISTS (
      SELECT 1 FROM donor_responses dr
      WHERE dr.donor_id = dp.id AND dr.request_id = p_request_id
    )
  ORDER BY distance_meters ASC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- Function 2: reset_eligible_donors
-- Called by scheduled job — reactivates donors post-cooldown
-- ============================================================
CREATE OR REPLACE FUNCTION reset_eligible_donors()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE donor_profiles
  SET
    availability_status = 'ACTIVE',
    is_eligible         = TRUE,
    updated_at          = NOW()
  WHERE
    availability_status = 'ON_COOLDOWN'
    AND next_eligible_date <= CURRENT_DATE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Function 3: expire_open_requests
-- Called by scheduled job — closes timed-out requests
-- ============================================================
CREATE OR REPLACE FUNCTION expire_open_requests()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE blood_requests
  SET
    status     = 'EXPIRED',
    updated_at = NOW()
  WHERE
    status     = 'OPEN'
    AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Function 4: get_donor_stats
-- Summary stats for a donor's profile page
-- ============================================================
CREATE OR REPLACE FUNCTION get_donor_stats(p_donor_profile_id UUID)
RETURNS TABLE (
  total_donations   BIGINT,
  total_units       BIGINT,
  last_donated_at   TIMESTAMPTZ,
  next_eligible_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT               AS total_donations,
    SUM(units_donated)::BIGINT     AS total_units,
    MAX(donated_at)                AS last_donated_at,
    dp.next_eligible_date
  FROM donations d
  JOIN donor_profiles dp ON dp.id = d.donor_id
  WHERE d.donor_id = p_donor_profile_id
  GROUP BY dp.next_eligible_date;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_matching_donors IS 'Core matching engine query. Full ABO+Rh compatibility embedded. Use ST_DWithin for GiST index utilization.';
COMMENT ON FUNCTION reset_eligible_donors IS 'Run daily via cron/Bull job. Returns count of donors reactivated.';
COMMENT ON FUNCTION expire_open_requests  IS 'Run hourly via cron/Bull job. Returns count of requests expired.';
