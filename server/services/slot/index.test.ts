import { pool } from '../../index';
import { SlotInput } from '../../types';
import { createSlotQuery, getPoolBySpotifyIdQuery, getSlotByIdQuery } from '../queries';
import { createSlot, getSlotById } from './index';

jest.mock('../../index', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
  }
}));


const sampleSlot: SlotInput & { id: string } = {
  id: '123e4567-e89b-12d3-a456-426655440000',
  type: 'track',
  name: 'New Song',
  artist_name: ['New Artist'],
  pool_id: '123e4567-e89b-12d3-a456-426655440001',
  position: 1,
  current_track: undefined,
  playlist_id: '123e4567-e89b-12d3-a456-426655440002',
};

const sampleSpotifyId = 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M';

describe('Slot service', () => {
  let client: any;

  beforeEach(() => {
    // Reset the mocks before each test
    jest.clearAllMocks();

    // Set up the client mock
    client = {
      query: jest.fn(),
      release: jest.fn(),
    };

    // Mock the pool.connect function to return the client mock
    (pool.connect as jest.Mock).mockResolvedValue(client);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getSlotById', () => {
    it('should return the slot with the specified id', async () => {
      const id = sampleSlot.id;
      const expectedSlot = sampleSlot;
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [expectedSlot] });

      const slot = await getSlotById(id);

      expect(slot).toEqual(expectedSlot);
      expect(pool.query).toHaveBeenCalledWith(
        getSlotByIdQuery,
        [id]
      );
    });

    it('should return undefined if no slot is found with the specified id', async () => {
      const id = '123e4567-e89b-12d3-a456-426655440001';
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const slot = await getSlotById(id);

      expect(slot).toBeUndefined();
      expect(pool.query).toHaveBeenCalledWith(
        getSlotByIdQuery,
        [id]
      );
    });

    it('should throw an error if the id is invalid', async () => {
      const id = 'invalid-id';

      await expect(getSlotById(id)).rejects.toThrow();
      expect(pool.query).not.toHaveBeenCalled();
    });


    it('should throw an error if more than one slot is found with the specified id', async () => {
      const id = '123e4567-e89b-12d3-a456-426655440001';
      const expectedSlot1 = sampleSlot;
      const expectedSlot2 = {...sampleSlot, name: 'Expected Slot 2'};
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [expectedSlot1, expectedSlot2] });

      await expect(getSlotById(id)).rejects.toThrow('More than one slot found');
    });
  });

  describe('createSlot', () => {
    it('should create a new slot with the specified input and return the created slot', async () => {
      const expectedSlot = {
        ...sampleSlot,
        pool_id: '123e4567-e89b-12d3-a456-426655440001',
      };

      client.query.mockResolvedValueOnce() // 'BEGIN' query
        .mockResolvedValueOnce({ rows: [{id: '123e4567-e89b-12d3-a456-426655440001'}]}) // for upsertPool
        .mockResolvedValueOnce({ rows: [expectedSlot] }); // for createSlotQuery

      const result = await createSlot(sampleSlot, sampleSpotifyId);

      expect(result).toEqual(expectedSlot);
      expect(client.query).toHaveBeenCalledWith(
        createSlotQuery,
        [sampleSlot.type, sampleSlot.name, sampleSlot.playlist_id, sampleSlot.artist_name, sampleSlot.position, expectedSlot.pool_id]
      );
      expect(client.query).toHaveBeenCalledWith(
        getPoolBySpotifyIdQuery,
        [sampleSpotifyId]
      )
      expect(client.query).toHaveBeenCalledTimes(4); // BEGIN, upsertPool, createSlotQuery, COMMIT
      expect(client.release).toHaveBeenCalledTimes(1);
    });

    // it('should throw an error if the type is invalid', async () => {
    //   const invalidSlotInput = {
    //     ...sampleSlot,
    //     type: 'invalid-type',
    //   };
    //   await expect(createSlot(invalidSlotInput, sampleSpotifyId)).rejects.toThrow();
    // });

    // it('should throw an error if the type is empty', async () => {
    //   const invalidSlotInput = {
    //     ...sampleSlot,
    //     type: undefined,
    //   };
    //   // @ts-expect-error we're testing unexpected inputs
    //   await expect(createSlot(invalidSlotInput, sampleSpotifyId)).rejects.toThrow();
    // });

    // it('should throw an error if the name is invalid', async () => {
    //   const invalidSlotInput = {
    //     ...sampleSlot,
    //     name: 87,
    //   };
    //   // @ts-expect-error we're testing unexpected inputs
    //   await expect(createSlot(invalidSlotInput, sampleSpotifyId)).rejects.toThrow();
    // });

    // it('should throw an error if the name is empty', async () => {
    //   const invalidSlotInput = {
    //     ...sampleSlot,
    //     name: '',
    //   };
    //   await expect(createSlot(invalidSlotInput, sampleSpotifyId)).rejects.toThrow();
    // });

    // it('should throw an error if the artist_name is empty', async () => {
    //   const invalidSlotInput = {
    //     ...sampleSlot,
    //     artist_name: undefined,
    //   };
    //   // @ts-expect-error we're testing unexpected inputs
    //   await expect(createSlot(invalidSlotInput, sampleSpotifyId)).rejects.toThrow();
    // });

    // it('should throw an error if the artist_name is invalid', async () => {
    //   const invalidSlotInput = {
    //     ...sampleSlot,
    //     artist_name: 'artist',
    //   };
    //   // @ts-expect-error we're testing unexpected inputs
    //   await expect(createSlot(invalidSlotInput, sampleSpotifyId)).rejects.toThrow();
    // });

    // it('should throw an error if the playlist_id is invalid', async () => {
    //   const invalidSlotInput = {
    //     ...sampleSlot,
    //     playlist_id: 'invalid-id',
    //   };
    //   // @ts-expect-error we're testing unexpected inputs
    //   await expect(createSlot(invalidSlotInput, sampleSpotifyId)).rejects.toThrow();
    // });

    // it('should throw an error if the playlist_id is empty', async () => {
    //   const invalidSlotInput = {
    //     ...sampleSlot,
    //     playlist_id: '',
    //   };
    //   // @ts-expect-error we're testing unexpected inputs
    //   await expect(createSlot(invalidSlotInput, sampleSpotifyId)).rejects.toThrow();
    // });

    // it('should throw an error if the position is negative', async () => {
    //   const invalidSlotInput = {
    //     type: 'song',
    //     name: 'New Song',
    //     artist_name: 'New Artist',
    //     playlist_id: '123e4567-e89b-12d3-a456-426655440001',
    //     position: -1,
    //   };
    //   // @ts-expect-error we're testing unexpected inputs
    //   await expect(createSlot(invalidSlotInput, sampleSpotifyId)).rejects.toThrow();
    // });

    // it('should throw an error if the position is undefined', async () => {
    //   const invalidSlotInput = {
    //     type: 'song',
    //     name: 'New Song',
    //     artist_name: 'New Artist',
    //     playlist_id: '123e4567-e89b-12d3-a456-426655440001',
    //     position: undefined,
    //   };
    //   // @ts-expect-error we're testing unexpected inputs
    //   await expect(createSlot(invalidSlotInput, sampleSpotifyId)).rejects.toThrow();
    // });

    // it('should throw an error if the pool id is not returned', async () => {
    //   const mockClient = {
    //     query: jest.fn().mockResolvedValueOnce({ rows: [{ id: null }] }),
    //     release: jest.fn(),
    //   };
    //   (pool.connect as jest.Mock).mockResolvedValueOnce(mockClient);

    //   await expect(createSlot(sampleSlot, sampleSpotifyId)).rejects.toThrow('Pool id not returned');
    // });

    // it('should handle errors thrown by the database client', async () => {
    //   const errorMessage = 'Database error';
    //   const mockClient = {
    //     query: jest.fn().mockRejectedValueOnce(new Error(errorMessage)),
    //     release: jest.fn(),
    //   };
    //   (pool.connect as jest.Mock).mockResolvedValueOnce(mockClient);

    //   await expect(createSlot(sampleSlot, sampleSpotifyId)).rejects.toThrow(errorMessage);
    //   expect(mockClient.query).toHaveBeenCalledWith(
    //     createSlotQuery,
    //     [sampleSlot.type, sampleSlot.name, sampleSlot.playlist_id, sampleSlot.artist_name, sampleSlot.position, expect.any(String)]
    //   );
    //   expect(mockClient.query).toHaveBeenCalledTimes(1);
    //   expect(mockClient.release).toHaveBeenCalledTimes(1);
    // });
  });
});