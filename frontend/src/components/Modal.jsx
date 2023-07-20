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
} from '@chakra-ui/react';

export default function Modal({
  show,
  onClose,
  title,
  children,
  submit: { label, action },
}) {
  return (
    <ModalChakra isOpen={show} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
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
};
