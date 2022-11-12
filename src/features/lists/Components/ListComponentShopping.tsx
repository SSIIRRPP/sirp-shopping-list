import { deleteListItem, List } from '../listsSlice';
import { useAppSelector } from '../../../app/hooks';
import { selectTheme } from '../../theme/themeSlice';
import { useReducer, useState } from 'react';
import ItemComponent from './ItemComponent';
import { Button, Collapse } from '@mui/material';
import Text from '../../../Components/Text';
import ExpandIcon from '../../../Components/ExpandIcon';
import './ListComponent.scss';

export interface ListComponentProps {
  list: List;
}

interface ListState {
  items: List['items'];
  completed: List['items'];
}

const reducer = (
  state: ListState,
  action: { type: string; payload: any }
): ListState => {
  switch (action.type) {
    case deleteListItem.type: {
      const { itemId }: { listId: string; itemId: string } = action.payload;
      const item = state.items.find((item) => item.id === itemId);
      if (item) {
        return {
          items: state.items.filter((item) => item.id !== itemId),
          completed: [...state.completed, item],
        };
      } else {
        return state;
      }
    }
    default:
      return state;
  }
};

const initReducer = (list: List) => ({
  items: list.items,
  completed: [],
});

const ListComponentShopping = ({ list }: ListComponentProps) => {
  const [openCompleted, setOpenCompleted] = useState(false);
  const [{ items, completed }, dispatcher] = useReducer(
    reducer,
    list,
    initReducer
  );
  const theme = useAppSelector(selectTheme);

  return (
    <>
      <div
        className="ListComponent shopping"
        style={{
          backgroundColor: theme.backgroundSecondary,
          border:
            items.length <= 0
              ? '0px'
              : `2px solid ${theme.backgroundSecondary}`,
          padding: items.length <= 0 ? '0px' : undefined,
          margin: items.length <= 0 ? '0px' : undefined,
        }}
      >
        {items.map((item) => (
          <ItemComponent
            key={item.id}
            dispatch={dispatcher}
            mode="shopping"
            list={list}
            item={item}
          />
        ))}
      </div>
      <div
        className="ListComponent__completed"
        style={{
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.backgroundSecondary,
        }}
      >
        <Button
          disabled={completed.length <= 0}
          onClick={() => setOpenCompleted((s) => !s)}
          style={{
            backgroundColor: theme.backgroundColor,
          }}
        >
          <Text>Completado</Text>
          <ExpandIcon open={openCompleted} />
        </Button>
        <Collapse in={openCompleted}>
          {completed.map((item) => (
            <ItemComponent
              key={item.id}
              mode="completed"
              list={list}
              item={item}
            />
          ))}
        </Collapse>
      </div>
    </>
  );
};

export default ListComponentShopping;
