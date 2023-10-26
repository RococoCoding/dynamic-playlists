import axios from 'axios';
import { DP_ERROR_CODES, ENVIRONMENTS, REACT_APP_ENV, SERVER_BASE_URL } from '../constants';
import { getAccessToken, getDpToken, setDpToken, tokenExists } from './tokens';
import { getErrorMessage, getUserId } from '.';
import { CallApiProps } from '../types';

type Header = {
  Authorization?: string;
  'Content-Type'?: string;
}

type AxiosInput = {
  method: string;
  url: string;
  data?: any;
  headers?: Header;
}

const callApi = async ({
  baseUrl,
  method,
  path,
  data,
  headers = {},
}: CallApiProps): Promise<{ data: any }> => {
  try {
    if (!SERVER_BASE_URL) {
      throw new Error('Missing server base url');
    }
    const url = `${baseUrl || `${SERVER_BASE_URL}api/`}${path}`;
    if (url.includes(SERVER_BASE_URL)) {
      const token = getDpToken();
      if (!token || !tokenExists(token)) {
        throw new Error(`Missing dp token: ${token}`);
      }
      headers.Authorization = token;
    }
    const axiosInput: AxiosInput = {
      method,
      url,
      data,
      headers,
    }
    const res = await axios(axiosInput);
    return { data: res.data };
  } catch (error: any) {
    const token = getAccessToken()
    if (REACT_APP_ENV === ENVIRONMENTS.development) {
      console.log('callApi input', { baseUrl, method, path, data: JSON.stringify(data), token });
      console.error('callApi error', getErrorMessage(error), error);
    }
    if (error.response?.data?.error) {
      if (error.response?.data?.error?.code === DP_ERROR_CODES.requestToken && tokenExists(token)) {
        const userId = getUserId();
        // request new dp token
        const tokenInput: AxiosInput = {
          method: 'POST',
          url: `${SERVER_BASE_URL}auth/token`,
          data: { username: userId, accessToken: token },
        }
        const { data: dpToken } = await axios(tokenInput);
        setDpToken(dpToken);
        // retry callApi
        const res = await callApi({ baseUrl, method, path, data, token: dpToken, headers });
        return { data: res.data }
      }
    }
    throw error;
  }
};

export default callApi;
