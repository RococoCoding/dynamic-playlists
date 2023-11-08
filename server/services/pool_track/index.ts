import { pool as connectionPool } from '../../index';
import { PoolTrack } from '../../types/index';
import { setPoolLastUpdated } from '../pool/index';

const getPoolTrackById = async (id: string): Promise<PoolTrack | null> => {
  const { rows } = await connectionPool.query(
    `SELECT *
     FROM pool_track
     WHERE id = $1`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

const getPoolTracksByPoolId = async (poolId: string): Promise<PoolTrack[]> => {
  const { rows } = await connectionPool.query(
    `SELECT *
     FROM pool_track
     WHERE pool_id = $1`,
    [poolId]
  );
  return rows;
};

const getPoolTrackBySpotifyTrackId = async (spotifyTrackId: string): Promise<PoolTrack | null> => {
  const { rows } = await connectionPool.query(
    `SELECT *
     FROM pool_track
     WHERE spotify_track_id = $1`,
    [spotifyTrackId]
  );
  return rows.length > 0 ? rows[0] : null;
};

const getPoolTracksBySpotifyArtistId = async (spotifyArtistId: string): Promise<PoolTrack | null> => {
  const { rows } = await connectionPool.query(
    `SELECT *
     FROM pool_track
     WHERE spotify_artist_id = $1`,
    [spotifyArtistId]
  );
  return rows.length > 0 ? rows[0] : null;
};

const insertPoolTracks = async (poolTracks: Omit<PoolTrack, 'id'>[], poolId: string): Promise<void> => {
  const res = await setPoolLastUpdated(poolId);
  if (!res) {
    throw new Error(`Failed to update pool last_updated for pool_id: ${poolId}`);
  }
  const values = poolTracks.map((poolTrack) => {
    const { pool_id, spotify_track_id, spotify_artist_ids } = poolTrack;
    if (!pool_id || !spotify_track_id || !spotify_artist_ids) {
      console.log(`Skipping track with missing required field(s): `, { pool_id, spotify_track_id, spotify_artist_ids });
    } else {
      const formattedArtistIds = `'{${spotify_artist_ids.join(',')}}'`;
      return `('${pool_id}', '${spotify_track_id}', ${formattedArtistIds})`;
    }
  }).join(',');
  await connectionPool.query(
    `INSERT INTO pool_track (pool_id, spotify_track_id, spotify_artist_ids)
     VALUES ${values}`
  );
};

const deleteAllTracksInPool = async (pool_id: string): Promise<void> => {
  await connectionPool.query(
    `DELETE FROM pool_track
     WHERE pool_id = $1`,
    [pool_id]
  );
};

export {
  getPoolTrackById,
  getPoolTracksByPoolId,
  getPoolTrackBySpotifyTrackId,
  getPoolTracksBySpotifyArtistId,
  insertPoolTracks,
  deleteAllTracksInPool,
};