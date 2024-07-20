import { Button, Card, Dialog, styled } from '@mui/material';
import NumberInput from './inputs/NumberInput';
import { useState } from 'react';
import { isNumber } from 'lodash';
import populateLTTPlaylist from '../../utils/playlists/LTT';
import useSpotifyApi from '../../utils/useSpotifyApi';
import { getUserId } from '../../utils';

const StyledCard = styled(Card)({
  padding: '1rem',
  '& h3': {
    marginBottom: '1rem',
  },
  '& p': {
    marginBottom: '1rem',
  }
});

const LTTModal = ({ open, setModalOpen }: { open: boolean, setModalOpen: (open: boolean) => void }) => {
  const { callSpotifyApi } = useSpotifyApi();
  const userId = getUserId();
  const [maxPlaylistLength, setMaxPlaylistLength] = useState(25);
  const handleMaxPlaylistLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPlaylistLength(parseInt(event.target.value));
  }
  return (
      <Dialog open={open}  className="p-3">
        <StyledCard>
          <h3>Listen To This AutoImport</h3>
          <p>This modal will run a script that will create a new Spotify playlist called 'Listen To This'
            that will be automagically populated with the newest recommended songs from r/listentothis
            (that are available on Spotify. Songs not available on Spotify will be skipped).
            If you wish to proceed, enter a max playlist length and click 'Create Playlist'.
          </p>
          <NumberInput
            inputValue={maxPlaylistLength}
            inputLabel='Max Playlist Length'
            handleInputChange={handleMaxPlaylistLengthChange}
          />
          <Button disabled={!maxPlaylistLength || !isNumber(maxPlaylistLength)} onClick={() => populateLTTPlaylist({
            maxPlaylistLength,
            callSpotifyApi,
            userId
            })}>
            Create Playlist
          </Button>
          <Button onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
        </StyledCard>
      </Dialog>
  );
}

export default LTTModal;