import axios from 'axios';
import { SERVER_BASE_URL } from '../constants';
import { getErrorMessage, tokenExists } from '.';

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
}: Props): Promise<any> => {
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
    return {
      data: res.data,
    };
  } catch (error: any) {
    const errorMsg = getErrorMessage(error);
    console.log('callApi input: ', { baseUrl, method, path, data, token });
    console.error('callApi error: ', errorMsg, error);
    return {
      errorMsg,
    };
  }
};

export default callApi;
