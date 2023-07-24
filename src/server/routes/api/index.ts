import { Router, Request, Response } from "express";

import authRouter from "./auth";

const apiRouter = Router();
apiRouter.use("/auth", authRouter);

apiRouter.use("*", (_: Request, res: Response) => {
  res.status(404).send({ message: 'This endpoint does not exist.' });
});


export default authRouter;