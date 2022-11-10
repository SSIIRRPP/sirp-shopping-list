import { useMemo } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectTheme } from '../features/theme/themeSlice';
import './styles/Loader.scss';

const Loader = () => {
  const theme = useAppSelector(selectTheme);
  const childStyle = useMemo(
    () => ({
      borderColor: `${theme.color} transparent transparent transparent`,
    }),
    [theme]
  );
  return (
    <div className="Loader__container">
      <div className="Loader">
        <div style={childStyle}></div>
        <div style={childStyle}></div>
        <div style={childStyle}></div>
        <div style={childStyle}></div>
      </div>
    </div>
  );
};

export default Loader;
