import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { v4 as uuid } from 'uuid';
import { FetchError, FetchStatus } from '../../types';
import { Item } from './Components/ItemComponent';

export interface List {
  id: string;
  name: string;
  items: Item[];
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

const findList = (state: RootState['lists'], listId: List['id']) => {
  const listIndex = state.lists.findIndex((list) => list.id === listId);
  return state.lists[listIndex];
};

const findListItem = (
  state: RootState['lists'],
  listId: List['id'],
  itemId: Item['id']
) => {
  const list = findList(state, listId);
  const itemIndex = list.items.findIndex((item) => item.id === itemId);
  return list.items[itemIndex];
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
        items: [],
      };
      state.lists = [...state.lists, newList];
    },
    deleteList: (state, action: PayloadAction<{ listId: string }>) => {
      state.lists = state.lists.filter(
        (list) => list.id !== action.payload.listId
      );
    },
    changeListName: (
      state,
      action: PayloadAction<{ id: List['id']; value: List['name'] }>
    ) => {
      const { id, value } = action.payload;
      const list = findList(state, id);
      list.name = value;
    },
    changeListItemName: (
      state,
      action: PayloadAction<{
        listId: List['id'];
        itemId: Item['id'];
        value: Item['name'];
      }>
    ) => {
      const { listId, itemId, value } = action.payload;
      const item = findListItem(state, listId, itemId);
      item.name = value;
    },
    changeListItemQuantity: (
      state,
      action: PayloadAction<{
        listId: List['id'];
        itemId: Item['id'];
        value: 1 | -1;
      }>
    ) => {
      const { listId, itemId, value } = action.payload;
      const item = findListItem(state, listId, itemId);
      const newValue = item.quantity + value;
      if (newValue > 0) {
        item.quantity = newValue;
      }
    },
    createListItem: (
      state,
      action: PayloadAction<{
        listId: List['id'];
      }>
    ) => {
      const { listId } = action.payload;
      const newItem = {
        id: uuid(),
        name: '',
        quantity: 1,
      };
      const list = findList(state, listId);
      list.items.unshift(newItem);
    },
    deleteListItem: (
      state,
      action: PayloadAction<{
        listId: List['id'];
        itemId: Item['id'];
      }>
    ) => {
      const { listId, itemId } = action.payload;
      const list = findList(state, listId);
      list.items = list.items.filter((item) => item.id !== itemId);
    },
  },
});

export const {
  getLists,
  getListsFailed,
  getListsSuccess,
  createList,
  deleteList,
  changeListName,
  changeListItemName,
  changeListItemQuantity,
  createListItem,
  deleteListItem,
} = listsSlice.actions;

export const selectLists = (state: RootState) => state.lists.lists;
export const selectList = (state: RootState, listId: List['id']) =>
  state.lists.lists.find((list) => list.id === listId);
export const selectListsStatus = (state: RootState) => state.lists.status;
export const selectListsError = (state: RootState) => state.lists.error;

export const listItemHasError = (item: Item) => {
  return item.name.length <= 0 || item.quantity <= 0;
};

export const listHasError = (list: List): boolean => {
  return list.name.length <= 0 || list.items.some(listItemHasError);
};

export default listsSlice.reducer;
