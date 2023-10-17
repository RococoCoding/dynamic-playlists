import callApi from "./callApi";
import { getRefreshToken, setTokens } from "./tokens";

const useRefreshToken = () => {
  const getNewToken = async (): Promise<string | void> => {
    const refreshToken = getRefreshToken();
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
      const { access_token: newAccessToken, refresh_token: newRefreshToken } = data;
      try {
        setTokens(newAccessToken, newRefreshToken);
        return newAccessToken;
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