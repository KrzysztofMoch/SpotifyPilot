import React, {useEffect, useState, useRef} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {TextInput, Keyboard} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';

import {RootState} from '../redux/store';
import SpotifyMiniPlayer from '../componets/spotifyMiniPlayer';
import {
  getAvailableDevices,
  querySongs,
  addSongToQueue,
} from '../helpers/spotifyApi';

interface SpotifySearchScreenProps {
  navigation: StackNavigationProp<any>;
}

const SpotifySearchScreen: React.FC<SpotifySearchScreenProps> = ({
  navigation,
}) => {
  const authState = useSelector((state: RootState) => state.authState);

  const [loading, setLoading] = useState(true);
  const [QSongs, setQSongs] = useState([]);
  const [query, setQuery] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const input = useRef<TextInput>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchResult(query);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const fetchResult = (localQuery: string) => {
    if (localQuery !== '') {
      setLoading(true);
      querySongs(authState.accessToken, localQuery).then(res => {
        setQSongs(res.tracks.items);
      });
      setLoading(false);
    } else {
      setQSongs([]);
    }
  };

  const addToQueue = async (trackUri: string) => {
    const data = await getAvailableDevices(authState.accessToken);

    if (!data.devices) {
      ToastAndroid.show('Can`t Add Song To Queue', ToastAndroid.SHORT);
      return false;
    }

    const deviceId: string = data.devices.filter(
      (device: {is_active: boolean}) => device.is_active,
    )[0].id;

    const success = await addSongToQueue(
      authState.accessToken,
      trackUri,
      deviceId,
    );

    if (success) {
      ToastAndroid.show('Song Added To Queue!', ToastAndroid.SHORT);
    } else {
      ToastAndroid.show('Can`t Add Song To Queue', ToastAndroid.SHORT);
    }
  };

  const RenderSong = (song: any) => {
    return (
      <View
        style={{
          paddingHorizontal: 0,
          width: '100%',
          paddingVertical: 3,
        }}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
          }}>
          <Image
            source={{
              uri: song.song.album.images[0].url,
              height: 45,
              width: 45,
            }}
          />
          <View
            style={{paddingHorizontal: 10, paddingVertical: 3, width: '78%'}}>
            <Text
              style={{width: '100%'}}
              numberOfLines={1}
              ellipsizeMode="tail">
              {song.song.name}
            </Text>
            <Text style={{fontSize: 12}}>{song.song.artists[0].name}</Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              await addToQueue('spotify:track:' + song.song.id);
            }}>
            <Icon name={'plus-box-outline'} size={28} color={'white'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleKeyboardIcon = () => {
    isKeyboardVisible ? Keyboard.dismiss() : input.current?.focus();
    setKeyboardVisible(!isKeyboardVisible);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={{flexDirection: 'row'}}>
          <TextInput
            //@ts-ignore
            ref={input}
            style={{
              width: '90%',
              borderBottomWidth: 1,
              borderColor: '#ffffff',
              fontSize: 14,
              color: '#fff',
            }}
            onChangeText={text => setQuery(text)}
            value={query}
          />
          <TouchableOpacity
            style={{padding: 5}}
            onPress={() => handleKeyboardIcon()}>
            <Icon
              size={25}
              name={isKeyboardVisible ? 'keyboard-off' : 'keyboard'}
            />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        style={{
          marginTop: 10,
        }}
        refreshing={loading}
        data={QSongs}
        renderItem={song => {
          return <RenderSong song={song.item} />;
        }}
      />
      <SpotifyMiniPlayer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
  },
  searchContainer: {
    paddingHorizontal: 15,
    padding: 7,
    marginTop: 10,
    height: 50,
    width: '90%',
    backgroundColor: '#2d2e37',
    borderRadius: 100,
  },
});

export default SpotifySearchScreen;
