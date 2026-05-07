-- Performance indexes for common query patterns

-- Measurement history ordered by date (used in charts and history lists)
CREATE INDEX IF NOT EXISTS measurements_measured_at_idx
  ON measurements (pool_id, measured_at DESC);

-- Task urgency ordering (used in task list and TasksPreview)
CREATE INDEX IF NOT EXISTS tasks_next_due_idx
  ON tasks (user_id, next_due ASC);

-- Application history ordered by date (used in ApplicationsReport)
CREATE INDEX IF NOT EXISTS product_applications_applied_at_idx
  ON product_applications (user_id, applied_at DESC);
