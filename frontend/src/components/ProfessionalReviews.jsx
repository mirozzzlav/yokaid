import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import Modal from 'src/components/Modal';
import { unknownObjectValidator } from 'src/helpers';
import { theme } from 'src/style';
import config from 'src/config';

const style = {
  reviewsWrapper: {
    marginBottom: '1rem',
  },
  record: {
    marginBottom: '1rem',
    '> h4': {
      fontWeight: theme.fontWeights.bold,
    },
  },
  review: {
    padding: '20px',
    background: theme.colors.gray[50],
    borderRadius: theme.radii.md,
    marginBottom: '5px',
    fontWeight: theme.fontWeights.thin,
  },
};

function Rating({ rating, size, margin }) {
  return (
    <Flex sx={{ fontSize: size, margin }}>
      {Array.from({ length: config.maxRating }, (_, i) => i + 1).map((n) =>
        n <= rating ? (
          <StarIcon key={n} sx={{ color: theme.colors.yellow[300] }} />
        ) : (
          <StarIcon key={n} sx={{ color: theme.colors.blackAlpha[200] }} />
        ),
      )}
    </Flex>
  );
}

Rating.defaultProps = {
  size: '1rem',
  margin: '0',
};
Rating.prototype.propTypes = {
  rating: PropTypes.number.isRequired,
  size: PropTypes.string,
  margin: PropTypes.string,
};

export default function ProfessionalReviews({ data, isShown, setIsShown }) {
  return (
    <Modal isShown={isShown} setIsShown={setIsShown} title="Professional info">
      {data && (
        <Flex direction="column">
          <Box sx={style.record}>
            <h4>
              {data.fullName}
              {data.businessId ? ` - ${data.businessId}` : ''}
            </h4>
            <Rating rating={data.rating} />
          </Box>
          <Box sx={style.record}>
            <h4>Services</h4>
            <div>{data.services.map(({ title }) => title).join(', ')}</div>
          </Box>
          <Box sx={style.record}>
            <h4>Location</h4>
            <div>{data.location}</div>
          </Box>
          <Flex sx={style.reviewsWrapper} direction="column">
            {data.reviews.map(({ text, id, rating }) => (
              <Box key={id} sx={style.review}>
                <div>{text}</div>
                <Rating rating={rating} size="0.8rem" margin="5px 0 0 0" />
              </Box>
            ))}
          </Flex>
        </Flex>
      )}
    </Modal>
  );
}

ProfessionalReviews.prototype.propTypes = {
  data: unknownObjectValidator.isRequired,
  isShown: PropTypes.bool.isRequired,
  setIsShown: PropTypes.func.isRequired,
};
