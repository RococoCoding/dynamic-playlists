import { Router } from 'express';
import { generateRandomString } from '../../../utils/index.js';
import request from 'request';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } from '../../../constants/index.js';

const authRouter = Router();

const spotify_client_id = SPOTIFY_CLIENT_ID;
const spotify_client_secret = SPOTIFY_CLIENT_SECRET;
const redirect_uri = SPOTIFY_REDIRECT_URI;
let access_token = '';

authRouter.get('/login', (req, res) => {
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

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      res.redirect('/');
    }
  });
});

authRouter.get('/token', (req, res) => {
  res.json(
    {
      access_token: access_token
    });
});

export default authRouter;