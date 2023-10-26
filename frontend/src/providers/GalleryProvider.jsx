import theme from 'src/style';
import { Box, Button, IconButton, Image } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from '@chakra-ui/icons';

const galleryStyle = {
  galleryWrapper: {
    width: '100vw',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    background: theme.colors.whiteAlpha[900],
    zIndex: 9999,
  },
  close: {
    position: 'absolute',
    right: theme.space[1],
    top: theme.space[1],
    width: '3rem',
    height: '3rem',
    background: 'none',
    fontSize: '1.4rem',
  },
  arrow: (direction) => ({
    ...(direction === 'left'
      ? { left: 0, justifyContent: 'flex-start' }
      : { right: 0, justifyContent: 'flex-end' }),
    fontSize: '3rem',
    background: 'none',
    height: '100%',
    width: '50%',
    position: 'absolute',
    top: 0,
    ':focus': {
      boxShadow: 'none',
    },
    ':hover': {
      background: 'none',
    },
  }),
  sliderWrapper: {
    width: '100%',
    height: '100%',
    overflowX: 'auto',
    '::-webkit-scrollbar-thumb': {
      backgroundColor: 'transparent',
    },
    // scrollSnapType: 'x mandatory',
    scrollBehavior: 'smooth',
    scrollbarWidth: 'none',
    // pointerEvents: 'none',
  },
  slider: (imagesCount) => ({
    top: 0,
    height: '100%',
    width: `${imagesCount * 100}vw`,
  }),

  img: {
    // scrollSnapAlign: 'start',
    padding: theme.space[4],
    objectFit: 'contain',
    height: '100vh',
    width: '100vw',
    float: 'left',
  },
};
export const GalleryContext = React.createContext({});

function Gallery() {
  const sliderWrapperRef = useRef();
  const { selectedImage, prevImage, nextImage, images, closeGallery } =
    useContext(GalleryContext);

  useEffect(() => {
    sliderWrapperRef.current.scrollLeft = selectedImage * window.innerWidth;
  }, [selectedImage]);

  if (!images) {
    return null;
  }

  return (
    <Box sx={galleryStyle.galleryWrapper}>
      {images?.length > 1 && (
        <IconButton
          sx={galleryStyle.arrow('left')}
          onClick={prevImage}
          icon={<ChevronLeftIcon />}
        />
      )}
      {images?.length > 1 && (
        <IconButton
          sx={galleryStyle.arrow('right')}
          onClick={nextImage}
          icon={<ChevronRightIcon />}
        />
      )}
      <IconButton
        icon={<CloseIcon />}
        sx={galleryStyle.close}
        onClick={closeGallery}
      />
      <Box sx={galleryStyle.sliderWrapper} ref={sliderWrapperRef}>
        <Box sx={galleryStyle.slider(images.length)}>
          {images.map((src, index) => {
            const k = `${src}${index}`;
            return <Image src={src} key={k} sx={galleryStyle.img} />;
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default function GalleryProvider({ children }) {
  const [images, setImages] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isShown, setIsShown] = useState(false);

  const showImage = useCallback(
    (imageNumber) => {
      if (!images || imageNumber < 0 || imageNumber > images.length - 1) {
        return;
      }
      setIsShown(true);
      setSelectedImage(imageNumber);
    },
    [images],
  );

  useEffect(() => {
    const resetGala = () => setSelectedImage(0);
    window.addEventListener('resize', resetGala);
    return () => window.removeEventListener('resize', resetGala);
  }, []);

  const contextVal = useMemo(
    () => ({
      selectedImage,
      images,
      initGallery: setImages,
      showImage,
      closeGallery: () => setIsShown(false),
      nextImage: () => showImage(selectedImage + 1),
      prevImage: () => showImage(selectedImage - 1),
    }),
    [images, selectedImage],
  );

  return (
    <GalleryContext.Provider value={contextVal}>
      {children}
      {isShown && images && <Gallery />}
    </GalleryContext.Provider>
  );
}

GalleryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
