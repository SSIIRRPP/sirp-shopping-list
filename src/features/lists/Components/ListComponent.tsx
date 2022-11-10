import { List } from '../listsSlice';
import './ListComponent.scss';
import ListHeader from './ListHeader';
import { useAppSelector } from '../../../app/hooks';
import { selectTheme } from '../../theme/themeSlice';
import { useState } from 'react';
import ListBody from './ListBody';

export interface ListComponentProps {
  list: List;
}

const ListComponent = ({ list }: ListComponentProps) => {
  const [openBody, setOpenBody] = useState(false);
  const theme = useAppSelector(selectTheme);

  return (
    <div
      className="ListComponent"
      style={{ backgroundColor: theme.backgroundSecondary }}
    >
      <ListHeader
        list={list}
        openBody={openBody}
        setOpenBody={() => setOpenBody((o) => !o)}
      />
      <ListBody
        list={list}
        openBody={openBody}
      />
    </div>
  );
};

export default ListComponent;
