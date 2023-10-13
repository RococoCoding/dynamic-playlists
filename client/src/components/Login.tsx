import { useUserContext } from "../contexts/user";
import authorizeSpotify from "../utils/authorizeSpotify";
import { ENVIRONMENTS, REACT_APP_ENV } from "../constants";
import { useSnackbarContext } from "../contexts/snackbar";

function Login() {
  const { userId } = useUserContext();
  const { setErrorSnackbar } = useSnackbarContext();

  const startLogin = async () => {
    console.log('starting login')
    try {
      if (userId) {
        window.location.href = '/home/' + userId;
      } else {
        console.log('authorizing spotify');
        await authorizeSpotify();
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
