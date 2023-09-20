import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { SmallCloseIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton } from '@chakra-ui/react';
import { theme } from 'src/style';

const style = {
  wrapper: {
    padding: '5px 0',
    gap: '5px',
  },
  iconBtnWrapper: {
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
export default function MultiInput({
  labels: labelsStr,
  values: valuesStr,
  onItemRemove,
}) {
  if (!valuesStr || !labelsStr) {
    return null;
  }
  const values = useMemo(() => valuesStr.split(','), [valuesStr]);
  const labels = useMemo(() => labelsStr.split(','), [labelsStr]);

  const removeItem = useCallback(
    (searchedValue) => {
      let resultVals = [];
      let resultLabels = labels;
      values.forEach((v, i) => {
        if (v !== searchedValue) {
          resultLabels = [
            ...resultLabels.slice(1, i - 1),
            ...resultLabels.slice(i),
          ];
          resultVals = [...resultVals, v];
        }
      });
      return [resultVals.join(','), resultLabels.join(',')];
    },
    [values, labels],
  );

  return (
    <Flex sx={style.wrapper}>
      {values.map((v, i) => (
        <Flex key={v} sx={style.iconBtnWrapper}>
          <Box sx={style.label}>{labels[i]}</Box>
          <IconButton
            sx={style.iconBtn}
            variant="link"
            onClick={() => onItemRemove(...removeItem(v))}
            icon={<SmallCloseIcon />}
          />
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
