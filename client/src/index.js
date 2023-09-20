import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TokenContextProvider } from './contexts/token';
import { UserContextProvider } from './contexts/user';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1DB954',
      contrastText: 'white',
    },
    secondary: {
      main: '#333',
      light: '#787878',
      contrastText: 'white',
    },
    action: {
      disabled: '#787878',
    }
  },
});
ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <UserContextProvider>
        <TokenContextProvider>
          <App />
        </TokenContextProvider>
      </UserContextProvider>
    </ThemeProvider>
  </React.StrictMode>
  , document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
