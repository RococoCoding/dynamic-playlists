import { SLOT_TYPES_MAP_BY_ID, SLOT_TYPES_MAP_BY_NAME, SLOT_TYPES_THAT_REQUIRE_ARTIST } from "../constants";
import { FullSlot, PoolTrack, SpotifyAlbumType } from "../types";
import callApi from "./callApi";

export const requiresArtist = (type: keyof typeof SLOT_TYPES_MAP_BY_ID | keyof typeof SLOT_TYPES_MAP_BY_NAME) => {
  if (typeof type === 'string') {
    return SLOT_TYPES_THAT_REQUIRE_ARTIST.includes(SLOT_TYPES_MAP_BY_NAME[type]);
  }
  return SLOT_TYPES_THAT_REQUIRE_ARTIST.includes(type);
};  

export const getToken = () => {
  return localStorage.getItem('access_token');
}

export const setTokens = (accessToken: string, refreshToken: string) => {
  if (!tokenExists(accessToken) && !tokenExists(refreshToken)) {
    throw new Error(`Missing or invalid token: ${accessToken}, ${refreshToken}`);
  }
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

export const tokenExists = (token?: string | null) => !!token && token !== 'undefined';

export const getErrorMessage = (error: any) => error?.response?.data?.error?.message || error?.response?.data?.error || error?.message;
type PoolTrackWithName = PoolTrack & { name?: string };
const pickRandomTrack = (pool: PoolTrackWithName[]) => {
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

const getAlbumTracks = async (spotifyId: string, callSpotifyApi: Function): Promise<Array<PoolTrack> | undefined> => {
  // TODO: rework pools
  // if (poolNeedsUpdating) {
  const input = {
    method: 'GET',
    path: `albums/${spotifyId}/tracks`,
  }
  const { errorMsg, data } = await callSpotifyApi(input);
  if (!errorMsg && data) {
    const tracks = data.items.map(({ id, name, artists }: SpotifyAlbumType) => ({
      // pool_id: poolId,
      name,
      spotify_track_id: id,
      spotify_artist_ids: artists.map((artist: any) => artist.id)
    }));
    // save tracks to pool
    // console.log('saving tracks to pool');
    // await callApi({
    //   method: 'POST',
    //   path: `pool-tracks/by-pool/${poolId}`,
    //   data: tracks,
    // });
    return tracks;
  } else {
    console.log('Could not retrieve tracks from spotify', errorMsg)
    console.log('callSpotifyApi input', input)
  }
  // }
  // const input = {
  //   method: 'GET',
  //   path: `pool-tracks/by-pool/${poolId}`,
  //   token: currToken,
  // }
  // const { errorMsg, data } = await callApi(input);
  // if (!errorMsg && data) {
  //   return data;
  // } else {
  //   console.log('Could not retrieve tracks from db', errorMsg)
  //   console.log('callApi input', input)A
  // }
}
export const getRandomTrack = async (slot: FullSlot, callSpotifyApi: Function) => {
  const { id: slotId, type, name, pool_id, pool_spotify_id } = slot;
  let spotifyId = pool_spotify_id;
  // TODO: figure out if this is timing I want for updating
  // const poolNeedsUpdating = !pool_last_updated || new Date(pool_last_updated) < new Date(playlist.last_updated);
  switch (type) {
    case SLOT_TYPES_MAP_BY_NAME.track:
      break;
    case SLOT_TYPES_MAP_BY_NAME.album:
      if (!pool_id || !pool_spotify_id) {
        console.log('Expected pool_id & pool_spotify_id for album slot')
        return;
      }
      // get album tracks
      const albumTracks = await getAlbumTracks(pool_spotify_id, callSpotifyApi);
      if (albumTracks) {
        // pick a track
        const track = pickRandomTrack(albumTracks);
        if (track) {
          // console.log('picking track', track.name, track.spotify_track_id);
          spotifyId = track.spotify_track_id;
        }
      }
      break;
    case SLOT_TYPES_MAP_BY_NAME.artist:
      if (!pool_id || !pool_spotify_id) {
        console.log('Expected pool_id & pool_spotify_id for artist slot')
        return;
      }
      // get artist albums
      const { errorMsg, data } = await callSpotifyApi({
        method: 'GET',
        path: `artists/${pool_spotify_id}/albums`,
      });
      if (errorMsg) {
        console.log('Error clearing playlist in Spotify', errorMsg);
        return;
      }
      const { items } = data;
      // get tracks from each album
      const allTracks = (await Promise.all(items.map(async (album: any) => getAlbumTracks(album.id, callSpotifyApi)))).flat();
      if (allTracks.length) {
        // pick a track
        const track = pickRandomTrack(allTracks);
        if (track) {
          // console.log('picking track', track.name, track.spotify_track_id);
          spotifyId = track.spotify_track_id;
        }
      }
      break;
    default: console.log('Unexpected slot type', type);
    // copilot just threw this in. Will check it later when I implement playlist support
    // case SLOT_TYPES_MAP_BY_NAME.playlist:
    //   // get playlist tracks
    //   const { errorMsg: errorMsg2, data: data2 } = await callSpotifyApi({
    //     method: 'GET',
    //     path: `playlists/${pool_spotify_id}/tracks`,
    //     token: currToken,
    //   });
    //   if (errorMsg2) {
    //     console.log('Error clearing playlist in Spotify', errorMsg2);
    //     return;
    //   }
    //   const { items: playlistTracks } = data2;
    //   // save playlist tracks to pool
    //   await callApi({
    //     method: 'POST',
    //     path: 'pool-tracks/',
    //     data: playlistTracks.map(({ track }: any) => ({
    //       pool_id,
  }
  if (!spotifyId) {
    console.log('No spotifyId added for slot: ', slotId, ' name: ', name);
  } else {
    await callApi({
      method: 'PUT',
      path: `slots/${slotId}`,
      data: {
        current_track: spotifyId,
        pool_spotify_id,
      }
    });
    return `spotify:track:${spotifyId}`;
  }
}

export const getDpPlaylist = async (playlistId: string) => {
  return callApi({
    method: 'GET',
    path: `playlists/by-spotify-id/${playlistId}`,
  })
}

export const getSpotifyPlaylist = async (playlistId: string, callSpotifyApi: Function) => {
  return callSpotifyApi({
    method: 'GET',
    path: `playlists/${playlistId}`,
  });
}

export const updateSlotWithNewTrack = async (slotId: string, trackId: string) => {
  return callApi({
    method: 'PUT',
    path: `slots/${slotId}`,
    data: {
      current_track: trackId,
    }
  });
}

export const updateSpotifyPlaylistWithNewTrack = async (
  playlistId: string,
  position: number,
  uri: string,
  callSpotifyApi: Function
) => {
  console.log('adding track to spotify playlist', {
    data: {
      uris: [uri],
      position,
    },
    method: "POST",
    path: `playlists/${playlistId}/tracks`,
  })
  return callSpotifyApi({
    data: {
      uris: [uri],
      position,
    },
    method: "POST",
    path: `playlists/${playlistId}/tracks`,
  });
}

export const deleteTrackFromSpotifyPlaylist = async (
  playlistId: string,
  snapshotId: string,
  callSpotifyApi: Function,
  uri?: string,
) => {
  if (!uri) {
    throw new Error('missing uri');
  }
  return callSpotifyApi({
    data: {
      tracks: [{ uri }],
      snapshotId,
    },
    method: "DELETE",
    path: `playlists/${playlistId}/tracks`,
  });
}

export const playPlaylistInSpotify = async (callSpotifyApi: Function, playlistId?: string, ) => {
  if (!playlistId) {
    throw new Error('Missing Spotify playlistId');
  }
  return callSpotifyApi({
      method: 'PUT',
      path: `me/player/play`,
      data: {
        context_uri: `spotify:playlist:${playlistId}`,
        position_ms: 0,
      },
    });
}