import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
  DropResult,
} from "react-beautiful-dnd";
import { Typography, Button, Backdrop, CircularProgress, Box, Menu, MenuItem, List, ListItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import AlbumIcon from '@mui/icons-material/Album';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import PublishIcon from '@mui/icons-material/Publish';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';

import { ENVIRONMENTS, REACT_APP_ENV, SLOT_TYPES_MAP_BY_ID, SLOT_TYPES_MAP_BY_NAME } from '../constants';
import { BaseSlot, FullSlot, PlaylistType, SearchResultOption, SpotifyEntry } from '../types/index.js';
import BaseDialog from './forms/BaseDialog';
import EditSlot from './forms/EditSlot';
import { getRandomTrack, requiresArtist, userId } from '../utils';
import useSpotifyApi from '../utils/useSpotifyApi';
import { useSnackbarContext } from '../contexts/snackbar';
import { getPlaylistWithSlots, linkSpotifyPlaylistToDpPlaylist } from '../utils/playlists/dp';
import {
  publishSpotifyPlaylist,
  playPlaylistInSpotify,
  clearSpotifyPlaylist,
  populateSpotifyPlaylist
} from '../utils/playlists/spotify';
import { editOrCreateSlot, deleteSlot, getSlotsByPlaylistId, updateAllSlots } from '../utils/slots';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Page from './presentational/Page';

const iconTypeMapping = {
  [SLOT_TYPES_MAP_BY_NAME.track]: <AudiotrackIcon />,
  [SLOT_TYPES_MAP_BY_NAME.album]: <AlbumIcon />,
  [SLOT_TYPES_MAP_BY_NAME.artist]: <PersonIcon />,
  [SLOT_TYPES_MAP_BY_NAME.playlist]: <QueueMusicIcon />,
}

const IconButton = styled(Button)({
  margin: '0',
  minWidth: '0',
  padding: '3px',
});

const SquareIcon = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginRight: '10px',
  '@media (min-width: 600px)': {
    padding: '5px 8px'
  }
});

const StyledListItem = styled(ListItem)({
  padding: '8px',
  '@media (min-width: 600px)': {
    padding: '16px'
  }
});

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  userSelect: "none",
  background: isDragging ? "var(--spotify-green)" : "var(--dark-gray)",
  margin: '3px 0',
  ...draggableStyle
});

