import React, {useEffect} from 'react';
import {NativeEventEmitter, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import NativeSpotifyApi from '../modules/NativeSpotifyApi';

import {RootState} from '../redux/store';
import {authStateActions} from '../redux/authStateSlice';
import {playerStateActions} from '../redux/playerStateSlice';

const SpotifyApiListener: React.FC = () => {
  const dispatch = useDispatch();
  const playerState = useSelector((state: RootState) => state.playerState);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter();

    eventEmitter.addListener('playerStateChange', event => {
      dispatch(
        playerStateActions.setPlayerContext({
          ...playerState,
          ...event,
        }),
      );
    });

    eventEmitter.addListener('AuthorizationResponse', response => {
      if (response.accessToken) {
        dispatch(authStateActions.setAccessToken(response.accessToken));
      }
    });

    eventEmitter.addListener('ImageLoaded', base64 => {
      dispatch(
        playerStateActions.setPlayerContext({
          ...playerState,
          image: `data:image/png;base64,${base64}`,
        }),
      );
    });

    const interval = setInterval(() => {
      if (!playerState.isSliding) {
        NativeSpotifyApi.GetPlaceInSong()
          .then(placeInSong => {
            if (placeInSong) {
              dispatch(
                playerStateActions.setPlayerContext({
                  ...playerState,
                  progress: placeInSong,
                }),
              );
            }
          })
          .catch(err => {
            console.log(err);
          });
      }
    }, 1000);

    return () => {
      eventEmitter.removeAllListeners('playerStateChange');
      eventEmitter.removeAllListeners('ImageLoaded');
      clearInterval(interval);
    };
  });

  return <View />;
};

export default SpotifyApiListener;
