import authorizeSpotify from "./authorizeSpotify";
import callApi from "./callApi";

const useRefreshToken = () => {
  const refreshToken = localStorage.getItem('refresh_token');

  const getNewToken = async (): Promise<string | null> => { 
    const { errorMsg, data } = await callApi({
      method: 'POST',
      baseUrl: 'https://accounts.spotify.com/api/',
      path: 'token',
      data: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    if (errorMsg) {
      console.log('Failed to refresh token. Attempting to reauthorize.', errorMsg); 
      authorizeSpotify();
      return null;
    }
    const { access_token, refresh_token } = data;
    if (!access_token) {
      throw new Error('Missing access token');
    }
    if (!refresh_token) {
      throw new Error('Missing refresh token');
    }
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('access_token', access_token);
      return access_token;
  };
  return { getNewToken };
};
export default useRefreshToken;