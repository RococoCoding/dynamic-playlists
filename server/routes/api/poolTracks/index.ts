import { Router, Request, Response } from 'express';
import {
  getPoolTrackById,
  getPoolTracksByPoolId,
  getPoolTrackBySpotifyTrackId,
  getPoolTracksBySpotifyArtistId,
  insertPoolTracks,
  deleteAllTracksInPool
} from '../../../services/pool_track/index.js';
import { PoolTrack } from '../../../types/index.js';

const poolTracksRouter = Router();

// Get a pool track by ID
poolTracksRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const poolTrack = await getPoolTrackById(id);
    if (!poolTrack) {
      return res.status(404).send('Pool track not found');
    }
    return res.status(200).send(poolTrack);
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).send(errMsg);
  }
});

// Get all pool tracks for a pool
poolTracksRouter.get('/by-pool/:poolId', async (req: Request, res: Response) => {
  const { poolId } = req.params;

  try {
    const poolTracks = await getPoolTracksByPoolId(poolId);
    return res.status(200).send(poolTracks);
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).send(errMsg);
  }
});

// Get a pool track by Spotify track ID
poolTracksRouter.get('/by-spotify-track-id/:spotifyTrackId', async (req: Request, res: Response) => {
  const { spotifyTrackId } = req.params;

  try {
    const poolTrack = await getPoolTrackBySpotifyTrackId(spotifyTrackId);
    if (!poolTrack) {
      return res.status(404).send('Pool track not found');
    }
    return res.status(200).send(poolTrack);
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).send(errMsg);
  }
});

// Get all pool tracks by Spotify artist ID
poolTracksRouter.get('/by-spotify-artist-id/:spotifyArtistId', async (req: Request, res: Response) => {
  const { spotifyArtistId } = req.params;

  try {
    const poolTracks = await getPoolTracksBySpotifyArtistId(spotifyArtistId);
    return res.status(200).send(poolTracks);
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).send(errMsg);
  }
});

// Insert pool tracks
poolTracksRouter.post('/', async (req: Request, res: Response) => {
  const poolTracks: Omit<PoolTrack, 'id'>[] = req.body;

  try {
    await insertPoolTracks(poolTracks);
    return res.status(201).send('Pool tracks inserted');
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).send(errMsg);
  }
});

// Delete all pool tracks for a pool
poolTracksRouter.delete('/by-pool/:poolId', async (req: Request, res: Response) => {
  const { poolId } = req.params;

  try {
    await deleteAllTracksInPool(poolId);
    return res.status(200).send('Pool tracks deleted');
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).send(errMsg);
  }
});

export default poolTracksRouter;