import { Request, Response, Router } from 'express';
import apiRouter from './api';

const router = Router();

// API Routes:
router.use('/api', apiRouter);

// System Routes:
router.get('/status', (_: Request, res: Response) => res.status(200).send('OK'));

export default router;
