import { Button } from '@mui/material';
import { useCallback, useContext, useMemo } from 'react';
import { SagasContext } from '..';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { dataSelector } from '../app/store';
import ListsRenderer from '../features/lists/Components/ListsRenderer';
import { createList } from '../features/lists/listsSlice';
import './styles/Main.scss';

const Main = () => {
  const instances = useContext(SagasContext);
  const data = useAppSelector(dataSelector);
  const dispatch = useAppDispatch();

  const addList = useCallback(() => dispatch(createList()), [dispatch]);
  const dbSyncronization = useCallback(() => {
    /* dispatch() */
  }, [dispatch]);

  const modified = useMemo(
    () =>
      !instances.executeInstanceMethod('lists', 'checkEquality') ||
      !instances.executeInstanceMethod('items', 'checkEquality'),
    [data]
  );

  return (
    <div className="Main">
      <div className="Main__head">
        <Button
          onClick={() => {}}
          variant="outlined"
          disabled={!modified}
        >
          Sincronizar
        </Button>
        <Button
          onClick={addList}
          variant="outlined"
        >
          Añadir lista
        </Button>
      </div>
      <div className="Main__body">
        <ListsRenderer />
      </div>
    </div>
  );
};

export default Main;
