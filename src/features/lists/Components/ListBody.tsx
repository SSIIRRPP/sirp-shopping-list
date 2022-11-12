import { Button, Collapse, TextField } from '@mui/material';
import { useCallback } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import ItemComponent from './ItemComponent';
import { changeListName, createListItem, List } from '../listsSlice';
import Text from '../../../Components/Text';
import { useNavigate } from 'react-router';
import { StateInitialState } from '../../state/stateSlice';

interface ListBodyProps {
  list: List;
  openBody: boolean;
  mode: StateInitialState['mode'] | 'completed';
}

const ListBody = ({ list, openBody, mode }: ListBodyProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const setListName = useCallback(
    (value: string) => {
      dispatch(changeListName({ id: list.id, value }));
    },
    [dispatch, list.id]
  );
  const addProduct = useCallback(
    () => dispatch(createListItem({ listId: list.id })),
    [dispatch, list.id]
  );

  const activateShoppinMode = useCallback(
    () => navigate(`/shopping/${list.id}`),
    [navigate, list.id]
  );

  return (
    <Collapse in={openBody}>
      <div className="ListComponent__body">
        <div className="ListComponent__body--header">
          <TextField
            value={list.name}
            onChange={(e) => setListName(e.target.value)}
            label="Nombre de la lista"
            error={list.name.length <= 0}
            helperText={
              list.name.length <= 0 ? (
                <>Introduce un nombre para la lista</>
              ) : undefined
            }
          />
          <Button
            variant="outlined"
            onClick={activateShoppinMode}
          >
            Modo compra
          </Button>
          <Button
            variant="outlined"
            onClick={addProduct}
          >
            Añadir producto
          </Button>
        </div>
        <div className="ListComponent__body--body">
          <Text variant="h6">Productos:</Text>
          {list.items.length > 0 ? (
            list.items.map((item) => (
              <ItemComponent
                mode={mode}
                dispatch={dispatch}
                key={item.id}
                list={list}
                item={item}
              />
            ))
          ) : (
            <Text sx={{ color: 'red', textAlign: 'center', padding: '1rem' }}>
              ¡Añade productos a la lista!
            </Text>
          )}
        </div>
      </div>
    </Collapse>
  );
};

export default ListBody;
