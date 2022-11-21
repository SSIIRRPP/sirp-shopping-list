import { Button } from '@mui/material';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import LoadProtection from '../Components/LoadProtection';
import Text from '../Components/Text';
import DeletionModal from '../features/lists/Components/DeletionModal';
import ListComponentShopping from '../features/lists/Components/ListComponentShopping';
import {
  emptyList,
  List,
  selectList,
  selectListsError,
  selectListsStatus,
} from '../features/lists/listsSlice';
import { dataSyncStart } from '../features/state/stateSlice';
import './styles/Shopping.scss';

const Shopping = () => {
  const [openModal, setOpenModal] = useState(false);
  const { listId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) =>
    selectList(state, listId as List['id'])
  );

  const listsStatus = useAppSelector(selectListsStatus);
  const listsError = useAppSelector(selectListsError);

  const returnToMain = useCallback(() => navigate('/'), [navigate]);

  const handleDeleteList = useCallback(() => {
    if (list) {
      returnToMain();
      dispatch(emptyList({ listId: list.id }));
      dispatch(dataSyncStart('completed-list'));
    }
  }, [list, dispatch, returnToMain]);

  return (
    <div className="Shopping">
      <LoadProtection
        status={listsStatus}
        error={listsError}
      >
        {list ? (
          <>
            <div className="Shopping__list">
              <Button
                variant="contained"
                onClick={returnToMain}
              >
                <Text
                  colorVariant="contained"
                  sx={{ fontSize: '1.25rem' }}
                >
                  Volver
                </Text>
              </Button>
              <Button
                className="ListComponent__complete"
                variant="contained"
                onClick={() => setOpenModal(true)}
              >
                <Text colorVariant="contained">Completar compra</Text>
              </Button>
              <ListComponentShopping list={list} />
            </div>
            <DeletionModal
              open={openModal}
              setOpen={setOpenModal}
              deleteFunc={handleDeleteList}
              message={[
                `¿Seguro que quieres completar la compra de la lista "${list.name}"?`,
                'Esta acción eliminará la lista',
              ]}
            />
          </>
        ) : (
          <div className="Shopping__noList">
            <Text sx={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              No se ha encontrado la lista especificada
            </Text>
            <Button
              variant="outlined"
              onClick={returnToMain}
            >
              <Text sx={{ fontSize: '1.25rem' }}>Volver</Text>
            </Button>
          </div>
        )}
      </LoadProtection>
    </div>
  );
};

export default Shopping;
