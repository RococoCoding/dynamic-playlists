import { Router } from 'express';
import bcrypt from 'bcrypt';
import request from 'request';
import { generateRandomString } from '../../../utils/index.js';
import { SPOTIFY_BASE_URL, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } from '../../../constants/index.js';
import useAxios from '../../../utils/axios.js';
import { findUser, insertUser, updateUser } from '../../../services/user/index.js';

const authRouter = Router();

const spotify_client_id = SPOTIFY_CLIENT_ID;
const spotify_client_secret = SPOTIFY_CLIENT_SECRET;
const redirect_uri = SPOTIFY_REDIRECT_URI;
const accessTokenMap = new Map();

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

  // TODO: prob don't need both axios and request
  request.post(authOptions, async function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const { access_token, refresh_token } = body;

      // get spotify profile with user id
      const { data: { id: spotifyUserId } } = await useAxios({
        baseUrl: SPOTIFY_BASE_URL,
        method: "GET",
        path: "me",
        token: access_token,
      });
      console.log('Retrieved Spotify user id', spotifyUserId);
      accessTokenMap.set(spotifyUserId, access_token);
      // get / upsert dp user
      if (spotifyUserId) {
        const user = await findUser(spotifyUserId);
        if (!user) {
          await insertUser(spotifyUserId);
          console.log('Created user', spotifyUserId);
        }
        // encrypt & store refresh token 
        const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
        await updateUser(spotifyUserId, hashedRefreshToken);
      }

      res.redirect(`/home/${spotifyUserId}`);
    }
  });
});

authRouter.post('/token/:id/refresh', async (req, res) => {
  const { user_id } = req.query;
  console.log('Starting refresh token flow for user', user_id);
  if (user_id && typeof user_id === 'string') {
    // get hashed refresh token from db
    const { refresh_token: hashedRefreshToken } = await findUser(user_id);
    if (!hashedRefreshToken) {
      res.status(401).json({ error: 'No refresh token found for user' });
    } else {
      // Compare the provided refresh token with the hashed token from your database
      const isMatch = await bcrypt.compare(hashedRefreshToken, hashedRefreshToken);
      if (!isMatch) {
        console.error('Unable to decrypt refresh token');
        res.status(401).json({ error: 'Invalid refresh token' });
      } else {
        // Decrypt refresh token & retrieve new access token
        const decryptedRefreshToken = await bcrypt.hash(hashedRefreshToken, 10);
        const authOptions = {
          url: 'https://accounts.spotify.com/api/token',
          form: {
            refresh_token: decryptedRefreshToken,
            grant_type: 'refresh_token'
          },
          headers: {
            'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          json: true
        };
        console.log('requesting new access token')
        request.post(authOptions, async function (error, response, body) {
          if (response.statusCode === 200) {
            accessTokenMap.set(user_id, body.access_token);
            res.json({access_token: body.access_token});
          } else {
            console.error('Unable to retrieve new access token: ', response.statusCode, error);
            res.status(401).json({ error: 'Invalid refresh token' });
          }
        });
      }
    }
  } else {
    res.status(400).json({ error: 'Missing refresh token or user ID' });
  }
})

authRouter.get('/token/:id', async (req, res) => {
  const { id: spotifyUserId } = req.params;
  if (!spotifyUserId) {
    throw new Error('No user id provided');
  }
  const access_token = accessTokenMap.get(spotifyUserId);
  res.json({ access_token });
});

export default authRouter;
