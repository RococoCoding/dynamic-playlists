import dotenv from 'dotenv';
dotenv.config();
export const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI,
  DB_USER,
  DB_PASSWORD,
  DATABASE_URL, // DATABASE instead of DB bc of node-pg-migrate
  SECRET_KEY,
  JWT_SECRET,
} = process.env;

export const VALID_SLOT_TYPES = ['playlist', 'album', 'track', 'artist'];
export const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1/';

export const DP_ERROR_CODES = {
  requestToken: 'DP-RR-TOK',
}