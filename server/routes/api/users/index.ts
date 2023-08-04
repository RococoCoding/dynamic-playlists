import { Router, Request, Response } from 'express';
import { deleteUser, findUser, findAllUsers, insertUser } from '../../../services/users/index.js';

const usersRouter = Router();

// Find / upsert user
usersRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log('getting user', id)

  try {
    const user = await findUser(id);
    console.log('user', user);
    if (!user) {
      console.log('inserting user');
      await insertUser(id);
    }

    return res.status(200);
  } catch (err: any) {
    const errMsg = err?.message || err;
    console.log(errMsg);
    res.status(500).send(errMsg);
  }
});

usersRouter.get('/', async (req: Request, res: Response) => {
    try {
    const users = await findAllUsers();
    console.log('all users', users);
  } catch (err: any) {
    const errMsg = err?.message || err;
    res.status(500).send(errMsg);
  }
});

// Insert new user
usersRouter.post('/', async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    await insertUser(id);
    return res.status(200);
  } catch (err: any) {
    const errMsg = err?.message || err;
    res.status(500).send(errMsg);
  }
});

// Delete a user
usersRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteUser(id);

    res.status(200).send('User deleted');
  } catch (err: any) {
    const errMsg = err?.message || err;
    res.status(500).send(errMsg);
  }
});

export default usersRouter;