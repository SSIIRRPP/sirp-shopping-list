import { useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { Item, selectItem } from './itemsSlice';

export interface ItemComponentProps {
  itemId: Item['id'];
  number: number;
}

const ItemComponent = ({ itemId }: ItemComponentProps) => {
  const item = useAppSelector((state: RootState) => selectItem(state, itemId));

  return item ? <div>{item.name}</div> : null;
};

export default ItemComponent;
