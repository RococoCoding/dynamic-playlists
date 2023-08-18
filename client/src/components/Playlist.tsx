import { useEffect, useState } from 'react';
import ListItem from './presentational/ListItem';
import { Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import AlbumIcon from '@mui/icons-material/Album';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import { SLOT_TYPES_MAP, requiresArtist } from '../constants';
import callApi from '../utils/callApi';
import { BaseSlot, FullSlot, PlaylistType } from '../types/index.js';
import BaseDialog from './forms/BaseDialog';
import EditSlot from './forms/EditSlot';

const iconTypeMapping = {
  [SLOT_TYPES_MAP.track]: <AudiotrackIcon />,
  [SLOT_TYPES_MAP.album]: <AlbumIcon />,
  [SLOT_TYPES_MAP.artist]: <PersonIcon />,
  [SLOT_TYPES_MAP.playlist]: <QueueMusicIcon />,
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
  const [openEditSlotDialog, setOpenEditSlotDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<BaseSlot | FullSlot>();

  const handleCreateSlot = async () => {
    const { errorMsg, data } = await callApi({
      method: 'POST',
      path: 'slots',
      data: {
      }
    });
    if (errorMsg) {
      setApiError(errorMsg);
    } else {
      // add new slot to slots
    }
    handleDialogClose();
  };

  const openCreateSlotForm = () => {
    setOpenEditSlotDialog(true);
  };

  const handleDialogClose = () => {
    setOpenEditSlotDialog(false);
  };

  const handleEditSlotSubmit = () => {
  }

  const EditSlotDialogContent = (
    <EditSlot existingSlot={selectedSlot} />
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
            <Typography variant="body2" fontWeight="bold">
              {slot.name}
            </Typography>
            {requiresArtist.includes(slot.type) && slot.artist_name?.length &&
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
        />
      }
    </>
  );
}

export default Playlist;
