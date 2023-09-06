import React, { useMemo } from 'react';
import { Flex, IconButton } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import { theme } from 'src/style';
import config from 'src/config';

function RatingStar({ onClick, active }) {
  if (onClick) {
    return (
      <IconButton
        variant="link"
        onClick={onClick}
        sx={{ minWidth: 0 }}
        icon={
          <StarIcon
            sx={{
              color: active
                ? theme.colors.yellow[300]
                : theme.colors.blackAlpha[200],
            }}
          />
        }
      />
    );
  }
  return (
    <StarIcon
      sx={{
        color: active ? theme.colors.yellow[300] : theme.colors.blackAlpha[200],
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

export default function Rating({
  rating,
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
    <Flex
      sx={{
        fontSize: sizeStr,
        margin,
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
  );
}

Rating.defaultProps = {
  rating: Math.round(config.maxRating / 2),
  onStarClick: null,
  size: '1rem',
  margin: '5px 0',
  position: 'left',
};
Rating.prototype.propTypes = {
  rating: PropTypes.number,
  onStarClick: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
  size: PropTypes.string,
  margin: PropTypes.string,
  position: PropTypes.string,
};
