import { ENVIRONMENTS, REACT_APP_ENV } from "../constants";
import { getDpUser } from "../utils/users/dp";
import { getSpotifyUser } from "../utils/users/spotify";
import useSpotifyApi from "../utils/useSpotifyApi";
import { useNavigate } from "react-router-dom";
import getAuthorizeSpotifyArgs from "../utils/authorizeSpotify";
import { setUserId, userId } from "../utils";

function Login() {
  const { callSpotifyApi } = useSpotifyApi();
  const navigate = useNavigate();

  const startLogin = async () => {
    if (userId) {
      // if userId is in state, we should already be logged in
      navigate('/home/' + userId);
    } else {
      try {
        // otherwise, attempt to get spotify user, which will trigger token refresh / authorization flow
        const spotifyUser = await getSpotifyUser(callSpotifyApi);
        if (spotifyUser) {
          const { id: spotifyUserId } = spotifyUser;
          setUserId(spotifyUserId);
          // double-check dp user exists too
          const dpUser = await getDpUser(spotifyUserId);
          if (dpUser) {
            navigate('/home/' + spotifyUserId);
          } else {
            throw new Error(`Matching Dp user does not exist for Spotify user ${spotifyUserId}`);
          }
        }
      } catch (e: any) {
        if (REACT_APP_ENV === ENVIRONMENTS.development) {
          console.log('error getting spotify user', e);
        }
        const args = await getAuthorizeSpotifyArgs();
        window.location.href = 'https://accounts.spotify.com/authorize?' + args;
      }
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <button data-testid="login" className="btn-spotify" onClick={() => startLogin()} >
          Login with Spotify
        </button>
      </header>
    </div>
  );
}

export default Login;
