import { useEffect, useState } from 'react';
import ListItem from './presentational/ListItem';
import WebPlayback from './WebPlayback';
import { AppBar, Toolbar, Typography, Container, Box, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import { useParams } from 'react-router-dom';
import { SERVER_BASE_URL } from '../constants';
import callApi from '../utils/callApi';
import TextInput from './forms/textInput';
import { Playlist } from '../types/index.js';
import DisplayApiResponse from './presentational/DisplayApiReponse';

const Header = styled(AppBar)({
  backgroundColor: '#1DB954',
})

const HeaderText = styled(Typography)({
  fontWeight: 'bold',
  textAlign: 'center',
  flexGrow: 1
});

const MainContainer = styled(Container)({
  padding: '20px 0px 30px 0px'
});

const ListHeader = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
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

const CreatePlaylistButton = styled(Button)({
  marginBottom: '15px',
});

function Home() {
  const { userid } = useParams();
  const [token, setToken] = useState('');
  const [dialogOpen, setDialogOpen] = useState('');
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist>();
  const [apiError, setApiError] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const handleCreatePlaylist = async () => {
    const { errorMsg, data } = await callApi({
      method: 'POST',
      path: 'playlists',
      data: {
        created_by: userid,
        last_updated_by: userid,
        title: newPlaylistTitle
      }
    });
    if (errorMsg) {
      setApiError(errorMsg);
    } else {
      setSelectedPlaylist(data);
    }
    handleDialogClose();
  };

  const openCreatePlaylistForm = () => {
    setDialogOpen('create');
  };

  const handleDialogClose = () => {
    setDialogOpen('');
  };

  useEffect(() => {

    async function getToken() {
      const response = await fetch(`${SERVER_BASE_URL}auth/token/${userid}`);
      const json = await response.json();
      if (!json.access_token) {
        window.location.href = `${SERVER_BASE_URL}auth/login`
      }
      setToken(json.access_token);
    }

    getToken();

    async function getPlaylists() {
      const { errorMsg, data } = await callApi({
        method: 'GET',
        path: `playlists/by-user/${userid}`
      });
      if (errorMsg) {
        console.error(errorMsg);
      } else {
        setPlaylists(data);
      }
    }

    getPlaylists();

  }, [userid]);

  return (
    <main>
      <Header position="static">
        <Toolbar>
          <HeaderText variant="h6">
            DYNAMIC PLAYLISTS
          </HeaderText>
        </Toolbar>
      </Header>

      <MainContainer>
        <YourLibraryPaper>
          <ListHeader>
            <YourLibraryTitle>Your Library</YourLibraryTitle>
            <CreatePlaylistButton variant="contained" onClick={openCreatePlaylistForm}>
              <AddIcon />
            </CreatePlaylistButton>
          </ListHeader>
          {playlists.map(playlist => {
            const innerContent = <Typography variant="subtitle1" fontWeight="bold">{playlist.title}</Typography>;
            return <ListItem
              key={playlist.id}
              innerContent={innerContent}
            />
          })}
        </YourLibraryPaper>

        {token &&
          <WebPlaybackContainer>
            <WebPlayback token={token} />
          </WebPlaybackContainer>
        }
      </MainContainer>
      {
        dialogOpen === 'create' &&
        <TextInput
          isDialogOpen={dialogOpen === 'create'}
          handleDialogClose={handleDialogClose}
          inputValue={newPlaylistTitle}
          inputLabel="Playlist Title"
          handleInputChange={(event) => setNewPlaylistTitle(event.target.value)}
          handleSubmit={handleCreatePlaylist}
          formTitle="Create New Playlist"
        />
      }
      {
        dialogOpen === 'edit' &&
        <TextInput
          isDialogOpen={dialogOpen === 'edit'}
          handleDialogClose={handleDialogClose}
          inputValue={newPlaylistTitle}
          inputLabel="Playlist Title"
          handleInputChange={(event) => setNewPlaylistTitle(event.target.value)}
          handleSubmit={handleCreatePlaylist}
          formTitle="Edit Playlist"
        />
      }
      {
        apiError &&
        <DisplayApiResponse
          closeSnackbar={() => setApiError('')}
          error={apiError}
        />
      }
    </main>
  );
}

export default Home;
