/**
 * This file is for common CSS styles
 */

import { extendTheme } from '@chakra-ui/react';

// Extend the default Chakra UI theme
const originalTheme = extendTheme();
// console.log(originalTheme.components);

const Modal = {
  baseStyle: {
    header: {
      background: originalTheme.colors.gray[50],
      borderBottom: `1px solid ${originalTheme.colors.gray[200]}`,
      fontWeight: originalTheme.fontWeights.medium,
      borderTopLeftRadius: originalTheme.radii.md,
      borderTopRightRadius: originalTheme.radii.md,
      marginBottom: originalTheme.space[4],
    },
    closeButton: {
      top: '15px',
    },
    body: {
      paddingTop: 0,
    },
  },
};

const FormControl = {
  baseStyle: {
    container: {
      'input, textarea': {
        background: '#fff',
      },
      marginBottom: originalTheme.space[2],
      ':last-child': {
        margin: 0,
      },
    },
  },
};

const FormLabel = {
  baseStyle: {
    marginBottom: 0,
    fontWeight: originalTheme.fontWeights.normal,
  },
};

const FormError = {
  baseStyle: {
    text: {
      marginTop: originalTheme.space[1],
      color: originalTheme.colors.red[500],
    },
  },
};

const theme = extendTheme({
  components: {
    Modal,
    Form: FormControl,
    FormLabel,
    FormError,
    Button: {
      baseStyle: {
        fontWeight: originalTheme.fontWeights.light,
      },
    },
  },
  styles: {
    global: {
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
      '.marker-fade': {
        opacity: 0,
        animation: 'markerFadeIn 0.5s ease-in-out forwards',
      },
      '@keyframes markerFadeIn': {
        from: {
          opacity: 0,
        },
        to: {
          opacity: 1,
        },
      },
    },
  },
});

export default theme;
