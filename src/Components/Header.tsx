import { Button } from '@mui/material';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAuthStatus, startLogout } from '../features/auth/authSlice';
import ThemeToggle from '../features/theme/ThemeToggle';
import styles from './styles/Header.module.scss';

const Header = () => {
  const authStatus = useAppSelector(selectAuthStatus);
  const dispatch = useAppDispatch();

  const handleLogOut = useCallback(() => {
    dispatch(startLogout());
  }, [dispatch]);

  return (
    <header className={styles.container}>
      <div className={styles.logout}>
        {authStatus === 'logged' ? (
          <Button onClick={handleLogOut}>Cerrar sesión</Button>
        ) : null}
      </div>
      <div className={styles.theme}>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