const reorder = (list: Array<FullSlot>, startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

function Playlist() {
  const { playlistid: playlistId } = useParams();
  const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
  const [slots, setSlots] = useState<FullSlot[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<SpotifyEntry | null>(null);
  const [openEditSlotDialog, setOpenEditSlotDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<FullSlot>();
  const [selectedOption, setSelectedOption] = useState<SearchResultOption | null>(null);
  const [dragDisabled, setDragDisabled] = useState(true);
  const [slotType, setSlotType] = useState(selectedSlot?.type ? SLOT_TYPES_MAP_BY_ID[selectedSlot.type] : '');
  const editMode = !!selectedSlot;
  const { callSpotifyApi } = useSpotifyApi();
  const snackbarContext = useSnackbarContext();
  const { setErrorSnackbar, setInfoSnackbar } = snackbarContext;
  const navigate = useNavigate();
  const [closePlaylist] = useOutletContext() as [() => void];

  const [slotMenuAnchorEl, setSlotMenuAnchorEl] = useState<null | HTMLElement>(null);
  const slotMenuOpen = Boolean(slotMenuAnchorEl);
  const [playlistMenuAnchorEl, setPlaylistMenuAnchorEl] = useState<null | HTMLElement>(null);
  const playlistMenuOpen = Boolean(playlistMenuAnchorEl);
  const [slotMenuId, setSlotMenuId] = useState<string | null>(null);

  const EditSlotDialogContent = (
    <EditSlot
      createMode={!selectedSlot}
      slotType={slotType}
      selectedSlot={selectedSlot}
      selectedOption={selectedOption}
      setSlotType={setSlotType}
      setSelectedEntry={setSelectedEntry}
      setSelectedOption={setSelectedOption}
    />
  )

  const openCreateSlotForm = () => {
    setOpenEditSlotDialog(true);
  };

  const handleDialogClose = () => {
    setOpenEditSlotDialog(false);
  };

  const clearSelectedState = () => {
    setSelectedSlot(undefined);
    setSelectedEntry(null);
    setSelectedOption(null);
  }

  const onDragEnd = async (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      slots,
      result.source.index,
      result.destination.index
    );

    setSlots(items);
  }

  const saveSlotPositions = async () => {
    const updatedSlots = slots.map((slot, index) => {
      slot.position = index;
      return slot;
    });
    await updateAllSlots(updatedSlots, playlistId);
    setDragDisabled(true);
  }

  const publishPlaylist = async () => {
    if (!playlist) {
      setErrorSnackbar('No selectedPlaylist to publish.');
      return;
    }
    let spotifyPlaylistId = playlist.spotify_id;
    // if playlist has never been published before, create new playlist in spotify
    if (!spotifyPlaylistId) {
      // spotify api call to create a new empty playlist
      try {
        const { id } = await publishSpotifyPlaylist(callSpotifyApi, playlist.title, userId);
        spotifyPlaylistId = id;
        if (!spotifyPlaylistId) {
          throw new Error('No id returned from Spotify playlist creation.');
        }
        try {
        // save spotify playlist id to playlist in dp db
          const updatedPlaylist = await linkSpotifyPlaylistToDpPlaylist(playlist.id, spotifyPlaylistId, userId);
          setPlaylist(updatedPlaylist);
        } catch (e) {
          if (REACT_APP_ENV === ENVIRONMENTS.development) {
            console.log(e);
          }
          setErrorSnackbar('Spotify playlist created, but error linking to DP playlist.');
        }
      } catch (e) {
        if (REACT_APP_ENV === ENVIRONMENTS.development) {
          console.log(e);
        }
        setErrorSnackbar('Error creating new Spotify playlist.');
      }
    } else {
      // clear existing playlist in spotify
      await clearSpotifyPlaylist(callSpotifyApi, spotifyPlaylistId);
    }
    if (spotifyPlaylistId) {
      // TODO: Should probably create new playlist with same name & delete old one upon success?
      try {
        // update spotify playlist with current slots
        // convert each slot to a spotify uri of a track
        const uris = await Promise.all(slots.map(async (slot) => {
          return getRandomTrack(slot, callSpotifyApi);
        }));

        // remove undefined uris
        const skippedTracks: Array<string> = [];
        const filteredUris = uris.filter((uri, index) => {
          if (!uri) {
            skippedTracks.push(slots[index].name);
          }
          return !!uri;
        }) as Array<string>;

        // update spotify playlist with selected tracks
        await populateSpotifyPlaylist(callSpotifyApi, spotifyPlaylistId, filteredUris);

        if (skippedTracks.length) {
          setInfoSnackbar(`Playlist published with skipped slots: ${skippedTracks.join('\n')}`);
        }
      } catch (e) {
        if (REACT_APP_ENV === ENVIRONMENTS.development) {
          console.log(e);
        }
        setErrorSnackbar('Error populating Spotify playlist.');
      }
    }
  }

  const selectSlotToEdit = (id: string | null) => {
    const slot = slots.find((slot) => slot.id === id);
    if (slot) {
      const option = {
        label: `${slot.name}${slot.artist_name ? ` - ${slot.artist_name[0]}` : ''}`,
        value: slot.pool_spotify_id,
      }
      setSelectedSlot(slot);
      setSelectedOption(option);
      setSlotType(slot?.type ? SLOT_TYPES_MAP_BY_ID[slot.type] : '');
      setOpenEditSlotDialog(true);
    }
  }

  const handleEditSlotSubmit = async () => {
    if (!playlist) {
      setErrorSnackbar('No selected playlist to edit.');
      return;
    }
    if (selectedEntry && selectedOption?.value) {
      try {
        const newSlot: BaseSlot = {
          name: selectedEntry.name,
          type: SLOT_TYPES_MAP_BY_NAME[slotType],
          position: slots.length,
        }
        if ('artists' in selectedEntry) {
          newSlot.artist_name = selectedEntry.artists.map((artist) => artist.name);
        } else if ('owner' in selectedEntry) {
          newSlot.artist_name = [selectedEntry.owner.display_name];
        }
        if (editMode) {
          newSlot.position = selectedSlot.position;
        }
        await editOrCreateSlot({
          editMode,
          newSlot,
          playlistId: playlist.id,
          slotToEditId: selectedSlot?.id,
          selectedEntryId: selectedOption?.value,
        });
        const updatedSlots = await getSlotsByPlaylistId(playlist.id);
        setSlots(updatedSlots);
        clearSelectedState();
      } catch (e) {
        if (REACT_APP_ENV === ENVIRONMENTS.development) {
          console.log(e);
        }
        setErrorSnackbar(`Error ${editMode ? 'editing' : 'creating new'} slot.`);
      }
      handleDialogClose();
    } else {
      setErrorSnackbar('Cannot create or edit slot without a selected entry and option');
    }
  }

  const handleDeleteSlot = async (id: string | null) => {
    if (!id) return;
    try {
      const newSlots = await deleteSlot(id);
      if (!newSlots || !Array.isArray(newSlots) || newSlots.length !== slots.length - 1) {
        throw new Error('Unable to update slots after deletion.');
      } else {
        setSlots(newSlots);
      }
    } catch (e) {
      if (REACT_APP_ENV === ENVIRONMENTS.development) {
        console.log(e);
      }
      setErrorSnackbar('Error deleting slot.');
    }
  }

  const playPlaylist = async () => {
    if (!playlist) {
      setErrorSnackbar('No selected playlist to play.');
      return;
    }
    try {
      await playPlaylistInSpotify(callSpotifyApi, playlist.spotify_id);
    } catch (e) {
      if (REACT_APP_ENV === ENVIRONMENTS.development) {
        console.log(e);
      }
      setErrorSnackbar('Error playing selected playlist.');
    }
  }

  useEffect(() => {

    async function getPlaylist() {
      if (!playlistId) {
        return;
      }
      try {
        const playlist = await getPlaylistWithSlots(playlistId);
        if (!playlist) {
          navigate(`/home/${userId}`);
        }
        setPlaylist(playlist);
        setSlots(playlist.slots || []);
      } catch (e) {
        if (REACT_APP_ENV === ENVIRONMENTS.development) {
          console.log(e);
        }
        snackbarContext.setErrorSnackbar('Error getting selected playlist.');
      }
    }
    if (playlistId) {
      getPlaylist();
    }
  }, [playlistId, userId, navigate, snackbarContext]);

  if (!playlist) {
    return (
      <Backdrop
        open={true}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    )
  }

  return (
    <main>
      <Page>
        <IconButton style={{ color: 'var(--light-gray)' }} onClick={closePlaylist} >
          <ArrowBackIcon />
        </IconButton>
        <div
          id="playlist-header"
          style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}
        >
          <Typography
            id="playlist-title"
            style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: 'white' }}
          >
            {playlist.title}
          </Typography>
          <div
            id="playlist-actions-container"
            style={{ display: 'flex', minWidth: '200px', justifyContent: 'space-between' }}
          >
            {dragDisabled ?
              <div
                id="playlist-other-actions-container"
                style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}
              >
                <IconButton onClick={publishPlaylist}>
                  <PublishIcon style={{ color: 'var(--light-gray)' }} />
                </IconButton>
                <IconButton
                  id="open-additional-playlist-actions-menu"
                  aria-controls={playlistMenuOpen ? 'open-additional-playlist-actions-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={playlistMenuOpen ? 'true' : undefined}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    setPlaylistMenuAnchorEl(event.currentTarget);
                  }}
                  style={{ color: 'var(--light-gray)', marginLeft: "8px" }}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id="additional-playlist-actions-menu"
                  anchorEl={playlistMenuAnchorEl}
                  open={playlistMenuOpen}
                  onClose={() => { setPlaylistMenuAnchorEl(null); }}
                  MenuListProps={{
                    'aria-labelledby': 'additional-playlist-actions-menu',
                  }}
                >
                  <MenuItem onClick={() => { setDragDisabled(false); setPlaylistMenuAnchorEl(null); }}>
                    Edit Playlist
                  </MenuItem>
                </Menu>
              </div>
              :
              <IconButton onClick={saveSlotPositions}>
                <CloseIcon style={{ color: 'white', width: '1.5em', height: '100%' }} />
              </IconButton>
            }
            <div
              id="play-actions-container"
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {dragDisabled ?
                <IconButton onClick={playPlaylist}>
                  <PlayCircleIcon style={{ width: '1.5em', height: '100%' }} />
                </IconButton>
                :
                <IconButton onClick={saveSlotPositions}>
                  <SaveIcon style={{ color: 'white', width: '1.25em', height: '100%' }} />
                </IconButton>
              }
            </div>
          </div>
          {dragDisabled &&
            <List style={{ backgroundImage: 'none' }} onClick={openCreateSlotForm}>
              <StyledListItem style={{ padding: '0' }}>
                <Button style={{
                  color: 'white',
                  width: '100%',
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                }}
                  onClick={openCreateSlotForm}
                >
                  <SquareIcon>
                    <AddIcon style={{ color: 'var(--light-gray' }} />
                  </SquareIcon>
                  <div
                    style={{
                      display: 'inline-block',
                      marginLeft: '5px'
                    }
                    }>
                    Add to this playlist
                  </div>
                </Button>
              </StyledListItem>
            </List>
          }
        </div>
        <List>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided: DroppableProvided,
                snapshot: DroppableStateSnapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ background: "var(--spotify-black)" }}
                >
                  {slots.map((slot, index) => {
                    const label = slot.name + (requiresArtist(slot.type) && slot.artist_name?.length ? ' - ' + slot.artist_name.join(', ') : '')
                    return (
                      <Draggable
                        key={slot.id}
                        isDragDisabled={dragDisabled}
                        draggableId={slot.id}
                        index={index}
                      >
                        {(provided: DraggableProvided,
                          snapshot: DraggableStateSnapshot) => (
                          <StyledListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                          >
                            {iconTypeMapping[slot.type] &&
                              <SquareIcon>
                                {iconTypeMapping[slot.type]}
                              </SquareIcon>
                            }
                            <div
                              id="slot-label"
                              style={{ display: 'flex', overflow: 'hidden', alignItems: 'center', flexGrow: '1' }}
                            >
                              <p style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                {label}
                              </p>
                            </div>
                            <IconButton
                              id='open-slot-actions-menu'
                              aria-controls={slotMenuOpen ? 'open-slot-actions-menu' : undefined}
                              aria-haspopup="true"
                              aria-expanded={slotMenuOpen ? 'true' : undefined}
                              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                setSlotMenuAnchorEl(event.currentTarget);
                                setSlotMenuId(slot.id);
                              }}
                              style={{ color: 'white' }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </StyledListItem>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </List>
        <Menu
          id="view-slot-actions-menu"
          anchorEl={slotMenuAnchorEl}
          open={slotMenuOpen}
          onClose={() => { setSlotMenuAnchorEl(null); setSlotMenuId(null); }}
          MenuListProps={{
            'aria-labelledby': 'view-slot-actions-menu',
          }}
        >
          <MenuItem onClick={() => selectSlotToEdit(slotMenuId)}>
            Edit Slot
          </MenuItem>
          <MenuItem onClick={() => handleDeleteSlot(slotMenuId)} >
            Delete Slot
          </MenuItem>
        </Menu>
      </Page>
      {
        openEditSlotDialog &&
        <BaseDialog
          dialogContent={EditSlotDialogContent}
          handleDialogClose={handleDialogClose}
          handleSubmit={handleEditSlotSubmit}
          isDialogOpen={openEditSlotDialog}
          submitDisabled={false}
          fullWidth={true}
          submitText={selectedSlot ? 'Edit' : 'Create'}
        />
      }
    </main>
  );
}

export default Playlist;
