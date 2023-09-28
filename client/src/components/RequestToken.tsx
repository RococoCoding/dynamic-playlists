import { useEffect, useState } from "react";
import callApi from "../utils/callApi";
import useSpotifyApi from "../utils/useSpotifyApi";
import { useUserContext } from "../contexts/user";

function RequestToken() {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const { callSpotifyApi } = useSpotifyApi();
  const { setUserIdContext } = useUserContext();
  const urlParams = new URLSearchParams(window.location.search);
  let code = urlParams.get('code');
  const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;

  let codeVerifier = localStorage.getItem('code_verifier');
  const bodyObject = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier
  } as Record<string, string>;
  let body = new URLSearchParams(bodyObject);

  const access_token = localStorage.getItem('access_token');
  useEffect(() => {
    if (!access_token) {
      setErrorMsg('Error: Could not retrieve access token.');
      return;
    }
    const fetchUser = async () => {
      // get access & refresh tokens
      const { data } = await callSpotifyApi({
        baseUrl: 'https://accounts.spotify.com/api/',
        method: 'POST',
        path: 'token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: body,
      })
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      // get spotify profile with user id
      const { data: { id: spotifyUserId } } = await callSpotifyApi({
        method: "GET",
        path: "me",
      });
      // get / upsert dp user
      if (spotifyUserId) {
        const { data: newDpUser } = await callApi({
          method: 'GET',
          path: `users/${spotifyUserId}`,
        });
        if (newDpUser) {
          setUserIdContext(newDpUser.id);
          // @ts-expect-error
          window.location = `/home/${newDpUser.id}`;
        }
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


