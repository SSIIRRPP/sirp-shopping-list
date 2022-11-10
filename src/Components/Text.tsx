import { Typography, TypographyProps } from '@mui/material';
import { useMemo } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectTheme } from '../features/theme/themeSlice';

const Text = (props: TypographyProps) => {
  const storeTheme = useAppSelector(selectTheme);

  const newSX = useMemo(() => {
    const color = {
      color: storeTheme.color,
    };
    if (props.sx) {
      return { ...props.sx, ...color };
    }
    return { ...color };
  }, [props.sx, storeTheme]);

  return (
    <Typography
      {...props}
      sx={newSX}
    />
  );
};

export default Text;
