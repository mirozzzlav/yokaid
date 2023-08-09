import React from 'react';
import { css, cx } from '@emotion/css';
import PropTypes from 'prop-types';
import { theme } from 'src/style';
import { unknownObjectValidator, toLocalDate } from 'src/helpers';

const style = {
  wrapper: {
    width: '100%',
    fontSize: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  boxContent: {
    background: 'rgba(0, 0, 0, 0.01)',
    borderRadius: theme.radii.md,
    border: '1px solid rgba(0,0,0,0.1)',
    margin: '3px -10px 3px -10px',
    padding: '10px',
  },
  slider: {
    marginBottom: '10px',
  },
  hl: {
    marginBottom: '10px',
    fontSize: '1.2rem',
    textAlign: 'center',
    fontWeight: theme.fontWeights.light,
  },
  subhl: {
    marginBottom: '5px',
  },
  dataRow: {
    marginBottom: '0.1rem',
    display: 'flex',
    '> :first-child': {
      flexBasis: '40px',
      marginRight: '5px',
    },
    '> :last-child': {
      fontWeight: theme.fontWeights.light,
    },
  },
  textWrapper: {
    overflow: 'hidden',
    padding: 0,
  },
  text: {
    minHeight: '80px',
    maxHeight: '150px',
    fontWeight: theme.fontWeights.light,
    overflowY: 'auto',
    padding: '10px',
    scrollbarWidth: 'thin',
    scrollbarColor: `${theme.colors.black} ${theme.colors.blackAlpha['50']}`,
  },
};

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

function RentalPost({ item, rent }) {
  return (
    <div className={css(style.boxContent)}>
      <h6 className={css(style.subhl)}>{item.name}</h6>
      <div className={css(style.dataRow)}>
        <div>From</div>
        <div>{toLocalDate(rent.dateFrom)}</div>
      </div>
      {rent.dateTo && (
        <div className={css(style.dataRow)}>
          <div>To</div>
          <div>{toLocalDate(rent.dateTo)}</div>
        </div>
      )}
      <div className={css(style.dataRow)}>
        <span>Price</span>
        <span>{rent.price}</span>
      </div>
    </div>
  );
}

RentalPost.prototype.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,

  rent: PropTypes.shape({
    dateFrom: PropTypes.string,
    dateTo: PropTypes.string,
    price: PropTypes.number,
  }).isRequired,
};

export default function MapPost({ id, headline, text, images, item, rent }) {
  // this is rendered as static html on map, React tricks do no work here
  return (
    <div className={css(style.wrapper)}>
      <h4 className={css(style.hl)}>{headline}</h4>
      {images.length > 0 && <ImageSlider images={images} id={id} />}
      <div className={cx(css(style.boxContent), css(style.textWrapper))}>
        <div className={css(style.text)}>{text}</div>
      </div>
      {item && <RentalPost item={item} rent={rent} />}
    </div>
  );
}

MapPost.defaultProps = {
  item: null,
  rent: null,
};

MapPost.prototype.propTypes = {
  id: PropTypes.number.isRequired,
  headline: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  item: PropTypes.oneOfType([
    PropTypes.shape({
      name: PropTypes.string,
    }),
    PropTypes.oneOf([null]),
  ]),
  rent: PropTypes.oneOfType([
    PropTypes.shape({
      dateFrom: PropTypes.string,
      dateTo: PropTypes.string,
      price: PropTypes.number,
    }),
    PropTypes.oneOf([null]),
  ]),
};
