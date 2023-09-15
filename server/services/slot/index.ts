import { pool } from '../../index.js';
import { Slot } from '../../types/index.js';

const getSlotById = async (id: string): Promise<Slot | null> => {
  const { rows } = await pool.query(
    `SELECT *
     FROM slot
     WHERE id = $1`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

const getSlotsByPlaylistId = async (playlistId: string): Promise<Slot[]> => {
  const { rows } = await pool.query(
    `SELECT *
     FROM slot
     WHERE playlist_id = $1`,
    [playlistId]
  );
  return rows;
};

const createSlot = async (slot: Omit<Slot, 'id'>): Promise<Slot> => {
  const { type, name, playlist_id, artist_name, position } = slot;
  const { rows } = await pool.query(
    `INSERT INTO slot (type, name, playlist_id, artist_name, position)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [type, name, playlist_id, artist_name, position]
  );
  return rows[0];
};

const updateSlot = async (id: string, slot: Partial<Omit<Slot, 'id' | 'created_at' | 'created_by'>>): Promise<Slot | null> => {
  const { type, name, pool_id } = slot;
  const { rows } = await pool.query(
    `UPDATE slot
     SET title = COALESCE($1, type),
         spotify_id = COALESCE($2, name),
         pool_id = COALESCE($3, pool_id),
     WHERE id = $4
     RETURNING *`,
    [type, name, pool_id, id]
  );
  return rows.length > 0 ? rows[0] : null;
};

const deleteSlot = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM slot WHERE id = $1', [id]);
};

export {
  getSlotById,
  getSlotsByPlaylistId,
  createSlot,
  updateSlot,
  deleteSlot,
};