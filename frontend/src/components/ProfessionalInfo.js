import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Image } from '@chakra-ui/react';
import { getHexSHA256, unknownObjectValidator } from 'src/helpers';
import theme from 'src/style';
import Rating from 'src/components/Rating';
import DataContent from 'src/components/DataContent';
import MultiItem from 'src/components/MultiItem';
import ProfessionalContact from 'src/components/ProfessionalContact';
import { GalleryContext, TranslationsContext } from 'src/providers';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import config from 'src/config';

const style = {
  review: {
    padding: `${theme.space[6]} ${theme.space[4]} ${theme.space[8]} ${theme.space[4]}`,
    margin: `${theme.space[3]} 0`,
    background: theme.colors.gray[100],
    borderRadius: theme.radii.md,
    fontWeight: theme.fontWeights.light,
    borderTop: `1px solid ${theme.colors.gray[200]}`,
    ':last-child': {
      marginBottom: 0,
    },
  },
  reviewContent: (isShown, contentTooBig) => ({
    maxHeight: !isShown ? '150px' : '10000px',
    overflowY: 'hidden',
    position: 'relative',
    ':after': {
      display: !isShown && contentTooBig ? 'block' : 'none',
      content: '" "',
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: '15px',
      background: `linear-gradient(transparent 0%, ${theme.colors.gray[100]} 100%)`,
    },
  }),
  reviewText: {},
  infoDropdown: {
    fontSize: '0.9rem',
  },
  galleryWrapper: {
    margin: `0 0 ${theme.space[4]} 0`,
    padding: `${theme.space[4]} ${theme.space[4]}`,
    background: theme.colors.whiteAlpha[500],
    borderRadius: theme.radii.md,
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
    color: theme.colors.blackAlpha[700],
    span: {
      marginLeft: 0,
    },
    svg: {
      marginTop: '1px',
      fontSize: '1.2rem',
    },
    ':focus': {
      boxShadow: 'none',
    },
    ':hover': {
      textDecoration: 'none',
      color: theme.colors.blackAlpha[900],
    },
  },
};

function getProfessionalLabel({ businessId, fullName }) {
  return `${fullName}${businessId ? ` - ${businessId}` : ''}`;
}

export function Review({ review: { id, text, images } }) {
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
      {images && (
        <Box sx={style.galleryWrapper}>
          {images.map((src, index) => {
            const k = `${src}-${index}`;
            return (
              <Image
                key={k}
                src={config.api.url + src}
                sx={style.img}
                onClick={() => showImage(index)}
              />
            );
          })}
        </Box>
      )}
      <Box
        sx={style.reviewContent(reviewFullyShown, contentTooBig)}
        ref={reviewRef}
      >
        <Box sx={style.reviewText}>{text}</Box>
      </Box>
      {contentTooBig && (
        <Button
          variant="link"
          sx={style.showMoreBtn}
          rightIcon={
            !reviewFullyShown ? <ChevronDownIcon /> : <ChevronUpIcon />
          }
          onClick={() => setReviewFullyShown((prev) => !prev)}
        >
          {!reviewFullyShown ? 'show more' : 'show less'}
        </Button>
      )}
    </Box>
  );
}

Review.prototype.propTypes = {
  review: PropTypes.shape({
    id: PropTypes.number,
    text: PropTypes.string,
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
  const reviews = useMemo(
    () =>
      showReviews && data.reviews
        ? data.reviews.filter(({ text }) => text)
        : [],
    [data, showReviews],
  );
  const { T } = useContext(TranslationsContext);

  const dataMapped = useMemo(() => {
    if (compact) {
      return [
        {
          headline: getProfessionalLabel(data),
          content: data.location,
        },
        {
          content: (
            <MultiItem labels={data.professions.map(({ title }) => title)} />
          ),
        },
      ];
    }

    let res = [
      {
        headline: T('name_business'),
        content: getProfessionalLabel(data),
      },
      {
        headline: T('location'),
        content: data.location,
      },
      {
        headline: T('profession', [], 2),
        content: (
          <MultiItem
            labels={data.professions.map(({ title }) => title)}
            margin={`${theme.space[1]} 0`}
          />
        ),
      },
    ];

    if (showRating) {
      res = [
        ...res,
        {
          headline: T('rating'),
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
    if (showContact) {
      res = [
        ...res,
        {
          headline: T('professional contact'),
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

    if (reviews?.length > 0 && showReviews) {
      res = [
        ...res,
        {
          headline: T('review', [], 2),
          content: (
            <>
              {data.reviews
                .filter(({ text }) => text)
                .map((review) => (
                  <Review review={review} key={review.id} />
                ))}
            </>
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

export function ProfessionalInfoDropdown({ data }) {
  return <ProfessionalInfo data={data} compact />;
}
ProfessionalInfo.prototype.propTypes = {
  data: unknownObjectValidator.isRequired,
};
