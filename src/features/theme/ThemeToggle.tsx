import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectThemeName, toggleTheme } from './themeSlice';
import { ReactComponent as DarkIcon } from '../../assets/icons/dark.svg';
import { ReactComponent as LightIcon } from '../../assets/icons/light.svg';
import styles from './theme.module.scss';

const ThemeToggle = () => {
  const name = useAppSelector(selectThemeName);
  const dispatch = useAppDispatch();

  const handleToggleTheme = useCallback(() => dispatch(toggleTheme()), []);

  return (
    <div
      className={styles.toggle}
      onClick={handleToggleTheme}
    >
      {name === 'light' ? (
        <DarkIcon fill="white" />
      ) : (
        <LightIcon fill="white" />
      )}
    </div>
  );
};

export default ThemeToggle;
