/**
 * This file is for common CSS styles
 */

import { extendTheme } from '@chakra-ui/react';

const globalStyle = {
  contextMenuLikeWrapper: {
    position: 'relative',
  },
  contextMenuLikeChild: (position, width) => {
    let positionStyle = { left: 0 };
    if (position === 'center') {
      positionStyle = { left: `calc(50% - ${width}/2)` };
    }
    if (position === 'right') {
      positionStyle = { right: 0 };
    }
    return {
      marginTop: '5px',
      top: '100%',
      position: 'absolute',
      width,
      ...positionStyle,
    };
  },
};

// Extend the default Chakra UI theme to access shadow styles
const theme = extendTheme();

export { theme, globalStyle };
