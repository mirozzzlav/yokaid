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
import { buttonPropType } from 'src/constants';
import { TranslationsContext, WindowContext } from 'src/providers';

const style = {};
export default function Modal({
  isShown,
  onShow,
  close,
  title,
  submitButton,
  children,
  onScrolledDown,
}) {
  const bodyRef = useRef();
  const { isScrolledDown, screenHeight } = useContext(WindowContext);
  const { T } = useContext(TranslationsContext);
  const controlElmRef = useRef(null);

  useEffect(() => {
    if (isScrolledDown && isShown) {
      onScrolledDown();
    }
  }, [isScrolledDown]);

  useEffect(() => {
    if (!controlElmRef.current) {
      return;
    }
    controlElmRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  }, [screenHeight]);

  useEffect(() => {
    const inputFocusListener = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        controlElmRef.current = e.target.closest('.chakra-form-control');
        return;
      }
      controlElmRef.current = null;
    };
    if (bodyRef.current) {
      bodyRef.current.addEventListener('focus', inputFocusListener, true);
    }
    return () =>
      bodyRef.current &&
      bodyRef.current.removeEventListener('focus', inputFocusListener);
  }, [bodyRef.current]);

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
  onShow: () => {},
  onScrolledDown: () => {},
};

Modal.prototype.propTypes = {
  isShown: PropTypes.bool.isRequired,
  onShow: PropTypes.func,
  close: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  submitButton: PropTypes.oneOfType([buttonPropType, PropTypes.oneOf([null])]),
  onScrolledDown: PropTypes.func,
};
