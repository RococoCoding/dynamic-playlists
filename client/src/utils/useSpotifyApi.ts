import { getErrorMessage, throwReauthError } from ".";
import { SPOTIFY_BASE_URL } from "../constants";
import callApi from "./callApi";
import useRefreshToken from "./refreshToken";
import { getAccessToken, getRefreshToken, tokenExists } from "./tokens";


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
  userId?: string;
}

const useSpotifyApi = () => {
  const { getNewToken } = useRefreshToken();

  /**
 * Note: Because this function is a hook, it needs to be passed into
 * helper functions (non-component/non-hook fns) as a callback.
 */
  const callSpotifyApi = async (
    input: InputProps,
    options: OptionProps = {},
  ): Promise<any | void> => {
    let accessToken: string | null | void = getAccessToken();
    const refreshToken = getRefreshToken();
    if (!options.skipToken && !tokenExists(accessToken) && !tokenExists(refreshToken)) {
      throwReauthError('Missing tokens.');
    } else {
      let path = input.path;
      // option to convert data to query params
      if (options.dataAsQueryParams) {
        const params = new URLSearchParams(input.data);
        path = `${path}?${params.toString()}`;
      }

      const callApiInput: Input = {
        baseUrl: SPOTIFY_BASE_URL,
        ...input,
        path,
      }
      
      try {
        // add access token if neededd
        if (!options.skipToken) {
          if (!accessToken) {
            accessToken = await getNewToken();
            if (!accessToken) {
              throwReauthError('Failed to refresh: missing access token.');
            }
          }
          callApiInput.headers = { ...(input.headers || {} ), Authorization: `Bearer ${accessToken}` }
        }
        // Note: A return without /await/ won't hit the catch block
        // return await callApi() is fine, but I'm going to declare the var so it's easier to throw in a console log when debugging
        const res = await callApi(callApiInput);
        return res;
      } catch (e: any) {
        const errorMessage = getErrorMessage(e);
        if (errorMessage && typeof errorMessage === 'string' && errorMessage.includes('expired')) {
          const newAccessToken = await getNewToken();
          if (newAccessToken) {
            callApiInput.headers = { ...(input.headers || {} ), Authorization: `Bearer ${newAccessToken}` };
          } else {
            throwReauthError('Failed to refresh: missing access token.');
          }
          const res = await callApi(callApiInput);
          return res;
        }
        throw e;
      }
    };
  }
  return { callSpotifyApi };
}

export default useSpotifyApi;