import { pool as connectionPool } from '../../index.js';
import { Pool } from '../../types/index.js';

const getPoolById = async (id: string): Promise<Pool | null> => {
  const { rows } = await connectionPool.query('SELECT * FROM pool WHERE id = $1', [id]);
  return rows.length > 0 ? rows[0] : null;
};

const getPoolsBySpotifyId = async (spotifyId: string): Promise<Pool[]> => {
  const { rows } = await connectionPool.query('SELECT * FROM pool WHERE spotify_id = $1', [spotifyId]);
  return rows;
};

const createPool = async (pool: Omit<Pool, 'id' | 'last_updated'>): Promise<Pool> => {
  const { spotify_id } = pool;
  const { rows } = await connectionPool.query(
    'INSERT INTO pool (spotify_id, last_updated) VALUES ($1, NOW()) RETURNING *',
    [spotify_id]
  );
  return rows[0];
};

const updatePool = async (id: string, pool: Partial<Omit<Pool, 'id' | 'last_updated'>>): Promise<Pool | null> => {
  const { spotify_id } = pool;
  const { rows } = await connectionPool.query(
    'UPDATE pool SET spotify_id = $1, last_updated = NOW() WHERE id = $4 RETURNING *',
    [spotify_id, id]
  );
  return rows.length > 0 ? rows[0] : null;
};

const deletePool = async (id: string): Promise<void> => {
  await connectionPool.query('DELETE FROM pool WHERE id = $1', [id]);
};

export {
  getPoolById,
  getPoolsBySpotifyId,
  createPool,
  updatePool,
  deletePool,
};