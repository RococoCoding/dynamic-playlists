import { useNavigate } from "react-router-dom";
import { getErrorMessage } from ".";
import getAuthorizeSpotifyArgs from "./authorizeSpotify";
import callApi from "./callApi";
import { getRefreshToken, setTokens } from "./tokens";

const useRefreshToken = () => {
  const navigate = useNavigate();
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