import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Image } from '@chakra-ui/react';
import { getHexSHA256, unknownObjectValidator } from 'src/helpers';
import theme from 'src/style';
import Rating from 'src/components/Rating';
import config from 'src/config';
import DataContent from 'src/components/DataContent';
import MultiItem from 'src/components/MultiItem';
import ProfessionalContact from 'src/components/ProfessionalContact';
import { GalleryContext } from 'src/providers';

const style = {
  review: {
    padding: `${theme.space[4]} ${theme.space[4]} ${theme.space[6]} ${theme.space[4]}`,
    marginBottom: theme.space[2],
    background: theme.colors.gray[50],
    borderRadius: theme.radii.md,
    fontWeight: theme.fontWeights.light,
    border: `1px solid ${theme.colors.blackAlpha[50]}`,
  },
  reviewContent: (isShown, contentTooBig) => ({
    maxHeight: !isShown ? '250px' : '10000px',
    overflowY: 'hidden',
    position: 'relative',
    ':after': {
      display: !isShown && contentTooBig ? 'block' : 'none',
      content: '" "',
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: '20px',
      background: `linear-gradient(transparent 0%, ${theme.colors.gray[50]} 100%)`,
    },
  }),
  reviewText: {
    margin: `${theme.space[4]} 0 0 0`,
  },
  infoDropdown: {
    fontSize: '0.9rem',
  },
  galleryWrapper: {
    margin: `${theme.space[6]} 0 0 0`,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridGap: theme.space[4],
  },
  img: {
    cursor: 'pointer',
    height: '60px',
    maxWidth: '60px',
    width: '100%',
    flexGrow: 0,
    objectFit: 'cover',
  },
  showMoreBtn: {
    margin: `${theme.space[4]} 0 0 0`,
    fontWeight: theme.fontWeights.bold,
    fontSize: '0.8rem',
    color: theme.colors.orange[500],
    ':focus': {
      boxShadow: 'none',
    },
  },
};

function getProfessionalLabel({ businessId, fullName }) {
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

export function Review({ review: { id, text, rating, images } }) {
  const reviewRef = useRef();
  const [contentTooBig, setContentTooBig] = useState(false);
  const [reviewFullyShown, setReviewFullyShown] = useState(false);

  const { showImage, initGallery } = useContext(GalleryContext);

  useEffect(() => {
    setContentTooBig(
      reviewRef.current.scrollHeight - 10 > reviewRef.current.offsetHeight,
    );
  }, []);

  const imagesHash = useMemo(
    () => (images ? getHexSHA256(images.join('')) : ''),
    [images],
  );

  useEffect(() => {
    if (images) {
      initGallery(images);
    }
  }, [imagesHash]);

  return (
    <Box key={id} sx={style.review}>
      <Box
        sx={style.reviewContent(reviewFullyShown, contentTooBig)}
        ref={reviewRef}
      >
        <Rating rating={rating} size="0.8rem" position="left" margin="0" />
        <Box sx={style.reviewText}>{text || getSmile(rating)}</Box>
        {images && (
          <Box sx={style.galleryWrapper}>
            {images.map((src, index) => {
              const k = `${src}-${index}`;
              return (
                <Image
                  key={k}
                  src={src}
                  sx={style.img}
                  onClick={() => showImage(index)}
                />
              );
            })}
          </Box>
        )}
      </Box>
      {contentTooBig && (
        <Button
          variant="link"
          sx={style.showMoreBtn}
          onClick={() => setReviewFullyShown((prev) => !prev)}
        >
          {!reviewFullyShown ? 'Show more' : 'Show less'}
        </Button>
      )}
    </Box>
  );
}

Review.prototype.propTypes = {
  review: PropTypes.shape({
    id: PropTypes.number,
    text: PropTypes.string,
    rating: PropTypes.number,
    images: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

// don't want to show reviews and rating when adding new review,
// user should not be affected by others
export default function ProfessionalInfo({
  data,
  compact,
  showRating,
  showReviews,
  showContact,
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
          content: (
            <>
              {data.reviews.map((review) => (
                <Review review={review} key={review.id} />
              ))}
            </>
          ),
        },
      ];
    }
    if (showContact) {
      res = [
        ...res,
        {
          headline: 'Professional contact',
          content: (
            <ProfessionalContact
              contact={data.contact}
              professionalId={data.id}
              onContactPaid={() => {}}
            />
          ),
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
  showContact: false,
};
ProfessionalInfo.prototype.propTypes = {
  data: unknownObjectValidator.isRequired,
  compact: PropTypes.bool,
  showReviews: PropTypes.bool,
  showRating: PropTypes.bool,
  showContact: PropTypes.bool,
};

export function ProfessionalInfoDropdown(data) {
  return <ProfessionalInfo data={data} compact />;
}
