import axios from 'axios';

interface Response {
  data?: any;
  errorMsg?: string;
}

type Props = {
  method: string;
  path: string;
  data: any;
  token: string;
}

const callSpotifyApi = async ({
  method,
  path,
  data,
  token,
}: Props): Promise<Response> => {
  try {
    const res = await axios({
        method,
        url: `https://api.spotify.com/v1/${path}`,
        headers: { Authorization: `Bearer ${token}` },
        data,
    });
    if (res.data.error) {
      throw new Error(res.data.error?.message || res.data.error);
    }
    return {
      data: res.data,
    };
  } catch (error: any) {
    console.log('Spotify API error: ', error);
    return {
      errorMsg: error?.message || error,
    };
  }
};

export default callSpotifyApi;
