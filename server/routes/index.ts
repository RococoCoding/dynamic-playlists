import { Request, Response, Router } from 'express';
import apiRouter from './api/index.js';
import authRouter from './auth/index.js';
import useAxios from '../utils/axios.js';
import { URLSearchParams } from 'url';
import { authorize } from './api/middleware.js';
type RedditResponse = {
  data: {
    children: {
      data: {
        title: string;
      }
    }[]
    after: string;
  }
}

const router = Router();

// API Routes:
router.use('/api', apiRouter);

// auth routes:
router.use('/auth', authRouter);

router.post('/reddit/ltt/new', [authorize], async (req: Request, res: Response) => {
  const dpUsername = res.locals.token.subject;
  const redditBaseUrl = 'https://www.reddit.com/api/v1/';
  const userAgentHeader = `listen-to-this/v0.1 by ${process.env.REDDIT_USERNAME}`;
  const authData = {
    grant_type: 'password',
    username: process.env.REDDIT_USERNAME || '',
    password: process.env.REDDIT_PASSWORD || '',
  }
  const params = new URLSearchParams(authData);
  const requestTokenInput = {
    baseUrl: redditBaseUrl,
    method: 'POST',
    path: 'access_token',
    params,
    headers: {
      'User-Agent': userAgentHeader,
    },
    auth: {
      username: process.env.REDDIT_CLIENT_ID || '',
      password: process.env.REDDIT_CLIENT_SECRET || '',
    },
  }
  try {
    const { data: tokenData } = await useAxios(requestTokenInput);
    const { tracksNeeded, spotifyPlaylistId, spotifyToken } = req.body;
    let tracksLeft = tracksNeeded;
    let count = 0
    let after;
    const tracksToAdd = []
    while (tracksLeft > 0 && count < 3) {
      count += 1;
      const res = await useAxios({
        baseUrl: 'https://oauth.reddit.com/',
        method: "GET",
        path: `r/listentothis/new?after=${after}`,
        token: tokenData.access_token,
        headers: {
          'User-Agent': userAgentHeader,
        }
      });
      const postsData: RedditResponse = res.data;
      const posts = postsData.data.children;
      after = postsData.data.after;
      for (const post of posts) {
        const { data: postData } = post;
        const { title: fullTitle } = postData;
        if (!fullTitle) continue;
        let [artist, title_genre] = fullTitle.split(/--|—|-/);
        let [title, genre] = title_genre?.split(' [') || [];
        genre = genre?.replace(']', ''); // remove closing bracket
        genre = genre?.replace(/ \(\d{4}\)/, ""); // remove year
        const genres = genre?.split('/') // dont' forget to trim later
        // removes featured artist info for cleaner search query
        let cleanedTitle = title?.replace(/\(ft\. [^)]+\)/g, "")?.trim();
        let artists = [artist];
        if (artist?.includes(',')) {
          artists = artist?.split(',') || [];
        } else {
          if (artist?.includes('&')) {
            artists = artist?.split('&') || [];
          }
        }
        const firstArtist = artists[0].trim();
        const query = `${encodeURIComponent('track:' + cleanedTitle + `${firstArtist ? ' artist:' + firstArtist : ''}`)}`;
        console.log('querying: ', cleanedTitle, firstArtist, genres)
        const spotifySearchInput = {
          baseUrl: 'https://api.spotify.com/v1/',
          method: 'GET',
          path: 'search?q=' + query + '&type=track&limit=1',
          token: spotifyToken,
        }
        const { data: spotifySearchData } = await useAxios(spotifySearchInput);
        const { uri } = spotifySearchData?.tracks?.items?.[0] || {};
        if (uri) {
          tracksLeft -= 1;
          tracksToAdd.push(uri);
        }
      }
    }
      // TODO: save reddit first post & last after value to LTT so we don't refetch posts we've already seen
    const spotifyPlaylistInput = {
      baseUrl: 'https://api.spotify.com/v1/',
      method: 'PUT',
      path: `playlists/${spotifyPlaylistId}/tracks?uris=${tracksToAdd.join(',')}`,
      token: spotifyToken,
    }
    await useAxios(spotifyPlaylistInput);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
  return res.status(200).json({ message: 'success' });
});

// System Routes:
router.get('/status', (_: Request, res: Response) => res.status(200).send('OK'));

export default router;
