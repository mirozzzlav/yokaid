import { Box, IconButton, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { CheckIcon, CloseIcon, InfoIcon } from '@chakra-ui/icons';
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
    '> p, a': {
      lineHeight: '1.1rem',
      fontSize: '0.8rem',
    },
    a: {
      fontWeight: 'bold',
      ':hover': {
        textDecoration: 'underline',
      },
    },
  },
  message: {
    fontSize: '0.9rem',
    lineHeight: '1.1rem',
  },
  closeButton: {
    fontSize: '0.6rem',
    color: '#000',
    marginLeft: 'auto',
    minWidth: 0,
    padding: 0,
  },
};

export default function Message({ message, extraStyle, icon, onHide }) {
  return message ? (
    <Box sx={{ ...style.wrapper, ...extraStyle }}>
      {icon}
      <Text>{message}</Text>
      {onHide &&
        <IconButton
          variant="link"
          sx={style.closeButton}
          aria-label="close"
          icon={<CloseIcon />}
          onClick={onHide}
        />
      }
    </Box>) : null;
}

Message.defaultProps = {
  extraStyle: null,
  onHide: null,
};

Message.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    .isRequired,
  extraStyle: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
  icon: PropTypes.node.isRequired,
  onHide: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
};

function SuccessMessage({ message }) {
  return (
    <Message
      message={message}
      extraStyle={{
        background: theme.colors.green[50],
        border: `1px solid ${theme.colors.green[200]}`,
        '> svg': {
          color: theme.colors.green[500],
        },
      }}
      icon={<CheckIcon />}
    />
  );
}
SuccessMessage.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    .isRequired,
};

function ErrorMessage({ message, margin, onHide }) {
  return (
    <Message
      margin={margin}
      message={message}
      extraStyle={{
        margin,
        background: theme.colors.red[50],
        border: `1px solid ${theme.colors.red[200]}`,
        '> svg': {
          color: theme.colors.red[400],
        },
      }}
      icon={<InfoIcon />}
      onHide={onHide}
    />
  );
}

ErrorMessage.defaultProps = {
  margin: '0',
  onHide: null,
};

ErrorMessage.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    .isRequired,
  margin: PropTypes.string,
  onHide: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
};

function InfoMessage({ message, margin, onHide }) {
  return <Message
    onHide={onHide}
    message={message}
    extraStyle={{
        margin,
        background: theme.colors.orange[50],
        border: `1px solid ${theme.colors.orange[200]}`,
        '> svg': { color: theme.colors.orange[400] },
      }}
    icon={<InfoIcon />}
  />;
}
InfoMessage.defaultProps = {
  margin: '0',
  onHide: null,
};

InfoMessage.propTypes = {
  margin: PropTypes.string,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    .isRequired,
  onHide: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
};

export { SuccessMessage, ErrorMessage, InfoMessage };
