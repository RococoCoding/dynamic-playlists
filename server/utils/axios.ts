import axios from 'axios';

type Props = {
  baseUrl?: string;
  method: string;
  path: string;
  data?: any;
  token?: string;
  headers?: Header;
  auth?: Auth;
  params?: URLSearchParams;
}

type Header = {
  Authorization?: string;
  'User-Agent'?: string;
}

type Auth = { username: string; password: string; };

type AxiosInput = {
  method: string;
  url: string;
  data?: any;
  headers?: Header;
  auth?: Auth,
  params?: URLSearchParams
}

const useAxios = async ({
  baseUrl,
  method,
  path,
  data,
  token,
  headers,
  auth,
  params
}: Props): Promise<any> => {
  try {
    const axiosInput: AxiosInput = {
        method,
        url: `${baseUrl}${path}`,
        data,
        headers,
        auth,
        params
    }
    if (token) {
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
    console.log('axios input: ', { baseUrl, method, path, data, token, headers });
    console.log('axios error: ', error);
    return {
      errorMsg: error?.message || error,
    };
  }
};

export default useAxios;
