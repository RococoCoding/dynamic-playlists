export const getAccessToken = () => {
  return localStorage.getItem('access_token');
}

export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
}

export const setTokens = (accessToken: string, refreshToken: string) => {
  if (!tokenExists(accessToken) && !tokenExists(refreshToken)) {
    throw new Error(`Missing or invalid token: ${accessToken}, ${refreshToken}`);
  }
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

export const getDpToken = () => {
  return localStorage.getItem('dp_token');
}

export const setDpToken = (token: string) => {
  localStorage.setItem('dp_token', token);
}

export const tokenExists = (token?: string | null) => !!token && token !== 'undefined';

export const requestSpotifyTokens = async (callSpotifyApi: Function, code: string | null) => {
  if (!code) {
    throw new Error('Cannot request tokens without code');
  }
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

  return callSpotifyApi({
    baseUrl: 'https://accounts.spotify.com/api/',
    method: 'POST',
    path: 'token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: body,
  }, { skipToken: true })
}
