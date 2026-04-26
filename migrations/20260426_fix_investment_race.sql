-- Prevent duplicate investments (same investor + project)
-- If constraint already exists, this is idempotent
ALTER TABLE investments
ADD CONSTRAINT unique_investor_per_project
UNIQUE (investor_id, project_id);
