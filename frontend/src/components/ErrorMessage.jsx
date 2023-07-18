import { Alert, AlertIcon, Box, Text } from '@chakra-ui/react';
import React from 'react';
import PropTypes from 'prop-types';

export default function ErrorMessage({ error }) {
  return (
    <Alert status="error">
      <AlertIcon />
      <Box ml="2">
        <Text fontSize="sm">{error}</Text>
      </Box>
    </Alert>
  );
}

ErrorMessage.defaultProps = {
  error: '',
};
ErrorMessage.propTypes = {
  error: PropTypes.string,
};
