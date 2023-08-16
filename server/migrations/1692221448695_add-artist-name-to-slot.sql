-- Up Migration
ALTER TABLE slot ADD COLUMN artist_name VARCHAR(255)[];
-- Down Migration
ALTER TABLE slot DROP COLUMN artist_name;