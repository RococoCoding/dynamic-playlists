import express from 'express';
import {
  createSlot,
  deleteSlot,
  getSlotById,
  getSlotsByPlaylistId,
  updateSlot
} from '../../../services/slot/index.js';

const slotsRouter = express.Router();

slotsRouter.get('/:id', async (req, res) => {
  const slot = await getSlotById(req.params.id);
  if (slot) {
    res.json(slot);
  } else {
    res.status(404).send('Slot not found');
  }
});

slotsRouter.get('/by-playlist/:playlistId', async (req, res) => {
  const slots = await getSlotsByPlaylistId(req.params.playlistId);
  res.json(slots);
});

slotsRouter.post('/', async (req, res) => {
  const { spotify_id, ...slot } = req.body;
  const newSlot = await createSlot(slot, spotify_id);
  res.json(newSlot);
});

slotsRouter.put('/:id', async (req, res) => {
  const { pool_spotify_id, ...slot } = req.body;
  const newSlot = await updateSlot(req.params.id, slot, pool_spotify_id);
  if (newSlot) {
    res.json(newSlot);
  } else {
    res.status(404).send('Slot not found');
  }
});

slotsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { return_all } = req.query;
  const returned = await deleteSlot(id, !!return_all);
  if (return_all) {
    res.json(returned);
  } else {
    res.send('Slot deleted');
  }
});

export default slotsRouter;