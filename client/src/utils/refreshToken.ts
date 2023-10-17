import { ENVIRONMENTS, REACT_APP_ENV } from "../constants";
import callApi from "./callApi";
import { setTokens } from "./tokens";

const useRefreshToken = () => {
  const getNewToken = async (): Promise<string | void> => {
    const refreshToken = localStorage.getItem('refresh_token');
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
        if (REACT_APP_ENV === ENVIRONMENTS.development) {
          console.log(`refresh token: \n  old: ${refreshToken} \n\n  new: ${refresh_token}`);
          console.log(`access token: \n  old: ${oldAccessToken} \n\n  new: ${access_token}`);
        }
        setTokens(access_token, refresh_token);
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