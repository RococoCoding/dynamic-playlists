import { Router } from 'express';
import { generateRandomString } from '../../../utils/index.js';
import request from 'request';
import { SPOTIFY_BASE_URL, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } from '../../../constants/index.js';
import useAxios from '../../../utils/axios.js';
import { findUser, insertUser } from '../../../services/user/index.js';

const authRouter = Router();

const spotify_client_id = SPOTIFY_CLIENT_ID;
const spotify_client_secret = SPOTIFY_CLIENT_SECRET;
const redirect_uri = SPOTIFY_REDIRECT_URI;
const accessTokenMap = new Map();

authRouter.get('/login', (req, res) => {
  console.log('login start');
  const scope = "streaming user-read-email user-modify-playback-state user-read-private playlist-modify-public";

  const state = generateRandomString(16);

  const auth_query_parameters = {
    response_type: "code",
    client_id: spotify_client_id || '',
    scope: scope,
    redirect_uri: redirect_uri || '',
    state: state
  };

  const auth_query_string = new URLSearchParams(auth_query_parameters).toString();

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_string);
});

authRouter.get('/callback', (req, res) => {
  console.log('callback start');
  const code = req.query.code;

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    json: true
  };

  request.post(authOptions, async function (error, response, body) {
    if (!error && response.statusCode === 200) {

      // get spotify profile with user id
      const { data: { id: spotifyUserId } } = await useAxios({
        baseUrl: SPOTIFY_BASE_URL,
        method: "GET",
        path: "me",
        token: body.access_token,
      });
      console.log('Retrieved Spotify user id', spotifyUserId);
      accessTokenMap.set(spotifyUserId, body.access_token);
      // get / upsert dp user
      if (spotifyUserId) {
        const user = await findUser(spotifyUserId);
        if (!user) {
          await insertUser(spotifyUserId);
          console.log('Created user', spotifyUserId);
        }
      }

      res.redirect(`/home/${spotifyUserId}`);
    }
  });
});

authRouter.get('/token/:id', async (req, res) => {
  const { id: spotifyUserId } = req.params;
  res.json(
    {
      access_token: spotifyUserId ? accessTokenMap.get(spotifyUserId) : null,
    });
});

export default authRouter;
