import { SpotifyPlaylistType } from "../../types";

export const clearSpotifyPlaylist = async (callSpotifyApi: Function, playlistId: string): Promise<void> => {
  await callSpotifyApi({
    method: 'PUT',
    path: `playlists/${playlistId}/tracks`,
    data: {
      uris: [],
    }
  });
}

export const deleteTrackFromSpotifyPlaylist = async (
  playlistId: string,
  snapshotId: string,
  callSpotifyApi: Function,
  uri?: string,
): Promise<void> => {
  if (!uri) {
    throw new Error('missing uri');
  }
  await callSpotifyApi({
    data: {
      tracks: [{ uri }],
      snapshotId,
    },
    method: "DELETE",
    path: `playlists/${playlistId}/tracks`,
  });
}

export const getSpotifyPlaylist = async (playlistId: string, callSpotifyApi: Function): Promise<SpotifyPlaylistType> => {
  const { data } = await callSpotifyApi({
    method: 'GET',
    path: `playlists/${playlistId}`,
  });
  return data;
}

export const playPlaylistInSpotify = async (callSpotifyApi: Function, playlistId?: string):Promise<void> => {
  if (!playlistId) {
    throw new Error('Missing Spotify playlistId');
  }
  await callSpotifyApi({
    method: 'PUT',
    path: `me/player/play`,
    data: {
      context_uri: `spotify:playlist:${playlistId}`,
      position_ms: 0,
    },
  });
}

export const populateSpotifyPlaylist = async (
  callSpotifyApi: Function,
  playlistId: string,
  uris: string[]
):Promise<void> => {
  await callSpotifyApi({
    method: 'PUT',
    path: `playlists/${playlistId}/tracks`,
    data: {
      uris,
    }
  });
};

export const publishSpotifyPlaylist = async (
  callSpotifyApi: Function,
  title: string,
  userId: string
):Promise<SpotifyPlaylistType> => {
  const { data } = await callSpotifyApi({
    method: 'POST',
    path: `users/${userId}/playlists`,
    data: {
      name: title,
    }
  });
  return data;
}

export const updateSpotifyPlaylistWithNewTrack = async (
  playlistId: string,
  position: number,
  uri: string,
  callSpotifyApi: Function
):Promise<void> => {
  await callSpotifyApi({
    data: {
      uris: [uri],
      position,
    },
    method: "POST",
    path: `playlists/${playlistId}/tracks`,
  });
}


