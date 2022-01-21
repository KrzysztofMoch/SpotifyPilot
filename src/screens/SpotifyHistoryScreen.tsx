import React, {useEffect} from 'react';
import {FlatList, Image, StyleSheet, Text, View} from 'react-native';

import {getRecentlyPlayedTracks} from '../helpers/spotifyApi';

import SpotifyMiniPlayer from '../componets/spotifyMiniPlayer';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {StackNavigationProp} from '@react-navigation/stack';

interface SpotifyHistoryScreenProps {
  navigation: StackNavigationProp<any>;
}

const SpotifyHistoryScreen: React.FC<SpotifyHistoryScreenProps> = ({
  navigation,
}) => {
  const authState = useSelector((state: RootState) => state.authState);

  const [songsList, setSongsList] = React.useState([]);

  const getHistory = () => {
    if (authState.accessToken) {
      getRecentlyPlayedTracks(authState.accessToken).then(res => {
        setSongsList(res.items);
      });
    }
  };

  useEffect(() => {
    getHistory();
  }, []);

  const RenderSong = (song: any) => {
    return (
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 3,
          flexDirection: 'row',
        }}>
        <Image
          source={{uri: song.track.album.images[0].url, height: 45, width: 45}}
        />
        <View style={{paddingHorizontal: 10, paddingVertical: 3}}>
          <Text numberOfLines={1} ellipsizeMode="tail">
            {song.track.name}
          </Text>
          <Text style={{fontSize: 12}}>{song.track.artists[0].name}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        refreshing={false}
        data={songsList}
        renderItem={song => {
          const {track} = song.item;
          return <RenderSong track={track} />;
        }}
        style={{
          marginTop: 25,
        }}
        onRefresh={() => getHistory()}
      />
      <SpotifyMiniPlayer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1c1c1c',
    zIndex: -10,
  },
});

export default SpotifyHistoryScreen;
