import axios from 'axios';
import { ENVIRONMENTS, REACT_APP_ENV, SERVER_BASE_URL } from '../constants';
import { tokenExists } from './tokens';

type Props = {
  baseUrl?: string;
  method: string;
  path: string;
  data?: any;
  token?: string;
  headers?: Header;
  signal?: AbortSignal;
}

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
  token,
  headers,
  signal,
}: Props): Promise<{ data: any }> => {
  try {
    const axiosInput: AxiosInput = {
      method,
      url: `${baseUrl || `${SERVER_BASE_URL}api/`}${path}`,
      data,
      ...(signal ? { signal } : {}),
      ...(headers ? { headers } : {})
    }
    if (tokenExists(token)) {
      axiosInput.headers = { ...axiosInput.headers, Authorization: `Bearer ${token}` }
    }
    const res = await axios(axiosInput);
    if (res.data.error) {
      throw new Error(res.data.error?.message || res.data.error);
    }
    return { data: res.data };
  } catch (error: any) {
    if (REACT_APP_ENV === ENVIRONMENTS.development) {
      console.log('callApi input', { baseUrl, method, path, data: JSON.stringify(data), token });
      console.error('callApi error', error);
    }
    throw error;
  }
};

export default callApi;
