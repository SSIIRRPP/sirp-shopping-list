import { ButtonProps, Typography, TypographyProps } from '@mui/material';
import { useMemo } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectTheme } from '../features/theme/themeSlice';
import useClearProps from '../hooks/useClearProps';

interface TextProps extends TypographyProps {
  colorVariant?: Extract<ButtonProps['variant'], 'outlined' | 'contained'>;
}

const Text = (props: TextProps) => {
  const storeTheme = useAppSelector(selectTheme);

  const newProps = useClearProps(props, ['colorVariant']);

  const newSX = useMemo(() => {
    const color = {
      color:
        props.colorVariant === 'contained'
          ? storeTheme.color5
          : storeTheme.color,
    };
    if (props.sx) {
      return { ...color, ...props.sx, fontSize: '1.15rem' };
    }
    return { ...color };
  }, [props.sx, props.colorVariant, storeTheme]);

  return (
    <Typography
      {...newProps}
      sx={newSX}
    />
  );
};

export default Text;
