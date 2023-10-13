import { useEffect, useState } from "react";
import useSpotifyApi from "../utils/useSpotifyApi";
import { useUserContext } from "../contexts/user";
import { requestSpotifyTokens, setTokens } from "../utils/tokens";
import { getDpUser } from "../utils/users/dp";
import { getSpotifyUser } from "../utils/users/spotify";
import { ENVIRONMENTS, REACT_APP_ENV } from "../constants";

// Callback function after user authorizes the DP app with Spotify.
// Retrieves access & refresh tokens and fetches the user.
function RequestToken() {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const { callSpotifyApi } = useSpotifyApi();
  const { setUserIdContext } = useUserContext();
  const urlParams = new URLSearchParams(window.location.search);
  let code = urlParams.get('code');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // get access & refresh tokens
        const { data } = await requestSpotifyTokens(callSpotifyApi, code);
        if (data) {
          try {
            setTokens(data.access_token, data.refresh_token);
          } catch {
            setErrorMsg(`Error: Could not set tokens. ${JSON.stringify(data)}`);
            return;
          }
        } else {
          throw new Error('No tokens received.');
        }
        // get spotify profile with user id
        const { id: spotifyUserId } = (await getSpotifyUser(callSpotifyApi)) || {};
        // get / upsert dp user
        if (spotifyUserId) {
          const newDpUser = await getDpUser(spotifyUserId);
          if (newDpUser) {
            setUserIdContext(newDpUser.id);
            // @ts-expect-error
            window.location = `/home/${newDpUser.id}`;
          }
        }
      } catch (e: any) {
        if (REACT_APP_ENV === ENVIRONMENTS.development) {
          console.log('Error authenticating: ', e);
        }
        setErrorMsg('Error authenticating with Spotify.');
      }
    }
    fetchUser();
  }, []);
  return (
    <div>
      {errorMsg}
    </div>
  );
}

export default RequestToken;


