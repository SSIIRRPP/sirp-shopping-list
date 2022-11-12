import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface User {
  sub: string;
  email: string;
}

export interface AuthState {
  status: 'unlogged' | 'logged' | 'logging';
  info: User | null;
  error: any;
}

const initialState: AuthState = {
  status: 'unlogged',
  info: null,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.status = 'logged';
      state.info = action.payload;
      state.error = null;
    },
    logout: (state) => {
      state.status = 'unlogged';
      state.info = null;
    },
    startLogin: (state, action: PayloadAction<{ password: string }>) => {
      state.status = 'logging';
      state.error = null;
    },
    startLogout: (state) => {
      state.status = 'logging';
    },
    userAuthError: (state, action: PayloadAction<{ error: any }>) => {
      state.status = 'unlogged';
      state.error = action.payload.error;
    },
  },
});

export const { login, logout, startLogin, startLogout, userAuthError } =
  authSlice.actions;

export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthInfo = (state: RootState) => state.auth.info;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer;
