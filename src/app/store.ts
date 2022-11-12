import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../features/theme/themeSlice';
import authReducer from '../features/auth/authSlice';
import listsReducer from '../features/lists/listsSlice';
import stateReducer from '../features/state/stateSlice';
import createSagaMiddleware from '@redux-saga/core';
import GlobalInstances from './instances';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    lists: listsReducer,
    state: stateReducer,
  },
  middleware: (gDM) => gDM({ thunk: false }).prepend(sagaMiddleware),
});

export const instances = GlobalInstances.getInstance(sagaMiddleware);
instances.init();

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
