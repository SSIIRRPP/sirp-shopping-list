import { Button } from '@mui/material';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { SagasContext } from '../App';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import ListsRenderer from '../features/lists/Components/ListsRenderer';
import {
  createList,
  listHasError,
  selectLists,
} from '../features/lists/listsSlice';
import {
  changeShoppingMode,
  dataSyncStart,
  selectStateStatus,
} from '../features/state/stateSlice';
import './styles/Main.scss';

const Main = () => {
  const instances = useContext(SagasContext);
  const lists = useAppSelector(selectLists);
  const stateStatus = useAppSelector(selectStateStatus);
  const dispatch = useAppDispatch();

  const addList = useCallback(() => dispatch(createList()), [dispatch]);
  const dataSyncronization = useCallback(
    () => dispatch(dataSyncStart('manual-sync')),
    [dispatch]
  );

  const notModified = useMemo(
    () => !!instances.executeInstanceMethod('lists', 'checkEquality'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lists, stateStatus]
  );

  useEffect(() => {
    dispatch(changeShoppingMode('edition'));
  }, [dispatch]);

  const errors = useMemo(() => lists.some(listHasError), [lists]);

  return (
    <div className="Main">
      <div className="Main__head">
        <Button
          onClick={dataSyncronization}
          variant="outlined"
          disabled={notModified || errors}
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
