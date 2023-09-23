-- Up Migration
ALTER TABLE pool_track
RENAME COLUMN spotify_artist_id TO spotify_artist_ids;

ALTER TABLE pool_track
ALTER COLUMN spotify_artist_ids TYPE varchar[] USING ARRAY[spotify_artist_ids];

-- Down Migration
ALTER TABLE pool_track
ALTER COLUMN spotify_artist_ids TYPE varchar USING array_to_string(spotify_artist_ids, ',');

ALTER TABLE pool_track
RENAME COLUMN spotify_artist_ids TO spotify_artist_id;