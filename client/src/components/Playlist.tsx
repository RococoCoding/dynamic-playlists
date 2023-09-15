import { useEffect, useState } from 'react';
import ListItem from './presentational/ListItem';
import { Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
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
  const [selectedSlot, setSelectedSlot] = useState<BaseSlot | FullSlot>();
  const [selectedOption, setSelectedOption] = useState<SearchResultOption | null>(null);
  const [slotType, setSlotType] = useState(selectedSlot?.type ? SLOT_TYPES_MAP_BY_ID[selectedSlot.type] : '');

  const openCreateSlotForm = () => {
    setOpenEditSlotDialog(true);
  };

  const handleDialogClose = () => {
    setOpenEditSlotDialog(false);
  };

  const handleEditSlotSubmit = async () => {
    if (selectedEntry) {
      const newSlot: BaseSlot = {
        name: selectedEntry.name,
        type: SLOT_TYPES_MAP_BY_NAME[slotType],
        position: 0,
      }
      if ('artists' in selectedEntry) {
        newSlot.artist_name = selectedEntry.artists.map((artist) => artist.name);
      } else if ('owner' in selectedEntry) {
        newSlot.artist_name = [selectedEntry.owner.display_name];
      }
      const { errorMsg, data } = await callApi({
        method: 'POST',
        path: 'slots',
        data: {
          ...newSlot,
          playlist_id: playlist.id,
        }
      });
      if (errorMsg) {
        setApiError(errorMsg);
      } else {
        setSlots([...slots, data]);
      }
      handleDialogClose();
    }
  }

  const EditSlotDialogContent = (
    <EditSlot
      createMode={!selectedSlot}
      slotType={slotType}
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
        setSlots(data);
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
        const innerContent = (
          <>
            <Typography variant="body2" fontWeight="bold" style={{ marginRight: '5px' }}>
              {slot.name}
            </Typography>
            {requiresArtist(slot.type) && slot.artist_name?.length &&
              <Typography variant="caption">
                {slot.artist_name.join(', ')}
              </Typography>}
          </>
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
        />
      }
    </>
  );
}

export default Playlist;
