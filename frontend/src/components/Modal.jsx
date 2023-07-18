import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal as ModalChakra,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ModalCloseButton,
  Box,
  Spinner,
} from '@chakra-ui/react';
import { theme } from 'src/style';

const style = {
  loader: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    background: 'rgba(255,255,255,0.8)',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.md,
  },
};

export default function Modal({
  show,
  onClose,
  title,
  children,
  isLoaderShown,
  submit: { label, action },
}) {
  return (
    <ModalChakra isOpen={show} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        {isLoaderShown && (
          <Box sx={style.loader}>
            <Spinner />
          </Box>
        )}
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button variant="solid" colorScheme="blue" mr={3} onClick={action}>
            {label}
          </Button>
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalChakra>
  );
}

Modal.defaultProps = {
  submit: {
    label: 'submit',
    action: () => {},
  },
  isLoaderShown: false,
};

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  submit: PropTypes.shape({
    label: PropTypes.string,
    action: PropTypes.func,
  }),
  onClose: PropTypes.func.isRequired,
  isLoaderShown: PropTypes.bool,
};
