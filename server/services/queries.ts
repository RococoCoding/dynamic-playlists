// pool queries
export const getPoolBySpotifyIdQuery = `
  SELECT *
  FROM pool
  WHERE spotify_id = $1
`;


/******************************************************************************/


// slot queries
export const getSlotByIdQuery = `
  SELECT slot.*, pool.last_updated AS pool_last_updated, pool.id AS pool_id, pool.spotify_id AS pool_spotify_id
  FROM slot
  JOIN pool ON slot.pool_id = pool.id
  WHERE slot.id = $1
`;

export const getSlotsByPlaylistIdQuery = `
  SELECT slot.*, pool.last_updated AS pool_last_updated, pool.id AS pool_id, pool.spotify_id AS pool_spotify_id
  FROM slot
  LEFT JOIN pool ON slot.pool_id = pool.id
  WHERE slot.playlist_id = $1
`;

export const createSlotQuery = `
  WITH inserted AS (
    INSERT INTO slot (type, name, playlist_id, artist_name, position, pool_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  )
  SELECT inserted.*, pool.last_updated AS pool_last_updated, pool.id AS pool_id, pool.spotify_id AS pool_spotify_id
  FROM inserted
  INNER JOIN pool ON inserted.pool_id = pool.id
`;

export const updateSlotQuery = `
  UPDATE slot
  SET type = COALESCE($1, type),
      name = COALESCE($2, name),
      artist_name = COALESCE($3, artist_name),
      pool_id = COALESCE($4, pool_id),
      position = COALESCE($5, position),
      current_track = COALESCE($6, current_track)
  WHERE id = $7
  RETURNING *
`;

export const deleteSlotQuery = 'DELETE FROM slot WHERE id = $1 RETURNING *';

export const updateManySlotsQuery = `
  UPDATE slot
  SET type = COALESCE($1, slot.type),
      name = COALESCE($2, slot.name),
      artist_name = COALESCE($3, slot.artist_name),
      pool_id = COALESCE($4, slot.pool_id),
      position = COALESCE($5, slot.position),
      current_track = COALESCE($6, slot.current_track)
  WHERE slot.id = $7
  RETURNING *;
`;


/******************************************************************************/


// user queries
export const findUserQuery = 'SELECT * FROM dp_user WHERE id = $1';

export const insertUserQuery = 'INSERT INTO dp_user (id) VALUES ($1) RETURNING *';

export const deleteUserQuery = 'DELETE FROM dp_user WHERE id = $1';