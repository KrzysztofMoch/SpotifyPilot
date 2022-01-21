import {createSlice} from '@reduxjs/toolkit';

export type authState = {
  playerAuth: boolean;
  apiAuth: boolean;
  accessToken: string;
};

const initialState: authState = {
  playerAuth: false,
  apiAuth: false,
  accessToken: '',
};

const authStateSlice = createSlice({
  name: 'authState',
  initialState: initialState,
  reducers: {
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
  },
});

export const authStateActions = authStateSlice.actions;
export default authStateSlice.reducer;
