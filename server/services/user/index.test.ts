import { pool } from '../../index';
import { deleteUserQuery, findUserQuery, insertUserQuery } from '../queries';
import { findUser, insertUser, deleteUser } from './index';

jest.mock('../../index', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('User service', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findUser', () => {
    it('should return the user with the given id', async () => {
      const id = '123';
      const user = { id, name: 'Alice' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [user] });

      const result = await findUser(id);

      expect(pool.query).toHaveBeenCalledWith(findUserQuery, [id]);
      expect(result).toEqual(user);
    });

    it('should throw an error if multiple users are found', async () => {
      const id = '123';
      const users = [{ id, name: 'Alice' }, { id, name: 'Bob' }];
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: users });

      await expect(findUser(id)).rejects.toThrow('More than one user found');
    });

    it('should throw an error if no id is provided', async () => {
      const id = undefined;

      // @ts-expect-error we're testing unexpected inputs
      await expect(findUser(id)).rejects.toThrow('Invalid id');
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should throw an error if nonvalid id is provided', async () => {
      const id = 24;

      // @ts-expect-error we're testing unexpected inputs
      await expect(findUser(id)).rejects.toThrow('Invalid id');
      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe('insertUser', () => {
    it('should insert a new user with the given id', async () => {
      const id = '123';
      const user = { id };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [user] });

      const result = await insertUser(id);

      expect(pool.query).toHaveBeenCalledWith(insertUserQuery, [id]);
      expect(result).toEqual(user);
    });

    it('should throw an error if the user is not created', async () => {
      const id = '123';
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await expect(insertUser(id)).rejects.toThrow('User not created');
    });

      it('should throw an error if no id is provided', async () => {
      const id = undefined;

      // @ts-expect-error we're testing unexpected inputs
      await expect(insertUser(id)).rejects.toThrow('Invalid id');
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should throw an error if nonvalid id is provided', async () => {
      const id = 24;

      // @ts-expect-error we're testing unexpected inputs
      await expect(insertUser(id)).rejects.toThrow('Invalid id');
      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete the user with the given id', async () => {
      const id = '123';
      const user = { id, name: 'Alice' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [user] });

      const result = await deleteUser(id);

      expect(pool.query).toHaveBeenCalledWith(deleteUserQuery, [id]);
      expect(result).toEqual(true);
    });

    it('should throw an error if user id is missing', async () => {
      const id = undefined;

      // @ts-expect-error we're testing unexpected inputs
      await expect(deleteUser(id)).rejects.toThrow('Invalid id');
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should throw an error if nonvalid id is provided', async () => {
      const id = {};

      // @ts-expect-error we're testing unexpected inputs
      await expect(deleteUser(id)).rejects.toThrow('Invalid id');
      expect(pool.query).not.toHaveBeenCalled();
    });
  });
});