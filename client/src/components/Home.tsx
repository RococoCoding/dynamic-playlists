import { useEffect, useState } from 'react';
import Playlist from './Playlist';
import WebPlayback from './WebPlayback';
import { AppBar, Toolbar, Typography, Container, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams } from 'react-router-dom';
import { SERVER_BASE_URL } from '../constants';

const MainContainer = styled(Container)({
  paddingTop: '20px',
  paddingBottom: '20px',
});

const YourLibraryTitle = styled(Typography)({
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '15px',
});

const YourLibraryPaper = styled(Paper)({
  padding: '20px',
  marginBottom: '40px',
});

function Home() {
  const { userid } = useParams();
  const [token, setToken] = useState('');

  useEffect(() => {

    async function getToken() {
      const response = await fetch(`${SERVER_BASE_URL}auth/token/${userid}`);
      const json = await response.json();
      setToken(json.access_token);
    }

    getToken();

  }, []);

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
          DYNAMIC PLAYLISTS
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
          <Box>
            <WebPlayback token={token} />
          </Box>
        }
      </MainContainer>
    </div>
  );
}

export default Home;
