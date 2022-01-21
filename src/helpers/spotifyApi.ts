import nativeSpotifyApi from '../modules/NativeSpotifyApi';
import config from '../config/spotifyConfig';

const getAvailableDevices = async (accessToken: string) => {
  let response = await fetch('https://api.spotify.com/v1/me/player/devices', {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 200) {
    return await response.json();
  } else if (response.status === 401) {
    nativeSpotifyApi.AuthorizeApi(
      config.clientId,
      config.tokenUrl,
      config.scopes.join(),
    );
  }

  console.log(await response.json());
  return {};
};

const transferPlayback = async (accessToken: string, id: any) => {
  let response = await fetch('https://api.spotify.com/v1/me/player', {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    body: JSON.stringify({
      device_ids: [id],
      play: true,
    }),
  });

  if (response.status === 204) {
    return true;
  } else if (response.status === 401) {
    nativeSpotifyApi.AuthorizeApi(
      config.clientId,
      config.tokenUrl,
      config.scopes.join(),
    );
  }

  console.log(await response.json());
  return false;
};

const getRecentlyPlayedTracks = async (accessToken: string) => {
  let response = await fetch(
    'https://api.spotify.com/v1/me/player/recently-played?limit=50',
    {
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
    },
  );

  if (response.status === 200) {
    return await response.json();
  } else if (response.status === 401) {
    nativeSpotifyApi.AuthorizeApi(
      config.clientId,
      config.tokenUrl,
      config.scopes.join(),
    );
  }

  console.log(await response.json());
  return {items: []};
};

const querySongs = async (accessToken: string, query: string) => {
  let response = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&limit=50&type=track`,
    {
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
    },
  );

  if (response.status === 200) {
    return await response.json();
  } else if (response.status === 401) {
    nativeSpotifyApi.AuthorizeApi(
      config.clientId,
      config.tokenUrl,
      config.scopes.join(),
    );
  }

  console.log(await response.json());
  return {tracks: {items: []}};
};

const addSongToQueue = async (
  accessToken: string,
  trackUri: string,
  deviceId: string,
) => {
  let response = await fetch(
    `https://api.spotify.com/v1/me/player/queue?uri=${trackUri}&device_id=${deviceId}`,
    {
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  );

  if (response.status === 204) {
    return true;
  } else if (response.status === 401) {
    nativeSpotifyApi.AuthorizeApi(
      config.clientId,
      config.tokenUrl,
      config.scopes.join(),
    );
  }

  console.log(await response.json());
  return false;
};

export {
  getAvailableDevices,
  transferPlayback,
  getRecentlyPlayedTracks,
  querySongs,
  addSongToQueue,
};
