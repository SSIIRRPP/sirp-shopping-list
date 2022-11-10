import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { Item } from '../items/itemsSlice';
import { v4 as uuid } from 'uuid';
import { FetchError, FetchStatus } from '../../types';

export interface List {
  id: string;
  name: string;
  items: { [id: Item['id']]: number };
}

interface ListsInitialState {
  lists: List[];
  status: FetchStatus;
  error: FetchError;
}

const listsInitialState: ListsInitialState = {
  lists: [],
  status: 'init',
  error: null,
};

const listsSlice = createSlice({
  name: 'lists',
  initialState: listsInitialState,
  reducers: {
    getLists: (state) => {
      state.status = 'fetching';
    },
    getListsFailed: (state, action) => {
      state.status = 'error';
      state.error = action.payload;
    },
    getListsSuccess: (state, action) => {
      state.status = 'fetched';
      state.lists = action.payload;
    },
    createList: (state) => {
      const newList = {
        id: uuid(),
        name: '',
        items: {},
      };
      state.lists = [...state.lists, newList];
    },
    changeListName: (
      state,
      action: PayloadAction<{ id: List['id']; value: List['name'] }>
    ) => {
      const { id, value } = action.payload;
      const index = state.lists.findIndex((list) => list.id === id);
      if (index >= 0) {
        state.lists[index].name = value;
      }
    },
  },
});

export const {
  getLists,
  getListsFailed,
  getListsSuccess,
  createList,
  changeListName,
} = listsSlice.actions;

export const selectLists = (state: RootState) => state.lists.lists;
export const selectListsStatus = (state: RootState) => state.lists.status;
export const selectListsError = (state: RootState) => state.lists.error;

export default listsSlice.reducer;
