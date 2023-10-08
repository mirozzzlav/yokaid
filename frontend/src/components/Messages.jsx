import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import PropTypes from 'prop-types';
import { CheckIcon, InfoIcon } from '@chakra-ui/icons';
import theme from 'src/style';
import { unknownObjectValidator } from 'src/helpers';

const style = {
  wrapper: {
    padding: '0.6rem 1rem 0.6rem 1rem',
    display: 'flex',
    gap: '0.4rem',
    borderRadius: theme.radii.md,
    '> svg': {
      fontSize: '0.9rem',
      marginTop: '2px',
    },
    '> p': {
      lineHeight: '1.1rem',
      fontSize: '0.8rem',
    },
  },
  message: {
    fontSize: '0.9rem',
    lineHeight: '1.1rem',
  },
};

export default function Message({ message, extraStyle, icon }) {
  return (
    <Box sx={{ ...style.wrapper, ...extraStyle }}>
      {icon}
      <Text>{message}</Text>
    </Box>
  );
}

Message.defaultProps = {
  extraStyle: null,
};
Message.propTypes = {
  message: PropTypes.string.isRequired,
  extraStyle: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
  icon: PropTypes.node.isRequired,
};

function SuccessMessage({ message }) {
  return (
    <Message
      message={message}
      extraStyle={{
        background: theme.colors.green[100],
        border: `1px solid ${theme.colors.green[300]}`,
        '> svg, >p': {
          color: theme.colors.green[700],
        },
      }}
      icon={<CheckIcon />}
    />
  );
}
SuccessMessage.propTypes = {
  message: PropTypes.string.isRequired,
};

function ErrorMessage({ message }) {
  return (
    <Message
      message={message}
      extraStyle={{
        background: theme.colors.red[100],
        border: `1px solid ${theme.colors.red[300]}`,
        '> svg, >p': {
          color: theme.colors.red[700],
        },
      }}
      icon={<InfoIcon />}
    />
  );
}
ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
};

function InfoMessage({ message }) {
  return (
    <Message
      message={message}
      extraStyle={{
        background: theme.colors.yellow[100],
        border: `1px solid ${theme.colors.yellow[300]}`,
        '> svg, >p': {
          color: theme.colors.yellow[700],
        },
      }}
      icon={<InfoIcon />}
    />
  );
}
InfoMessage.propTypes = {
  message: PropTypes.string.isRequired,
};

export { SuccessMessage, ErrorMessage, InfoMessage };
