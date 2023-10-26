import { useEffect } from "react";
import useSpotifyApi from "../utils/useSpotifyApi";
import { requestSpotifyTokens, setTokens } from "../utils/tokens";
import { getDpUser } from "../utils/users/dp";
import { getSpotifyUser } from "../utils/users/spotify";
import { ENVIRONMENTS, REACT_APP_ENV } from "../constants";
import { useNavigate } from "react-router-dom";
import { setUserId } from "../utils";
import { useSnackbarContext } from "../contexts/snackbar";

// Callback function after user authorizes the DP app with Spotify.
// Retrieves access & refresh tokens and fetches the user.
function RequestToken() {
  const { callSpotifyApi } = useSpotifyApi();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  let code = urlParams.get('code');
  const { setErrorSnackbar } = useSnackbarContext();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // get access & refresh tokens
        const { data } = await requestSpotifyTokens(callSpotifyApi, code);
        if (data) {
          try {
            setTokens(data.access_token, data.refresh_token);
          } catch {
            if (ENVIRONMENTS.development) {
              console.log('Error setting tokens.', data);
            }
            throw new Error('Error setting tokens.');
          }
        } else {
          throw new Error('No tokens received.');
        }
        // get spotify profile with user id
        const { id: spotifyUserId } = (await getSpotifyUser(callSpotifyApi)) || {};
        setUserId(spotifyUserId);
        // get / upsert dp user
        if (spotifyUserId) {
          const newDpUser = await getDpUser(spotifyUserId);
          if (newDpUser) {
            navigate(`/home/${newDpUser.id}`);
          }
        }
      } catch (e: any) {
        if (REACT_APP_ENV === ENVIRONMENTS.development) {
          console.log('Error authenticating: ', e);
        }
        setErrorSnackbar(`Error authenticating. Please refresh the page and try again.`);
        navigate('/');
      }
    }
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  return (
    <div>Oops, something went wrong!
      <a href="/">Return to home</a>
    </div>
  );
}

export default RequestToken;


