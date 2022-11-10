import { Collapse, TextField } from '@mui/material';
import { useCallback } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import ItemComponent from '../../items/ItemComponent';
import { changeListName, List } from '../listsSlice';

interface ListBodyProps {
  list: List;
  openBody: boolean;
}

const ListBody = ({ list, openBody }: ListBodyProps) => {
  const dispatch = useAppDispatch();
  const setListName = useCallback(
    (value: string) => {
      dispatch(changeListName({ id: list.id, value }));
    },
    [list.id]
  );

  return (
    <Collapse
      className="ListComponent__body"
      in={openBody}
    >
      <div className="ListComponent__body--header">
        <TextField
          value={list.name}
          onChange={(e) => setListName(e.target.value)}
          error={list.name.length <= 0}
          helperText={
            list.name.length <= 0 ? (
              <>Introduce un nombre para la lista</>
            ) : undefined
          }
        />
      </div>
      <div className="ListComponent__body--body">
        {Object.entries(list.items).map(([id, number]) => (
          <ItemComponent
            key={id}
            itemId={id}
            number={number}
          />
        ))}
      </div>
    </Collapse>
  );
};

export default ListBody;
