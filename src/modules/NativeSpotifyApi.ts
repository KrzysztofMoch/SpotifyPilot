import {NativeModules} from 'react-native';
const {NativeSpotifyApi} = NativeModules;

interface NativeSpotifyApiInterface {
  AuthorizePlayer(
    clientId: string,
    redirectUrl: string,
    showAuthView: boolean,
  ): void;
  AuthorizeApi(clientId: string, redirectUrl: string, scopes: string): void;
  PlaySong(uri: string): void;
  PlayerAction(action: string): void;
  PlayerSneakTo(location: number): void;
  GetPlaceInSong(): Promise<number>;
}

export default NativeSpotifyApi as NativeSpotifyApiInterface;
