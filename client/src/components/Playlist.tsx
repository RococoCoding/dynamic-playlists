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
import { Typography, Button, Backdrop, CircularProgress, Card, CardContent, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import AlbumIcon from '@mui/icons-material/Album';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import PublishIcon from '@mui/icons-material/Publish';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

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

const ListHeader = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
});

const ListTitle = styled(Typography)({
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '15px',
  color: 'white',
});

const PlaylistActionButton = styled(Button)({
  marginBottom: '15px',
});

const PlaylistActionsContainer = styled('div')({
  display: 'flex',
  width: '200px',
  justifyContent: 'space-between',
});

const SlotInnerContent = styled('div')({
  display: 'flex',
  flexGrow: '1',
  '@media (max-width:600px)': {
    width: '87%',
  },
});

const reorder = (list: Array<FullSlot>, startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
});

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",
  // styles we need to apply on draggables
  ...draggableStyle
});

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

  const selectSlotToEdit = (id: string) => {
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

  const handleDeleteSlot = async (id: string) => {
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
        <ArrowBackIcon onClick={closePlaylist} />
        <ListHeader>
          <ListTitle>{playlist.title}</ListTitle>
          <PlaylistActionsContainer>
            <PlaylistActionButton variant="contained" onClick={playPlaylist}>
              <PlayCircleIcon />
            </PlaylistActionButton>
            <PlaylistActionButton variant="contained" onClick={openCreateSlotForm}>
              <AddIcon />
            </PlaylistActionButton>
            <PlaylistActionButton variant="contained" onClick={publishPlaylist}>
              <PublishIcon />
            </PlaylistActionButton>
            {dragDisabled ?
              <PlaylistActionButton variant="contained" onClick={() => setDragDisabled(false)}>
                <EditIcon />
              </PlaylistActionButton>
              :
              <PlaylistActionButton variant="contained" onClick={saveSlotPositions}>
                <SaveIcon />
              </PlaylistActionButton>
            }
          </PlaylistActionsContainer>
        </ListHeader>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided: DroppableProvided,
              snapshot: DroppableStateSnapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
              >
                {slots.map((slot, index) => {
                  const label = slot.name + (requiresArtist(slot.type) && slot.artist_name?.length ? ' - ' + slot.artist_name.join(', ') : '')
                  const innerContent = (
                    <SlotInnerContent>
                      <div className="scroll-container" style={{ marginLeft: '10px', display: 'flex', alignItems: 'center', width: '80%', flexGrow: '1' }}>
                        <div className={label.length > 24 ? "scroll-content" : ""} style={{ fontSize: '1rem' }}>
                          {label}
                        </div>
                      </div>
                      <div>
                        <DeleteIcon onClick={() => handleDeleteSlot(slot.id)} />
                        <EditIcon style={{ marginRight: '5px' }} onClick={() => selectSlotToEdit(slot.id)} />
                      </div>
                    </SlotInnerContent>
                  );
                  return (
                    <Draggable
                      key={slot.id}
                      isDragDisabled={dragDisabled}
                      draggableId={slot.id}
                      index={index}
                    >
                      {(provided: DraggableProvided,
                        snapshot: DraggableStateSnapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <CardContent style={{ flexGrow: '1' }}>
                            {iconTypeMapping[slot.type] &&
                              <Box>
                                {iconTypeMapping[slot.type]}
                              </Box>
                            }
                            {innerContent}
                          </CardContent>
                        </Card >
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
