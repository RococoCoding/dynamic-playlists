export const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1/';

export const SERVER_BASE_URL = 'http://localhost:5000/';

export const SLOT_TYPES_MAP_BY_ID = {
  1: 'track',
  2: 'artist',
  3: 'album',
  4: 'playlist',
}

export const SLOT_TYPES_MAP_BY_NAME: Record<string, number> = Object.entries(SLOT_TYPES_MAP_BY_ID)
  .reduce((acc: Record<string, number>, [key, value]) => {
    acc[value] = parseInt(key);
    return acc;
  }, {});

export const SLOT_TYPE_TO_SPOTIFY_RETURN_TYPE = {
  [SLOT_TYPES_MAP_BY_ID[1]]: 'tracks',
  [SLOT_TYPES_MAP_BY_NAME[2]]: 'artists',
  [SLOT_TYPES_MAP_BY_NAME[3]]: 'albums',
  [SLOT_TYPES_MAP_BY_NAME[4]]: 'playlists',
}

export type SlotType = typeof SLOT_TYPES_MAP_BY_ID[keyof typeof SLOT_TYPES_MAP_BY_ID];

export const SLOT_TYPES:SlotType[] = Object.values(SLOT_TYPES_MAP_BY_ID) as SlotType[];

export const requiresArtist = [SLOT_TYPES_MAP_BY_NAME.track, SLOT_TYPES_MAP_BY_NAME.album, SLOT_TYPES_MAP_BY_NAME.playlist];