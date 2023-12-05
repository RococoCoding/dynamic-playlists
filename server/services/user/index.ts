// index.ts
import { pool } from '../../index';
import assert = require("node:assert")
import { validateStringId } from '../../utils';
import { findUserQuery, insertUserQuery, deleteUserQuery } from '../queries';

const findUser = async (id: string) => {
  validateStringId(id);
  const { rows } = await pool.query(findUserQuery, [id]);
  assert(rows.length <= 1, 'More than one user found');

  return rows[0];
};

const insertUser = async (id: string) => {
  validateStringId(id);
  const { rows } = await pool.query(insertUserQuery, [id]);
  assert(rows.length === 1, 'User not created');

  return rows[0];
};

const deleteUser = async (id: string) => {
  validateStringId(id);
  await pool.query(deleteUserQuery, [id]);

  return true;
}

export {
  deleteUser,
  findUser,
  insertUser,
}