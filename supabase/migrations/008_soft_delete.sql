-- Soft delete support for measurements and products.
-- Instead of hard deletes, rows are hidden by setting deleted_at.
-- All existing queries must filter WHERE deleted_at IS NULL.

ALTER TABLE measurements ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE products     ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Partial indexes to keep filtered queries fast
CREATE INDEX IF NOT EXISTS measurements_active_idx ON measurements (pool_id, measured_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS products_active_idx     ON products     (user_id, name ASC)         WHERE deleted_at IS NULL;
