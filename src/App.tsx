import React, { useEffect } from 'react';
import { useAppSelector } from './app/hooks';
import { selectTheme } from './features/theme/themeSlice';
import Header from './Components/Header';
import { Route, Routes } from 'react-router';
import Auth from './pages/Auth';
import ProtectedRoute from './Components/ProtectedRoute';
import Main from './pages/Main';
import './App.scss';
import { instances } from './app/store';
import { useSnackbar } from 'notistack';
import Shopping from './pages/Shopping';

export const SagasContext = React.createContext(instances);

function App() {
  const { enqueueSnackbar } = useSnackbar();
  const { backgroundColor } = useAppSelector(selectTheme);

  useEffect(() => {
    instances.addNotificationFunction(enqueueSnackbar);
  }, [enqueueSnackbar]);

  return (
    <SagasContext.Provider value={instances}>
      <div
        className="App"
        style={{ backgroundColor }}
      >
        <Header />
        <main className="App__main">
          <Routes>
            <Route
              path="/auth"
              element={<Auth />}
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Main />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shopping/:listId"
              element={
                <ProtectedRoute>
                  <Shopping />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </SagasContext.Provider>
  );
}

export default App;
