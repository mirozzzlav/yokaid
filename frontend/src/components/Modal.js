import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Modal as ModalChakra,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Box,
} from '@chakra-ui/react';
import { buttonPropType } from 'src/constants';
import { TranslationsContext, WindowContext } from 'src/providers';
import Loader from 'src/components/Loader';

const style = {
  fakeFocus: {
    width: 0,
    height: 0,
    margin: 0,
    padding: 0,
    outline: 'none !important',
  },
};
export default function Modal({
  isShown,
  onShow,
  close,
  title,
  submitButton,
  children,
  onScrolledDown,
  isLoading,
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
        <ModalBody>
          <Box tabIndex={0} sx={style.fakeFocus} />
          {children}
        </ModalBody>
        <ModalFooter>
          <Loader isLoading={isLoading} mini={false} />
          {submitButton && isLoading !== true && (
            <Button
              variant="solid"
              colorScheme="blue"
              mr={3}
              onClick={submitButton.onClick}
              leftIcon={submitButton.icon || null}
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
  isLoading: null,
};

Modal.prototype.propTypes = {
  isShown: PropTypes.bool.isRequired,
  onShow: PropTypes.func,
  close: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  submitButton: PropTypes.oneOfType([buttonPropType, PropTypes.oneOf([null])]),
  onScrolledDown: PropTypes.func,
  isLoading: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf([null])]),
};
