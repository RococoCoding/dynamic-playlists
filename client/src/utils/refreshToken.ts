import { ENVIRONMENTS, REACT_APP_ENV } from "../constants";
import callApi from "./callApi";
import { setTokens } from "./tokens";

const useRefreshToken = () => {
  const refreshToken = localStorage.getItem('refresh_token');

  const getNewToken = async (): Promise<string | void> => {
    if (REACT_APP_ENV === ENVIRONMENTS.development) {
      console.log('refreshing token', refreshToken)
    }
    try {
      const { data } = await callApi({
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
      const { access_token, refresh_token } = data;
      try {
        const oldAccessToken = localStorage.getItem('access_token');
        console.log('old / new refresh token', refreshToken, refresh_token);
        console.log('old / new access token', oldAccessToken, access_token);
        setTokens(access_token, refresh_token);
        const newSavedAccessToken = localStorage.getItem('access_token');
        const newSavedRefreshToken = localStorage.getItem('refresh_token');
        console.log('new saved tokens. acccess / refresh', newSavedAccessToken, newSavedRefreshToken);
        return access_token;
      } catch (e: any) {
        throw new Error(`Error setting tokens: ${e.message || e}`);
      }
    } catch (e: any) {
      throw e;
    }
  };
  return { getNewToken };
};
export default useRefreshToken;