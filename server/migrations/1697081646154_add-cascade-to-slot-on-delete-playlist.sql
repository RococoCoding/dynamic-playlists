-- Up Migration
ALTER TABLE slot
DROP CONSTRAINT slot_playlist_id_fkey,
ADD CONSTRAINT slot_playlist_id_fkey
FOREIGN KEY (playlist_id)
REFERENCES playlist(id)
ON DELETE CASCADE;
-- Down Migration
ALTER TABLE slot
DROP CONSTRAINT slot_playlist_id_fkey,
ADD CONSTRAINT slot_playlist_id_fkey
FOREIGN KEY (playlist_id)
REFERENCES playlist(id);