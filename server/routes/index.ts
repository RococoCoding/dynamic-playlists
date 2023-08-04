import { Request, Response, Router } from 'express';
import apiRouter from './api/index.js';
import authRouter from './api/auth/index.js';

const router = Router();

// API Routes:
router.use('/api', apiRouter);

router.use('/auth', authRouter);

// System Routes:
router.get('/status', (_: Request, res: Response) => res.status(200).send('OK'));

export default router;
