import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';
import theme from 'src/style';

const style = {
  formGroup: {
    '> div': {
      padding: `${theme.space[4]} ${theme.space[3]}`,
      borderRadius: theme.radii.md,
      border: `1px solid ${theme.colors.gray[200]}`,
      background: theme.colors.gray[50],
    },
    h4: {
      fontWeight: theme.fontWeights.medium,
      padding: `0 0 ${theme.space[1]} 0`,
    },
    marginBottom: theme.space[4],
    ':last-child': {
      margin: 0,
    },
  },
};

export default function FormGroup({ groupLabel, children }) {
  return (
    <Box sx={style.formGroup}>
      {groupLabel && <h4>{groupLabel}</h4>}
      <Box>{children}</Box>
    </Box>
  );
}

FormGroup.defaultProps = {
  groupLabel: '',
};
FormGroup.prototype.propTypes = {
  groupLabel: PropTypes.string,
  children: PropTypes.node.isRequired,
};
