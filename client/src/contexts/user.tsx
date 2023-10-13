import {
  ReactNode, createContext, useContext, useEffect, useState
} from 'react';
import { getSpotifyUser } from '../utils/users/spotify';
import useSpotifyApi from '../utils/useSpotifyApi';
import { tokenExists } from '../utils/tokens';
import authorizeSpotify from '../utils/authorizeSpotify';
import { getDpUser } from '../utils/users/dp';

interface Props {
  children: ReactNode
}

interface UserContextInterface {
  userId: string,
  setUserIdContext: (newUserId: string) => void,
}

export const UserContext = createContext({});

export const UserContextProvider = ({ children }: Props) => {
  const { callSpotifyApi } = useSpotifyApi();
  const [userId, setUserId] = useState<string>('');
  const accessToken = localStorage.getItem('access_token');
  const previouslyAuthorized = tokenExists(accessToken);

  const setUserIdContext = (newUserId: string) => {
    setUserId(newUserId);
  };
  const userContext: UserContextInterface = {
    userId,
    setUserIdContext,
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const spotifyUser = await getSpotifyUser(callSpotifyApi);
        if (spotifyUser) {
          const { id: spotifyUserId } = spotifyUser;
          // double-check dp user exists too
          const dpUser = await getDpUser(spotifyUserId);
          if (dpUser) {
            setUserId(spotifyUserId);
          } else {
            throw new Error(`Matching Dp user does not exist for Spotify user ${spotifyUserId}`);
          }
        }
      } catch (e: any) {
        if (process.env.NODE_ENV === 'development') {
          console.log('error getting spotify user', e);
        }
        await authorizeSpotify();
      }
    }
    if (!userId && previouslyAuthorized) {
      getUser();
    }
  }, [userId]);

  return (
    <UserContext.Provider value={userContext}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext) as UserContextInterface;
