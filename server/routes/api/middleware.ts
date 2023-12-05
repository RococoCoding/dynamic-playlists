import { NextFunction, Request } from "express";
import jwt from 'jsonwebtoken';
import { AuthResponse } from "../../types";
import useAxios from "../../utils/axios";
import { findUser } from "../../services/user/index";
import { DP_ERROR_CODES, JWT_SECRET, SPOTIFY_BASE_URL } from "../../constants/index";

export const validateUser = async (req: Request, res: AuthResponse, next: NextFunction) =>{
  const username = req.body.username;
  const accessToken = req.body.accessToken;
  if (!accessToken) {
    return res.status(400).json("Missing access_token.");
  }
  if (!username) {
    return res.status(400).json("Missing username.");
  }

  // verify valid spotify access token first
  const errMsg = "Error validating user.";
  try {
    const { data: { id: spotifyUserId } } = await useAxios({
      baseUrl: SPOTIFY_BASE_URL,
      method: "GET",
      path: "me",
      token: accessToken,
    });
    if (!spotifyUserId || spotifyUserId !== username) {
      console.log('missing spotifyUserId or mismatch with username', spotifyUserId, username);
      return res.status(400).json(errMsg);
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json(errMsg);
  }

  // verify corresponding user in DP db
  try {
    const user = await findUser(username);
    if (user) {
      res.locals.username = username;
      next();
    } else {
      console.log('user not found in db', username);
      return res.status(404).json(errMsg);
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json(errMsg);
  }
}

export const authorize = (req: Request, res: AuthResponse, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({
      error: {
        message: 'Missing authorization token.',
        code: DP_ERROR_CODES.requestToken
      }
    });
  }
  if (!JWT_SECRET) {
    console.log(`JWT_SECRET is not set.`);
    return res.status(500);
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(500).json({
          error: {
            code: DP_ERROR_CODES.requestToken,
            message: 'Token expired.'
          }
        });
      }
      return res.status(500).json(`Could not verify JWT.`);
    }
    if (!token) {
      return res.status(500).json(`Could not verify JWT.`);
    } 
    
    res.locals.token = decoded;
    next();
  });
}
