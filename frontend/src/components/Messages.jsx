import { Alert, AlertIcon, Box, Text } from '@chakra-ui/react';
import React from 'react';
import PropTypes from 'prop-types';

function ErrorMessage({ message }) {
  return (
    <Alert status="error">
      <AlertIcon />
      <Box ml="2">
        <Text fontSize="sm">{message}</Text>
      </Box>
    </Alert>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
};

function SuccessMessage({ message }) {
  return (
    <Alert status="success">
      <AlertIcon />
      <Box ml="2">
        <Text fontSize="sm">{message}</Text>
      </Box>
    </Alert>
  );
}

SuccessMessage.propTypes = {
  message: PropTypes.string.isRequired,
};

export { ErrorMessage, SuccessMessage };
