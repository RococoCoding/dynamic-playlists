import { Router, Request, Response } from 'express';
import { getPlaylistById, getPlaylistsByUserId, createPlaylist, updatePlaylist, deletePlaylist, getPlaylistBySpotifyId } from '../../../services/playlist/index.js';
import { Playlist, PlaylistWithSlots } from '../../../types/index.js';
import { getSlotsByPlaylistId } from '../../../services/slot/index.js';

const playlistsRouter = Router();

// Get a playlist by ID
playlistsRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { include } = req.query;

  try {
    const playlist: PlaylistWithSlots | null = await getPlaylistById(id);
    if (!playlist) {
      return res.status(404).send('Playlist not found');
    }
    if (include === 'slots') {
      playlist.slots = await getSlotsByPlaylistId(id);
    }
    return res.status(200).send(playlist);
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).json({ error: errMsg});
  }
});

// Get all playlists for a user
playlistsRouter.get('/by-user/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const playlists = await getPlaylistsByUserId(userId);
    return res.status(200).send(playlists);
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).json({ error: errMsg});
  }
});

playlistsRouter.get('/by-spotify-id/:spotifyId', async (req: Request, res: Response) => {
  const { spotifyId } = req.params;
    try {
    const playlist = await getPlaylistBySpotifyId(spotifyId);
    return res.status(200).send(playlist);
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).json({ error: errMsg});
  }
});

// Create a new playlist
playlistsRouter.post('/', async (req: Request, res: Response) => {
  const playlist: Omit<Playlist, 'id' | 'created_at' | 'last_updated'> = req.body;
  const { return_all } = req.query;

  try {
    const newPlaylist = await createPlaylist(playlist);
    if (return_all) {
      const userPlaylists = await getPlaylistsByUserId(playlist.created_by);
      return res.status(201).send(userPlaylists);
    }
    return res.status(201).send(newPlaylist);
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).json({ error: errMsg});
  }
});

// Update a playlist by ID
playlistsRouter.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const playlist: Partial<Omit<Playlist, 'id' | 'created_at' | 'created_by'>> = req.body;

  try {
    const updatedPlaylist = await updatePlaylist(id, playlist);
    if (!updatedPlaylist) {
      return res.status(404).send('Playlist not found');
    }
    return res.status(200).send(updatedPlaylist);
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).json({ error: errMsg});
  }
});

// Delete a playlist by ID
playlistsRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { return_all } = req.query;

  try {
    const deletedPlaylist = await deletePlaylist(id);
    if (return_all) {
      const userPlaylists = await getPlaylistsByUserId(deletedPlaylist.created_by);
      return res.status(200).send(userPlaylists);
    }
    return res.status(200).send('Playlist deleted');
  } catch (err: any) {
    const errMsg = err?.message || err;
    return res.status(500).json({ error: errMsg});
  }
});

export default playlistsRouter;