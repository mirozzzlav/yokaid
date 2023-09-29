import React from 'react';
import { css } from '@emotion/css';
import PropTypes from 'prop-types';
import theme from 'src/style';
import { unknownObjectValidator } from 'src/helpers';

const sliderStyle = {
  wrapper: {
    height: '150px',
    display: 'flex',
    flexDirection: 'column',
  },
  sliderWrapper: {
    position: 'relative',
    overflow: 'hidden',
    flexGrow: 1,
  },
  slider: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    height: '100%',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  buttons: {
    display: 'flex',
    padding: '10px 0',
    justifyContent: 'center',
    button: {
      '&[data-active="1"]': {
        opacity: 1,
        background: theme.colors.blackAlpha['600'],
      },
      background: theme.colors.blackAlpha['200'],
      width: '12px',
      height: '12px',
      margin: '0px 3px',
      borderRadius: theme.radii.sm,
    },
  },
};

function ImageSlider({ id, wrapperStyle, images, maxImages }) {
  const imagesSliced = images.slice(0, maxImages);
  const onClick = (e) => {
    if (!e.target.dataset.sliderid) {
      return;
    }
    const clickedId = e.target.dataset.sliderid;
    const slider = document.querySelector(`#slider-${clickedId}`);
    const buttons = document.querySelectorAll(`#buttons-${clickedId} > button`);
    if (!slider.style.left) {
      slider.style.left = 0;
    }

    let position = parseInt(slider.style.left || 0, 10);
    buttons.forEach((b) => {
      b.dataset.active = '0';
    });
    if (e.target.dataset.imagenumber) {
      position = -100 * (e.target.dataset.imagenumber - 1);
      e.target.dataset.active = '1';
    }

    slider.style.left = `${position}%`;
  };

  if (!ImageSlider.onClickAttached) {
    document.onclick = onClick;
  }

  ImageSlider.onClickAttached = true;

  return (
    <div className={css({ ...sliderStyle.wrapper, ...wrapperStyle })}>
      <div className={css(sliderStyle.sliderWrapper)}>
        <div
          id={`slider-${id}`}
          className={css({
            ...sliderStyle.slider,
            width: `${imagesSliced.length * 100}%`,
          })}
        >
          {imagesSliced.map((imgSrc) => (
            <img
              key={`${imgSrc}`}
              alt={`${imgSrc}`}
              className={css(sliderStyle.img)}
              src={`${imgSrc}`}
            />
          ))}
        </div>
      </div>
      <div className={css(sliderStyle.buttons)} id={`buttons-${id}`}>
        {imagesSliced.map((imgSrc, index) => (
          <button
            key={imgSrc}
            type="button"
            data-imagenumber={index + 1}
            data-sliderid={id}
            data-active={index === 0 ? '1' : '0'}
          />
        ))}
      </div>
    </div>
  );
}
ImageSlider.onClickAttached = false;

ImageSlider.defaultProps = {
  wrapperStyle: null,
  maxImages: 8,
};
ImageSlider.prototype.propTypes = {
  id: PropTypes.number.isRequired,
  wrapperStyle: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  maxImages: PropTypes.number,
};
