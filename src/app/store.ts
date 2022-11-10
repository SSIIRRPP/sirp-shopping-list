import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../features/theme/themeSlice';
import authReducer from '../features/auth/authSlice';
import listsReducer from '../features/lists/listsSlice';
import itemsReducer from '../features/items/itemsSlice';
import createSagaMiddleware from '@redux-saga/core';
import GlobalInstances from './instances';
import { AppSelector } from './hooks';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    lists: listsReducer,
    items: itemsReducer,
  },
  middleware: (gDM) => gDM({ thunk: false }).prepend(sagaMiddleware),
});

export const instances = GlobalInstances.getInstance(sagaMiddleware);
instances.init();

export const dataSelector: AppSelector = (state) => ({
  items: state.items.items,
  lists: state.lists.lists,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
