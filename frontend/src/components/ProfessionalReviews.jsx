import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex } from '@chakra-ui/react';
import Modal from 'src/components/Modal';
import { unknownObjectValidator } from 'src/helpers';
import { theme } from 'src/style';
import Rating from 'src/components/Rating';

const style = {
  record: {
    marginBottom: '1rem',
    '> h4': {
      fontWeight: theme.fontWeights.bold,
    },
  },
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
};

export function getProfessionalLabel({ businessId, fullName }) {
  return `${fullName}${businessId ? ` - ${businessId}` : ''}`;
}

export default function ProfessionalReviews({ data, isShown, setIsShown }) {
  return (
    <Modal isShown={isShown} setIsShown={setIsShown} title="Professional info">
      {data && (
        <Flex direction="column">
          <Box sx={style.record}>
            <h4>{getProfessionalLabel(data)}</h4>
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
          <Flex direction="column">
            {data.reviews.map(({ text, id, rating }) => (
              <Box key={id} sx={style.review}>
                <Box sx={style.reviewText}>{text}</Box>
                <Rating rating={rating} size="0.8rem" position="right" />
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
