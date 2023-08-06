import { pool as connectionPool } from '../../index.js';
import { PoolTrack } from '../../types/index.js';

const getPoolTrackById = async (id: string): Promise<PoolTrack | null> => {
  const { rows } = await connectionPool.query('SELECT * FROM pool_track WHERE id = $1', [id]);
  return rows.length > 0 ? rows[0] : null;
};

const getPoolTracksByPoolId = async (poolId: string): Promise<PoolTrack[]> => {
  const { rows } = await connectionPool.query('SELECT * FROM pool_track WHERE pool_id = $1', [poolId]);
  return rows;
};

const getPoolTrackBySpotifyTrackId = async (spotifyTrackId: string): Promise<PoolTrack | null> => {
  const { rows } = await connectionPool.query('SELECT * FROM pool_track WHERE spotify_track_id = $1', [spotifyTrackId]);
  return rows.length > 0 ? rows[0] : null;
};

const getPoolTracksBySpotifyArtistId = async (spotifyArtistId: string): Promise<PoolTrack | null> => {
  const { rows } = await connectionPool.query('SELECT * FROM pool_track WHERE spotify_artist_id = $1', [spotifyArtistId]);
  return rows.length > 0 ? rows[0] : null;
};

const insertPoolTracks = async (poolTracks: Omit<PoolTrack, 'id'>[]): Promise<void> => {
  const values = poolTracks.map((poolTrack) => {
    const { pool_id, spotify_track_id, spotify_artist_id } = poolTrack;
    if (!pool_id || !spotify_track_id || !spotify_artist_id) {
      console.log(`Skipping track with missing required field(s): `, { pool_id, spotify_track_id, spotify_artist_id });
    } else {
      return `('${pool_id}', '${spotify_track_id}, ${spotify_artist_id}')`
    }
  }).join(',');
  await connectionPool.query(`INSERT INTO pool_tracks (pool_id, track_id) VALUES ${values}`);
};

const deleteAllTracksInPool = async (pool_id: string): Promise<void> => {
  await connectionPool.query('DELETE FROM pool_track WHERE pool_id = $1', [pool_id]);
};

export {
  getPoolTrackById,
  getPoolTracksByPoolId,
  getPoolTrackBySpotifyTrackId,
  getPoolTracksBySpotifyArtistId,
  insertPoolTracks,
  deleteAllTracksInPool,
};