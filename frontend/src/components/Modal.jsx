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
import { theme } from 'src/style';

const style = {
  modalBody: {
    maxHeight: '400px',
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: `${theme.colors.black} ${theme.colors.white}`,
  },
};
export default function Modal({
  isShown,
  setIsShown,
  title,
  submitButton,
  children,
}) {
  return (
    <ModalChakra isOpen={isShown} onClose={() => setIsShown(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody sx={style.modalBody}>{children}</ModalBody>
        <ModalFooter>
          {submitButton && (
            <Button
              variant="solid"
              colorScheme="blue"
              mr={3}
              onClick={submitButton.onClick}
            >
              {submitButton.label}
            </Button>
          )}
          <Button onClick={() => setIsShown(false)} variant="solid">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalChakra>
  );
}

Modal.defaultProps = {
  submitButton: null,
};

Modal.prototype.propTypes = {
  isShown: PropTypes.bool.isRequired,
  setIsShown: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  submitButton: PropTypes.oneOfType([
    PropTypes.shape({
      label: PropTypes.string,
      onClick: PropTypes.func,
    }),
    PropTypes.oneOf([null]),
  ]),
};
