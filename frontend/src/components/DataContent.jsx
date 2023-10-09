import { Box, Flex, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';
import theme from 'src/style';

const style = {
  record: (compact) => ({
    marginBottom: theme.space[3],
    lineHeight: '1',
    '> h4': {
      marginBottom: theme.space[1],
      fontWeight: theme.fontWeights.medium,
    },
    '> *': {
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      width: '100%',
    },
    ...(compact && {
      marginBottom: theme.space[1],
      fontSize: '0.9rem',
      lineHeight: '1.1rem',
      '> h4': {
        marginBottom: 0,
        fontWeight: theme.fontWeights.bold,
      },
    }),
  }),
};

export default function DataContent({ data, footer, compact }) {
  return (
    <Flex direction="column">
      {data.map(({ headline, content }) => (
        <Box sx={style.record(compact)} key={`${headline}`}>
          {headline && <h4>{headline}</h4>}
          <Box>{content}</Box>
        </Box>
      ))}
      {footer}
    </Flex>
  );
}
DataContent.prototype.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      headline: PropTypes.string,
      content: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    }),
  ).isRequired,
  footer: PropTypes.oneOfType([PropTypes.node, PropTypes.oneOf([null])]),
  compact: PropTypes.bool,
};

DataContent.defaultProps = {
  footer: null,
  compact: false,
};
