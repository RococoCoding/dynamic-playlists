import axios from 'axios';

type Props = {
  baseUrl?: string;
  method: string;
  path: string;
  data?: any;
  token?: string;
}

type Header = {
  Authorization: string;
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
}: Props): Promise<any> => {
  try {
    const axiosInput: AxiosInput = {
        method,
        url: `${baseUrl || '/api/'}${path}`,
        data,
    }
    if (token) {
      axiosInput.headers = { Authorization: `Bearer ${token}` }
    }
    const res = await axios(axiosInput);
    if (res.data.error) {
      throw new Error(res.data.error?.message || res.data.error);
    }
    return {
      data: res.data,
    };
  } catch (error: any) {
    console.log('callApi input: ', { baseUrl, method, path, data, token });
    console.log('callApi error: ', error);
    return {
      errorMsg: error?.message || error,
    };
  }
};

export default callApi;
