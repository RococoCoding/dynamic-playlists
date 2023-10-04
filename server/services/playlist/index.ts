import { pool } from '../../index.js';
import { Playlist, PlaylistWithSlots } from '../../types/index.js';
import { getSlotsByPlaylistId } from '../slot/index.js';

const getPlaylistById = async (id: string): Promise<Playlist | null> => {
  const { rows } = await pool.query(
    `SELECT *
     FROM playlist
     WHERE id = $1`,
    [id]
  );
  return rows[0];
};

const getPlaylistsByUserId = async (userId: string): Promise<Playlist[]> => {
  const { rows } = await pool.query(
    `SELECT *
     FROM playlist
     WHERE created_by = $1`,
    [userId]
  );
  return rows;
};

const getPlaylistBySpotifyId = async (spotifyId: string): Promise<PlaylistWithSlots> => {
  const { rows: playlist } = await pool.query(
    `SELECT *
     FROM playlist
     WHERE spotify_id = $1`,
    [spotifyId]
  );
  const slots = await getSlotsByPlaylistId(playlist[0].id);
  return { ...playlist[0], slots };
};

const createPlaylist = async (playlist: Omit<Playlist, 'id' | 'created_at' | 'last_updated'>): Promise<Playlist> => {
  const { title, created_by, last_updated_by } = playlist;
  const { rows } = await pool.query(
    `INSERT INTO playlist (title, created_by, last_updated_by)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [title, created_by, last_updated_by]
  );
  const playlistRow = rows[0];
  await pool.query(
    `INSERT INTO playlist_editor (playlist_id, editor_id)
    VALUES ($1, $2)`,
    [playlistRow.id, created_by]
  );
  return playlistRow;
};

const updatePlaylist = async (id: string, playlist: Partial<Omit<Playlist, 'id' | 'created_at' | 'created_by'>>): Promise<Playlist | null> => {
  const { title, spotify_id, last_updated_by } = playlist;
  const { rows } = await pool.query(
    `UPDATE playlist
     SET title = COALESCE($1, title),
         spotify_id = COALESCE($2, spotify_id),
         last_updated_by = $3,
         last_updated = NOW()
     WHERE id = $4
     RETURNING *`,
    [title, spotify_id, last_updated_by, id]
  );
  const playlistRow = rows[0];
  if (!playlistRow) throw new Error('Possible error updating. Updated playlist not returned.');
  try {
    await pool.query(
      `INSERT INTO playlist_editor (playlist_id, editor_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [playlistRow.id, last_updated_by]
    );
  } catch (e) {
    console.log('Error updating playlist_editor: ', e);
  }
  return playlistRow;
};

const deletePlaylist = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM playlist WHERE id = $1', [id]);
};

export {
  getPlaylistById,
  getPlaylistsByUserId,
  getPlaylistBySpotifyId,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
};