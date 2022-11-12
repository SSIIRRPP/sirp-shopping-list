import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface StateInitialState {
  status: 'idle' | 'syncing';
  mode: 'edition' | 'shopping';
}

const initialState: StateInitialState = {
  status: 'idle',
  mode: 'edition',
};

const stateSlice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    dataSyncStart: (
      state,
      action: PayloadAction<'manual-sync' | 'completed-list'>
    ) => {
      state.status = 'syncing';
    },
    dataSyncEnd: (state) => {
      state.status = 'idle';
    },
    dataSyncSuccess: () => {},
    changeShoppingMode: (
      state,
      action: PayloadAction<StateInitialState['mode']>
    ) => {
      state.mode = action.payload;
    },
  },
});

export const selectStateStatus = (state: RootState) => state.state.status;

export const {
  dataSyncStart,
  dataSyncEnd,
  dataSyncSuccess,
  changeShoppingMode,
} = stateSlice.actions;

export default stateSlice.reducer;
