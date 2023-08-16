export const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1/';

export const SERVER_BASE_URL = 'http://localhost:5000/';

export const SLOT_TYPES = {
  track: 1,
  artist: 2,
  album: 3,
  playlist: 4,
}

export const requiresArtist = [SLOT_TYPES.track, SLOT_TYPES.album, SLOT_TYPES.playlist];