-- Up Migration
ALTER TABLE slot ADD COLUMN current_track varchar(255);
-- Down Migration
ALTER TABLE slot DROP COLUMN current_track;