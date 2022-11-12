import { TextField } from '@mui/material';
import {
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  changeListItemName,
  deleteListItem,
  List,
  listItemHasError,
} from '../listsSlice';
import ItemEditionButtons from './ItemEditionButtons';
import './ItemComponent.scss';
import { selectTheme } from '../../theme/themeSlice';
import DeletionModal from './DeletionModal';
import { StateInitialState } from '../../state/stateSlice';
import Text from '../../../Components/Text';

export interface Item {
  id: string;
  name: string;
  quantity: number;
}

export interface ItemComponentProps {
  item: Item;
  list: List;
  mode: StateInitialState['mode'] | 'completed';
  dispatch?: Dispatch<{ type: string; payload: any }>;
}

const ItemComponent = ({ item, list, mode, dispatch }: ItemComponentProps) => {
  const [openModal, setOpenModal] = useState(false);
  const theme = useAppSelector(selectTheme);
  const error = useMemo(() => listItemHasError(item), [item]);

  const setListName = useCallback(
    (value: string) => {
      dispatch &&
        dispatch(
          changeListItemName({ itemId: item.id, listId: list.id, value })
        );
    },
    [dispatch, item.id, list]
  );

  const handleDeleteListItem = useCallback(
    () =>
      dispatch &&
      dispatch(deleteListItem({ listId: list.id, itemId: item.id })),
    [list.id, item.id]
  );

  return (
    <>
      <div
        className={`ItemComponent ${mode}`}
        style={{
          backgroundColor: theme.backgroundColor,
          borderColor: error ? 'red' : theme.backgroundColor,
        }}
      >
        {mode === 'edition' ? (
          <TextField
            value={item.name}
            onChange={(e) => setListName(e.target.value)}
            label="Nombre del producto"
            error={item.name.length <= 0}
            helperText={
              item.name.length <= 0 ? (
                <>Introduce un nombre para el producto</>
              ) : undefined
            }
          />
        ) : (
          <div className="ItemComponent__name">
            <Text>{item.name}</Text>
          </div>
        )}
        {mode !== 'completed' ? (
          <div className="ItemComponent__buttons--container">
            <ItemEditionButtons
              mode={mode}
              item={item}
              list={list}
              dispatch={dispatch!}
              setOpenModal={setOpenModal}
            />
          </div>
        ) : null}
      </div>
      <DeletionModal
        open={openModal}
        setOpen={setOpenModal}
        deleteFunc={handleDeleteListItem}
        message={`¿Seguro que quieres ${
          mode === 'edition' ? 'eliminar' : 'completar'
        } el producto "${item.name}" de la lista "
        ${list.name}"?`}
      />
    </>
  );
};

export default ItemComponent;
