import { setTokens } from ".";
import authorizeSpotify from "./authorizeSpotify";
import callApi from "./callApi";

const useRefreshToken = () => {
  const refreshToken = localStorage.getItem('refresh_token');

  const getNewToken = async (): Promise<string | null> => { 
    console.log('refreshing token', refreshToken)
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
    try {
      const oldAccessToken = localStorage.getItem('access_token');
      console.log('old / new refresh token', refreshToken, refresh_token);
      console.log('old / new access token', oldAccessToken, access_token);
      setTokens(access_token, refresh_token);
      const newSavedAccessToken = localStorage.getItem('access_token');
      const newSavedRefreshToken = localStorage.getItem('refresh_token');
      console.log('new saved tokens. acccess / refresh', newSavedAccessToken, newSavedRefreshToken);
    } catch (e) {
      console.log('Error setting tokens: ', e);
    }
    return access_token;
  };
  return { getNewToken };
};
export default useRefreshToken;