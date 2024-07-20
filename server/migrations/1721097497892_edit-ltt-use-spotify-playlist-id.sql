-- Up Migration
ALTER TABLE ltt DROP CONSTRAINT ttl_playlist_fkey;
ALTER TABLE ltt ALTER COLUMN playlist TYPE VARCHAR(255);
-- Down Migration
ALTER TABLE ltt ADD FOREIGN KEY (playlist) REFERENCES playlist (id);
ALTER TABLE ltt ALTER COLUMN playlist TYPE UUID;