import { pool as connectionPool } from '../../index.js';
import { Pool } from '../../types/index.js';

const getPoolById = async (id: string): Promise<Pool | null> => {
  const { rows } = await connectionPool.query('SELECT * FROM pool WHERE id = $1', [id]);
  return rows.length > 0 ? rows[0] : null;
};

const getPoolBySpotifyId = async (spotifyId: string, market: string): Promise<Pool[]> => {
  const { rows } = await connectionPool.query(
    `SELECT pool.*, pool_track.*
    FROM pool
    LEFT JOIN pool_track
    ON pool.id = pool_track.pool_id
    WHERE pool.spotify_id = $1 AND pool.market = $2`
  ,
  [spotifyId, market]);
  return rows;
};

const upsertPool = async (pool: Omit<Pool, 'id' | 'last_updated'>): Promise<Pool> => {
  const { spotify_id } = pool;
  const { rows: poolRows } = await connectionPool.query(
    `SELECT *
     FROM pool
     WHERE spotify_id = $1`,
    [spotify_id]
  );
  if (poolRows[0]) {
    return poolRows[0];
  }
  const { rows } = await connectionPool.query(
    `INSERT INTO pool (spotify_id)
    VALUES ($1)
    ON CONFLICT (spotify_id)
    DO NOTHING
    RETURNING *`,
    [spotify_id]
  );
  return rows[0];
};

// set last_updated to current time so we can determine when to refresh the pool
const setPoolLastUpdated = async (id: string): Promise<Pool | null> => {
  const { rows } = await connectionPool.query(
    `UPDATE pool SET last_updated = NOW()
    WHERE id = $1
    RETURNING *`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

const deletePool = async (id: string): Promise<void> => {
  await connectionPool.query('DELETE FROM pool WHERE id = $1', [id]);
};

export {
  getPoolById,
  getPoolBySpotifyId,
  upsertPool,
  setPoolLastUpdated,
  deletePool,
};