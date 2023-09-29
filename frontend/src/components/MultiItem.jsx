import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { SmallCloseIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton } from '@chakra-ui/react';
import theme from 'src/style';

const style = {
  wrapper: {
    padding: '5px 0',
    gap: '5px',
  },
  element: {
    border: `1px solid ${theme.colors.gray[200]}`,
    background: theme.colors.gray[50],
    borderRadius: theme.radii.md,
    padding: '0px 5px',
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

export default function MultiItem({ labels }) {
  return (
    <Flex sx={style.wrapper}>
      {labels.map((v, i) => (
        <Flex key={v} sx={style.element}>
          <Box sx={style.label}>{labels[i]}</Box>
        </Flex>
      ))}
    </Flex>
  );
}

MultiItem.prototype.propTypes = {
  labels: PropTypes.string.isRequired,
};

export function MultiInput({ labels, values, onItemRemove }) {
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
    <Flex sx={style.wrapper}>
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
MultiInput.prototype.propTypes = {
  values: PropTypes.string.isRequired,
  labels: PropTypes.string.isRequired,
  onItemRemove: PropTypes.func.isRequired,
};
