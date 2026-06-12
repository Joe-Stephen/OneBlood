-- ============================================================
-- Migration 013: Row Level Security
-- Description: RLS policies for data isolation
-- ============================================================

-- Enable RLS
ALTER TABLE donor_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_responses  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- App service role — bypasses RLS (enforces auth in app layer)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'oneblood_app') THEN
    CREATE ROLE oneblood_app LOGIN;
  END IF;
END $$;

GRANT CONNECT ON DATABASE postgres TO oneblood_app;
GRANT USAGE ON SCHEMA public TO oneblood_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO oneblood_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO oneblood_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO oneblood_app;
ALTER ROLE oneblood_app BYPASSRLS;

-- ============================================================
-- Read-only reporting role (analytics, exports)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'oneblood_readonly') THEN
    CREATE ROLE oneblood_readonly LOGIN;
  END IF;
END $$;

GRANT CONNECT ON DATABASE postgres TO oneblood_readonly;
GRANT USAGE ON SCHEMA public TO oneblood_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO oneblood_readonly;
GRANT EXECUTE ON FUNCTION get_donor_stats TO oneblood_readonly;

-- ============================================================
-- RLS Policies (applied when using non-bypass roles in future)
-- ============================================================

-- Donors see only their own profile
CREATE POLICY policy_donor_profiles_self
  ON donor_profiles
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

-- Donors see only their own donations
CREATE POLICY policy_donations_self
  ON donations
  FOR ALL
  USING (donor_id IN (
    SELECT id FROM donor_profiles
    WHERE user_id = current_setting('app.current_user_id', TRUE)::UUID
  ));

-- Users see only their own notifications
CREATE POLICY policy_notifications_self
  ON notifications
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

-- Donors see only their own responses
CREATE POLICY policy_donor_responses_self
  ON donor_responses
  FOR ALL
  USING (donor_id IN (
    SELECT id FROM donor_profiles
    WHERE user_id = current_setting('app.current_user_id', TRUE)::UUID
  ));

COMMENT ON ROLE oneblood_app IS 'Application service role. Bypasses RLS — auth enforced at API layer.';
COMMENT ON ROLE oneblood_readonly IS 'Read-only analytics role for reporting tools.';
