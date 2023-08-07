import express from 'express';
import {
  createSlot,
  deleteSlot,
  getSlotById,
  getSlotsByPlaylistId,
  updateSlot
} from '../../../services/slot/index.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  const slot = await getSlotById(req.params.id);
  if (slot) {
    res.json(slot);
  } else {
    res.status(404).send('Slot not found');
  }
});

router.get('/by-playlist/:playlistId', async (req, res) => {
  const slots = await getSlotsByPlaylistId(req.params.playlistId);
  res.json(slots);
});

router.post('/', async (req, res) => {
  const slot = await createSlot(req.body);
  res.json(slot);
});

router.put('/:id', async (req, res) => {
  const slot = await updateSlot(req.params.id, req.body);
  if (slot) {
    res.json(slot);
  } else {
    res.status(404).send('Slot not found');
  }
});

router.delete('/:id', async (req, res) => {
  await deleteSlot(req.params.id);
  res.send('Slot deleted');
});

export default router;