import useSpotifyApi from "../utils/useSpotifyApi";
import { useUserContext } from "../contexts/user";
import authorizeSpotify from "../utils/authorizeSpotify";
import { tokenExists } from "../utils/tokens";
import { getDpUser } from "../utils/users/dp";
import { getSpotifyUser } from "../utils/users/spotify";
import { ENVIRONMENTS } from "../constants";
import { useSnackbarContext } from "../contexts/snackbar";

function Login() {
  const { callSpotifyApi } = useSpotifyApi();
  const { setUserIdContext } = useUserContext();
  const { setErrorSnackbar } = useSnackbarContext();
  const accessToken = localStorage.getItem('access_token');
  const previouslyAuthorized = tokenExists(accessToken);

  const startLogin = async () => {
    try {
      if (previouslyAuthorized) {
        if (process.env.NODE_ENV === ENVIRONMENTS.development) {
          console.log('User previously authorized. Checking for user data.');
        }
        // get spotify user id
        const spotifyUser = await getSpotifyUser(callSpotifyApi);
        if (!spotifyUser) {
          if (process.env.NODE_ENV === ENVIRONMENTS.development) {
            console.log('No user data found. Attempting re-authorization.');
          }
          await authorizeSpotify();
        } else {
          const { id: spotifyUserId } = spotifyUser;
          // double-check user exists in dp db as well
          if (spotifyUserId) {
            const dpUser = await getDpUser(spotifyUserId);
            if (dpUser) {
              setUserIdContext(dpUser.id);
              // @ts-expect-error
              window.location = '/home/' + dpUser.id;
            } else {
              if (process.env.NODE_ENV === ENVIRONMENTS.development) {
                console.log('User not found in db. Attempting re-authorization.')
              }
              await authorizeSpotify();
            }
          } else {
            if (process.env.NODE_ENV === ENVIRONMENTS.development) {
              console.log('Spotify user id not found. Attempting re-authorization.')
            }
            await authorizeSpotify();
          }
        }
      } else {
        await authorizeSpotify();
      }
    } catch (e: any) {
      if (process.env.NODE_ENV === ENVIRONMENTS.development) {
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
