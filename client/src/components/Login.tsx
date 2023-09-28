import useSpotifyApi from "../utils/useSpotifyApi";
import { useUserContext } from "../contexts/user";
import callApi from "../utils/callApi";
import authorizeSpotify from "../utils/authorizeSpotify";
import { tokenExists } from "../utils";

function Login() {
  const { callSpotifyApi } = useSpotifyApi();
  const { setUserIdContext } = useUserContext();
  const accessToken = localStorage.getItem('access_token');
  const previouslyAuthorized = tokenExists(accessToken);

  const startLogin = async () => {
    if (previouslyAuthorized) {
      // TODO: refactor to one function that can also be used in RequstToken
      // get spotify user id
      const { data: { id: spotifyUserId } } = await callSpotifyApi({
        method: "GET",
        path: "me",
      });
      // double-check user exists in dp db as well
      if (spotifyUserId) {
        const { data: dpUser } = await callApi({
          method: 'GET',
          path: `users/${spotifyUserId}`,
        });
        if (dpUser) {
          setUserIdContext(dpUser.id);
          // @ts-expect-error
          window.location = '/home/' + dpUser.id;
        } else {
          console.log('User not found in db. Attempting re-authorization.')
          await authorizeSpotify();
        }
      } else {
        console.log('Spotify user id not found. Attempting re-authorization.')
        await authorizeSpotify();
      }
    } else {
      await authorizeSpotify();
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
