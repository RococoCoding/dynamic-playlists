import { Request, Response, Router } from 'express';
import apiRouter from './api/index';
import authRouter from './auth/index';

const router = Router();

// API Routes:
router.use('/api', apiRouter);

// auth routes:
router.use('/auth', authRouter);

// System Routes:
router.get('/status', (_: Request, res: Response) => res.status(200).send('OK'));

export default router;
