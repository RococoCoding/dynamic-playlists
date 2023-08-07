import { pool } from '../../index.js';
import { Playlist } from '../../types/index.js';

const getPlaylistById = async (id: string): Promise<Playlist | null> => {
  const { rows } = await pool.query(
    `SELECT playlist.*, slots.*
     FROM playlist
     JOIN slot ON playlist.id = slot.playlist_id
     WHERE playlist.id = $1`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

const getPlaylistsByUserId = async (userId: string): Promise<Playlist[]> => {
  const { rows } = await pool.query(
    `SELECT playlist.*, slots.*
     FROM playlist
     JOIN slot ON playlist.id = slot.playlist_id
     WHERE created_by = $1`,
    [userId]
  );
  return rows;
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
    `INSERT INTO playlist_editor (playlist_id, created_by)
     VALUES ($1, $2)
     WHERE NOT EXISTS (
       SELECT 1 FROM playlist_editor WHERE playlist_id = $1 AND editor_id = $2
     )`,
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
  await pool.query(
    `INSERT INTO playlist_editor (playlist_id, last_updated_by)
     VALUES ($1, $2)
     WHERE NOT EXISTS (
       SELECT 1 FROM playlist_editor WHERE playlist_id = $1 AND editor_id = $2
     )`,
    [playlistRow.id, last_updated_by]
  );
  return playlistRow;
};

const deletePlaylist = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM playlist WHERE id = $1', [id]);
};

export {
  getPlaylistById,
  getPlaylistsByUserId,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
};