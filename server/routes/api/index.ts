import { Router, Request, Response } from "express";

import authRouter from "./auth/index.js";
import usersRouter from "./users/index.js";

const apiRouter = Router();
apiRouter.use("/auth", authRouter);

apiRouter.use("/users", usersRouter);

apiRouter.use("*", (_: Request, res: Response) => {
  res.status(404).send({ message: 'This endpoint does not exist.' });
});


export default apiRouter;