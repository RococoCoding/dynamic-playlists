import { pool } from '../../index.js';
import { Slot } from '../../types/index.js';
import { upsertPool } from '../pool/index.js';

const getSlotById = async (id: string): Promise<Slot | null> => {
  const { rows } = await pool.query(
    `SELECT slot.*, pool.last_updated AS pool_last_updated, pool.id AS pool_id, pool.spotify_id AS pool_spotify_id
     FROM slot
     JOIN pool ON slot.pool_id = pool.id
     WHERE slot.id = $1`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

const getSlotsByPlaylistId = async (playlistId: string): Promise<Slot[]> => {
  const { rows } = await pool.query(
    `SELECT slot.*, pool.last_updated AS pool_last_updated, pool.id AS pool_id, pool.spotify_id AS pool_spotify_id
     FROM slot
     LEFT JOIN pool ON slot.pool_id = pool.id
     WHERE slot.playlist_id = $1`,
    [playlistId]
  );
  return rows;
};

const createSlot = async (slot: Omit<Slot, 'id'>, spotify_id: string): Promise<Slot> => {
  const { type, name, playlist_id, artist_name, position } = slot;
  // TODO: transactions
  const { id: pool_id } = await upsertPool({ spotify_id });
  const { rows } = await pool.query(
    `WITH inserted AS (
      INSERT INTO slot (type, name, playlist_id, artist_name, position, pool_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
     )
     SELECT inserted.*, pool.last_updated AS pool_last_updated, pool.id AS pool_id, pool.spotify_id AS pool_spotify_id
     FROM inserted
     INNER JOIN pool ON inserted.pool_id = pool.id`,
    [type, name, playlist_id, artist_name, position, pool_id]
  );
  return rows[0];
};

const updateSlot = async (id: string, slot: Partial<Omit<Slot, 'id' | 'created_at' | 'created_by'>>, spotify_id: string): Promise<Slot | null> => {
  const { type, name, artist_name, position, current_track, pool_id } = slot;
  let poolId = pool_id;
  if (spotify_id) {
    const { id } = await upsertPool({ spotify_id });
    poolId = id;
  }
    const { rows } = await pool.query(
    `UPDATE slot
     SET type = COALESCE($1, type),
         name = COALESCE($2, name),
         artist_name = COALESCE($3, artist_name),
         pool_id = COALESCE($4, pool_id),
         position = COALESCE($5, position),
         current_track = COALESCE($6, current_track)
     WHERE id = $7
     RETURNING *;`,
    [type, name, artist_name, poolId, position, current_track, id]
  );
  return rows.length > 0 ? {...rows[0], id } : null;
};

const deleteSlot = async (id: string, returnAll?: boolean): Promise<void | Array<Slot>> => {
  const deletedSlot = await pool.query('DELETE FROM slot WHERE id = $1 RETURNING *', [id]);
  if (returnAll) {
    const remainingSlots = await pool.query('SELECT * FROM slot WHERE playlist_id = $1', [deletedSlot.rows[0].playlist_id]);
    return remainingSlots.rows;
  }
};

const updateManySlots = async (slots: Array<Slot>): Promise<Array<Slot>> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updatePromises = slots.map((slot) => {
      const query = `
        UPDATE slot
        SET type = COALESCE($1, slot.type),
            name = COALESCE($2, slot.name),
            artist_name = COALESCE($3, slot.artist_name),
            pool_id = COALESCE($4, slot.pool_id),
            position = COALESCE($5, slot.position),
            current_track = COALESCE($6, slot.current_track)
        WHERE slot.id = $7
        RETURNING *;
      `;
      const values = [slot.type, slot.name, slot.artist_name, slot.pool_id, slot.position, slot.current_track, slot.id];
      return client.query(query, values);
    });
    const results = await Promise.all(updatePromises);
    await client.query('COMMIT');
    return results.map(result => result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  } 
};

export {
  getSlotById,
  getSlotsByPlaylistId,
  createSlot,
  updateSlot,
  updateManySlots,
  deleteSlot,
};