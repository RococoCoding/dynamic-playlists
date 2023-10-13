export const REACT_APP_ENV = process.env.REACT_APP_ENV;

export const ENVIRONMENTS = {
  development: 'development',
  production: 'production',
}

export const ERROR_ACTIONS = {
  reauth: 'reauth',
  republish: 'republish',
}

export const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1/';

export const SERVER_BASE_URL = 'http://localhost:5000/';

export const SLOT_TYPES = {
  track: 'track',
  artist: 'artist',
  album: 'album',
  playlist: 'playlist',
}

export const SLOT_TYPES_MAP_BY_ID = {
  1: SLOT_TYPES.track,
  2: SLOT_TYPES.artist,
  3: SLOT_TYPES.album,
  // 4: 'playlist',
}

export const SLOT_TYPES_MAP_BY_NAME: Record<string, keyof typeof SLOT_TYPES_MAP_BY_ID> = Object.entries(SLOT_TYPES_MAP_BY_ID)
  .reduce((acc: Record<string, keyof typeof SLOT_TYPES_MAP_BY_ID>, [key, value]) => {
    acc[value] = parseInt(key) as keyof typeof SLOT_TYPES_MAP_BY_ID;
    return acc;
  }, {});

export const SLOT_TYPE_TO_SPOTIFY_RETURN_TYPE = {
  [SLOT_TYPES_MAP_BY_ID[1]]: 'tracks',
  [SLOT_TYPES_MAP_BY_ID[2]]: 'artists',
  [SLOT_TYPES_MAP_BY_ID[3]]: 'albums',
  // [SLOT_TYPES_MAP_BY_ID[4]]: 'playlists',
}

export type SlotType = typeof SLOT_TYPES_MAP_BY_ID[keyof typeof SLOT_TYPES_MAP_BY_ID];

export const SLOT_TYPES_LIST:SlotType[] = Object.values(SLOT_TYPES_MAP_BY_ID) as SlotType[];

export const SLOT_TYPES_THAT_REQUIRE_ARTIST = [SLOT_TYPES_MAP_BY_NAME.track, SLOT_TYPES_MAP_BY_NAME.album, SLOT_TYPES_MAP_BY_NAME.playlist];