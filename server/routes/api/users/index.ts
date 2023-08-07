import { Router, Request, Response } from 'express';
import { deleteUser, findUser, insertUser } from '../../../services/user/index.js';
import { getPlaylistsByUserId } from '../../../services/playlist/index.js';

const usersRouter = Router();

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
    return res.status(500).send(errMsg);
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
    return res.status(500).send(errMsg);
  }
});

export default usersRouter;