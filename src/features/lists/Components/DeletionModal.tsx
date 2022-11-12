import { Box, Button, Modal } from '@mui/material';
import React, { useCallback, useEffect } from 'react';
import { useAppSelector } from '../../../app/hooks';
import Text from '../../../Components/Text';
import { selectTheme } from '../../theme/themeSlice';

interface DeletionModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteFunc: () => any;
  message: string | string[];
}

const DeletionModal = ({
  open,
  setOpen,
  message,
  deleteFunc,
}: DeletionModalProps) => {
  const theme = useAppSelector(selectTheme);

  const listenEnterKeyDown = useCallback(
    function (this: Document, ev: KeyboardEvent) {
      if (ev.key === 'Enter') {
        deleteFunc();
      }
    },
    [deleteFunc]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', listenEnterKeyDown);
      return () => document.removeEventListener('keydown', listenEnterKeyDown);
    }
  }, [open, listenEnterKeyDown]);

  return (
    <Modal
      open={open}
      onClose={() => setOpen((s) => !s)}
      component="div"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.backgroundColor,
          padding: '1rem',
          borderRadius: '.4rem',
        }}
      >
        {Array.isArray(message) ? (
          message.map((m, i) => (
            <Text
              key={`${Date.now()}-${i}`}
              sx={{ textAlign: 'center', padding: '.5rem' }}
            >
              {m}
            </Text>
          ))
        ) : (
          <Text sx={{ textAlign: 'center', padding: '1rem' }}>{message}</Text>
        )}
        <div
          style={{
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setOpen((s) => !s)}
          >
            No
          </Button>
          <Button
            variant="outlined"
            onClick={deleteFunc}
          >
            Si
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default DeletionModal;
