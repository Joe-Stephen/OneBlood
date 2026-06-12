-- ============================================================
-- Migration 011: Audit Logs
-- Description: Immutable admin action log (append-only)
-- ============================================================

CREATE TABLE audit_logs (
  id            UUID         NOT NULL DEFAULT uuid_generate_v4(),
  actor_id      UUID,                  -- NULL if system-generated
  actor_role    VARCHAR(50)  NOT NULL,
  action        VARCHAR(100) NOT NULL, -- e.g. USER_SUSPENDED, HOSPITAL_VERIFIED
  target_type   VARCHAR(100) NOT NULL, -- e.g. users, hospitals, blood_requests
  target_id     UUID,
  before_state  JSONB,                 -- row state before change
  after_state   JSONB,                 -- row state after change
  ip_address    INET,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_audit_logs      PRIMARY KEY (id),
  CONSTRAINT fk_audit_logs_actor
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Actor query (admin's own action history)
CREATE INDEX idx_audit_logs_actor
  ON audit_logs(actor_id, created_at DESC)
  WHERE actor_id IS NOT NULL;

-- Target query (all actions on a specific resource)
CREATE INDEX idx_audit_logs_target
  ON audit_logs(target_type, target_id, created_at DESC)
  WHERE target_id IS NOT NULL;

-- Action type query
CREATE INDEX idx_audit_logs_action
  ON audit_logs(action, created_at DESC);

-- Time-range query for reporting
CREATE INDEX idx_audit_logs_created_at
  ON audit_logs(created_at DESC);

-- ============================================================
-- Prevent UPDATE and DELETE on audit_logs (append-only)
-- ============================================================
CREATE OR REPLACE FUNCTION fn_deny_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only: UPDATE and DELETE are not permitted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deny_audit_log_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION fn_deny_audit_log_mutation();

CREATE TRIGGER trg_deny_audit_log_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION fn_deny_audit_log_mutation();

COMMENT ON TABLE audit_logs IS 'Immutable audit trail. UPDATE and DELETE blocked by trigger.';
COMMENT ON COLUMN audit_logs.actor_id IS 'NULL for system-generated events (e.g. scheduled expiry jobs).';
COMMENT ON COLUMN audit_logs.before_state IS 'Snapshot of relevant fields before the action. NULL for CREATE actions.';
COMMENT ON COLUMN audit_logs.after_state IS 'Snapshot of relevant fields after the action. NULL for DELETE actions.';
