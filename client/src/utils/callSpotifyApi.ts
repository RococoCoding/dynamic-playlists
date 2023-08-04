import callApi from './callApi';
import { SPOTIFY_BASE_URL } from '../constants';


type Props = {
  baseUrl?: string;
  method: string;
  path: string;
  data?: any;
  token?: string;
}

const callSpotifyApi = async (props: Props): Promise<any> => {
  return callApi({
    baseUrl: SPOTIFY_BASE_URL,
    ...props 
  })
};

export default callSpotifyApi;
