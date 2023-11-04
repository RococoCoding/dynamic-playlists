import { PlaylistType, PlaylistWithSlots } from "../../types";
import callApi from "../callApi";
import { sortSlots } from "../slots";

export const createDpPlaylist = async (title: string, userId: string):Promise<Array<PlaylistType>> => {
  const { data: updatedUserPlaylists } = await callApi({
    method: 'POST',
    path: 'playlists?return_all=true',
    data: {
      created_by: userId,
      last_updated_by: userId,
      title
    }
  });
  return updatedUserPlaylists;
}

export const deleteDpPlaylist = async (playlistId: string):Promise<Array<PlaylistType>> => {
  const { data: updatedUserPlaylists } = await callApi({
    method: 'DELETE',
    path: `playlists/${playlistId}?return_all=true`,
  });
  return updatedUserPlaylists;
}

export const getPlaylistWithSlots = async (playlistId: string):Promise<PlaylistWithSlots> => {
  const { data: playlist } = await callApi({
    method: 'GET',
    path: `playlists/${playlistId}?include=slots`,
  });
  const sorted = sortSlots(playlist.slots);
  return { ...playlist, slots: sorted };
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


