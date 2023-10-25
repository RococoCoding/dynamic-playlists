import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './App.css';
import Landing from './components/Landing';
import styled from '@emotion/styled';
import { AppBar, Typography, Toolbar } from '@mui/material';
import RequestToken from './components/RequestToken';
import Home from './components/Home';
import ErrorBoundary from './components/ErrorBoundary';
import Playlist from './components/Playlist';
import ProtectedRoute from './components/auth/ProtectedRoute';

const Header = styled(AppBar)({
  backgroundColor: '#1DB954',
})

const HeaderText = styled(Typography)({
  fontWeight: 'bold',
  textAlign: 'center',
  flexGrow: 1
});

function App() {
  return (
    <Router>
      <Header position="static">
        <Toolbar>
          <HeaderText variant="h6">
            DYNAMIC PLAYLISTS
          </HeaderText>
        </Toolbar>
      </Header>
      <ErrorBoundary key='pages'>
        <Routes>
          <Route path="/auth/callback" element={<RequestToken />} />
          <Route element={<ProtectedRoute />} >
            <Route path="/home/:userid/*" element={<Home />} >
              <Route path="playlist/:playlistid" element={<Playlist />} />
            </Route>
          </Route>
          <Route path="/" element={<Landing />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}


export default App;