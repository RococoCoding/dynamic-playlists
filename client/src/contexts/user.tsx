import {
  ReactNode, createContext, useContext, useState
} from 'react';

interface Props {
  children: ReactNode
}

interface UserContextInterface {
  authenticated: boolean,
  userId: string,
  setUserIdContext: (newUserId: string) => void,
  setAuthenticatedContext: (newAuthenticated: boolean) => void,
}
const defaultContext: UserContextInterface = {
  authenticated: false,
  userId: '',
  setUserIdContext: () => {},
  setAuthenticatedContext: () => {},
};

export const UserContext = createContext(defaultContext);

export const UserContextProvider = ({ children }: Props) => {
  const [userId, setUserId] = useState<string>('');
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  const setUserIdContext = (newUserId: string) => {
    setUserId(newUserId);
  };
  const setAuthenticatedContext = (newAuthenticated: boolean) => {
    setAuthenticated(newAuthenticated);
  }
  const userContext: UserContextInterface = {
    authenticated,
    userId,
    setUserIdContext,
    setAuthenticatedContext,
  };

  return (
    <UserContext.Provider value={userContext}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext) as UserContextInterface;
