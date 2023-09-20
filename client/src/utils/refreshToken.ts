import { SERVER_BASE_URL } from "../constants";
import { useTokenContext } from "../contexts/token";
import { useUserContext } from "../contexts/user";
import callApi from "./callApi";

const useRefreshToken = () => {
  const { setTokenContext } = useTokenContext();
  const { userId } = useUserContext();

  const refreshToken = async () => { 
    const res = await callApi({
      baseUrl: SERVER_BASE_URL,
      path: `auth/token/${userId}/refresh`,
      method: 'POST',
    });
    console.log('refresh token res', res);
    setTokenContext(res.access_token);
    return res.access_token;
  };
  return { refreshToken };
};
export default useRefreshToken;