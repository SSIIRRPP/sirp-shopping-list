import { useAppSelector } from '../../../app/hooks';
import LoadProtection from '../../../Components/LoadProtection';
import ListComponent from './ListComponent';
import {
  selectLists,
  selectListsError,
  selectListsStatus,
} from '../listsSlice';

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
          <ListComponent
            key={list.id}
            list={list}
          />
        ))}
      </>
    </LoadProtection>
  );
};

export default ListsRenderer;
