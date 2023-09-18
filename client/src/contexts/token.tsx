import {
  ReactNode, createContext, useContext, useState
} from 'react';

interface Props {
  children: ReactNode
}

interface TokenContextInterface {
  token: string,
  setTokenContext: (newToken: string) => void,
}

export const TokenContext = createContext({});

export const TokenContextProvider = ({ children }: Props) => {
  const [token, setToken] = useState<string>('');
  const setTokenContext = (newToken: string) => {
    setToken(newToken);
  };
  const tokenContext: TokenContextInterface = {
    token,
    setTokenContext,
  };

  return (
    <TokenContext.Provider value={tokenContext}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokenContext = () => useContext(TokenContext) as TokenContextInterface;
