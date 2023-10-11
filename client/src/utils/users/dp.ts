import { User } from "../../types";
import callApi from "../callApi";

export const getDpUser = async (spotifyUserId: string):Promise<User> => {
  const { data } = await callApi({
    method: 'GET',
    path: `users/${spotifyUserId}`,
  });
  return data;
};