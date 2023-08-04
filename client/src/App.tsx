import { useState, useEffect } from 'react';
import WebPlayback from './components/WebPlayback';
import Login from './components/Login';
import './App.css';

function App() {

  const [token, setToken] = useState('');

  useEffect(() => {

    async function getToken() {
      const response = await fetch('/auth/token');
      const json = await response.json();
      setToken(json.access_token);
    }

    getToken();

  }, []);

  return (
    <>
      {(token === '') ? <Login /> : <WebPlayback data-testid='web-playback' token={token} />}
    </>
  );
}


export default App;