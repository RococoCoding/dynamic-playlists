import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardMedia, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { styled } from '@mui/material/styles';
import useRefreshToken from '../utils/refreshToken';
import useSpotifyApi from '../utils/useSpotifyApi';
import callApi from '../utils/callApi';
import { tokenExists } from '../utils';
import { FullSlot, PlaylistWithSlots, SpotifyTrackType } from '../types';

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

let retryRefreshTokenCount = 0;

let timeoutId: NodeJS.Timeout | null = null;

function WebPlayback() {
  const [isPaused, setPaused] = useState<null | boolean>();
  const [instanceIsActive, setInstanceActive] = useState<null | boolean>();
  const [player, setPlayer] = useState<undefined | Spotify.Player>(undefined);
  const [componentCurrentTrack, setComponentTrack] = useState<SpotifyTrackType | null>(null);
  const [activePlaylist, setActivePlaylist] = useState<null | PlaylistWithSlots>(null);
  const [token, setToken] = useState<string | null | undefined>(localStorage.getItem('access_token'));
  const { getNewToken } = useRefreshToken();
  const { callSpotifyApi } = useSpotifyApi();
  const [playerState, setPlayerState] = useState<null | Spotify.PlaybackState>(null);

  // setup web playback sdk, add listeners to player
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);
    if (tokenExists(token)) {
      const startPlayer = async () => {
        window.onSpotifyWebPlaybackSDKReady = () => {

          const player = new window.Spotify.Player({
            name: 'Web Playback SDK',
            getOAuthToken: cb => { cb(token as string); },
            volume: 0.5
          });
          setPlayer(player);

          player.addListener('ready', async (state) => {
            const { device_id } = state;
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
            });
          });

          player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
          });

          player.addListener('initialization_error', ({ message }) => {
            console.log('initialization_error: ', message);
          });

          player.addListener('authentication_error', async ({ message }) => {
            console.log('authentication_error:', message);
            if (tokenExists(token) && retryRefreshTokenCount < 2) {
              retryRefreshTokenCount++;
              const newToken = await getNewToken()
              setToken(newToken);
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
            if (!state || !state.track_window.current_track) {
              return;
            }
            setPlayerState(state);
            player.getCurrentState().then(state => {
              (!state) ? setInstanceActive(false) : setInstanceActive(true)
            });
          }));

          player.connect();
        };
      }
      startPlayer();
    } else {
      console.log('Cannot start webplayback without token');
    }
  }, [token]);

  // handle state changes & dynamic updates when playerState changes
  useEffect(() => {
    if (!playerState || !playerState.track_window.current_track) {
      return;
    }

    setPaused(playerState.paused);

    // set current track if changed
    const playerCurrentTrack = playerState.track_window.current_track as unknown as SpotifyTrackType;
    const changedTrack = playerCurrentTrack.id !== componentCurrentTrack?.id;
    console.log('0: changed track?', playerCurrentTrack, componentCurrentTrack)
    if (changedTrack) {
      setComponentTrack(playerCurrentTrack);
      try {
        const dynamicallyUpdatePlaylist = async () => {
          console.log('1: start dyanmic update')
          const [, contextType, id] = playerState?.context?.uri?.split(':') || [];
          // do nothing if not currently listening to a playlist
          if (contextType === 'playlist') {
            // find & set active playlist if not set or switching playlists
            console.log('2a: active playlist', id, activePlaylist);
            if (!activePlaylist || activePlaylist.spotify_id !== id) {
              const { errorMsg, data: dpPlaylist } = await callApi({
                method: 'GET',
                path: `playlists/by-spotify-id/${id}`,
              })
              if (errorMsg) {
                console.log('getting dp playlist error', errorMsg);
                return;
              }
              if (dpPlaylist.id) {
                // set as current playlist as active playlist if it's not already the active list
                console.log('3a: setting active playlist');
                setActivePlaylist(dpPlaylist);
              }
            } else {
              console.log('2b: in existing active playlist');
              const currentSlot = activePlaylist.slots.find((slot: FullSlot) => slot.current_track === playerCurrentTrack.id);
              if (currentSlot && componentCurrentTrack) {
                console.log('3b: found current slot', currentSlot);
                // update the slot with new track
                // update the playlist with new track
                // when state changes to a different song (if skipped or finished)
                // get new pool of songs & randomly select new track
                // update the slot with new track
                // update the playlist with new track
              }
            }
          }
        };
        dynamicallyUpdatePlaylist();
      } catch (e) {
        console.log('error dynamically updating playlist', e);
      }
    }

  }, [playerState]);

  if (!instanceIsActive) {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <b> Instance is loading or inactive.</b>
          </div>
        </div>
      </>)
  } else {
    return (
      <div id="web-playback" className="container">
        {player &&
          <PlayerCard id="web-playback">
            {componentCurrentTrack &&
              <TrackInfoContainer>
                {/* @ts-expect-error component attr might not be showing because of style wrapper, but it's needed */}
                <TrackImage component="img" image={componentCurrentTrack.album.images[0].url} alt="Album cover thumbnail" />
                <TrackInfo>
                  <div className="scroll-container" style={{ flexGrow: '1' }}>
                    <div className={componentCurrentTrack.name.length > 22 ? "scroll-content" : ""}>
                      <TrackTitle variant="subtitle1">{componentCurrentTrack.name || 'No track selected'}</TrackTitle>
                    </div>
                  </div>
                  <div className="scroll-container">
                    <div className={componentCurrentTrack.artists[0]?.name.length > 22 ? "scroll-content" : ""}>
                      <TrackArtist variant="subtitle2">{componentCurrentTrack.artists[0]?.name || ''}</TrackArtist>
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
                {isPaused ? <PlayArrowIcon fontSize='small' /> : <PauseIcon fontSize='small' />}
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
}

export default WebPlayback;