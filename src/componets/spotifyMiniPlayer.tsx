import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import NativeSpotifyApi from '../modules/NativeSpotifyApi';

import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {StackNavigationProp} from '@react-navigation/stack';

interface SpotifyMiniPlayerComponentProps {
  navigation: StackNavigationProp<any>;
}

const SpotifyMiniPlayer: React.FC<SpotifyMiniPlayerComponentProps> = ({
  navigation,
}) => {
  const playerState = useSelector((state: RootState) => state.playerState);

  const convertProgressToWidth = () => {
    if (!playerState.duration || !playerState.progress) {
      return 0;
    }

    const result =
      Dimensions.get('screen').width *
      (playerState.progress / playerState.duration);
    return result ? result : 0;
  };

  const handlePlayBtn = () => {
    if (playerState.isPaused) {
      NativeSpotifyApi.PlayerAction('resume');
    } else {
      NativeSpotifyApi.PlayerAction('pause');
    }
  };

  const onPressHandler = () => {
    navigation.navigate('SpotifyPlayer');
  };

  return (
    <View style={styles.miniPlayHandler}>
      <TouchableWithoutFeedback
        style={styles.imageHandler}
        onPress={onPressHandler}>
        <Image
          style={styles.songImage}
          source={
            playerState.image !== ''
              ? {uri: playerState.image, height: 50, width: 50}
              : require('../assets/images/def-album.png')
          }
        />
      </TouchableWithoutFeedback>
      <View style={styles.songInfo}>
        <TouchableWithoutFeedback onPress={onPressHandler}>
          <View>
            <Text
              style={{fontSize: 17, fontWeight: 'bold', color: '#fff'}}
              numberOfLines={1}
              ellipsizeMode={'tail'}>
              {playerState.name}
            </Text>
            <Text>{playerState.artist}</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <TouchableOpacity onPress={handlePlayBtn} style={styles.pauseBtnHandler}>
        <Image
          source={
            playerState.isPaused
              ? require('../assets/images/play-button.png')
              : require('../assets/images/pause-button.png')
          }
          style={styles.pauseBtn}
        />
      </TouchableOpacity>
      <View style={[styles.progressBar, {width: convertProgressToWidth()}]} />
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'green',
    zIndex: -10,
  },
  miniPlayHandler: {
    position: 'absolute',
    bottom: 3,
    height: 70,
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#42424f',
  },
  imageHandler: {
    height: '100%',
    width: 60,
  },
  songImage: {
    height: 50,
    width: 50,
    marginTop: 10,
    marginLeft: 10,
  },
  songInfo: {
    height: '80%',
    marginLeft: 15,
    paddingTop: 10,
    width: 250,
  },
  pauseBtnHandler: {
    height: '100%',
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    zIndex: 1000,
  },
  pauseBtn: {
    height: 30,
    width: 30,
  },
});

export default SpotifyMiniPlayer;
