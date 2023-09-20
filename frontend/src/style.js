/**
 * This file is for common CSS styles
 */

import { extendTheme } from '@chakra-ui/react';

// Extend the default Chakra UI theme to access shadow styles
const theme = extendTheme();

const globalStyle = {
  formWrapper: {
    '> *': {
      marginBottom: theme.space[2],
      '> label': {
        marginBottom: 0,
      },
      'textarea, input': {
        paddingLeft: theme.space[2],
      },
      input: {
        paddingRight: '40px',
      },
    },
  },
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
      zIndex: 500,
      marginTop: '5px',
      top: '100%',
      position: 'absolute',
      width,
      ...positionStyle,
    };
  },
};

export { theme, globalStyle };
