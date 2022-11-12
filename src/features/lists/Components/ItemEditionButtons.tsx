import { Button } from '@mui/material';
import { changeListItemQuantity, List } from '../listsSlice';
import { Item } from './ItemComponent';
import { ReactComponent as AddIcon } from '../../../assets/icons/add.svg';
import { ReactComponent as RemoveIcon } from '../../../assets/icons/remove.svg';
import { ReactComponent as DoneIcon } from '../../../assets/icons/done.svg';
import { useAppSelector } from '../../../app/hooks';
import { selectTheme } from '../../theme/themeSlice';
import { Dispatch, useCallback } from 'react';
import { StateInitialState } from '../../state/stateSlice';

export interface ItemEditionButtonsProps {
  item: Item;
  list: List;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  mode: StateInitialState['mode'];
  dispatch?: Dispatch<{ type: string; payload: any }>;
}

const ItemEditionButtons = ({
  item,
  list,
  setOpenModal,
  mode,
  dispatch,
}: ItemEditionButtonsProps) => {
  const theme = useAppSelector(selectTheme);
  const { quantity } = item;

  const handleQuantityChange = useCallback(
    (value: 1 | -1) => {
      if (item.quantity + value <= 0) {
        setOpenModal(true);
      } else {
        dispatch &&
          dispatch(
            changeListItemQuantity({ itemId: item.id, listId: list.id, value })
          );
      }
    },
    [dispatch, item, list.id, setOpenModal]
  );

  return (
    <div className={`ItemComponent__buttons ${mode}`}>
      {mode === 'edition' ? (
        <>
          <Button onClick={() => handleQuantityChange(-1)}>
            <RemoveIcon fill={theme.color} />
          </Button>
          <div
            className="ItemComponent__buttons--counter"
            style={{ color: theme.color }}
          >
            {quantity}
          </div>
          <Button onClick={() => handleQuantityChange(1)}>
            <AddIcon fill={theme.color} />
          </Button>
        </>
      ) : null}
      {mode === 'shopping' ? (
        <>
          <div
            className="ItemComponent__buttons--counter"
            style={{ color: theme.color }}
          >
            x{quantity}
          </div>
          <Button
            variant="outlined"
            onClick={() => setOpenModal(true)}
          >
            <DoneIcon fill={theme.color} />
          </Button>
        </>
      ) : null}
    </div>
  );
};

export default ItemEditionButtons;
