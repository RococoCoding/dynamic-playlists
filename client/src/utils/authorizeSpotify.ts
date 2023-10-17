const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUri = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
if (!clientId || !redirectUri) {
  throw new Error('Missing client id or redirect uri env vars');
}
function generateRandomString(length: number) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  function base64encode(string: ArrayBuffer) {
    // @ts-expect-error
    return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  return base64encode(digest);
}
let codeVerifier = generateRandomString(128);
const authorizeSpotify = async () => {
  await generateCodeChallenge(codeVerifier).then(codeChallenge => {
    const state = generateRandomString(16);
    const scope = "streaming user-read-email user-modify-playback-state user-read-private playlist-modify-public";
    localStorage.setItem('code_verifier', codeVerifier);

    let args = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge
    });
    // @ts-expect-error
    window.location = 'https://accounts.spotify.com/authorize?' + args;
  });
};

export default authorizeSpotify;