import { List, listHasError } from '../listsSlice';
import './ListComponent.scss';
import ListHeader from './ListHeader';
import { useAppSelector } from '../../../app/hooks';
import { selectTheme } from '../../theme/themeSlice';
import { useMemo, useState } from 'react';
import ListBody from './ListBody';
import { StateInitialState } from '../../state/stateSlice';
import ItemComponent from './ItemComponent';

export interface ListComponentProps {
  list: List;
}

const ListComponentEdition = ({ list }: ListComponentProps) => {
  const [openBody, setOpenBody] = useState(false);
  const theme = useAppSelector(selectTheme);
  const error = useMemo(() => listHasError(list), [list]);

  return (
    <div
      className="ListComponent"
      style={{
        backgroundColor: theme.backgroundSecondary,
        borderColor: error ? 'red' : theme.backgroundSecondary,
      }}
    >
      <>
        <ListHeader
          list={list}
          openBody={openBody}
          setOpenBody={() => setOpenBody((o) => !o)}
        />
        <ListBody
          list={list}
          openBody={openBody}
          mode="edition"
        />
      </>
    </div>
  );
};

export default ListComponentEdition;
