import { createAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { FetchError, FetchStatus } from '../../types';

export interface Item {
  id: string;
  name: string;
}

interface ItemsInitialState {
  items: Item[];
  status: FetchStatus;
  error: FetchError;
}

const itemsInitialState: ItemsInitialState = {
  items: [],
  status: 'init',
  error: null,
};

const itemsSlice = createSlice({
  name: 'items',
  initialState: itemsInitialState,
  reducers: {
    getItems: (state) => {
      state.status = 'fetching';
    },
    getItemsFailed: (state, action) => {
      state.status = 'error';
      state.error = action.payload;
    },
    getItemsSuccess: (state, action) => {
      state.status = 'fetched';
      state.items = action.payload;
    },
  },
});

export const { getItems, getItemsFailed, getItemsSuccess } = itemsSlice.actions;

export const selectItems = (state: RootState) => state.items.items;
export const selectItem = (state: RootState, itemId: Item['id']) =>
  state.items.items.find((item) => item.id === itemId);
export const selectItemsStatus = (state: RootState) => state.items.status;
export const selectItemsError = (state: RootState) => state.items.error;

export default itemsSlice.reducer;
