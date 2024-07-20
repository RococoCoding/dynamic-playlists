import { Router, Request, Response } from 'express';
import { deleteUser, findUser, findUserWithLTT, insertUser } from '../../../services/user/index.js';
import { createPlaylist, getPlaylistsByUserId } from '../../../services/playlist/index.js';
import { createLTT } from '../../../services/ltt/index.js';

const usersRouter = Router();

// get self
usersRouter.get('/me', async (req: Request, res: Response) => {
  const dpUsername = res.locals.token.subject;
  try {
    let user = await findUserWithLTT(dpUsername);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      const playlists = await getPlaylistsByUserId(dpUsername);
      user.playlists = playlists;
    }
    return res.status(200).send(user);
  } catch (err: any) {
    const errMsg = err?.message || err;
    console.error('Error creating user with id ', dpUsername, ': ', errMsg);
    return res.status(500).json({ error: errMsg });
  }
});

// Find / upsert user
usersRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    let user = await findUser(id);
    if (!user) {
      user = await insertUser(id);
    } else {
      const playlists = await getPlaylistsByUserId(id);
      user.playlists = playlists;
    }
    return res.status(200).send(user);
  } catch (err: any) {
    const errMsg = err?.message || err;
    console.error('Error creating user with id ', id, ': ', errMsg);
    return res.status(500).json({ error: errMsg });
  }
});

// Delete a user
usersRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteUser(id);
    return res.status(200).send('User deleted');
  } catch (err: any) {
    const errMsg = err?.message || err;
    console.error('Error deleting user with id ', id, ': ', errMsg);
    return res.status(500).json({ error: errMsg });
  }
});

// create new ltt
usersRouter.post('/:id/ltt', async (req, res) => {
  const { id } = req.params;
  const { spotify_playlist_id, max_length, excluded_genres } = req.body;
  const newLTT = await createLTT({dp_user_id: id, max_length, excluded_genres, spotify_playlist_id});
  console.log('newLTT', newLTT);
  res.json(newLTT);
});

export default usersRouter;