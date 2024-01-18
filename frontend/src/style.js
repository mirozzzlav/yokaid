/**
 * This file is for common CSS styles
 */

import { extendTheme } from '@chakra-ui/react';

// Extend the default Chakra UI theme
const originalTheme = extendTheme();
// console.log(originalTheme.components);

const Modal = {
  variants: {
    ...originalTheme.components.variants,
    customModal: {
      dialog: {
        w: `calc(100vw - ${originalTheme.space[10]})`,
        maxW: '660px',
        minW: '330px',
        margin: `${originalTheme.space[10]} auto`,
      },
    },
  },
  baseStyle: {
    overlay: {
      background: originalTheme.colors.blackAlpha[800],
    },
    header: {
      background: originalTheme.colors.gray[100],
      borderBottom: `1px solid ${originalTheme.colors.gray[300]}`,
      fontWeight: originalTheme.fontWeights.light,
      fontSize: '1.6rem',
      borderTopLeftRadius: originalTheme.radii.md,
      borderTopRightRadius: originalTheme.radii.md,
      letterSpacing: '0.1rem',
      padding: `${originalTheme.space[4]} ${originalTheme.space[4]} ${originalTheme.space[4]} ${originalTheme.space[4]}`,
    },
    body: {
      padding: `${originalTheme.space[4]}`,
      margin: 0,
    },
    footer: {
      background: originalTheme.colors.gray[50],
      borderTop: `1px solid ${originalTheme.colors.gray[200]}`,
      borderBottomLeftRadius: originalTheme.radii.md,
      borderBottomRightRadius: originalTheme.radii.md,
      padding: `${originalTheme.space[4]} ${originalTheme.space[4]} ${originalTheme.space[4]} ${originalTheme.space[4]}`,
      '> button': {
        marginRight: originalTheme.space[2],
        ':last-child': {
          marginRight: 0,
        },
      },
    },
  },
};

const FormControl = {
  baseStyle: {
    container: {
      'input, textarea': {
        background: '#fff',
      },
      marginBottom: originalTheme.space[4],
      ':last-child': {
        margin: 0,
      },
    },
  },
};

const FormLabel = {
  baseStyle: {
    marginBottom: originalTheme.space[1],
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
          zIndex: 1,
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

export const yokaidColor = '#1788d9';
export default theme;
