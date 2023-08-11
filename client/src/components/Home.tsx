import { useEffect, useState } from 'react';
import Playlist from './Playlist';
import WebPlayback from './WebPlayback';
import { AppBar, Toolbar, Typography, Container, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams } from 'react-router-dom';
import { SERVER_BASE_URL } from '../constants';

const MainContainer = styled(Container)({
  padding: '20px 0px 30px 0px'
});

const YourLibraryTitle = styled(Typography)({
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '15px',
  color: 'white',
});

const YourLibraryPaper = styled(Paper)({
  padding: '20px',
  background: 'transparent'
});

const WebPlaybackContainer = styled(Box)({
  position: 'fixed',
  bottom: '0',
  width: '100%'
});

function Home() {
  const { userid } = useParams();
  const [token, setToken] = useState('');

  useEffect(() => {

    async function getToken() {
      const response = await fetch(`${SERVER_BASE_URL}auth/token/${userid}`);
      const json = await response.json();
      console.log(json.access_token);
      if (!json.access_token) {
        window.location.href = `${SERVER_BASE_URL}auth/login`
      }
      setToken(json.access_token);
    }

    getToken();

  }, [userid]);

  // placeholder data
  const playlists = [
    {
      id: 1,
      title: 'Playlist 1',
      imageUrl: 'playlist1.jpg',
    },
    {
      id: 2,
      title: 'Playlist 2',
      imageUrl: 'playlist2.jpg',
    },
  ];

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ textAlign: 'center', flexGrow: 1 }}>
            DYNAMIC PLAYLISTS
          </Typography>
        </Toolbar>
      </AppBar>

      <MainContainer>
        <YourLibraryPaper>
          <YourLibraryTitle>Your Library</YourLibraryTitle>
          <Box>
            {playlists.map(playlist => (
              <Playlist
                key={playlist.id}
                title={playlist.title}
                imageUrl={playlist.imageUrl}
              />
            ))}
          </Box>
        </YourLibraryPaper>

        {token &&
          <WebPlaybackContainer>
            <WebPlayback token={token} />
          </WebPlaybackContainer>
        }
      </MainContainer>
    </div>
  );
}

export default Home;
