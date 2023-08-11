import { useState, useEffect } from 'react';
import callSpotifyApi from '../utils/callSpotifyApi';
import { Button, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const PlayerCard = styled(Card)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#282828',
  padding: '20px',
  height: '20%'
});

const TrackImage = styled(CardMedia)({
  width: '30px',
  height: '30px',
  objectFit: 'cover',
  borderRadius: '4px',
  marginRight: '15px',
});

const TrackInfo = styled(CardContent)({
  color: 'white',
});

const TrackTitle = styled(Typography)({
  fontSize: '14px',
  fontWeight: 'bold',
  marginBottom: '5px',
});

const TrackArtist = styled(Typography)({
  fontSize: '12px',
});

const ControlButton = styled(Button)({
  backgroundColor: '#1db954',
  color: 'white',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  fontSize: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  margin: '0 5px',
});

const PlayerControls = styled('div')({
  display: 'flex',
});

const TrackInfoContainer = styled('div')({
  display: 'flex',
});

const track = {
  name: "",
  album: {
    images: [
      { url: "" }
    ]
  },
  artists: [
    { name: "" }
  ]
};
type Props = { token: string }

function WebPlayback({ token }: Props) {
  const [isActive, setActive] = useState<null | boolean>();
  const [player, setPlayer] = useState<undefined | Spotify.Player>(undefined);
  const [currentTrack, setTrack] = useState(track);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {

      const player = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      setPlayer(player);

      player.addListener('ready', async ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        if (!device_id) {
          throw new Error('Device ID is null');
        }
        await callSpotifyApi({
          data: {
            device_ids: [device_id],
            play: false
          },
          method: "PUT",
          path: "me/player",
          token: token
        });
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('initialization_error', ({ message }) => {
        console.error(message);
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error(message);
      });

      player.addListener('playback_error', ({ message }) => {
        console.log(message);
      });

      player.addListener('account_error', ({ message }) => {
        console.error(message);
      });

      player.addListener('player_state_changed', ((state) => {
        if (!state) {
          return;
        }
        console.log('player state changed', state)
        setTrack(state.track_window.current_track);
        setActive(false);

        player.getCurrentState().then(state => {
          (state?.paused) ? setActive(false) : setActive(true);
        });

      }));

      player.connect();
    };
  }, []);

  return (
    <div id="web-playback" className="container">
      {player &&
        <PlayerCard id="web-playback">
          <TrackInfoContainer>
            {/* @ts-expect-error */}
            <TrackImage component="img" image={currentTrack?.album.images[0].url} alt="Album cover thumbnail" />
            <TrackInfo>
              <TrackTitle variant="subtitle1">{currentTrack?.name || 'No track selected'}</TrackTitle>
              <TrackArtist variant="subtitle2">{currentTrack?.artists[0]?.name || ''}</TrackArtist>
            </TrackInfo>
          </TrackInfoContainer>
          <PlayerControls>
            <ControlButton onClick={() => { player.previousTrack(); }}>
              &lt;&lt;
            </ControlButton>
            <ControlButton onClick={() => { player.togglePlay(); }}>
              {isActive ? "PAUSE" : "PLAY"}
            </ControlButton>
            <ControlButton onClick={() => { player.nextTrack(); }}>
              &gt;&gt;
            </ControlButton>
          </PlayerControls>
        </PlayerCard>
      }
    </div>
  );
}

export default WebPlayback;