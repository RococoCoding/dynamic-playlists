import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardMedia, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { styled } from '@mui/material/styles';

import useRefreshToken from '../utils/refreshToken';
import useSpotifyApi from '../utils/useSpotifyApi';
import { getErrorMessage, getRandomTrack, setWebPlayback } from '../utils';
import { FullSlot, SpotifyTrackType } from '../types';
import { ENVIRONMENTS, ERROR_ACTIONS, REACT_APP_ENV, SLOT_TYPES, SLOT_TYPES_MAP_BY_NAME } from '../constants';
import { getDpPlaylistBySpotifyId } from '../utils/playlists/dp';
import { updateSpotifyPlaylistWithNewTrack, getSpotifyPlaylist, deleteTrackFromSpotifyPlaylist } from '../utils/playlists/spotify';
import { updateSlotWithNewTrack } from '../utils/slots';
import { getAccessToken, tokenExists } from '../utils/tokens';
import { useSnackbarContext } from '../contexts/snackbar';

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

type SpotifyCallback = (token: string) => void;

function WebPlayback() {
  const [isPaused, setPaused] = useState<null | boolean>();
  const [instanceIsActive, setInstanceActive] = useState<null | boolean>();
  const [player, setPlayer] = useState<undefined | Spotify.Player>(undefined);
  const [componentCurrentTrack, setComponentTrack] = useState<SpotifyTrackType | null>(null);
  const refreshToken = useRefreshToken();
  const { callSpotifyApi } = useSpotifyApi();
  const [playerState, setPlayerState] = useState<null | Spotify.PlaybackState>(null);
  const snackbarContext = useSnackbarContext();
  const token = getAccessToken();

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
            name: `Dynamic Playlists`,
            getOAuthToken: async (cb: SpotifyCallback) => {
              // retrieve a new token
              try {
                const newToken = await refreshToken.getNewToken()
                if (newToken) {
                  // set new token in webplayer
                  cb(newToken);
                } else {
                  if (REACT_APP_ENV === ENVIRONMENTS.development) {
                    console.log('Could not retrieve new token in webplayer getOAuthToken');
                  }
                }
              } catch (e) {
                if (REACT_APP_ENV === ENVIRONMENTS.development) {
                  console.log('Error retrieving new token in webplayer getOAuthToken: ', getErrorMessage(e), e);
                }
              }
            },
            volume: 0.5
          });
          setPlayer(player);

          player.addListener('ready', async (state) => {
            const { device_id } = state;
            if (!device_id) {
              throw new Error('Device ID is null');
            }
            await setWebPlayback(callSpotifyApi, device_id);
          });

          player.addListener('not_ready', ({ device_id }) => {
            if (REACT_APP_ENV === ENVIRONMENTS.development) {
              console.log('Device ID has gone offline', device_id);
            }
          });

          player.addListener('initialization_error', (state) => {
            if (REACT_APP_ENV === ENVIRONMENTS.development) {
              console.log('initialization_error: ', state);
            }
          });

          player.addListener('authentication_error', async (state) => {
            if (REACT_APP_ENV === ENVIRONMENTS.development) {
              console.log('authentication_error:', state);
            }
          });

          player.addListener('playback_error', async (state) => {
            if (REACT_APP_ENV === ENVIRONMENTS.development) {
              console.log('playback_error:', state);
            }
          });

          player.addListener('account_error', (state) => {
            // TODO: display error messages to user if useful
            if (REACT_APP_ENV === ENVIRONMENTS.development) {
              console.log('account_error: ', state);
            }
          });

          player.addListener('player_state_changed', ((state) => {
            if (!state || !state.track_window.current_track) {
              return;
            }
            setPaused(state.paused);
            // had problems syncing state + async calls with listener so pushing all updates to component state
            // and handling updates in useEffect
            setPlayerState(state);
            try {
              if (player) {
                player.getCurrentState().then(state => {
                  (!state) ? setInstanceActive(false) : setInstanceActive(true)
                });
              }
            } catch (e) {
              if (REACT_APP_ENV === ENVIRONMENTS.development) {
                console.log('error getting player state', e);
              }
            }
          }));

          player.connect();
        };
      }
      startPlayer();
    } else {
      console.log('Cannot start webplayback without token');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- call once on mount
  }, []);

  // handle state changes & dynamic updates when playerState changes
  useEffect(() => {
    if (!playerState || !playerState.track_window.current_track) {
      return;
    }
    // using JSON.parse/stringify to deep copy object because player state might update before all async functions are done
    const playerCurrentTrack = JSON.parse(JSON.stringify(playerState.track_window.current_track)) as unknown as SpotifyTrackType;
    const prevTrack = { ...componentCurrentTrack };
    const changedTrack = playerCurrentTrack.id !== prevTrack?.id;
    try {
      if (changedTrack) {
        const dynamicallyUpdatePlaylist = async () => {
          const [, contextType, spotifyPlaylistId] = playerState?.context?.uri?.split(':') || [];
          if (contextType !== SLOT_TYPES.playlist) {
            return;
          }
          let activePlaylist;
          // always retrieve playlist from db to get latest slot info (in case of updates while listening)
          // TODO: prob worthwhile to store/sync all playlist ids in store so we can avoid this call every time
          const dpPlaylist = await getDpPlaylistBySpotifyId(spotifyPlaylistId);
          if (!dpPlaylist.id) {
            // don't do anything if not listening to a dp playlist
            return;
          }
          activePlaylist = dpPlaylist;

          // find slot that matches previous track
          const slots = activePlaylist.slots;
          const previousSlotIndex = slots.findIndex((slot: FullSlot) => {
            return slot.current_track === prevTrack?.id
          });
          const previousSlot = slots[previousSlotIndex];
          if (previousSlot && prevTrack && previousSlot.type !== SLOT_TYPES_MAP_BY_NAME.track) {
            // get random track from pool
            const newTrackUri = await getRandomTrack(previousSlot, callSpotifyApi);
            const newTrackId = newTrackUri?.split(':')[2];
            if (!newTrackId) {
              throw new Error('error getting new track from pool');
            }

            // update the spotify playlist with new track
            await updateSpotifyPlaylistWithNewTrack(spotifyPlaylistId, previousSlot.position, newTrackUri, callSpotifyApi);

            // update the slot with new track
            try {
              const returnedSlot = await updateSlotWithNewTrack(previousSlot.id, newTrackId);

              // sync local state activePlaylist.slots using mutation
              slots.splice(previousSlotIndex, 1, returnedSlot);

              // get snapshot id
              let snapshotId;
              try {
                const spotifyPlaylist = await getSpotifyPlaylist(spotifyPlaylistId, callSpotifyApi);
                if (!spotifyPlaylist || !spotifyPlaylist.snapshot_id) {
                  throw new Error(`Missing spotify playlist or snapshot_id: ${spotifyPlaylist}`);
                }
                snapshotId = spotifyPlaylist.snapshot_id;
              } catch (e) {
                if (REACT_APP_ENV === ENVIRONMENTS.development) {
                  console.log('error getting spotify playlist', e);
                }
                throw new Error(`getting spotify playlist error: ${getErrorMessage(e)}`);
              }

              // delete previous track from spotify playlist
              try {
                await deleteTrackFromSpotifyPlaylist(spotifyPlaylistId, snapshotId, callSpotifyApi, prevTrack.uri);
              } catch (e) {
                if (REACT_APP_ENV === ENVIRONMENTS.development) {
                  console.log('error deleting previous track', e);
                }
                throw new Error(`deleting previous track error: ${getErrorMessage(e)}`);
              }
            } catch (e: any) {
              e.next = ERROR_ACTIONS.republish;
              throw e;
            }
          }
        };
        dynamicallyUpdatePlaylist();
      }
    } catch (e: any) {
      if (REACT_APP_ENV === ENVIRONMENTS.development) {
        console.log('error dynamically updating playlist', e);
      }
      if (e.next === ERROR_ACTIONS.republish) {
        snackbarContext.setErrorSnackbar('Error during playlist update. Please republish the playlist to re-sync with Spotify.');
      } else {
        snackbarContext.setErrorSnackbar('Could not update playlist.');
      }
    }
    // update component with new track
    setComponentTrack(playerCurrentTrack);
    // TODO: figure out how to handle this situation better to avoid dependency array issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerState, snackbarContext.setErrorSnackbar]);

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