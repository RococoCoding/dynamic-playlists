import dotenv from 'dotenv';
dotenv.config();
export const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI,
  DB_USER,
  DB_PASSWORD,
  DB_URL,
  DATABASE_URL,
} = process.env;