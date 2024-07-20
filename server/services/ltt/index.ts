import { pool } from '../../index.js';
type createLTTProps = {
  dp_user_id: string,
  max_length: number,
  excluded_genres: string[],
  spotify_playlist_id: string
}

const getLTTByUser = async (id: string) => {
  const { rows } = await pool.query(
    'SELECT * FROM ltt WHERE dp_user = $1',
    [id]
  );
  if (rows.length > 1) {
    console.error(`Multiple ltt found for user ${id}: `, rows);
    throw new Error('More than one ltt found');
  }
  return rows[0];
};

const createLTT = async ({dp_user_id, max_length, excluded_genres, spotify_playlist_id}: createLTTProps) => {
  const { rows } = await pool.query(
    'INSERT INTO ltt (dp_user, max_length, excluded_genres, playlist) VALUES ($1, $2, $3, $4) RETURNING *',
    [dp_user_id, max_length, excluded_genres, spotify_playlist_id]
  );
  if (!rows.length) {
    console.error('ltt not created using dp_user: ', dp_user_id, max_length, excluded_genres, spotify_playlist_id);
    throw new Error('ltt not created');
  }
  return rows[0];
};

const updateLTTMax = async (id: string, max_length: number) => {
  const { rows } = await pool.query(
    'UPDATE ltt SET max_length = $1 WHERE id = $2 RETURNING *',
    [max_length, id]
  );
  if (!rows.length) {
    console.error('ltt', id, 'not updated with value: ', max_length);
    throw new Error('ltt not updated');
  }
  return rows[0];
}

const updateLTTSpotifyPlaylist = async (id: string, spotify_playlist_id: string) => {
  const { rows } = await pool.query(
    'UPDATE ltt SET playlist = $1 WHERE id = $2 RETURNING *',
    [spotify_playlist_id, id]
  );
  if (!rows.length) {
    console.error('ltt', id, 'not updated with value: ', spotify_playlist_id);
    throw new Error('ltt not updated');
  }
  return rows[0];
}

export {
  createLTT,
  getLTTByUser,
  updateLTTMax,
  updateLTTSpotifyPlaylist
}