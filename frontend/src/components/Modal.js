import React, { useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Modal as ModalChakra,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@chakra-ui/react';
import theme from 'src/style';
import { buttonPropType } from 'src/constants';
import { TranslationsContext } from 'src/providers';

const style = {
  modalContent: {
    width: '400px',
    maxWidth: 'calc(100vw - 30px)',
  },
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
  const { T } = useContext(TranslationsContext);
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
      <ModalContent sx={style.modalContent}>
        <ModalHeader>{title}</ModalHeader>
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
            {T('close')}
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
  submitButton: PropTypes.oneOfType([buttonPropType, PropTypes.oneOf([null])]),
  isScrolledDown: PropTypes.bool,
};
