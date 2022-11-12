import Text from '../../../Components/Text';
import ExpandIcon from '../../../Components/ExpandIcon';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete.svg';
import { deleteList, List } from '../listsSlice';
import { useAppDispatch } from '../../../app/hooks';
import { useCallback, useState } from 'react';
import { Button } from '@mui/material';
import DeletionModal from './DeletionModal';

interface ListHeaderProps {
  list: List;
  openBody: boolean;
  setOpenBody(): void;
}

const ListHeader = ({ list, openBody, setOpenBody }: ListHeaderProps) => {
  const [openModal, setOpenModal] = useState(false);
  const dispatch = useAppDispatch();
  const handleDeleteList = useCallback(
    () => dispatch(deleteList({ listId: list.id })),
    [dispatch]
  );

  return (
    <>
      <div className="ListComponent__header">
        <div
          className="ListComponent__header--open"
          onClick={setOpenBody}
        >
          <Text>{list.name}</Text>
          <ExpandIcon open={openBody} />
        </div>
        <Button
          onClick={() => setOpenModal(true)}
          variant="contained"
          color="error"
        >
          <DeleteIcon fill="white" />
        </Button>
      </div>
      <DeletionModal
        open={openModal}
        setOpen={setOpenModal}
        deleteFunc={handleDeleteList}
        message={`¿Seguro que quieres eliminar la lista "
        ${list.name}"?`}
      />
    </>
  );
};

export default ListHeader;
