import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  NativeEventEmitter,
  Alert,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import NativeSpotifyApi from '../modules/NativeSpotifyApi';
import config from '../config/spotifyConfig';
import {authStateActions} from '../redux/authStateSlice';
import {useDispatch} from 'react-redux';

interface SpotifyAuthScreenProps {
  navigation: StackNavigationProp<any>;
}

const SpotifyAuthScreen: React.FC<SpotifyAuthScreenProps> = ({navigation}) => {
  const dispatch = useDispatch();

  const [apiAuthorize, setApiAuthorize] = useState<boolean>(false);
  const [playerAuthorize, setPlayerAuthorize] = useState<boolean>(false);

  useEffect(() => {
    if (apiAuthorize && playerAuthorize) {
      navigation.navigate('AppRoot');
    }
  }, [apiAuthorize, playerAuthorize]);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter();

    eventEmitter.addListener('AuthorizationResponse', response => {
      if (response.accessToken) {
        dispatch(authStateActions.setAccessToken(response.accessToken));
        setApiAuthorize(true);
      } else {
        Alert.alert('Auth Failed', 'Please try again !', [{text: 'Ok'}], {
          cancelable: false,
        });
      }
    });

    eventEmitter.addListener('AuthorizePlayer', () => {
      setPlayerAuthorize(true);
    });

    return () => {
      eventEmitter.removeAllListeners('AuthorizationResponse');
      eventEmitter.removeAllListeners('AuthorizePlayer');
    };
  });

  const handleAuth = () => {
    NativeSpotifyApi.AuthorizeApi(
      config.clientId,
      config.tokenUrl,
      config.scopes.join(),
    );
    NativeSpotifyApi.AuthorizePlayer(config.clientId, config.tokenUrl, true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        You have to login into your spotify account, before you continue
      </Text>
      <TouchableOpacity style={styles.authBtn} onPress={handleAuth}>
        <Text style={styles.authBtnText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#42424f',
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: '700',
    width: '80%',
    textAlign: 'center',
    padding: 15,
  },
  authBtn: {
    width: '70%',
    height: 60,
    backgroundColor: '#00cb08',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authBtnText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
  },
});

export default SpotifyAuthScreen;
