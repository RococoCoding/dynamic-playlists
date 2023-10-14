import { ENVIRONMENTS, ERROR_ACTIONS, REACT_APP_ENV, SLOT_TYPES_MAP_BY_ID, SLOT_TYPES_MAP_BY_NAME, SLOT_TYPES_THAT_REQUIRE_ARTIST } from "../constants";
import { FullSlot, PoolTrack, SpotifyAlbumType } from "../types";
import callApi from "./callApi";

export const requiresArtist = (type: keyof typeof SLOT_TYPES_MAP_BY_ID | keyof typeof SLOT_TYPES_MAP_BY_NAME) => {
  if (typeof type === 'string') {
    return SLOT_TYPES_THAT_REQUIRE_ARTIST.includes(SLOT_TYPES_MAP_BY_NAME[type]);
  }
  return SLOT_TYPES_THAT_REQUIRE_ARTIST.includes(type);
};  

export const getErrorMessage = (error: any) => error?.response?.data?.error?.message || error?.response?.data?.error || error?.message || error;

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
  const { data } = await callSpotifyApi(input);
  if (data) {
    const tracks = data.items.map(({ id, name, artists }: SpotifyAlbumType) => ({
      // pool_id: poolId,
      // includes name for console logs / convenience in debugging
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
    throw new Error('No tracks returned.')
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
        if (REACT_APP_ENV === ENVIRONMENTS.development) {
          console.log('Expected pool_id & pool_spotify_id for album slot')
        }
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
        if (REACT_APP_ENV === ENVIRONMENTS.development) {
          console.log('Expected pool_id & pool_spotify_id for artist slot')
        }
        return;
      }
      // get artist albums
      const { errorMsg, data } = await callSpotifyApi({
        method: 'GET',
        path: `artists/${pool_spotify_id}/albums`,
      });
      if (errorMsg) {
        if (REACT_APP_ENV === ENVIRONMENTS.development) {
          console.log('Error clearing playlist in Spotify', errorMsg);
        }
        return;
      }
      const { items } = data;
      // get tracks from each album
      const allTracks = (await Promise.all(items.map(async (album: any) => {
        if (album.album_group !== 'appears_on') {
          return getAlbumTracks(album.id, callSpotifyApi)
        }
      }))).filter(item => !!item).flat();
      if (allTracks.length) {
        // pick a track
        const track = pickRandomTrack(allTracks);
        if (track) {
          // console.log('picking track', track.name, track.spotify_track_id);
          spotifyId = track.spotify_track_id;
        }
      }
      break;
    default: {
      if (REACT_APP_ENV === ENVIRONMENTS.development) {
        console.log('Unexpected slot type', type); 
      }
    }
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
    if (REACT_APP_ENV === ENVIRONMENTS.development) {
      console.log('No spotifyId added for slot: ', slotId, ' name: ', name);
    }
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

export const throwReauthError = (message: string) => {
  const error: any = new Error(message);
  error.action = ERROR_ACTIONS.reauth;
  throw error;
};

export const setWebPlayback = async (callSpotifyApi: Function, deviceId: string) => {
  return callSpotifyApi({
    data: {
      device_ids: [deviceId],
      play: false
    },
    method: "PUT",
    path: "me/player",
  });
}

