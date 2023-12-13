import { Box } from '@chakra-ui/react';
import React, { useCallback, useRef, useState } from 'react';
import theme from 'src/style';
import PropTypes from 'prop-types';
import { unknownObjectValidator } from 'src/helpers';

const style = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: theme.colors.blackAlpha[800],
    zIndex: 1500,
  },
  content: {
    background: '#fff',
    padding: `${theme.space[4]} ${theme.space[4]} ${theme.space[4]} ${theme.space[4]}`,
  },
};

export default function Overlay({
  children,
  isShown: isShownFromProps,
  isShownSetter,
  contentSx,
  sx,
}) {
  let [isShown, setIsShown] = useState(false);
  const ref = useRef();
  if (isShownFromProps !== null) {
    isShown = isShownFromProps;
    setIsShown = isShownSetter;
  }

  const onClose = useCallback((e) => {
    if (e.target === ref.current) {
      setIsShown(false);
    }
  }, []);

  return isShown ? (
    <Box sx={{ ...style.container, ...sx }} tabIndex={0} onClick={onClose} ref={ref}>
      <Box sx={{ ...style.content, ...contentSx }}>{children}</Box>
    </Box>
  ) : null;
}

Overlay.defaultProps = {
  isShown: null,
  isShownSetter: () => {},
  contentSx: null,
  sx: null,
};
Overlay.prototype.propTypes = {
  children: PropTypes.node.isRequired,
  isShown: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf([null])]),
  isShownSetter: PropTypes.func,
  contentSx: PropTypes.oneOfType([unknownObjectValidator, PropTypes.oneOf([null])]),
  sx: PropTypes.oneOfType([unknownObjectValidator, PropTypes.oneOf([null])]),
};
