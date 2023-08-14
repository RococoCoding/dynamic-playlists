-- Up Migration
CREATE UNIQUE INDEX playlist_title_created_by_idx ON playlist (title, created_by);
-- Down Migration
DROP INDEX IF EXISTS playlist_title_created_by_idx;