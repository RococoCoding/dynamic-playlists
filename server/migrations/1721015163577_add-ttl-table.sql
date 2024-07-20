-- Up Migration
CREATE TABLE "ttl" (
  "id" UUID PRIMARY KEY DEFAULT (gen_random_uuid()),
  "max_length" integer,
  "excluded_genres" varchar[],
  "after" varchar,
  "playlist" UUID,
  "dp_user" varchar
);
ALTER TABLE "ttl" ADD FOREIGN KEY ("playlist") REFERENCES "playlist" ("id");
ALTER TABLE "ttl" ADD FOREIGN KEY ("dp_user") REFERENCES "dp_user" ("id");
COMMENT ON COLUMN "ttl"."after" IS 'id of last viewed post in reddit';
-- Down Migration
DROP TABLE "ttl";