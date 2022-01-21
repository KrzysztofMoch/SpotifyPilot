import React, {useEffect, useState} from 'react';
import {
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import TextTicker from 'react-native-text-ticker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';

import NativeSpotifyApi from '../modules/NativeSpotifyApi';
import {getAvailableDevices, transferPlayback} from '../helpers/spotifyApi';
import {playerStateActions} from '../redux/playerStateSlice';
import {RootState} from '../redux/store';

const SpotifyPlayerScreen = () => {
  const dispatch = useDispatch();
  const playerState = useSelector((state: RootState) => state.playerState);
  const authState = useSelector((state: RootState) => state.authState);

  const [showDeviceList, setShowDeviceList] = useState(false);
  const [devicesList, setDeviceList] = useState([]);

  useEffect(() => {
    getDevices();
  }, [authState.accessToken]);

  const getDevices = async () => {
    let devices: any = [];
    getAvailableDevices(authState.accessToken).then(res => {
      if (res.devices) {
        res.devices.forEach(
          (deviceData: {
            is_restricted: boolean;
            is_private_session: boolean;
            id: any;
            is_active: boolean;
            name: string;
            type: string;
          }) => {
            if (!deviceData.is_restricted && !deviceData.is_private_session) {
              devices.push({
                id: deviceData.id,
                isActive: deviceData.is_active,
                name: deviceData.name,
                type: getDeviceType(deviceData.type),
              });
            }
          },
        );
      }
      //@ts-ignore
      setDeviceList(devices);
    });
  };

  const handlePlayBtn = () => {
    console.log(playerState.isPaused);
    if (playerState.isPaused) {
      NativeSpotifyApi.PlayerAction('resume');
    } else {
      NativeSpotifyApi.PlayerAction('pause');
    }
  };

  const handleSkipPlayer = (Forward: boolean) => {
    dispatch(playerStateActions.resetImage(''));
    dispatch(playerStateActions.setProgress(0));

    if (Forward) {
      NativeSpotifyApi.PlayerAction('next');
    } else {
      NativeSpotifyApi.PlayerAction('prev');
    }
  };

  const handleSliding = (completed: boolean, value: number) => {
    if (!completed) {
      dispatch(playerStateActions.setWasPaused(playerState.isPaused));
      if (!playerState.isPaused) {
        NativeSpotifyApi.PlayerAction('pause');
      }

      dispatch(playerStateActions.setIsSliding(true));
    } else {
      NativeSpotifyApi.PlayerSneakTo(value);
      dispatch(playerStateActions.setIsSliding(false));

      if (!playerState.wasPaused) {
        NativeSpotifyApi.PlayerAction('resume');
      }
    }
  };

  const SongTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ':' + (+seconds < 10 ? '0' : '') + seconds;
  };

  const getDeviceType = (deviceString: string) => {
    if (deviceString == 'Computer') {
      return 0;
    }
    if (deviceString == 'Smartphone') {
      return 1;
    }

    return 2;
  };

  const RenderDeviceItem = (props: {
    name: string;
    isActive: any;
    type: number;
  }) => {
    const changeActiveDevice = () => {
      setDeviceList(devicesList => {
        //@ts-ignore
        if (!devicesList.filter(({name}) => name == props.name)[0].isActive) {
          let newDeviceList = devicesList;

          newDeviceList.forEach(device => {
            const {name, id} = device;
            if (name == props.name) {
              transferPlayback(authState.accessToken, id).then(success => {
                if (success) {
                  // @ts-ignore
                  device.isActive = true;
                } else {
                  return devicesList;
                }
              });
            } else {
              //@ts-ignore
              device.isActive = false;
            }
          });

          return newDeviceList;
        }
        return devicesList;
      });
    };

    return (
      <TouchableOpacity
        onPress={changeActiveDevice}
        style={{
          width: '100%',
          height: 50,
          backgroundColor: props.isActive ? '#00a404' : '#343434',
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 2,
        }}>
        <Icon
          name={
            props.type == 0
              ? 'crop-landscape'
              : props.type == 1
              ? 'cellphone-android'
              : 'speaker'
          }
          size={30}
          style={{
            padding: 10,
          }}
        />
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
          }}>
          {props.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const RenderDeviceList = () => {
    return (
      <View style={styles.deviceListContainer}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            height: 70,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => getDevices()}
            style={{marginLeft: 10}}>
            <Icon name={'refresh'} size={40} />
          </TouchableOpacity>
          <Text style={{fontSize: 20, fontWeight: '700'}}>Select Device</Text>
          <TouchableOpacity
            onPress={() => setShowDeviceList(false)}
            style={{marginRight: 10}}>
            <Icon name={'close'} size={40} />
          </TouchableOpacity>
        </View>
        {devicesList.map(({id, isActive, name, type}) => {
          return (
            <RenderDeviceItem
              key={id}
              type={type}
              isActive={isActive}
              name={name}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.background}>
      {showDeviceList && <RenderDeviceList />}
      <View style={styles.songImageShadow}>
        <Image
          style={styles.songImage}
          source={
            playerState.image !== ''
              ? {uri: playerState.image, height: 300, width: 300}
              : require('../assets/images/def-album.png')
          }
        />
      </View>
      <TextTicker
        style={styles.songTitleText}
        duration={
          playerState.name.length * 350 /*I set duration based on text long*/
        }
        loop
        repeatSpacer={100}
        marqueeDelay={2000}
        easing={Easing.linear}>
        {playerState.name}
      </TextTicker>
      <Text style={styles.songArtist}>{playerState.artist}</Text>
      <View style={styles.songNavigationHandler}>
        <View style={styles.songTimesHandler}>
          <Text style={{fontWeight: 'bold'}}>
            {SongTime(playerState.progress)}
          </Text>
          <Text
            style={{
              marginLeft: '83%',
              height: 20,
              width: 30,
              fontWeight: 'bold',
            }}>
            {SongTime(playerState.duration)}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setShowDeviceList(true);
            }}>
            <Icon
              name={'speaker-multiple'}
              size={30}
              style={{
                marginTop: -70,
                marginLeft: -40,
              }}
            />
          </TouchableOpacity>
        </View>
        <Slider
          style={styles.progressSlider}
          tapToSeek={true}
          maximumValue={playerState.duration}
          value={playerState.progress}
          onValueChange={(value: number) => {
            if (playerState.isSliding) {
              console.log(value);
              dispatch(playerStateActions.setProgress(value));
            }
          }}
          onSlidingStart={() => handleSliding(false, 0)}
          onSlidingComplete={value => handleSliding(true, value)}
          thumbTintColor={'#03fc49'}
          minimumTrackTintColor={'#8dff5c'}
          //@ts-ignore
          thumbStyle={{width: 20, height: 20}}
        />
        <View style={styles.songNavigationBtnHandler}>
          <TouchableOpacity onPress={() => handleSkipPlayer(false)}>
            <Image
              source={require('../assets/images/skip-button.png')}
              style={[styles.skipBtn, {transform: [{rotate: '180deg'}]}]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePlayBtn}>
            <Image
              source={
                playerState.isPaused
                  ? require('../assets/images/play-button-2.png')
                  : require('../assets/images/pause-button-2.png')
              }
              style={styles.pauseBtn}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSkipPlayer(true)}>
            <Image
              source={require('../assets/images/skip-button.png')}
              style={styles.skipBtn}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: '#42424f',
    flexDirection: 'column',
    alignItems: 'center',
  },
  deviceListContainer: {
    backgroundColor: '#1c1c1c',
    position: 'absolute',
    top: '3%',
    left: '3%',
    height: '94%',
    width: '94%',
    zIndex: 100,
  },
  songTimesHandler: {
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressSlider: {
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  songImage: {
    width: 300,
    height: 300,
  },
  songImageShadow: {
    marginTop: '37%',
    width: 300,
    height: 300,
  },
  songTitleText: {
    paddingHorizontal: 3,
    fontSize: 27,
    fontWeight: '900',
    color: '#fff',
    height: 50,
    marginTop: 10,
  },
  songArtist: {
    fontSize: 14,
  },
  pauseBtn: {
    width: 70,
    height: 70,
  },
  songNavigationHandler: {
    marginTop: 45,
    width: '100%',
  },
  songNavigationBtnHandler: {
    marginTop: 20,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  skipBtn: {
    marginTop: 20,
    height: 30,
    width: 30,
    marginLeft: 30,
    marginRight: 30,
  },
});

export default SpotifyPlayerScreen;
