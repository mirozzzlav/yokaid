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
      fontWeight: originalTheme.fontWeights.light,
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

const Input = {
  baseStyle: {
    group: {
      borderColor: originalTheme.colors.borderColor,
    },
  },
};

const FormControl = {
  baseStyle: {
    container: {
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
      marginTop: '2px',
    },
  },
};

const theme = extendTheme({
  components: {
    Modal,
    TextArea: Input,
    Input,
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
    },
  },
});

export default theme;
