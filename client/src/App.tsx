import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './App.css';
import Home from './components/Home';
import Landing from './components/Landing';
import styled from '@emotion/styled';
import { AppBar, Typography, Toolbar } from '@mui/material';
import Playlist from './components/Playlist';

function App() {

  const Header = styled(AppBar)({
    backgroundColor: '#1DB954',
  })

  const HeaderText = styled(Typography)({
    fontWeight: 'bold',
    textAlign: 'center',
    flexGrow: 1
  });

  return (
    <Router>
      <Header position="static">
        <Toolbar>
          <HeaderText variant="h6">
            DYNAMIC PLAYLISTS
          </HeaderText>
        </Toolbar>
      </Header>
      <Routes>
        <Route path="/home/:userid" element={<Home />} />
        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
}


export default App;