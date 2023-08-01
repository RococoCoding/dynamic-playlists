import { pool } from '../../../server/index';
import { User } from '../../../types';

const findUser = async (id: string) => {
  const { rows } = await pool.query<User>('SELECT * FROM users WHERE id = $1', [id]);
  if (rows.length > 1) {
    console.log(`Multiple users found for user ${id}: `, rows);
    throw new Error('More than one user found');
  }

  return rows[0];
};

const insertUser = async (id: string) => {
  const { rows } = await pool.query(
    'INSERT INTO users (id) VALUES ($1) RETURNING *',
    [id]
  );
  if (!rows.length) {
    console.log('User not created using id: ', id);
    throw new Error('User not created');
  }
  return rows[0];
};

const deleteUser = async (id: string) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

export {
  deleteUser,
  findUser,
  insertUser
}