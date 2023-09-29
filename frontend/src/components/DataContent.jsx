import { Box, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';
import theme from 'src/style';

const style = {
  record: {
    marginBottom: theme.space[2],
    '> h4': {
      fontWeight: theme.fontWeights.medium,
    },
  },
};

export default function DataContent({ data, footer }) {
  return (
    <Flex direction="column">
      {data.map(({ headline, content }) => (
        <Box sx={style.record} key={`${headline}`}>
          <h4>{headline}</h4>
          {content}
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
};

DataContent.defaultProps = {
  footer: null,
};
