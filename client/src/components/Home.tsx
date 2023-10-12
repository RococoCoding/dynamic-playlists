import { useEffect, useState } from 'react';
import ListItem from './presentational/ListItem';
import WebPlayback from './WebPlayback';
import { Typography, Container, Box, Paper, Button, DialogTitle, DialogContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams } from 'react-router-dom';
import TextInput from './forms/inputs/TextInput';
import { PlaylistType } from '../types/index.js';
import Snackbar from './presentational/Snackbar';
import Playlist from './Playlist';
import BaseDialog from './forms/BaseDialog';
import { useUserContext } from '../contexts/user';
import { getErrorMessage } from '../utils';
import { useSnackbarContext } from '../contexts/snackbar';
import { createDpPlaylist, deleteDpPlaylist, getAllUserPlaylists } from '../utils/playlists/dp';
import { getToken } from '../utils/tokens';
import { ENVIRONMENTS } from '../constants';
import ErrorBoundary from './ErrorBoundary';
import { Delete } from '@mui/icons-material';

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
  const { userid: userId } = useParams();
  const token = getToken();
  const [openCreatePlaylist, setOpenCreatePlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistType>();
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
        const newPlaylist = await createDpPlaylist(newPlaylistTitle, userId);
        if (!newPlaylist) {
          throw new Error('No data returned from create playlist request.');
        } else {
          setSelectedPlaylist(newPlaylist);
        }
      } catch (e: any) {
        if (process.env.NODE_ENV === ENVIRONMENTS.development) {
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
      await deleteDpPlaylist(playlistId);
      setSelectedPlaylist(undefined);
      try {
        const playlists = await getAllUserPlaylists(userId);
        if (playlists && playlists.length) {
          const sorted = sortPlaylistsByLastUpdated(playlists);
          setPlaylists(sorted);
        }
      } catch (e) {
        if (process.env.NODE_ENV === ENVIRONMENTS.development) {
          console.log('error getting updated playlists after deleting playlist', e);
        }
        setErrorSnackbar('Error getting updated playlists after deleting playlist.');
      }
    } catch (e: any) {
      if (process.env.NODE_ENV === ENVIRONMENTS.development) {
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
    const selectedPlaylist = playlists.find(list => list.id === id)
    if (!selectedPlaylist) {
      setErrorSnackbar(`Selected playlist not found in playlists list.`);
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
    async function getPlaylists() {
      try {
        const playlists = await getAllUserPlaylists(userId);
        if (playlists && playlists.length) {
          const sorted = sortPlaylistsByLastUpdated(playlists);
          setPlaylists(sorted);
        }
      } catch (e) {
        if (process.env.NODE_ENV === ENVIRONMENTS.development) {
          console.log('error getting playlists', e);
        }
        setErrorSnackbar('Error getting playlists.');
      }
    }

    if (userId) {
      setUserIdContext(userId);
      getPlaylists();
    }
  }, []);


  return (
    <main>
      <MainContainer>
        <YourLibraryPaper>
          <div style={{ paddingBottom: '20%' }}>
          {!selectedPlaylist ?
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
                      <DeleteIcon onClick={() => handleDeletePlaylist(playlist.id)} />
                    </ListItemInnerContent>
                  return <ListItem
                    key={playlist.id}
                    id={playlist.id}
                    innerContent={innerContent}
                    onClick={setSelectedPlaylistById}
                  />
                })}
              </ErrorBoundary>
            :
              <ErrorBoundary key='Selected Playlist'>
                <Playlist
                  playlist={selectedPlaylist}
                />
              </ErrorBoundary>
          }
          </div>
          {token &&
            <ErrorBoundary key='Webplayback'>
              <WebPlaybackContainer>
                <WebPlayback />
              </WebPlaybackContainer>
            </ErrorBoundary>
          }
        </YourLibraryPaper>

      </MainContainer>
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
