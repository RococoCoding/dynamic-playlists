-- Up Migration
ALTER TABLE pool ADD COLUMN market VARCHAR(2);
-- Down Migration