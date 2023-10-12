import { PlaylistType, PlaylistWithSlots } from "../../types";
import callApi from "../callApi";

export const createDpPlaylist = async (title: string, userId: string):Promise<PlaylistType> => {
  const { data } = await callApi({
    method: 'POST',
    path: 'playlists',
    data: {
      created_by: userId,
      last_updated_by: userId,
      title
    }
  });
  return data;
}

export const deleteDpPlaylist = async (playlistId: string):Promise<void> => {
  await callApi({
    method: 'DELETE',
    path: `playlists/${playlistId}`,
  });
}

export const getDpPlaylistBySpotifyId = async (playlistId: string):Promise<PlaylistWithSlots> => {
  const { data } = await callApi({
    method: 'GET',
    path: `playlists/by-spotify-id/${playlistId}`,
  })
  return data;
}

export const getAllUserPlaylists = async (userId?: string):Promise<Array<PlaylistType>> => {
  if (!userId) {
    throw new Error('Cannot retrieve user playlists without user id.');
  }
  const { data } = await callApi({
    method: 'GET',
    path: `playlists/by-user/${userId}`
  });
  return data;
}

export const linkSpotifyPlaylistToDpPlaylist = async (
  playlistId: string,
  spotifyPlaylistId: string,
  userId: string
):Promise<PlaylistType> => {
  const { data } = await callApi({
    method: 'PUT',
    path: `playlists/${playlistId}`,
    data: {
      spotify_id: spotifyPlaylistId,
      last_updated_by: userId,
    }
  });
  return data;
}


