-- ============================================================
-- Migration 001: Extensions
-- Description: Install required PostgreSQL extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- UUID generation
CREATE EXTENSION IF NOT EXISTS "postgis";       -- Geospatial support
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Trigram fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gist";    -- GiST indexes on scalar types
