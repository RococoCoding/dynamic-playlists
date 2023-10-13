import { useEffect, useState } from 'react';
import ListItem from './presentational/ListItem';
import WebPlayback from './WebPlayback';
import { Typography, Box, Button, DialogTitle, DialogContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams } from 'react-router-dom';
import TextInput from './forms/inputs/TextInput';
import { PlaylistType } from '../types/index.js';
import Snackbar from './presentational/Snackbar';
import BaseDialog from './forms/BaseDialog';
import { useUserContext } from '../contexts/user';
import { useSnackbarContext } from '../contexts/snackbar';
import { createDpPlaylist, deleteDpPlaylist, getAllUserPlaylists } from '../utils/playlists/dp';
import { getToken } from '../utils/tokens';
import { ENVIRONMENTS, REACT_APP_ENV } from '../constants';
import ErrorBoundary from './ErrorBoundary';
import Page from './presentational/Page';

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

const WebPlaybackContainer = styled(Box)({
  position: 'fixed',
  bottom: '0',
  width: '100%'
});

const CreatePlaylistButton = styled(Button)({
  marginBottom: '15px',
});

const ListItemInnerContent = styled('div')({
  display: 'flex',
  width: '100%',
  padding: '5px',
  justifyContent: 'space-between',
});

const StyledDialogTitle = styled(DialogTitle)({
  backgroundColor: '#282c34',
  color: 'white',
});

const StyledDialogContent = styled(DialogContent)({
  backgroundColor: '#282c34',
});

const sortPlaylistsByLastUpdated = (playlists: PlaylistType[]) => {
  return playlists.sort((a, b) => {
    const aLastUpdated = new Date(a.last_updated || a.created_at);
    const bLastUpdated = new Date(b.last_updated || b.created_at);
    return bLastUpdated.getTime() - aLastUpdated.getTime();
  });
}

function Home() {
  const { userid: userId } = useParams();
  const token = getToken();
  const [openCreatePlaylist, setOpenCreatePlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
  const { setUserIdContext } = useUserContext();
  const {
    clearSnackbar,
    snackbarMessage,
    severity,
    setErrorSnackbar,
  } = useSnackbarContext();

  const handleCreatePlaylist = async () => {
    if (userId) {
      try {
        const updatedPlaylists = await createDpPlaylist(newPlaylistTitle, userId);
        if (!updatedPlaylists) {
          setErrorSnackbar('Error getting updated playlists after deleting playlist.');
        } else {
          const sorted = sortPlaylistsByLastUpdated(updatedPlaylists);
          setPlaylists(sorted);
        }
      } catch (e: any) {
        if (REACT_APP_ENV === ENVIRONMENTS.development) {
          console.log('error creating playlist', e);
        }
        setErrorSnackbar('Error creating playlist.');
      }
    } else {
      setErrorSnackbar('Cannot create playlist without a user id.')
    }
    handleDialogClose();
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      const updatedPlaylists = await deleteDpPlaylist(playlistId);
      if (!updatedPlaylists) {
        setErrorSnackbar('Error getting updated playlists after deleting playlist.');
      } else {
        const sorted = sortPlaylistsByLastUpdated(updatedPlaylists);
        setPlaylists(sorted);
      }
    } catch (e: any) {
      if (REACT_APP_ENV === ENVIRONMENTS.development) {
        console.log('error deleting playlist', e);
      }
      setErrorSnackbar('Error deleting playlist.');
    }
  }

  const openCreatePlaylistForm = () => {
    setOpenCreatePlaylist(true);
  };

  const handleDialogClose = () => {
    setOpenCreatePlaylist(false);
  };

  const setSelectedPlaylistById = (id: string) => {
    if (!id) {
      setErrorSnackbar(`Error selecting playlist.`);
    } else {
      window.location.href = `/playlist/${id}`;
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
    const getPlaylists = async () => {
      try {
        const userPlaylists = await getAllUserPlaylists(userId);
        if (userPlaylists && userPlaylists.length) {
          const sorted = sortPlaylistsByLastUpdated(userPlaylists);
          setPlaylists(sorted);
        }
      } catch (e) {
        if (REACT_APP_ENV === ENVIRONMENTS.development) {
          console.log('error getting playlists', e);
        }
        setErrorSnackbar('Error getting playlists.');
      }
    }

    if (userId) {
      setUserIdContext(userId);
      getPlaylists();
    }
  }, [userId]);


  return (
    <main>
      <Page>
        <div style={{ paddingBottom: '20%' }}>
          <ErrorBoundary key='All Playlists'>
            <ListHeader>
              <YourLibraryTitle>Your Library</YourLibraryTitle>
              <CreatePlaylistButton variant="contained" onClick={openCreatePlaylistForm}>
                <AddIcon />
              </CreatePlaylistButton>
            </ListHeader>
            {playlists.map(playlist => {
              const innerContent =
                <ListItemInnerContent>
                  <Typography variant="subtitle1" fontWeight="bold">{playlist.title}</Typography>
                </ListItemInnerContent>
              const deleteAction = <DeleteIcon onClick={() => handleDeletePlaylist(playlist.id)} />;
              const actions = [deleteAction];
              return <ListItem
                key={playlist.id}
                id={playlist.id}
                innerContent={innerContent}
                actions={actions}
                onClick={setSelectedPlaylistById}
              />
            })}
          </ErrorBoundary>
        </div>
        {token &&
          <ErrorBoundary key='Webplayback'>
            <WebPlaybackContainer>
              <WebPlayback />
            </WebPlaybackContainer>
          </ErrorBoundary>
        }
      </Page>
      {
        openCreatePlaylist &&
        <ErrorBoundary key='Create Playlist Dialog'>
            <BaseDialog
              dialogContent={CreateNewPlaylist}
              handleDialogClose={handleDialogClose}
              handleSubmit={handleCreatePlaylist}
              isDialogOpen={openCreatePlaylist}
              submitDisabled={!newPlaylistTitle}
            />
          </ErrorBoundary>
      }
      {
        snackbarMessage &&
        <ErrorBoundary key='Display Snackbar'>
          <Snackbar
            closeSnackbar={clearSnackbar}
            message={snackbarMessage}
            severity={severity}
          />
          </ErrorBoundary>
      }
    </main>
  );
}

export default Home;
