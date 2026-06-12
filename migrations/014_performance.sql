-- ============================================================
-- Migration 014: Performance Tuning
-- Description: Autovacuum overrides and DB-level settings
--              for high-churn production tables
-- ============================================================

-- ============================================================
-- Autovacuum tuning — high-churn tables
-- Default scale_factor = 0.2 (20%) is too coarse for large tables
-- ============================================================

-- donor_profiles: frequent availability_status + location updates
ALTER TABLE donor_profiles SET (
  autovacuum_vacuum_scale_factor   = 0.01,
  autovacuum_analyze_scale_factor  = 0.005,
  autovacuum_vacuum_cost_delay     = 2
);

-- blood_requests: frequent status + units_fulfilled updates
ALTER TABLE blood_requests SET (
  autovacuum_vacuum_scale_factor   = 0.01,
  autovacuum_analyze_scale_factor  = 0.005,
  autovacuum_vacuum_cost_delay     = 2
);

-- notifications: high INSERT volume, status updates
ALTER TABLE notifications SET (
  autovacuum_vacuum_scale_factor   = 0.02,
  autovacuum_analyze_scale_factor  = 0.01
);

-- audit_logs: append-only, no UPDATE/DELETE bloat — autovacuum not critical
ALTER TABLE audit_logs SET (
  autovacuum_vacuum_scale_factor   = 0.1,
  autovacuum_vacuum_threshold      = 10000
);

-- ============================================================
-- Table storage settings
-- ============================================================

-- JSONB compression for audit_logs (before_state, after_state can be large)
ALTER TABLE audit_logs
  ALTER COLUMN before_state SET STORAGE EXTENDED,
  ALTER COLUMN after_state  SET STORAGE EXTENDED;

ALTER TABLE notifications
  ALTER COLUMN metadata SET STORAGE EXTENDED;

-- ============================================================
-- Connection limit recommendations (set in postgresql.conf)
-- Listed here as documentation for ops team
-- ============================================================
-- max_connections            = 200
-- shared_buffers             = 4GB          (25% of RAM on 16GB instance)
-- effective_cache_size       = 12GB
-- work_mem                   = 64MB         (per sort/hash operation)
-- maintenance_work_mem       = 1GB
-- random_page_cost           = 1.1          (SSD storage)
-- effective_io_concurrency   = 200          (SSD)
-- wal_buffers                = 64MB
-- checkpoint_completion_target = 0.9
-- default_statistics_target  = 100

-- ============================================================
-- Cluster donor_profiles by spatial index
-- Physically orders rows on disk by location — improves ST_DWithin
-- sequential scan cache hits. Run once after large initial import.
-- ============================================================
-- CLUSTER donor_profiles USING idx_donor_profiles_location;
-- ANALYZE donor_profiles;
-- (Commented out: must be run manually during maintenance window)

-- ============================================================
-- Partial index — recently donated (last 6 months)
-- Used by analytics: "active donor" definition
-- ============================================================
CREATE INDEX idx_donations_recent
  ON donations(donor_id, donated_at DESC)
  WHERE donated_at >= NOW() - INTERVAL '6 months';

-- ============================================================
-- Expression index — year/month for analytics grouping
-- ============================================================
CREATE INDEX idx_donations_month
  ON donations(DATE_TRUNC('month', donated_at));

CREATE INDEX idx_blood_requests_month
  ON blood_requests(DATE_TRUNC('month', created_at));

COMMENT ON INDEX idx_donations_recent      IS 'Supports "active donor in last 6 months" analytics queries';
COMMENT ON INDEX idx_donations_month       IS 'Supports monthly donation count analytics';
COMMENT ON INDEX idx_blood_requests_month  IS 'Supports monthly request count analytics';
