import { Router, Request, Response } from "express";

import usersRouter from "./users/index";
import playlistsRouter from "./playlists/index";
import poolsRouter from "./pools/index";
import poolTracksRouter from "./poolTracks/index";
import slotsRouter from "./slots/index";
import { authorize } from "./middleware";

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