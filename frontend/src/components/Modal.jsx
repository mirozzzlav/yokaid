import React, { useEffect, useRef } from 'react';
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
  onShow,
  close,
  title,
  submitButton,
  children,
  isScrolledDown,
}) {
  const bodyRef = useRef();
  useEffect(() => {
    if (isScrolledDown && bodyRef.current) {
      bodyRef.current.scrollTo({
        top: bodyRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [isScrolledDown]);

  useEffect(() => {
    if (isShown) {
      onShow();
    }
  }, [isShown]);

  return (
    <ModalChakra isOpen={isShown} onClose={close}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody sx={style.modalBody} ref={bodyRef}>
          {children}
        </ModalBody>
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
          <Button onClick={close} variant="solid">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalChakra>
  );
}

Modal.defaultProps = {
  submitButton: null,
  isScrolledDown: false,
  onShow: () => {},
};

Modal.prototype.propTypes = {
  isShown: PropTypes.bool.isRequired,
  onShow: PropTypes.func,
  close: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  submitButton: PropTypes.oneOfType([
    PropTypes.shape({
      label: PropTypes.string,
      onClick: PropTypes.func,
    }),
    PropTypes.oneOf([null]),
  ]),
  isScrolledDown: PropTypes.bool,
};
