import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Flex } from '@chakra-ui/react';
import Modal from 'src/components/Modal';
import { unknownObjectValidator } from 'src/helpers';
import theme from 'src/style';
import Rating from 'src/components/Rating';
import config from 'src/config';
import DataContent from 'src/components/DataContent';
import MultiItem, { MultiInput } from 'src/components/MultiItem';
import { buttonPropType } from 'src/constants';

const style = {
  review: {
    padding: '15px 20px',
    background: theme.colors.gray[50],
    borderRadius: theme.radii.md,
    marginBottom: '5px',
    fontWeight: theme.fontWeights.light,
    border: `1px solid ${theme.colors.blackAlpha[50]}`,
  },
  reviewText: {
    marginBottom: '20px',
  },
  infoDropdown: {
    fontSize: '0.9rem',
  },
};

export function getProfessionalLabel({ businessId, fullName }) {
  return `${fullName}${businessId ? ` - ${businessId}` : ''}`;
}

function getSmile(rating) {
  const maxRatingHalf = Math.round(config.maxRating / 2);
  if (rating < maxRatingHalf) {
    return ':-(';
  }
  if (rating > maxRatingHalf) {
    return ':-)';
  }
  return ':-|';
}

export function Reviews({ reviews }) {
  return (
    <Flex direction="column">
      {reviews.map(({ text, id, rating }) => (
        <Box key={id} sx={style.review}>
          <Box sx={style.reviewText}>{text || getSmile(rating)}</Box>
          <Rating rating={rating} size="0.8rem" position="right" margin="0" />
        </Box>
      ))}
    </Flex>
  );
}

Reviews.prototype.propTypes = {
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      text: PropTypes.string,
      rating: PropTypes.number,
    }),
  ).isRequired,
};

// don't want to show reviews and rating when adding new review,
// user should not be affected by others
export default function ProfessionalInfo({
  data,
  compact,
  showRating,
  showReviews,
}) {
  const dataMapped = useMemo(() => {
    const professions = (
      <MultiItem labels={data.professions.map(({ title }) => title)} />
    );
    if (compact) {
      return [
        {
          headline: getProfessionalLabel(data),
          content: data.location,
        },
        {
          content: professions,
        },
      ];
    }

    let res = [
      {
        headline: 'Name / Business',
        content: getProfessionalLabel(data),
      },
      {
        headline: 'Location',
        content: data.location,
      },
      { headline: 'Professions', content: professions },
    ];

    if (showRating) {
      res = [
        ...res,
        {
          headline: 'Rating',
          content: (
            <Rating
              rating={data.rating}
              reviewsCount={data.reviewsCount}
              margin="0"
            />
          ),
        },
      ];
    }

    if (data.reviews && showReviews) {
      res = [
        ...res,
        {
          headline: 'Reviews',
          content: <Reviews reviews={data.reviews} />,
        },
      ];
    }

    return res;
  }, [data]);

  return <DataContent data={dataMapped} compact={compact} />;
}

ProfessionalInfo.defaultProps = {
  compact: false,
  showReviews: false,
  showRating: false,
};
ProfessionalInfo.prototype.propTypes = {
  data: unknownObjectValidator.isRequired,
  compact: PropTypes.bool,
  showReviews: PropTypes.bool,
  showRating: PropTypes.bool,
};

export function ProfessionalInfoDropdown(data) {
  return <ProfessionalInfo data={data} compact />;
}
