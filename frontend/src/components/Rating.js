import React, { useMemo } from 'react';
import { Box, Flex, IconButton } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import theme from 'src/style';
import config from 'src/config';
import { getStringForCount } from 'src/helpers';

function RatingStar({ onClick, active }) {
  if (onClick) {
    return (
      <IconButton
        variant="link"
        onClick={onClick}
        sx={{ minWidth: 0 }}
        aria-label="Rating"
        icon={
          <StarIcon
            sx={{
              color: active ? theme.colors.orange[300] : theme.colors.gray[300],
            }}
          />
        }
      />
    );
  }
  return (
    <StarIcon
      sx={{
        color: active ? theme.colors.orange[300] : theme.colors.blackAlpha[300],
      }}
    />
  );
}

RatingStar.prototype.propTypes = {
  onClick: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
  active: PropTypes.bool.isRequired,
};

RatingStar.defaultProps = {
  onClick: null,
};

const style = {
  reviewsCount: {
    fontSize: '0.8rem',
    margin: '0.5rem 0 0 0',
  },
};

export default function Rating({
  rating,
  reviewsCount,
  onStarClick,
  size: sizeStr,
  margin,
  position,
}) {
  const gap = useMemo(() => {
    const [, size, unit] = sizeStr.match(/([0-9]+\.?[0-9]*)([a-z]*)/i);
    return `${parseFloat(size) / 4}${unit || 'px'}`;
  }, [sizeStr]);

  return (
    <Box sx={{ margin }}>
      <Flex
        sx={{
          fontSize: sizeStr,
          justifyContent: position === 'right' ? 'end' : 'left',
        }}
        gap={gap}
      >
        {Array.from({ length: config.maxRating }, (_, i) => i + 1).map((n) => (
          <RatingStar
            key={n}
            onClick={onStarClick ? () => onStarClick(n) : null}
            active={n <= rating}
          />
        ))}
      </Flex>
      {reviewsCount ? (
        <Box sx={style.reviewsCount}>
          {getStringForCount(reviewsCount, ['reviews', 'review', 'reviews'])}
        </Box>
      ) : null}
    </Box>
  );
}

Rating.defaultProps = {
  rating: Math.round(config.maxRating / 2),
  reviewsCount: null,
  onStarClick: null,
  size: '1rem',
  margin: '5px 0',
  position: 'left',
};
Rating.prototype.propTypes = {
  rating: PropTypes.number,
  reviewsCount: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf([null]),
  ]),
  onStarClick: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
  size: PropTypes.string,
  margin: PropTypes.string,
  position: PropTypes.string,
};
