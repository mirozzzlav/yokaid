import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  isShown,
  setIsShown,
  setIsSubmitted,
  title,
  submitButtonLabel,
  children,
}) {
  return (
    <ModalChakra isOpen={isShown} onClose={() => setIsShown(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button
            variant="solid"
            colorScheme="blue"
            mr={3}
            onClick={() => setIsSubmitted(true)}
          >
            {submitButtonLabel}
          </Button>
          <Button onClick={() => setIsShown(false)} variant="ghost">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalChakra>
  );
}

Modal.propTypes = {
  isShown: PropTypes.bool.isRequired,
  setIsShown: PropTypes.func.isRequired,
  setIsSubmitted: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  submitButtonLabel: PropTypes.string.isRequired,
};
