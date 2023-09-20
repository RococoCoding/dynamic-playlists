import { SPOTIFY_BASE_URL } from "../constants";
import callApi from "./callApi";
import useRefreshToken from "./refreshToken";

type Props = {
  baseUrl?: string;
  method: string;
  path: string;
  data?: any;
  token?: string;
}
const useSpotifyApi = () => {
  const { refreshToken } = useRefreshToken();
  const callSpotifyApi = async (props: Props): Promise<any> => {
    const params = new URLSearchParams(props.data);
    console.log('callSpotifyApi', { props, params })
    
    let res = await callApi({
      baseUrl: SPOTIFY_BASE_URL,
      ...props,
      path: `${props.path}?${params.toString()}`,
    })
    if (res.errorMsg && res.errorMsg.includes('expired')) {
      // TODO: implement PKCE auth flow
        // const refresh_token = localStorage.getItem('refresh_token');
        // if (refresh_token) {
          // console.log('refreshing token')
          // const res = await fetch("https://accounts.spotify.com/api/token", {
          //   method: "POST",
          //   body: new URLSearchParams({
          //     refresh_token,
          //     grant_type: "refresh_token",
          //   }),
          //   headers: {
          //     Authorization:
          //       "Basic " +
          //       Buffer.from(
          //         process.env.REACT_APP_SPOTIFY_CLIENT_ID + ":" + process.env.REACT_APP_SPOTIFY_CLIENT_SECRET
          //       ).toString("base64"),
          //     "Content-Type": "application/x-www-form-urlencoded",
          //   },
          // })
          // const json = await res.json();
          // console.log('refresh token res', json);
        const newToken = await refreshToken();
        return callApi({
          baseUrl: SPOTIFY_BASE_URL,
          ...props,
          token: newToken,
          path: `${props.path}?${params.toString()}`,
        })
    }
    return {};
  };

  return { callSpotifyApi };
}

export default useSpotifyApi;