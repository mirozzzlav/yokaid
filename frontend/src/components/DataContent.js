import { Box, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';
import theme from 'src/style';
import { getMergedStyle } from 'src/helpers';

const style = {
  record: (compact) =>
    getMergedStyle(
      {
        marginBottom: theme.space[5],
        ':last-child': {
          marginBottom: 0,
        },
        lineHeight: '1.1rem',
        '> *': {
          width: '100%',
        },
        '> h4': {
          fontWeight: theme.fontWeights.medium,
          marginBottom: theme.space[1],
        },
      },
      compact && {
        marginBottom: theme.space[2],
        '> *': {
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        },
      },
    ),
};

export default function DataContent({ data, compact }) {
  return (
    <Flex direction="column">
      {data.map(({ headline, content }) => (
        <Box sx={style.record(compact)} key={`${headline}`}>
          {headline && <h4>{headline}</h4>}
          <Box>{content}</Box>
        </Box>
      ))}
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
  compact: PropTypes.bool,
};

DataContent.defaultProps = {
  compact: false,
};
