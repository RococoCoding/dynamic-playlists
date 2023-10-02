-- Up Migration: Pools now must have a spotify_id and if we delete a pool, we delete the slot related to it as well
ALTER TABLE slot DROP CONSTRAINT slot_pool_id_fkey;
ALTER TABLE slot ADD CONSTRAINT slot_pool_id_fkey FOREIGN KEY (pool_id) REFERENCES pool(id) ON DELETE CASCADE;
DELETE FROM pool WHERE spotify_id IS NULL;
ALTER TABLE pool ALTER COLUMN spotify_id SET NOT NULL;
-- Down Migration
ALTER TABLE pool ALTER COLUMN spotify_id DROP NOT NULL;
ALTER TABLE slot DROP CONSTRAINT slot_pool_id_fkey;
ALTER TABLE slot ADD CONSTRAINT slot_pool_id_fkey FOREIGN KEY (pool_id) REFERENCES pool(id);