import { createTheme, ThemeProvider } from '@mui/material';
import { useMemo, useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectTheme, selectThemeName } from './themeSlice';

interface ThemeProps {
  children: React.ReactNode;
}

const Theme = ({ children }: ThemeProps) => {
  const storeTheme = useAppSelector(selectTheme);
  const themeName = useAppSelector(selectThemeName);

  const theme = useMemo(() => {
    const _theme = createTheme({
      palette: {
        mode: themeName,
        primary: { main: storeTheme.color },
        text: {
          primary: storeTheme.color,
        },
      },
    });

    return _theme;
  }, [storeTheme, themeName]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default Theme;
