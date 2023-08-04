import express from 'express';
import pkg from 'pg';
import bodyParser from 'body-parser';
import cors from 'cors';
import router from './routes/index.js';
import { DATABASE_URL, DB_PASSWORD, DB_USER } from './constants/index.js';

const port = 5000;

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
  user: DB_USER,
  connectionString: DATABASE_URL,
  password: DB_PASSWORD,
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

