import React, { useState, useEffect } from 'react';
import callSpotifyApi from '../utils/callSpotifyApi';

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

function WebPlayback(props: Props) {
  const [isActive, setActive] = useState<null | boolean>();
  const [player, setPlayer] = useState<undefined | Spotify.Player>(undefined);
  const [currentTrack, setTrack] = useState(track);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    (async () => {
      console.log("deviceId", deviceId);
      await callSpotifyApi({
        data: {
          device_ids: [deviceId],
          play: false
        },
        method: "PUT",
        path: "me/player",
        token: props.token
      })
    })();
  }, [deviceId, props.token]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {

      const player = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: cb => { cb(props.token); },
        volume: 0.5
      });

      setPlayer(player);

      player.addListener('ready', async ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
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

      player.addListener('account_error', ({ message }) => {
        console.error(message);
      });

      player.addListener('player_state_changed', (state => {

        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        setActive(false);

        player.getCurrentState().then(state => {
          (!state) ? setActive(false) : setActive(true);
        });

      }));

      player.connect();
    };
  }, []);

  return (
    <div data-testid="web-playback">
      <div id="web-playback" className="container">
        {player && currentTrack &&
          <div className="main-wrapper">
            <img src={currentTrack?.album.images[0].url} className="now-playing__cover" alt="" />

            <div className="now-playing__side">
              <div className="now-playing__name">{currentTrack.name}</div>
              <div className="now-playing__artist">{currentTrack.artists[0].name}</div>

              <button className="btn-spotify" onClick={() => { player.previousTrack(); }} >
                &lt;&lt;
              </button>

              <button className="btn-spotify" onClick={() => { player.togglePlay(); }} >
                {isActive ? "PAUSE" : "PLAY"}
              </button>

              <button className="btn-spotify" onClick={() => { player.nextTrack(); }} >
                &gt;&gt;
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export default WebPlayback;