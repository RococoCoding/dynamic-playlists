import { SpotifyUser } from "../../types";

export const getSpotifyUser = async (callSpotifyApi: Function):Promise<SpotifyUser> => {
  const { data } = await callSpotifyApi({
    method: "GET",
    path: "me",
  });
  return data;
};
