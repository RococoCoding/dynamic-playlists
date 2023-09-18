-- Up Migration
ALTER TABLE "pool"
ADD CONSTRAINT unique_spotify_id UNIQUE ("spotify_id");
-- Down Migration
ALTER TABLE "pool"
DROP CONSTRAINT unique_spotify_id;