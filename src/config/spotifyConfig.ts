const config = {
  clientId: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  tokenUrl: 'spotify-pilot://spotify/token',
  sessionUserDefaultsKey: 'spotifySession',
  scopes: [
    'user-read-email',
    'playlist-modify-public',
    'user-modify-playback-state',
    'user-read-playback-state',
    'user-read-recently-played',
  ],
  tokenSwapUrl: 'spotify-pilot://spotify/access_token',
  tokenRefreshUrl: 'spotify-pilot://spotify/refresh_token',
  tokenRefreshEarliness: 3600,
};

export default config;
