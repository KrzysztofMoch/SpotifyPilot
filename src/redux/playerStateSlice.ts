import {createSlice} from '@reduxjs/toolkit';

export type playerState = {
  canSkipNext: boolean;
  canSkipPrev: boolean;
  canToggleShuffle: boolean;
  duration: number;
  placeInSong: number;
  isPaused: boolean;
  isShuffling: boolean;
  name: string;
  artist: string;
  repeatMode: number;
  image: string;
  isSliding: boolean;
  progress: number;
  wasPaused: boolean;
};

const initialState: playerState = {
  canSkipNext: false,
  canSkipPrev: false,
  canToggleShuffle: false,
  duration: 0,
  placeInSong: 0,
  isPaused: true,
  isShuffling: false,
  name: '',
  artist: 'test',
  repeatMode: 0,
  image: '',
  isSliding: false,
  progress: 0,
  wasPaused: false,
};

const playerStateSlice = createSlice({
  name: 'playerState',
  initialState,
  reducers: {
    setPlayerContext(state, action) {
      state = action.payload;
      return state;
    },
    resetImage(state, action) {
      state.image = action.payload;
      return state;
    },
    setProgress(state, action) {
      state.progress = action.payload;
      return state;
    },
    setWasPaused(state, action) {
      state.wasPaused = action.payload;
      return state;
    },
    setIsSliding(state, action) {
      state.isSliding = action.payload;
      return state;
    },
  },
});

export const playerStateActions = playerStateSlice.actions;
export default playerStateSlice.reducer;
