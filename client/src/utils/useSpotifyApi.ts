import { tokenExists } from ".";
import { SPOTIFY_BASE_URL } from "../constants";
import callApi from "./callApi";
import { redirect } from 'react-router-dom';
import useRefreshToken from "./refreshToken";


type InputProps = {
  baseUrl?: string;
  method: string;
  path: string;
  data?: any;
  headers?: any;
}

type OptionProps = {
  dataAsQueryParams?: boolean;
  skipToken?: boolean;
}

type Input = {
  baseUrl?: string;
  method: string;
  path: string;
  data?: any;
  headers?: any;
  token?: string;
}

const useSpotifyApi = () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const { getNewToken } = useRefreshToken();

  const callSpotifyApi = async (
    input: InputProps,
    options: OptionProps = {},
    ): Promise<any> => {
    let path = input.path;

    // option to convert data to query params
    if (options.dataAsQueryParams) {
      const params = new URLSearchParams(input.data);
      path = `${path}?${params.toString()}`;
    }
    let res;
    if (!options.skipToken && !tokenExists(accessToken) && !tokenExists(refreshToken)) {
      console.log('no access or refresh token, redirecting to login');
      redirect('/login');
    } else {
      if (tokenExists(accessToken)) {
        const callApiInput: Input = {
          baseUrl: SPOTIFY_BASE_URL,
          ...input,
          path,
        }
        // skip token for authoriztion / initial token requests
        if (!options.skipToken) {
          callApiInput.token = accessToken as string;
        }
        res = await callApi(callApiInput);
      }
      const accessTokenExpired = res.errorMsg && res.errorMsg.includes('expired');
      if (!accessToken || accessTokenExpired) {
        const newAccessToken = await getNewToken();
        if (newAccessToken) {
          return callApi({
            baseUrl: SPOTIFY_BASE_URL,
            ...input,
            token: newAccessToken,
            path,
          })
        } else {
          return { errorMsg: 'Failed to refresh token' }
        }
      }
      return res;
    }
  };

  return { callSpotifyApi };
}

export default useSpotifyApi;