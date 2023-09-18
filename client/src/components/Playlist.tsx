import { useEffect, useState } from 'react';
import ListItem from './presentational/ListItem';
import { Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import AlbumIcon from '@mui/icons-material/Album';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import { SLOT_TYPES_MAP_BY_ID, SLOT_TYPES_MAP_BY_NAME } from '../constants';
import callApi from '../utils/callApi';
import { BaseSlot, FullSlot, PlaylistType, SearchResultOption, SpotifyEntry } from '../types/index.js';
import BaseDialog from './forms/BaseDialog';
import EditSlot from './forms/EditSlot';
import { requiresArtist } from '../utils';

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

const CreateSlotButton = styled(Button)({
  marginBottom: '15px',
});

const SlotInnerContent = styled('div')({
  display: 'flex',
  flexGrow: '1',
  '@media (max-width:600px)': {
    width: '87%',
  },
});

type Props = {
  playlist: PlaylistType;
  setApiError: (error: string) => void;
}

function Playlist({
  playlist,
  setApiError
}: Props) {
  const [slots, setSlots] = useState<FullSlot[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<SpotifyEntry | null>(null);
  const [openEditSlotDialog, setOpenEditSlotDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<FullSlot>();
  const [selectedOption, setSelectedOption] = useState<SearchResultOption | null>(null);
  const [slotType, setSlotType] = useState(selectedSlot?.type ? SLOT_TYPES_MAP_BY_ID[selectedSlot.type] : '');
  const editMode = !!selectedSlot;

  const openCreateSlotForm = () => {
    setOpenEditSlotDialog(true);
  };

  const handleDialogClose = () => {
    setOpenEditSlotDialog(false);
  };

  const clearState = () => {
    setSelectedSlot(undefined);
    setSelectedEntry(null);
    setSelectedOption(null);
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
    if (selectedEntry) {
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
      const { errorMsg, data: returnedSlot } = await callApi({
        method: editMode ? 'PUT' : 'POST',
        path: editMode ? `slots/${selectedSlot.id}` : 'slots',
        data: {
          ...newSlot,
          playlist_id: playlist.id,
          spotify_id: selectedEntry.id,
        }
      });
      if (errorMsg) {
        setApiError(errorMsg);
      } else {
        const newSlots = [...slots];
        if (editMode) {
          newSlots.splice(returnedSlot.position, 1, returnedSlot);
        } else {
          newSlots.push(returnedSlot);
        }
        setSlots(newSlots);
        clearState();
      }
      handleDialogClose();
    }
  }

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

  useEffect(() => {

    async function getPlaylist() {
      const { errorMsg, data } = await callApi({
        method: 'GET',
        path: `slots/by-playlist/${playlist.id}`
      });
      if (errorMsg) {
        console.error(errorMsg);
      } else {
        setSlots(data.sort(({ position }: FullSlot, { position: position2 }: FullSlot) => position - position2));
      }
    }

    getPlaylist();

  }, [playlist.id]);

  return (
    <>
      <ListHeader>
        <ListTitle>{playlist.title}</ListTitle>
        <CreateSlotButton variant="contained" onClick={openCreateSlotForm}>
          <AddIcon />
        </CreateSlotButton>
      </ListHeader>
      {slots.map(slot => {
        const label = slot.name + (requiresArtist(slot.type) && slot.artist_name?.length ? ' - ' + slot.artist_name.join(', ') : '')
        const innerContent = (
          <SlotInnerContent>
            <div className="scroll-container" style={{ marginLeft: '10px', display: 'flex', alignItems: 'center', width: '80%', flexGrow: '1' }}>
              <div className={label.length > 24 ? "scroll-content" : ""} style={{ fontSize: '1rem' }}>
                {label}
              </div>
            </div>
            <EditIcon style={{ marginRight: '5px' }} onClick={() => selectSlotToEdit(slot.id)} />
          </SlotInnerContent>
        );
        return (
          <ListItem
            key={slot.id}
            id={slot.id}
            icon={iconTypeMapping[slot.type]}
            innerContent={innerContent}
          />
        )
      })
      }
      {
        openEditSlotDialog &&
        <BaseDialog
          dialogContent={EditSlotDialogContent}
          handleDialogClose={handleDialogClose}
          handleSubmit={handleEditSlotSubmit}
          isDialogOpen={openEditSlotDialog}
          submitDisabled={false} // TODO: add validation
          fullWidth={true}
          submitText={selectedSlot ? 'Edit' : 'Create'}
        />
      }
    </>
  );
}

export default Playlist;
