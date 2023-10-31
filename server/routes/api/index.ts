import { Router, Request, Response } from "express";

import usersRouter from "./users/index.js";
import playlistsRouter from "./playlists/index.js";
import poolsRouter from "./pools/index.js";
import poolTracksRouter from "./poolTracks/index.js";
import slotsRouter from "./slots/index.js";
import { authorize } from "./middleware.js";

const apiRouter = Router();
apiRouter.use("/users", [authorize], usersRouter);
apiRouter.use("/playlists", [authorize], playlistsRouter);
apiRouter.use("/pools", [authorize], poolsRouter);
apiRouter.use("/pool-tracks", [authorize], poolTracksRouter);
apiRouter.use("/slots", [authorize], slotsRouter);


apiRouter.use("*", (_: Request, res: Response) => {
  res.status(404).send({ message: 'This endpoint does not exist.' });
});


export default apiRouter;