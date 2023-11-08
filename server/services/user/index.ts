import { pool } from '../../index';
import assert = require("node:assert")

const assertId = (id: string) => {
  assert(id && typeof id === 'string', 'Invalid id provided');
}

const findUser = async (id: string) => {
  assertId(id);
  const { rows } = await pool.query('SELECT * FROM dp_user WHERE id = $1', [id]);
  assert(rows.length <= 1, 'More than one user found');

  return rows[0];
};

const insertUser = async (id: string) => {
  assertId(id);
  const { rows } = await pool.query(
    'INSERT INTO dp_user (id) VALUES ($1) RETURNING *',
    [id]
  );
  assert(rows.length === 1, 'User not created');

  return rows[0];
};

const deleteUser = async (id: string) => {
  assertId(id);
  await pool.query('DELETE FROM dp_user WHERE id = $1', [id]);

  return true;
}

export {
  deleteUser,
  findUser,
  insertUser,
}