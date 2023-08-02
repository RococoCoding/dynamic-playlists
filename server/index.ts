import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
import bodyParser from 'body-parser';
import cors from 'cors';
import router from './routes/index.js';

const port = 5000;

dotenv.config();

const app = express();
app.set('appName', 'Dynamic Playlists');

// Third-party Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

// App Configuration
app.use(router);
const { Pool } = pkg;
export const pool = new Pool({
  user: process.env.DB_USER,
  connectionString: process.env.DATABASE_URL,
  password: process.env.DB_PASSWORD,
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

