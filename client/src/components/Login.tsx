import { useUserContext } from "../contexts/user";
import authorizeSpotify from "../utils/authorizeSpotify";
import { ENVIRONMENTS, REACT_APP_ENV } from "../constants";
import { useSnackbarContext } from "../contexts/snackbar";
import { getDpUser } from "../utils/users/dp";
import { getSpotifyUser } from "../utils/users/spotify";
import useSpotifyApi from "../utils/useSpotifyApi";

function Login() {
  const { userId } = useUserContext();
  const { setErrorSnackbar } = useSnackbarContext();
  const { callSpotifyApi } = useSpotifyApi();
  const { setUserIdContext } = useUserContext();

  const startLogin = async () => {
    try {
      if (userId) {
        window.location.href = '/home/' + userId;
      } else {
        try {
          const spotifyUser = await getSpotifyUser(callSpotifyApi);
          if (spotifyUser) {
            const { id: spotifyUserId } = spotifyUser;
            // double-check dp user exists too
            const dpUser = await getDpUser(spotifyUserId);
            if (dpUser) {
              setUserIdContext(spotifyUserId);
              window.location.href = '/home/' + spotifyUserId;
            } else {
              throw new Error(`Matching Dp user does not exist for Spotify user ${spotifyUserId}`);
            }
          }
        } catch (e: any) {
          if (REACT_APP_ENV === 'development') {
            console.log('error getting spotify user', e);
          }
          await authorizeSpotify();
        }
      }
    } catch (e: any) {
      if (REACT_APP_ENV === ENVIRONMENTS.development) {
        console.log('Error logging in: ', e);
      }
      setErrorSnackbar('Error logging in. Please refresh the page and try again.');
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
