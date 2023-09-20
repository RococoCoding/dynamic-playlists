-- Up Migration
ALTER TABLE dp_user ADD COLUMN refresh_token VARCHAR(255) NULL;
-- Down Migration
ALTER TABLE dp_user DROP COLUMN refresh_token;
