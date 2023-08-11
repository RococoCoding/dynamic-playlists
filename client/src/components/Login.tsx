import { SERVER_BASE_URL } from "../constants";

function Login() {
  return (
    <div className="App">
      <header className="App-header">
        <a data-testid="login" className="btn-spotify" href={`${SERVER_BASE_URL}auth/login`} >
          Login with Spotify
        </a>
      </header>
    </div>
  );
}

export default Login;
