import theme from 'src/style';
import React, { useEffect, useRef, useState } from 'react';
import { keyframes } from '@emotion/react';
import { Box, Button, Flex } from '@chakra-ui/react';
import { GhostIcon } from 'src/assets';
import PropTypes from 'prop-types';
import { buttonPropType } from 'src/constants';
import { unknownObjectValidator } from 'src/helpers';

const dotsAnim = (prefix = 'isLoading') =>
  keyframes(`
    0%, 20% {
      content: '${prefix}.';
    }
    40%, 60% {
      content: '${prefix}..';
    }
    80%, 100% {
      content: '${prefix}...';
    }`);
const pulseAnim = keyframes(`
    0%, 20% {
      transform: scale(0.3);
    }
    40%, 60% {
      transform: scale(0.7);
    }
    80%, 100% {
      transform: scale(1);
    }`);

const style = {
  loader: (isShown, mini, color) => ({
    ...(isShown ? { display: 'flex' } : { display: 'none' }),
    justifyContent: 'left',
    alignItems: 'center',
    gap: theme.space[1],
    ...(!mini
      ? {
          width: '150px',
          ':after': {
            fontSize: '0.9rem',
            color,
            content: '""',
            animation: `${dotsAnim()} 2s infinite steps(1)`,
            fontFamily: 'monospace',
            fontWeight: theme.fontWeights.bold,
          },
        }
      : null),
  }),
  loaderIcon: (color, mini) => ({
    fill: color,
    ...(mini
      ? {
          animation: `${pulseAnim} 0.5s infinite`,
        }
      : {
          width: '30px',
          height: '30px',
        }),
  }),
};

export default function Loader({ isLoading, color, mini, delayOnHide }) {
  const timeoutRef = useRef(false);
  const isShownRef = useRef(false);
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    if (!delayOnHide) {
      setIsShown(isLoading);
      return;
    }

    isShownRef.current = isLoading;
    if (isLoading) {
      setIsShown(true);
      return;
    }

    if (!timeoutRef.current) {
      setTimeout(() => {
        timeoutRef.current = false;
        setIsShown(isShownRef.current);
      }, 500);
    }
  }, [isLoading, isShownRef.current]);

  return (
    <Box sx={style.loader(isShown, mini, color)}>
      <GhostIcon sx={style.loaderIcon(color, mini)} />
    </Box>
  );
}

Loader.defaultProps = {
  color: '#000',
  mini: false,
  delayOnHide: false,
};
Loader.prototype.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  color: PropTypes.string,
  mini: PropTypes.bool,
  delayOnHide: PropTypes.bool,
};

export function LoaderWithButton({ isLoading, button, sx }) {
  return (
    <Flex sx={sx}>
      <Loader isLoading={isLoading} mini={false} />
      {!isLoading && (
        <Button
          variant="solid"
          colorScheme="blue"
          mr={3}
          onClick={button.onClick}
          leftIcon={button.icon || null}
        >
          {button.label}
        </Button>
      )}
    </Flex>
  );
}

LoaderWithButton.prototype.propTypes = {
  sx: PropTypes.oneOfType([PropTypes.oneOf([null]), unknownObjectValidator]),
  button: buttonPropType.isRequired,
  isLoading: PropTypes.bool.isRequired,
};
