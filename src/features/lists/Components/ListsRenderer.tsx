import { useAppSelector } from '../../../app/hooks';
import LoadProtection from '../../../Components/LoadProtection';
import ListComponentEdition from './ListComponentEdition';
import {
  selectLists,
  selectListsError,
  selectListsStatus,
} from '../listsSlice';
import Text from '../../../Components/Text';

const ListsRenderer = () => {
  const lists = useAppSelector(selectLists);
  const listsStatus = useAppSelector(selectListsStatus);
  const listsError = useAppSelector(selectListsError);
  return (
    <LoadProtection
      status={listsStatus}
      error={listsError}
    >
      <>
        {lists.map((list) => (
          <ListComponentEdition
            key={list.id}
            list={list}
          />
        ))}
        {lists.length === 0 ? (
          <div className="Main__body--noLists">
            <Text sx={{ fontSize: '1.5rem', marginBottom: '4rem' }}>
              Crea una lista
            </Text>
          </div>
        ) : null}
      </>
    </LoadProtection>
  );
};

export default ListsRenderer;
