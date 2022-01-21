import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
  BottomTabBarOptions,
} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import SpotifyPlayerScreen from '../screens/SpotifyPlayerScreen';
import SpotifyHistoryScreen from '../screens/SpotifyHistoryScreen';
import SpotifySearchScreen from '../screens/SpotifySearchScreen';

const Tab = createBottomTabNavigator();

// TODO LIST
//2. Add queue api
//3. Add query api

const AppRoot = () => {
  return (
    <Tab.Navigator
      tabBarOptions={NavigatorOptions}
      initialRouteName={'SpotifyPlayer'}>
      <Tab.Screen
        name={'SpotifyHistory'}
        options={SpotifyHistoryOptions}
        component={SpotifyHistoryScreen}
      />
      <Tab.Screen
        name={'SpotifyPlayer'}
        options={SpotifyPlayerOptions}
        component={SpotifyPlayerScreen}
      />
      <Tab.Screen
        name={'SpotifySearch'}
        options={SpotifySearchOptions}
        component={SpotifySearchScreen}
      />
    </Tab.Navigator>
  );
};

const NavigatorOptions: BottomTabBarOptions = {
  style: {
    backgroundColor: '#000000',
    borderTopWidth: 0,
  },
};

const SpotifyPlayerOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({focused, size}) => (
    <Icon size={size} name="remote" color={focused ? 'white' : '#707070'} />
  ),
  tabBarLabel: () => null,
};

const SpotifyHistoryOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({focused, size}) => (
    <Icon size={size} name="history" color={focused ? 'white' : '#707070'} />
  ),
  tabBarLabel: () => null,
};

const SpotifySearchOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({focused, size}) => (
    <Icon
      size={size}
      name="text-search"
      color={focused ? 'white' : '#707070'}
    />
  ),
  tabBarLabel: () => null,
};

export default AppRoot;
