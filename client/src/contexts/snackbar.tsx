import { ReactNode, createContext, useContext, useState } from 'react';
import { SeverityLevel } from '../types';

interface Props {
  children: ReactNode
}

type SnackbarContextType = {
  clearSnackbar: () => void;
  snackbarMessage: string;
  severity: SeverityLevel;
  setErrorSnackbar: (message: string) => void;
  setInfoSnackbar: (message: string) => void;
  setSuccessSnackbar: (message: string) => void;
};

export const SnackbarContext = createContext({});

export const SnackbarContextProvider = ({ children }: Props) => {
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('success');

  const setErrorSnackbar = (message: string) => {
    setMessage(message);
    setSeverity('error');
    console.log('snackbar error', message);
  }

  const setInfoSnackbar = (message: string) => {
    setMessage(message);
    setSeverity('info');
  }

  const setSuccessSnackbar = (message: string) => {
    setMessage(message);
    setSeverity('success');
  }

  const clearSnackbar = () => {
    setMessage('');
    setSeverity('success');
  }

  const snackbarContext: SnackbarContextType = {
    clearSnackbar,
    snackbarMessage: message,
    setErrorSnackbar,
    setInfoSnackbar,
    setSuccessSnackbar,
    severity,
  };

  return (
    <SnackbarContext.Provider value={snackbarContext}>
      {children}
    </SnackbarContext.Provider>
  );
};
export const useSnackbarContext = () => useContext(SnackbarContext) as SnackbarContextType;
