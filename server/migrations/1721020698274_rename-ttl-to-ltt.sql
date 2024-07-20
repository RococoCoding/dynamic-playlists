-- Up Migration
ALTER TABLE "ttl" RENAME TO "ltt";
-- Down Migration
ALTER TABLE "ltt" RENAME TO "ttl";