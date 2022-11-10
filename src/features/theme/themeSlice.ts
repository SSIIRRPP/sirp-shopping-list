import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

/* LIGHT */
// --color: #424874ff;
// --languid-lavender: #dcd6f7ff;
// --maximum-blue-purple: #a6b1e1ff;
// --light-gray: #cacfd6ff;
// --azure-x-11-web-color: #d6e5e3ff

/* DARK */
// --color: #424874ff;
// --languid-lavender: #dcd6f7ff;
// --maximum-blue-purple: #a6b1e1ff;
// --light-gray: #cacfd6ff;
// --azure-x-11-web-color: #d6e5e3ff

interface BaseTheme {
  [key: string]: string;
}

interface Theme extends BaseTheme {
  color: string;
  backgroundColor: string;
}

interface Palette {
  color: string;
  color2: string;
  color3: string;
  color4: string;
  color5: string;
}

const light: Palette = {
  color: '#343a6eff',
  color2: '#dcd6f7ff',
  color3: '#a6b1e1ff',
  color4: '#cacfd6ff',
  color5: '#d6e5e3ff',
};

const dark: Palette = {
  color: '#13293D',
  color2: '#16324F',
  color3: '#18435A',
  color4: '#2A628F',
  color5: '#72a7cc',
};

const lightTheme: Theme = {
  color: light.color,
  backgroundColor: light.color5,
  backgroundSecondary: light.color4,
};

const darkTheme: Theme = {
  color: dark.color5,
  backgroundColor: dark.color,
  backgroundSecondary: dark.color2,
};

export interface ThemeState {
  name: 'dark' | 'light';
  value: Theme;
  palette: Palette;
}

type ThemeNames = ThemeState['name'];

const initialStates: Record<ThemeNames, ThemeState> = {
  light: {
    name: 'light',
    value: lightTheme,
    palette: light,
  },
  dark: {
    name: 'dark',
    value: darkTheme,
    palette: dark,
  },
};

const previouslySelectedTheme: ThemeNames =
  (localStorage.getItem('theme') as ThemeNames) || 'light';

export const themeSlice = createSlice({
  name: 'theme',
  initialState: initialStates[previouslySelectedTheme],
  reducers: {
    toggleTheme: (state) => {
      if (state.name === 'light') {
        state.name = 'dark';
        state.value = darkTheme;
        state.palette = dark;
      } else {
        state.name = 'light';
        state.value = lightTheme;
        state.palette = light;
      }
      localStorage.setItem('theme', state.name);
    },
  },
});

export const { toggleTheme } = themeSlice.actions;

export const selectTheme = (state: RootState) => state.theme.value;
export const selectThemePalette = (state: RootState) => state.theme.palette;
export const selectThemeName = (state: RootState) => state.theme.name;

export default themeSlice.reducer;
