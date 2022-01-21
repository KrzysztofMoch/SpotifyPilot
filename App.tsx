import React from 'react';
import {
  StackNavigationOptions,
  createStackNavigator,
} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';

import SpotifyAuthScreen from './src/screens/SpotifyAuthScreen';
import AppRoot from './src/componets/AppRoot';
import store from './src/redux/store';
import {Provider as ReduxProvider} from 'react-redux';
import SpotifyApiListener from './src/componets/SpotifyApiListener';

type AppParams = {
  SpotifyAuth: any;
  AppRoot: any;
};

const Stack = createStackNavigator<AppParams>();

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <SpotifyApiListener />
      <NavigationContainer>
        <Stack.Navigator screenOptions={StackNavigatorOptions}>
          <Stack.Screen name="SpotifyAuth" component={SpotifyAuthScreen} />
          <Stack.Screen name="AppRoot" component={AppRoot} />
        </Stack.Navigator>
      </NavigationContainer>
    </ReduxProvider>
  );
};

const StackNavigatorOptions: StackNavigationOptions = {
  headerShown: false,
};

export default App;
