import { Router, Request } from 'express';
import { validateUser } from '../api/middleware';
import { AuthResponse } from '../../types/index';
import { JWT_SECRET } from '../../constants/index';
import { generateToken } from '../../utils/index';

const authRouter = Router();

authRouter.post('/token', [validateUser], async (req: Request, res: AuthResponse) => {
  const username = res.locals.username;
  if (!username) {
    return res.status(400).json({
      error: {
        message: "Missing username.", code: "DP-RR-USER"
      }
    });
  }
  if (!JWT_SECRET) {
    console.log(`JWT_SECRET is not set.`);
    return res.status(500);
  }
  const token = generateToken(username);
  return res.status(200).json(token);
});

export default authRouter;