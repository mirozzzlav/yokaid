import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { SmallCloseIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton } from '@chakra-ui/react';
import theme from 'src/style';

const style = {
  wrapper: {
    gap: theme.space[1],
    flexWrap: 'wrap',
  },
  element: {
    border: `1px solid ${theme.colors.orange[200]}`,
    background: `${theme.colors.orange[50]}`,
    borderRadius: theme.radii.md,
    padding: `${theme.space[1]} ${theme.space[2]}`,
  },
  iconBtn: {
    display: 'block',
    minWidth: 'unset',
    '> *': {
      fontSize: '0.9rem',
      marginLeft: '3px',
      marginTop: '-2px',
    },
  },
  label: {
    fontSize: '0.9rem',
  },
};

export default function MultiItem({ labels, margin }) {
  return (
    <Flex sx={{ ...style.wrapper, margin }}>
      {labels.map((v, i) => (
        <Flex key={v} sx={style.element}>
          <Box sx={style.label}>{labels[i]}</Box>
        </Flex>
      ))}
    </Flex>
  );
}

MultiItem.defaultProps = {
  margin: '0',
};

MultiItem.prototype.propTypes = {
  labels: PropTypes.string.isRequired,
  margin: PropTypes.string,
};

export function MultiInput({ labels, values, onItemRemove, padding }) {
  if (!labels || !values) {
    return null;
  }

  const removeItem = useCallback(
    (searchedValue) => {
      let resultValues = null;
      let resultLabels = null;
      values.forEach((v, i) => {
        if (v !== searchedValue) {
          resultLabels = [...(resultLabels || []), labels[i]];
          resultValues = [...(resultValues || []), v];
        }
      });
      return [resultValues, resultLabels];
    },
    [values, labels],
  );

  return (
    <Flex sx={{ ...style.wrapper, padding }}>
      {values.map((v, i) => (
        <Flex key={v} sx={style.element}>
          <Box sx={style.label}>{labels[i]}</Box>
          {onItemRemove && (
            <IconButton
              sx={style.iconBtn}
              variant="link"
              onClick={() => onItemRemove(...removeItem(v))}
              icon={<SmallCloseIcon />}
            />
          )}
        </Flex>
      ))}
    </Flex>
  );
}

MultiInput.defaultProps = {
  padding: `${theme.space[1]} 0 0 0`,
};
MultiInput.prototype.propTypes = {
  values: PropTypes.string.isRequired,
  labels: PropTypes.string.isRequired,
  onItemRemove: PropTypes.func.isRequired,
  padding: PropTypes.string,
};
