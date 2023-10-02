import { Router, Request, Response } from 'express';
import { getPoolById, getPoolBySpotifyId, upsertPool, setPoolLastUpdated, deletePool } from '../../../services/pool/index.js';
import { Pool } from '../../../types/index.js';

const poolsRouter = Router();

// Get a pool by ID
poolsRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const pool = await getPoolById(id);
    if (!pool) {
      return res.status(404).send('Pool not found');
    }
    return res.status(200).send(pool);
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).json({ error: errMsg});
  }
});

// Get pool for a Spotify ID and market
poolsRouter.get('/pools/:spotifyId', async (req: Request, res: Response) => {
  const { spotifyId } = req.params;
  const { market } = req.body;

  try {
    const pools = await getPoolBySpotifyId(spotifyId, market);
    return res.status(200).send(pools);
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).json({ error: errMsg});
  }
});

// Create a new pool
poolsRouter.post('/', async (req: Request, res: Response) => {
  const pool: Omit<Pool, 'id' | 'last_updated'> = req.body;

  try {
    const newPool = await upsertPool(pool);
    return res.status(201).send(newPool);
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).json({ error: errMsg});
  }
});

// Update a pool by ID
poolsRouter.put('/last-updated/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const pool: Partial<Omit<Pool, 'id' | 'last_updated'>> = req.body;

  try {
    const updatedPool = await setPoolLastUpdated(id);
    if (!updatedPool) {
      return res.status(404).send('Possible error updating. Updated pool not returned.');
    }
    return res.status(200).send(updatedPool);
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).json({ error: errMsg});
  }
});

// Delete a pool by ID
poolsRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deletePool(id);
    return res.status(200).send('Pool deleted');
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).json({ error: errMsg});
  }
});

export default poolsRouter;