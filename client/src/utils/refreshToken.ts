import { SERVER_BASE_URL } from "../constants";
import { useTokenContext } from "../contexts/token";
import { useUserContext } from "../contexts/user";
import callApi from "./callApi";

const useRefreshToken = () => {
  const { setTokenContext } = useTokenContext();
  const { userId } = useUserContext();

  const refreshToken = async (): Promise<string | undefined> => { 
    const { errorMsg, access_token } = await callApi({
      baseUrl: SERVER_BASE_URL,
      path: `auth/token/${userId}/refresh`,
      method: 'POST',
    });
    if (errorMsg) {
      console.log(errorMsg);
      return;
    }
    if (access_token) {
      setTokenContext(access_token);
      return access_token;
    }
  };
  return { refreshToken };
};
export default useRefreshToken;