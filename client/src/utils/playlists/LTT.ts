import { SERVER_BASE_URL } from "../../constants";
import callApi from "../callApi";
import { getAccessToken } from "../tokens";
import { getSpotifyPlaylist, publishSpotifyPlaylist } from "./spotify";

type Props = {
  maxPlaylistLength: number;
  callSpotifyApi: Function;
  userId: string;
}

const populateLTTPlaylist = async ({maxPlaylistLength, callSpotifyApi, userId }: Props) => {
  const { data: user } = await callApi({
    method: 'GET',
    path: 'users/me',
  });
  const { ltt: existingLTT } = user;
  let ltt = existingLTT;
  let spotifyPlaylist;
  if (!existingLTT || !existingLTT.playlist) {
    spotifyPlaylist = await publishSpotifyPlaylist(callSpotifyApi, 'Listen To This', userId);
    const { id } = spotifyPlaylist;
    const { data: newLTT } = await callApi({
      method: 'POST',
      path: `users/${userId}/ltt`,
      data: { spotify_playlist_id: id, max_length: maxPlaylistLength, excluded_genres: []},
    })
    ltt = newLTT;
  } else {
    // TODO: update LTT max length/excluded genres if needed
    spotifyPlaylist = await getSpotifyPlaylist(existingLTT.playlist, callSpotifyApi);
  }
  if (!spotifyPlaylist) {
    throw new Error('Missing Spotify playlist');
  }
  const tracksNeeded = maxPlaylistLength; 
  // fetch posts from reddit
  const spotify_token = getAccessToken();
  const res = await callApi({
    baseUrl: SERVER_BASE_URL,
    method: 'POST',
    path: 'reddit/ltt/new',
    data: { tracksNeeded, spotifyPlaylistId: spotifyPlaylist.id, spotifyToken: spotify_token },
  });

}

export default populateLTTPlaylist;