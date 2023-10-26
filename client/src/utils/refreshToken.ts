import { useNavigate } from "react-router-dom";
import { getErrorMessage, userId } from ".";
import getAuthorizeSpotifyArgs from "./authorizeSpotify";
import callApi from "./callApi";
import { getRefreshToken, setTokens } from "./tokens";
import { SERVER_BASE_URL } from "../constants";

const useRefreshToken = () => {
  const navigate = useNavigate();
  const getDpToken = async (accessToken: string) => {
    const { data: dpToken } = await callApi({
      baseUrl: `${SERVER_BASE_URL}auth/`,
      method: 'POST',
      path: 'token',
      data: { username: userId, accessToken }
    });
    if (!dpToken) {
      throw new Error(`Missing dpToken: ${dpToken}`);
    }
    return dpToken;
  };  
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
      if (!newAccessToken || !newRefreshToken) {
        throw new Error(`Missing tokens: \nAccess: ${newAccessToken}, \nRefresh: ${newRefreshToken}`);
      }
      try {
        setTokens(newAccessToken, newRefreshToken);
        await getDpToken(newAccessToken);
        return newAccessToken;
      } catch (e: any) {
        throw new Error(`Error setting tokens: ${e.message || e}`);
      }
    } catch (e: any) {
      const errorMsg = getErrorMessage(e);
      if (typeof errorMsg === 'string' && (errorMsg.includes('revoked') || errorMsg.includes('refresh_token must be supplied'))) {
        const args = await getAuthorizeSpotifyArgs();
        navigate('https://accounts.spotify.com/authorize?' + args);
        return;
      }
      throw e;
    }
  };
  return { getNewToken };
};
export default useRefreshToken;