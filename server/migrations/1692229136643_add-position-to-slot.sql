-- Up Migration
ALTER TABLE slot ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
-- Down Migration