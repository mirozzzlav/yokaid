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

export default function ProfessionalInfo({
  data,
  showRating,
  showReviews,
  compact,
}) {
  const dataMapped = useMemo(() => {
    const professions = (
      <MultiItem labels={data.professions.map(({ title }) => title)} />
    );
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
    if (compact) {
      res = [
        {
          headline: getProfessionalLabel(data),
          content: data.location,
        },
        {
          content: professions,
        },
      ];
    }

    if (data.rating && showRating) {
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
    return res;
  }, [data]);

  return (
    <DataContent
      data={dataMapped}
      compact={compact}
      footer={
        data.reviews && showReviews ? (
          <Flex direction="column">
            {data.reviews.map(({ text, id, rating }) => (
              <Box key={id} sx={style.review}>
                <Box sx={style.reviewText}>{text || getSmile(rating)}</Box>
                <Rating
                  rating={rating}
                  size="0.8rem"
                  position="right"
                  margin="0"
                />
              </Box>
            ))}
          </Flex>
        ) : null
      }
    />
  );
}

ProfessionalInfo.defaultProps = {
  showRating: false,
  showReviews: false,
  compact: false,
};
ProfessionalInfo.prototype.propTypes = {
  data: unknownObjectValidator.isRequired,
  showRating: PropTypes.bool,
  showReviews: PropTypes.bool,
  compact: PropTypes.bool,
};

export function ProfessionalInfoModal({ isShown, close, data }) {
  if (!data) {
    return null;
  }
  return (
    <Modal isShown={isShown} close={close} title="Professional info">
      <ProfessionalInfo data={data} showRating showReviews />
    </Modal>
  );
}

ProfessionalInfoModal.prototype.propTypes = {
  data: unknownObjectValidator.isRequired,
  isShown: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

export function ProfessionalInfoDropdown(data) {
  return (
    <ProfessionalInfo
      data={data}
      showRating={false}
      showReviews={false}
      compact
    />
  );
}
