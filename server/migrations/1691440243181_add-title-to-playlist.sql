-- Up Migration
ALTER TABLE playlist ADD COLUMN title VARCHAR(255);
-- Down Migration