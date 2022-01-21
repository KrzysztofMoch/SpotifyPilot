import {combineReducers, configureStore} from '@reduxjs/toolkit';

import playerStateSlice from './playerStateSlice';
import authStateSlice from './authStateSlice';

const rootReducer = combineReducers({
  playerState: playerStateSlice,
  authState: authStateSlice,
});

export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
});

export default store;
