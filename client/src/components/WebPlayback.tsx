import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardMedia, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { styled } from '@mui/material/styles';

import useRefreshToken from '../utils/refreshToken';
import useSpotifyApi from '../utils/useSpotifyApi';
import { deleteTrackFromSpotifyPlaylist, getDpPlaylist, getRandomTrack, getSpotifyPlaylist, tokenExists, updateSlotWithNewTrack, updateSpotifyPlaylistWithNewTrack } from '../utils';
import { FullSlot, SpotifyTrackType } from '../types';
import { SLOT_TYPES, SLOT_TYPES_MAP_BY_NAME } from '../constants';

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

function WebPlayback() {
  const [isPaused, setPaused] = useState<null | boolean>();
  const [instanceIsActive, setInstanceActive] = useState<null | boolean>();
  const [player, setPlayer] = useState<undefined | Spotify.Player>(undefined);
  const [componentCurrentTrack, setComponentTrack] = useState<SpotifyTrackType | null>(null);
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
            name: 'Dynamic Playlists - Spotify Web Playback SDK',
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
            setPaused(state.paused);
            // had problems syncing state + async calls with listener so pushing all updates to component state
            // and handling updates in useEffect
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
          const { errorMsg, data: dpPlaylist } = await getDpPlaylist(spotifyPlaylistId);
          if (errorMsg) {
            throw new Error(`getting dp playlist error: ${errorMsg}`,);
          }
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
            const { errorMsg: errorMsg1 } = await updateSpotifyPlaylistWithNewTrack(spotifyPlaylistId, previousSlot.position, newTrackUri, callSpotifyApi);
            if (errorMsg1) {
              throw new Error(`error updating spotify playlist ${errorMsg1}`);
            }

            // update the slot with new track
            const { errorMsg: errorMsg2, data: returnedSlot } = await updateSlotWithNewTrack(previousSlot.id, newTrackId);
            if (errorMsg2) {
              // TODO: this might be a critical error because now the slot data in db is out of sync with the spotify playlist
              // there's local version of the slot so they're probably fine during the session, but the slot data in db is out of sync
              // so if they quit the site and then come back, it'll be out of sync
              // quick fix -- user can republish the playlist, but they'll get new random tracks each time
              throw new Error(`error updating slot ${errorMsg2}`);
            }

            // sync local state activePlaylist.slots using mutation
            slots.splice(previousSlotIndex, 1, returnedSlot);

            // get snapshot id
            const { errorMsg: errorMsg3, data: spotifyPlaylist } = await getSpotifyPlaylist(spotifyPlaylistId, callSpotifyApi);
            if (errorMsg3) {
              // TODO: similar to above, now the playlist is out of sync becasue we won't be able to delete the target track
              throw new Error(`getting spotify playlist error: ${errorMsg3}`);
            }
            const { snapshot_id } = spotifyPlaylist;
            if (!snapshot_id) {
            }

            // delete previous track from spotify playlist
            const { errorMsg: errorMsg4 } = await deleteTrackFromSpotifyPlaylist(spotifyPlaylistId, snapshot_id, callSpotifyApi, prevTrack.uri);
            if (errorMsg4) {
              // TODO: similar to above, now the playlist is out of sync becasue we won't be able to delete the target track
              throw new Error(`getting spotify playlist error: ${errorMsg4}`);
            }
          }
        };
        dynamicallyUpdatePlaylist();
      }
    } catch (e) {
      console.log('error dynamically updating playlist', e);
    }
    // update component with new track
    setComponentTrack(playerCurrentTrack);
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