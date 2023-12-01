import { Box } from '@chakra-ui/react';
import React, { useCallback, useRef, useState } from 'react';
import theme from 'src/style';
import PropTypes from 'prop-types';

const style = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: theme.colors.blackAlpha[800],
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.space[8]} ${theme.space[4]} ${theme.space[4]} ${theme.space[4]}`,
  },
  content: {
    width: '90vw',
    maxWidth: '300px',
  },
};

export default function Overlay({
  children,
  isShown: isShownFromProps,
  isShownSetter,
}) {
  let [isShown, setIsShown] = useState(false);
  const ref = useRef();
  if (isShownFromProps !== null && isShownSetter) {
    isShown = isShownFromProps;
    setIsShown = isShownSetter;
  }

  const onClose = useCallback((e) => {
    if (e.target === ref.current) {
      setIsShown(false);
    }
  }, []);

  return isShown ? (
    <Box sx={style.container} tabIndex={0} onClick={onClose} ref={ref}>
      <Box sx={style.content}>{children}</Box>
    </Box>
  ) : null;
}

Overlay.defaultProps = {
  isShown: null,
  isShownSetter: null,
};
Overlay.prototype.propTypes = {
  children: PropTypes.node.isRequired,
  isShown: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf([null])]),
  isShownSetter: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
};
