import Text from '../../../Components/Text';
import ExpandIcon from '../../../Components/ExpandIcon';
import { List } from '../listsSlice';

interface ListHeaderProps {
  list: List;
  openBody: boolean;
  setOpenBody(): void;
}

const ListHeader = ({ list, openBody, setOpenBody }: ListHeaderProps) => {
  return (
    <div
      className="ListComponent__header"
      onClick={setOpenBody}
    >
      <Text>{list.name}</Text>
      <ExpandIcon open={openBody} />
    </div>
  );
};

export default ListHeader;
