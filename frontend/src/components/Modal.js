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
  const { isScrolledDown } = useContext(WindowContext);
  const { T } = useContext(TranslationsContext);

  useEffect(() => {
    if (isScrolledDown && isShown) {
      onScrolledDown();
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
        <ModalBody>{children}</ModalBody>
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
