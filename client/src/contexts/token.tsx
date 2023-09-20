import {
  ReactNode, createContext, useContext, useState
} from 'react';

interface Props {
  children: ReactNode
}

interface TokenContextInterface {
  currToken: string,
  prevToken: string,
  setTokenContext: (newToken: string) => void,
}

export const TokenContext = createContext({});

export const TokenContextProvider = ({ children }: Props) => {
  const [currToken, setCurrToken] = useState<string>('');
  const [prevToken, setPrevToken] = useState<string>('');
  const setTokenContext = (newToken: string) => {
    setPrevToken(currToken);
    setCurrToken(newToken);
  };
  const tokenContext: TokenContextInterface = {
    currToken,
    prevToken,
    setTokenContext,
  };

  return (
    <TokenContext.Provider value={tokenContext}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokenContext = () => useContext(TokenContext) as TokenContextInterface;
