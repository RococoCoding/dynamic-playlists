import { pool } from '../../index';
import { Slot, SlotInput } from '../../types/index';
import {
  validateCreateSlotInput,
  validateUpdateSlotInput,
  validateStringId,
  validateUUID
} from '../../utils';
import { upsertPool } from '../pool/index';
import assert = require('node:assert');
import {
  createSlotQuery,
  deleteSlotQuery,
  getSlotByIdQuery,
  getSlotsByPlaylistIdQuery,
  updateManySlotsQuery,
  updateSlotQuery,
} from '../queries';

const createSlot = async (slot: SlotInput, spotify_id: string): Promise<Slot> => {
  validateStringId(spotify_id);
  validateCreateSlotInput(slot);
  const { type, name, playlist_id, artist_name, position } = slot;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id: pool_id } = await upsertPool({ spotify_id }, client);
    assert(pool_id, 'Pool id not returned');
    const { rows } = await client.query(createSlotQuery, [type, name, playlist_id, artist_name, position, pool_id]);
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const deleteSlot = async (id: string): Promise<Slot> => {
  validateUUID(id);
  const { rows } = await pool.query(deleteSlotQuery, [id]);
  assert(rows.length > 0, 'Deleted slot not found');
  return rows[0]
};

const getSlotById = async (id: string): Promise<Slot | undefined> => {
  validateUUID(id);
  const { rows } = await pool.query(getSlotByIdQuery, [id]);
  assert(rows.length <= 1, 'More than one slot found');
  return rows[0];
};

const getSlotsByPlaylistId = async (playlistId: string): Promise<Slot[]> => {
  validateUUID(playlistId);
  const { rows } = await pool.query(getSlotsByPlaylistIdQuery, [playlistId]);
  return rows;
};

const updateManySlots = async (slots: Array<Slot>): Promise<Array<Slot>> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updatePromises = slots.map((slot) => {
      validateUpdateSlotInput(slot);
      const values = [slot.type, slot.name, slot.artist_name, slot.pool_id, slot.position, slot.current_track, slot.id];
      return client.query(updateManySlotsQuery, values);
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

const updateSlot = async (id: string, slot: SlotInput, spotify_id: string): Promise<Slot | null> => {
  validateUUID(id);
  validateStringId(spotify_id);
  validateUpdateSlotInput(slot);
  const { type, name, artist_name, position, current_track, pool_id } = slot;
  let poolId = pool_id;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (spotify_id) {
      const { id: returnedPoolId } = await upsertPool({ spotify_id }, client);
      poolId = returnedPoolId;
    }
    assert(poolId, 'Missing pool id');
    const { rows } = await client.query(updateSlotQuery, [type, name, artist_name, poolId, position, current_track, id]);
    await client.query('COMMIT');
    return rows.length > 0 ? {...rows[0], id } : null;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export {
  createSlot,
  deleteSlot,
  getSlotById,
  getSlotsByPlaylistId,
  updateManySlots,
  updateSlot,
};