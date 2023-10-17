import {
  ReactNode, createContext, useContext, useState
} from 'react';

interface Props {
  children: ReactNode
}

interface UserContextInterface {
  userId: string,
  setUserIdContext: (newUserId: string) => void,
}

export const UserContext = createContext({});

export const UserContextProvider = ({ children }: Props) => {
  const [userId, setUserId] = useState<string>('');

  const setUserIdContext = (newUserId: string) => {
    setUserId(newUserId);
  };
  const userContext: UserContextInterface = {
    userId,
    setUserIdContext,
  };

  return (
    <UserContext.Provider value={userContext}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext) as UserContextInterface;
