import { useAppSelector } from './app/hooks';
import { selectTheme } from './features/theme/themeSlice';
import Header from './Components/Header';
import { Route, Routes } from 'react-router';
import Auth from './pages/Auth';
import ProtectedRoute from './Components/ProtectedRoute';
import Main from './pages/Main';
import './App.scss';

function App() {
  const { backgroundColor } = useAppSelector(selectTheme);

  return (
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
        </Routes>
      </main>
    </div>
  );
}

export default App;
