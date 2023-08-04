import { Router, Request, Response } from "express";

import usersRouter from "./users/index.js";

const apiRouter = Router();
apiRouter.use("/users", usersRouter);

apiRouter.use("*", (_: Request, res: Response) => {
  res.status(404).send({ message: 'This endpoint does not exist.' });
});


export default apiRouter;