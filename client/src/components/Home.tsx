import { useEffect, useState } from 'react';
import ListItem from './presentational/ListItem';
import WebPlayback from './WebPlayback';
import { Typography, Container, Box, Paper, Button, DialogTitle, DialogContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import { useParams } from 'react-router-dom';
import { SERVER_BASE_URL } from '../constants';
import callApi from '../utils/callApi';
import TextInput from './forms/inputs/TextInput';
import { PlaylistType } from '../types/index.js';
import DisplayApiResponse from './presentational/DisplayApiReponse';
import Playlist from './Playlist';
import BaseDialog from './forms/BaseDialog';
import { useTokenContext } from '../contexts/token';
import { useUserContext } from '../contexts/user';

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

const StyledDialogTitle = styled(DialogTitle)({
  backgroundColor: '#282c34',
  color: 'white',
});

const StyledDialogContent = styled(DialogContent)({
  backgroundColor: '#282c34',
});

const sortPlaylistsByLastUpdated = (playlists: PlaylistType[]) => {
  // sort playlists by last updated, newest first. If no last updated, sort by created at
  return playlists.sort((a, b) => {
    const aLastUpdated = new Date(a.last_updated);
    const bLastUpdated = new Date(b.last_updated);
    const aCreatedAt = new Date(a.created_at);
    const bCreatedAt = new Date(b.created_at);
    if (bLastUpdated === null && aLastUpdated === null) {
      return bCreatedAt.getTime() - aCreatedAt.getTime();
    } else if (bLastUpdated === null) {
      return -1;
    } else if (aLastUpdated === null) {
      return 1;
    } else if (bLastUpdated.getTime() === aLastUpdated.getTime()) {
      return bCreatedAt.getTime() - aCreatedAt.getTime();
    }
    return bLastUpdated.getTime() - aLastUpdated.getTime();
  });
}

function Home() {
  const { userid } = useParams();
  const { currToken, setTokenContext } = useTokenContext();
  const [openCreatePlaylist, setOpenCreatePlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistType>();
  // TODO: move error handling to context for global snackbar?
  const [apiError, setApiError] = useState('');
  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
  const { setUserIdContext } = useUserContext();

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
    setOpenCreatePlaylist(true);
  };

  const handleDialogClose = () => {
    setOpenCreatePlaylist(false);
  };

  const setSelectedPlaylistById = (id: string) => {
    const selectedPlaylist = playlists.find(list => list.id === id)
    if (!selectedPlaylist) {
      console.error(`Selected playlist id ${id} not found in playlists array.`);
    } else {
      setSelectedPlaylist(selectedPlaylist);
    }
  }

  const CreateNewPlaylist = (
    <>
      <StyledDialogTitle>Create New Playlist</StyledDialogTitle>
      <StyledDialogContent>
        <TextInput
          inputValue={newPlaylistTitle}
          inputLabel="Playlist Title"
          handleInputChange={(event) => setNewPlaylistTitle(event.target.value)}
        />
      </StyledDialogContent>
    </>
  )

  useEffect(() => {
    async function getToken() {
      const response = await fetch(`${SERVER_BASE_URL}auth/token/${userid}`);
      const json = await response.json();
      if (!json.access_token) {
        window.location.href = `${SERVER_BASE_URL}auth/login`
      }
      setTokenContext(json.access_token);
      localStorage.setItem('refresh_token', json.refresh_token);
    }
    async function getPlaylists() {
      const { errorMsg, data } = await callApi({
        method: 'GET',
        path: `playlists/by-user/${userid}`
      });
      if (errorMsg) {
        console.error(errorMsg);
      } else {
        const sorted = sortPlaylistsByLastUpdated(data);
        setPlaylists(sorted);
      }
    }

    if (userid) {
      setUserIdContext(userid);
      getToken();
      getPlaylists();
    }
  }, []);


  return (
    <main>
      <MainContainer>
        <YourLibraryPaper>
          <div style={{ paddingBottom: '20%' }}>
          {!selectedPlaylist ?
            <>
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
                  id={playlist.id}
                  innerContent={innerContent}
                  onClick={setSelectedPlaylistById}
                />
              })}
            </>
            :
            <Playlist
              playlist={selectedPlaylist}
              setApiError={setApiError}
            />
          }
          </div>
          {currToken &&
            <WebPlaybackContainer>
              <WebPlayback />
            </WebPlaybackContainer>
          }
        </YourLibraryPaper>

      </MainContainer>
      {
        openCreatePlaylist &&
        <BaseDialog
          dialogContent={CreateNewPlaylist}
          handleDialogClose={handleDialogClose}
          handleSubmit={handleCreatePlaylist}
          isDialogOpen={openCreatePlaylist}
          submitDisabled={!newPlaylistTitle}
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
