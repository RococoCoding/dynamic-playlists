import { Router, Request, Response } from "express";

import usersRouter from "./users/index.js";
import playlistsRouter from "./playlists/index.js";
import poolsRouter from "./pools/index.js";
import poolTracksRouter from "./poolTracks/index.js";
import slotsRouter from "./slots/index.js";

const apiRouter = Router();
apiRouter.use("/users", usersRouter);
apiRouter.use("/playlists", playlistsRouter);
apiRouter.use("/pools", poolsRouter);
apiRouter.use("/pool-tracks", poolTracksRouter);
apiRouter.use("/slots", slotsRouter);


apiRouter.use("*", (_: Request, res: Response) => {
  res.status(404).send({ message: 'This endpoint does not exist.' });
});


export default apiRouter;