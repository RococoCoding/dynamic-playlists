import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardMedia, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { styled } from '@mui/material/styles';
import useRefreshToken from '../utils/refreshToken';
import useSpotifyApi from '../utils/useSpotifyApi';
import { useTokenContext } from '../contexts/token';

const PlayerCard = styled(Card)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#282828',
  padding: '5px',
  height: '20%',
  width: '100%',
  margin: '0'
});

const TrackInfoContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
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
  width: '80%',
  padding: '5px !important',
});

const TrackTitle = styled(Typography)({
  fontSize: '14px',
  fontWeight: 'bold',
  marginBottom: '5px',
  maxWidth: '75%',
});

const TrackArtist = styled(Typography)({
  fontSize: '12px',
  maxWidth: '75%',
});

const ControlButton = styled(Button)({
  color: 'white',
  borderRadius: '50%',
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
let retryRefreshTokenCount = 0;

function WebPlayback() {
  const [isActive, setActive] = useState<null | boolean>();
  const [player, setPlayer] = useState<undefined | Spotify.Player>(undefined);
  const [currentTrack, setTrack] = useState(track);
  const { currToken, prevToken } = useTokenContext();
  const { refreshToken } = useRefreshToken();
  const { callSpotifyApi } = useSpotifyApi();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);
    const startPlayer = async () => {
      window.onSpotifyWebPlaybackSDKReady = () => {

        const player = new window.Spotify.Player({
          name: 'Web Playback SDK',
          getOAuthToken: cb => { cb(currToken); },
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
            token: currToken
          });
        });

        player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
        });

        player.addListener('initialization_error', ({ message }) => {
          console.log('initialization_error: ', message);
        });

        player.addListener('authentication_error', ({ message }) => {
          console.log('authentication_error:', message);
          if (currToken && currToken !== prevToken && retryRefreshTokenCount < 2) {
            retryRefreshTokenCount++;
            refreshToken() // page refreshes when tokenContext gets updated
          }
        });

        player.addListener('playback_error', ({ message }) => {
          console.log('playback_error:', message);
        });

        player.addListener('account_error', ({ message }) => {
          // TODO: display error messages to user if useful
          console.log('account_error: ', message);
        });

        player.addListener('player_state_changed', ((state) => {
          if (!state) {
            return;
          }

          setTrack(state.track_window.current_track);
          setActive(false);

          player.getCurrentState().then(state => {
            (state?.paused) ? setActive(false) : setActive(true);
          });

        }));

        player.connect();
      };
    }
    startPlayer();
  }, []);

  return (
    <div id="web-playback" className="container">
      {player &&
        <PlayerCard id="web-playback">
          {currentTrack && 
            <TrackInfoContainer>
              {/* @ts-expect-error component might not be showing because of style wrapper, but it's needed */}
              <TrackImage component="img" image={currentTrack.album.images[0].url} alt="Album cover thumbnail" />
              <TrackInfo>
                <div className="scroll-container" style={{ flexGrow: '1' }}>
                  <div className={currentTrack.name.length > 22 ? "scroll-content" : ""}>
                    <TrackTitle variant="subtitle1">{currentTrack.name || 'No track selected'}</TrackTitle>
                  </div>
                </div>
                <div className="scroll-container">
                  <div className={currentTrack.artists[0]?.name.length > 22 ? "scroll-content" : ""}>
                    <TrackArtist variant="subtitle2">{currentTrack.artists[0]?.name || ''}</TrackArtist>
                  </div>
                </div>
              </TrackInfo>
            </TrackInfoContainer>
          }
          <PlayerControls>
            <ControlButton onClick={() => { player.previousTrack(); }}>
              <SkipPreviousIcon fontSize='small' />
            </ControlButton>
            <ControlButton onClick={() => { player.togglePlay(); }}>
              {isActive ? <PauseIcon fontSize='small' /> : <PlayArrowIcon fontSize='small' />}
            </ControlButton>
            <ControlButton onClick={() => { player.nextTrack(); }}>
              <SkipNextIcon fontSize='small' />
            </ControlButton>
          </PlayerControls>
        </PlayerCard>
      }
    </div>
  );
}

export default WebPlayback;