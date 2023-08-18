export const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1/';

export const SERVER_BASE_URL = 'http://localhost:5000/';

export const SLOT_TYPES_MAP = {
  track: 1,
  artist: 2,
  album: 3,
  playlist: 4,
}

export type SlotType = keyof typeof SLOT_TYPES_MAP;

export const SLOT_TYPES:SlotType[] = Object.keys(SLOT_TYPES_MAP) as SlotType[];

export const requiresArtist = [SLOT_TYPES_MAP.track, SLOT_TYPES_MAP.album, SLOT_TYPES_MAP.playlist];