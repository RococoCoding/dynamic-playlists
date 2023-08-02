-- This migration deletes the columns that are no longer needed from the user table and modifies the id column to be varchar (spotify id)

-- Delete the columns that are no longer needed
ALTER TABLE "user" DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS market,
DROP COLUMN IF EXISTS "password",
DROP COLUMN IF EXISTS spotify_id;

-- Drop foreign key constraints since we're changing the id column type
ALTER TABLE "playlist" DROP CONSTRAINT IF EXISTS playlist_created_by_fkey;
ALTER TABLE "playlist" DROP CONSTRAINT IF EXISTS playlist_last_updated_by_fkey;
ALTER TABLE "playlist_editor" DROP CONSTRAINT IF EXISTS playlist_editor_editor_id_fkey;
ALTER TABLE "playlist_editor" DROP CONSTRAINT IF EXISTS playlist_editor_playlist_id_fkey;

-- Modify the id column of the user table to be varchar
ALTER TABLE "user" ALTER COLUMN "id" TYPE varchar(255);
ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;

-- Modify the foreign keys to reference the new id column
ALTER TABLE "playlist" ALTER COLUMN "created_by" TYPE varchar(255);
ALTER TABLE "playlist" ADD FOREIGN KEY ("created_by") REFERENCES "user" ("id");
ALTER TABLE "playlist" ALTER COLUMN "last_updated_by" TYPE varchar(255);
ALTER TABLE "playlist" ADD FOREIGN KEY ("last_updated_by") REFERENCES "user" ("id");
ALTER TABLE "playlist_editor" ALTER COLUMN "editor_id" TYPE varchar(255);
ALTER TABLE "playlist_editor" ADD FOREIGN KEY ("editor_id") REFERENCES "user" ("id");